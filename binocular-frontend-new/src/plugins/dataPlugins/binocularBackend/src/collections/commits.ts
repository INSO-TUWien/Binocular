import { GraphQL, traversePages } from '../utils';
import { gql } from '@apollo/client';
import type {
  CommitWithFileChanges,
  DataPluginCommit,
  DataPluginCommitBuild,
  DataPluginCommits,
  DataPluginFileOwnership,
  DataPluginCommitShort,
} from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';

export default class Commits implements DataPluginCommits {
  private graphQl;

  constructor(endpoint: string) {
    this.graphQl = new GraphQL(endpoint);
  }

  public async getAllShort() {
    console.log('Getting all commits short');
    const commitList: DataPluginCommitShort[] = [];
    const getCommitsPage = () => async (page: number, perPage: number) => {
      const resp = await this.graphQl.client.query({
        query: gql`
          query ($page: Int, $perPage: Int) {
            commits(page: $page, perPage: $perPage) {
              count
              page
              perPage
              data {
                sha
                date
                messageHeader
              }
            }
          }
        `,
        variables: { page, perPage },
      });
      return resp.data.commits;
    };

    await traversePages(getCommitsPage(), (commit: DataPluginCommitShort) => {
      commitList.push(commit);
    });

    return commitList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public async getAll(from: string, to: string, sort: string = 'ASC') {
    console.log(`Getting Commits from ${from} to ${to}`);
    const commitList: DataPluginCommit[] = [];
    try {
      const getCommitsPage = (since?: string, until?: string, sort?: string) => async (page: number, perPage: number) => {
        const resp = await this.graphQl.client.query({
          query: gql`
            query ($page: Int, $perPage: Int, $since: Timestamp, $until: Timestamp, $sort: Sort) {
              commits(page: $page, perPage: $perPage, since: $since, until: $until, sort: $sort) {
                count
                page
                perPage
                data {
                  sha
                  shortSha
                  message
                  messageHeader
                  user {
                    id
                    gitSignature
                  }
                  branch
                  parents
                  date
                  webUrl
                  stats {
                    additions
                    deletions
                  }
                  files {
                    data {
                      file {
                        path
                        webUrl
                      }
                      stats {
                        additions
                        deletions
                      }
                    }
                  }
                }
              }
            }
          `,
          variables: { page, perPage, since, until, sort },
        });
        return resp.data.commits;
      };

      await traversePages(getCommitsPage(from, to, sort), (commit: DataPluginCommit) => {
        commitList.push(commit);
      });
      return commitList;
    } catch (e) {
      console.log(e);
      return commitList;
    }
  }

  public async getOwnershipDataForCommits() {
    return await this.graphQl.client
      .query({
        query: gql`
          query {
            commits {
              data {
                sha
                date
                parents
                files {
                  data {
                    file {
                      path
                      webUrl
                    }
                    action
                    ownership {
                      user
                      hunks {
                        originalCommit
                        lines {
                          from
                          to
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `,
      })
      .then((res) => res.data.commits)
      .then((commits) =>
        commits.data.map(
          (c: {
            sha: string;
            date: string;
            parents: string[];
            files: {
              data: {
                action: string;
                file: { path: string };
                ownership: DataPluginFileOwnership;
              }[];
            };
          }) => {
            return {
              sha: c.sha,
              date: c.date,
              parents: c.parents,
              files: c.files.data.map((fileData) => {
                return {
                  path: fileData.file.path,
                  action: fileData.action,
                  ownership: fileData.ownership,
                };
              }),
            };
          },
        ),
      );
  }

  public async getCommitDataForSha(sha: string) {
    return this.getAll(new Date(0).toISOString(), new Date().toISOString()).then((commits) => commits.filter((c) => c.sha === sha)[0]);
  }

  public async getByFile(file: string) {
    console.log(`Getting Commits for file ${file}`);
    const commitList: DataPluginCommit[] = [];
    const getCommitsPage = (file?: string) => async (page: number, perPage: number) => {
      const resp = await this.graphQl.client.query({
        query: gql`
          query ($file: String!, $page: Int, $perPage: Int) {
            file(path: $file) {
              commits(page: $page, perPage: $perPage) {
                data {
                  commit {
                    sha
                    shortSha
                    message
                    messageHeader
                    user {
                      id
                      gitSignature
                    }
                    branch
                    parents
                    date
                    webUrl
                    stats {
                      additions
                      deletions
                    }
                    files(page: 1, perPage: 1000) {
                      data {
                        file {
                          path
                          webUrl
                        }
                        hunks {
                          newStart
                          newLines
                          oldStart
                          oldLines
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `,
        variables: { page, perPage, file },
      });
      return resp.data.file.commits;
    };

    await traversePages(getCommitsPage(file), (data: { commit: DataPluginCommit }) => {
      commitList.push(data.commit);
    });
    return commitList.sort((a, b) => new Date(b.date).getMilliseconds() - new Date(a.date).getMilliseconds());
  }

  public async getDateOfFirstCommit() {
    console.log(`Getting Date of First Commit`);
    const resp = await this.graphQl.client.query({
      query: gql`
        query {
          commits(page: 1, perPage: 1) {
            data {
              date
            }
          }
        }
      `,
    });
    return resp.data.commits.data[0].date;
  }

  public async getDateOfLastCommit() {
    console.log(`Getting Date of Last Commit`);
    const resp = await this.graphQl.client.query({
      query: gql`
        query {
          commits(page: 1, perPage: 1, sort: "desc") {
            data {
              date
            }
          }
        }
      `,
    });
    return resp.data.commits.data[0].date;
  }

  public async getCommitsWithBuilds(from: string, to: string): Promise<DataPluginCommitBuild[]> {
    console.log(`Getting Commits with Build data from ${from} to ${to}`);
    const commitBuildList: DataPluginCommitBuild[] = [];

    // Query that leverages the commits-builds connection in the database
    const getCommitsBuildsPage = (from?: string, to?: string) => async (page: number, perPage: number) => {
      const resp = await this.graphQl.client.query({
        query: gql`
          query ($since: Timestamp, $until: Timestamp, $page: Int, $perPage: Int) {
            commits(since: $since, until: $until, page: $page, perPage: $perPage) {
              count
              page
              perPage
              data {
                sha
                shortSha
                messageHeader
                message
                user {
                  id
                  gitSignature
                }
                branch
                date
                parents
                webUrl
                stats {
                  additions
                  deletions
                }
                files {
                  count
                  page
                  perPage
                  data {
                    file {
                      path
                      id
                      webUrl
                    }
                    action
                  }
                }
                builds {
                  id
                  status
                  duration
                  startedAt
                  finishedAt
                  jobs {
                    id
                    name
                    status
                    stage
                  }
                }
              }
            }
          }
        `,
        variables: {
          page,
          perPage,
          since: from ? new Date(from).getTime() : undefined,
          until: to ? new Date(to).getTime() : undefined,
        },
      });
      return resp.data.commits;
    };

    // Fetch data using the connection-based query
    await traversePages(getCommitsBuildsPage(from, to), (commitBuild: DataPluginCommitBuild) => {
      commitBuildList.push(commitBuild);
    });
    return commitBuildList;
  }

  /**
   * Returns commits with DataPluginFile[] that were changed in the given commit
   * @param from
   * @param to
   */
  public async getCommitsWithFiles(from: string, to: string) {
    const getCommitsFilesPage = (from?: string, to?: string) => async (page: number, perPage: number) => {
      const resp = await this.graphQl.client.query({
        query: gql`
          query GetCommitsWithFiles($since: Timestamp, $until: Timestamp, $page: Int, $perPage: Int) {
            commits(since: $since, until: $until, page: $page, perPage: $perPage) {
              count
              page
              perPage
              data {
                sha
                shortSha
                messageHeader
                message
                user {
                  id
                  gitSignature
                }
                branch
                date
                parents
                webUrl
                stats {
                  additions
                  deletions
                }
                files {
                  count
                  page
                  perPage
                  data {
                    file {
                      path
                      id
                      webUrl
                    }
                    action
                  }
                }
              }
            }
          }
        `,
        variables: {
          page,
          perPage,
          since: from ? new Date(from).getTime() : undefined,
          until: to ? new Date(to).getTime() : undefined,
        },
      });
      return resp.data.commits;
    };

    const commitFileList: DataPluginCommit[] = [];

    await traversePages(getCommitsFilesPage(from, to), (commit: DataPluginCommit) => {
      // Create a copy of the commit
      const tempCommitFile: DataPluginCommit = { ...commit };

      // Properly structure the files property according to the interface
      tempCommitFile.files = {
        data: commit.files?.data || [],
      };

      // Only add commits that have files
      if (tempCommitFile.files.data.length > 0) {
        commitFileList.push(tempCommitFile);
      }
    });

    // Sort by date to ensure consistent results
    return commitFileList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * Returns commits with their changed files (per-file stats, line count and the commit author's
   * signature) for the change-frequency visualization. `from`/`to` define the significant (visible)
   * window. The full history is loaded (not just that window) so the most recent commit per file
   * yields its current line count; commits outside [from, to] are flagged `isSignificant: false`
   * and contribute only to the line count, not the change metrics.
   */
  public async getCommitDataWithFilesAndOwnership(from: string, to: string): Promise<CommitWithFileChanges[]> {
    const significantSince = new Date(from).getTime();
    const significantUntil = new Date(to).getTime();
    const commitList: CommitWithFileChanges[] = [];

    const getCommitsPage = () => async (page: number, perPage: number) => {
      const resp = await this.graphQl.client.query({
        query: gql`
          query ($page: Int, $perPage: Int) {
            commits(page: $page, perPage: $perPage) {
              count
              page
              perPage
              data {
                sha
                branch
                message
                signature
                webUrl
                date
                parents
                stats {
                  additions
                  deletions
                }
                files {
                  data {
                    file {
                      path
                    }
                    lineCount
                    stats {
                      additions
                      deletions
                    }
                  }
                }
              }
            }
          }
        `,
        variables: { page, perPage },
      });
      return resp.data.commits;
    };

    await traversePages(getCommitsPage(), (commit: CommitWithFileChanges) => {
      const time = new Date(commit.date).getTime();
      commitList.push({ ...commit, isSignificant: time >= significantSince && time <= significantUntil });
    });

    return commitList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}

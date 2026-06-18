import type {
  CommitWithFileChanges,
  DataPluginCommit,
  DataPluginCommitBuild,
  DataPluginCommitShort,
  DataPluginCommits,
  DataPluginOwnership,
} from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';
import { findAllCommits, findAllCommitsWithBuilds, findCommit, findOwnershipData } from '../utils.js';
import Database from '../database.ts';

export default class Commits implements DataPluginCommits {
  private readonly database: Database | undefined;

  constructor(database: Database | undefined) {
    this.database = database;
  }

  public async getAll(from: string, to: string) {
    console.log(`Getting Commits from ${from} to ${to}`);
    // return all commits, filtering according to parameters can be added in the future
    const first = new Date(from).getTime();
    const last = new Date(to).getTime();
    if (this.database && this.database.documentStore && this.database.edgeStore) {
      return findAllCommits(this.database.documentStore, this.database.edgeStore).then((res: { docs: unknown[] }) => {
        res.docs = (res.docs as DataPluginCommit[])
          .filter((c) => new Date(c.date).getTime() >= first && new Date(c.date).getTime() <= last)
          .sort((a, b) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          });

        return res.docs as unknown as DataPluginCommit[];
      });
    } else {
      return new Promise<DataPluginCommit[]>((resolve) => {
        const commits: DataPluginCommit[] = [];
        resolve(commits);
      });
    }
  }

  public async getOwnershipDataForCommits(): Promise<DataPluginOwnership[]> {
    if (this.database && this.database.documentStore && this.database.edgeStore) {
      return findOwnershipData(this.database.documentStore, this.database.edgeStore).then((res: { docs: unknown[] }) => {
        res.docs = (res.docs as DataPluginOwnership[]).sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        return res.docs as DataPluginOwnership[];
      });
    } else {
      return new Promise<DataPluginOwnership[]>((resolve) => {
        const commits: DataPluginOwnership[] = [];
        resolve(commits);
      });
    }
  }

  public async getCommitDataForSha(sha: string): Promise<DataPluginCommit | undefined> {
    if (this.database && this.database.documentStore && this.database.edgeStore) {
      return findCommit(this.database.documentStore, this.database.edgeStore, sha).then((res: { docs: unknown[] }) => {
        return res.docs[0] as DataPluginCommit;
      });
    } else return Promise.resolve(undefined);
  }

  public async getByFile(file: string) {
    console.log(`Getting Commits for file ${file}`);
    if (this.database && this.database.documentStore && this.database.edgeStore) {
      return findAllCommits(this.database.documentStore, this.database.edgeStore).then((res: { docs: unknown[] }) => {
        // Filter commits that have changes to the specified file
        const commits = (res.docs as DataPluginCommit[])
          .filter((commit) => {
            // If the commit has files data, check if the specified file was modified
            return commit.files?.data.some((fileData: { file: { path: string } }) => fileData.file.path === file);
          })
          .sort((a, b) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          });

        return commits;
      });
    } else {
      return new Promise<DataPluginCommit[]>((resolve) => {
        resolve([]);
      });
    }
  }

  public async getDateOfFirstCommit() {
    console.log('Getting date of first commit');
    if (this.database && this.database.documentStore && this.database.edgeStore) {
      return findAllCommits(this.database.documentStore, this.database.edgeStore).then((res: { docs: unknown[] }) => {
        const firstCommit = (res.docs as DataPluginCommit[]).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
        return firstCommit?.date;
      });
    } else {
      return new Promise<string>((resolve) => {
        resolve('');
      });
    }
  }

  public async getDateOfLastCommit() {
    console.log('Getting date of last commit');
    if (this.database && this.database.documentStore && this.database.edgeStore) {
      return findAllCommits(this.database.documentStore, this.database.edgeStore).then((res: { docs: unknown[] }) => {
        const lastCommit = (res.docs as DataPluginCommit[]).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        return lastCommit?.date;
      });
    } else {
      return new Promise<string>((resolve) => {
        resolve('');
      });
    }
  }

  public async getCommitsWithFiles(from: string, to: string) {
    return this.getAll(from, to);
  }

  /**
   * Returns commits with their changed files (per-file stats and a `signature` field)
   * in the shape expected by the change-frequency visualization.
   */
  public async getCommitDataWithFilesAndOwnership(from: string, to: string): Promise<CommitWithFileChanges[]> {
    // from/to is the significant (visible) window. PouchDB exposes no per-commit line count, so only
    // that window is loaded and every returned commit is significant.
    const commits = await this.getAll(from, to);

    return commits.map((commit) => ({
      sha: commit.sha,
      date: commit.date,
      signature: commit.user?.gitSignature,
      branch: commit.branch,
      message: commit.message,
      webUrl: commit.webUrl,
      parents: commit.parents,
      stats: commit.stats,
      files: {
        data: (commit.files?.data ?? []).map((file) => ({
          file: { path: file.file.path },
          stats: file.stats ?? { additions: 0, deletions: 0 },
        })),
      },
      isSignificant: true,
    }));
  }

  public async getCommitsWithBuilds(from: string, to: string) {
    console.log(`Getting Commits with Builds from ${from} to ${to}`);
    // return all commits, filtering according to parameters can be added in the future
    const first = new Date(from).getTime();
    const last = new Date(to).getTime();
    if (this.database && this.database.documentStore && this.database.edgeStore) {
      return findAllCommitsWithBuilds(this.database.documentStore, this.database.edgeStore).then((res: { docs: unknown[] }) => {
        res.docs = (res.docs as DataPluginCommitBuild[])
          .filter((c) => new Date(c.date).getTime() >= first && new Date(c.date).getTime() <= last)
          .sort((a, b) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          });

        return res.docs as unknown as DataPluginCommitBuild[];
      });
    } else {
      return new Promise<DataPluginCommitBuild[]>((resolve) => {
        const commits: DataPluginCommitBuild[] = [];
        resolve(commits);
      });
    }
  }

  public async getAllShort(): Promise<DataPluginCommitShort[]> {
    // not yet implemented
    return Promise.resolve([]);
  }
}

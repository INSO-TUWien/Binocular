import Database from '../database.ts';
import {
  findAll,
  findAllCommits,
  findAllIssues,
  findIssueCommitConnections,
  findIssueMergeRequestConnections,
  findMergeRequestCommitConnections,
} from '../utils.ts';
import type {
  DataPluginIssue,
  DataPluginIssueCommitStats,
  DataPluginIssueMergeRequest,
  DataPluginIssues,
} from '../../../../interfaces/dataPluginInterfaces/dataPluginIssues.ts';
import type { DataPluginCommit } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';

export default class Issues implements DataPluginIssues {
  public database: Database | undefined;
  constructor(database: Database | undefined) {
    this.database = database;
  }

  public async getAll(from: string, to: string) {
    console.log(`Getting Issues from ${from} to ${to}`);
    const first = new Date(from).getTime();
    const last = new Date(to).getTime();
    if (this.database && this.database.documentStore) {
      const [
        { docs: commits },
        { docs: issuesCommits },
        { docs: issues },
        { docs: mergeRequests },
        { docs: issuesMergeRequests },
        { docs: mergeRequestsCommits },
      ] = await Promise.all([
        findAllCommits(this.database.documentStore, this.database.edgeStore),
        findIssueCommitConnections(this.database.edgeStore),
        findAllIssues(this.database.documentStore, this.database.edgeStore),
        findAll(this.database.documentStore, 'mergeRequests'),
        findIssueMergeRequestConnections(this.database.edgeStore),
        findMergeRequestCommitConnections(this.database.edgeStore),
      ]);

      const toCommitStats = (commit: DataPluginCommit): DataPluginIssueCommitStats => ({
        sha: commit.sha,
        date: commit.date,
        stats: commit.stats,
      });

      const issueWithCommits = new Map<string, DataPluginIssueCommitStats[]>();
      for (const { from: issueId, to: commitId } of issuesCommits as unknown as {
        /** issue */
        from: string;
        /** commit */
        to: string;
      }[]) {
        if (!issueWithCommits.has(issueId)) {
          issueWithCommits.set(issueId, []);
        }
        issueWithCommits
          .get(issueId)
          ?.push(
            ...(commits as unknown as DataPluginCommit[])
              .filter((c) => (c as unknown as { _id: string })._id === commitId)
              .map(toCommitStats),
          );
      }

      const mergeRequestWithCommits = new Map<string, DataPluginIssueCommitStats[]>();
      for (const { from: mergeRequestId, to: commitId } of mergeRequestsCommits as unknown as {
        /** merge request */
        from: string;
        /** commit */
        to: string;
      }[]) {
        if (!mergeRequestWithCommits.has(mergeRequestId)) {
          mergeRequestWithCommits.set(mergeRequestId, []);
        }
        mergeRequestWithCommits
          .get(mergeRequestId)
          ?.push(
            ...(commits as unknown as DataPluginCommit[])
              .filter((c) => (c as unknown as { _id: string })._id === commitId)
              .map(toCommitStats),
          );
      }

      const issueWithMergeRequests = new Map<string, DataPluginIssueMergeRequest[]>();
      for (const { from: issueId, to: mergeRequestId } of issuesMergeRequests as unknown as {
        /** issue */
        from: string;
        /** merge request */
        to: string;
      }[]) {
        if (!issueWithMergeRequests.has(issueId)) {
          issueWithMergeRequests.set(issueId, []);
        }
        const mergeRequest = (mergeRequests as unknown as { _id: string; iid: number }[]).find((mr) => mr._id === mergeRequestId);
        if (mergeRequest) {
          issueWithMergeRequests.get(issueId)?.push({
            iid: mergeRequest.iid,
            commits: mergeRequestWithCommits.get(mergeRequestId) ?? [],
          });
        }
      }

      return (issues as unknown as DataPluginIssue[])
        .filter((c) => new Date(c.createdAt).getTime() >= first && new Date(c.createdAt).getTime() <= last)
        .sort((a, b) => {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        })
        .map((i) => {
          const issueId = (i as unknown as { _id: string })._id;
          return {
            ...i,
            commits: issueWithCommits.get(issueId) ?? [],
            mergeRequests: issueWithMergeRequests.get(issueId) ?? [],
          };
        });
    } else {
      return new Promise<DataPluginIssue[]>((resolve) => {
        const issue: DataPluginIssue[] = [];
        resolve(issue);
      });
    }
  }
}

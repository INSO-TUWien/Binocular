import type { DataPluginAccountIssues } from '../../../../../interfaces/dataPluginInterfaces/dataPluginAccountsIssues.ts';
import type { DataPluginAccountMergeRequests } from '../../../../../interfaces/dataPluginInterfaces/dataPluginAccountsMergeRequests.ts';
import type { DataPluginIssue } from '../../../../../interfaces/dataPluginInterfaces/dataPluginIssues.ts';
import type { DataPluginMergeRequest } from '../../../../../interfaces/dataPluginInterfaces/dataPluginMergeRequests.ts';
import type { DataPluginCommit } from '../../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';
import type { AuthorType } from '../../../../../../types/data/authorType.ts';
import type { CollaborationSettings } from '../settings/settings.tsx';
import type { NodeType, LinkType } from '../chart/networkChart.tsx';
import type { VisualizationPluginProperties } from '../../../../../interfaces/visualizationPluginInterfaces/visualizationPluginProperties';

type Account = {
  id: string;
  login: string;
  name: string;
  avatarUrl: string;
  url: string;
  issues: DataPluginIssue[];
  mergeRequests: DataPluginMergeRequest[];
};

function mergeAccounts(issueAccounts: DataPluginAccountIssues[], mrAccounts: DataPluginAccountMergeRequests[]): Account[] {
  const map = new Map<string, Account>();
  issueAccounts.forEach((a) =>
    map.set(a.id, { id: a.id, login: a.login, name: a.name, avatarUrl: a.avatarUrl, url: a.url, issues: a.issues, mergeRequests: [] }),
  );
  mrAccounts.forEach((a) => {
    const existing = map.get(a.id);
    if (existing) {
      existing.mergeRequests = a.mergeRequests;
    } else {
      map.set(a.id, {
        id: a.id,
        login: a.login,
        name: a.name,
        avatarUrl: a.avatarUrl,
        url: a.url,
        issues: [],
        mergeRequests: a.mergeRequests,
      });
    }
  });
  return Array.from(map.values());
}

export function convertToGraphData(
  issueAccounts: DataPluginAccountIssues[],
  mrAccounts: DataPluginAccountMergeRequests[],
  settings: CollaborationSettings,
  commits: DataPluginCommit[] = [],
  authorList: AuthorType[] = [],
): { nodes: NodeType[]; links: LinkType[] } {
  const { minEdgeValue, maxEdgeValue } = settings;

  const merged = mergeAccounts(issueAccounts, mrAccounts);
  const authorMaps = buildAuthorMaps(merged, authorList);

  const baseAccounts = remapAccountsByAuthorList(merged, authorMaps);
  const accounts = settings.includeCommitMessageRefs
    ? augmentAccountsWithCommitRefs(baseAccounts, commits, authorMaps, issueAccounts, mrAccounts)
    : baseAccounts;
  const nodeMap = initializeNodeMap(accounts);

  const issueMap = buildParticipantMap(accounts, (a) => a.issues);
  const mrMap = buildParticipantMap(accounts, (a) => a.mergeRequests);

  const allLinks = buildLinks(issueMap, mrMap);
  const filteredLinks = allLinks.filter(({ value }) => value >= minEdgeValue && value <= maxEdgeValue);

  const adjacencyMap = buildAdjacencyMap(nodeMap, filteredLinks);

  assignGroups(nodeMap, adjacencyMap);

  return { nodes: Array.from(nodeMap.values()), links: filteredLinks };
}

type AuthorMaps = {
  nameToAccountId: Map<string, string>;
  authorById: Map<number, AuthorType>;
  sigToAccountId: Map<string, string>;
};

function buildAuthorMaps(accounts: Account[], authorList: AuthorType[]): AuthorMaps {
  const nameToAccountId = new Map<string, string>();
  for (const a of accounts) {
    const key = a.name ?? a.login;
    if (key) nameToAccountId.set(key, a.id);
  }

  const authorById = new Map(authorList.map((a) => [a.id, a]));

  const sigToAccountId = new Map<string, string>();
  for (const author of authorList) {
    const parent = authorById.get(author.parent);
    const name = (parent ?? author).user.account?.name;
    if (!name) continue;
    const accountId = nameToAccountId.get(name);
    if (accountId) sigToAccountId.set(author.user.gitSignature, accountId);
  }

  return { nameToAccountId, authorById, sigToAccountId };
}

// #123 = issue reference, !123 = MR reference (GitLab-style)
/**
 * Merges accounts whose authors are grouped as sub-authors in the author list.
 * A sub-author's account has its issues/MRs folded into the parent's account and is removed.
 */
function remapAccountsByAuthorList(accounts: Account[], { nameToAccountId, authorById }: AuthorMaps): Account[] {
  const remap = new Map<string, string>();
  authorById.forEach((author) => {
    if (author.parent === 0) return;
    const ownName = author.user.account?.name;
    const parentName = authorById.get(author.parent)?.user.account?.name;
    if (!ownName || !parentName || ownName === parentName) return;
    const ownId = nameToAccountId.get(ownName);
    const parentId = nameToAccountId.get(parentName);
    if (ownId && parentId) remap.set(ownId, parentId);
  });

  if (remap.size === 0) return accounts;

  const accountMap = new Map<string, Account>(
    accounts.map((a) => [a.id, { ...a, issues: [...a.issues], mergeRequests: [...a.mergeRequests] }]),
  );

  remap.forEach((targetId, sourceId) => {
    const source = accountMap.get(sourceId);
    const target = accountMap.get(targetId);
    if (!source || !target) return;

    const existingIssueIds = new Set(target.issues.map((i) => i.id));
    source.issues.forEach((issue) => {
      if (!existingIssueIds.has(issue.id)) target.issues.push(issue);
    });
    const existingMrIds = new Set(target.mergeRequests.map((m) => m.id));
    source.mergeRequests.forEach((mr) => {
      if (!existingMrIds.has(mr.id)) target.mergeRequests.push(mr);
    });
    accountMap.delete(sourceId);
  });

  return Array.from(accountMap.values());
}

// #123 = issue reference, !123 = MR reference (GitLab-style, # also checked for MR's)
const ISSUE_REF_PATTERN = /#(\d+)/g;
const MR_REF_PATTERN = /!(\d+)/g;

/**
 * Augments the merged account list with additional issue/MR relationships derived from
 * commit message references (e.g. "fixes #42" or "!15").
 * Commit authors are treated as participants in any referenced issue or MR.
 */
function augmentAccountsWithCommitRefs(
  accounts: Account[],
  commits: DataPluginCommit[],
  { sigToAccountId }: AuthorMaps,
  issueAccounts: DataPluginAccountIssues[],
  mrAccounts: DataPluginAccountMergeRequests[],
): Account[] {
  const issueByIid = new Map<string, DataPluginIssue>();
  for (const a of issueAccounts) {
    for (const issue of a.issues) issueByIid.set(String(issue.iid), issue);
  }

  const mrByIid = new Map<string, DataPluginMergeRequest>();
  for (const a of mrAccounts) {
    for (const mr of a.mergeRequests) mrByIid.set(String(mr.iid), mr);
  }

  const accountMap = new Map<string, Account>(
    accounts.map((a) => [a.id, { ...a, issues: [...a.issues], mergeRequests: [...a.mergeRequests] }]),
  );

  for (const commit of commits) {
    const accountId = sigToAccountId.get(commit.user?.gitSignature ?? '');
    if (!accountId) continue;

    if (!accountMap.has(accountId)) {
      accountMap.set(accountId, {
        id: accountId,
        login: accountId,
        name: accountId,
        avatarUrl: '',
        url: '',
        issues: [],
        mergeRequests: [],
      });
    }

    const account = accountMap.get(accountId)!;
    const existingIssueIds = new Set(account.issues.map((i) => i.id));
    const existingMrIds = new Set(account.mergeRequests.map((m) => m.id));

    for (const match of commit.message.matchAll(ISSUE_REF_PATTERN)) {
      const issue = issueByIid.get(match[1]);
      if (issue && !existingIssueIds.has(issue.id)) {
        account.issues.push(issue);
        existingIssueIds.add(issue.id);
      }
      // GitHub uses #iid for both issues and PRs (no ! syntax)
      const mr = mrByIid.get(match[1]);
      if (mr && !existingMrIds.has(mr.id)) {
        account.mergeRequests.push(mr);
        existingMrIds.add(mr.id);
      }
    }

    for (const match of commit.message.matchAll(MR_REF_PATTERN)) {
      const mr = mrByIid.get(match[1]);
      if (mr && !existingMrIds.has(mr.id)) {
        account.mergeRequests.push(mr);
        existingMrIds.add(mr.id);
      }
    }
  }

  return Array.from(accountMap.values());
}

/**
 * For each issue across all accounts, collect the set of participating account IDs
 */
function buildParticipantMap<T extends DataPluginIssue | DataPluginMergeRequest>(
  accounts: Account[],
  getItems: (account: Account) => T[],
): Map<string, { participants: Set<string>; item: T }> {
  const map = new Map<string, { participants: Set<string>; item: T }>();
  for (const account of accounts) {
    for (const item of getItems(account)) {
      const entry = map.get(item.id);
      if (entry) {
        entry.participants.add(account.id);
      } else {
        const participants = new Set<string>([account.id]);
        map.set(item.id, { participants, item });
      }
    }
  }
  return map;
}

/**
 * Initialize a map from account ID to GraphNode with default group "unassigned"
 */
function initializeNodeMap(accounts: Account[]): Map<string, NodeType> {
  const map = new Map<string, NodeType>();
  accounts.forEach((a) => {
    map.set(a.id, { id: a.id, group: 'unassigned', url: a.url, avatarUrl: a.avatarUrl, name: a.name ?? a.login });
  });
  return map;
}

/**
 * Builds an array of all links between the given participants according to shared issues
 */
function buildLinks(
  issueMap: Map<string, { participants: Set<string>; item: DataPluginIssue }>,
  mrMap: Map<string, { participants: Set<string>; item: DataPluginMergeRequest }>,
): LinkType[] {
  const linkMap = new Map<string, LinkType>();

  const addToLink = (ids: string[], issue?: DataPluginIssue, mr?: DataPluginMergeRequest) => {
    const sorted = Array.from(ids).sort();
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const key = `${sorted[i]}--${sorted[j]}`;
        const existing = linkMap.get(key);
        if (existing) {
          existing.value += 1;
          if (issue) existing.issues.push(issue);
          if (mr) existing.mergeRequests.push(mr);
        } else {
          linkMap.set(key, { source: sorted[i], target: sorted[j], value: 1, issues: issue ? [issue] : [], mergeRequests: mr ? [mr] : [] });
        }
      }
    }
  };

  for (const { participants, item } of issueMap.values()) {
    if (participants.size >= 2) addToLink(Array.from(participants), item as DataPluginIssue, undefined);
  }
  for (const { participants, item } of mrMap.values()) {
    if (participants.size >= 2) addToLink(Array.from(participants), undefined, item as DataPluginMergeRequest);
  }

  return Array.from(linkMap.values());
}

function buildAdjacencyMap(nodeMap: Map<string, NodeType>, links: LinkType[]) {
  const adjacency = new Map<string, Set<string>>();
  //empty neighbor sets for every node
  for (const id of nodeMap.keys()) {
    adjacency.set(id, new Set());
  }

  //populate neighbour sets based on filtered links
  for (const link of links) {
    const source = link.source as string;
    const target = link.target as string;
    adjacency.get(source)!.add(target);
    adjacency.get(target)!.add(source);
  }

  return adjacency;
}

/**
 * Perform a BFS over each unvisited node to assign a “group” (stringified incremental ID)
 */
function assignGroups(nodeMap: Map<string, NodeType>, adjacency: Map<string, Set<string>>): void {
  let nextGroupId = 1;
  const visited = new Set<string>();

  for (const startId of nodeMap.keys()) {
    if (visited.has(startId)) continue;

    const queue: string[] = [startId];
    visited.add(startId);

    while (queue.length > 0) {
      const current = queue.shift()!;
      nodeMap.get(current)!.group = nextGroupId.toString();

      for (const neighbor of adjacency.get(current)!) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    nextGroupId += 1;
  }
}

export const dataConverter = (
  data: DataPluginAccountIssues[],
  props: VisualizationPluginProperties<CollaborationSettings, DataPluginAccountIssues>,
) => ({
  ...convertToGraphData(data, [], props.settings),
  chartData: [] as never[],
  scale: [] as number[],
  palette: {} as Record<string, never>,
});

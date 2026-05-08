import type { DataPluginAccountIssues } from '../../../../../interfaces/dataPluginInterfaces/dataPluginAccountsIssues.ts';
import type { DataPluginAccountMergeRequests } from '../../../../../interfaces/dataPluginInterfaces/dataPluginAccountsMergeRequests.ts';
import type { DataPluginIssue } from '../../../../../interfaces/dataPluginInterfaces/dataPluginIssues.ts';
import type { DataPluginMergeRequest } from '../../../../../interfaces/dataPluginInterfaces/dataPluginMergeRequests.ts';
import type { CollaborationSettings } from '../settings/settings.tsx';
import type { NodeType, LinkType } from '../chart/networkChart.tsx';
import type { VisualizationPluginProperties } from '../../../../../interfaces/visualizationPluginInterfaces/visualizationPluginProperties';
import type { ChartData, Palette } from '../../../../../../components/stackedAreaChart/StackedAreaChart.tsx';

//these are wanted by the framework but not needed by this chart
const DUMMY_CHART_DATA = [] as unknown as ChartData[];
const DUMMY_SCALE = [] as number[];
const DUMMY_PALETTE = {} as unknown as Palette;

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
): {
  nodes: { id: string; group: string; url: string; name: string; avatarUrl: string }[];
  links: LinkType[];
  chartData: ChartData[];
  scale: number[];
  palette: Palette;
} {
  const { minEdgeValue, maxEdgeValue } = settings;
  const accounts = mergeAccounts(issueAccounts, mrAccounts);
  const nodeMap = initializeNodeMap(accounts);

  const issueMap = buildParticipantMap(accounts, (a) => a.issues);
  const mrMap = buildParticipantMap(accounts, (a) => a.mergeRequests);

  const allLinks = buildLinks(issueMap, mrMap);
  const filteredLinks = allLinks.filter(({ value }) => value >= minEdgeValue && value <= maxEdgeValue);

  const adjacencyMap = buildAdjacencyMap(nodeMap, filteredLinks);

  assignGroups(nodeMap, adjacencyMap);

  return {
    nodes: Array.from(nodeMap.values()),
    links: filteredLinks,
    // ---- dummies to satisfy the expected return type ----
    chartData: DUMMY_CHART_DATA,
    scale: DUMMY_SCALE,
    palette: DUMMY_PALETTE,
  };
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
    map.set(a.id, { id: a.id, group: 'unassigned', url: a.url, avatarUrl: a.avatarUrl, name: a.name });
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
) => convertToGraphData(data, [], props.settings);

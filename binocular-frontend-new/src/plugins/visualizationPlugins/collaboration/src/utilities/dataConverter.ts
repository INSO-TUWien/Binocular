import { DataPluginAccount } from "../../../../interfaces/dataPluginInterfaces/dataPluginAccount.ts";
import { DataPluginIssue } from "../../../../interfaces/dataPluginInterfaces/dataPluginIssues.ts";
import { SettingsType } from "../settings/settings.tsx";
import { Properties } from "../../../../interfaces/visualizationPluginInterfaces/properties.ts";
import { NodeType, LinkType } from "../chart/networkChart.tsx";

/**
 * Convert accounts and shared issues into graph data consisting of nodes and links.
 * Filters links by issue count, then assigns connected-component groups.
 */
export function convertIssuesToGraphData(
  accounts: DataPluginAccount[],
  props: Pick<Properties<SettingsType, DataPluginAccount>, "settings">,
): {
  nodes: { id: string; group: string; url: string }[];
  links: LinkType[];
} {
  const { minEdgeValue, maxEdgeValue } = props.settings;

  const issueAccountMap = buildIssueMap(accounts);
  const nodeMap = initializeNodeMap(accounts);
  const allLinks = buildLinks(issueAccountMap);

  const filteredLinks = allLinks.filter(
    ({ value }) => value >= minEdgeValue && value <= maxEdgeValue,
  );

  const adjacencyMap = buildAdjacencyMap(nodeMap, filteredLinks);

  assignGroups(nodeMap, adjacencyMap);

  return {
    nodes: Array.from(nodeMap.values()),
    links: filteredLinks,
  };
}

/**
 * For each issue across all accounts, collect the set of participating account IDs
 */
function buildIssueMap(
  accounts: DataPluginAccount[],
): Map<string, { participants: Set<string>; issue: DataPluginIssue }> {
  const map = new Map<
    string,
    { participants: Set<string>; issue: DataPluginIssue }
  >();
  for (const account of accounts) {
    for (const issue of account.issues) {
      const entry = map.get(issue.id);
      if (entry) {
        entry!.participants.add(account.id);
      } else {
        map.set(issue.id, {
          participants: new Set([account.id]),
          issue,
        });
      }
    }
  }
  return map;
}

/**
 * Initialize a map from account ID to GraphNode with default group "unassigned"
 */
function initializeNodeMap(
  accounts: DataPluginAccount[],
): Map<string, NodeType> {
  const map = new Map<string, NodeType>();
  accounts.forEach((account) => {
    map.set(account.id, {
      id: account.id,
      group: "unassigned",
      url: account.url,
      avatarUrl: account.avatarUrl,
    });
  });
  return map;
}

/**
 * Builds an array of all links between the given participants according to shared issues
 */
function buildLinks(
  issueMap: Map<string, { participants: Set<string>; issue: DataPluginIssue }>,
): LinkType[] {
  const linkMap = new Map<string, LinkType>();
  for (const { participants, issue } of issueMap.values()) {
    const ids = Array.from(participants).sort();
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const [source, target] = [ids[i], ids[j]];
        const key = `${source}--${target}`;
        if (linkMap.has(key)) {
          const existingLink = linkMap.get(key)!;
          existingLink.value += 1;
          existingLink.issues.push(issue);
        } else {
          linkMap.set(key, {
            source: source,
            target: target,
            value: 1,
            issues: [issue],
          });
        }
      }
    }
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
    const source: string = link.source as string;
    const target: string = link.target as string;
    adjacency.get(source)!.add(target);
    adjacency.get(target)!.add(source);
  }

  return adjacency;
}

/**
 * Perform a BFS over each unvisited node to assign a “group” (stringified incremental ID)
 */
function assignGroups(
  nodeMap: Map<string, NodeType>,
  adjacency: Map<string, Set<string>>,
): void {
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

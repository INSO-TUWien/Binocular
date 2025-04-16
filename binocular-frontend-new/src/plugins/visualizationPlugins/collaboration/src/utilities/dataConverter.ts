import { DataPluginIssue } from "../../../../interfaces/dataPluginInterfaces/dataPluginIssues.ts";

export function convertIssuesToGraphData(issues: DataPluginIssue[]): {
  nodes: { id: string; group: string }[];
  links: { source: string; target: string; value: number }[];
} {
  // Maps to collect unique nodes and unique edges.
  const nodeMap: Map<string, { id: string; group: string }> = new Map();
  const linkMap: Map<
    string,
    { source: string; target: string; value: number }
  > = new Map();

  // Process each issue
  issues.forEach((issue) => {
    console.log(issue);
  });

  return {
    nodes: Array.from(nodeMap.values()),
    links: Array.from(linkMap.values()),
  };
}

import type { FileChangeData } from '../reducer/data';

// Data converter for the Change Frequency visualization: turns the flat per-file aggregation
// (FileChangeData) into the directory/file tree consumed by the chart and the directory tab.

export interface HierarchyNode {
  path: string;
  name: string;
  isDirectory: boolean;
  commitCount: number;
  totalAdditions: number;
  totalDeletions: number;
  totalChanges: number;
  averageChangesPerCommit: number;
  lineCount?: number;
  childPaths?: string[];
  children?: HierarchyNode[];
  firstModification?: string | number;
  lastModification?: string | number;
  owners?: Record<string, { changes: number; additions: number; deletions: number }>;
  commits?: string[];
}

// Function to generate the complete hierarchy of the data.
// Pure: the same input always yields the same tree, with no shared module state.
export function generateFullHierarchy(files: FileChangeData[]): HierarchyNode[] {
  // Function to aggregate statistics for a specific path
  function aggregateDirectoryStats(directoryPath: string): {
    files: FileChangeData[];
    additions: number;
    deletions: number;
    changes: number;
    commits: Set<string>;
    owners: Record<string, { changes: number; additions: number; deletions: number }>;
    firstMod: number;
    lastMod: number;
    lineCount: number;
  } {
    const dirFiles = files.filter((file) => file.path.startsWith(directoryPath + '/') || file.path === directoryPath);

    const additions = dirFiles.reduce(function (sum, file) {
      return sum + file.totalAdditions;
    }, 0);
    const deletions = dirFiles.reduce(function (sum, file) {
      return sum + file.totalDeletions;
    }, 0);
    const changes = dirFiles.reduce(function (sum, file) {
      return sum + file.totalChanges;
    }, 0);
    const lineCount = dirFiles.reduce(function (sum, file) {
      return sum + (file.lineCount || 0);
    }, 0);

    const commits = new Set<string>();

    const ownershipData: Record<string, { changes: number; additions: number; deletions: number }> = {};

    let firstMod = dirFiles.length > 0 ? new Date(dirFiles[0].firstModification || 0).getTime() : 0;
    let lastMod = 0;

    for (const file of dirFiles) {
      if (file.commits) {
        for (const commit of file.commits) {
          commits.add(commit);
        }
      }

      if (file.owners) {
        for (const author in file.owners) {
          if (!ownershipData[author]) {
            ownershipData[author] = { changes: 0, additions: 0, deletions: 0 };
          }

          const stats = file.owners[author];

          ownershipData[author].additions += stats.additions || 0;
          ownershipData[author].deletions += stats.deletions || 0;
          ownershipData[author].changes += stats.changes || 0;
        }
      }

      if (file.firstModification) {
        const time = new Date(file.firstModification).getTime();
        if (time < firstMod || firstMod === 0) {
          firstMod = time;
        }
      }
      if (file.lastModification) {
        const time = new Date(file.lastModification).getTime();
        if (time > lastMod) {
          lastMod = time;
        }
      }
    }

    return {
      files: dirFiles,
      additions,
      deletions,
      changes,
      commits,
      owners: ownershipData,
      firstMod,
      lastMod,
      lineCount,
    };
  }

  const pathMap = new Map<
    string,
    {
      path: string;
      isDirectory: boolean;
      isRoot?: boolean;
      files: FileChangeData[];
      children: Set<string>;
    }
  >();

  for (const file of files) {
    const pathParts = file.path.split('/');
    let currentPath = '';

    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      let nextPath = '';
      if (currentPath) {
        nextPath = currentPath + '/' + part;
      } else {
        nextPath = part;
      }

      if (!pathMap.has(nextPath)) {
        pathMap.set(nextPath, {
          path: nextPath,
          isDirectory: true,
          isRoot: i === 0,
          files: [],
          children: new Set<string>(),
        });
      }

      if (currentPath) {
        pathMap.get(currentPath)?.children.add(nextPath);
      }

      currentPath = nextPath;
    }

    const filePath = file.path;
    if (!pathMap.has(filePath)) {
      pathMap.set(filePath, {
        path: filePath,
        isDirectory: false,
        files: [file],
        children: new Set<string>(),
      });
    } else {
      pathMap.get(filePath)!.files.push(file);
    }

    const dirPath = pathParts.slice(0, -1).join('/');
    if (dirPath && pathMap.has(dirPath)) {
      pathMap.get(dirPath)?.children.add(filePath);
    }
  }

  function buildHierarchyNode(path: string): HierarchyNode {
    const nodeInfo = pathMap.get(path)!;
    const name = path.split('/').pop() || path;

    if (!nodeInfo.isDirectory) {
      const file = nodeInfo.files[0];
      return {
        path: file.path,
        name,
        isDirectory: false,
        commitCount: file.commitCount,
        totalAdditions: file.totalAdditions,
        totalDeletions: file.totalDeletions,
        totalChanges: file.totalChanges,
        averageChangesPerCommit: file.averageChangesPerCommit || 0,
        lineCount: file.lineCount,
        firstModification: file.firstModification,
        lastModification: file.lastModification,
        owners: file.owners,
        commits: file.commits,
      };
    }

    const children: HierarchyNode[] = [];
    const childPaths: string[] = [];

    nodeInfo.children.forEach((childPath) => {
      children.push(buildHierarchyNode(childPath));
      childPaths.push(childPath);
    });

    const stats = aggregateDirectoryStats(path);

    return {
      path,
      name,
      isDirectory: true,
      commitCount: stats.files.reduce((sum, file) => sum + file.commitCount, 0),
      totalAdditions: stats.additions,
      totalDeletions: stats.deletions,
      totalChanges: stats.changes,
      averageChangesPerCommit: stats.commits.size > 0 ? stats.changes / stats.commits.size : 0,
      lineCount: stats.lineCount,
      childPaths,
      children,
      firstModification: stats.firstMod > 0 ? new Date(stats.firstMod).toISOString() : undefined,
      lastModification: stats.lastMod > 0 ? new Date(stats.lastMod).toISOString() : undefined,
      owners: stats.owners,
      commits: Array.from(stats.commits),
    };
  }

  const rootNodes: HierarchyNode[] = [];

  for (const [path, info] of pathMap.entries()) {
    if (info.isRoot || path.indexOf('/') === -1) {
      rootNodes.push(buildHierarchyNode(path));
    }
  }

  return rootNodes.sort((a, b) => a.path.localeCompare(b.path));
}

// Function to get the hierarchy node for a specific path (when a user navigates to a specific path).
// Operates on a hierarchy passed in by the caller; holds no module state.
export function getHierarchyForPath(hierarchy: HierarchyNode[], path: string): HierarchyNode | null {
  function findNodeAtPath(nodes: HierarchyNode[], targetPath: string): HierarchyNode | null {
    for (const node of nodes) {
      if (node.path === targetPath) {
        return node;
      }

      if (node.children) {
        const found = findNodeAtPath(node.children, targetPath);
        if (found) {
          return found;
        }
      }
    }

    return null;
  }
  return findNodeAtPath(hierarchy, path);
}

// Resolve the hierarchy level to display for a given navigation path.
// Returns the root level when no path is selected, the children of the path's node when it exists,
// or null when the path no longer exists in the current data set (caller should reset navigation).
export function getHierarchyLevel(fileData: FileChangeData[], currentPath: string): HierarchyNode[] | null {
  const fullHierarchy = generateFullHierarchy(fileData);
  if (!currentPath) {
    return fullHierarchy;
  }
  const node = getHierarchyForPath(fullHierarchy, currentPath);
  if (node && node.children) {
    return node.children;
  }
  return null;
}

import type { Package, SubPackage } from '../chart/type.ts';
import type { DataPluginCommit } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';

/**
 * Extracts file paths touched by a specific developer
 */
export function extractTouchedFiles(commits: DataPluginCommit[], developer: string): Set<string> {
  const developerCommits = commits.filter((commit) => commit.user.gitSignature === developer);

  const touchedFiles = new Set<string>();

  for (const commit of developerCommits) {
    if (!commit.files.data || !Array.isArray(commit.files.data)) continue;

    for (const fileEntry of commit.files.data) {
      if (fileEntry.file?.path) {
        touchedFiles.add(fileEntry.file.path);
      }
    }
  }

  return touchedFiles;
}

/**
 * Filters out merge commits from the given commits
 */
function filterNonMergeCommits(commits: DataPluginCommit[]): DataPluginCommit[] {
  return commits.filter((commit) => !commit.message?.toLowerCase().includes('merge'));
}

/**
 * Processes file paths for a developer's commits
 */
function processCommitFiles(
  commits: DataPluginCommit[],
  developerTouchedFiles: Set<string>,
): {
  packageCommits: Map<string, DataPluginCommit[]>;
} {
  const packageCommits = new Map<string, DataPluginCommit[]>();

  for (const commit of commits) {
    for (const fileChange of commit.files.data) {
      if (!developerTouchedFiles.has(fileChange.file.path)) continue;

      const filePath = fileChange.file.path;
      const pathParts = filePath.split('/').filter((part) => part.length > 0);

      // Process each level of the path
      let currentPath = '';
      for (let i = 0; i < pathParts.length; i++) {
        currentPath = currentPath ? `${currentPath}/${pathParts[i]}` : pathParts[i];

        // Track commits for this path level
        if (!packageCommits.has(currentPath)) {
          packageCommits.set(currentPath, []);
        }
        packageCommits.get(currentPath)!.push(commit);
      }
    }
  }

  return packageCommits;
}

/**
 * Calculates total commit counts per package
 */
function calculateTotalCommits(commits: DataPluginCommit[]): Map<string, number> {
  const totalPackageCommits = new Map<string, number>();

  for (const commit of commits) {
    for (const fileChange of commit.files.data) {
      const filePath = fileChange.file.path;
      const pathParts = filePath.split('/').filter((part) => part.length > 0);

      let currentPath = '';
      for (const part of pathParts) {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        totalPackageCommits.set(currentPath, (totalPackageCommits.get(currentPath) || 0) + 1);
      }
    }
  }

  return totalPackageCommits;
}

/**
 * Calculates ownership scores for packages
 */
function calculateOwnershipScores(
  packageCommits: Map<string, DataPluginCommit[]>,
  totalPackageCommits: Map<string, number>,
): Map<string, number> {
  const packageScores = new Map<string, number>();

  packageCommits.forEach((devCommits, packagePath) => {
    const developerEAs = devCommits.length;
    const totalEAs = totalPackageCommits.get(packagePath) || 1;

    // Pure ownership metric (Bird et al., 2011)
    const ownership = developerEAs / totalEAs;
    packageScores.set(packagePath, ownership);
  });

  return packageScores;
}

/**
 * Calculates Expertise Browser scores based on academic literature
 */
export function calculateExpertiseBrowserScores(commits: DataPluginCommit[], targetDeveloper: string): Package[] {
  const nonMergeCommits = filterNonMergeCommits(commits);

  const developerTouchedFiles = extractTouchedFiles(nonMergeCommits, targetDeveloper);

  const developerCommits = nonMergeCommits.filter((commit) => commit.user.gitSignature === targetDeveloper);

  const packageCommits = processCommitFiles(developerCommits, developerTouchedFiles);

  const totalPackageCommits = calculateTotalCommits(nonMergeCommits);

  const packageScores = calculateOwnershipScores(packageCommits, totalPackageCommits);

  return buildPackageHierarchy(packageScores);
}

/**
 * Builds a hierarchical package structure from flat path scores
 */
export function buildPackageHierarchy(packageScores: Map<string, number>): Package[] {
  const rootPackages: Package[] = [];
  const packageMap = new Map<string, Package | SubPackage>();

  // Create all package objects
  packageScores.forEach((score, path) => {
    const pathParts = path.split('/').filter((part) => part.length > 0);
    if (pathParts.length === 0) return;

    let currentPath = '';
    let parentPackage: Package | SubPackage | null = null;

    pathParts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (!packageMap.has(currentPath)) {
        const newPackage: SubPackage = {
          name: part,
          score: index === pathParts.length - 1 ? score : 0,
          subpackages: [],
        };

        packageMap.set(currentPath, newPackage);

        if (parentPackage) {
          parentPackage.subpackages.push(newPackage);
        } else if (index === 0) {
          rootPackages.push(newPackage as Package);
        }
      }

      parentPackage = packageMap.get(currentPath)!;
    });
  });

  // Aggregate scores for parent packages
  calculateAggregateScores(rootPackages);

  return rootPackages;
}

/**
 * Helper function to calculate aggregate scores for parent packages
 */
function calculateAggregateScores(packages: (Package | SubPackage)[]): number {
  let totalScore = 0;
  let count = 0;

  for (const pkg of packages) {
    if (pkg.subpackages?.length > 0) {
      // Update score based on children's average if needed
      const childScore = calculateAggregateScores(pkg.subpackages);
      if (pkg.score === 0) {
        pkg.score = childScore;
      }
    }
    totalScore += pkg.score;
    count++;
  }

  return count > 0 ? totalScore / count : 0;
}

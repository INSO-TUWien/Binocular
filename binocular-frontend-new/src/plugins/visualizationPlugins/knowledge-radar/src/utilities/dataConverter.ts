import { Package, SubPackage } from "../chart/type.ts";
import { DataPluginCommitFile } from "../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts";
import _ from "lodash";

/**
 * Extracts file paths touched by a specific developer
 */
export function extractTouchedFiles(
  commits: DataPluginCommitFile[],
  developer: string,
): Set<string> {
  const developerCommits = commits.filter(
    (commit) => commit.user.gitSignature === developer,
  );

  const touchedFiles = new Set<string>();

  for (const commit of developerCommits) {
    if (!commit.files || !Array.isArray(commit.files)) continue;

    for (const fileEntry of commit.files) {
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
function filterNonMergeCommits(
  commits: DataPluginCommitFile[],
): DataPluginCommitFile[] {
  return commits.filter(
    (commit) => !commit.message?.toLowerCase().includes("merge"),
  );
}

/**
 * Processes file paths for a developer's commits
 */
function processCommitFiles(
  commits: DataPluginCommitFile[],
  developerTouchedFiles: Set<string>,
): {
  packageCommits: Map<string, DataPluginCommitFile[]>;
  packageFiles: Map<string, Set<string>>;
} {
  const packageCommits = new Map<string, DataPluginCommitFile[]>();
  const packageFiles = new Map<string, Set<string>>();

  for (const commit of commits) {
    for (const fileChange of commit.files) {
      if (!developerTouchedFiles.has(fileChange.file.path)) continue;

      const filePath = fileChange.file.path;
      const pathParts = filePath.split("/").filter((part) => part.length > 0);

      // Process each level of the path
      let currentPath = "";
      for (let i = 0; i < pathParts.length; i++) {
        currentPath = currentPath
          ? `${currentPath}/${pathParts[i]}`
          : pathParts[i];

        // Track commits for this path level
        if (!packageCommits.has(currentPath)) {
          packageCommits.set(currentPath, []);
        }
        packageCommits.get(currentPath)!.push(commit);
      }
    }
  }

  return { packageCommits, packageFiles };
}

/**
 * Calculates total commit counts per package
 */
function calculateTotalCommits(
  commits: DataPluginCommitFile[],
): Map<string, number> {
  const totalPackageCommits = new Map<string, number>();

  for (const commit of commits) {
    for (const fileChange of commit.files) {
      const filePath = fileChange.file.path;
      const pathParts = filePath.split("/").filter((part) => part.length > 0);

      let currentPath = "";
      for (const part of pathParts) {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        totalPackageCommits.set(
          currentPath,
          (totalPackageCommits.get(currentPath) || 0) + 1,
        );
      }
    }
  }

  return totalPackageCommits;
}

/**
 * Calculates ownership scores for packages
 */
function calculateOwnershipScores(
  packageCommits: Map<string, DataPluginCommitFile[]>,
  packageFiles: Map<string, Set<string>>,
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
export function calculateExpertiseBrowserScores(
  commits: DataPluginCommitFile[],
  targetDeveloper: string,
): Package[] {
  // Filter out merge commits
  const nonMergeCommits = filterNonMergeCommits(commits);

  // Get all files touched by this developer
  const developerTouchedFiles = extractTouchedFiles(
    nonMergeCommits,
    targetDeveloper,
  );

  const developerCommits = nonMergeCommits.filter(
    (commit) => commit.user.gitSignature === targetDeveloper,
  );

  // Process commit files
  const { packageCommits, packageFiles } = processCommitFiles(
    developerCommits,
    developerTouchedFiles,
  );

  // Calculate total commits per package
  const totalPackageCommits = calculateTotalCommits(nonMergeCommits);

  // Calculate ownership scores
  const packageScores = calculateOwnershipScores(
    packageCommits,
    packageFiles,
    totalPackageCommits,
  );

  return buildPackageHierarchy(packageScores);
}

/**
 * Builds a hierarchical package structure from flat path scores
 */
export function buildPackageHierarchy(
  packageScores: Map<string, number>,
): Package[] {
  const rootPackages: Package[] = [];
  const packageMap = new Map<string, Package | SubPackage>();

  // Create all package objects
  packageScores.forEach((score, path) => {
    const pathParts = path.split("/").filter((part) => part.length > 0);
    if (pathParts.length === 0) return;

    let currentPath = "";
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

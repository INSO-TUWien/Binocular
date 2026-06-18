import { describe, it, expect } from 'vitest';
import {
  generateFullHierarchy,
  getHierarchyForPath,
  getHierarchyLevel,
} from '../../../../plugins/visualizationPlugins/changeFrequency/src/utilities/hierarchy';
import type { FileChangeData } from '../../../../plugins/visualizationPlugins/changeFrequency/src/reducer/data';

function makeFile(path: string, overrides: Partial<FileChangeData> = {}): FileChangeData {
  return {
    path,
    commitCount: 1,
    totalAdditions: 0,
    totalDeletions: 0,
    totalChanges: 0,
    commits: [],
    ...overrides,
  };
}

// A small tree: two files under src/a, one file at the repository root.
const files: FileChangeData[] = [
  makeFile('src/a/file1.ts', {
    commitCount: 2,
    totalAdditions: 10,
    totalDeletions: 4,
    totalChanges: 14,
    lineCount: 100,
    commits: ['c1', 'c2'],
    firstModification: '2023-01-01T00:00:00.000Z',
    lastModification: '2023-03-01T00:00:00.000Z',
    owners: { alice: { additions: 10, deletions: 4, changes: 14 } },
  }),
  makeFile('src/a/file2.ts', {
    commitCount: 1,
    totalAdditions: 5,
    totalDeletions: 0,
    totalChanges: 5,
    lineCount: 50,
    commits: ['c1'],
    firstModification: '2023-02-01T00:00:00.000Z',
    lastModification: '2023-02-01T00:00:00.000Z',
    owners: { bob: { additions: 5, deletions: 0, changes: 5 } },
  }),
  makeFile('README.md', {
    commitCount: 1,
    totalAdditions: 3,
    totalDeletions: 1,
    totalChanges: 4,
    lineCount: 20,
    commits: ['c3'],
  }),
];

describe('generateFullHierarchy', () => {
  it('returns the top-level entries (root directory and root files)', () => {
    const hierarchy = generateFullHierarchy(files);
    const names = hierarchy.map((n) => n.name).sort();
    expect(names).toEqual(['README.md', 'src']);
  });

  it('is pure: repeated calls with different data produce different trees', () => {
    const first = generateFullHierarchy(files);
    const second = generateFullHierarchy([makeFile('only/one.ts', { commitCount: 1 })]);
    expect(first.map((n) => n.name).sort()).toEqual(['README.md', 'src']);
    expect(second.map((n) => n.name)).toEqual(['only']);
  });

  it('marks directories and files correctly', () => {
    const hierarchy = generateFullHierarchy(files);
    const src = hierarchy.find((n) => n.name === 'src');
    const readme = hierarchy.find((n) => n.name === 'README.md');
    expect(src?.isDirectory).toBe(true);
    expect(readme?.isDirectory).toBe(false);
  });

  it('aggregates directory statistics across descendant files', () => {
    const hierarchy = generateFullHierarchy(files);
    const src = hierarchy.find((n) => n.name === 'src');
    // src aggregates both files: additions 10+5, deletions 4+0, changes 14+5.
    expect(src?.totalAdditions).toBe(15);
    expect(src?.totalDeletions).toBe(4);
    expect(src?.totalChanges).toBe(19);
    expect(src?.lineCount).toBe(150);
    // commitCount sums per-file counts; averageChangesPerCommit divides by unique commits {c1,c2}.
    expect(src?.commitCount).toBe(3);
    expect(src?.averageChangesPerCommit).toBeCloseTo(19 / 2);
  });

  it('merges directory ownership across files', () => {
    const hierarchy = generateFullHierarchy(files);
    const a = getHierarchyForPath(hierarchy, 'src/a');
    expect(a?.owners?.alice?.changes).toBe(14);
    expect(a?.owners?.bob?.changes).toBe(5);
  });
});

describe('getHierarchyForPath', () => {
  it('finds a nested node by path', () => {
    const hierarchy = generateFullHierarchy(files);
    const node = getHierarchyForPath(hierarchy, 'src/a');
    expect(node?.name).toBe('a');
    expect(node?.children).toHaveLength(2);
  });

  it('returns null for a path that does not exist', () => {
    const hierarchy = generateFullHierarchy(files);
    expect(getHierarchyForPath(hierarchy, 'does/not/exist')).toBeNull();
  });
});

describe('getHierarchyLevel', () => {
  it('returns the root level when no path is selected', () => {
    const level = getHierarchyLevel(files, '');
    expect(level?.map((n) => n.name).sort()).toEqual(['README.md', 'src']);
  });

  it('returns the children of the selected directory', () => {
    expect(getHierarchyLevel(files, 'src')?.map((n) => n.name)).toEqual(['a']);
    expect(
      getHierarchyLevel(files, 'src/a')
        ?.map((n) => n.name)
        .sort(),
    ).toEqual(['file1.ts', 'file2.ts']);
  });

  it('returns null when the selected path no longer exists', () => {
    expect(getHierarchyLevel(files, 'src/removed')).toBeNull();
  });
});

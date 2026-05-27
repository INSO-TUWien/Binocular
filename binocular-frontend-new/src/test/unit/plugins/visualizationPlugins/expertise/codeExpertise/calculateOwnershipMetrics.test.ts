import { describe, it, expect } from 'vitest';
import { calculateOwnershipMetrics } from '../../../../../../plugins/visualizationPlugins/expertise/codeExpertise/src/chart/chart';
import type {
  DataPluginOwnership,
  DataPluginCommitBuild,
} from '../../../../../../plugins/interfaces/dataPluginInterfaces/dataPluginCommits';
import type { FileListElementType } from '../../../../../../types/data/fileListType';

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeOwnership(sha: string, files: DataPluginOwnership['files']): DataPluginOwnership {
  return { sha, date: '2023-01-01T00:00:00Z', parents: [], files };
}

function makeFile(
  path: string,
  owners: { user: string; lines: { from: number; to: number }[] }[],
  action = 'modified',
): DataPluginOwnership['files'][number] {
  return {
    path,
    action,
    ownership: owners.map(({ user, lines }) => ({
      user,
      hunks: [{ originalCommit: 'sha0', lines }],
    })),
  };
}

function makeCommitBuild(gitSignature: string, additions: number): DataPluginCommitBuild {
  return {
    sha: 'sha',
    shortSha: 'abc',
    messageHeader: '',
    message: '',
    user: { id: '', gitSignature, account: null },
    branch: 'main',
    date: '2023-01-01T00:00:00Z',
    parents: [],
    webUrl: '',
    stats: { additions, deletions: 0 },
    builds: [],
  };
}

function makeFileListItem(path: string, checked: boolean): FileListElementType {
  return { element: { path, webUrl: '', maxLength: 0 }, checked };
}

// ─── calculateOwnershipMetrics ────────────────────────────────────────────────

describe('calculateOwnershipMetrics', () => {
  // — totalLinesAdded (sourced from commitsWithBuilds) —

  it('U57.1 returns empty totals when both inputs are empty', () => {
    const { currentOwnership, totalLinesAdded } = calculateOwnershipMetrics([], []);
    expect(currentOwnership).toEqual({});
    expect(totalLinesAdded).toEqual({});
  });

  it('U57.2 sums additions from a single commit for one developer', () => {
    const { totalLinesAdded } = calculateOwnershipMetrics([], [makeCommitBuild('Alice', 42)]);
    expect(totalLinesAdded['Alice']).toBe(42);
  });

  it('U57.3 accumulates additions across multiple commits for the same developer', () => {
    const builds = [makeCommitBuild('Alice', 10), makeCommitBuild('Alice', 5)];
    const { totalLinesAdded } = calculateOwnershipMetrics([], builds);
    expect(totalLinesAdded['Alice']).toBe(15);
  });

  it('U57.4 tracks additions separately per developer', () => {
    const builds = [makeCommitBuild('Alice', 10), makeCommitBuild('Bob', 7)];
    const { totalLinesAdded } = calculateOwnershipMetrics([], builds);
    expect(totalLinesAdded['Alice']).toBe(10);
    expect(totalLinesAdded['Bob']).toBe(7);
  });

  it('U57.5 skips commits with no user without throwing', () => {
    const broken = { ...makeCommitBuild('Alice', 5), user: null } as unknown as DataPluginCommitBuild;
    expect(() => calculateOwnershipMetrics([], [broken])).not.toThrow();
    const { totalLinesAdded } = calculateOwnershipMetrics([], [broken]);
    expect(Object.keys(totalLinesAdded)).toHaveLength(0);
  });

  // — currentOwnership (sourced from ownershipData) —

  it('U57.6 returns empty ownership when ownershipData is empty', () => {
    const { currentOwnership } = calculateOwnershipMetrics([], []);
    expect(currentOwnership).toEqual({});
  });

  it('U57.7 counts lines owned as (to - from + 1) for a single range', () => {
    // range [3, 7] → 5 lines
    const ownership = [makeOwnership('sha1', [makeFile('src/a.ts', [{ user: 'Alice', lines: [{ from: 3, to: 7 }] }])])];
    const { currentOwnership } = calculateOwnershipMetrics(ownership, []);
    expect(currentOwnership['Alice']).toBe(5);
  });

  it('U57.8 sums multiple line ranges within a hunk', () => {
    // [1,3] = 3 lines + [10,12] = 3 lines → 6
    const ownership = [
      makeOwnership('sha1', [
        makeFile('src/a.ts', [
          {
            user: 'Alice',
            lines: [
              { from: 1, to: 3 },
              { from: 10, to: 12 },
            ],
          },
        ]),
      ]),
    ];
    const { currentOwnership } = calculateOwnershipMetrics(ownership, []);
    expect(currentOwnership['Alice']).toBe(6);
  });

  it('U57.9 tracks ownership separately for multiple owners of the same file', () => {
    const file = makeFile('src/a.ts', [
      { user: 'Alice', lines: [{ from: 1, to: 5 }] },
      { user: 'Bob', lines: [{ from: 6, to: 8 }] },
    ]);
    const { currentOwnership } = calculateOwnershipMetrics([makeOwnership('sha1', [file])], []);
    expect(currentOwnership['Alice']).toBe(5);
    expect(currentOwnership['Bob']).toBe(3);
  });

  it('U57.10 includes all files when fileList is undefined', () => {
    const ownership = [makeOwnership('sha1', [makeFile('src/a.ts', [{ user: 'Alice', lines: [{ from: 1, to: 4 }] }])])];
    const { currentOwnership } = calculateOwnershipMetrics(ownership, [], undefined);
    expect(currentOwnership['Alice']).toBe(4);
  });

  it('U57.11 includes a file when it is checked in fileList', () => {
    const ownership = [makeOwnership('sha1', [makeFile('src/a.ts', [{ user: 'Alice', lines: [{ from: 1, to: 4 }] }])])];
    const fileList = [makeFileListItem('src/a.ts', true)];
    const { currentOwnership } = calculateOwnershipMetrics(ownership, [], fileList);
    expect(currentOwnership['Alice']).toBe(4);
  });

  it('U57.12 excludes a file when it is unchecked in fileList', () => {
    const ownership = [makeOwnership('sha1', [makeFile('src/a.ts', [{ user: 'Alice', lines: [{ from: 1, to: 4 }] }])])];
    const fileList = [makeFileListItem('src/a.ts', false)];
    const { currentOwnership } = calculateOwnershipMetrics(ownership, [], fileList);
    expect(currentOwnership['Alice']).toBeUndefined();
  });

  it('U57.13 removes a file from ownership tracking when its action is deleted', () => {
    const addCommit = makeOwnership('sha1', [makeFile('src/a.ts', [{ user: 'Alice', lines: [{ from: 1, to: 10 }] }])]);
    const delCommit = makeOwnership('sha2', [makeFile('src/a.ts', [], 'deleted')]);
    const { currentOwnership } = calculateOwnershipMetrics([addCommit, delCommit], []);
    expect(currentOwnership['Alice']).toBeUndefined();
  });

  it('U57.14 later commit replaces earlier ownership for the same file', () => {
    // First commit: Alice owns lines 1–10; second commit: Bob owns lines 1–3 (Alice is gone)
    const first = makeOwnership('sha1', [makeFile('src/a.ts', [{ user: 'Alice', lines: [{ from: 1, to: 10 }] }])]);
    const second = makeOwnership('sha2', [makeFile('src/a.ts', [{ user: 'Bob', lines: [{ from: 1, to: 3 }] }])]);
    const { currentOwnership } = calculateOwnershipMetrics([first, second], []);
    expect(currentOwnership['Bob']).toBe(3);
    expect(currentOwnership['Alice']).toBeUndefined();
  });

  it('U57.15 accumulates ownership across multiple independent files', () => {
    const ownership = [
      makeOwnership('sha1', [
        makeFile('src/a.ts', [{ user: 'Alice', lines: [{ from: 1, to: 5 }] }]),
        makeFile('src/b.ts', [{ user: 'Alice', lines: [{ from: 1, to: 3 }] }]),
      ]),
    ];
    const { currentOwnership } = calculateOwnershipMetrics(ownership, []);
    expect(currentOwnership['Alice']).toBe(8);
  });
});

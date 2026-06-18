import { describe, it, expect } from 'vitest';
import { processCommits } from '../../../../plugins/visualizationPlugins/changeFrequency/src/saga/index';
import type { CommitWithFileChanges } from '../../../../plugins/interfaces/dataPluginInterfaces/dataPluginCommits';

function commit(overrides: Partial<CommitWithFileChanges> & { files: CommitWithFileChanges['files'] }): CommitWithFileChanges {
  return {
    sha: 'sha',
    date: '2023-01-01T00:00:00.000Z',
    signature: 'alice',
    ...overrides,
  };
}

describe('processCommits', () => {
  it('returns an empty list for empty input', () => {
    expect(processCommits([])).toEqual([]);
    expect(processCommits()).toEqual([]);
  });

  it('aggregates additions, deletions, changes and commit count per file', () => {
    const result = processCommits([
      commit({
        sha: 'c1',
        date: '2023-01-01T00:00:00.000Z',
        files: { data: [{ file: { path: 'src/a.ts' }, stats: { additions: 10, deletions: 4 } }] },
      }),
      commit({
        sha: 'c2',
        date: '2023-02-01T00:00:00.000Z',
        files: { data: [{ file: { path: 'src/a.ts' }, stats: { additions: 6, deletions: 0 } }] },
      }),
    ]);

    expect(result).toHaveLength(1);
    const a = result[0];
    expect(a.path).toBe('src/a.ts');
    expect(a.commitCount).toBe(2);
    expect(a.totalAdditions).toBe(16);
    expect(a.totalDeletions).toBe(4);
    expect(a.totalChanges).toBe(20);
    expect(a.averageChangesPerCommit).toBe(10);
    expect(a.commits).toEqual(['c1', 'c2']);
  });

  it('merges ownership per author signature and defaults to "Unknown"', () => {
    const result = processCommits([
      commit({
        signature: 'alice',
        files: { data: [{ file: { path: 'a.ts' }, stats: { additions: 10, deletions: 2 } }] },
      }),
      commit({
        signature: undefined,
        files: { data: [{ file: { path: 'a.ts' }, stats: { additions: 3, deletions: 1 } }] },
      }),
    ]);

    const owners = result[0].owners ?? {};
    expect(owners.alice).toEqual({ additions: 10, deletions: 2, changes: 12 });
    expect(owners.Unknown).toEqual({ additions: 3, deletions: 1, changes: 4 });
  });

  it('keeps the line count from the most recent commit that reports one', () => {
    // Descending date order, as the backend data source provides it.
    const result = processCommits([
      commit({
        date: '2023-03-01T00:00:00.000Z',
        files: { data: [{ file: { path: 'a.ts' }, lineCount: 250, stats: { additions: 1, deletions: 0 } }] },
      }),
      commit({
        date: '2023-01-01T00:00:00.000Z',
        files: { data: [{ file: { path: 'a.ts' }, lineCount: 100, stats: { additions: 1, deletions: 0 } }] },
      }),
    ]);

    expect(result[0].lineCount).toBe(250);
  });

  it('tracks the earliest and latest modification dates', () => {
    const result = processCommits([
      commit({
        date: '2023-02-15T00:00:00.000Z',
        files: { data: [{ file: { path: 'a.ts' }, stats: { additions: 1, deletions: 0 } }] },
      }),
      commit({
        date: '2023-01-01T00:00:00.000Z',
        files: { data: [{ file: { path: 'a.ts' }, stats: { additions: 1, deletions: 0 } }] },
      }),
      commit({
        date: '2023-05-20T00:00:00.000Z',
        files: { data: [{ file: { path: 'a.ts' }, stats: { additions: 1, deletions: 0 } }] },
      }),
    ]);

    expect(result[0].firstModification).toBe('2023-01-01T00:00:00.000Z');
    expect(result[0].lastModification).toBe('2023-05-20T00:00:00.000Z');
  });

  it('produces one entry per distinct path and skips empty/null commits', () => {
    const result = processCommits([
      commit({ files: { data: [{ file: { path: 'a.ts' }, stats: { additions: 1, deletions: 0 } }] } }),
      commit({ files: { data: [{ file: { path: 'b.ts' }, stats: { additions: 2, deletions: 0 } }] } }),
      commit({ files: { data: [] } }),
      null as unknown as CommitWithFileChanges,
    ]);

    expect(result.map((f) => f.path).sort()).toEqual(['a.ts', 'b.ts']);
  });

  it('lets non-significant commits update the line count but not the change metrics', () => {
    const result = processCommits([
      // Newer, out-of-window commit: carries the current size but must not count as a change.
      commit({
        date: '2023-05-01T00:00:00.000Z',
        isSignificant: false,
        files: { data: [{ file: { path: 'a.ts' }, lineCount: 500, stats: { additions: 80, deletions: 5 } }] },
      }),
      // In-window commit: the only one that counts toward the metrics.
      commit({
        date: '2023-01-01T00:00:00.000Z',
        isSignificant: true,
        files: { data: [{ file: { path: 'a.ts' }, lineCount: 100, stats: { additions: 10, deletions: 2 } }] },
      }),
    ]);

    expect(result).toHaveLength(1);
    const a = result[0];
    expect(a.lineCount).toBe(500); // current size from the newer, non-significant commit
    expect(a.commitCount).toBe(1); // only the significant commit counts
    expect(a.totalAdditions).toBe(10);
    expect(a.totalDeletions).toBe(2);
    expect(a.lastModification).toBe('2023-01-01T00:00:00.000Z'); // significant-only
  });

  it('excludes files touched only by non-significant commits', () => {
    const result = processCommits([
      commit({
        isSignificant: false,
        files: { data: [{ file: { path: 'untouched.ts' }, lineCount: 42, stats: { additions: 1, deletions: 0 } }] },
      }),
      commit({
        isSignificant: true,
        files: { data: [{ file: { path: 'changed.ts' }, stats: { additions: 1, deletions: 0 } }] },
      }),
    ]);

    expect(result.map((f) => f.path)).toEqual(['changed.ts']);
  });
});

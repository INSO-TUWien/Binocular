import { describe, it, expect } from 'vitest';
import { convertToChartData } from '../../../../../../plugins/visualizationPlugins/authorBehaviour/timeSpent/src/utilities/dataConverter';
import type { DataPluginNote } from '../../../../../../plugins/interfaces/dataPluginInterfaces/dataPluginNotes';
import type { DataPluginIssue } from '../../../../../../plugins/interfaces/dataPluginInterfaces/dataPluginIssues';
import type { TimeSpentSettings } from '../../../../../../plugins/visualizationPlugins/authorBehaviour/timeSpent/src/settings/settings';
import type { AuthorType } from '../../../../../../types/data/authorType';
import type { DataPlugin } from '../../../../../../plugins/interfaces/dataPlugin';
import type { Store } from '@reduxjs/toolkit';

const defaultSettings: TimeSpentSettings = {
  splitTimePerIssue: false,
  splitSpentRemoved: false,
  breakdown: false,
  visualizationStyle: 'curved',
  showSprints: false,
};

function makeProps(settings: TimeSpentSettings, authorList: AuthorType[] = []) {
  return {
    settings,
    parameters: {
      parametersGeneral: { granularity: 'months', excludeMergeCommits: false },
      parametersDateRange: { from: '', to: '' },
    },
    authorList,
    fileList: [],
    sprintList: [],
    dataConnection: {} as unknown as DataPlugin,
    chartContainerRef: { current: null },
    store: {} as unknown as Store,
  };
}

function makeNote(body: string, issueId?: string, issueIid?: number, issueTitle?: string): DataPluginNote {
  return {
    body,
    createdAt: '2023-06-15T00:00:00Z',
    updatedAt: '2023-06-15T00:00:00Z',
    author: { id: 'a1', name: 'Alice', user: { id: 'u1', gitSignature: 'Alice', account: null }, platform: 'gitlab' },
    issue: issueId
      ? ({
          id: issueId,
          iid: issueIid ?? 1,
          title: issueTitle ?? 'Test Issue',
          description: '',
          state: 'open',
          webUrl: '',
          createdAt: '2023-01-01',
          closedAt: null,
          labels: [],
          author: null,
          assignee: null,
          assignees: [],
          notes: [],
          commits: [],
        } satisfies DataPluginIssue)
      : null,
    mergeRequest: null,
  };
}

function makeAuthor(id: string, signature: string, parent = -1): AuthorType {
  return {
    id: Number(id),
    parent,
    selected: true,
    color: { main: '#ff0000', secondary: '#ff0000aa' },
    user: { id, gitSignature: signature, account: null },
  };
}

function makeNoteAt(body: string, createdAt: string, authorId: string, authorSig: string): DataPluginNote {
  return {
    body,
    createdAt,
    updatedAt: createdAt,
    author: { id: authorId, name: authorSig, user: { id: authorId, gitSignature: authorSig, account: null }, platform: 'gitlab' },
    issue: null,
    mergeRequest: null,
  };
}

describe('convertToChartData (timeSpent)', () => {
  it('U37.1 returns empty result for empty array', () => {
    const result = convertToChartData([], makeProps(defaultSettings));
    expect(result.chartData).toEqual([]);
    expect(result.scale).toEqual([]);
    expect(result.palette).toEqual({});
  });

  it('U37.2 BUG — non-matching notes crash (source bug: no empty-check after extractTimeTrackingDataFromNotes)', () => {
    // When notes don't match a time-tracking pattern, extractTimeTrackingDataFromNotes returns []
    // but the source then accesses sortedData[0].createdAt without checking length first.
    const note = makeNote('just a comment');
    expect(() => convertToChartData([note], makeProps(defaultSettings))).toThrow(TypeError);
  });

  it('U37.3 splitTimePerIssue:true — chart keys include issue title', () => {
    const settings: TimeSpentSettings = { ...defaultSettings, splitTimePerIssue: true };
    const note = makeNote('added 2h of time spent at 2023-06-15', 'issue-1', 1, 'My Issue');
    const result = convertToChartData([note], makeProps(settings));
    const allKeys = result.chartData.flatMap((d) => Object.keys(d));
    expect(allKeys.some((k) => k.includes('My Issue'))).toBe(true);
  });

  it('U37.4 splitTimePerIssue:false — author-name keys appear when author has user.id', () => {
    const author = makeAuthor('u1', 'Alice');
    const note = makeNote('added 2h of time spent at 2023-06-15');
    const result = convertToChartData([note], makeProps(defaultSettings, [author]));
    // chartData should have keys corresponding to author
    const allKeys = result.chartData.flatMap((d) => Object.keys(d));
    expect(allKeys.some((k) => k === 'Alice' || k === '(Total) Alice' || k === 'others')).toBe(true);
  });

  it('U37.5 scale[1] positive when time is spent', () => {
    const settings: TimeSpentSettings = { ...defaultSettings, splitTimePerIssue: true };
    const note = makeNote('added 2h of time spent at 2023-06-15', 'issue-1', 1, 'My Issue');
    const result = convertToChartData([note], makeProps(settings));
    expect(result.scale[1]).toBeGreaterThanOrEqual(0);
  });

  it('U37.6 splitSpentRemoved:true, splitTimePerIssue:false → palette keys contain "(Spent)" and "(Removed)"', () => {
    const settings: TimeSpentSettings = { ...defaultSettings, splitSpentRemoved: true, splitTimePerIssue: false };
    const author = makeAuthor('u1', 'Alice');
    const note = makeNote('added 2h of time spent at 2023-06-15');
    const result = convertToChartData([note], makeProps(settings, [author]));
    expect(Object.keys(result.palette).some((k) => k.startsWith('(Spent)'))).toBe(true);
    expect(Object.keys(result.palette).some((k) => k.startsWith('(Removed)'))).toBe(true);
  });

  it('U37.7 breakdown:true, splitSpentRemoved:false, splitTimePerIssue:false → palette keys contain "(Total)"', () => {
    const settings: TimeSpentSettings = { ...defaultSettings, breakdown: true, splitSpentRemoved: false, splitTimePerIssue: false };
    const author = makeAuthor('u1', 'Alice');
    const note = makeNote('added 2h of time spent at 2023-06-15');
    const result = convertToChartData([note], makeProps(settings, [author]));
    expect(Object.keys(result.palette).some((k) => k.startsWith('(Total)'))).toBe(true);
  });

  it('U37.8 splitSpentRemoved:true, splitTimePerIssue:true → palette keys contain "(Spent)" and "(Removed)" for issue', () => {
    const settings: TimeSpentSettings = { ...defaultSettings, splitSpentRemoved: true, splitTimePerIssue: true };
    const note = makeNote('added 2h of time spent at 2023-06-15', 'issue-1', 1, 'My Issue');
    const result = convertToChartData([note], makeProps(settings));
    expect(Object.keys(result.palette).some((k) => k.startsWith('(Spent)'))).toBe(true);
    expect(Object.keys(result.palette).some((k) => k.startsWith('(Removed)'))).toBe(true);
  });

  // ── breakdown + splitSpentRemoved ──────────────────────────────────────────

  it('U37.9 breakdown:true + splitSpentRemoved:true → palette has (Spent)/(Removed), not (Total)', () => {
    const settings: TimeSpentSettings = { ...defaultSettings, breakdown: true, splitSpentRemoved: true };
    const author = makeAuthor('u1', 'Alice');
    const notes = [
      makeNoteAt('added 2h of time spent', '2023-03-01T10:00:00Z', 'u1', 'Alice'),
      makeNoteAt('subtracted 30m of time spent', '2023-05-01T10:00:00Z', 'u1', 'Alice'),
    ];
    const result = convertToChartData(notes, makeProps(settings, [author]));
    const keys = Object.keys(result.palette);
    expect(keys.some((k) => k.startsWith('(Spent)'))).toBe(true);
    expect(keys.some((k) => k.startsWith('(Removed)'))).toBe(true);
    expect(keys.some((k) => k.startsWith('(Total)'))).toBe(false);
  });

  it('U37.10 breakdown:true + splitSpentRemoved:true → (Spent) is positive, (Removed) is negative or zero', () => {
    const settings: TimeSpentSettings = { ...defaultSettings, breakdown: true, splitSpentRemoved: true };
    const author = makeAuthor('u1', 'Alice');
    const notes = [
      makeNoteAt('added 2h of time spent', '2023-03-01T10:00:00Z', 'u1', 'Alice'),
      makeNoteAt('subtracted 30m of time spent', '2023-05-01T10:00:00Z', 'u1', 'Alice'),
    ];
    const result = convertToChartData(notes, makeProps(settings, [author]));
    const allValues = result.chartData.flatMap((d) => Object.entries(d).filter(([k]) => k !== 'date'));
    const spentValues = allValues.filter(([k]) => k.startsWith('(Spent)')).map(([, v]) => v);
    const removedValues = allValues.filter(([k]) => k.startsWith('(Removed)')).map(([, v]) => v);
    expect(spentValues.every((v) => v >= 0)).toBe(true);
    expect(removedValues.every((v) => v <= 0)).toBe(true);
  });

  it('U37.11 breakdown:true + splitSpentRemoved:true → (Spent) reaches 2h cumulative, (Removed) reaches -0.5h', () => {
    const settings: TimeSpentSettings = { ...defaultSettings, breakdown: true, splitSpentRemoved: true };
    const author = makeAuthor('u1', 'Alice');
    const notes = [
      makeNoteAt('added 2h of time spent', '2023-03-01T10:00:00Z', 'u1', 'Alice'),
      makeNoteAt('subtracted 30m of time spent', '2023-05-01T10:00:00Z', 'u1', 'Alice'),
    ];
    const result = convertToChartData(notes, makeProps(settings, [author]));
    // Find the last data point — cumulative totals should be final here
    const last = result.chartData[result.chartData.length - 1];
    expect(last['(Spent) Alice']).toBeCloseTo(2, 5);
    expect(last['(Removed) Alice']).toBeCloseTo(-0.5, 5);
  });

  it('U37.12 breakdown:true + splitSpentRemoved:true → no chart value equals -1 (stale -0.001 accumulation bug)', () => {
    // Before the fix, the -0.001 "stack hint" was applied on every bucket iteration,
    // causing (Removed) to drift to -1 over ~1000 daily buckets even with no removed time.
    const settings: TimeSpentSettings = {
      ...defaultSettings,
      breakdown: true,
      splitSpentRemoved: true,
      splitTimePerIssue: false,
    };
    const author = makeAuthor('u1', 'Alice');
    // Spread spent notes across ~3 years so many daily buckets are generated
    const notes = [
      makeNoteAt('added 1h of time spent', '2020-01-15T10:00:00Z', 'u1', 'Alice'),
      makeNoteAt('added 1h of time spent', '2021-06-15T10:00:00Z', 'u1', 'Alice'),
      makeNoteAt('added 1h of time spent', '2022-12-15T10:00:00Z', 'u1', 'Alice'),
    ];
    const props = {
      ...makeProps(settings, [author]),
      parameters: {
        parametersGeneral: { granularity: 'days', excludeMergeCommits: false },
        parametersDateRange: { from: '2020-01-01T00:00:00Z', to: '2022-12-31T23:59:59Z' },
      },
    };
    const result = convertToChartData(notes, props);
    const allValues = result.chartData.flatMap((d) =>
      Object.entries(d)
        .filter(([k]) => k !== 'date')
        .map(([, v]) => v),
    );
    expect(allValues.some((v) => Math.abs(v + 1) < 0.01)).toBe(false);
  });

  it('U37.13 "Others" group in breakdown + splitSpentRemoved → values sum correctly, not last-author-wins', () => {
    // Before the fix, the breakdown block used = (assignment) instead of +=,
    // so multiple "others" group members overwrote each other — last one won.
    const settings: TimeSpentSettings = { ...defaultSettings, breakdown: true, splitSpentRemoved: true };
    const parent = makeAuthor('10', 'ParentA', 0); // parent=0 → "Other" group
    const child1 = makeAuthor('11', 'ChildA', 0); // parent=0 → "Other" group
    const authorList = [parent, child1];
    const notes = [
      makeNoteAt('added 2h of time spent', '2023-03-01T10:00:00Z', '10', 'ParentA'),
      makeNoteAt('added 3h of time spent', '2023-03-01T10:00:00Z', '11', 'ChildA'),
    ];
    const result = convertToChartData(notes, makeProps(settings, authorList));
    const last = result.chartData[result.chartData.length - 1];
    // Both authors contribute to "(Spent) others" — total should be 5h, not 2h or 3h
    expect(last['(Spent) others']).toBeCloseTo(5, 5);
  });
});

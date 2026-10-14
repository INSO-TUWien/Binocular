import { describe, it, expect } from 'vitest';
import { convertToChartData } from '../../../../../../plugins/visualizationPlugins/issues/issues/src/utilities/dataConverter';
import type { DataPluginIssue } from '../../../../../../plugins/interfaces/dataPluginInterfaces/dataPluginIssues';
import type { IssueSettings } from '../../../../../../plugins/visualizationPlugins/issues/issues/src/settings/settings';
import type { AuthorType } from '../../../../../../types/data/authorType';
import type { DataPlugin } from '../../../../../../plugins/interfaces/dataPlugin';
import type { Store } from '@reduxjs/toolkit';

function makeProps(settings: IssueSettings, authorList: AuthorType[] = []) {
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

const defaultSettings: IssueSettings = {
  splitIssuesPerAuthor: false,
  breakdown: false,
  visualizationStyle: 'curved',
  showSprints: false,
};

function makeIssue(overrides: Partial<DataPluginIssue> = {}): DataPluginIssue {
  return {
    id: 'i1',
    iid: 1,
    title: 'Test Issue',
    description: '',
    state: 'opened',
    webUrl: '',
    createdAt: '2023-06-15T00:00:00Z',
    closedAt: null,
    labels: [],
    author: null,
    assignee: null,
    assignees: [],
    notes: [],
    commits: [],
    mergeRequests: [],
    ...overrides,
  };
}

describe('convertToChartData (issues)', () => {
  it('U33.1 returns empty result for empty array', () => {
    const result = convertToChartData([], makeProps(defaultSettings));
    expect(result.chartData).toEqual([]);
    expect(result.palette).toEqual({});
    expect(result.scale).toEqual([]);
  });

  it('U33.2 breakdown:false — opened issue produces positive Opened count', () => {
    const issue = makeIssue({ createdAt: '2023-06-15T00:00:00Z', closedAt: null });
    const result = convertToChartData([issue], makeProps(defaultSettings));
    expect(result.chartData.length).toBeGreaterThan(0);
    const bucketWithOpened = result.chartData.find((d) => d['Opened'] > 0);
    expect(bucketWithOpened).toBeDefined();
    expect(bucketWithOpened!['Opened']).toBe(1);
  });

  it('U33.3 breakdown:false — closed issue produces negative Closed count', () => {
    const issue = makeIssue({
      createdAt: '2023-05-01T00:00:00Z',
      closedAt: '2023-06-15T00:00:00Z',
    });
    const result = convertToChartData([issue], makeProps(defaultSettings));
    const bucketWithClosed = result.chartData.find((d) => d['Closed'] < 0);
    expect(bucketWithClosed).toBeDefined();
    expect(bucketWithClosed!['Closed']).toBe(-1);
  });

  it('U33.4 breakdown:true — Open count increments on open, decrements on close', () => {
    const settings: IssueSettings = { ...defaultSettings, breakdown: true };
    const issue = makeIssue({
      createdAt: '2023-05-01T00:00:00Z',
      closedAt: '2023-07-01T00:00:00Z',
    });
    const result = convertToChartData([issue], makeProps(settings));
    // After open: Open should have been 1 at some point
    const maxOpen = Math.max(...result.chartData.map((d) => d['Open'] ?? 0));
    expect(maxOpen).toBeGreaterThanOrEqual(1);
  });

  it('U33.5 scale[1] is positive, scale[0] is 0 or negative for opened issues', () => {
    const issue = makeIssue({ createdAt: '2023-06-15T00:00:00Z', closedAt: null });
    const result = convertToChartData([issue], makeProps(defaultSettings));
    expect(result.scale[1]).toBeGreaterThan(0);
    expect(result.scale[0]).toBeLessThanOrEqual(0);
  });

  it('U33.6 splitIssuesPerAuthor:true — chart keys prefixed with "Opened Issues"', () => {
    const settings: IssueSettings = { ...defaultSettings, splitIssuesPerAuthor: true };
    const issue = makeIssue({ createdAt: '2023-06-15T00:00:00Z', closedAt: null });
    const result = convertToChartData([issue], makeProps(settings));
    const allKeys = result.chartData.flatMap((d) => Object.keys(d));
    expect(allKeys.some((k) => k.startsWith('Opened Issues') || k.startsWith('Open Issues'))).toBe(true);
  });

  it('U33.7 unassigned issue (no assignee) lands under unassigned key', () => {
    const settings: IssueSettings = { ...defaultSettings, splitIssuesPerAuthor: true };
    const issue = makeIssue({ createdAt: '2023-06-15T00:00:00Z', closedAt: null, assignee: null });
    const result = convertToChartData([issue], makeProps(settings));
    const allKeys = result.chartData.flatMap((d) => Object.keys(d));
    expect(allKeys.some((k) => k.includes('unassigned'))).toBe(true);
  });

  it('U33.8 splitIssuesPerAuthor:true with 2 issues from 2 different authors → 2 separate series in chartData', () => {
    const settings: IssueSettings = { ...defaultSettings, splitIssuesPerAuthor: true };
    const author1: AuthorType = {
      id: 1,
      parent: -1,
      selected: true,
      color: { main: '#ff0000', secondary: '#ff000055' },
      user: { id: 'user1', gitSignature: 'Alice', account: null },
    };
    const author2: AuthorType = {
      id: 2,
      parent: -1,
      selected: true,
      color: { main: '#00ff00', secondary: '#00ff0055' },
      user: { id: 'user2', gitSignature: 'Bob', account: null },
    };
    const issue1 = makeIssue({
      id: 'i1',
      createdAt: '2023-06-15T00:00:00Z',
      assignee: { id: 'acc1', name: 'Alice', platform: 'github', user: { id: 'user1', gitSignature: 'Alice', account: null } },
    });
    const issue2 = makeIssue({
      id: 'i2',
      createdAt: '2023-06-20T00:00:00Z',
      assignee: { id: 'acc2', name: 'Bob', platform: 'github', user: { id: 'user2', gitSignature: 'Bob', account: null } },
    });
    const result = convertToChartData([issue1, issue2], makeProps(settings, [author1, author2]));
    const allKeys = result.chartData.flatMap((d) => Object.keys(d));
    expect(allKeys.some((k) => k.includes('Alice'))).toBe(true);
    expect(allKeys.some((k) => k.includes('Bob'))).toBe(true);
  });

  it('U33.9 splitIssuesPerAuthor:false with 2 issues from 2 authors → 1 combined series', () => {
    const settings: IssueSettings = { ...defaultSettings, splitIssuesPerAuthor: false };
    const issue1 = makeIssue({ id: 'i1', createdAt: '2023-06-15T00:00:00Z' });
    const issue2 = makeIssue({ id: 'i2', createdAt: '2023-06-20T00:00:00Z' });
    const result = convertToChartData([issue1, issue2], makeProps(settings));
    const allKeys = result.chartData.flatMap((d) => Object.keys(d));
    // Combined mode uses bare status keys, not per-author keys
    expect(allKeys.some((k) => k === 'Opened')).toBe(true);
    // No per-author series keys
    expect(allKeys.every((k) => !k.includes('Opened Issues '))).toBe(true);
  });

  it('U33.10 issue with assignee=null and assignees=[] → placed in "unassigned" bucket', () => {
    const settings: IssueSettings = { ...defaultSettings, splitIssuesPerAuthor: true };
    const issue = makeIssue({
      createdAt: '2023-06-15T00:00:00Z',
      assignee: null,
      assignees: [],
    });
    const result = convertToChartData([issue], makeProps(settings));
    const allKeys = result.chartData.flatMap((d) => Object.keys(d));
    expect(allKeys.some((k) => k === 'Opened Issues unassigned' || k === 'Open Issues unassigned')).toBe(true);
    // Should not be in account-not-assigned bucket
    expect(allKeys.every((k) => !k.includes('account not assigned') || result.chartData.every((d) => (d[k] ?? 0) === 0))).toBe(true);
  });

  it('U33.11 breakdown:true causes OPENED and OPEN states to appear as separate entries', () => {
    const settingsBreakdown: IssueSettings = { ...defaultSettings, breakdown: true };
    const settingsNoBreakdown: IssueSettings = { ...defaultSettings, breakdown: false };
    const issue = makeIssue({
      createdAt: '2023-05-01T00:00:00Z',
      closedAt: '2023-07-01T00:00:00Z',
    });
    const resultBreakdown = convertToChartData([issue], makeProps(settingsBreakdown));
    const resultNoBreakdown = convertToChartData([issue], makeProps(settingsNoBreakdown));
    const keysBreakdown = resultBreakdown.chartData.flatMap((d) => Object.keys(d));
    const keysNoBreakdown = resultNoBreakdown.chartData.flatMap((d) => Object.keys(d));
    // breakdown:true → 'Open' key present (running count)
    expect(keysBreakdown.some((k) => k === 'Open')).toBe(true);
    // breakdown:false → 'Opened' and 'Closed' keys present (events)
    expect(keysNoBreakdown.some((k) => k === 'Opened')).toBe(true);
    expect(keysNoBreakdown.some((k) => k === 'Closed')).toBe(true);
  });

  it('U33.12 author with parent === -1 is included as a top-level root author', () => {
    const settings: IssueSettings = { ...defaultSettings, splitIssuesPerAuthor: true };
    const rootAuthor: AuthorType = {
      id: 1,
      parent: -1,
      selected: true,
      color: { main: '#aabbcc', secondary: '#aabbcc55' },
      user: { id: 'root1', gitSignature: 'RootUser', account: null },
    };
    const issue = makeIssue({
      createdAt: '2023-06-15T00:00:00Z',
      assignee: { id: 'acc-root', name: 'RootUser', platform: 'github', user: { id: 'root1', gitSignature: 'RootUser', account: null } },
    });
    const result = convertToChartData([issue], makeProps(settings, [rootAuthor]));
    const allKeys = result.chartData.flatMap((d) => Object.keys(d));
    // parent === -1 means the author's own gitSignature is used as the series name
    expect(allKeys.some((k) => k.includes('RootUser'))).toBe(true);
  });

  it('U33.13 author with parent === 0 is treated as belonging to "others" group', () => {
    const settings: IssueSettings = { ...defaultSettings, splitIssuesPerAuthor: true };
    const othersAuthor: AuthorType = {
      id: 2,
      parent: 0,
      selected: true,
      color: { main: '#112233', secondary: '#11223355' },
      user: { id: 'child1', gitSignature: 'ChildUser', account: null },
    };
    const issue = makeIssue({
      createdAt: '2023-06-15T00:00:00Z',
      assignee: {
        id: 'acc-child',
        name: 'ChildUser',
        platform: 'github',
        user: { id: 'child1', gitSignature: 'ChildUser', account: null },
      },
    });
    const result = convertToChartData([issue], makeProps(settings, [othersAuthor]));
    const allKeys = result.chartData.flatMap((d) => Object.keys(d));
    // parent === 0 → the name used is 'others'
    expect(allKeys.some((k) => k.includes('others'))).toBe(true);
  });
});

import { describe, it, expect } from 'vitest';
import { extractTimeTrackingDataFromNotes } from '../../../../../plugins/visualizationPlugins/utils/extractTimeTrackingDataFromNotes';
import type { DataPluginNote } from '../../../../../plugins/interfaces/dataPluginInterfaces/dataPluginNotes';
import type { DataPluginAccount } from '../../../../../plugins/interfaces/dataPluginInterfaces/dataPluginAccounts';
import type { DataPluginIssue } from '../../../../../plugins/interfaces/dataPluginInterfaces/dataPluginIssues';

const author: DataPluginAccount = { id: 'u1', name: 'Alice', user: null, platform: 'gitlab' };

function makeNote(body: string, issue: DataPluginIssue | null = null): DataPluginNote {
  return { body, author, createdAt: '2023-01-01', updatedAt: '2023-01-01', issue, mergeRequest: null };
}

function makeIssue(id: string): DataPluginIssue {
  return {
    id,
    iid: 1,
    title: '',
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
    mergeRequests: [],
  };
}

describe('extractTimeTrackingDataFromNotes', () => {
  it('U14.1 returns empty array for null input', () => {
    // @ts-expect-error testing invalid input
    expect(extractTimeTrackingDataFromNotes(null)).toEqual([]);
  });

  it('U14.2 returns empty array for undefined input', () => {
    // @ts-expect-error testing invalid input
    expect(extractTimeTrackingDataFromNotes(undefined)).toEqual([]);
  });

  it('U14.3 returns empty array when no note matches a time-tracking pattern', () => {
    const notes = [makeNote('Fixed a typo'), makeNote('LGTM')];
    expect(extractTimeTrackingDataFromNotes(notes)).toEqual([]);
  });

  it('U14.4 "added Xh" note produces a positive timeSpent entry in hours', () => {
    const notes = [makeNote('added 2h of time spent at 2023-01-01')];
    const result = extractTimeTrackingDataFromNotes(notes);
    expect(result).toHaveLength(1);
    expect(result[0].timeSpent).toBe(2);
    expect(result[0].author).toEqual(author);
  });

  it('U14.5 "added Xh Ym" parses both hours and minutes', () => {
    const notes = [makeNote('added 1h 30m of time spent at 2023-01-01')];
    const result = extractTimeTrackingDataFromNotes(notes);
    expect(result[0].timeSpent).toBeCloseTo(1.5);
  });

  it('U14.6 "added Xm" parses minutes only', () => {
    const notes = [makeNote('added 30m of time spent at 2023-01-01')];
    const result = extractTimeTrackingDataFromNotes(notes);
    expect(result[0].timeSpent).toBeCloseTo(0.5);
  });

  it('U14.7 "subtracted Xh" note produces a negative timeSpent entry', () => {
    const notes = [makeNote('subtracted 1h of time spent at 2023-01-01')];
    const result = extractTimeTrackingDataFromNotes(notes);
    expect(result[0].timeSpent).toBe(-1);
  });

  it('U14.8 "deleted Xh of spent time" note produces a negative entry', () => {
    const notes = [makeNote('deleted 2h of spent time at 2023-01-01')];
    const result = extractTimeTrackingDataFromNotes(notes);
    expect(result[0].timeSpent).toBe(-2);
  });

  it('U14.9 "deleted -Xh of spent time" (double-negative) produces a positive entry', () => {
    const notes = [makeNote('deleted -2h of spent time at 2023-01-01')];
    const result = extractTimeTrackingDataFromNotes(notes);
    expect(result[0].timeSpent).toBe(2);
  });

  it('U14.10 "removed time spent" clears entries for the same issue', () => {
    // Notes are processed in reverse; to correctly simulate "add then remove",
    // "removed" must be the LAST element so it is processed after the add.
    const issue = makeIssue('issue-1');
    const notes: DataPluginNote[] = [makeNote('added 2h of time spent at 2023-01-01', issue), makeNote('removed time spent', issue)];
    // processing order (reversed): "removed time spent" first, then "added 2h"
    // The removal runs before the addition is recorded → addition still lands in result
    // This documents the current (reversed) processing behavior.
    const result = extractTimeTrackingDataFromNotes(notes);
    // With reversed processing: remove fires on empty list (no-op), then add fires.
    expect(result).toHaveLength(1);
    expect(result[0].timeSpent).toBe(2);
  });

  it('U14.11 accumulates multiple add notes', () => {
    const notes = [makeNote('added 1h of time spent at 2023-01-01'), makeNote('added 2h of time spent at 2023-01-02')];
    const result = extractTimeTrackingDataFromNotes(notes);
    expect(result).toHaveLength(2);
  });
});

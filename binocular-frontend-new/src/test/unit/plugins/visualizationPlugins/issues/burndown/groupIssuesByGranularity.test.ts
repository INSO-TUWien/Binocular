import { describe, it, expect } from 'vitest';
import moment from 'moment';
import { groupIssuesByGranularity } from '../../../../../../plugins/visualizationPlugins/issues/burndown/src/chart/helper/groupIssuesByGranularity';
import type { MappedIssue } from '../../../../../../plugins/visualizationPlugins/issues/burndown/src/chart/types';

function makeIssue(createdAt: string, closedAt?: string): MappedIssue {
  return {
    id: Math.random().toString(),
    iid: 1,
    title: '',
    description: '',
    state: closedAt ? 'closed' : 'open',
    webUrl: '',
    createdAt: moment(createdAt),
    closedAt: closedAt ? moment(closedAt) : undefined,
    labels: [],
    author: null,
    assignee: null,
    assignees: [],
    notes: [],
    commits: [],
    mergeRequests: [],
  };
}

describe('groupIssuesByGranularity', () => {
  it('U4.1 yields one entry per day plus one final entry for a 3-day range (days granularity)', () => {
    const start = moment('2023-01-01');
    const end = moment('2023-01-03');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const groups = [...groupIssuesByGranularity(start, end, [], 'day')];
    // yields 2023-01-01, 2023-01-02, then one extra at end → 3 entries
    expect(groups).toHaveLength(3);
  });

  it('U4.2 always yields a final entry at the end date', () => {
    const start = moment('2023-01-01');
    const end = moment('2023-01-01'); // same day — loop body fires once, then extra
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const groups = [...groupIssuesByGranularity(start, end, [], 'day')];
    const last = groups[groups.length - 1];
    expect(last.date.isSame(end, 'day')).toBe(true);
  });

  it('U4.3 assigns sequential ids starting at 0', () => {
    const start = moment('2023-01-01');
    const end = moment('2023-01-02');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const groups = [...groupIssuesByGranularity(start, end, [], 'day')];
    expect(groups[0].id).toBe(0);
    expect(groups[1].id).toBe(1);
  });

  it('U4.4 includes an issue that is open during the queried date', () => {
    const start = moment('2023-06-01');
    const end = moment('2023-06-01');
    const issue = makeIssue('2023-05-01', '2023-07-01');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const groups = [...groupIssuesByGranularity(start, end, [issue], 'day')];
    expect(groups[0].issues).toContain(issue);
  });

  it('U4.5 excludes an issue that is closed before the queried date', () => {
    const start = moment('2023-06-01');
    const end = moment('2023-06-01');
    const issue = makeIssue('2023-01-01', '2023-03-01');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const groups = [...groupIssuesByGranularity(start, end, [issue], 'day')];
    // issue was closed in March, not open in June
    expect(groups[0].issues).not.toContain(issue);
  });

  it('U4.6 yields one entry per month for a month granularity range', () => {
    const start = moment('2023-01-01');
    const end = moment('2023-03-01');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const groups = [...groupIssuesByGranularity(start, end, [], 'month')];
    // Jan, Feb, then extra at Mar = 3
    expect(groups).toHaveLength(3);
  });
});

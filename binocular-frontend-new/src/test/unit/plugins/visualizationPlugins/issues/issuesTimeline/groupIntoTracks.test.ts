import { describe, it, expect } from 'vitest';
import moment from 'moment';
import { groupIntoTracks } from '../../../../../../plugins/visualizationPlugins/issues/issuesTimeline/src/chart/helper/groupIntoTracks';
import type { MappedDataPluginIssue } from '../../../../../../plugins/visualizationPlugins/issues/issuesTimeline/src/chart/types';

function makeIssue(id: string, createdAt: string, closedAt?: string): MappedDataPluginIssue {
  return {
    id,
    iid: 1,
    title: id,
    description: '',
    state: 'closed',
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

const maxDate = moment('2024-12-31');

describe('groupIntoTracks', () => {
  it('U22.1 returns empty array for empty issues', () => {
    expect(groupIntoTracks([], maxDate)).toEqual([]);
  });

  it('U22.2 single issue goes into a single track', () => {
    const issue = makeIssue('1', '2024-01-01', '2024-01-10');
    const tracks = groupIntoTracks([issue], maxDate);
    expect(tracks).toHaveLength(1);
    expect(tracks[0]).toHaveLength(1);
  });

  it('U22.3 two non-overlapping sequential issues stay in one track', () => {
    const i1 = makeIssue('1', '2024-01-01', '2024-01-10');
    const i2 = makeIssue('2', '2024-02-01', '2024-02-10');
    const tracks = groupIntoTracks([i1, i2], maxDate);
    expect(tracks).toHaveLength(1);
    expect(tracks[0]).toHaveLength(2);
  });

  it('U22.4 two overlapping issues split into two tracks', () => {
    const i1 = makeIssue('1', '2024-01-01', '2024-03-01');
    const i2 = makeIssue('2', '2024-02-01', '2024-04-01');
    const tracks = groupIntoTracks([i1, i2], maxDate);
    expect(tracks).toHaveLength(2);
  });

  it('U22.5 issue without closedAt uses maxDate for overlap check', () => {
    const i1 = makeIssue('1', '2024-01-01', '2024-06-01');
    // i2 has no closedAt — uses maxDate (2024-12-31) which overlaps with i1's range
    const i2 = makeIssue('2', '2024-02-01');
    const tracks = groupIntoTracks([i1, i2], maxDate);
    expect(tracks).toHaveLength(2);
  });

  it('U22.6 issues with the same createdAt are treated as overlapping', () => {
    const i1 = makeIssue('1', '2024-01-01', '2024-03-01');
    const i2 = makeIssue('2', '2024-01-01', '2024-02-01');
    const tracks = groupIntoTracks([i1, i2], maxDate);
    expect(tracks).toHaveLength(2);
  });

  it('U22.7 issue that contains another is treated as overlapping', () => {
    // i1 is short; i2 starts before i1 and ends after — containment
    const i1 = makeIssue('1', '2024-02-01', '2024-03-01');
    const i2 = makeIssue('2', '2024-01-01', '2024-04-01');
    const tracks = groupIntoTracks([i1, i2], maxDate);
    expect(tracks).toHaveLength(2);
  });
});

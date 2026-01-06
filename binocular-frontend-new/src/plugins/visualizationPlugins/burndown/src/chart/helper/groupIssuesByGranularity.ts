import type { unitOfTime, Moment } from 'moment';
import type { MappedIssue, IssuesGroupedByGranularity } from '../types';

const cond = (granularity: unitOfTime.Base, date: Moment) => (i: MappedIssue) =>
  granularity === 'years' ? date.isSame(i.createdAt, 'year') : date.isBetween(i.createdAt, i.closedAt, undefined, '[]');
export function* groupIssuesByGranularity(
  start: Moment,
  end: Moment,
  issues: MappedIssue[],
  granularity: unitOfTime.Base,
): Generator<IssuesGroupedByGranularity> {
  let date = start.clone();

  let id = 0;

  do {
    yield {
      id,
      date,
      issues: issues.filter(cond(granularity, date)),
    };

    // .clone() call is necessary, otherwise the visualization no longer works because every date would be the same day.
    date = date.clone().add(1, granularity).startOf(granularity);
    id += 1;
  } while (date.isBefore(end));

  // yield one additional data entry.
  // Fixes the current day not being visible when selecting week, month or year granularities.
  yield {
    id,
    date: end,
    issues: issues.filter(cond(granularity, end)),
  };
}

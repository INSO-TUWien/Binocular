import type { Moment, unitOfTime } from 'moment';
import { BaseDetailDialogLayout } from '../../../../sprints/src/chart/components/DetailDialog';
import type { IssuesGroupedByGranularity } from '../types';
import classes from './burndownChartDetailDialog.module.css';

export const BurndownChartDetailDialog: React.FC<{
  anchor: SVGElement;
  id: number;
  issuesPerGranularity: IssuesGroupedByGranularity[];
  onClickClose: React.MouseEventHandler;
  minDate: Moment;
  maxDate: Moment;
  granularity: unitOfTime.Base;
  maxNumberOfIssuesPerGranularity: number;
  nmbrOfIssues: number;
}> = ({ anchor, id, issuesPerGranularity, maxNumberOfIssuesPerGranularity, minDate, maxDate, granularity, onClickClose }) => {
  const value = issuesPerGranularity.find((ipg) => ipg.id === id);
  const previousValue = issuesPerGranularity.find((ipg) => ipg.id === id - 1);
  const differenceWithPreviousValue = value && previousValue ? value.issues.length - previousValue.issues.length : 0;

  const localGranularity = ['years', 'year'].includes(granularity) ? 'months' : granularity;

  const idealStepSize = maxNumberOfIssuesPerGranularity / maxDate.diff(minDate, localGranularity);
  const differenceWithIdeal = Math.round(
    value ? value.issues.length - (maxDate.diff(value.date, localGranularity) ?? 0) * idealStepSize : 0,
  );

  return (
    <BaseDetailDialogLayout anchor={anchor} onClickClose={onClickClose} invisible={!value}>
      <h2 className={'card-title'} style={{ display: 'inline', wordBreak: 'break-word' }}>
        {value?.date.format('ll')}
      </h2>
      <p>
        <em>Open issues:</em> <span>{value?.issues.length}</span>
      </p>
      <p>
        <em>Difference with previous:</em>{' '}
        <span className={classes['tooltip-difference']} data-sign={Math.sign(differenceWithPreviousValue)}>
          {Number.isNaN(differenceWithPreviousValue) ? 0 : differenceWithPreviousValue}
        </span>
      </p>
      <p>
        <em>Difference with ideal:</em>{' '}
        <span className={classes['tooltip-difference']} data-sign={Math.sign(differenceWithIdeal)}>
          {Number.isNaN(differenceWithIdeal) ? 0 : differenceWithIdeal}
        </span>
      </p>
    </BaseDetailDialogLayout>
  );
};

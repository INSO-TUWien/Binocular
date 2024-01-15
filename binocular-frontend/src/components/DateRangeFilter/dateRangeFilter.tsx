import * as React from 'react';
import styles from './dateRangeFilter.module.scss';
import { DateRange } from '../../types/globalTypes';

interface Props {
  from: string | undefined;
  to: string | undefined;
  type?: string;
  onDateChanged: (newDateRange: DateRange) => void;
}

export default (props: Props) => {
  const [from, setFrom] = React.useState(props.from);
  const [to, setTo] = React.useState(props.to);

  React.useEffect(() => {
    if (props.from !== undefined && props.to !== undefined) {
      setFrom(props.from);
      setTo(props.to);
    }
  }, [props]);

  return (
    <div>
      <input
        id={'from'}
        type={props.type || 'datetime-local'}
        className={styles.dateTimePicker}
        value={from}
        onChange={(e: any) => {
          const res = { from: e.target.value, to: to };
          props.onDateChanged(res);
        }}
      />
      <span style={{ margin: '0 1rem' }}>-</span>
      <input
        id={'to'}
        type={props.type || 'datetime-local'}
        className={styles.dateTimePicker}
        value={to}
        onChange={(e) => {
          const res = { from: from, to: e.target.value };
          props.onDateChanged(res);
        }}
      />
    </div>
  );
};

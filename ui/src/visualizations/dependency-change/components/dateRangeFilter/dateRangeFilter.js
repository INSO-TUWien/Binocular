import React from 'react';
import styles from './dateRangeFilter.scss';

export default class DateRangeFilter extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  componentWillReceiveProps(nextProps) {
    document.getElementById('from').value = nextProps.from;
    document.getElementById('to').value = nextProps.to;
  }

  render() {
    const { onDateChanged } = this.props;
    return (
      <div className='dateRangeFilter'>
        <input
          id={'from'}
          type="datetime-local"
          className={styles.dateTimePicker}
          onChange={() => {
            debugger;
            const res = {};
            res.from = document.getElementById('from').value;
            res.to = document.getElementById('to').value;
            onDateChanged(res);
          }}
        />
        <span style={{ margin: '0 1rem' }}>-</span>
        <input
          id={'to'}
          type="datetime-local"
          className={styles.dateTimePicker}
          onChange={() => {
            debugger;
            const res = {};
            res.from = document.getElementById('from').value;
            res.to = document.getElementById('to').value;
            onDateChanged(res);
          }}
        />
      </div>
    );
  }
}

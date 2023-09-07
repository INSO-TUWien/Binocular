import React from 'react';
import styles from './dateRangeFilter.scss';

export default class DateRangeFilter extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      from: props.from,
      to: props.to,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.from !== undefined && nextProps.to !== undefined) {
      this.setState({
        from: nextProps.from,
        to: nextProps.to,
      });
    }
  }

  render() {
    const { onDateChanged } = this.props;
    return (
      <div>
        <input
          id={'from'}
          type={this.props.type || 'datetime-local'}
          className={styles.dateTimePicker}
          value={this.state.from}
          onChange={(e) => {
            const res = {};
            res.from = e.target.value;
            res.to = this.state.to;
            onDateChanged(res);
          }}
        />
        <span style={{ margin: '0 1rem' }}>-</span>
        <input
          id={'to'}
          type={this.props.type || 'datetime-local'}
          className={styles.dateTimePicker}
          value={this.state.to}
          onChange={(e) => {
            const res = {};
            res.from = this.state.from;
            res.to = e.target.value;
            onDateChanged(res);
          }}
        />
      </div>
    );
  }
}

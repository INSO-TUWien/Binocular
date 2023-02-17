'use strict';

import React from 'react';
import { connect } from 'react-redux';
import styles from '../../styles.scss';
import { setResolution, setTimeSpan, setSelectedAuthors, setAllAuthors } from '../../sagas';
import DateRangeFilter from '../../../../components/DateRangeFilter/dateRangeFilter';
import CheckboxLegend from '../../../../components/CheckboxLegend';
import AuthorMerger from '../authorMerger/authorMerger';

const mapStateToProps = (state /*, ownProps*/) => {
  const dashboardState = state.visualizations.newDashboard.state;

  let firstDisplayDate = '';
  let lastDisplayDate = '';
  let selectedAuthors = [];

  if (dashboardState.config.chartTimeSpan.from === undefined) {
    firstDisplayDate =
      dashboardState.data.data.firstCommit !== undefined ? dashboardState.data.data.firstCommit.date.split('.')[0] : undefined;
  } else {
    firstDisplayDate = dashboardState.config.chartTimeSpan.from;
  }
  if (dashboardState.config.chartTimeSpan.to === undefined) {
    lastDisplayDate =
      dashboardState.data.data.lastCommit !== undefined ? dashboardState.data.data.lastCommit.date.split('.')[0] : undefined;
  } else {
    lastDisplayDate = dashboardState.config.chartTimeSpan.to;
  }
  if (dashboardState.config.selectedAuthorsGlobal !== undefined) {
    selectedAuthors = dashboardState.config.selectedAuthorsGlobal;
  }
  return {
    chartResolution: dashboardState.config.chartResolution,
    firstDisplayDate: firstDisplayDate,
    lastDisplayDate: lastDisplayDate,
    firstCommit: dashboardState.data.data.firstCommit,
    lastCommit: dashboardState.data.data.lastCommit,
    committers: dashboardState.data.data.committers,
    palette: dashboardState.data.data.palette,
    selectedAuthors: selectedAuthors,
    firstSignificantTimestamp: dashboardState.data.data.firstSignificantTimestamp,
    lastSignificantTimestamp: dashboardState.data.data.lastSignificantTimestamp,
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onClickResolution: (resolution) => dispatch(setResolution(resolution)),
    onChangeTimeSpan: (timeSpan) => dispatch(setTimeSpan(timeSpan)),
    onClickCheckboxLegend: (selected) => dispatch(setSelectedAuthors(selected)),
    onSetPalette: (allAuthors) => dispatch(setAllAuthors(allAuthors)),
  };
};

class UniversalConfigComponent extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showAuthorMerge: false,
    };
  }

  render() {
    let otherCommitters;

    if (this.props.palette && 'others' in this.props.palette) {
      otherCommitters = this.props.committers.length - (Object.keys(this.props.palette).length - 1);
    }
    if (this.props.palette !== undefined) {
      this.props.onSetPalette(this.props.palette);
    }

    function timestampToDateTimeString(timestamp) {
      const date = new Date(timestamp);

      return (
        '' +
        date.getFullYear() +
        '-' +
        String(date.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(date.getDate()).padStart(2, '0') +
        'T' +
        String(date.getHours()).padStart(2, '0') +
        ':' +
        String(date.getMinutes()).padStart(2, '0') +
        ':' +
        String(date.getSeconds()).padStart(2, '0')
      );
    }

    return (
      <div>
        {this.state.showAuthorMerge === true ? (
          <AuthorMerger
            committers={this.props.committers}
            palette={this.props.palette}
            close={() => {
              this.setState({ showAuthorMerge: false });
            }}
          />
        ) : (
          ''
        )}
        <h1 className={styles.headline}>Universal Settings</h1>
        <label className="label">Granularity</label>
        <div className="control">
          <div className="select">
            <select value={this.props.chartResolution} onChange={(e) => this.props.onClickResolution(e.target.value)}>
              <option value="years">Year</option>
              <option value="months">Month</option>
              <option value="weeks">Week</option>
              <option value="days">Day</option>
            </select>
          </div>
        </div>
        <label className="label">Date Range</label>
        <div>
          <DateRangeFilter
            from={this.props.firstDisplayDate}
            to={this.props.lastDisplayDate}
            onDateChanged={(data) => {
              this.props.onChangeTimeSpan(data);
            }}
          />
        </div>
        <div className={styles.marginTop05}>
          <button
            className="button"
            onClick={(e) => {
              const defaultTimeSpan = {
                from: timestampToDateTimeString(this.props.firstSignificantTimestamp),
                to: timestampToDateTimeString(this.props.lastSignificantTimestamp),
              };
              this.props.onChangeTimeSpan(defaultTimeSpan);
            }}>
            Reset
          </button>
        </div>
        <label className="label">Authors</label>
        <div>
          <CheckboxLegend
            palette={this.props.palette}
            onClick={this.props.onClickCheckboxLegend.bind(this)}
            title="All"
            split={this.props.metric === 'linesChanged'}
            otherCommitters={otherCommitters}
            selected={this.props.selectedAuthors}
          />
        </div>
        <div className={styles.marginTop05}></div>
        <button
          className={'button'}
          onClick={() => {
            this.setState({ showAuthorMerge: true });
          }}>
          Merge duplicate Authors
        </button>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UniversalConfigComponent);

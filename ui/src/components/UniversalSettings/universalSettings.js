'use strict';

import React from 'react';
import { connect } from 'react-redux';
import styles from './styles.scss';
import { setResolution, setTimeSpan, setSelectedAuthors, setAllAuthors, setMergedAuthorList, setOtherAuthorList } from '../../sagas';
import DateRangeFilter from '../DateRangeFilter/dateRangeFilter';
import AuthorMerger from './authorMerger/authorMerger';
import AuthorList from './authorList/authorList';

const mapStateToProps = (state /*, ownProps*/) => {
  const universalSettings = state.universalSettings;

  let firstDisplayDate = '';
  let lastDisplayDate = '';
  let selectedAuthors = [];
  let mergedAuthors = [];
  let otherAuthors = [];

  if (universalSettings.chartTimeSpan.from === undefined) {
    firstDisplayDate =
      universalSettings.universalSettingsData.data.firstCommit !== undefined
        ? universalSettings.universalSettingsData.data.firstCommit.date.split('.')[0]
        : undefined;
  } else {
    firstDisplayDate = universalSettings.chartTimeSpan.from;
  }
  if (universalSettings.chartTimeSpan.to === undefined) {
    lastDisplayDate =
      universalSettings.universalSettingsData.data.lastCommit !== undefined
        ? universalSettings.universalSettingsData.data.lastCommit.date.split('.')[0]
        : undefined;
  } else {
    lastDisplayDate = universalSettings.chartTimeSpan.to;
  }
  if (universalSettings.selectedAuthorsGlobal !== undefined) {
    selectedAuthors = universalSettings.selectedAuthorsGlobal;
  }
  if (universalSettings.mergedAuthors !== undefined) {
    mergedAuthors = universalSettings.mergedAuthors;
  }
  if (universalSettings.otherAuthors !== undefined) {
    otherAuthors = universalSettings.otherAuthors;
  }
  return {
    chartResolution: universalSettings.chartResolution,
    firstDisplayDate: firstDisplayDate,
    lastDisplayDate: lastDisplayDate,
    firstCommit: universalSettings.universalSettingsData.data.firstCommit,
    lastCommit: universalSettings.universalSettingsData.data.lastCommit,
    committers: universalSettings.universalSettingsData.data.committers,
    palette: universalSettings.universalSettingsData.data.palette,
    selectedAuthors: selectedAuthors,
    mergedAuthors: mergedAuthors,
    otherAuthors: otherAuthors,
    firstSignificantTimestamp: universalSettings.universalSettingsData.data.firstSignificantTimestamp,
    lastSignificantTimestamp: universalSettings.universalSettingsData.data.lastSignificantTimestamp,
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onClickResolution: (resolution) => dispatch(setResolution(resolution)),
    onChangeTimeSpan: (timeSpan) => dispatch(setTimeSpan(timeSpan)),
    onAuthorSelectionChanged: (selected) => dispatch(setSelectedAuthors(selected)),
    onMergedAuthorListChanged: (selected) => dispatch(setMergedAuthorList(selected)),
    onOtherAuthorListChanged: (selected) => dispatch(setOtherAuthorList(selected)),
    onSetPalette: (allAuthors) => dispatch(setAllAuthors(allAuthors)),
  };
};

class UniversalConfigComponent extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showAuthorMerge: false,
      mergedAuthorList: this.props.mergedAuthors,
      otherAuthors: this.props.otherAuthors,
    };
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (
      nextProps.committers !== [] &&
      nextProps.palette !== [] &&
      this.state.mergedAuthorList.length === 0 &&
      this.state.otherAuthors.length === 0
    ) {
      const mergedAuthorList = this.generateCommittersList(nextProps.committers, nextProps.palette);
      this.props.onMergedAuthorListChanged(mergedAuthorList);
      this.setState({ mergedAuthorList: mergedAuthorList });
    }
  }

  generateCommittersList(committers, palette) {
    const committersList = [];
    for (const committer of committers) {
      committersList.push({
        mainCommitter: committer,
        committers: [{ signature: committer, color: palette[committer] }],
        color: palette[committer],
      });
    }
    return committersList;
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
            mergedAuthorList={this.state.mergedAuthorList}
            other={this.state.otherAuthors}
            close={() => {
              this.setState({ showAuthorMerge: false });
            }}
            apply={(mergedAuthorList, otherAuthors) => {
              this.props.onMergedAuthorListChanged(mergedAuthorList);
              this.props.onOtherAuthorListChanged(otherAuthors);
              this.setState({ showAuthorMerge: false, mergedAuthorList: mergedAuthorList, otherAuthors: otherAuthors });
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
          <AuthorList
            palette={this.props.palette}
            authorList={this.state.mergedAuthorList}
            otherAuthors={this.state.otherAuthors}
            selectedAuthors={this.props.selectedAuthors}
            selectionChanged={(newSelection) => {
              this.props.onAuthorSelectionChanged(newSelection);
            }}></AuthorList>
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

'use-strict';

import React from 'react';
import TabCombo from '../../components/TabCombo';
import * as styles from './styles.module.scss';
import { connect } from 'react-redux';
import { setGroup, setMergeRequests } from './sagas';

interface Props {
  codeReviewMetricsState: any;
  setMergeRequests: (settings: any) => void;
  setGroup: (settings: any) => void;
}

class ConfigComponent extends React.Component<Props> {
  onClickMergeRequests = (settings) => {
    this.props.setMergeRequests(settings);
  };

  onClickGroup = (settings) => {
    this.props.setGroup(settings);
  };

  render() {
    return (
      <div className={styles.configContainer}>
        <div className={styles.field}>
          <h2>Grouping</h2>
          <div className="control">
            <TabCombo
              options={[
                { label: 'Category', icon: 'folder', value: 'category' },
                { label: 'Single', icon: 'cube', value: 'single' },
                { label: 'Cumulative', icon: 'cubes', value: 'cumulative' },
              ]}
              value={this.props.codeReviewMetricsState.config.showMergeRequests}
              onChange={(value) => this.onClickMergeRequests(value)}
            />
          </div>
        </div>

        {this.props.codeReviewMetricsState.config.showMergeRequests === 'cumulative' && (
          <div className={styles.field}>
            <h2>Granularity</h2>
            <div className="control">
              <TabCombo
                options={[
                  { label: 'Hour', icon: 'h', value: 'hour' },
                  { label: 'Day', icon: 'd', value: 'day' },
                  { label: 'Month', icon: 'm', value: 'month' },
                  { label: 'Year', icon: 'y', value: 'year' },
                ]}
                value={this.props.codeReviewMetricsState.config.group}
                onChange={(value) => this.onClickGroup(value)}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  codeReviewMetricsState: state.visualizations.codeReviewMetrics.state,
});

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return { setMergeRequests: (mergeRequest) => dispatch(setMergeRequests(mergeRequest)), setGroup: (group) => dispatch(setGroup(group)) };
};

export default connect(mapStateToProps, mapDispatchToProps)(ConfigComponent);

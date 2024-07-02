'use-strict';

import React from 'react';
import TabCombo from '../../components/TabCombo';
import * as styles from './styles.module.scss';
import { connect } from 'react-redux';
import { setGranularity, setGrouping } from './sagas';

interface Props {
  mergeRequestLifeCycleState: any;
  setGrouping: (settings: any) => void;
  setGranularity: (settings: any) => void;
}

class ConfigComponent extends React.Component<Props> {
  onClickGrouping = (group) => {
    this.props.setGrouping(group);
  };

  onClickGranularity = (granularity) => {
    this.props.setGranularity(granularity);
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
              value={this.props.mergeRequestLifeCycleState.config.grouping}
              onChange={(value) => this.onClickGrouping(value)}
            />
          </div>
        </div>

        {this.props.mergeRequestLifeCycleState.config.grouping === 'cumulative' && (
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
                value={this.props.mergeRequestLifeCycleState.config.granularity}
                onChange={(value) => this.onClickGranularity(value)}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mergeRequestLifeCycleState: state.visualizations.mergeRequestLifeCycle.state,
});

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return { setGrouping: (group) => dispatch(setGrouping(group)), setGranularity: (granularity) => dispatch(setGranularity(granularity)) };
};

export default connect(mapStateToProps, mapDispatchToProps)(ConfigComponent);

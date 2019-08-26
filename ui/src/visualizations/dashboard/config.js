'use strict';

import Promise from 'bluebird';
import { connect } from 'react-redux';
import { setOverlay, setHighlightedIssue, setCommitAttribute } from './sagas';
import SearchBox from '../../components/SearchBox';
import TabCombo from '../../components/TabCombo.js';
import styles from './styles.scss';

import { graphQl } from '../../utils';
import LegendCompact from '../../components/LegendCompact';
import CheckboxLegend from '../../components/CheckboxLegend';

const mapStateToProps = (state /*, ownProps*/) => {
  const dashboardState = state.visualizations.dashboard.state;

  return {
    issues: dashboardState.data.issues,
    overlay: dashboardState.config.overlay,
    highlightedIssue: dashboardState.config.highlightedIssue,
    commitAttribute: dashboardState.config.commitAttribute
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onSetOverlay: overlay => dispatch(setOverlay(overlay)),
    onSetHighlightedIssue: issue => dispatch(setHighlightedIssue(issue)),
    onChangeCommitAttribute: attr => dispatch(setCommitAttribute(attr))
  };
};

const CodeOwnershipRiverConfigComponent = props => {
  var testArray = [{name: "dev1", color: "#fedfed", checked: true}, {name: "dev2", color: "#defdef", checked: true}, {name: "dev3", color: "#aaaaaa", checked: true}];
  return (
    <div className={styles.configContainer}>
      <form>
        <div className={styles.field}>
          <div className="control">
            <label className="label">General Settings</label>
            <p className="field">Chart resolution:</p>
            <TabCombo
              value={'years'}
              options={[
                {label: 'Years', icon: '', value: 'years'},
                {label: 'Months', icon: '', value: 'months'},
                {label: 'Weeks', icon: '', value: 'weeks'},
                {label: 'Days', icon: '', value: 'days'}
              ]}
            />
          </div>
        </div>
        <div className={styles.field}>
          <div className="control">
            <label className="label">CI Builds</label>
            <LegendCompact text="failed" color="#db303a"/>
            <LegendCompact text="succeeded" color="#50ff5a"/>
            <label className={styles.checkboxLabel}><input name="showDevsInCI" type="checkbox"/> Show developers in CI Builds</label>
          </div>
        </div>
        <div className={styles.field}>
          <div className="control">
            <label className="label">Issues</label>
            <LegendCompact text="opened" color="#3461eb"/>
            <LegendCompact text="closed" color="#8099e8"/>
            <label className="label">Show issues:</label>
            <TabCombo
              value={'all'}
              options={[
                {label: 'All', icon: '', value: 'all'},
                {label: 'Open', icon: '', value: 'open'},
                {label: 'Closed', icon: '', value: 'closed'}
              ]}
            />
          </div>
        </div>
        <div className={styles.field}>
          <div className="control">
            <label className="label">Changes</label>
            <CheckboxLegend content={testArray}/>
            <label className="label">Change Measurement:</label>
            <TabCombo
              value={'linesChanged'}
              options={[
                {label: '# lines changed', icon: '', value: 'linesChanged'},
                {label: '# commits', icon: '', value: 'commits'}
              ]}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

const CodeOwnershipRiverConfig = connect(mapStateToProps, mapDispatchToProps)(
  CodeOwnershipRiverConfigComponent
);

export default CodeOwnershipRiverConfig;

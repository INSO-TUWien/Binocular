'use strict';

import Promise from 'bluebird';
import { connect } from 'react-redux';
import { setDepth, setMeanPercentageOfCombinedCommitsThreshold, setMeanPercentageOfMaxCommitsThreshold } from './sagas';
import SearchBox from '../../components/SearchBox';
import TabCombo from '../../components/TabCombo.js';
import styles from './styles.scss';

import { graphQl } from '../../utils';

const mapStateToProps = (state /*, ownProps*/) => {
  const dgState = state.visualizations.dependencyGraph.state;

  return {
    depth: dgState.config.depth,
    meanPercentageOfCombinedCommitsThreshold: dgState.config.meanPercentageOfCombinedCommitsThreshold,
    meanPercentageOfMaxCommitsThreshold: dgState.config.meanPercentageOfMaxCommitsThreshold
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onSetDepth: depth => dispatch(setDepth(depth)),
    onSetMeanPercentageOfCombinedCommitsThreshold: meanPercentageOfCombinedCommitsThreshold => dispatch(setMeanPercentageOfCombinedCommitsThreshold(meanPercentageOfCombinedCommitsThreshold)),
    onSetMeanPercentageOfMaxCommitsThreshold: meanPercentageOfMaxCommitsThreshold => dispatch(setMeanPercentageOfMaxCommitsThreshold(meanPercentageOfMaxCommitsThreshold))
  };
};

const DependencyGraphConfigComponent = props => {
  return (
    <div className={styles.configContainer}>
      <form className={styles.form}>
        <div className={styles.field}>
        <label className="label">Depth:</label>
          <div className="control">
            <div className="select">
              <select
                value={props.depth}
                onChange={evt => props.onSetDepth(evt.target.value)}>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
              </select>
            </div>
          </div>
        </div>
        <div className={styles.field}>
        <label className="label">Mean percentage of combined commits threshold:</label>
          <div className="control">
            <div className="input">
              <input type="number" value={props.meanPercentageOfCombinedCommitsThreshold} onChange={evt => props.onSetMeanPercentageOfCombinedCommitsThreshold(evt.target.value)}/>
            </div>
          </div>
        </div>
        <div className={styles.field}>
        <label className="label">Mean percentage of max commits threshold:</label>
          <div className="control">
            <div className="input">
              <input type="number" value={props.meanPercentageOfMaxCommitsThreshold} onChange={evt => props.onSetMeanPercentageOfMaxCommitsThreshold(evt.target.value)}/>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

const DependencyGraphConfig = connect(mapStateToProps, mapDispatchToProps)(
  DependencyGraphConfigComponent
);

export default DependencyGraphConfig;

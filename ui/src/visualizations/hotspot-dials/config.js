'use strict';

import { connect } from 'react-redux';
import { Tooltip } from 'react-tippy';

import { setCategory, setSplitCommits } from './sagas';

import styles from './styles.scss';

const mapStateToProps = (state /*, ownProps*/) => {
  const hdState = state.visualizations.hotspotDials.state;

  return {
    category: hdState.config.category,
    splitCommits: hdState.config.splitCommits
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onSetCategory: cat => dispatch(setCategory(cat)),
    onSetSplitCommits: b => dispatch(setSplitCommits(b))
  };
};

const HotspotDialsConfigComponent = props => {
  return (
    <div className={styles.configContainer}>
      <form>
        <div className="field">
          <label className="label">Granularity:</label>
          <div className="control">
            <div className="select">
              <select
                value={props.category}
                onChange={evt => props.onSetCategory(evt.target.value)}>
                <option value="hour">By hour</option>
                <option value="dayOfWeek">By day of week</option>
                <option value="month">By month</option>
              </select>
            </div>
          </div>
        </div>
        <div className="field">
          <label className="label">Display:</label>
          <Tooltip
            position="bottom"
            arrow={true}
            arrowSize="big"
            theme="transparent"
            title="A commit is considered good if there exists at least one successful build in the CI-system">
            <label className="checkbox" htmlFor="split-commits">
              <input
                type="checkbox"
                id="split-commits"
                checked={props.splitCommits}
                onChange={e => props.onSetSplitCommits(e.target.checked)}
              />
              Split commits into good and bad
              <sup className="fa fa-question-circle" aria-hidden="true" />
            </label>
          </Tooltip>
        </div>
      </form>
    </div>
  );
};

const HotspotDialsConfig = connect(mapStateToProps, mapDispatchToProps)(
  HotspotDialsConfigComponent
);

export default HotspotDialsConfig;

'use-strict';

import { useDispatch, useSelector } from 'react-redux';
import { setSplitChanges, setSplitCommits, setSplitIssues } from '../sagas';
import styles from '../styles.scss';

export default () => {
  const distributionDialsState = useSelector((state) => state.visualizations.distributionDials.state);
  const splitCommits = distributionDialsState.config.splitCommits;
  const splitChanges = distributionDialsState.config.splitChanges;
  const splitIssues = distributionDialsState.config.splitIssues;

  const dispatch = useDispatch();

  const onSplitCommits = (val) => {
    dispatch(setSplitCommits(val));
  };

  const onSplitChanges = (val) => {
    dispatch(setSplitChanges(val));
  };

  const onSplitIssues = (val) => {
    dispatch(setSplitIssues(val));
  };

  return (
    <>
      <div className="field">
        <input
          id="splitCommitsSwitch"
          type="checkbox"
          name="splitCommitsSwitch"
          className={'switch is-rounded is-outlined is-info'}
          defaultChecked={splitCommits}
          onChange={(e) => onSplitCommits(e.target.checked)}
        />
        <label htmlFor="splitCommitsSwitch" className={styles.switch}>
          Split Commits
        </label>
      </div>

      <div className="field">
        <input
          id="splitChangesSwitch"
          type="checkbox"
          name="splitChangesSwitch"
          className={'switch is-rounded is-outlined is-info'}
          defaultChecked={splitChanges}
          onChange={(e) => onSplitChanges(e.target.checked)}
        />
        <label htmlFor="splitChangesSwitch" className={styles.switch}>
          Split Changes
        </label>
      </div>

      <div className="field">
        <input
          id="splitIssuesSwitch"
          type="checkbox"
          name="splitIssuesSwitch"
          className={'switch is-rounded is-outlined is-info'}
          defaultChecked={splitIssues}
          onChange={(e) => onSplitIssues(e.target.checked)}
        />
        <label htmlFor="splitIssuesSwitch" className={styles.switch}>
          Split Issues
        </label>
      </div>
    </>
  );
};

'use-strict';

import { useDispatch, useSelector } from 'react-redux';
import {
  setColorSegments,
  setFilterCommitsChanges,
  setFilterCommitsChangesCutoff,
  setLayers,
  setSelectLayers,
  setSplitLayers,
} from '../sagas';
import styles from '../styles.module.scss';
import DragAndDropList from '../../../components/DragAndDropList/dragAndDropList';

export default () => {
  const distributionDialsState = useSelector((state) => state.visualizations.distributionDials.state);
  const layers = distributionDialsState.config.layers;
  const layersSelected = distributionDialsState.config.layersSelected;
  const layersSplit = distributionDialsState.config.layersSplit;
  const filterCommitsChanges = distributionDialsState.config.filterCommitsChanges;
  const filterCommitsChangesCutoff = distributionDialsState.config.filterCommitsChangesCutoff;
  const colorSegments = distributionDialsState.config.colorSegments;

  const dispatch = useDispatch();

  const onPositionChange = (list) => {
    dispatch(setLayers(list));
  };

  const onCheck = (element) => {
    if (layersSelected.includes(element)) {
      dispatch(setSelectLayers(layersSelected.filter((e) => e !== element)));
    } else {
      dispatch(setSelectLayers(layersSelected.concat([element])));
    }
  };

  const onSwitch = (element) => {
    if (layersSplit.includes(element)) {
      dispatch(setSplitLayers(layersSplit.filter((e) => e !== element)));
    } else {
      dispatch(setSplitLayers(layersSplit.concat([element])));
    }
  };

  const onFilterCommits = (checked) => {
    dispatch(setFilterCommitsChanges(checked));
  };

  const onSetChangesCutoff = (value) => {
    if (value && value > 0) {
      dispatch(setFilterCommitsChangesCutoff(value));
    }
  };

  const onSetColorSegments = (value) => {
    dispatch(setColorSegments(value));
  };

  return (
    <div className={styles.configContainer}>
      <div className={styles.field}>
        <p>
          <b>Drag to change order:</b>
        </p>
        <DragAndDropList
          elements={layers}
          onPositionChange={onPositionChange}
          onCheck={onCheck}
          checkedElements={layersSelected}
          onSwitch={onSwitch}
          switchedElements={layersSplit}
          switchLabel="Split"
        />
      </div>

      <div className={styles.field}>
        <p>
          <b>Filters:</b>
        </p>
        <input
          id="filterCommitsSwitch"
          type="checkbox"
          name="filterCommitsSwitch"
          className={'switch is-rounded is-outlined is-info'}
          defaultChecked={filterCommitsChanges}
          onChange={(e) => onFilterCommits(e.target.checked)}
        />
        <label htmlFor="filterCommitsSwitch" className={styles.switch}>
          Exclude Commits with a set number of changed lines
        </label>
        <div>
          <label htmlFor="filterCommitsCutoffInput">Set changes cutoff for filtering commits:</label>
          <input
            id="filterCommitsCutoffInput"
            type="number"
            name="filterCommitsCutoffInput"
            className="input"
            defaultValue={filterCommitsChangesCutoff}
            disabled={!filterCommitsChanges}
            onChange={(e) => onSetChangesCutoff(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.field}>
        <p>
          <b>Colors:</b>
        </p>
        <input
          id="colorSegmentsSwitch"
          type="checkbox"
          name="colorSegmentsSwitch"
          className={'switch is-rounded is-outlined is-info'}
          defaultChecked={colorSegments}
          onChange={(e) => onSetColorSegments(e.target.checked)}
        />
        <label htmlFor="colorSegmentsSwitch" className={styles.switch}>
          Color segments in colors of authors with the most contributions
        </label>
      </div>
    </div>
  );
};

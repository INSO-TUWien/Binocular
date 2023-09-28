'use-strict';

import { useDispatch, useSelector } from 'react-redux';
import { setLayers, setSelectLayers, setSplitLayers } from '../sagas';
import styles from '../styles.scss';
import DragAndDropList from '../../../components/DragAndDropList/dragAndDropList';

export default () => {
  const distributionDialsState = useSelector((state) => state.visualizations.distributionDials.state);
  const layers = distributionDialsState.config.layers;
  const layersSelected = distributionDialsState.config.layersSelected;
  const layersSplit = distributionDialsState.config.layersSplit;

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

  return (
    <div className={styles.configContainer}>
      <p>
        <b>Drag to change order:</b>
      </p>
      <div className="field">
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
    </div>
  );
};

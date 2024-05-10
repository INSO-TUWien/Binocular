import { visualizationPlugins } from '../../../../plugins/pluginRegistry.ts';
import visualizationSelectorStyles from './visualizationSelector.module.scss';
import { addDashboardItem, placeDashboardItem } from '../../../../redux/DashboardReducer.ts';
import { AppDispatch, useAppDispatch } from '../../../../redux';

function VisualizationSelector() {
  const dispatch: AppDispatch = useAppDispatch();

  return (
    <div className={'text-xs'}>
      <div className={visualizationSelectorStyles.selector}>
        {visualizationPlugins.map((plugin, i) => {
          return (
            <div
              key={'VisualizationSelectorV' + i}
              className={visualizationSelectorStyles.visualizationButton}
              onClick={() => {
                dispatch(addDashboardItem({ id: 0, x: 0, y: 0, width: 5, height: 4 }));
              }}
              onMouseDown={() => {
                dispatch(placeDashboardItem({ id: 0, x: 0, y: 0, width: 5, height: 4 }));
              }}>
              <img draggable={'false'} src={plugin.images.preview} alt={plugin.name} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VisualizationSelector;

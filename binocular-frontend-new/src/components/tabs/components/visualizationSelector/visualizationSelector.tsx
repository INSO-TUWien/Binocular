import { visualizationPlugins } from '../../../../plugins/pluginRegistry.ts';
import visualizationSelectorStyles from './visualizationSelector.module.scss';
import { addDashboardItem, placeDashboardItem } from '../../../../redux/general/dashboardReducer.ts';
import { AppDispatch, useAppDispatch } from '../../../../redux';

function VisualizationSelector(props: { orientation?: string }) {
  const dispatch: AppDispatch = useAppDispatch();

  return (
    <div className={'text-xs'}>
      <div
        className={
          visualizationSelectorStyles.selector +
          ' ' +
          (props.orientation === 'horizontal'
            ? visualizationSelectorStyles.selectorHorizontal
            : visualizationSelectorStyles.selectorVertical)
        }>
        {visualizationPlugins.map((plugin, i) => {
          return (
            <div
              key={'VisualizationSelectorV' + i}
              className={visualizationSelectorStyles.visualizationButton}
              onClick={() => {
                dispatch(addDashboardItem({ id: 0, x: 0, y: 0, width: 12, height: 8, pluginName: plugin.name }));
              }}
              onMouseDown={() => {
                dispatch(
                  placeDashboardItem({
                    id: 0,
                    x: 0,
                    y: 0,
                    width: 12,
                    height: 8,
                    pluginName: plugin.name,
                  }),
                );
              }}>
              <div>
                <img draggable={'false'} src={plugin.images.thumbnail} alt={plugin.name} />
                <span>{plugin.name}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VisualizationSelector;

import { visualizationPlugins } from '../../../../plugins/pluginRegistry.ts';
import visualizationSelectorStyles from './visualizationSelector.module.scss';
import { Icon } from '../../../icon';
import { showVisualizationOverview } from './visualizationOverview/visualizationOverviewHelper.ts';
import VisualizationSelectorDragButton from './visualizationSelectorDragButton/visualizationSelectorDragButton.tsx';
function VisualizationSelector(props: { orientation?: string }) {
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
        <div className={visualizationSelectorStyles.selectorRow}>
          {visualizationPlugins
            .filter((plugin) => plugin.metadata.recommended === true)
            .map((plugin, i) => {
              return (
                <VisualizationSelectorDragButton
                  key={'VisualizationSelectorV' + i}
                  plugin={plugin}
                  disabled={false}
                  showHelp={false}></VisualizationSelectorDragButton>
              );
            })}
        </div>
        <button className="btn btn-square btn-primary btn-sm" onClick={(e) => showVisualizationOverview(e.clientX, e.clientY)}>
          <Icon name="visualizations" size="w-6 h-6" colorClass="primary-content" />
        </button>
      </div>
    </div>
  );
}

export default VisualizationSelector;

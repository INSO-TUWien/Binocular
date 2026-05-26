import visualizationSelectorStyles from '../visualizationSelector.module.scss';
import { addDashboardItem, placeDashboardItem } from '../../../../../redux/reducer/general/dashboardReducer.ts';
import { DragDropElementType } from '../../../../../types/general/dragDropElementType.ts';
import type { VisualizationPlugin } from '../../../../../plugins/interfaces/visualizationPlugin.ts';
import { type AppDispatch, type RootState, useAppDispatch } from '../../../../../redux';
import { useSelector } from 'react-redux';
import type { DatabaseSettingsDataPluginType } from '../../../../../types/settings/databaseSettingsType.ts';
import { Icon } from '../../../../icon';
import { showInfoTooltip } from '../../../../infoTooltip/infoTooltipHelper';
import InfoTooltip from '../../../../infoTooltip/infoTooltip';
import { useRef } from 'react';

function VisualizationSelectorDragButton(props: { plugin: VisualizationPlugin<unknown, unknown>; disabled: boolean; showHelp: boolean }) {
  const dispatch: AppDispatch = useAppDispatch();
  const configuredDataPlugins = useSelector((state: RootState) => state.settings.database.dataPlugins);
  const defaultDataPlugin = configuredDataPlugins.filter((dP: DatabaseSettingsDataPluginType) => dP.isDefault)[0];

  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipVisibleFlagRef = useRef(false);

  return (
    <>
      <InfoTooltip ref={tooltipRef} tooltipVisibleFlagRef={tooltipVisibleFlagRef}></InfoTooltip>
      <button
        draggable={!props.disabled}
        className={
          props.disabled ? visualizationSelectorStyles.disabledVisualizationButton : visualizationSelectorStyles.visualizationButton
        }
        onClick={() => {
          if (!props.disabled) {
            dispatch(
              addDashboardItem({
                id: 0,
                width: props.plugin.metadata.defaultSize ? props.plugin.metadata.defaultSize[0] : 12,
                height: props.plugin.metadata.defaultSize ? props.plugin.metadata.defaultSize[1] : 8,
                pluginName: props.plugin.name,
                dataPluginId: defaultDataPlugin ? defaultDataPlugin.id : undefined,
              }),
            );
          }
        }}
        onDragStart={(event) => {
          event.dataTransfer.clearData();
          event.dataTransfer.setData('data', JSON.stringify({ dragDropElementType: DragDropElementType.Visualization }));
          dispatch(
            placeDashboardItem({
              id: 0,
              x: 0,
              y: 0,
              width: props.plugin.metadata.defaultSize ? props.plugin.metadata.defaultSize[0] : 12,
              height: props.plugin.metadata.defaultSize ? props.plugin.metadata.defaultSize[1] : 8,
              pluginName: props.plugin.name,
              dataPluginId: defaultDataPlugin ? defaultDataPlugin.id : undefined,
            }),
          );
        }}>
        <div className={'relative'}>
          <img draggable={'false'} src={props.plugin.images.thumbnail} alt={props.plugin.name} />
          <span>{props.plugin.name}</span>
          {props.plugin.metadata.description && props.showHelp && (
            <div
              className={visualizationSelectorStyles.visualizationHelpButton}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                showInfoTooltip(tooltipRef, tooltipVisibleFlagRef, e.clientX, e.clientY, {
                  headline: props.plugin.name,
                  textContent: props.plugin.metadata.description ?? '',
                  reactContent: props.plugin.metadata.compatibility && (
                    <>
                      <p className="font-bold mt-2 mb-1">Compatibility</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <span className="font-semibold col-span-2">Datatypes</span>
                        <span>GitHub</span>
                        <span>
                          {props.plugin.metadata.compatibility.github ? (
                            <span className="text-success text-lg">●</span>
                          ) : (
                            <span className="text-base-content/30 text-lg">●</span>
                          )}
                        </span>
                        <span>GitLab</span>
                        <span>
                          {props.plugin.metadata.compatibility.gitlab ? (
                            <span className="text-success text-lg">●</span>
                          ) : (
                            <span className="text-base-content/30 text-lg">●</span>
                          )}
                        </span>
                        <span className="font-semibold col-span-2 mt-1">Databases</span>
                        <span>Binocular Backend</span>
                        <span>
                          {props.plugin.metadata.compatibility.binocularBackend ? (
                            <span className="text-success text-lg">●</span>
                          ) : (
                            <span className="text-base-content/30 text-lg">●</span>
                          )}
                        </span>
                        <span>PouchDB</span>
                        <span>
                          {props.plugin.metadata.compatibility.pouchDB ? (
                            <span className="text-success text-lg">●</span>
                          ) : (
                            <span className="text-base-content/30 text-lg">●</span>
                          )}
                        </span>
                        <span>Mock Data</span>
                        <span>
                          {props.plugin.metadata.compatibility.mockData ? (
                            <span className="text-success text-lg">●</span>
                          ) : (
                            <span className="text-base-content/30 text-lg">●</span>
                          )}
                        </span>
                        <span>GitHub API</span>
                        <span>
                          {props.plugin.metadata.compatibility.githubAPI ? (
                            <span className="text-success text-lg">●</span>
                          ) : (
                            <span className="text-base-content/30 text-lg">●</span>
                          )}
                        </span>
                      </div>
                    </>
                  ),
                });
              }}>
              <Icon name="help" colorClass="primary" />
            </div>
          )}
        </div>
      </button>
    </>
  );
}

export default VisualizationSelectorDragButton;

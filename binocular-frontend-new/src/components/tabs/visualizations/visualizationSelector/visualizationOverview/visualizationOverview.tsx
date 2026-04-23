import visualizationOverviewStyles from './visualizationOverview.module.scss';
import {
  type VisualizationPluginCompatibility,
  VisualizationPluginMetadataCategory,
} from '../../../../../plugins/interfaces/visualizationPluginInterfaces/visualizationPluginMetadata.ts';
import { visualizationPlugins } from '../../../../../plugins/pluginRegistry.ts';
import { useState } from 'react';
import VisualizationSelectorDragButton from '../visualizationSelectorDragButton/visualizationSelectorDragButton.tsx';
import { disableVisualizationOverview } from './visualizationOverviewHelper';
import VisualizationFilter from '../visualizationFilter/visualizationFilter';

function VisualizationOverview() {
  const [search, setSearch] = useState<string>('');

  const [filterOptions, setFilterOptions] = useState<VisualizationPluginCompatibility>({
    binocularBackend: false,
    githubAPI: false,
    mockData: false,
    pouchDB: false,
    github: false,
    gitlab: false,
  });

  return (
    <dialog
      id={'visualizationOverview'}
      className={visualizationOverviewStyles.visualizationOverview}
      onMouseMove={() => {
        (document.getElementById('visualizationOverview') as HTMLDialogElement).close();
      }}
      onChange={(e) => e.preventDefault()}>
      <div
        id={'visualizationOverviewPositionController'}
        onMouseMove={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onDragLeave={() => {
          (document.getElementById('visualizationOverview') as HTMLDialogElement).close();
        }}>
        <div className={visualizationOverviewStyles.visualizationOverviewContent}>
          <div>
            <h1>Visualizations:</h1>
            <div className={visualizationOverviewStyles.visualizationOverviewContentInner}>
              <label className="input input-bordered flex items-center gap-2 flex-1">
                <input type="text" className="grow" placeholder="Search" onChange={(e) => setSearch(e.target.value)} />
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 opacity-70">
                  <path
                    fillRule="evenodd"
                    d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                    clipRule="evenodd"
                  />
                </svg>
              </label>
              <VisualizationFilter filterOptions={filterOptions} setFilterOptions={setFilterOptions}></VisualizationFilter>
            </div>
            {Object.values(VisualizationPluginMetadataCategory).map((category) => {
              const filteredPlugins = visualizationPlugins.filter(
                (plugin) => plugin.metadata.category === category && plugin.name.toLocaleLowerCase().includes(search.toLowerCase()),
              );
              if (filteredPlugins.length === 0) return null;

              return (
                <div key={category}>
                  <h2>{category}</h2>
                  <div className="card">
                    <div className={visualizationOverviewStyles.selectorRow}>
                      {filteredPlugins.map((plugin, i) => {
                        return (
                          <VisualizationSelectorDragButton
                            key={'VisualizationSelectorV' + i}
                            plugin={plugin}
                            disabled={disableVisualizationOverview(filterOptions, plugin.metadata.compatibility)}
                            showHelp={true}></VisualizationSelectorDragButton>
                        );
                      })}
                    </div>
                  </div>
                  <div className="divider h-1px m-2"></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </dialog>
  );
}

export default VisualizationOverview;

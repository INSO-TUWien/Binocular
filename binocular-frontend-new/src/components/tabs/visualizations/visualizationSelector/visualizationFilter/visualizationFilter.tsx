import VisualizationFilterStyles from './visualizationFilter.module.scss';
import { useState } from 'react';
import type { VisualizationPluginCompatibility } from '../../../../../plugins/interfaces/visualizationPluginInterfaces/visualizationPluginMetadata';
import type { DatabaseSettingsDataPluginType } from '../../../../../types/settings/databaseSettingsType';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../../redux';

function VisualizationFilter(props: {
  filterOptions: VisualizationPluginCompatibility;
  setFilterOptions: (filterOptions: VisualizationPluginCompatibility) => void;
}) {
  const [databases, setDatabases] = useState<boolean>(false);
  const [datatypes, setDatatypes] = useState<boolean>(false);
  const configuredDataPlugins = useSelector((state: RootState) => state.settings.database.dataPlugins);
  const defaultDataPlugin = configuredDataPlugins.filter((dP: DatabaseSettingsDataPluginType) => dP.isDefault)[0];

  return (
    <div className={VisualizationFilterStyles.filters}>
      <div className={VisualizationFilterStyles.filterGroup}>
        <button
          className={`btn btn-xs ${datatypes ? 'btn-primary' : 'btn-ghost border border-base-300'}`}
          onClick={() => {
            setDatatypes(!datatypes);
            setDatabases(false);
          }}>
          Datatypes
        </button>
        {datatypes && (
          <div className={`${VisualizationFilterStyles.filterDropdown} bg-base-100 shadow-lg border border-base-300`}>
            <label className="label cursor-pointer flex w-full items-center mt-0.5">
              <span className="label-text">Github data:</span>
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                defaultChecked={props.filterOptions.github}
                key={'github' + props.filterOptions.github}
                onChange={(event) => {
                  props.setFilterOptions({
                    binocularBackend: props.filterOptions.binocularBackend,
                    githubAPI: props.filterOptions.githubAPI,
                    mockData: props.filterOptions.mockData,
                    pouchDB: props.filterOptions.pouchDB,
                    github: event.target.checked,
                    gitlab: props.filterOptions.gitlab,
                  });
                }}
              />
            </label>
            <label className="label cursor-pointer flex w-full items-center mt-0.5">
              <span className="label-text">GitLab data:</span>
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                defaultChecked={props.filterOptions.gitlab}
                key={'gitlab' + props.filterOptions.gitlab}
                onChange={(event) => {
                  props.setFilterOptions({
                    binocularBackend: props.filterOptions.binocularBackend,
                    githubAPI: props.filterOptions.githubAPI,
                    mockData: props.filterOptions.mockData,
                    pouchDB: props.filterOptions.pouchDB,
                    github: props.filterOptions.github,
                    gitlab: event.target.checked,
                  });
                }}
              />
            </label>
          </div>
        )}
      </div>

      <div className={VisualizationFilterStyles.filterGroup}>
        <button
          className={`btn btn-xs ${databases ? 'btn-primary' : 'btn-ghost border border-base-300'}`}
          onClick={() => {
            setDatabases(!databases);
            setDatatypes(false);
          }}>
          Databases
        </button>
        {databases && (
          <div className={`${VisualizationFilterStyles.filterDropdown} bg-base-100 shadow-lg border border-base-300`}>
            <label className="label cursor-pointer flex w-full items-center mt-0.5">
              <span className="label-text">Binocular Backend:</span>
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                defaultChecked={props.filterOptions.binocularBackend}
                key={'binocularBackend' + props.filterOptions.binocularBackend}
                onChange={(event) => {
                  props.setFilterOptions({
                    binocularBackend: event.target.checked,
                    githubAPI: props.filterOptions.githubAPI,
                    mockData: props.filterOptions.mockData,
                    pouchDB: props.filterOptions.pouchDB,
                    github: props.filterOptions.github,
                    gitlab: props.filterOptions.gitlab,
                  });
                }}
              />
            </label>
            <label className="label cursor-pointer flex w-full items-center mt-0.5">
              <span className="label-text">PouchDB:</span>
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                defaultChecked={props.filterOptions.pouchDB}
                key={'pouchDB' + props.filterOptions.pouchDB}
                onChange={(event) => {
                  props.setFilterOptions({
                    binocularBackend: props.filterOptions.binocularBackend,
                    githubAPI: props.filterOptions.githubAPI,
                    mockData: props.filterOptions.mockData,
                    pouchDB: event.target.checked,
                    github: props.filterOptions.github,
                    gitlab: props.filterOptions.gitlab,
                  });
                }}
              />
            </label>
            <label className="label cursor-pointer flex w-full items-center mt-0.5">
              <span className="label-text">Mock Data:</span>
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                defaultChecked={props.filterOptions.mockData}
                key={'mockData' + props.filterOptions.mockData}
                onChange={(event) => {
                  props.setFilterOptions({
                    binocularBackend: props.filterOptions.binocularBackend,
                    githubAPI: props.filterOptions.githubAPI,
                    mockData: event.target.checked,
                    pouchDB: props.filterOptions.pouchDB,
                    github: props.filterOptions.github,
                    gitlab: props.filterOptions.gitlab,
                  });
                }}
              />
            </label>
            <label className="label cursor-pointer flex w-full items-center mt-0.5">
              <span className="label-text">Github API:</span>
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                defaultChecked={props.filterOptions.githubAPI}
                key={'githubAPI' + props.filterOptions.githubAPI}
                onChange={(event) => {
                  props.setFilterOptions({
                    binocularBackend: props.filterOptions.binocularBackend,
                    githubAPI: event.target.checked,
                    mockData: props.filterOptions.mockData,
                    pouchDB: props.filterOptions.pouchDB,
                    github: props.filterOptions.github,
                    gitlab: props.filterOptions.gitlab,
                  });
                }}
              />
            </label>
          </div>
        )}
      </div>

      <button className="btn btn-xs btn-ghost border border-base-300" onClick={() => setDefaultFilter(defaultDataPlugin)}>
        Auto detect
      </button>
    </div>
  );

  function setDefaultFilter(defaultDataPlugin: DatabaseSettingsDataPluginType) {
    props.setFilterOptions({
      binocularBackend: defaultDataPlugin.name.includes('Binocular Backend'),
      githubAPI: defaultDataPlugin.name.includes('Github'),
      mockData: defaultDataPlugin.name.includes('Mock Data'),
      pouchDB: defaultDataPlugin.name.includes('PouchDb'),
      // a way to automatically detect data type is not implemented yet
      // TODO: implement feature once implemented
      github: defaultDataPlugin.metadata?.type ? defaultDataPlugin.metadata.type == 'github' : false,
      gitlab: defaultDataPlugin.metadata?.type ? defaultDataPlugin.metadata.type == 'gitlab' : false,
    });
  }
}

export default VisualizationFilter;

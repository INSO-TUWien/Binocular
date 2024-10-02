import statusBarStyles from './statusBar.module.scss';
import StatusBarSeparator from './statusBarSeparator.tsx';
import { dataPlugins } from '../../plugins/pluginRegistry.ts';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux';
import { useEffect, useState } from 'react';
import { DataPluginIndexer, DataPluginIndexerState } from '../../plugins/interfaces/dataPluginInterfaces/dataPluginGeneral.ts';
import ConnectedToApi from '../../assets/connected_to_api_blue.svg';
import ConnectedToApiFailed from '../../assets/connected_to_api_failed_red.svg';
import CheckedCircle from '../../assets/check_circle_blue.svg';
import Idle from '../../assets/idle_blue.svg';
import { DatabaseSettingsDataPluginType } from '../../types/settings/databaseSettingsType.ts';

function StatusBar() {
  const currentDataPlugins = useSelector((state: RootState) => state.settings.database.dataPlugins);

  const [indexer, setIndexer] = useState<DataPluginIndexer>();
  const [indexerState, setIndexerState] = useState<DataPluginIndexerState>();
  const [repository, setRepository] = useState<string>();

  useEffect(() => {
    const defaultDataPlugin = currentDataPlugins.filter((dP: DatabaseSettingsDataPluginType) => dP.isDefault)[0];
    if (defaultDataPlugin) {
      const dataPlugin = dataPlugins.map((pluginClass) => new pluginClass()).filter((plugin) => plugin.name === defaultDataPlugin.name)[0];
      if (dataPlugin) {
        setIndexer(dataPlugin.general.getIndexer());
        setIndexerState(dataPlugin.general.getIndexerState());
        dataPlugin.general
          .getRepositoryName()
          .then((name) => setRepository(name))
          .catch((e) => console.log(e));
      }
    }
  }, [currentDataPlugins]);

  if (currentDataPlugins.length === 0) {
    return (
      <>
        <div className={statusBarStyles.statusBar}>
          <div className={statusBarStyles.statusLeft}>No DataPlugins Configured</div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={statusBarStyles.statusBar}>
        <div className={statusBarStyles.statusLeft}>
          <span className={statusBarStyles.text}>VCS: {indexer?.vcs}</span>
          <StatusBarSeparator direction={'diagonal'}></StatusBarSeparator>
          <span className={statusBarStyles.text}>ITS: {indexer?.its}</span>
          <StatusBarSeparator direction={'diagonal'}></StatusBarSeparator>
          <span className={statusBarStyles.text}>CI: {indexer?.ci}</span>
          <StatusBarSeparator direction={'horizontal'}></StatusBarSeparator>
          <span className={statusBarStyles.text}>Repository: {repository}</span>
        </div>
        <div className={statusBarStyles.statusRight}>
          {indexerState === DataPluginIndexerState.IDLE && (
            <span className={statusBarStyles.text}>
              Idle
              <img className={'inline h-5 ml-1'} src={Idle} alt={'idle'} />
            </span>
          )}
          {indexerState === DataPluginIndexerState.INDEXING && (
            <span className={statusBarStyles.text}>
              Indexing
              <span className="loading loading-spinner loading-xs text-accent"></span>
            </span>
          )}
          {indexerState === DataPluginIndexerState.FINISHED && (
            <span className={statusBarStyles.text}>
              Indexing Finished
              <img className={'inline h-5 ml-1'} src={CheckedCircle} alt={'indexing finished'} />
            </span>
          )}
          {indexerState === DataPluginIndexerState.CONNECTED && (
            <span className={statusBarStyles.text}>
              Connected
              <img className={'inline h-5 ml-1'} src={ConnectedToApi} alt={'connected to api'} />
            </span>
          )}
          {indexerState === DataPluginIndexerState.CONNECTION_FAILED && (
            <span className={statusBarStyles.text}>
              Connected
              <img className={'inline h-5 ml-1'} src={ConnectedToApiFailed} alt={'connected to api'} />
            </span>
          )}
        </div>
      </div>
    </>
  );
}

export default StatusBar;

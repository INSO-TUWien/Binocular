import statusBarStyles from './statusBar.module.scss';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux';
import type { DatabaseSettingsDataPluginType } from '../../types/settings/databaseSettingsType.ts';
import StatusBarDataPlugin from './statusBarDataPlugin/statusBarDataPlugin.tsx';

function StatusBar() {
  const currentDataPlugins = useSelector((state: RootState) => state.settings.database.dataPlugins);

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
          {currentDataPlugins.map((dataPlugin: DatabaseSettingsDataPluginType) => (
            <StatusBarDataPlugin key={dataPlugin.id} dataPlugin={dataPlugin} />
          ))}
        </div>
        <div className={statusBarStyles.statusRight}></div>
      </div>
    </>
  );
}

export default StatusBar;

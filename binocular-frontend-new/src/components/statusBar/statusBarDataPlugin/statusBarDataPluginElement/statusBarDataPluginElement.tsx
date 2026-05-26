import statusBarDataPluginElementStyles from './statusBarDataPluginElement.module.scss';
import type { DatabaseSettingsDataPluginType } from '../../../../types/settings/databaseSettingsType.ts';
import type { DataPlugin } from '../../../../plugins/interfaces/dataPlugin.ts';
import { useDispatch, useSelector } from 'react-redux';
import type { Store } from '@reduxjs/toolkit';
import { useEffect } from 'react';
import { SocketConnectionStatusType } from '../../../../types/general/socketConnectionType.ts';
import { Icon } from '../../../icon';
import { store as globalStore } from '../../../../redux';
import { updateDashboardItem } from '../../../../redux/reducer/general/dashboardReducer.ts';
import type { DashboardItemType } from '../../../../types/general/dashboardItemType.ts';
import { showConfirmationDialog } from '../../../confirmationDialog/confirmationDialog.tsx';
import { setDataPluginAsDefault } from '../../../../redux/reducer/settings/settingsReducer.ts';
import { addNotification } from '../../../../redux/reducer/general/notificationsReducer.ts';
import { AlertType } from '../../../../types/general/alertType.ts';
function StatusBarDataPlugin(props: {
  dataPluginConfig: DatabaseSettingsDataPluginType;
  dataPlugin: DataPlugin | undefined;
  store: Store;
}) {
  type RootState = ReturnType<typeof props.store.getState>;
  type AppDispatch = typeof props.store.dispatch;
  const useAppDispatch = () => useDispatch<AppDispatch>();
  const dispatch: AppDispatch = useAppDispatch();

  const progress = useSelector((state: RootState) => state.progress);
  const socketConnection = useSelector((state: RootState) => state.socketConnection);

  //Trigger Refresh when dataConnection changes
  useEffect(() => {
    dispatch({
      type: 'REFRESH',
    });
  }, [props.dataPlugin]);

  const handleUseForAll = (e: React.MouseEvent) => {
    showConfirmationDialog(e.clientX, e.clientY, 350, `Use "${props.dataPluginConfig.name}" for all visualizations?`, [
      {
        label: 'Apply to all',
        icon: null,
        function: () => {
          const dashboardItems: DashboardItemType[] = globalStore.getState().dashboard.dashboardItems;
          dashboardItems.forEach((item) => {
            globalStore.dispatch(updateDashboardItem({ ...item, dataPluginId: props.dataPluginConfig.id }));
          });
          (document.getElementById('contextMenu') as HTMLDialogElement).close();
        },
      },
      {
        label: 'Cancel',
        icon: null,
        function: () => {
          (document.getElementById('contextMenu') as HTMLDialogElement).close();
        },
      },
    ]);
  };

  return (
    <>
      <div className={statusBarDataPluginElementStyles.dataPluginElement}>
        <div className={statusBarDataPluginElementStyles.dataPluginLabel} style={{ background: props.dataPluginConfig.color }}>
          {props.dataPluginConfig.id === 0 ? (
            <span className={'flex items-center gap-3'}>
              {props.dataPluginConfig.name}
              <div className={statusBarDataPluginElementStyles.dataPluginLabelBadge}>pre-loaded</div>
            </span>
          ) : (
            <span>
              {props.dataPluginConfig.name} #{props.dataPluginConfig.id}
            </span>
          )}
          {socketConnection.status === SocketConnectionStatusType.Idle && <Icon name="idle" className={'inline h-4 ml-2'} />}
          {socketConnection.status === SocketConnectionStatusType.Connected && (
            <Icon name="connected_to_api" className={'inline h-4 ml-2'} />
          )}
          {socketConnection.status === SocketConnectionStatusType.Disconnected && (
            <Icon name="connected_to_api_failed" className={'inline h-4 ml-2'} />
          )}
        </div>
        {props.dataPluginConfig.parameters.progressUpdate?.useAutomaticUpdate ? (
          <div className={'p-1'}>
            <div>
              <div>Connection Status: </div>
              <div>
                {socketConnection.status === SocketConnectionStatusType.Idle && (
                  <span className={statusBarDataPluginElementStyles.connectionStatus}>
                    <Icon name="idle" className={'inline h-4 mr-2'} />
                    Idle
                  </span>
                )}
                {socketConnection.status === SocketConnectionStatusType.Connected && (
                  <span className={statusBarDataPluginElementStyles.connectionStatus}>
                    <Icon name="connected_to_api" className={'inline h-4 mr-2'} />
                    Connected
                  </span>
                )}
                {socketConnection.status === SocketConnectionStatusType.Disconnected && (
                  <span className={statusBarDataPluginElementStyles.connectionStatus}>
                    <Icon name="connected_to_api_failed" className={'inline h-4 mr-2'} />
                    Disconnected
                  </span>
                )}
              </div>
            </div>
            <hr className={'mb-3 mt-3'} />
            <div>
              <div>
                Commits: {progress.report.commits.processed}/{progress.report.commits.total}
              </div>
              <progress
                className="progress w-56 progress-accent"
                value={progress.report.commits.processed}
                max={progress.report.commits.total}></progress>
            </div>
            <div>
              <div>
                Issues: {progress.report.issues.processed}/{progress.report.issues.total}
              </div>
              <progress
                className="progress w-56 progress-accent"
                value={progress.report.issues.processed}
                max={progress.report.issues.total}></progress>
            </div>
            <div>
              <div>
                Builds: {progress.report.builds.processed}/{progress.report.builds.total}
              </div>
              <progress
                className="progress w-56 progress-accent"
                value={progress.report.builds.processed}
                max={progress.report.builds.total}></progress>
            </div>
            <div>
              <div>
                Files: {progress.report.files.processed}/{progress.report.files.total}
              </div>
              <progress
                className="progress w-56 progress-accent"
                value={progress.report.files.processed}
                max={progress.report.files.total}></progress>
            </div>
            <div>
              <div>
                Modules: {progress.report.modules.processed}/{progress.report.modules.total}
              </div>
              <progress
                className="progress w-56 progress-accent"
                value={progress.report.modules.processed}
                max={progress.report.modules.total}></progress>
            </div>
            <div>
              <div>
                Milestones: {progress.report.milestones.processed}/{progress.report.milestones.total}
              </div>
              <progress
                className="progress w-56 progress-accent"
                value={progress.report.milestones.processed}
                max={progress.report.milestones.total}></progress>
            </div>
            <div>
              <div>
                Merge Requests: {progress.report.mergeRequests.processed}/{progress.report.mergeRequests.total}
              </div>
              <progress
                className="progress w-56 progress-accent"
                value={progress.report.mergeRequests.processed}
                max={progress.report.mergeRequests.total}></progress>
            </div>
          </div>
        ) : (
          <div>
            <div>{props.dataPlugin?.description}</div>
            <div className={'flex justify-end gap-1 pr-1 pt-1'}>
              <button
                className={'btn btn-xs btn-outline'}
                title={'Set as default data plugin for new visualizations'}
                onClick={() => {
                  if (props.dataPluginConfig.id !== undefined) {
                    globalStore.dispatch(setDataPluginAsDefault(props.dataPluginConfig.id));
                    globalStore.dispatch(
                      addNotification({ text: `"${props.dataPluginConfig.name}" set as default`, type: AlertType.success }),
                    );
                  }
                }}>
                Make default
              </button>
              <button className={'btn btn-xs btn-primary'} title={'Use this data plugin for all visualizations'} onClick={handleUseForAll}>
                Set for all
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default StatusBarDataPlugin;

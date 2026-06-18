import { useDispatch, useSelector } from 'react-redux';
import styles from '../../styles.module.scss';
import { setNavigation, type ChangeFrequencyState } from '../reducer';
import { colorGradient } from '../utilities/utilities';
import type { HierarchyNode } from '../utilities/hierarchy';
import { Icon } from '../../../../../components/icon';

type PluginRootState = { plugin: ChangeFrequencyState };

// Directory listing for the Change Frequency visualization. The navigation breadcrumb lives in the
// chart header (see ../chart/chart.tsx), so it is intentionally not repeated here. Rendered inside the
// dashboard item's per-instance store Provider, so it reads/writes that store via react-redux hooks.
function HierarchyTab() {
  const dispatch = useDispatch();
  const currentPath = useSelector((state: PluginRootState) => state.plugin.currentPath);
  const hierarchyStack = useSelector((state: PluginRootState) => state.plugin.hierarchyStack);
  const hierarchyData = useSelector((state: PluginRootState) => state.plugin.hierarchyData);
  const loading = useSelector((state: PluginRootState) => state.plugin.loading);

  function navigateTo(path: string) {
    dispatch(setNavigation({ currentPath: path, hierarchyStack: [...hierarchyStack, path] }));
  }

  return (
    <div className={styles.configContainer}>
      <div className={styles.directoryContents}>
        <h3>{currentPath ? `Contents of ${currentPath}` : 'Root Directory'}</h3>

        {loading && (
          <div className={styles.emptyDirectory}>
            <span className="loading loading-spinner loading-lg text-accent"></span>
          </div>
        )}

        {!loading && hierarchyData.length === 0 && <div className={styles.emptyDirectory}>No files or directories found</div>}

        {!loading &&
          hierarchyData.length > 0 &&
          [...(hierarchyData as HierarchyNode[])]
            .sort((a, b) => {
              if (a.isDirectory && !b.isDirectory) return -1;
              if (!a.isDirectory && b.isDirectory) return 1;
              return a.name.localeCompare(b.name);
            })
            .map((entry) => (
              <div
                key={entry.path}
                className={styles.directoryEntry}
                onClick={() => entry.isDirectory && navigateTo(entry.path)}
                style={{ cursor: entry.isDirectory ? 'pointer' : 'default' }}>
                <div
                  className={styles.colorIndicator}
                  style={{
                    backgroundColor: colorGradient(entry.totalAdditions, entry.totalDeletions),
                  }}
                />
                <div className={styles.entryIcon}>
                  <Icon name={entry.isDirectory ? 'folder' : 'file'} size="w-5 h-5" />
                </div>
                <div style={{ flex: 1 }}>
                  <div className={styles.entryName}>{entry.name}</div>
                  <div className={styles.entryStats}>
                    <span style={{ color: '#4caf50' }}>{entry.totalAdditions.toLocaleString()}</span>
                    <span> / </span>
                    <span style={{ color: '#f44336' }}>{entry.totalDeletions.toLocaleString()}</span>
                    <span> ({entry.commitCount.toLocaleString()} commits)</span>
                  </div>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}

export default HierarchyTab;

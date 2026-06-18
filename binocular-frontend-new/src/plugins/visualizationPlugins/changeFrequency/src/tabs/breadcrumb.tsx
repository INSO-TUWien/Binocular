import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from '../../styles.module.scss';
import { setNavigation, type ChangeFrequencyState } from '../reducer';

type PluginRootState = { plugin: ChangeFrequencyState };

// Navigation breadcrumb for the Change Frequency visualization (root / src / components). Shared by
// the chart header and the directory panel; both render inside the dashboard item's per-instance
// store Provider, so it reads/writes that store via react-redux hooks.
function Breadcrumb() {
  const dispatch = useDispatch();
  const hierarchyStack = useSelector((state: PluginRootState) => state.plugin.hierarchyStack);

  function navigateTo(path: string, index: number) {
    dispatch(setNavigation({ currentPath: path, hierarchyStack: hierarchyStack.slice(0, index + 1) }));
  }

  function navigateToRoot() {
    dispatch(setNavigation({ currentPath: '', hierarchyStack: [] }));
  }

  return (
    <div className={styles.breadcrumbContainer}>
      <span className={`${styles.breadcrumbItem} ${styles.breadcrumbLink}`} onClick={navigateToRoot}>
        root
      </span>

      {hierarchyStack.map((path: string, index: number) => {
        const isLast = index === hierarchyStack.length - 1;
        return (
          <React.Fragment key={path}>
            <span className={styles.breadcrumbSeparator}>/</span>
            <span
              className={`${styles.breadcrumbItem} ${isLast ? styles.breadcrumbCurrent : styles.breadcrumbLink}`}
              onClick={() => (!isLast ? navigateTo(path, index) : null)}>
              {path.split('/').pop()}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default Breadcrumb;

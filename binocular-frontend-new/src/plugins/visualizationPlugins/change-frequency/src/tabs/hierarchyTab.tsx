import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import * as d3 from 'd3';
import styles from '../../styles.module.scss';
import { HierarchyNode } from '../utilities/utilities';
import { store as globalStore } from '../../../../../redux';

function ConfigComponent() {
  const hierarchyState = useSelector((state: any) => state?.changeFrequency?.state) || {};
  const hierarchyData = useSelector((state: any) => state?.changeFrequency?.hierarchyData) || [];
  const isLoading = useSelector((state: any) => state?.changeFrequency?.loading) || false;

  const currentPath = useMemo(() => hierarchyState?.currentPath || '', [hierarchyState]);
  const hierarchyStack = useMemo(() => hierarchyState?.hierarchyStack || [], [hierarchyState]);

  // Function to generate the color gradient based on the ratio of additions to deletions
  function colorGradient(additions: number, deletions: number) {
    const total = additions + deletions;
    if (total === 0) return '#a0a0a0';

    const ratio = additions / total;

    if (ratio <= 0.5) {
      return d3.interpolateRgb('#ff1a1a', '#ffcc00')(ratio * 2);
    } else {
      return d3.interpolateRgb('#ffcc00', '#2ecc40')((ratio - 0.5) * 2);
    }
  }

  // Function to navigate to a specific path
  function navigateTo(path: string, index?: number) {
    let newStack;

    if (index !== undefined) {
      newStack = hierarchyStack.slice(0, index + 1);
    } else {
      newStack = [...hierarchyStack, path];
    }

    globalStore.dispatch({
      type: 'changeFrequency/setGlobalState',
      payload: {
        currentPath: path,
        hierarchyStack: newStack,
      },
    });
  }

  // Function to navigate to the root of the hierarchy
  function navigateToRoot() {
    globalStore.dispatch({
      type: 'changeFrequency/setGlobalState',
      payload: {
        currentPath: '',
        hierarchyStack: [],
      },
    });
  }

  return (
    <div className={styles.configContainer}>
      <div className={styles.breadcrumbContainer}>
        <span className={styles.breadcrumbItem} onClick={navigateToRoot} style={{ cursor: 'pointer', color: '#0066cc' }}>
          root
        </span>

        {hierarchyStack.map((path: string, index: number) => (
          <React.Fragment key={path}>
            <span className={styles.breadcrumbSeparator}>/</span>
            <span
              className={styles.breadcrumbItem}
              style={{
                cursor: index < hierarchyStack.length - 1 ? 'pointer' : 'default',
                color: index < hierarchyStack.length - 1 ? '#0066cc' : '#333',
                fontWeight: index === hierarchyStack.length - 1 ? 'bold' : 'normal',
              }}
              onClick={() => (index < hierarchyStack.length - 1 ? navigateTo(path, index) : null)}>
              {path.split('/').pop()}
            </span>
          </React.Fragment>
        ))}
      </div>

      <div className={styles.directoryContents}>
        <h3>{currentPath ? `Contents of ${currentPath}` : 'Root Directory'}</h3>

        {isLoading && <div className={styles.emptyDirectory}>Loading data...</div>}

        {!isLoading && hierarchyData.length === 0 && <div className={styles.emptyDirectory}>No files or directories found</div>}

        {!isLoading &&
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
                <div className={styles.entryIcon}>{entry.isDirectory ? '📁' : '📄'}</div>
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

export default ConfigComponent;

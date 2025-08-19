import React, { useState } from 'react';
import { FolderView } from './folderView.tsx';

export type FolderWithRatio = {
  name: string;
  subfolders: { [key: string]: FolderWithRatio };
  files: FileChangeWithRatio[];
  stats: { additions: number; deletions: number };
  changeRatio: number;
};

type FileChange = {
  file: { path: string };
  stats: { additions: number; deletions: number };
};

type FileChangeWithRatio = FileChange & { changeRatio: number };

type CommitByFileVizProps = {
  width: number;
  height: number;
  data: FileChange[];
};

const MARGIN = { top: 30, right: 30, bottom: 30, left: 30 };

export const CommitByFileViz: React.FC<CommitByFileVizProps> = ({ width, height, data }) => {
  const root = buildFolderTree(data);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const isVertical = width < height;
  const boundsWidth = width - MARGIN.left - MARGIN.right;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  const currentFolder = getFolderByPath(root, currentPath);

  return (
    <div style={{ width: boundsWidth, height: boundsHeight, position: 'relative' }}>
      {currentPath.length > 0 && (
        <>
          <button
            onClick={() => setCurrentPath(currentPath.slice(0, -1))}
            style={{
              position: 'absolute',
              top: 4,
              left: 4,
              zIndex: 1,
              padding: '4px 8px',
              borderRadius: '6px',
              background: currentPath.length > 0 ? '#3182ce' : '#c4c4c4',
              color: 'white',
              border: 'none',
              cursor: currentPath.length > 0 ? 'pointer' : 'not-allowed',
              fontSize: '0.8rem',
            }}>
            &lt; {root.name ? root.name + '/' : ''}
            {currentPath.join('/')}
          </button>
        </>
      )}
      {currentPath.length === 0 && root.name !== '' && (
        <button
          onClick={() => setCurrentPath(currentPath.slice(0, -1))}
          style={{
            position: 'absolute',
            top: 4,
            left: 4,
            zIndex: 1,
            padding: '4px 8px',
            borderRadius: '6px',
            background: '#c4c4c4',
            color: 'white',
            border: 'none',
            cursor: 'not-allowed',
            fontSize: '0.8rem',
          }}>
          {root.name}
        </button>
      )}

      <FolderView
        folder={currentFolder}
        isVertical={isVertical}
        boundsWidth={boundsWidth}
        boundsHeight={boundsHeight}
        onNavigate={(folderName) => setCurrentPath([...currentPath, folderName])}
      />
    </div>
  );
};

const updateFolderStats = (folder: FolderWithRatio, file: FileChangeWithRatio) => {
  folder.changeRatio += file.changeRatio;
  folder.stats.additions += file.stats.additions;
  folder.stats.deletions += file.stats.deletions;
};

const flattenFolderTree = (folder: FolderWithRatio): FolderWithRatio => {
  const flattenedSubfolders: { [key: string]: FolderWithRatio } = {};
  for (const [, subfolder] of Object.entries(folder.subfolders)) {
    const flattened = flattenFolderTree(subfolder);
    flattenedSubfolders[flattened.name] = flattened;
  }

  folder.subfolders = flattenedSubfolders;
  if (folder.files.length === 0 && Object.keys(folder.subfolders).length === 1) {
    const onlyChild = Object.values(folder.subfolders)[0];

    return {
      ...onlyChild,
      name: folder.name !== '' ? folder.name + '/' + onlyChild.name : onlyChild.name,
    };
  }

  return folder;
};

const buildFolderTree = (files: FileChange[]): FolderWithRatio => {
  const totalChangeCount = files.reduce((sum, f) => sum + f.stats.additions + f.stats.deletions, 0);
  const fileChangesWithRatios: FileChangeWithRatio[] = files.map((f) => ({
    ...f,
    changeRatio: totalChangeCount === 0 ? 0 : (f.stats.additions + f.stats.deletions) / totalChangeCount,
  }));

  const rootFolder: FolderWithRatio = { name: '', subfolders: {}, files: [], stats: { additions: 0, deletions: 0 }, changeRatio: 0 };

  for (const fileChange of fileChangesWithRatios) {
    const filePathParts = fileChange.file.path.split('/');
    let currentFolder = rootFolder;

    for (let i = 0; i < filePathParts.length - 1; i++) {
      const filePathPart = filePathParts[i];
      if (!currentFolder.subfolders[filePathPart]) {
        currentFolder.subfolders[filePathPart] = {
          name: filePathPart,
          subfolders: {},
          files: [],
          stats: { additions: 0, deletions: 0 },
          changeRatio: 0,
        };
      }
      updateFolderStats(currentFolder, fileChange);
      currentFolder = currentFolder.subfolders[filePathPart];
    }
    updateFolderStats(currentFolder, fileChange);
    currentFolder.files.push(fileChange);
  }

  return flattenFolderTree(rootFolder);
};

const getFolderByPath = (folder: FolderWithRatio, path: string[]): FolderWithRatio => {
  return path.reduce((n, part) => n.subfolders[part], folder);
};

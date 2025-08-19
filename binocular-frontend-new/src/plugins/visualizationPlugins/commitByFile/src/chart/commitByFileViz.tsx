import React, { useState } from 'react';

type FileChange = {
  file: { path: string };
  stats: { additions: number; deletions: number };
};

type FileChangeWithRatio = FileChange & { changeRatio: number };

type FolderWithRatio = {
  name: string;
  subfolders: { [key: string]: FolderWithRatio };
  files: FileChangeWithRatio[];
  stats: { additions: number; deletions: number };
  changeRatio: number;
};

const MARGIN = { top: 30, right: 30, bottom: 30, left: 30 };

const updateFolderStats = (folder: FolderWithRatio, file: FileChangeWithRatio) => {
  folder.changeRatio += file.changeRatio;
  folder.stats.additions += file.stats.additions;
  folder.stats.deletions += file.stats.deletions;
};

const flattenFolders = (folder: FolderWithRatio): FolderWithRatio => {
  const flattenedSubfolders: { [key: string]: FolderWithRatio } = {};
  for (const [, subfolder] of Object.entries(folder.subfolders)) {
    const flattened = flattenFolders(subfolder);
    flattenedSubfolders[flattened.name] = flattened;
  }

  folder.subfolders = flattenedSubfolders;
  if (folder.files.length === 0 && Object.keys(folder.subfolders).length === 1) {
    const onlyChild = Object.values(folder.subfolders)[0];

    return {
      ...onlyChild,
      name: folder.name + '/' + onlyChild.name,
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

  return flattenFolders(rootFolder);
};

const getFolderByPath = (folder: FolderWithRatio, path: string[]): FolderWithRatio => {
  return path.reduce((n, part) => n.subfolders[part], folder);
};

const getFileColour = (add: number, del: number) => {
  const total = add + del;
  const ratio = add / total;
  const vividness = Math.abs(0.5 - ratio) * 2;
  if (add === del) {
    return 'rgb(230, 230, 230)';
  } else if (add < del) {
    return `rgb(${230 + vividness * 25}, ${255 - vividness * 255}, ${255 - vividness * 255})`;
  } else {
    return `rgb(${255 - vividness * 255}, ${230 + vividness * 25}, ${255 - vividness * 255})`;
  }
};

const FolderView: React.FC<{
  folder: FolderWithRatio;
  isVertical: boolean;
  boundsWidth: number;
  boundsHeight: number;
  onNavigate: (folderName: string) => void;
}> = ({ folder, isVertical, boundsWidth, boundsHeight, onNavigate }) => {
  return (
    <div
      style={{
        height: `${boundsHeight}px`,
        width: `${boundsWidth}px`,
        display: 'flex',
        flexDirection: isVertical ? 'column' : 'row',
        gap: '4px',
      }}>
      {folder.files.map((file) => {
        const ratio = file.changeRatio / folder.changeRatio;
        const style = isVertical ? { height: `${ratio * 100}%`, width: '100%' } : { width: `${ratio * 100}%`, height: '100%' };
        return (
          <div
            key={file.file.path}
            style={{
              ...style,
              backgroundColor: getFileColour(file.stats.additions, file.stats.deletions),
              display: 'flex',
              cursor: 'default',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              borderRadius: '10px',
            }}
            title={`${file.file.path} — +${file.stats.additions} / -${file.stats.deletions}`}>
            {file.file.path.split('/').pop()}
          </div>
        );
      })}

      {Object.entries(folder.subfolders).map(([childName, childNode]) => {
        const ratio = childNode.changeRatio / folder.changeRatio;
        const style = isVertical ? { height: `${ratio * 100}%`, width: '100%' } : { width: `${ratio * 100}%`, height: '100%' };

        return (
          <div
            key={childName}
            style={{
              ...style,
              backgroundColor: getFileColour(childNode.stats.additions, childNode.stats.deletions),
              border: '2px solid #3182ce',
              borderRadius: '10px',
              padding: '4px',
              position: 'relative',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              color: '#1a202c',
            }}
            title={`Folder ${childName}  — +${childNode.stats.additions} / -${childNode.stats.deletions}`}
            onClick={() => onNavigate(childName)}>
            📁 {childName}
          </div>
        );
      })}
    </div>
  );
};

export const CommitByFileViz: React.FC<{
  width: number;
  height: number;
  data: FileChange[];
}> = ({ width, height, data }) => {
  const root = buildFolderTree(data);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const isVertical = width < height;
  const boundsWidth = width - MARGIN.left - MARGIN.right;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  const currentFolder = getFolderByPath(root, currentPath);

  return (
    <div style={{ width: boundsWidth, height: boundsHeight, position: 'relative' }}>
      {currentFolder.name !== '' && (
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
              background: '#3182ce',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8rem',
            }}>
            &lt; {currentPath.slice(0, -1).join('/')}
            {currentFolder.name}
          </button>
        </>
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

import React from 'react';
import folderIcon from '../../assets/folder-open-regular-full.svg'
import { FolderWithRatio } from './commitByFileViz.tsx';

type FolderViewProps = {
  folder: FolderWithRatio;
  isVertical: boolean;
  boundsWidth: number;
  boundsHeight: number;
  onNavigate: (folderName: string) => void;
};

export const FolderView: React.FC<FolderViewProps> = ({ folder, isVertical, boundsWidth, boundsHeight, onNavigate }) => {
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
            }}
            title={`Folder ${childName}  — +${childNode.stats.additions} / -${childNode.stats.deletions}`}
            onClick={() => onNavigate(childName)}>
            <img src={folderIcon} alt="Folder Icon" style={{ width: '1.4rem', height: '1.4rem', color: '#3182ce', marginRight: '5px' }} />{' '}
            {childName}
          </div>
        );
      })}
    </div>
  );
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

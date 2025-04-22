type FileChange = {
  file: { path: string };
  stats: {
    additions: number;
    deletions: number;
  };
};

type FileChangeWithRatio = FileChange & {
  changeRatio: number;
};

type GroupedResult = {
  [folder: string]: {
    files: FileChangeWithRatio[];
    folderChangeRatio: number;
  };
};

const MARGIN = { top: 30, right: 30, bottom: 30, left: 30 };

type Props = {
  width: number;
  height: number;
  data: FileChange[];
};

export const CommitChangeViz: React.FC<Props> = ({ width, height, data }: Props) => {
  const grouped = groupByTopLevelFolderWithRatios(data);

  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;
  const isVertical = width < height;

  const rootGroup = grouped['root'];
  const otherGroups = Object.entries(grouped).filter(([key]) => key !== 'root');

  return (
    <div
      style={{
        width: `${boundsWidth}px`,
        height: `${boundsHeight}px`,
        display: 'flex',
        flexDirection: isVertical ? 'column' : 'row',
        gap: '4px',
        flexWrap: 'wrap',
      }}>
      {rootGroup?.files.map((file) => {
        const fileStyle = !isVertical
          ? {
              height: '100%',
              width: `${file.changeRatio * (boundsWidth - 10 * rootGroup.files.length)}px`,
            }
          : {
              width: '100%',
              height: `${file.changeRatio * (boundsHeight - 10 * rootGroup.files.length)}px`,
            };

        const bgColor = getFileColor(file.stats.additions, file.stats.deletions);

        return (
          <div
            key={file.file.path}
            style={{
              ...fileStyle,
              backgroundColor: bgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              borderRadius: '10px',
            }}
            title={`${file.file.path} — +${file.stats.additions} / -${file.stats.deletions}`}>
            <p style={{ zIndex: '1', fontWeight: 'bold' }}>{file.file.path.split('/').pop()}</p>
          </div>
        );
      })}

      {otherGroups.map(([folderName, { files, folderChangeRatio }]) => {
        const folderStyle = isVertical
          ? {
              width: '100%',
              height: `${folderChangeRatio * (boundsHeight - 10 * otherGroups.length)}px`,
            }
          : {
              height: '100%',
              width: `${folderChangeRatio * (boundsWidth - 10 * otherGroups.length)}px`,
            };

        return (
          <div
            key={folderName}
            style={{
              ...folderStyle,
              padding: '4px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'space-between',
              flexDirection: isVertical ? 'row' : 'column',
              position: 'relative',
              borderRadius: '10px',
              border: '2px solid #3182ce',
            }}
            title={`${folderName} — +${files.reduce((acc, file) => acc + file.stats.additions, 0)} / -${files.reduce((acc, file) => acc + file.stats.deletions, 0)}`}
          >
            <div
              style={{
                position: 'absolute',
                top: 2,
                left: 4,
                fontSize: '0.75rem',
                fontWeight: 'bold',
                color: '#2c5282',
                backgroundColor: 'white',
                padding: '0 4px',
                zIndex: 1,
                cursor: 'default',
              }}>
              {folderName}
            </div>

            {files.map((file) => {
              const fileStyle = isVertical
                ? {
                    height: '100%',
                    width: `${(file.changeRatio / folderChangeRatio) * 98}%`,
                  }
                : {
                    width: '100%',
                    height: `${(file.changeRatio / folderChangeRatio) * 98}%`,
                  };

              const bgColor = getFileColor(file.stats.additions, file.stats.deletions);

              return (
                <div
                  key={file.file.path}
                  style={{
                    ...fileStyle,
                    backgroundColor: bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    borderRadius: '10px',
                  }}
                  title={`${file.file.path} — +${file.stats.additions} / -${file.stats.deletions}`}>
                  <p style={{ zIndex: '1', fontWeight: 'bold' }}>{file.file.path.split('/').pop()}</p>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

const groupByTopLevelFolderWithRatios = (files: FileChange[]): GroupedResult => {
  const totalChanges = files.reduce((sum, file) => sum + file.stats.additions + file.stats.deletions, 0);

  const filesWithRatios: FileChangeWithRatio[] = files.map((file) => {
    const changes = file.stats.additions + file.stats.deletions;
    return {
      ...file,
      changeRatio: totalChanges === 0 ? 0 : changes / totalChanges,
    };
  });

  const groups: GroupedResult = {};

  for (const file of filesWithRatios) {
    const folder = file.file.path.split('/')[1] === undefined ? 'root' : file.file.path.split('/')[0];

    if (!groups[folder]) {
      groups[folder] = {
        files: [],
        folderChangeRatio: 0,
      };
    }

    groups[folder].files.push(file);
    groups[folder].folderChangeRatio += file.changeRatio;
  }

  return groups;
};

const getFileColor = (additions: number, deletions: number) => {
  const total = additions + deletions;
  if (total === 0) return '#e2e8f0';

  const ratio = additions / total;

  const vividness = Math.abs(0.5 - ratio) * 2;

  const blend = (start: number, end: number, weight: number) => Math.round(start + (end - start) * weight);

  let r: number, g: number, b: number;

  if (ratio > 0.5) {
    r = blend(226, 56, vividness);
    g = blend(232, 161, vividness);
    b = blend(240, 105, vividness);
  } else {
    r = blend(226, 229, vividness);
    g = blend(232, 62, vividness);
    b = blend(240, 62, vividness);
  }

  return `rgb(${r}, ${g}, ${b})`;
};

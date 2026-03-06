import type { DataPluginHunk } from '../../../../../interfaces/dataPluginInterfaces/dataPluginFiles';
import type { DataPluginCommit } from '../../../../../interfaces/dataPluginInterfaces/dataPluginCommits';

function HeatMapColumn(props: { hunks: DataPluginHunk[] | undefined; commit: DataPluginCommit; lineHeight: number; topOffset: number }) {
  return (
    <div
      key={`heatmapColumn${props.commit.sha}`}
      style={{ width: '100%', height: '100%', position: 'absolute', top: `${props.topOffset}px`, left: 0 }}>
      {props.hunks &&
        props.hunks.map((hunk, i) => (
          <>
            <div
              key={`${props.commit.sha}OldHunk${i}`}
              style={{
                position: 'absolute',
                top: `${props.lineHeight * (hunk.oldStart - 1)}px`,
                left: '0',
                width: 'calc(100% - 1px)',
                height: `${props.lineHeight * (hunk.oldLines + 1)}px`,
                backgroundColor: '#0088ff55',
                border: '1px solid #0088ff55',
              }}></div>
            <div
              key={`${props.commit.sha}NewHunk${i}`}
              style={{
                position: 'absolute',
                top: `${props.lineHeight * (hunk.newStart - 1)}px`,
                left: '0',
                width: 'calc(100% - 1px)',
                height: `${props.lineHeight * (hunk.newLines + 1)}px`,
                backgroundColor: '#0088ff55',
                border: '1px solid #0088ff55',
              }}></div>
          </>
        ))}
    </div>
  );
}

export default HeatMapColumn;

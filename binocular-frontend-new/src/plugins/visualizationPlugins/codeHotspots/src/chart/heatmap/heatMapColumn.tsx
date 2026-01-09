import type { DataPluginHunk } from '../../../../../interfaces/dataPluginInterfaces/dataPluginFiles';

function HeatMapColumn(props: { hunks: DataPluginHunk[] | undefined }) {
  const lineHeight = 18.2;
  const topOffset = 4;
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: `${topOffset}px`, left: 0 }}>
      {props.hunks &&
        props.hunks.map((hunk, i) => (
          <div
            key={`hunk${i}`}
            style={{
              position: 'absolute',
              top: `${lineHeight * (hunk.newStart - 1)}px`,
              left: '0',
              width: 'calc(100% - 1px)',
              height: `${lineHeight * hunk.newLines}px`,
              backgroundColor: '#0088ff55',
            }}></div>
        ))}
    </div>
  );
}

export default HeatMapColumn;

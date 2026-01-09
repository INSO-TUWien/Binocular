import type { DataPluginCommit } from '../../../../../interfaces/dataPluginInterfaces/dataPluginCommits';
import HeatMapColumn from './heatMapColumn';
import type { SelectedFile } from '../../reducer';

function HeatMap(props: { commits: DataPluginCommit[]; file: SelectedFile | null }) {
  return (
    <div id={'heatMap'} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {props.commits.map((commit: DataPluginCommit, i: number) => (
        <div
          key={commit.sha}
          className="heatMapColumn"
          style={{
            width: `${100 / props.commits.length}%`,
            height: '100%',
            position: 'absolute',
            left: `${(100 / props.commits.length) * i}%`,
            top: 0,
          }}>
          <HeatMapColumn hunks={commit.files?.data.find((file) => file.file.path === props.file?.path)?.hunks}></HeatMapColumn>
        </div>
      ))}
    </div>
  );
}

export default HeatMap;

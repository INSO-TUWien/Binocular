'use strict';

import { connect } from 'react-redux';

import { setActiveBranch, setDisplayMetric, setDisplayByAuthors, setTimeSpan } from '../sagas';
import styles from '../styles.scss';
import FileBrowser from '../components/fileBrowser/fileBrowser';
import TabCombo from '../../../../components/TabCombo';
import CheckboxLegend from '../components/checkboxLegend';
import DateRangeFilter from '../../../../components/DateRangeFilter/dateRangeFilter';

const mapStateToProps = (state /*, ownProps*/) => {
  const State = state.visualizations.fileEvolutionDendrogram.state;

  return {
    branches: State.data.data.branches,
    branch: State.config.branch,
    files: State.data.data.files,
    palette: State.data.data.palette,
    displayMetric: State.config.displayMetric,
    timeSpan: State.config.timeSpan,
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onSetBranch: (branch) => dispatch(setActiveBranch(branch)),
    onClickMetric: (metric) => dispatch(setDisplayMetric(metric)),
    onClickCheckboxLegend: (isSet) => dispatch(setDisplayByAuthors(isSet)),
    onChangeTimeSpan: (span) => dispatch(setTimeSpan(span)),
  };
};

const FileEvolutionDendrogramConfigComponent = (props) => {
  let otherCommitters;
  if (props.palette && 'others' in props.palette) {
    otherCommitters = props.committers.length - (Object.keys(props.palette).length - 1);
  }
  const options = [];
  options.push(<option key={'No Branch Chosen'}>{'No Branch Chosen'}</option>);
  for (const i in props.branches) {
    options.push(<option key={i}>{props.branches[i].branch}</option>);
  }

  return (

    <div className={styles.config}>
      <div className={styles.field}>
        <label className="label">Changes</label>
        <div style={{ marginBottom: '0.5em' }}>
          <TabCombo
            value={props.displayMetric}
            options={[
              { label: '# lines changed', icon: 'file-alt', value: 'linesChanged' },
              { label: '# commits', icon: 'cloud-upload-alt', value: 'commits' },
            ]}
            onChange={(value) => props.onClickMetric(value)}
          />
        </div>
        <CheckboxLegend
          palette={props.palette}
          onClick={props.onClickCheckboxLegend.bind(this)}
          title="Authors:"
          otherCommitters={otherCommitters}
          displayMetric={props.displayMetric}
        />
      </div>

      <div className={styles.label}> Branch:</div>
      <div id={'branchSelector'} className={'select ' + styles.branchSelect}>
        <select
          className={styles.branchSelect}
          value={props.branch}
          onChange={(e) => {
            props.onSetBranch(e.target.value);
          }}>
          {options}
        </select>
      </div>
      <label className="label">Date Range</label>
      <div>
          <DateRangeFilter
            from={props.timeSpan.from}
            to={props.timeSpan.to}
            onDateChanged={(data) => {
              console.log(data);
              props.onChangeTimeSpan(data);
            }}
          />
        </div>
      <hr />
      <div id={'fileSelector'}>
        <FileBrowser files={props.files} props={props} />
      </div>
    </div>
  );
};

const FileEvolutionDendrogramConfig = connect(mapStateToProps, mapDispatchToProps)(FileEvolutionDendrogramConfigComponent);

export default FileEvolutionDendrogramConfig;

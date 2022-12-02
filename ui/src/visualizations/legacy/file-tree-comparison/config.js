'use strict';

import { connect } from 'react-redux';
import { setCommit1, setCommit2 } from './sagas/index.js';

const mapStateToProps = (state /*, ownProps*/) => {
  const fileTreeState = state.visualizations.fileTreeComparison.state.data.data;
  return {
    commits: fileTreeState.commits,
    commit1: null,
    commit2: null,
    tree1: null,
    tree2: null,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onSetCommit1: (commit) => {
      dispatch(setCommit1(commit));
    },
    onSetCommit2: (commit) => dispatch(setCommit2(commit)),
  };
};

const ChangesConfigComponent = (props) => {
  let commits = [];
  for (const i in props.commits) {
    commits.push(<option key={i}>{props.commits[i].messageHeader}</option>);
  }
  commits = commits.slice().reverse(); //reverse Array

  return (
    <div>
      <select
        value={props.commit1}
        onChange={(e) => {
          props.onSetCommit1(props.commits[e.target.options.selectedIndex]);
        }}>
        {commits}
      </select>
       <select
         value={props.commit2}
         onChange={(e) => {
           props.onSetCommit2(props.commits[e.target.options.selectedIndex]);
         }}>
         {commits}
       </select>
     </div>
   )
};

const FileTreeConfig = connect(mapStateToProps, mapDispatchToProps)(ChangesConfigComponent);

export default FileTreeConfig;

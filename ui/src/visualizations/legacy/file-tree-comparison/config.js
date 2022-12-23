'use strict';

import { connect } from 'react-redux';
import style from './config.css';
const mapStateToProps = (state /*, ownProps*/) => {
  const fileTreeState = state.visualizations.fileTreeComparison.state.data;
  console.log(fileTreeState);
  return {
    //changed: fileTreeState.changed,
    //commits: fileTreeState.commits,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
  };
};


const ChangesConfigComponent = (props) => {
  return (
    <div className={style.legend}>
      <hr />
      <div className={style.add}></div><div className={style.flexGrow}> Additions</div><hr/>
      <div className={style.delete}></div><div className={style.flexGrow}> Deletions</div><hr/>
      <div className={style.edit}></div><div className={style.flexGrow}> Modifications</div><hr/>
    </div>
  );
};

const FileTreeConfig = connect(mapStateToProps, mapDispatchToProps)(ChangesConfigComponent);

export default FileTreeConfig;

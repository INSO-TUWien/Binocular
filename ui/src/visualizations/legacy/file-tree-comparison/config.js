'use strict';

import { connect } from 'react-redux';
import style from './config.css';
const mapStateToProps = (state /*, ownProps*/) => {
  const fileTreeState = state.visualizations.fileTreeComparison.state;
  return {
    changed: fileTreeState.config.changed,
  };
};

const mapDispatchToProps = (dispatch) => {};

const ChangesConfigComponent = (props) => {
  return (
    <div className={style.info}>
      <div className={style.files}>
        <div hidden={props.changed.add.length === 0}>
          <div>
            <b>Additions:</b>
          </div>
          <div>
            <ul className={style.listStyle}>
              {props.changed.add.map((f, i) => {
                return <li key={i}>{f}</li>;
              })}
            </ul>
          </div>
        </div>
        <div hidden={props.changed.delete.length === 0}>
          <div>
            <b>Deletions:</b>
          </div>
          <div>
            <ul className={style.listStyle}>
              {props.changed.delete.map((f, i) => {
                return <li key={i}>{f}</li>;
              })}
            </ul>
          </div>
        </div>
        <div hidden={props.changed.edit.length === 0}>
          <div>
            <b>Modifications:</b>
          </div>
          <div>
            <ul className={style.listStyle}>
              {props.changed.edit.map((f, i) => {
                return <li key={i}>{f}</li>;
              })}
            </ul>
          </div>
        </div>
      </div>
      <div className={style.legend}>
      <hr />
      <div className={style.add}></div><div className={style.flexGrow}> Additions</div><hr/>
      <div className={style.delete}></div><div className={style.flexGrow}> Deletions</div><hr/>
      <div className={style.edit}></div><div className={style.flexGrow}> Modifications</div><hr/>
    </div>
    </div>
  );
};

const FileTreeConfig = connect(mapStateToProps, mapDispatchToProps)(ChangesConfigComponent);

export default FileTreeConfig;

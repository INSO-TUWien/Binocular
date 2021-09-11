'use strict';

import Promise from 'bluebird';
import { connect } from 'react-redux';
import {addRef, removeRef } from './sagas';
import SearchBox from '../../components/SearchBox';
import styles from './styles.scss';

import { graphQl } from '../../utils';

const mapStateToProps = (state /*, ownProps*/) => {
  const cfState = state.visualizations.codeFlow.state;
  
  return {
    refs: cfState.config.refs
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onAddRef: attr => dispatch(addRef(attr)),
    onRemoveRev: attr => dispatch(removeRef(attr))
  };
};

const CodeFlowConfigComponent = props => {
  return (
    <div className={styles.configContainer}>
      <form>
        <div className="field">
          <SearchBox
            placeholder="Search for reference (branches, tags)..."
            renderOption={ref => `${ref}`}
            search={text => {
              // TODO: filter in db instead of x.branch.includes(text)!
              return Promise.resolve(
                graphQl.query(
                  `
                  query{
                    branches {data {branch, active}}
                  }
                `
                )
              )
                .then(resp => resp.branches.data).filter(x => x.branch.includes(text)).map(x => "refs/branches/" + x.branch);
            }}
            // TODO: Reset on selection?
            value={""}
            onChange={ref => props.onAddRef(ref)}
          />
        </div>
        
        <div className="field">
          <div className="control">
            <ul>
              {props.refs.map(ref => <li key={ref}>{ref}</li>)}
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
};

const CodeFlowConfig = connect(mapStateToProps, mapDispatchToProps)(CodeFlowConfigComponent);

export default CodeFlowConfig;

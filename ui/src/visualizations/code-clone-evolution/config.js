'use strict';

import Promise from 'bluebird';
import { connect } from 'react-redux';
import { setClone, setStartRevision, setEndRevision, setPackage, setCloneType } from './sagas';
import SearchBox from '../../components/SearchBox';
import styles from './styles.scss';

import { graphQl } from '../../utils';

const mapStateToProps = (state /*, ownProps*/) => {
  const cceState = state.visualizations.codeCloneEvolution.state;

  return {
    clone: cceState.config.clone,
    startRevision: cceState.config.startRevision,
    endRevision: cceState.config.enRevision,
    package: cceState.config.package,
    cloneType: cceState.config.cloneType
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onSetClone: c => dispatch(setClone(c)),
    onSetStartRevision: s => dispatch(setStartRevision(s)),
    onSetEndRevision: e => dispatch(setEndRevision(e)),
    onSetPackage: p => dispatch(setPackage(p)),
    onSetCloneType: t => dispatch(setCloneType(t))
  };
};

const CodeCloneEvolutionConfigComponent = props => {
  return (
    <div className={styles.configContainer}>
      <form>
        <div className="field">
          <label className="label">Clone Type:</label>
          <div className="control">
            <div className="select">
              <select
                value={props.category}
                onChange={evt => props.onSetCloneType(evt.target.value)}>
                <option value="1">Type 1</option>
                <option value="2">Type 2</option>
              </select>
            </div>
          </div>
        </div>
        <div className="field">
          <label className="label">Sourcecode Package:</label>
          <SearchBox
            placeholder="Select package..."
            renderOption={p => `#${p.path}`}
            search={text => {
              return Promise.resolve(
                graphQl.query(
                  `
                  query($q: String) {
                    files(page: 1, perPage: 50, q: $q, sort: "DESC") {
                      data { path }
                    }
                  }`,
                  { q: text }
                )
              )
                .then(resp => resp.files.data)
                .map(f => {
                  return f;
                });
            }}
            value={props.pkg}
            onChange={pkg => props.onSetPackage(pkg)}
          />
        </div>
      </form>
    </div>
  );
};

const CodeCloneEvolutionConfig = connect(mapStateToProps, mapDispatchToProps)(
  CodeCloneEvolutionConfigComponent
);

export default CodeCloneEvolutionConfig;

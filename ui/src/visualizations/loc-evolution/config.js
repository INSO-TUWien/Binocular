'use strict';

import Promise from 'bluebird';
import { connect } from 'react-redux';
import { setOverlay, setHighlightedIssue, setCommitAttribute } from './sagas';
import SearchBox from '../../components/SearchBox';
import TabCombo from '../../components/TabCombo.js';
import styles from './styles.scss';


import { graphQl } from '../../utils';
import { Button } from 'react-scroll';

const elementNames = ["File1", "File2", "File3", "File4", "File5"]; //change to get Filenames from State

const mapStateToProps = (state /*, ownProps*/) => {
  const corState = state.visualizations.locEvolution.state;
  var temp;
  if (typeof corState.elements === 'undefined') {
    temp = elementNames;
  } else {
    temp = corState.elements
  }
  //console.warn(temp);
  //console.warn(state.visualizations.codeHotspots.state.data.data.files);
  return {
    issues: corState.data.issues,
    overlay: corState.config.overlay,
    highlightedIssue: corState.config.highlightedIssue,
    commitAttribute: corState.config.commitAttribute,
    elements: temp
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onChangeCommitAttribute: attr => dispatch(setCommitAttribute(attr))
  };
};

//LEGEND STUFF HERE

const locEvolutionConfigComponent = props => {
  return (
    <div className={styles.configContainer}>
      <form>
        <div className="field">
          <div className="control">
            <label className="label">Granularity Type:</label>
            <label className="radio">
              <input
                name="commitAttribute"
                type="radio"
                checked={props.commitAttribute === 'count'}
                onChange={() => props.onChangeCommitAttribute('count')}
              />
              Folders
            </label>
            <label className="radio">
              <input
                name="commitAttribute"
                type="radio"
                checked={props.commitAttribute === 'changes'}
                onChange={() => props.onChangeCommitAttribute('changes')}
              />
              Files
            </label>
          </div>
        </div>

        <div className="field">
          <div className="control">
            <label className="label">Show LoC-Evolution for:</label>
          </div>
        </div>

        <div className="field">
          <div className="control">
            <label className="label">Choose Elements to display:</label>

            {props.elements.map(value => (
              <span> {value} {" "}
                <input
                  type="radio"
                  name="elementName"
                  value={value}
                  checked="false"
                  onChange={() => props.onChangeCommitAttribute('changes')}
                />
              </span>
            ))}

          </div>
        </div>
      </form>
    </div>
  );
};

const LocEvolutionConfig = connect(mapStateToProps, mapDispatchToProps)(locEvolutionConfigComponent);

export default LocEvolutionConfig;

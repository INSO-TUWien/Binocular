'use strict';

import Promise from 'bluebird';
import { connect } from 'react-redux';
import { setOverlay, setHighlightedIssue, setCommitAttribute } from './sagas';
import SearchBox from '../../components/SearchBox';
import styles from './styles.scss';

import { graphQl } from '../../utils';

const mapStateToProps = (state /*, ownProps*/) => {
  const corState = state.visualizations.codeOwnershipRiver.state;

  return {
    issues: corState.data.issues,
    overlay: corState.config.overlay,
    highlightedIssue: corState.config.highlightedIssue,
    commitAttribute: corState.config.commitAttribute
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onSetOverlay: overlay => dispatch(setOverlay(overlay)),
    onSetHighlightedIssue: issue => dispatch(setHighlightedIssue(issue)),
    onChangeCommitAttribute: attr => dispatch(setCommitAttribute(attr))
  };
};

const CodeOwnershipRiverConfigComponent = props => {
  return (
    <div className={styles.configContainer}>
      <form>
        <div className="field">
          <div className="control">
            <label className="label">Categorize commits by:</label>
            <label className="radio">
              <input
                name="commitAttribute"
                type="radio"
                checked={props.commitAttribute === 'count'}
                onChange={() => props.onChangeCommitAttribute('count')}
              />
              Count
            </label>
            <label className="radio">
              <input
                name="commitAttribute"
                type="radio"
                checked={props.commitAttribute === 'changes'}
                onChange={() => props.onChangeCommitAttribute('changes')}
              />
              Changes
            </label>
          </div>
        </div>

        <div className="field">
          <div className="control">
            <label className="label">Overlay:</label>
            <div className="select">
              <select value={props.overlay} onChange={e => props.onSetOverlay(e.target.value)}>
                <option value="none">None</option>
                <option value="issues">Issues</option>
                <option value="builds">CI Builds</option>
              </select>
            </div>
          </div>
        </div>

        <div className="field">
          <SearchBox
            placeholder="Highlight issue..."
            renderOption={i => `#${i.iid} ${i.title}`}
            search={text => {
              return Promise.resolve(
                graphQl.query(
                  `
                  query($q: String) {
                    issues(page: 1, perPage: 50, q: $q, sort: "DESC") {
                      data { iid title createdAt closedAt }
                    }
                  }`,
                  { q: text }
                )
              )
                .then(resp => resp.issues.data)
                .map(i => {
                  i.createdAt = new Date(i.createdAt);
                  i.closedAt = i.closedAt && new Date(i.closedAt);
                  return i;
                });
            }}
            value={props.highlightedIssue}
            onChange={issue => props.onSetHighlightedIssue(issue)}
          />
        </div>
      </form>
    </div>
  );
};

const CodeOwnershipRiverConfig = connect(mapStateToProps, mapDispatchToProps)(
  CodeOwnershipRiverConfigComponent
);

export default CodeOwnershipRiverConfig;

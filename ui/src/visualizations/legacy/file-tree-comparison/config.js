'use strict';

import { connect } from 'react-redux';
import Promise from 'bluebird';
import Database from '../../../database/database';
import SearchBox from '../../../components/SearchBox';


const mapStateToProps = (state /*, ownProps*/) => {
  const fileTreeState = state;

  return {
    fileTreeState,
  };
};

const mapDispatchToProps = (dispatch ) => {
  return {
    //onClickMetric: (metric) => dispatch(setDisplayMetric(metric)),
    //onClickCheckboxLegend: (selected) => dispatch(setSelectedAuthors(selected)),
  };
};

const ChangesConfigComponent = (props) => {
  return (
    <SearchBox
      placeholder="Select commit..."
      renderOption={(i) => `#${i.iid} ${i.title}`}
      search={(text) => {
        return Promise.resolve(Database.searchCommits(text)).map((i) => {
          i.createdAt = new Date(i.createdAt);
          i.closedAt = i.closedAt && new Date(i.closedAt);
          return i;
        });
      }}
      value={props.issue}
      onChange={(issue) => {
        if (issue !== null) {
          props.onSetIssue(issue);
        }
      }}
    />//TODO search bar
  );
};

const FileTreeConfig = connect(mapStateToProps, mapDispatchToProps)(ChangesConfigComponent);

export default FileTreeConfig;

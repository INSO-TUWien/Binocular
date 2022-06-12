"use strict";

import Promise from 'bluebird';
import SearchBox from '../../components/SearchBox';
import { useDispatch, useSelector } from 'react-redux'
import styles from "./styles.scss"
import _ from 'lodash';
import { graphQl } from '../../utils';
import { setActiveIssue } from './sagas'

export default () => {

  const dispatch = useDispatch()

  const onSetIssue = (issueId) => {
    console.log(issueId)
    dispatch(setActiveIssue(issueId))
  }

  //global state from redux store
  const expertiseState = useSelector((state) => state.visualizations.codeExpertise.state)

  return (
    <div className={styles.configContainer}>
      <form>
        <div className="field">
          <label className="label">Choose issue to visualize:</label>
          <SearchBox
            placeholder="Select issue..."
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
            value={expertiseState.data.data.issue}
            onChange={issue => {
              onSetIssue(issue)
            }}
          />
        </div>

      </form>
    </div>
  )
};

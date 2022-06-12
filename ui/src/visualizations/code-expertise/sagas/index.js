import { createAction } from "redux-actions";
import { select, throttle, fork, takeEvery } from "redux-saga/effects";
import _ from "lodash";
import Promise from "bluebird";
import { useSelector } from 'react-redux'

import {
  fetchFactory,
  timestampedActionFactory,
  mapSaga,
} from "../../../sagas/utils.js";

import { getRelatedCommits, getIssueData } from "./helper.js"





//define actions
export const requestCodeExpertiseData = createAction(
  "REQUEST_CODE_EXPERTISE_DATA"
);
export const receiveCodeExpertiseData = timestampedActionFactory(
  "RECEIVE_CODE_EXPERTISE_DATA"
);
export const receiveCodeExpertiseDataError = createAction(
  "RECEIVE_CODE_EXPERTISE_DATA_ERROR"
);

export const setActiveIssue = createAction(
  "SET_ACTIVE_ISSUE", i => i
);

export const requestRefresh = createAction("REQUEST_REFRESH");
const refresh = createAction("REFRESH");

export default function* () {
  yield fetchCodeExpertiseData()
  yield fork(watchRefreshRequests)
  yield fork(watchRefresh)
  yield fork(watchSetActiveIssue)

  //yield fork(...); for every additional watcher function
}

//mapSaga is a helper function from ui > src > sagas > utils.js that just returns a function that calls the action creator (in this case refresh)
//throttle ensures that only one refresh action will be dispatched in an interval of 2000ms
function* watchRefreshRequests() {
  yield throttle(2000, "REQUEST_REFRESH", mapSaga(refresh));
}

//everytime the refresh action is dispatched (by watchRefreshRequests()), the fetchCodeExpertiseData function is called
function* watchRefresh() {
  yield takeEvery("REFRESH", fetchCodeExpertiseData);
}

//every time the user chooses an issue in the config tab, update the displayed data
function* watchSetActiveIssue() {
  console.log("in watchSetActiveIssue")
  yield takeEvery('SET_ACTIVE_ISSUE', fetchCodeExpertiseData);
}

//fetchFactory returns a function that calls the specified function*()
// and dispatches the specified actions (requestCodeExpertiseData etc.) at appropriate points
export const fetchCodeExpertiseData = fetchFactory(
  function* () {

    const state = yield select();
    const issueId = state.visualizations.codeExpertise.state.config.activeIssueId;

    console.log("ISSUE ID IN fetchCodeExpertiseData", issueId)


    return yield Promise.join(
      getIssueData(issueId),
      getRelatedCommits(issueId)
    ).spread((issue, commits) => {

      let result = {
        'devData': {},
        'issue': issue
      }

      const commitsByStakeholders = _.groupBy(commits, (commit) => commit.signature)

      for (let stakeholder in commitsByStakeholders) {

        result['devData'][stakeholder] = {}
        result['devData'][stakeholder]['additions'] = _.reduce(commitsByStakeholders[stakeholder], (sum, commit) => {
          return sum + commit.stats.additions
        }, 0)
      }
      
      console.log(result)

      return result
    })
  },
  requestCodeExpertiseData,
  receiveCodeExpertiseData,
  receiveCodeExpertiseDataError
);

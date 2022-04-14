import { createAction } from "redux-actions";
import { select, throttle, fork, takeEvery } from "redux-saga/effects";
import _ from "lodash";
import Promise from "bluebird";

import {
  fetchFactory,
  timestampedActionFactory,
  mapSaga,
} from "../../../sagas/utils.js";

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

export const requestRefresh = createAction("REQUEST_REFRESH");
const refresh = createAction("REFRESH");

export default function* () {
  yield fetchCodeExpertiseData();
  yield fork(watchRefreshRequests);
  yield fork(watchRefresh);

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

//fetchFactory returns a function that calls the specified function*()
// and dispatches the specified actions (requestCodeExpertiseData etc.) at appropriate points
export const fetchCodeExpertiseData = fetchFactory(
  function* () {
    //fetch data from the backend

    //placeholder:
    Promise.resolve({});
  },
  requestCodeExpertiseData,
  receiveCodeExpertiseData,
  receiveCodeExpertiseDataError
);

'use strict';

import { connect } from 'react-redux';

import MilestoneReflection from './chart';
import {setMilestone} from "../sagas";

let oldState = null;

/**
*
* changes in enrichIssuesWithMilestoneData():
 * issue_inProgress & issue_done will be converted to milliseconds
 * its.assignedTo will be set
 */
export const mockIssueData = [
  // first Issue / person (with 4 persons)
  {
    vcs: {loc: 0}, ci: {totalBuild: 0, successful: 0},
    its: {timeStamps: {issue_inProgress: '2022-11-11T08:00:00', issue_done: '2022-11-12T12:00:00'}, minutesSpent: 7.7 * 1.5 *60},
  }, {
    vcs: {loc: 50}, ci: {totalBuild: 1, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-10-01T14:00:00', issue_done: '2022-10-03T11:00:00'}, minutesSpent: 9.5 *2 *60},
  }, {
    vcs: {loc: 110}, ci: {totalBuild: 1, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-10-01T14:00:00', issue_done: '2022-10-06T14:00:00'}, minutesSpent: 7 * 5.5 *60},
  }, {
    vcs: {loc: 70 *2}, ci: {totalBuild: 1, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-10-01T14:00:00', issue_done: '2022-10-02T17:00:00'}, minutesSpent: 4 *2 *60},
  },

  // second Issue / person (with 4 persons)
  {
    vcs: {loc: 0}, ci: {totalBuild: 0, successful: 0},
    its: {timeStamps: {issue_inProgress: '2022-10-12T12:30:00', issue_done: '2022-10-14T14:00:00'}, minutesSpent: 7.7 * 2 *60},
  }, {
    vcs: {loc: 80}, ci: {totalBuild: 3, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-10-03T13:00:00', issue_done: '2022-10-08T16:00:00'}, minutesSpent: 9.5 * 5 *60},
  }, {
    vcs: {loc: 180}, ci: {totalBuild: 2, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-10-06T14:10:00', issue_done: '2022-10-10T08:00:00'}, minutesSpent: 7 * 3.5 *60},
  }, {
    vcs: {loc: 40}, ci: {totalBuild: 2, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-10-13T08:00:00', issue_done: '2022-10-14T08:00:00'}, minutesSpent: 7.5 *1 *60},
  },

  // third Issue / person (with 4 persons)
  {
    vcs: {loc: 15}, ci: {totalBuild: 4, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-11-13T08:00:00', issue_done: '2022-11-14T08:00:00'}, minutesSpent: 230},
  }, {
    vcs: {loc: 22}, ci: {totalBuild: 6, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-10-08T09:00:00', issue_done: '2022-10-14T08:00:00'}, minutesSpent: 8.5 * 6 *60},
  }, {
    vcs: {loc: 220}, ci: {totalBuild: 1, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-10-10T09:00:00', issue_done: '2022-10-14T10:00:00'}, minutesSpent: 7 * 4 *60},
  }, {
    vcs: {loc: 15}, ci: {totalBuild: 4, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-11-13T08:00:00', issue_done: '2022-11-14T08:00:00'}, minutesSpent: 230},
  },

  // fourth Issue / person (with 4 persons)
  {
    vcs: {loc: 15}, ci: {totalBuild: 4, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-10-01T08:00:00', issue_done: '2022-10-04T08:00:00'}, minutesSpent: 230},
  }, {
    vcs: {loc: 15}, ci: {totalBuild: 4, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-10-12T08:00:00', issue_done: '2022-10-13T13:55:00'}, minutesSpent: 230},
  }, {
    vcs: {loc: 15}, ci: {totalBuild: 4, successful: 3},
    its: {timeStamps: {issue_inProgress: '2022-10-15T08:00:00', issue_done: '2022-10-19T08:00:00'}, minutesSpent: 7 * 4 *60},
  }, {
    vcs: {loc: 15}, ci: {totalBuild: 4, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-10-16T08:00:00', issue_done: '2022-10-18T08:00:00'}, minutesSpent: 230},
  },

  // fifth Issue / person (with 4 persons)

  {
    vcs: {loc: 15}, ci: {totalBuild: 4, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-10-05T08:00:00', issue_done: '2022-10-07T08:00:00'}, minutesSpent: 7 * 2 *60},
  }, {
    vcs: {loc: 15}, ci: {totalBuild: 4, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-10-13T08:00:00', issue_done: '2022-09-14T08:00:00'}, minutesSpent: 230},
  }, {
    vcs: {loc: 15}, ci: {totalBuild: 4, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-11-13T08:00:00', issue_done: '2022-11-14T08:00:00'}, minutesSpent: 230},
  }, {
    vcs: {loc: 15}, ci: {totalBuild: 4, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-10-06T08:00:00', issue_done: '2022-10-08T08:00:00'}, minutesSpent: 230},
  },
];


export const mockMilestone = [
  { iid: 1, title: 'Milestone 1', rangeBegin: 0, rangeEnd: 11, begin: '2022-10-01T14:00:00', end: '2022-10-14T14:00:00'},
  { iid: 2, title: 'Milestone 1a', rangeBegin: 12, rangeEnd: 31, begin: '2022-10-01T14:00:00', end: '2022-10-14T14:00:00'},
  { iid: 3, title: 'Milestone 2', rangeBegin: 32, rangeEnd: 55, begin: '2022-10-15T14:00:00', end: '2022-10-21T14:00:00'},
];

const mockPersons = ['Bob Bodemann', 'Alice Abbing', 'Max Mustermann', 'Caesar Clown',]; // 'Durin IV.', 'Agend Smith'];

const mapStateToProps = (state) => {
  const dashboardState = state.visualizations.milestoneReflection.state;

  let milestoneIssues = [];

  if (JSON.stringify(oldState?.data?.issues) != JSON.stringify(dashboardState.data.issues) && dashboardState.data.issues.length > 0) {
    milestoneIssues = enrichIssuesWithMilestoneData(dashboardState.data.issues);
  }

  oldState = {
    config: {
      issueInfo: dashboardState.config.issueInfo,
      milestone: dashboardState.config.milestone,
    },
    data: {
      rawIssues: dashboardState.data.issues,
      milestoneIssues: milestoneIssues,
      isFetching: dashboardState.data.isFetching,
      receivedAt: dashboardState.data.receivedAt,
    },
  };


  return oldState;
};

const enrichIssuesWithMilestoneData = (issues) => {
  let mockIndex = 510;
  let newMockArr = [];
  mockMilestone.forEach((originalMilestone, index) => {

    if (issues.length < originalMilestone.rangeEnd) {
      console.error("To less issues than mockable.");
      return newMockArr;
    }

    const currMilestone = {
      iid: originalMilestone.iid,
      title: originalMilestone.title,
      beginDate: (new Date(originalMilestone.begin)).getTime(),
      endDate: (new Date(originalMilestone.end)).getTime(),
      earliestIssueDate: null,
      latestIssueDate: null,
      issuesPerPerson: [],
      personsMap: new Map(),
    }

    newMockArr.push(currMilestone);
    originalMilestone.local_arr_id = newMockArr.length -1;

    //debugger;
    // enriching current issue and overwrite existing name
    for (let i = originalMilestone.rangeBegin; i < originalMilestone.rangeEnd; i++) {
      let currIssue = issues[i];
      const newName =  mockPersons[i % mockPersons.length];

      let currentPersonIndex = currMilestone.personsMap.get(newName);
      if (currentPersonIndex == null) {
        currentPersonIndex = currMilestone.issuesPerPerson.length;
        currMilestone.personsMap.set(newName, currentPersonIndex);
        currMilestone.issuesPerPerson.push({name: newName, issueList: []})
      }

      currIssue = {...currIssue, ...mockIssueData[(i - originalMilestone.rangeBegin) % mockIssueData.length]}
      currIssue.issueName = "Issue" + mockIndex++;

      // transform mock timestamp to millsec
      currIssue.its.timeStamps.issue_inProgress = (new Date(currIssue.its.timeStamps.issue_inProgress)).getTime();
      currIssue.its.timeStamps.issue_done = (new Date(currIssue.its.timeStamps.issue_done)).getTime();

      if (currMilestone.earliestIssueDate == null || currMilestone.earliestIssueDate > currIssue.its.timeStamps.issue_inProgress) {
        currMilestone.earliestIssueDate = currIssue.its.timeStamps.issue_inProgress;
      }
      if (currMilestone.latestIssueDate == null || currMilestone.latestIssueDate < currIssue.its.timeStamps.issue_done) {
        currMilestone.latestIssueDate = currIssue.its.timeStamps.issue_done;
      }
      // mockIssueData
      // author{ additionalName: '' }
      // new Date('2022-10-13T08:00:00').getTime()
      currIssue.assignedTo = mockPersons[(i - originalMilestone.rangeBegin) % mockPersons.length];

      currMilestone.issuesPerPerson[currentPersonIndex].issueList.push(currIssue);
    }
  })

  return newMockArr;
}


const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  // todo: ui/src/index.js change default view to dashboard
  // for development:
  if(this?.dashboardState?.config?.milestone == null) {
    dispatch(setMilestone(mockMilestone[0]));
  }
  return {};
};

const ChartComponent = connect(mapStateToProps, mapDispatchToProps)(MilestoneReflection);

export default ChartComponent;

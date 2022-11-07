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
    vcs: {loc: 15}, ci: {totalBuild: 4, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-10-01T08:00:00', issue_done: '2022-10-04T08:00:00'}, minutesSpent: 60*9*3},
  }, {
    vcs: {loc: 230}, ci: {totalBuild: 1, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-10-01T08:00:00', issue_done: '2022-10-03T08:00:00'}, minutesSpent: 60*7*2},
  }, {
    vcs: {loc: 15}, ci: {totalBuild: 1, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-10-13T08:00:00', issue_done: '2022-10-14T08:00:00'}, minutesSpent: 230},
  }, {
    vcs: {loc: 15}, ci: {totalBuild: 1, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-10-13T08:00:00', issue_done: '2022-10-14T08:00:00'}, minutesSpent: 230},
  },

  // second Issue / person (with 4 persons)
  {
    vcs: {loc: 15}, ci: {totalBuild: 4, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-10-13T08:00:00', issue_done: '2022-10-14T08:00:00'}, minutesSpent: 230},
  }, {
    vcs: {loc: 15}, ci: {totalBuild: 4, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-10-13T08:00:00', issue_done: '2022-10-14T08:00:00'}, minutesSpent: 230},
  }, {
    vcs: {loc: 15}, ci: {totalBuild: 4, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-10-13T08:00:00', issue_done: '2022-10-14T08:00:00'}, minutesSpent: 230},
  }, {
    vcs: {loc: 15}, ci: {totalBuild: 4, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-10-13T08:00:00', issue_done: '2022-10-14T08:00:00'}, minutesSpent: 230},
  },

  // third Issue / person (with 4 persons)
  {
    vcs: {loc: 15}, ci: {totalBuild: 4, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-10-13T08:00:00', issue_done: '2022-10-14T08:00:00'}, minutesSpent: 230},
  }, {
    vcs: {loc: 15}, ci: {totalBuild: 4, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-10-13T08:00:00', issue_done: '2022-10-14T08:00:00'}, minutesSpent: 230},
  }, {
    vcs: {loc: 15}, ci: {totalBuild: 4, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-10-13T08:00:00', issue_done: '2022-10-14T08:00:00'}, minutesSpent: 230},
  }, {
    vcs: {loc: 15}, ci: {totalBuild: 4, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-10-13T08:00:00', issue_done: '2022-10-14T08:00:00'}, minutesSpent: 230},
  },

  // fourth Issue / person (with 4 persons)
  {
    vcs: {loc: 15}, ci: {totalBuild: 4, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-10-13T08:00:00', issue_done: '2022-10-14T08:00:00'}, minutesSpent: 230},
  }, {
    vcs: {loc: 15}, ci: {totalBuild: 4, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-10-13T08:00:00', issue_done: '2022-10-14T08:00:00'}, minutesSpent: 230},
  }, {
    vcs: {loc: 15}, ci: {totalBuild: 4, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-10-13T08:00:00', issue_done: '2022-10-14T08:00:00'}, minutesSpent: 230},
  }, {
    vcs: {loc: 15}, ci: {totalBuild: 4, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-10-13T08:00:00', issue_done: '2022-10-14T08:00:00'}, minutesSpent: 230},
  },

  // fifth Issue / person (with 4 persons)

  {
    vcs: {loc: 15}, ci: {totalBuild: 4, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-10-05T08:00:00', issue_done: '2022-10-07T08:00:00'}, minutesSpent: 230},
  }, {
    vcs: {loc: 15}, ci: {totalBuild: 4, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-10-13T08:00:00', issue_done: '2022-10-14T08:00:00'}, minutesSpent: 230},
  }, {
    vcs: {loc: 15}, ci: {totalBuild: 4, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-10-13T08:00:00', issue_done: '2022-10-14T08:00:00'}, minutesSpent: 230},
  }, {
    vcs: {loc: 15}, ci: {totalBuild: 4, successful: 1},
    its: {timeStamps: {issue_inProgress: '2022-10-06T08:00:00', issue_done: '2022-10-07T08:00:00'}, minutesSpent: 230},
  },
];


export const mockMilestone = [
  { iid: 1, title: 'Milestone 1', rangeBegin: 0, rangeEnd: 11 },
  { iid: 2, title: 'Milestone 2', rangeBegin: 12, rangeEnd: 31 },
  { iid: 3, title: 'Milestone 3', rangeBegin: 32, rangeEnd: 55 },
];

const mockPersons = ['Alice Abbing', 'Bob Bodemann', 'Caesar Clown', 'Max Mustermann',]; // 'Durin IV.', 'Agend Smith'];

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
      beginDate: null,
      endDate: null,
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

      if (currMilestone.beginDate == null || currMilestone.beginDate > currIssue.its.timeStamps.issue_inProgress) {
        currMilestone.beginDate = currIssue.its.timeStamps.issue_inProgress;
      }
      if (currMilestone.endDate == null || currMilestone.endDate < currIssue.its.timeStamps.issue_done) {
        currMilestone.endDate = currIssue.its.timeStamps.issue_done;
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

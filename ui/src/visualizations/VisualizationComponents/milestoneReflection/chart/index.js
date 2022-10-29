'use strict';

import { connect } from 'react-redux';

import MilestoneReflection from './chart';

let oldState = null;

export const mockData = [
  {
    label: 'person a',
    times: [
      { starting_time: 1355752800000, ending_time: 1355759900000 },
      { starting_time: 1355767900000, ending_time: 1355774400000 },
    ],
  },
  { label: 'person b', times: [{ starting_time: 1355759910000, ending_time: 1355761900000 }] },
  { label: 'person c', times: [{ starting_time: 1355761910000, ending_time: 1355763910000 }] },
];

export const mockIssueData = [
  {times: {issue_started: 1355752800000},},
];

export const mockMilestone = [
  { iid: 1, title: 'Milestone 1', rangeBegin: 0, rangeEnd: 12 },
  { iid: 2, title: 'Milestone 2', rangeBegin: 13, rangeEnd: 35 },
  { iid: 3, title: 'Milestone 3', rangeBegin: 36, rangeEnd: 50 },
];

const mockPersons = ['Alice Abbing', 'Bob Bodemann', 'Caesar Clown', 'Max Mustermann',]; // 'Durin IV.', 'Agend Smith'];

const mapStateToProps = (state) => {
  const dashboardState = state.visualizations.milestoneReflection.state;

  const milestoneIssues = [];

  if (JSON.stringify(oldState?.data?.issues) != JSON.stringify(dashboardState.data.issues) && dashboardState.data.issues.length > 0) {
    dashboardState.data.issues = enrichIssuesWithMilestoneData(dashboardState.data.issues);

    debugger;
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

  let newMockArr = [];
  mockMilestone.forEach((originalMilestone, index) => {

    if (issues.length < originalMilestone.rangeEnd) {
      console.error("To less issues than mockable.");
      return newMockArr;
    }

    const currMilestone = {
      iid: originalMilestone.iid,
      title: originalMilestone.title,
      beginDate: issues[originalMilestone.rangeBegin].createdAt,
      endDate: null,
      issuesPerPerson: [],
      personsMap: new Map(),
    }

    newMockArr.push(currMilestone);

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

      currIssue.assignedTo = mockPersons[i % mockPersons.length];

      console.log(currIssue);
      currMilestone.issuesPerPerson[currentPersonIndex].issueList.push(currIssue);
      debugger;
      return {};
    }

  })

  return newMockArr;
}


const mapDispatchToProps = (/*dispatch , ownProps*/) => {
  return {};
};

const ChartComponent = connect(mapStateToProps, mapDispatchToProps)(MilestoneReflection);

export default ChartComponent;

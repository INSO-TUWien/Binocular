'use strict';

export default class ListGeneration {
  static generateDeveloperList(developerData) {
    let developerListHTML = '<div><ul>';

    for (const i in developerData) {
      const developer = developerData[i];
      const color = i % 2 === 0 ? '#eeeeee' : '#dddddd';
      developerListHTML +=
        "<li style='background-color: " +
        color +
        "'>" +
        "<span style='float: left;margin-left: 5px;'>" +
        '<b>' +
        developer.dev +
        '</b>' +
        '</span>' +
        ': ' +
        "<span style='float: right;margin-right: 5px;'>" +
        developer.value +
        '</span>' +
        '</li>';
    }

    developerListHTML += '</ul></div>';
    return developerListHTML;
  }

  static generateIssueList(issueData) {
    let issueListHTML = '<div><ul>';

    for (const i in issueData) {
      const issue = issueData[i];
      const color = i % 2 === 0 ? '#eeeeee' : '#dddddd';
      issueListHTML +=
        "<li style='background-color: " +
        color +
        "'>" +
        "<span style='float: left;margin-left: 5px;'>" +
        '<b>' +
        issue.title +
        '</b>' +
        '</span>' +
        ': ' +
        "<span style='float: right;margin-right: 5px;'>" +
        issue.value +
        '</span>' +
        '</li>';
    }

    issueListHTML += '</ul></div>';
    return issueListHTML;
  }

  static generateCommitList(commitData) {
    let commitListHTML = '<div><ul>';
    commitData.forEach((commit, i) => {
      const color = i % 2 === 0 ? '#eeeeee' : '#dddddd';
      commitListHTML +=
        "<li style='background-color: " +
        color +
        "'>" +
        "<span style='display: inline-block;margin-left: 5px;word-wrap: anywhere'>" +
        commit.sha +
        '</span>' +
        '</li>';
    });

    commitListHTML += '</ul></div>';
    return commitListHTML;
  }
}

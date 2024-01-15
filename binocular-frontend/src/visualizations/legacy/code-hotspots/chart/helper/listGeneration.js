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

  static generateCommitList(commitList, commitData, currThis) {
    const list = commitList.append('ul');
    list.selectAll('*').remove();
    commitData.forEach((commit, i) => {
      const color = i % 2 === 0 ? '#eeeeee' : '#dddddd';
      const listItem = list
        .append('li')
        .style('background-color', color)
        .on('mouseover', () => {
          listItem.select('.commitInfo').style('max-height', '20rem').style('overflow-y', 'scroll');
        })
        .on('mouseout', () => {
          listItem.select('.commitInfo').style('max-height', '0').style('overflow-y', 'hidden');
        });
      listItem
        .append('span')
        .style('display', 'inline-block')
        .style('margin-left', '5px')
        .style('word-wrap', 'anywhere')
        .html(commit.sha)
        .on('click', () => {
          currThis.setState({ sha: commit.sha });
        });
      const info = listItem
        .append('div')
        .attr('class', 'commitInfo')
        .style('height', 'auto')
        .style('max-height', '0')
        .style('overflow-y', 'hidden')
        .style('overflow-x', 'hidden')
        .style('transition', '0.5s ease-in-out')
        .style('border', '1px solid #00000055')
        .style('background-color', 'white');
      info
        .append('div')
        .html(
          commit.date
            .substring(0, commit.date.length - 5)
            .split('T')
            .join(' '),
        )
        .style('font-style', 'italic')
        .style('color', '#AAAAAA');
      info.append('div').html(commit.message);
      info.append('hr');
      info.append('div').html(commit.branch);
      info.append('hr');
      info.append('div').html(commit.signature);
    });
  }
}

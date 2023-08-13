'use strict';

import React from 'react';
export default class ReverseCommands extends React.Component {
  constructor(props) {
    super(props);
    // this.filterCommits(this.props.commits,'feature/20');

    this.state = {
      branch: 'main',
    };
  }

  render() {
    const commits = this.props.filteredCommits;
    if(commits.length > 0) {
      console.log('println ',commits[0]);
    } else {
      console.log(':(');
    }

    const chart = (
      <div>
        {this.drawNode()}
      </div>
    );

    return chart;
  }

  filterCommits(commits, branchName) {
    const filtered = commits[0].filter((commit) => commit.branch === branchName);
    console.log(filtered);
    return filtered;
  }

  drawNode() {
    // Implement your circle drawing logic here
    // You might use SVG <circle> element or other methods
    return (
      <svg width="100" height="100">
        <circle cx="50" cy="50" r="40" stroke="black" strokeWidth="2" fill="red" />
      </svg>
    );
  }

  drawConnection(node,commits) {

  }

}

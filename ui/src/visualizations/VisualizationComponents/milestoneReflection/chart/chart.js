'use strict';

import React from 'react';
import Timeline from '../../../../components/Timeline/Timeline';
import { mockData } from './index';

export default class MilestoneReflection extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={{ display: 'block' }}>
        <div style={{ background: '#ffe8e8', position: 'absolute', width: '100%' }}>
          <h2>DEVELOPMENT-INFO: </h2>
          <div style={{ fontSize: '0.8rem' }}>
            <p> TODO - A stacked timeline with hover, click, and scroll events</p>
            current config selected:
            <p>config.issueInfo: {this.props.config.issueInfo}</p>
            <p>config.milestone: {this.props.config.milestone ? this.props.config.milestone.title : 'not selected'}</p>
            <p>data.issues.length: {this.props.data.rawIssues.length}</p>
          </div>
          <br />
          <br />
        </div>

        <div style={{ height: '100%', width: '100%', alignItems: 'center', display: 'flex', justifyContent: 'center' }}>
          {this.props.config?.milestone === null && <div> Please select Milestone!</div>}
          {this.props.config?.milestone !== null && <Timeline data={{ mockData }} />}
        </div>
      </div>
    );
  }
}

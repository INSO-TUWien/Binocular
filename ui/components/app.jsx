'use strict';

import React from 'react';
import Sidebar from './sidebar.jsx';

export default class App extends React.Component {


  render() {

    const visualizations = [
      { label: 'Issue Impact', id: 'ISSUE_IMPACT' },
      { label: 'Code Ownership River', id: 'CODE_OWNERSHIP_RIVER' },
      { label: 'Hotspot Dials', id: 'HOTSPOT_DIALS' }
    ];

    return <Sidebar visualizations={visualizations} activeVisualization={visualizations[0].id}/>;
  }
}

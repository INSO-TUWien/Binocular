'use strict';

import React from 'react';
import BubbleChart from '../components/BubbleChart/BubbleChart';
import ConflictOverview from '../components/ConflictOverview/ConflictOverview';
import _ from 'lodash';

export default class TeamAwareness extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      componentMounted: false,
      showModal: true,
      colors: this.createColorSchema(_.map(this.props.data.stakeholders, 'id'))
    };
  }

  componentWillUnmount() {
    this.setState({ componentMounted: false });
  }

  componentDidMount() {
    this.setState({ componentMounted: true });
  }

  // eslint-disable-next-line no-unused-vars
  componentDidUpdate(prevProps, prevState, snapshot) {
    const { componentMounted } = this.state;
    const { data: { stakeholders } } = this.props;

    if (componentMounted && prevProps.data.stakeholders !== stakeholders) {
      console.log('stakeholders changed, updating colors');
      this.setState({
        colors: this.createColorSchema(_.map(stakeholders, 'id'))
      });
    }
  }

  createColorSchema(data) {
    return new Map(
      data.map((v, i) => {
        return [v, getColor((i + 1) / data.length)];
      })
    );
  }

  render() {
    const {
      data: { stakeholders, conflicts },
      isConflictsProcessing,
      hasConflictBranchSelected,
      highlightPartners,
      highlightedStakeholders
    } = this.props;
    const { colors } = this.state;

    return (
      <div>
        <ConflictOverview
          conflicts={conflicts}
          branchSelected={hasConflictBranchSelected}
          loading={isConflictsProcessing}
          colors={colors}
          highlightPartners={highlightPartners}
        />
        <BubbleChart content={stakeholders} colors={colors} highlightedStakeholders={highlightedStakeholders} />
      </div>
    );
  }
}

function getColor(t) {
  t = Math.max(0, Math.min(1, t));
  return (
    'rgb(' +
    Math.max(0, Math.min(255, Math.round(34.61 + t * (1172.33 - t * (10793.56 - t * (33300.12 - t * (38394.49 - t * 14825.05))))))) +
    ', ' +
    Math.max(0, Math.min(255, Math.round(23.31 + t * (557.33 + t * (1225.33 - t * (3574.96 - t * (1073.77 + t * 707.56))))))) +
    ', ' +
    Math.max(0, Math.min(255, Math.round(27.2 + t * (3211.1 - t * (15327.97 - t * (27814 - t * (22569.18 - t * 6838.66))))))) +
    ')'
  );
}

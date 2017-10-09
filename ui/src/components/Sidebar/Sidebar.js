'use strict';

import _ from 'lodash';
import styles from './sidebar.css';
import PanelLink from './PanelLink.js';

import cx from 'classnames';

import CodeOwnershipRiverConfig from '../../visualizations/code-ownership-river/config.js';
import IssueImpactConfig from '../../visualizations/issue-impact/config.js';

const configs = {
  CODE_OWNERSHIP_RIVER: CodeOwnershipRiverConfig,
  ISSUE_IMPACT: IssueImpactConfig
};

const Sidebar = props => {
  const links = _.map(props.visualizations, vis => {
    return <PanelLink key={vis.id} visualization={vis} />;
  });

  const ChartConfig = configs[props.activeVisualization];

  return (
    <nav className={cx('panel', styles.sidebar)}>
      <p className="panel-heading">Visualizations</p>
      <p className="panel-tabs">
        {links}
      </p>
      <div className={cx('panel-block', styles.configuration)}>
        {props.activeVisualization in configs && <ChartConfig />}
      </div>
    </nav>
  );
};

export default Sidebar;

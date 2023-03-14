'use strict';

import _ from 'lodash';
import styles from './sidebar.css';
import PanelLink from './PanelLink.js';

import cx from 'classnames';

export default ({ visualizations, activeVisualization, onToggle, collapsed }) => {
  const links = _.map(visualizations, (vis) => <PanelLink key={vis.id} visualization={vis} />);

  const ConfigComponent = visualizations[activeVisualization].ConfigComponent;

  if (collapsed) {
    return (
      <nav style={{ flexBasis: 'auto' }} className={cx('panel', styles.sidebar)}>
        <p className={cx('panel-heading', styles['panel-heading'])}>
          <i className={cx('fas', styles['button'], 'fa-bars')} onClick={() => onToggle(!collapsed)} />
        </p>
      </nav>
    );
  }

  return (
    <nav className={cx('panel', styles.sidebar)}>
      <p className={cx('panel-heading', styles['panel-heading'])}>
        <span>Visualizations</span>
        <i
          className={cx('fas', styles['button'], 'fa-times')}
          onClick={() => {
            onToggle(!collapsed);
          }}
        />
      </p>
      <p className={cx('panel-tabs', styles['panel-tabs'])}>{links}</p>
      <div className={cx('panel-block', styles.configuration)}>{activeVisualization in visualizations && <ConfigComponent />}</div>
    </nav>
  );
};

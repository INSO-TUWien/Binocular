'use strict';

import _ from 'lodash';
import styles from './sidebar.css';
import PanelLink from './PanelLink.js';

import cx from 'classnames';

export default props => {
  const links = _.map(props.visualizations, vis => {
    return <PanelLink key={vis.id} visualization={vis} />;
  });
  const { onToggle, collapsed } = props;

  const ConfigComponent = props.visualizations[props.activeVisualization].ConfigComponent;

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
      <p className={cx('panel-tabs', styles['panel-tabs'])}>
        {links}
      </p>
      <div className={cx('panel-block', styles.configuration)}>
        {props.activeVisualization in props.visualizations && <ConfigComponent />}
      </div>
    </nav>
  );
};

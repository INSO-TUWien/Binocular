'use strict';

import cx from 'classnames';

import styles from './styles.scss';

export default () =>
  <div className={cx('box', styles.help)}>
    <h1 className="title">Dashboard Help</h1>
    <p>
      You can see multiple charts, showing CI (Continuous Integration) builds (split by succeeded/failed),
      issues (split by opened/closed) and Commit Changes (split by developer) over time.
    </p>

    <h2>Interaction</h2>
    <ul>
      <li>
        <i className="fa fa-hand-rock" /> Click and drag on a diagram to zoom in. Double-click to reset.
      </li>
    </ul>

    <h2>Sidebar</h2>
    <p>Use the sidebar to switch through chart resolutions. The resolution changes how data is aggregated.</p>
    <p>Tick "Show developers in CI Builds" to not only show when runs succeded/failed, but who caused them to suceed/fail.</p>
    <p>Filter issues by open or closed. Open will only show issues that are open today, closed will do the same with closed issues.</p>
    <p>Use the legend in changes to see who is who, and untick developers to hide them from the graphs. Use the buttons on the bototm
    to select or deselect all developers.</p>
    <p>You can swap the change measurement between number of lines changed and number of commits.</p>
    <ul>
      <li>When "# commits" is selected, commits are graphed according to their absolute counts</li>
      <li>
        When "# lines changed" is selected, commits are graphed according to the relative amount of changes
        (i.e., number of lines changed) by each author.
      </li>
    </ul>
  </div>;

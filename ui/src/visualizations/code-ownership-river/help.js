'use strict';

import cx from 'classnames';

import styles from './styles.scss';

export default () =>
  <div className={cx('box', styles.help)}>
    <h1 className="title">Code Ownership River Help</h1>
    <p>
      This chart shows the amount of commits created by each developer. Each developer is assigned a
      color and the respective commit counts are stacked cumulatively on the vertical axis.
    </p>

    <h2>Interaction</h2>
    <ul>
      <li>
        <i className="fa fa-expand-arrows-alt" /> Use the mouse wheel to zoom into the visualization
      </li>
      <li>
        <i className="fa fa-hand-rock" /> Drag the mouse to pan around the chart when zoomed in
      </li>
      <li>
        <i className="fa fa-keyboard" /> Press the "0" or "=" keys to reset the viewport
      </li>
    </ul>

    <p>
      The legend at the top left corner will show whatever content is currently under the mouse
      pointer.
    </p>

    <h2>Sidebar</h2>
    <p>Use the sidebar to switch toggle the categorization of commits.</p>
    <ul>
      <li>When "Commits" is selected, commits are graphed according to their absolute counts</li>
      <li>
        When "Changes" is selected, commits are graphed according to the relative amount of changes
        (i.e., number of lines changed) by each author. The total height of the commit graph is
        still measured by the absolute commit count however, in order to keep consistent with the
        other overlays.
      </li>
    </ul>

    <h3>Overlays</h3>
    <p>Use the sidebar to toggle additional overlays:</p>
    <ul>
      <li>
        <i className="fa fa-ticket-alt" /> Issue overlay: Shows the open and closed issue count on top
        of the commits. Additionally, a single issue can be highlighted from the sidebar, which will
        cause the issue's lifetime (e.g. creation until close) in the chart. Additionally, when an
        issue is highlighted, all commits associated with that issue are shown as green circles on
        the commit graph. Hover over them to get more info and click them to get to the respective
        commit in your ITS.
      </li>
      <li>
        <i className="fa fa-server" /> Builds overlay: Shows the amount of successful and
        unsuccessful builds on top of the commits.
      </li>
    </ul>
  </div>;

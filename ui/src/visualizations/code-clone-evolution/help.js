'use strict';

import cx from 'classnames';

import styles from './styles.scss';

export default () =>
  <div className={cx('box', styles.help)}>
    <h1 className="title">Code Clone Evolution Help</h1>
    <p>
      This chart shows the information about the evolution of detected code-clones (code dupliactions) over time.
    </p>

    <h2>Interaction</h2>
    <ul>
      <li>
        <i className="fa fa-arrows-v" /> Use the mouse wheel to zoom into the visualization
      </li>
      <li>
        <i className="fa fa-hand-grab-o" /> Drag the mouse to pan around the chart when zoomed in
      </li>
      <li>
        <i className="fa fa-keyboard-o" /> Press the "0" or "=" keys to reset the viewport
      </li>
    </ul>

    <p>
      The legend at the top left corner will show whatever content is currently under the mouse
      pointer.
    </p>

    <h2>Sidebar</h2>
    <p>Use the sidebar to change the search filter settings.</p>
    <ul>
      <li>xxx</li>
      <li>yyy</li>
    </ul>
  </div>;

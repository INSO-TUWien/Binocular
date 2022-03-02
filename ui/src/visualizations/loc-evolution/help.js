'use strict';

import cx from 'classnames';

import styles from './styles.scss';

export default () =>
  <div className={cx('box', styles.help)}>
    <h1 className="title">LoC-Evolution Help</h1>
    <p>
      This chart shows the size of individual files inside a chosen folder with the fluctuation over their Line-of-Code size over time.
      Each file is represented as a differently coloured stream in the Visualisation.
    </p>

    <h2>Interaction</h2>
    <ul>
      <li>
        <i className="fa fa-expand-arrows-alt" /> Use the mouse to show you the values of a given file on a given date by hovering over it.
      </li>
      <li>
        <i className="fa fa-hand-rock" /> Select different Folders from the legend on the left to be displayed.
      </li>
    </ul>

    <p>The legend at the top left corner will show whatever content is currently under the mouse pointer.</p>

    <h2>Sidebar</h2>
    <p>Use the sidebar to switch between different folders.</p>
    <ul>
      <li>When a new folder is selected the Visualisation is updated and will show the graph for the selected folder.</li>
    </ul>
  </div>;

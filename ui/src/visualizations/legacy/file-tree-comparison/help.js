'use strict';

import cx from 'classnames';

import styles from './styles.scss';

export default () =>
  <div className={cx('box', styles.help)}>
    <h1 className="title">FileTreeComparison Help</h1>
    <p>This tool allows to compare two different commits' file tree.</p>

    <h2>Usage</h2>
    <ul>
      <li>
        Select the first commit. Next to the commit the commiter and the date stamp is displayed.
        The right list is then automatically adjusted to only display commits <i>after</i> the selected one.
        The first file tree is then displayed.
      </li>
      <li>Select the second commit. You will now see both file trees with marked files.</li>
    </ul>

    <h2>Sidebar</h2>
    <p>Use the sidebar to switch a toggle, search for paths or view the changed files.</p>
    <ul>
      <li>You can search for files/folders/extensions and whole paths.</li>
      <li>You can hide the non changed files.</li>
      <li>In the middle, there is a list of all the changes including the full file path.</li>
      <li>At the bottom there is a legend for the colors used.</li>
    </ul>
  </div>;

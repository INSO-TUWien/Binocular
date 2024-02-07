'use strict';

import cx from 'classnames';

import styles from '../../styles/styles.module.scss';
import helpStyles from './styles/help.module.scss';
import settingsIcon from './assets/settings.svg';
import filterIcon from './assets/filter.svg';
import React from 'react';

export default () => (
  <div className={cx('box', styles.help)}>
    <h1 className="title">Dashboard Help</h1>
    <p>
      The Dashboard of Binocular gives you the ability to view multiple visualizations at the same time and lets you compare their data. The
      state how you configured the dashboard will be saved in the local storage of your browser so when you open it the next time it will
      look like just like you left it.
    </p>
    <h2>Add Visualizations</h2>
    <p>
      When you first open Binocular your Dashboard will be empty. On the top of the window you will find two Buttons. One for adding a
      visualization to the dashboard and one for resting the dashboard to its default state. If you want to add a visualization to the
      Dashboard you simply press the <span className={helpStyles.plusButton}>+</span> button and select the visualization you want to add to
      the dashboard. If you are wondering why not all visualizations are avaliable here some of the more complex visualizations dont make
      sense to display nested within the dashboard. If you want to view those visualizations pleas consolidate the individual visualization
      page.
    </p>
    <p>
      <h3>Load Default Dashboard</h3>
      <p>
        It is also possible to load the default state of the dashboard by pressing the "Load Default Dashboard" button. The default state
        consists of the changes, the issues and the builds visualization.
      </p>
    </p>
    <h2>Manage Visualizations</h2>
    <p>You can manage your visualizations that you added to the dashboard though multiple ways:</p>
    <p>
      <h3>Reorder Visualizations</h3>
      <p>
        To reorder your visualization you can just drag the visualization you want to move to the position it belongs by grabbing it on the
        top bar. A blue dotted line will appear when the visualization is able to be dropped.
      </p>
      <h3>Visualization Panel Settings</h3>
      <p>
        On the top right of each visualization panel you see two buttons. The left of the two Buttons (
        <img className={helpStyles.inlineIcon} src={filterIcon}></img>) will toggle between if the Universal settings effect the
        visualization or not. By toggling it, it is possible to have the same visualization two times in the dashboard displaying different
        data. The second button (<img className={helpStyles.inlineIcon} src={settingsIcon}></img>) on the other hand will open a small
        settings dropdown where you can change the size of a visualization or delete it from the dashboard.
      </p>
    </p>
    <h2>Universal Settings</h2>
    <p>
      In the config panel on the right on the top you will find the Universal Settings. Other than the individual config options for all the
      visualizations that follow below the Universal Settings changes here will effect all supported Visualizations. this is especially
      handy when comparing data between multiple different visualizations. The Universal Settings also will allow you to merge different
      committers if they for example committed from different signatures. Supported visualizations then will display the data of those
      signatures as one.
    </p>
  </div>
);

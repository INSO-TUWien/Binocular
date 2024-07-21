'use strict';

import cx from 'classnames';

import styles from './styles.module.scss';
import React from 'react';

export default () => <div className={cx('box', styles.help)}>
  <h1 className="title">Commit Time Tracking Help</h1>
  <h2>Goal of this visualization</h2>
  <p>
    The main goal of this visualization is to gain fine grained information about parts of the project, which were time
    intensive or contain 'difficult' logic. The first one is apparent from the upper chart, while the later one can be
    deducted from the lower chart using ratios for line change/minute. In order to gain more information, one can click
    on the commit nodes in the middle of the graph, which displays essential information about the commit with a link
    to the commit itself and a 'Copy sha' button (which can be used for excluding specific commits).
  </p>
  <h2>Usage of this visualization</h2>
  <p>
    This visualization has a rich variety of options for filtering commits including filtering for date spans, authors,
    branches, thresholds for time, change or ratio of those, commit type and commit message and excluding merge commits
    or specific commits. This helps a great deal with finding fine grained information about the project and specific
    commits and to discover the project more easily.
    <br/><br/>
    There is also pagination implemented for the commits, since projects can have significant sizes and can possibly
    include thousands of commits. In order to navigate through the commits, use the arrows or the number input in the
    left corner of the visualization.
    <br/><br/>
    In addition to that, there are further parameters for time settings including using actual time for the chart,
    displaying ratio for lines changed/minute and setting the parameters for first commit time and max session length.
    An important note for using actual time instead of estimated one is, that the commit has to include the information
    in the form of Time-spent: [0-9]*h[0-9]*m in the commit footer (more description on that in
    <a href="https://www.conventionalcommits.org/en/v1.0.0/#summary" target="_blank">conventional commits</a>). If this
    information is not present, the time is set to be 0 minutes instead of being removed (as it could still contain
    important information about the commit).
    The last two are especially important for the time estimation method for setting the time of the first commit and
    determining the maximum time between two commits in order to decided if they belong to one session or not.
  </p>
</div>;

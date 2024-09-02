'use strict';

import styles from './styles.module.scss';

export default () => (
  <div className={'box' + ' ' + styles.help}>
    <h1 className="title">Code Expertise Help</h1>
    <p>
      This chart depicts different data points which can be used to assess which developer has the most expertise for a certain issue or
      module of the project. The chart shows:
      <ul>
        <li>
          <i className="fa fa-plus" /> Added Code
          <ul>
            <li>The size of a segment depicts the amount of code a developer has added relative to the other users</li>
          </ul>
        </li>
        <li>
          <i className="fa fa-check" /> Owned Code
          <ul>
            <li>The middle section of each segment is split</li>
            <li>The coloured part represents the amount of code the developer currently owns for the selected configuration</li>
            <li>
              The hashed part represents the amount of code the developer added to the project, but that was deleted or replaced later on
            </li>
            <li>The section therefore shows how much of the added code is still present in the project</li>
          </ul>
        </li>
        <li>
          <i class="fa fa-clipboard-list"></i> Good and Bad Commits
          <ul>
            <li>
              The size of the green arc outside the circle segment represents the amount of good commits, which are commits that
              successfully passed the CI-Pipeline
            </li>
            <li>
              The size of the red arc inside the circle segment represents the amount of bad commits, which are commits that did not pass
              the CI-Pipeline successfully
            </li>
          </ul>
        </li>
        <li>
          <i class="fa fa-code-commit"></i> Number of Commits
          <ul>
            <li>The inner dotted part of a segment depicts the number of commits relative to the other users for the current selection</li>
          </ul>
        </li>
      </ul>
    </p>

    <h2>Zooming and Panning</h2>
    <p>
      <ul>
        <li>
          <i className="fa fa-expand-arrows-alt" /> Use the mouse wheel for zooming
        </li>
        <li>
          <i className="fa fa-hand-rock" /> Click and drag to pan the chart
        </li>
        <li>
          <i className="fa fa-keyboard" /> Press the "0"-key to reset the zoom
        </li>
      </ul>
    </p>

    <h2>Interaction</h2>
    <p>
      <ul>
        <li>
          <i className="fa fa-mouse-pointer" /> Hovering over a segment shows the absolute number of owned/added lines of the developer
        </li>
        <li>
          <i className="fa fa-hand-pointer" /> Clicking on a segment reveals the details-bar
        </li>
      </ul>
    </p>

    <h2>Configuration Panel</h2>
    <p>
      The configuration panel is used to select which parts of the project should be visualized.
      <ol>
        <li>Select a branch</li>
        <li>
          Select either a mode ("Issues" or "Modules")
          <ul>
            <li>Issues: select an issue to be visualized</li>
            <li>Modules: Select one or more files/modules using the checkboxes. You can expand the blue modules by clicking on them</li>
          </ul>
        </li>
        <li>Optionally exclude merge-commits or ignore added code that is not owned.</li>
      </ol>
    </p>

    <h2>Details Panel</h2>
    <p>
      <ul>
        <li>The details panel shows more detailed information about a developer and their commits</li>
        <li>
          The panel can be opened either by clicking the grey button at the right hand side of the chart or by clicking on a segment in the
          chart
        </li>
        <li>It is also possible to select developers using the dropdown menu in the panel</li>
      </ul>
    </p>
  </div>
);

'use strict';

import cx from 'classnames';

import styles from './styles.scss';

function highlightElementByID(id, highlimit = true) {
  const elm = document.getElementById(id);
  const highlighter = document.createElement('div');
  highlighter.id = 'highlighter';
  highlighter.classList.add(styles.highlighted);
  highlighter.style.top = elm.getBoundingClientRect().y;
  highlighter.style.left = elm.getBoundingClientRect().x;

  highlighter.style.height = elm.getBoundingClientRect().height;
  if (highlimit) {
    highlighter.style.maxHeight =
      window.innerHeight - elm.getBoundingClientRect().y - document.getElementById('help').getBoundingClientRect().height;
  }
  highlighter.style.width = elm.getBoundingClientRect().width;
  document.body.appendChild(highlighter);
}

function unhighlightElementByID() {
  document.getElementById('highlighter').remove();
}

export default () =>
  <div id={'help'} className={cx('box', styles.help)}>
    <h1 className="title"> Code Hotspots Help </h1>
    <p>The Code Hotspots visualization shows different line based metrics in combination with the sourcecode od a file.</p>
    <h2>Different visualizations</h2>
    <ul>
      <li
        onMouseEnter={event => {
          highlightElementByID('CpVButton');
        }}
        onMouseLeave={event => {
          unhighlightElementByID();
        }}>
        Changes per version
      </li>
      <li
        onMouseEnter={event => {
          highlightElementByID('CpDButton');
        }}
        onMouseLeave={event => {
          unhighlightElementByID();
        }}>
        Changes per developer
      </li>
      <li
        onMouseEnter={event => {
          highlightElementByID('CpIButton');
        }}
        onMouseLeave={event => {
          unhighlightElementByID();
        }}>
        Changes per issue
      </li>
    </ul>

    <h2>Main View</h2>
    <div
      onMouseEnter={event => {
        highlightElementByID('heatmap');
      }}
      onMouseLeave={event => {
        unhighlightElementByID();
      }}>
      <h3>Code View and Heatmap</h3>
      <p>
        The code view shows the code of the currently selected file with a heatmap drawn underneath with the selected metric. For example if
        the changes per version mode the x axis gives the lines, the y axis gives the versions and the color is the number of changes that
        happened in the line and version.
      </p>
    </div>
    <div
      onMouseEnter={event => {
        highlightElementByID('barChartContainer');
      }}
      onMouseLeave={event => {
        unhighlightElementByID();
      }}>
      <h3>Column summary</h3>
      <p>
        The barchart on the top shows the summary of each column as barchart. For example in the changes per version mode it shows the
        different versions where the file was changed and the high of the column shows the changes per version
      </p>
      <p>
        Its also possible to hover over the bars to get additional information and if the changes per verison mode is selected its also
        possible to click the individual bars to show the sourcecode to the selected version.
      </p>
    </div>
    <div
      onMouseEnter={event => {
        highlightElementByID('rowSummaryContainer');
      }}
      onMouseLeave={event => {
        unhighlightElementByID();
      }}>
      <h3>Row summary</h3>
      <p>
        The row summary shows a summary over each code line to get a overview how often a specific line changed over for example the
        different versions
      </p>
      <p>Its also possible to hover over the bars to get additional information.</p>
    </div>
    <h2>Sidebar</h2>
    <div
      onMouseEnter={event => {
        highlightElementByID('branchSelector');
      }}
      onMouseLeave={event => {
        unhighlightElementByID();
      }}>
      <h3>Branch selector</h3>
      <p>Select the Branch from which you want to show the current version of the code.</p>
    </div>
    <div
      onMouseEnter={event => {
        highlightElementByID('fileSelector', false);
      }}
      onMouseLeave={event => {
        unhighlightElementByID();
      }}>
      <h3>File browser</h3>
      <p>Select the file you want to analyse. Folders are marked blue and with a folder symbol.</p>
    </div>
    <div
      onMouseEnter={event => {
        highlightElementByID('SettingsButton');
      }}
      onMouseLeave={event => {
        unhighlightElementByID();
      }}>
      <h2>Settings</h2>
      <p>In the settings it is possible to parameterize the visualization.</p>
      <h3>Parameterization parameter</h3>
      <ul>
        <li>Automatic or custom scale of the different charts</li>
        <li>Heatmap scale</li>
        <li>Column summary scale</li>
        <li>Row summary scale</li>
      </ul>
    </div>
    <p />
  </div>;

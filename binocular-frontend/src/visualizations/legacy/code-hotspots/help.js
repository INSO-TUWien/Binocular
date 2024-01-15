'use strict';

import cx from 'classnames';

import styles from '../../../styles/styles.module.scss';
import helpStyles from './css/help.module.scss';

function highlightElementByID(id, highlimit = true) {
  try {
    const elm = document.getElementById(id);
    const highlighter = document.createElement('div');
    highlighter.id = 'highlighter';
    highlighter.classList.add(helpStyles.highlighted);
    highlighter.style.top = elm.getBoundingClientRect().y;
    highlighter.style.left = elm.getBoundingClientRect().x;

    highlighter.style.height = elm.getBoundingClientRect().height;
    if (highlimit) {
      highlighter.style.maxHeight =
        window.innerHeight - elm.getBoundingClientRect().y - document.getElementById('help').getBoundingClientRect().height;
    }
    highlighter.style.width = elm.getBoundingClientRect().width;
    document.body.appendChild(highlighter);
  } catch (e) {
    console.log('Element to highlight not found!');
  }
}

function unhighlightElementByID() {
  try {
    document.getElementById('highlighter').remove();
  } catch (e) {
    console.log('Element to remove highlight not found!');
  }
}

export default () => (
  <div id={'help'} className={cx('box', styles.help)}>
    <h1 className="title"> Code Hotspots Help </h1>
    <p>The Code Hotspots visualization shows different line-based metrics in combination with the sourcecode or a file.</p>
    <h2>Different visualizations</h2>
    <p>
      <ul>
        <li
          onMouseEnter={() => {
            highlightElementByID('CpVButton');
          }}
          onMouseLeave={() => {
            unhighlightElementByID();
          }}>
          Changes per version
        </li>
        <li
          onMouseEnter={() => {
            highlightElementByID('CpDButton');
          }}
          onMouseLeave={() => {
            unhighlightElementByID();
          }}>
          Changes per developer
        </li>
        <li
          onMouseEnter={() => {
            highlightElementByID('CpIButton');
          }}
          onMouseLeave={() => {
            unhighlightElementByID();
          }}>
          Changes per issue
        </li>
      </ul>
    </p>

    <h2>Main View</h2>
    <p>
      <div
        onMouseEnter={() => {
          highlightElementByID('heatmap');
        }}
        onMouseLeave={() => {
          unhighlightElementByID();
        }}>
        <h3>Code View and Heatmap</h3>
        <p>
          The code view shows the code of the currently selected file with a heatmap drawn underneath with the selected metric. For example,
          if the changes per version mode the x-axis gives the lines, the y axis gives the versions and the colour is the number of changes
          that happened in the line and version.
        </p>
      </div>
      <div
        onMouseEnter={() => {
          highlightElementByID('barChartContainer');
        }}
        onMouseLeave={() => {
          unhighlightElementByID();
        }}>
        <h3>Column summary</h3>
        <p>
          The barchart on the top shows the summary of each column as barchart. For example, in the changes per version mode, it shows the
          different versions where the file was changed and the high of the column shows the changes per version
        </p>
        <p>
          It is also possible to hover over the bars to get additional information and if the changes per version mode is selected it is
          also possible to click the individual bars to show the sourcecode to the selected version.
        </p>
      </div>
      <div
        onMouseEnter={() => {
          highlightElementByID('rowSummaryContainer');
        }}
        onMouseLeave={() => {
          unhighlightElementByID();
        }}>
        <h3>Row summary</h3>
        <p>
          The row summary shows a summary over each code line to get an overview of how often a specific line changed over for example the
          different versions
        </p>
        <p>It is also possible to hover over the bars to get additional information.</p>
      </div>
      <div
        onMouseEnter={() => {
          highlightElementByID('chartBranchView');
        }}
        onMouseLeave={() => {
          unhighlightElementByID();
        }}>
        <h3>Branch View (Changes/Version mode only)</h3>
        <p>
          The Branch view shows a graphical overview of all the displayed versions and how they are connected in branches with each other.
          If the previous version is currently not displayed the branch view shows a dotted line.
        </p>
        <p>
          It is also possible to hover over the bars to get additional information and if the changes per version mode is selected it is
          also possible to click the individual bars to show the sourcecode to the selected version.
        </p>
      </div>
    </p>

    <h2>Sidebar</h2>
    <p>
      <div
        onMouseEnter={() => {
          highlightElementByID('branchSelector');
        }}
        onMouseLeave={() => {
          unhighlightElementByID();
        }}>
        <h3>Branch selector</h3>
        <p>Select the branch from which you want to show the current version of the code.</p>
      </div>
      <div
        onMouseEnter={() => {
          highlightElementByID('fileSelector', false);
        }}
        onMouseLeave={() => {
          unhighlightElementByID();
        }}>
        <h3>File browser</h3>
        <p>Select the file you want to analyse. Folders are marked blue and with a folder symbol.</p>
      </div>
    </p>

    <div
      onMouseEnter={() => {
        highlightElementByID('SettingsButton');
      }}
      onMouseLeave={() => {
        unhighlightElementByID();
      }}>
      <h2>Settings</h2>
      <p>In the settings, it is possible to parameterize the visualization.</p>
      <p>
        <h3>Parameterization parameter</h3>
        <ul>
          <li>
            <span>Automatic or custom scale of the different charts </span>
            <span className={styles.lightText}>
              (Select if you prefer automatic or custom scaling for all the different parts of the visualization.)
            </span>
          </li>
          <li>
            <span>Heatmap scale </span>
            <span className={styles.lightText}>
              (Only visible if you select custom data scale. Change the scale of the main heatmap visualization.)
            </span>
          </li>
          <li>
            <span>Column summary scale </span>
            <span className={styles.lightText}>
              (Only visible if you select custom data scale. Change the scale of the column chart on top of the main heatmap visualization.)
            </span>
          </li>
          <li>
            <span>Row summary scale </span>
            <span className={styles.lightText}>
              (Only visible if you select custom data scale. Change the scale of the row summary chart right of the main heatmap
              visualization.)
            </span>
          </li>
          <li>
            <span>Date Range </span>
            <span className={styles.lightText}>(Display only data from a specific period.)</span>
          </li>
          <li>
            <span>Main Visualization Mode </span>
            <span className={styles.lightText}>
              (Switch the main visualization between the default heatmap style visualization or a hunk visualization that shows you the pure
              change data.)
            </span>
          </li>
          <li>
            <span>Heatmap Style </span>
            <span className={styles.lightText}>(Change the style of the main visualization to you preferred style.)</span>
          </li>
          <li>
            <span>Heatmap Tooltips </span>
            <span className={styles.lightText}>
              (Display tooltips for each code line to give you more insights to a specific line. All data is only available if you open each
              visualization once.)
            </span>
          </li>
        </ul>
      </p>
    </div>
    <div
      onMouseEnter={() => {
        highlightElementByID('mainSearch');
      }}
      onMouseLeave={() => {
        unhighlightElementByID();
      }}>
      <h2>Main Search</h2>
      <p>
        Search for versions, developers, issues or specific lines. It is also possible to use a search modifier to make your search even
        more accurate. To use a search modifier just type -[modifier] followed by a space followed by the search term.
      </p>
      <p>
        <h3>Possible Modifier in Changes/Version mode</h3>
        <ul>
          <li>-m or -message: search for an occurrence in the commit message</li>
          <li>-s or -sha: search for a specific commit sha</li>
          <li>-d or -developer: search for a specific developer</li>
          <li>-b or -branch: search for a specific branch</li>
          <li>
            -l or -line or -lines: search for a specific line or line range. Possible search terms are linernumber, -endlinenumber,
            startlinenumber- and startlinenumber-endlinenumber
          </li>
        </ul>
        <h3>Possible Modifier in Changes/Developer mode</h3>
        <ul>
          <li>-n or -name: search for a specific developer name</li>
          <li>-e or -email: search for a specific developer email</li>
          <li>
            -l or -line or -lines: search for a specific line or line range. Possible search terms are linernumber, -endlinenumber,
            startlinenumber- and startlinenumber-endlinenumber
          </li>
        </ul>
        <h3>Possible Modifier in Changes/Issue mode</h3>
        <ul>
          <li>-t or -title: search for a specific issue title</li>
          <li>-d or -description: search for a specific issue description</li>
          <li>-i or -iid: search for a specific issue iid</li>
          <li>
            -l or -line or -lines: search for a specific line or line range. Possible search terms are linernumber, -endlinenumber,
            startlinenumber- and startlinenumber-endlinenumber
          </li>
        </ul>
      </p>
    </div>
    <div
      onMouseEnter={() => {
        highlightElementByID('fileSearch');
      }}
      onMouseLeave={() => {
        unhighlightElementByID();
      }}>
      <h2>File Search</h2>
      <p>
        Search for files in the filebrowser. It is also possible to use a search modifier to make your search even more accurate. To use a
        search modifier just type -[modifier] followed by a space followed by the search term.
      </p>
      <p>
        <h3>Possible Modifier</h3>
        <ul>
          <li>-f or -file: search for a specific file name</li>
          <li>-t or -type: search for a specific file type</li>
        </ul>
      </p>
    </div>
    <p />
  </div>
);

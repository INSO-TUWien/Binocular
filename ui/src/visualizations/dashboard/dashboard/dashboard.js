'use strict';

import React from 'react';
import styles from '../styles.scss';
import dashboardStyles from '../styles/dashboard.scss';

import settingsIcon from '../assets/settings.svg';
import filterIcon from '../assets/filter.svg';
import filterOffIcon from '../assets/filter_off.svg';
import smallVisualizationIcon from '../assets/smallVisualizationIcon.svg';
import largeVisualizationIcon from '../assets/largeVisualizationIcon.svg';
import wideVisualizationIcon from '../assets/wideVisualizationIcon.svg';
import highVisualizationIcon from '../assets/highVisualizationIcon.svg';
import deleteIcon from '../assets/deleteIcon.svg';

import VisualizationSelector from '../components/visualizationSelector';
import visualizationRegistry from '../visualizationRegistry';

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    const dashboardSaveState = JSON.parse(localStorage.getItem('dashboardState'));
    if (dashboardSaveState === null) {
      this.state = {
        visualizations: [],
        visualizationCount: 0,
        selectVisualization: false,
      };
      localStorage.setItem('dashboardState', JSON.stringify(this.state));
    } else {
      this.state = dashboardSaveState;
    }
  }

  /**
   * Update computed commit data
   * @param nextProps props that are passed
   */
  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
  }

  componentDidMount() {
    this.sortable(document.getElementById('dashboardContainer'), function (/*item*/) {});
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.sortable(document.getElementById('dashboardContainer'), function (/*item*/) {});
    localStorage.setItem('dashboardState', JSON.stringify(this.state));
  }

  render() {
    return (
      <div className={styles.chartContainer}>
        <div id={'dashboardContainer'} className={dashboardStyles.dashboard}>
          {this.state.visualizations.map(
            function (viz) {
              return this.renderVisualizationWithWindow(viz);
            }.bind(this)
          )}
        </div>
        <button id={'addVisualization'} className={dashboardStyles.addVisualization} onClick={this.openVisualizationSelector.bind(this)}>
          +
        </button>
        {this.state.selectVisualization ? (
          <VisualizationSelector
            id={'visualizationSelector'}
            close={() => {
              this.setState({ selectVisualization: false });
            }}
            addVisualization={(key) => {
              this.addVisualization(key, this.state.visualizationCount);
            }}
            visualizations={visualizationRegistry}></VisualizationSelector>
        ) : (
          ''
        )}
      </div>
    );
  }

  addVisualization(key, id) {
    const currentVisualizations = this.state.visualizations;
    let visualizationCount = this.state.visualizationCount;
    visualizationCount++;

    currentVisualizations.push({ key: key, id: id, size: 'small', universalSettings: true });
    this.setState({ visualizations: currentVisualizations, visualizationCount: visualizationCount });
  }

  renderVisualizationWithWindow(visualization) {
    return (
      <div
        id={'visualizationContainer' + visualization.id}
        className={dashboardStyles.visualizationContainer}
        style={{
          gridArea:
            visualization.size === 'large'
              ? 'span 4/span 4'
              : visualization.size === 'wide'
              ? 'span 2/span 4'
              : visualization.size === 'high'
              ? 'span 4/span 2'
              : 'span 2/span 2',
        }}>
        <div className={dashboardStyles.menuBar}>
          <div className={dashboardStyles.visualizationName}>{visualizationRegistry[visualization.key].label}</div>
          <div className={dashboardStyles.visualizationSettingsButton} onClick={this.switchVisualizationSettingsVisibility.bind(this)}>
            <img className={dashboardStyles.visualizationSettingsIcon} src={settingsIcon}></img>
          </div>
          <div
            className={dashboardStyles.visualizationSettingsButton}
            onClick={this.switchVisualizationUniversalFilterBehaviour.bind(this)}>
            <img
              title={'Enable/Disable influence of universal settings.'}
              className={dashboardStyles.visualizationSettingsIcon}
              src={visualization.universalSettings ? filterIcon : filterOffIcon}
              style={
                visualization.universalSettings
                  ? {}
                  : { filter: 'invert(20%) sepia(100%) saturate(1352%) hue-rotate(0deg) brightness(119%) contrast(119%)' }
              }></img>
          </div>
        </div>
        <div className={dashboardStyles.visualizationSettings}>
          <div
            className={
              dashboardStyles.windowSizeButton + (visualization.size === 'small' ? ' ' + dashboardStyles.windowSizeButtonSelected : '')
            }
            onClick={this.changeWindowSizeSmall.bind(this)}>
            <img className={dashboardStyles.visualizationSettingsItemIcon} src={smallVisualizationIcon}></img>Small
          </div>
          <div
            className={
              dashboardStyles.windowSizeButton + (visualization.size === 'large' ? ' ' + dashboardStyles.windowSizeButtonSelected : '')
            }
            onClick={this.changeWindowSizeLarge.bind(this)}>
            <img className={dashboardStyles.visualizationSettingsItemIcon} src={largeVisualizationIcon}></img>Large
          </div>
          <div
            className={
              dashboardStyles.windowSizeButton + (visualization.size === 'wide' ? ' ' + dashboardStyles.windowSizeButtonSelected : '')
            }
            onClick={this.changeWindowSizeWide.bind(this)}>
            <img className={dashboardStyles.visualizationSettingsItemIcon} src={wideVisualizationIcon}></img>Wide
          </div>
          <div
            className={
              dashboardStyles.windowSizeButton + (visualization.size === 'high' ? ' ' + dashboardStyles.windowSizeButtonSelected : '')
            }
            onClick={this.changeWindowSizeHigh.bind(this)}>
            <img className={dashboardStyles.visualizationSettingsItemIcon} src={highVisualizationIcon}></img>
            High
          </div>
          <hr />
          <div className={dashboardStyles.windowSizeButton} onClick={this.deleteVisualization.bind(this)}>
            <img className={dashboardStyles.visualizationSettingsItemIcon} src={deleteIcon}></img>Delete
          </div>
        </div>
        <div
          className={dashboardStyles.inside}
          draggable={'true'}
          onDragStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}>
          {React.createElement(visualizationRegistry[visualization.key].ChartComponent, {
            id: visualization.id,
            size: visualization.size,
            universalSettings: visualization.universalSettings,
          })}
        </div>
      </div>
    );
  }

  openVisualizationSelector(e) {
    this.setState({ selectVisualization: true });
    this.forceUpdate();
  }

  changeWindowSizeSmall(e) {
    this.changeVisualizationSize(e, 'small');
    this.forceUpdate();
  }

  changeWindowSizeLarge(e) {
    this.changeVisualizationSize(e, 'large');
    this.forceUpdate();
  }

  changeWindowSizeWide(e) {
    this.changeVisualizationSize(e, 'wide');
    this.forceUpdate();
  }

  changeWindowSizeHigh(e) {
    this.changeVisualizationSize(e, 'high');
    this.forceUpdate();
  }

  changeVisualizationSize(e, size) {
    this.selectButton(e.target);
    const visualizationContainer = e.target.parentNode.parentNode;
    visualizationContainer.style.gridArea =
      size === 'large' ? 'span 4/span 4' : size === 'wide' ? 'span 2/span 4' : size === 'high' ? 'span 4/span 2' : 'span 2/span 2';
    const visualizationSettings = visualizationContainer.querySelector('.' + dashboardStyles.visualizationSettings);
    visualizationSettings.classList.remove(dashboardStyles.visualizationSettingsExtended);
    const id = visualizationContainer.id.substring('visualizationContainer'.length);
    const visualizations = this.state.visualizations.map((viz) => {
      if (parseInt(viz.id) === parseInt(id)) {
        viz.size = size;
      }
      return viz;
    });
    this.state.visualizations = visualizations;
    localStorage.setItem('dashboardState', JSON.stringify(this.state));
  }

  selectButton(target) {
    for (const element of target.parentNode.children) {
      if (element.classList.contains(dashboardStyles.windowSizeButton)) {
        element.classList.remove(dashboardStyles.windowSizeButtonSelected);
      }
    }

    target.classList.add(dashboardStyles.windowSizeButtonSelected);
  }

  deleteVisualization(e) {
    this.setState({
      visualizations: this.state.visualizations.filter(
        (viz) => parseInt(viz.id) !== parseInt(e.target.parentNode.parentNode.id.substring('visualizationContainer'.length))
      ),
    });
    const visualizationSettings = e.target.parentNode.parentNode.parentNode.querySelector('.' + dashboardStyles.visualizationSettings);
    visualizationSettings.classList.remove(dashboardStyles.visualizationSettingsExtended);
  }

  switchVisualizationSettingsVisibility(e) {
    const visualizationSettings = e.target.parentNode.parentNode.parentNode.querySelector('.' + dashboardStyles.visualizationSettings);
    if (visualizationSettings.classList.contains(dashboardStyles.visualizationSettingsExtended)) {
      visualizationSettings.classList.remove(dashboardStyles.visualizationSettingsExtended);
    } else {
      visualizationSettings.classList.add(dashboardStyles.visualizationSettingsExtended);
    }
  }

  sortable(section, onUpdate) {
    let dragEl, nextEl, newPos, dragGhost;

    [...section.children].map((item) => {
      item.draggable = true;
      return document.getElementById(item.id).getBoundingClientRect();
    });
    function _onDragOver(e) {
      const target = e.target;
      if (
        target &&
        target !== dragEl &&
        target.nodeName === 'DIV' &&
        target.classList.contains(dashboardStyles.visualizationContainer) &&
        !target.classList.contains(dashboardStyles.inside)
      ) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (target.classList.contains(dashboardStyles.inside)) {
          e.stopPropagation();
        } else {
          const targetPos = target.getBoundingClientRect();
          const next =
            (e.clientY - targetPos.top) / (targetPos.bottom - targetPos.top) > 0.5 ||
            (e.clientX - targetPos.left) / (targetPos.right - targetPos.left) > 0.5;
          section.insertBefore(dragEl, (next && target.nextSibling) || target);
        }
      }
    }

    function _onDragEnd(evt) {
      evt.preventDefault();
      newPos = [...section.children].map((child) => {
        const pos = document.getElementById(child.id).getBoundingClientRect();
        return pos;
      });
      dragEl.classList.remove(dashboardStyles.ghost);
      section.removeEventListener('dragover', _onDragOver, false);
      section.removeEventListener('dragend', _onDragEnd, false);

      nextEl !== dragEl.nextSibling ? onUpdate(dragEl) : false;
      this.reorderVisualizations();
    }

    section.addEventListener(
      'dragstart',
      function (e) {
        dragEl = e.target;
        if (!dragEl.classList.contains(dashboardStyles.inside)) {
          nextEl = dragEl.nextSibling;
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('Text', dragEl.textContent);

          section.addEventListener('dragover', _onDragOver, false);
          section.addEventListener('dragend', _onDragEnd.bind(this), false);

          setTimeout(function () {
            dragEl.classList.add(dashboardStyles.ghost);
          }, 0);
        }
      }.bind(this)
    );
  }

  reorderVisualizations() {
    const newVisualizationOrder = [];
    for (const visualizationContainer of document.getElementsByClassName(dashboardStyles.visualizationContainer)) {
      const id = visualizationContainer.id.substring('visualizationContainer'.length);
      newVisualizationOrder.push(this.state.visualizations.filter((viz) => parseInt(viz.id) === parseInt(id))[0]);
    }
    this.state.visualizations = newVisualizationOrder;
    localStorage.setItem('dashboardState', JSON.stringify(this.state));
  }

  switchVisualizationUniversalFilterBehaviour(e) {
    const visualizationContainer = e.target.parentNode.parentNode.parentNode;
    const id = visualizationContainer.id.substring('visualizationContainer'.length);
    const visualizations = this.state.visualizations.map((viz) => {
      if (parseInt(viz.id) === parseInt(id)) {
        viz.universalSettings = !viz.universalSettings;
      }
      return viz;
    });
    this.state.visualizations = visualizations;
    localStorage.setItem('dashboardState', JSON.stringify(this.state));
    this.forceUpdate();
  }
}

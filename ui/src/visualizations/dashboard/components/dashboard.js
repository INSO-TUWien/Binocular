'use strict';

import React from 'react';
import styles from '../styles.scss';
import dashboardStyles from '../styles/dashboard.scss';

import settingsIcon from '../assets/settings.svg';
import smallVisualizationIcon from '../assets/smallVisualizationIcon.svg';
import largeVisualizationIcon from '../assets/largeVisualizationIcon.svg';
import wideVisualizationIcon from '../assets/wideVisualizationIcon.svg';
import deleteIcon from '../assets/deleteIcon.svg';

import VisualizationSelector from './visualizationSelector';
import visualizationRegistry from '../visualizationRegistry';

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visualizations: [],
      visualizationCount: 0,
      selectVisualization: false
    };
  }

  /**
   * Update computed commit data
   * @param nextProps props that are passed
   */
  componentWillReceiveProps(nextProps) {}

  componentDidMount() {}

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.sortable(document.getElementById('dashboardContainer'), function (item) {});
  }

  render() {
    return (
      <div className={styles.chartContainer}>
        <div id={'dashboardContainer'} className={dashboardStyles.dashboard}>
          {this.state.visualizations}
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
    currentVisualizations.push(
      <div
        id={'visualizationContainer' + visualizationCount}
        className={dashboardStyles.visualizationContainer}
        style={{ gridArea: 'span 2/span 2' }}>
        <div className={dashboardStyles.menuBar}>
          <div className={dashboardStyles.visualizationName}>{visualizationRegistry[key].label}</div>
          <div className={dashboardStyles.visualizationSettingsButton} onClick={this.switchVisualizationSettingsVisibility.bind(this)}>
            <img className={dashboardStyles.visualizationSettingsIcon} src={settingsIcon}></img>
          </div>
        </div>
        <div className={dashboardStyles.visualizationSettings}>
          <div
            className={dashboardStyles.windowSizeButton + ' ' + dashboardStyles.windowSizeButtonSelected}
            onClick={this.changeWindowSizeSmall.bind(this)}>
            <img className={dashboardStyles.visualizationSettingsItemIcon} src={smallVisualizationIcon}></img>Small
          </div>
          <div className={dashboardStyles.windowSizeButton} onClick={this.changeWindowSizeLarge.bind(this)}>
            <img className={dashboardStyles.visualizationSettingsItemIcon} src={largeVisualizationIcon}></img>Large
          </div>
          <div className={dashboardStyles.windowSizeButton} onClick={this.changeWindowSizeWide.bind(this)}>
            <img className={dashboardStyles.visualizationSettingsItemIcon} src={wideVisualizationIcon}></img>Wide
          </div>
          <hr />
          <div className={dashboardStyles.windowSizeButton} onClick={this.deleteVisualization.bind(this)}>
            <img className={dashboardStyles.visualizationSettingsItemIcon} src={deleteIcon}></img>Delete
          </div>
        </div>
        <div className={dashboardStyles.inside}>{React.createElement(visualizationRegistry[key].chart, { id: id })}</div>
      </div>
    );

    this.setState({ visualizations: currentVisualizations, visualizationCount: visualizationCount });
    //this.forceUpdate();
  }

  openVisualizationSelector(e) {
    this.setState({ selectVisualization: true });
    this.forceUpdate();
  }

  changeWindowSizeSmall(e) {
    this.selectButton(e.target);
    e.target.parentNode.parentNode.style.gridArea = 'span 2/span 2';
    const visualizationSettings = e.target.parentNode.parentNode.parentNode.querySelector('.' + dashboardStyles.visualizationSettings);
    visualizationSettings.classList.remove(dashboardStyles.visualizationSettingsExtended);
  }

  changeWindowSizeLarge(e) {
    this.selectButton(e.target);
    e.target.parentNode.parentNode.style.gridArea = 'span 4/span 4';
    const visualizationSettings = e.target.parentNode.parentNode.parentNode.querySelector('.' + dashboardStyles.visualizationSettings);
    visualizationSettings.classList.remove(dashboardStyles.visualizationSettingsExtended);
  }

  changeWindowSizeWide(e) {
    this.selectButton(e.target);
    e.target.parentNode.parentNode.style.gridArea = 'span 2/span 4';
    const visualizationSettings = e.target.parentNode.parentNode.parentNode.querySelector('.' + dashboardStyles.visualizationSettings);
    visualizationSettings.classList.remove(dashboardStyles.visualizationSettingsExtended);
  }

  deleteVisualization(e) {
    this.setState({ visualizations: this.state.visualizations.filter((viz) => viz.props.id !== e.target.parentNode.parentNode.id) });
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

  selectButton(target) {
    for (const element of target.parentNode.children) {
      if (element.classList.contains(dashboardStyles.windowSizeButton)) {
        element.classList.remove(dashboardStyles.windowSizeButtonSelected);
      }
    }

    target.classList.add(dashboardStyles.windowSizeButtonSelected);
  }

  sortable(section, onUpdate) {
    let dragEl, nextEl, newPos, dragGhost;
    [...section.children].map((item) => {
      item.draggable = true;
      return document.getElementById(item.id).getBoundingClientRect();
    });
    function _onDragOver(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      const target = e.target;
      if (target && target !== dragEl && target.nodeName === 'DIV') {
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
      console.log(newPos);
      dragEl.classList.remove(dashboardStyles.ghost);
      section.removeEventListener('dragover', _onDragOver, false);
      section.removeEventListener('dragend', _onDragEnd, false);

      nextEl !== dragEl.nextSibling ? onUpdate(dragEl) : false;
    }

    section.addEventListener('dragstart', function (e) {
      dragEl = e.target;
      nextEl = dragEl.nextSibling;

      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('Text', dragEl.textContent);

      section.addEventListener('dragover', _onDragOver, false);
      section.addEventListener('dragend', _onDragEnd, false);

      setTimeout(function () {
        dragEl.classList.add(dashboardStyles.ghost);
      }, 0);
    });
  }
}

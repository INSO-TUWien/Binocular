'use strict';

import { useDispatch, useSelector } from 'react-redux';

const DEFAULT_DASHBOARD = {
  visualizations: [
    { key: 'changes', id: 0, size: 'large', universalSettings: true },
    { key: 'issues', id: 1, size: 'small', universalSettings: true },
    { key: 'ciBuilds', id: 2, size: 'small', universalSettings: true },
  ],
};

import React, { useEffect, useState } from 'react';
import styles from '../styles.module.scss';
import dashboardStyles from '../styles/dashboard.module.scss';
import VisualizationSelector from '../components/visualizationSelector/visualizationSelector';
import visualizationRegistry from '../visualizationRegistry';

import settingsIcon from '../assets/settings.svg';
import filterIcon from '../assets/filter.svg';
import filterOffIcon from '../assets/filter_off.svg';
import smallVisualizationIcon from '../assets/smallVisualizationIcon.svg';
import largeVisualizationIcon from '../assets/largeVisualizationIcon.svg';
import wideVisualizationIcon from '../assets/wideVisualizationIcon.svg';
import highVisualizationIcon from '../assets/highVisualizationIcon.svg';
import deleteIcon from '../assets/deleteIcon.svg';

import { setActiveVisualizations, refresh } from '../sagas';

export default () => {
  const dashState = useSelector((state) => state.visualizations.dashboard.state);

  const dispatch = useDispatch();

  const onSetActiveVisualizations = (visualizations) => dispatch(setActiveVisualizations(visualizations));
  const onRefresh = () => dispatch(refresh());

  const [visualizations, setVisualizations] = useState([]);
  const [selectVisualization, setSelectVisualization] = useState(false);

  useEffect(() => {
    let dashboardSaveState = JSON.parse(localStorage.getItem('dashboardState'));
    if (dashboardSaveState === null) {
      dashboardSaveState = DEFAULT_DASHBOARD;
      localStorage.setItem('dashboardState', JSON.stringify({ visualizations: DEFAULT_DASHBOARD.visualizations }));
    }
    setVisualizations(dashboardSaveState.visualizations);
    onSetActiveVisualizations(dashboardSaveState.visualizations.map((viz) => viz.key));
  }, []);

  useEffect(() => {
    sortable(document.getElementById('dashboardContainer'), visualizations, setVisualizations);
    localStorage.setItem('dashboardState', JSON.stringify({ visualizations: visualizations }));
  });

  const addVisualization = (key, id) => {
    const currentVisualizations = visualizations;

    currentVisualizations.push({ key: key, id: visualizations.length, size: 'small', universalSettings: true });

    onSetActiveVisualizations(currentVisualizations.map((viz) => viz.key));
    setVisualizations(currentVisualizations);
  };

  const deleteVisualization = (e) => {
    const currentVisualizations = visualizations.filter(
      (viz) => parseInt(viz.id) !== parseInt(e.target.parentNode.parentNode.id.substring('visualizationContainer'.length)),
    );
    onSetActiveVisualizations(currentVisualizations.map((viz) => viz.key));
    setVisualizations(currentVisualizations);
    const visualizationSettings = e.target.parentNode.parentNode.parentNode.querySelector('.' + dashboardStyles.visualizationSettings);
    visualizationSettings.classList.remove(dashboardStyles.visualizationSettingsExtended);
    onRefresh();
  };

  const loadDefaultDashboard = (e) => {
    setVisualizations(DEFAULT_DASHBOARD.visualizations);
    onSetActiveVisualizations(DEFAULT_DASHBOARD.visualizations.map((viz) => viz.key));
    onRefresh();
  };

  const renderVisualizationWithWindow = (visualization, visualizations, setVisualizations) => {
    let style = { gridArea: 'span 1/span 1' };
    switch (visualization.size) {
      case 'large':
        style = { gridArea: 'span 2/span 2' };
        break;
      case 'wide':
        style = { gridArea: 'span 1/span 2' };
        break;
      case 'high':
        style = { gridArea: 'span 2/span 1' };
        break;
    }
    return (
      <div
        id={'visualizationContainer' + visualization.id}
        key={visualization.id}
        className={dashboardStyles.visualizationContainer}
        style={style}>
        <div id={'dropZone'} className={dashboardStyles.dropZone} style={{ display: 'none' }}>
          <span>{visualizationRegistry[visualization.key].label}</span>
          <div>
            <span>Drop Here to Insert Before!</span>
          </div>
        </div>
        <div className={dashboardStyles.menuBar}>
          <div className={dashboardStyles.visualizationName}>{visualizationRegistry[visualization.key].label}</div>
          <div className={dashboardStyles.visualizationSettingsButton} onClick={(e) => switchVisualizationSettingsVisibility(e)}>
            <img className={dashboardStyles.visualizationSettingsIcon} src={settingsIcon}></img>
          </div>
          <div
            className={dashboardStyles.visualizationSettingsButton}
            onClick={(e) => switchVisualizationUniversalFilterBehaviour(e, visualizations, setVisualizations)}>
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
            onClick={(e) => changeWindowSizeSmall(e, visualizations, setVisualizations)}>
            <img className={dashboardStyles.visualizationSettingsItemIcon} src={smallVisualizationIcon}></img>
            Small (1x1)
          </div>
          <div
            className={
              dashboardStyles.windowSizeButton + (visualization.size === 'large' ? ' ' + dashboardStyles.windowSizeButtonSelected : '')
            }
            onClick={(e) => changeWindowSizeLarge(e, visualizations, setVisualizations)}>
            <img className={dashboardStyles.visualizationSettingsItemIcon} src={largeVisualizationIcon}></img>
            Large (2x2)
          </div>
          <div
            className={
              dashboardStyles.windowSizeButton + (visualization.size === 'wide' ? ' ' + dashboardStyles.windowSizeButtonSelected : '')
            }
            onClick={(e) => changeWindowSizeWide(e, visualizations, setVisualizations)}>
            <img className={dashboardStyles.visualizationSettingsItemIcon} src={wideVisualizationIcon}></img>
            Wide (1x2)
          </div>
          <div
            className={
              dashboardStyles.windowSizeButton + (visualization.size === 'high' ? ' ' + dashboardStyles.windowSizeButtonSelected : '')
            }
            onClick={(e) => changeWindowSizeHigh(e, visualizations, setVisualizations)}>
            <img className={dashboardStyles.visualizationSettingsItemIcon} src={highVisualizationIcon}></img>
            High (2x1)
          </div>
          <hr />
          <div className={dashboardStyles.windowSizeButton} onClick={(e) => deleteVisualization(e, visualizations, setVisualizations)}>
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
  };

  const openVisualizationSelector = (e) => {
    setSelectVisualization(true);
  };

  const changeWindowSizeSmall = (e, visualizations, setVisualizations) => {
    changeVisualizationSize(e, 'small', visualizations, setVisualizations);
  };

  const changeWindowSizeLarge = (e, visualizations, setVisualizations) => {
    changeVisualizationSize(e, 'large', visualizations, setVisualizations);
  };

  const changeWindowSizeWide = (e, visualizations, setVisualizations) => {
    changeVisualizationSize(e, 'wide', visualizations, setVisualizations);
  };

  const changeWindowSizeHigh = (e, visualizations, setVisualizations) => {
    changeVisualizationSize(e, 'high', visualizations, setVisualizations);
  };

  const changeVisualizationSize = (e, size, visualizations, setVisualizations) => {
    selectButton(e.target);
    const visualizationContainer = e.target.parentNode.parentNode;
    visualizationContainer.style.gridArea =
      size === 'large' ? 'span 4/span 4' : size === 'wide' ? 'span 2/span 4' : size === 'high' ? 'span 4/span 2' : 'span 2/span 2';
    const visualizationSettings = visualizationContainer.querySelector('.' + dashboardStyles.visualizationSettings);
    visualizationSettings.classList.remove(dashboardStyles.visualizationSettingsExtended);
    const id = visualizationContainer.id.substring('visualizationContainer'.length);
    const newVisualizations = visualizations.map((viz) => {
      if (parseInt(viz.id) === parseInt(id)) {
        viz.size = size;
      }
      return viz;
    });
    setVisualizations(newVisualizations);
    localStorage.setItem('dashboardState', JSON.stringify({ visualizations: visualizations }));
  };

  const selectButton = (target) => {
    for (const element of target.parentNode.children) {
      if (element.classList.contains(dashboardStyles.windowSizeButton)) {
        element.classList.remove(dashboardStyles.windowSizeButtonSelected);
      }
    }

    target.classList.add(dashboardStyles.windowSizeButtonSelected);
  };

  const switchVisualizationSettingsVisibility = (e) => {
    const visualizationSettings = e.target.parentNode.parentNode.parentNode.querySelector('.' + dashboardStyles.visualizationSettings);
    if (visualizationSettings.classList.contains(dashboardStyles.visualizationSettingsExtended)) {
      visualizationSettings.classList.remove(dashboardStyles.visualizationSettingsExtended);
    } else {
      visualizationSettings.classList.add(dashboardStyles.visualizationSettingsExtended);
    }
  };

  const sortable = (section, visualizations, setVisualizations) => {
    let dragEl, nextEl, newPos, dragGhost;

    [...section.children].map((item) => {
      item.draggable = true;
      return document.getElementById(item.id).getBoundingClientRect();
    });
    const _onDragOver = (e) => {
      const target = e.target.parentNode.parentNode;
      if (target && target !== dragEl && target.nodeName === 'DIV' && target.classList.contains(dashboardStyles.visualizationContainer)) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        section.insertBefore(dragEl, target);
      }
    };

    const _onDragEnd = (evt, visualizations, setVisualizations) => {
      evt.preventDefault();
      removeDropZones([...section.children]);
      dragEl.classList.remove(dashboardStyles.ghost);
      section.removeEventListener('dragover', _onDragOver, false);
      section.removeEventListener('dragend', _onDragEnd, false);
      reorderVisualizations(visualizations, setVisualizations);
    };

    section.addEventListener('dragstart', (e) => {
      showDropZones([...section.children], e.target.id);
      dragEl = e.target;
      if (!dragEl.classList.contains(dashboardStyles.inside)) {
        nextEl = dragEl.nextSibling;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('Text', dragEl.textContent);

        section.addEventListener('dragover', (e) => _onDragOver(e, visualizations, setVisualizations), false);
        section.addEventListener('dragend', (e) => _onDragEnd(e, visualizations, setVisualizations), false);

        setTimeout(function () {
          dragEl.classList.add(dashboardStyles.ghost);
        }, 0);
      }
    });
  };

  const reorderVisualizations = (visualizations, setVisualizations) => {
    if (visualizations.length > 0) {
      const newVisualizationOrder = [];
      for (const visualizationContainer of document.getElementsByClassName(dashboardStyles.visualizationContainer)) {
        const id = visualizationContainer.id.substring('visualizationContainer'.length);
        newVisualizationOrder.push(visualizations.filter((viz) => parseInt(viz.id) === parseInt(id))[0]);
      }
      setVisualizations(newVisualizationOrder);
      localStorage.setItem('dashboardState', JSON.stringify({ visualizations: visualizations }));
    }
  };

  const switchVisualizationUniversalFilterBehaviour = (e, visualizations, setVisualizations) => {
    const visualizationContainer = e.target.parentNode.parentNode.parentNode;
    const id = visualizationContainer.id.substring('visualizationContainer'.length);
    const newVisualizations = visualizations.map((viz) => {
      if (parseInt(viz.id) === parseInt(id)) {
        viz.universalSettings = !viz.universalSettings;
      }
      return viz;
    });
    setVisualizations(newVisualizations);
    localStorage.setItem('dashboardState', JSON.stringify({ visualizations: visualizations }));
  };

  const showDropZones = (visualizations, currentTargetID) => {
    visualizations.forEach((item) => {
      if (item.id !== currentTargetID) {
        item.childNodes.item('dropZone').style.display = 'inline-block';
      }
    });
  };

  const removeDropZones = (visualizations) => {
    visualizations.forEach((item) => {
      item.childNodes.item('dropZone').style.display = 'none';
    });
  };

  return (
    <div className={styles.chartContainer}>
      <div className={dashboardStyles.dashboardMenu}>
        <button
          id={'addVisualization'}
          className={dashboardStyles.dashboardMenuButton + ' ' + dashboardStyles.addVisualization}
          onClick={openVisualizationSelector}>
          +
        </button>
        <button
          className={dashboardStyles.dashboardMenuButton + ' ' + dashboardStyles.dashboardMenuButtonInverted}
          onClick={loadDefaultDashboard}>
          Load Default Dashboard
        </button>
      </div>

      <div id={'dashboardContainer'} className={dashboardStyles.dashboard}>
        {visualizations.map((viz) => renderVisualizationWithWindow(viz, visualizations, setVisualizations))}
      </div>

      {selectVisualization && (
        <VisualizationSelector
          id={'visualizationSelector'}
          close={() => {
            setSelectVisualization(false);
          }}
          addVisualization={(key) => {
            addVisualization(key);
            onRefresh();
          }}
          visualizations={visualizationRegistry}></VisualizationSelector>
      )}
    </div>
  );
};

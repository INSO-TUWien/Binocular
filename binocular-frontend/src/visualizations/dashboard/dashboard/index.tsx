'use strict';

import { useDispatch, useSelector } from 'react-redux';

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

import { refresh, setActiveVisualizations } from '../sagas';
import { getDashboardSaveStateLocalStorage, setDashboardSaveStateLocalStorage } from '../../../utils/localStorage';
import { DashboardState, DashboardVisualization, DashboardVisualizationSize } from '../../../types/dashboardTypes';
import { GlobalState } from '../../../types/globalTypes';

const DEFAULT_DASHBOARD: DashboardState = {
  visualizations: [
    { key: 'changes', id: 0, size: DashboardVisualizationSize.wide, universalSettings: true },
    { key: 'issues', id: 1, size: DashboardVisualizationSize.small, universalSettings: true },
    { key: 'ciBuilds', id: 2, size: DashboardVisualizationSize.small, universalSettings: true },
  ],
};

export default () => {
  const dashState = useSelector((state: GlobalState) => state.visualizations.dashboard.state);

  const dispatch = useDispatch();

  const onSetActiveVisualizations = (visualizations) => dispatch(setActiveVisualizations(visualizations));
  const onRefresh = () => dispatch(refresh());

  const [visualizations, setVisualizations] = useState<DashboardVisualization[]>([]);
  const [selectVisualization, setSelectVisualization] = useState(false);

  useEffect(() => {
    const dashboardSaveState = getDashboardSaveStateLocalStorage(DEFAULT_DASHBOARD);
    setVisualizations(dashboardSaveState.visualizations);
    onSetActiveVisualizations(dashboardSaveState.visualizations.map((viz) => viz.key));
  }, []);

  useEffect(() => {
    sortable(document.getElementById('dashboardContainer'), visualizations, setVisualizations);
    setDashboardSaveStateLocalStorage(visualizations);
  });

  const addVisualization = (key: string) => {
    const currentVisualizations = visualizations;

    currentVisualizations.push({ key: key, id: visualizations.length, size: DashboardVisualizationSize.small, universalSettings: true });

    onSetActiveVisualizations(currentVisualizations.map((viz) => viz.key));
    setVisualizations(currentVisualizations);
  };

  const deleteVisualization = (e: any) => {
    const currentVisualizations = visualizations.filter(
      (viz) => viz.id !== parseInt(e.target.parentNode.parentNode.id.substring('visualizationContainer'.length)),
    );
    onSetActiveVisualizations(currentVisualizations.map((viz) => viz.key));
    setVisualizations(currentVisualizations);
    const visualizationSettings = e.target.parentNode.parentNode.parentNode.querySelector('.' + dashboardStyles.visualizationSettings);
    visualizationSettings.classList.remove(dashboardStyles.visualizationSettingsExtended);
    onRefresh();
  };

  const loadDefaultDashboard = () => {
    setVisualizations(DEFAULT_DASHBOARD.visualizations);
    onSetActiveVisualizations(DEFAULT_DASHBOARD.visualizations.map((viz) => viz.key));
    onRefresh();
  };

  const renderVisualizationWithWindow = (
    visualization: DashboardVisualization,
    visualizations: DashboardVisualization[],
    setVisualizations: React.Dispatch<React.SetStateAction<DashboardVisualization[]>>,
  ) => {
    let style: { gridArea: string };
    switch (visualization.size) {
      case DashboardVisualizationSize.large:
        style = { gridArea: 'span 2/span 2' };
        break;
      case DashboardVisualizationSize.wide:
        style = { gridArea: 'span 1/span 2' };
        break;
      case DashboardVisualizationSize.high:
        style = { gridArea: 'span 2/span 1' };
        break;
      default:
        style = { gridArea: 'span 1/span 1' };
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
              dashboardStyles.windowSizeButton +
              (visualization.size === DashboardVisualizationSize.small ? ' ' + dashboardStyles.windowSizeButtonSelected : '')
            }
            onClick={(e) => changeWindowSizeSmall(e, visualizations, setVisualizations)}>
            <img className={dashboardStyles.visualizationSettingsItemIcon} src={smallVisualizationIcon}></img>
            Small (1x1)
          </div>
          <div
            className={
              dashboardStyles.windowSizeButton +
              (visualization.size === DashboardVisualizationSize.large ? ' ' + dashboardStyles.windowSizeButtonSelected : '')
            }
            onClick={(e) => changeWindowSizeLarge(e, visualizations, setVisualizations)}>
            <img className={dashboardStyles.visualizationSettingsItemIcon} src={largeVisualizationIcon}></img>
            Large (2x2)
          </div>
          <div
            className={
              dashboardStyles.windowSizeButton +
              (visualization.size === DashboardVisualizationSize.wide ? ' ' + dashboardStyles.windowSizeButtonSelected : '')
            }
            onClick={(e) => changeWindowSizeWide(e, visualizations, setVisualizations)}>
            <img className={dashboardStyles.visualizationSettingsItemIcon} src={wideVisualizationIcon}></img>
            Wide (1x2)
          </div>
          <div
            className={
              dashboardStyles.windowSizeButton +
              (visualization.size === DashboardVisualizationSize.high ? ' ' + dashboardStyles.windowSizeButtonSelected : '')
            }
            onClick={(e) => changeWindowSizeHigh(e, visualizations, setVisualizations)}>
            <img className={dashboardStyles.visualizationSettingsItemIcon} src={highVisualizationIcon}></img>
            High (2x1)
          </div>
          <hr />
          <div className={dashboardStyles.windowSizeButton} onClick={(e) => deleteVisualization(e)}>
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

  const openVisualizationSelector = () => {
    setSelectVisualization(true);
  };

  const changeWindowSizeSmall = (
    e: any,
    visualizations: DashboardVisualization[],
    setVisualizations: React.Dispatch<React.SetStateAction<DashboardVisualization[]>>,
  ) => {
    changeVisualizationSize(e, DashboardVisualizationSize.small, visualizations, setVisualizations);
  };

  const changeWindowSizeLarge = (
    e: any,
    visualizations: DashboardVisualization[],
    setVisualizations: React.Dispatch<React.SetStateAction<DashboardVisualization[]>>,
  ) => {
    changeVisualizationSize(e, DashboardVisualizationSize.large, visualizations, setVisualizations);
  };

  const changeWindowSizeWide = (
    e: any,
    visualizations: DashboardVisualization[],
    setVisualizations: React.Dispatch<React.SetStateAction<DashboardVisualization[]>>,
  ) => {
    changeVisualizationSize(e, DashboardVisualizationSize.wide, visualizations, setVisualizations);
  };

  const changeWindowSizeHigh = (
    e: any,
    visualizations: DashboardVisualization[],
    setVisualizations: React.Dispatch<React.SetStateAction<DashboardVisualization[]>>,
  ) => {
    changeVisualizationSize(e, DashboardVisualizationSize.high, visualizations, setVisualizations);
  };

  const changeVisualizationSize = (
    e: any,
    size: DashboardVisualizationSize,
    visualizations: DashboardVisualization[],
    setVisualizations: React.Dispatch<React.SetStateAction<DashboardVisualization[]>>,
  ) => {
    selectButton(e.target);
    const visualizationContainer = e.target.parentNode.parentNode;
    visualizationContainer.style.gridArea =
      size === DashboardVisualizationSize.large
        ? 'span 4/span 4'
        : size === DashboardVisualizationSize.wide
          ? 'span 2/span 4'
          : size === DashboardVisualizationSize.high
            ? 'span 4/span 2'
            : 'span 2/span 2';
    const visualizationSettings = visualizationContainer.querySelector('.' + dashboardStyles.visualizationSettings);
    visualizationSettings.classList.remove(dashboardStyles.visualizationSettingsExtended);
    const id = visualizationContainer.id.substring('visualizationContainer'.length);
    const newVisualizations = visualizations.map((viz) => {
      if (viz.id === parseInt(id)) {
        viz.size = size;
      }
      return viz;
    });
    setVisualizations(newVisualizations);
  };

  const selectButton = (target: HTMLElement) => {
    if (target.parentNode !== null) {
      for (const element of target.parentNode.children) {
        if (element.classList.contains(dashboardStyles.windowSizeButton)) {
          element.classList.remove(dashboardStyles.windowSizeButtonSelected);
        }
      }
    }

    target.classList.add(dashboardStyles.windowSizeButtonSelected);
  };

  const switchVisualizationSettingsVisibility = (e: any) => {
    const visualizationSettings = e.target.parentNode.parentNode.parentNode.querySelector('.' + dashboardStyles.visualizationSettings);
    if (visualizationSettings.classList.contains(dashboardStyles.visualizationSettingsExtended)) {
      visualizationSettings.classList.remove(dashboardStyles.visualizationSettingsExtended);
    } else {
      visualizationSettings.classList.add(dashboardStyles.visualizationSettingsExtended);
    }
  };

  const sortable = (
    section: HTMLElement | null,
    visualizations: DashboardVisualization[],
    setVisualizations: React.Dispatch<React.SetStateAction<DashboardVisualization[]>>,
  ) => {
    let dragEl: HTMLElement;
    let nextEl: ChildNode | null;

    if (section === null) {
      return;
    }

    [...section.children].map((item: any) => {
      item.draggable = true;
      return document.getElementById(item.id)?.getBoundingClientRect();
    });
    function _onDragOver(e: any) {
      if (section === null) {
        return;
      }
      const target = e.target.parentNode.parentNode;
      if (target && target !== dragEl && target.nodeName === 'DIV' && target.classList.contains(dashboardStyles.visualizationContainer)) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        section.insertBefore(dragEl, target);
      }
    }

    function _onDragEnd(e: any) {
      if (section === null) {
        return;
      }
      e.preventDefault();
      removeDropZones([...section.children]);
      dragEl.classList.remove(dashboardStyles.ghost);
      section.removeEventListener('dragover', _onDragOver, false);
      section.removeEventListener('dragend', _onDragEnd, false);
      reorderVisualizations(visualizations, setVisualizations);
    }

    section.addEventListener('dragstart', (e: any) => {
      showDropZones([...section.children], e.target.id);
      dragEl = e.target;
      if (!dragEl.classList.contains(dashboardStyles.inside)) {
        nextEl = dragEl.nextSibling;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('Text', dragEl.textContent);

        section.addEventListener('dragover', _onDragOver, false);
        section.addEventListener('dragend', _onDragEnd, false);

        setTimeout(function () {
          dragEl.classList.add(dashboardStyles.ghost);
        }, 0);
      }
    });
  };

  const reorderVisualizations = (
    visualizations: DashboardVisualization[],
    setVisualizations: React.Dispatch<React.SetStateAction<DashboardVisualization[]>>,
  ) => {
    if (visualizations.length > 0) {
      const newVisualizationOrder: DashboardVisualization[] = [];
      for (const visualizationContainer of document.getElementsByClassName(dashboardStyles.visualizationContainer)) {
        const id = visualizationContainer.id.substring('visualizationContainer'.length);
        newVisualizationOrder.push(visualizations.filter((viz) => viz.id === parseInt(id))[0]);
      }
      setVisualizations(newVisualizationOrder);
    }
  };

  const switchVisualizationUniversalFilterBehaviour = (
    e: any,
    visualizations: DashboardVisualization[],
    setVisualizations: React.Dispatch<React.SetStateAction<DashboardVisualization[]>>,
  ) => {
    const visualizationContainer = e.target.parentNode.parentNode.parentNode;
    const id = visualizationContainer.id.substring('visualizationContainer'.length);
    const newVisualizations = visualizations.map((viz) => {
      if (viz.id === parseInt(id)) {
        viz.universalSettings = !viz.universalSettings;
      }
      return viz;
    });
    setVisualizations(newVisualizations);
  };

  const showDropZones = (visualizations: any[], currentTargetID: any) => {
    visualizations.forEach((item) => {
      if (item.id !== currentTargetID) {
        item.childNodes.item('dropZone').style.display = 'inline-block';
      }
    });
  };

  const removeDropZones = (visualizations: any[]) => {
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

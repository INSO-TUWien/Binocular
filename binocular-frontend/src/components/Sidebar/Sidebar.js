'use strict';

import styles from './sidebar.module.scss';
import menu from './assets/menu.svg';
import menuWhite from './assets/menuWhite.svg';
import hideSidebar from './assets/hideSidebar.svg';

import cx from 'classnames';
import React from 'react';
import LinkList from './LinkList';
import _ from 'lodash';
import UniversalSettings from '../UniversalSettings/universalSettings';
import { getContext } from '../../utils/context';
const ctx = getContext();

export default class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visualizationSelectorActive: false,
      search: '',
      selectedViz: 0,
    };

    this.visualizationSelectorVisualizationsContainer = React.createRef();
  }

  render() {
    const { visualizations, activeVisualization, onToggle, collapsed } = this.props;
    const ConfigComponent = visualizations[activeVisualization].ConfigComponent;

    if (collapsed) {
      return (
        <div
          className={styles.showSidebar}
          onClick={(e) => {
            onToggle();
          }}>
          <img src={menuWhite} />
        </div>
      );
    } else {
      return (
        <div className={styles.sidebar}>
          <div
            className={styles.headline}
            onClick={(e) => {
              onToggle();
            }}>
            <div className={styles.headlineText}>
              <div>
                <div className={styles.headlineHint}>Repository:</div>
                <div>{ctx.repo.name}</div>
              </div>
            </div>
            <div className={styles.hideConfig}>
              <img src={hideSidebar} />
            </div>
          </div>
          <div className={styles.sidebarInnerContainer}>
            <nav>
              <div className={styles.visualizationSelectorContainer}>
                <div
                  className={cx(
                    styles.visualizationSelector,
                    this.state.visualizationSelectorActive ? styles.visualizationSelectorExtended : '',
                  )}>
                  <div
                    className={styles.visualizationSelectorCurrentVisualization}
                    onClick={(e) => {
                      let visualizationSelectorActive = this.state.visualizationSelectorActive;
                      visualizationSelectorActive = !visualizationSelectorActive;
                      this.setState({ visualizationSelectorActive: visualizationSelectorActive, search: '' });
                    }}>
                    <span className={styles.visualizationSelectorIcon}>
                      <img src={menu} />
                    </span>
                    {!this.state.visualizationSelectorActive ? (
                      <span className={styles.visualizationSelectorText}>{visualizations[activeVisualization].label}</span>
                    ) : (
                      <input
                        className={styles.visualizationSelectorSearch}
                        autoFocus={true}
                        placeholder={'Search'}
                        value={this.state.search}
                        type={'text'}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        onChange={(e) => {
                          this.setState({ search: e.target.value, selectedViz: 0 });
                        }}
                        onKeyDown={(e) => {
                          let selectedViz = this.state.selectedViz;
                          if (e.key === 'Enter') {
                            const firstViz = _.filter(
                              visualizations,
                              (vis) =>
                                this.state.search === '' ||
                                vis.id.toLowerCase().includes(this.state.search.toLowerCase()) ||
                                vis.label.toLowerCase().includes(this.state.search.toLowerCase()),
                            )[selectedViz];
                            if (firstViz !== undefined) {
                              this.props.switchVisualization(firstViz.id);
                            }
                          } else if (e.key === 'ArrowUp') {
                            if (selectedViz > 0) {
                              selectedViz--;
                            }
                            this.setState({ selectedViz: selectedViz });
                          } else if (e.key === 'ArrowDown') {
                            const vizCount = _.filter(
                              visualizations,

                              (vis) =>
                                this.state.search === '' ||
                                vis.id.toLowerCase().includes(this.state.search.toLowerCase()) ||
                                vis.label.toLowerCase().includes(this.state.search.toLowerCase()),
                            ).length;
                            if (selectedViz < vizCount - 1) {
                              selectedViz++;
                            }
                            this.setState({ selectedViz: selectedViz });
                          } else if (e.key === 'Escape') {
                            this.setState({ visualizationSelectorActive: false, search: '' });
                          }
                        }}></input>
                    )}
                  </div>
                  <div
                    ref={this.visualizationSelectorVisualizationsContainer}
                    className={styles.visualizationSelectorVisualizationsContainer}>
                    <LinkList
                      visualizations={visualizations}
                      activeVisualization={activeVisualization}
                      search={this.state.search}
                      visualizationSelectorActive={this.state.visualizationSelectorActive}
                      selectedViz={this.state.selectedViz}
                    />
                  </div>
                </div>
              </div>
            </nav>
            <div className={styles.configSection}>
              {this.state.visualizationSelectorActive ? (
                <div
                  className={styles.visualizationSelectorOutsideDetector}
                  onClick={(e) => {
                    this.setState({ visualizationSelectorActive: false, search: '' });
                  }}></div>
              ) : (
                ''
              )}

              {visualizations[activeVisualization].usesUniversalSettings ? (
                <div>
                  {' '}
                  <div className={cx('panel-block', styles.configuration)}>
                    <h1>Universal Settings:</h1>
                  </div>
                  <div className={cx('panel-block', styles.configuration)}>
                    <UniversalSettings universalSettingsConfig={visualizations[activeVisualization].universalSettingsConfig} />
                  </div>
                  <div className={cx('panel-block', styles.configuration)}>
                    <h1>Visualization Specific Settings:</h1>
                  </div>
                </div>
              ) : (
                ''
              )}

              <div className={cx('panel-block', styles.configuration)}>{activeVisualization in visualizations && <ConfigComponent />}</div>
            </div>
          </div>
        </div>
      );
    }
  }
}

import React from 'react';
import settingsStyles from './settings.module.scss';
import styles from '../../styles.module.scss';
import { settings_black, settings_white } from '../../images/icons';
import DateRangeFilter from '../../../../../components/DateRangeFilter/dateRangeFilter';
import 'bulma-switch';

export default class Settings extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      displayProps: { dateRange: {} },
      gitlabSettings: { server: 'Gitlab Server', projectId: 'Project ID', apiKey: 'API Key' },
    };
  }

  componentWillReceiveProps(nextProps) {
    document.getElementById('gitlabSettingsServer').value = nextProps.gitlabSettings.server;
    document.getElementById('gitlabSettingsProjectID').value = nextProps.gitlabSettings.projectId;
    document.getElementById('gitlabSettingsApiKey').value = nextProps.gitlabSettings.apiKey;

    this.setState({ displayProps: nextProps.displayProps, gitlabSettings: nextProps.gitlabSettings });
  }

  render() {
    return (
      <span>
        <button
          id={'SettingsButton'}
          className={'button ' + styles.mg1 + ' ' + settingsStyles.settingsButton}
          onClick={(e) => {
            const target = e.currentTarget;
            const panel = target.nextSibling;
            if (document.getElementById('SettingsButton').classList.contains(settingsStyles.selected)) {
              document.getElementById('SettingsButton').classList.remove(settingsStyles.selected);
              target.innerHTML = "<span class='" + settingsStyles.icon + "'>" + settings_black + '</span>';
              panel.style.display = 'none';
            } else {
              document.getElementById('SettingsButton').classList.add(settingsStyles.selected);
              target.innerHTML = "<span class='" + settingsStyles.icon + "'>" + settings_white + '</span>';
              panel.style.display = 'inline';
            }
          }}>
          <span className={settingsStyles.icon} dangerouslySetInnerHTML={{ __html: settings_black }} />
        </button>
        <div className={settingsStyles.panel}>
          <div id={'settingsPanel'} className={settingsStyles.settingsPanel}>
            <div className={styles.headline}>
              <span>Settings</span>
              <button
                id={'SaveButton'}
                className={'button ' + settingsStyles.saveButton}
                onClick={() => {
                  console.log('Parameters saved!');
                  this.props.saveSettings(this.state.displayProps, this.state.gitlabSettings);
                }}>
                Save
              </button>
            </div>

            <hr />
            <div className={settingsStyles.scrollArea}>
              <div className={styles.label}>Data scale:</div>
              <div className="field">
                <input
                  id="dataScaleSwitch"
                  type="checkbox"
                  name="dataScaleSwitch"
                  className={'switch is-rounded is-outlined is-info'}
                  checked={!this.state.displayProps.customDataScale}
                  onClick={(e) => {
                    const currDisplayProps = this.state.displayProps;
                    if (currDisplayProps.customDataScale) {
                      document.getElementById('dataScaleContainer').classList.remove(settingsStyles.showElm);
                      document.getElementById('dataScaleContainer').classList.add(settingsStyles.hideElm);
                    } else {
                      document.getElementById('dataScaleContainer').classList.add(settingsStyles.showElm);
                      document.getElementById('dataScaleContainer').classList.remove(settingsStyles.hideElm);
                    }
                    document.getElementById('dataScaleHeatmap').value = currDisplayProps.dataScaleHeatmap;
                    document.getElementById('dataScaleColumns').value = currDisplayProps.dataScaleColumns;
                    document.getElementById('dataScaleRows').value = currDisplayProps.dataScaleRows;

                    currDisplayProps.customDataScale = !currDisplayProps.customDataScale;
                    e.target.checked = currDisplayProps.customDataScale;
                    this.setState({ displayProps: currDisplayProps });
                    this.forceUpdate();
                  }}
                />
                <label htmlFor="dataScaleSwitch" className={styles.switch}>
                  Custom / Automatic Data Scale
                </label>
              </div>
              <div id="dataScaleContainer" className={settingsStyles.shAnimation + ' ' + settingsStyles.hideElm}>
                <div className={styles.subLabel}>Heatmap Scale:</div>
                <input
                  id="dataScaleHeatmap"
                  min="0"
                  className={'input'}
                  type="number"
                  onChange={(e) => {
                    const currDisplayProps = this.state.displayProps;
                    currDisplayProps.dataScaleHeatmap = parseInt(e.target.value);
                    this.setState({ displayProps: currDisplayProps });
                  }}
                />
                <div className={styles.subLabel}>Column summary Scale:</div>
                <input
                  id="dataScaleColumns"
                  min="0"
                  className={'input'}
                  type="number"
                  onChange={(e) => {
                    const currDisplayProps = this.state.displayProps;
                    currDisplayProps.dataScaleColumns = parseInt(e.target.value);
                    this.setState({ displayProps: currDisplayProps });
                  }}
                />
                <div className={styles.subLabel}>Row summary Scale:</div>
                <input
                  id="dataScaleRows"
                  min="0"
                  className={'input'}
                  type="number"
                  onChange={(e) => {
                    const currDisplayProps = this.state.displayProps;
                    currDisplayProps.dataScaleRows = parseInt(e.target.value);
                    this.setState({ displayProps: currDisplayProps });
                  }}
                />
              </div>
              <hr />
              <div className={styles.label}>Date Range:</div>
              <div>
                <DateRangeFilter
                  from={this.state.displayProps.dateRange.from}
                  to={this.state.displayProps.dateRange.to}
                  onDateChanged={(data) => {
                    const currDisplayProps = this.state.displayProps;
                    currDisplayProps.dateRange = data;
                    this.setState({ displayProps: currDisplayProps });
                  }}
                />
              </div>
              <hr />
              <div className={styles.label}>Main Visualization Mode:</div>
              <div className="field">
                <div className="buttons has-addons">
                  <button
                    id={'mainVisualizationModeHeatmap'}
                    className={
                      'button' + (this.state.displayProps.mainVisualizationMode === 0 ? ' ' + settingsStyles.buttonRowSelected : '')
                    }
                    onClick={() => {
                      document.getElementById('mainVisualizationModeHeatmap').classList.add(settingsStyles.buttonRowSelected);
                      document.getElementById('mainVisualizationModeHunks').classList.remove(settingsStyles.buttonRowSelected);
                      const currDisplayProps = this.state.displayProps;
                      currDisplayProps.mainVisualizationMode = 0;
                      document.getElementById('heatmapStyleClassic').disabled = false;
                      document.getElementById('heatmapStyleCompact').disabled = false;
                      document.getElementById('heatmapStyleModerate').disabled = false;
                      this.setState({ displayProps: currDisplayProps });
                    }}>
                    Heatmap
                  </button>
                  <button
                    id={'mainVisualizationModeHunks'}
                    className={
                      'button' + (this.state.displayProps.mainVisualizationMode === 1 ? ' ' + settingsStyles.buttonRowSelected : '')
                    }
                    onClick={() => {
                      document.getElementById('mainVisualizationModeHeatmap').classList.remove(settingsStyles.buttonRowSelected);
                      document.getElementById('mainVisualizationModeHunks').classList.add(settingsStyles.buttonRowSelected);
                      const currDisplayProps = this.state.displayProps;
                      currDisplayProps.mainVisualizationMode = 1;
                      document.getElementById('heatmapStyleClassic').disabled = true;
                      document.getElementById('heatmapStyleCompact').disabled = true;
                      document.getElementById('heatmapStyleModerate').disabled = true;
                      this.setState({ displayProps: currDisplayProps });
                    }}>
                    Hunks
                  </button>
                </div>
                <span>Hunk view only available in Changes/Version mode!</span>
              </div>
              <hr />
              <div className={styles.label}>Heatmap Style:</div>
              <div className="field">
                <div className="buttons has-addons">
                  <button
                    id={'heatmapStyleClassic'}
                    className={'button' + (this.state.displayProps.heatMapStyle === 0 ? ' ' + settingsStyles.buttonRowSelected : '')}
                    onClick={() => {
                      document.getElementById('heatmapStyleClassic').classList.add(settingsStyles.buttonRowSelected);
                      document.getElementById('heatmapStyleCompact').classList.remove(settingsStyles.buttonRowSelected);
                      document.getElementById('heatmapStyleModerate').classList.remove(settingsStyles.buttonRowSelected);
                      const currDisplayProps = this.state.displayProps;
                      currDisplayProps.heatMapStyle = 0;
                      this.setState({ displayProps: currDisplayProps });
                    }}>
                    Classic
                  </button>
                  <button
                    id={'heatmapStyleModerate'}
                    className={'button' + (this.state.displayProps.heatMapStyle === 2 ? ' ' + settingsStyles.buttonRowSelected : '')}
                    onClick={() => {
                      document.getElementById('heatmapStyleClassic').classList.remove(settingsStyles.buttonRowSelected);
                      document.getElementById('heatmapStyleCompact').classList.remove(settingsStyles.buttonRowSelected);
                      document.getElementById('heatmapStyleModerate').classList.add(settingsStyles.buttonRowSelected);
                      const currDisplayProps = this.state.displayProps;
                      currDisplayProps.heatMapStyle = 2;
                      this.setState({ displayProps: currDisplayProps });
                    }}>
                    Moderate
                  </button>
                  <button
                    id={'heatmapStyleCompact'}
                    className={'button' + (this.state.displayProps.heatMapStyle === 1 ? ' ' + settingsStyles.buttonRowSelected : '')}
                    onClick={() => {
                      document.getElementById('heatmapStyleClassic').classList.remove(settingsStyles.buttonRowSelected);
                      document.getElementById('heatmapStyleCompact').classList.add(settingsStyles.buttonRowSelected);
                      document.getElementById('heatmapStyleModerate').classList.remove(settingsStyles.buttonRowSelected);
                      const currDisplayProps = this.state.displayProps;
                      currDisplayProps.heatMapStyle = 1;
                      this.setState({ displayProps: currDisplayProps });
                    }}>
                    Compact
                  </button>
                </div>
              </div>
              <hr />
              <div className={styles.label}>Heatmap Tooltips:</div>
              <div className="field">
                <input
                  id="heatmapTooltipsSwitch"
                  type="checkbox"
                  name="heatmapTooltipsSwitch"
                  className={'switch is-rounded is-outlined is-info'}
                  checked={this.state.displayProps.heatmapTooltips}
                  onClick={(e) => {
                    const currDisplayProps = this.state.displayProps;

                    currDisplayProps.heatmapTooltips = !currDisplayProps.heatmapTooltips;
                    e.target.checked = currDisplayProps.heatmapTooltips;
                    this.setState({ displayProps: currDisplayProps });
                    this.forceUpdate();
                  }}
                />
                <label htmlFor="heatmapTooltipsSwitch" className={styles.switch} />
              </div>
              <hr />
              <div className={styles.label}>Gitlab Settings:</div>
              <span>Gitlab Server:</span>
              <input
                className="input"
                id={'gitlabSettingsServer'}
                type="text"
                placeholder={'Gitlab Server'}
                disabled={this.state.gitlabSettings.configAvailable}
                defaultValue={this.state.gitlabSettings.server}
                onChange={(e) => {
                  const gitlabSettings = this.state.gitlabSettings;
                  gitlabSettings.server = e.target.value;
                  this.setState({ gitlabSettings: gitlabSettings });
                }}
              />
              <span>Project ID:</span>
              <input
                className="input"
                id={'gitlabSettingsProjectID'}
                type="text"
                placeholder={'Project ID'}
                disabled={this.state.gitlabSettings.configAvailable}
                defaultValue={this.state.gitlabSettings.projectId}
                onChange={(e) => {
                  const gitlabSettings = this.state.gitlabSettings;
                  gitlabSettings.projectId = e.target.value;
                  this.setState({ gitlabSettings: gitlabSettings });
                }}
              />
              <span>API Key:</span>
              <input
                className="input"
                id={'gitlabSettingsApiKey'}
                type="text"
                placeholder={'API Key'}
                defaultValue={this.state.gitlabSettings.apiKey}
                onChange={(e) => {
                  const gitlabSettings = this.state.gitlabSettings;
                  gitlabSettings.apiKey = e.target.value;
                  this.setState({ gitlabSettings: gitlabSettings });
                }}
              />
            </div>
          </div>
        </div>
      </span>
    );
  }
}

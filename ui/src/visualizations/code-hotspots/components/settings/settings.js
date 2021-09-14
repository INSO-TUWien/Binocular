import React from 'react';
import settingsStyles from './settings.scss';
import styles from '../../styles.scss';
import { settings_black, settings_white } from '../../images/icons';
import DateRangeFilter from '../dateRangeFilter/dateRangeFilter';
require('bulma-switch');

export default class Settings extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      displayProps: { dateRange: {} }
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ displayProps: nextProps.displayProps });
  }

  render() {
    return (
      <span>
        <button
          id={'SettingsButton'}
          className={'button ' + styles.mg1 + ' ' + settingsStyles.settingsButton}
          onClick={e => {
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
                  this.props.displayPropsChanged(this.state.displayProps);
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
                  defaultChecked={true}
                  onChange={e => {
                    if (e.target.checked) {
                      document.getElementById('dataScaleContainer').classList.remove(settingsStyles.showElm);
                      document.getElementById('dataScaleContainer').classList.add(settingsStyles.hideElm);
                    } else {
                      document.getElementById('dataScaleContainer').classList.add(settingsStyles.showElm);
                      document.getElementById('dataScaleContainer').classList.remove(settingsStyles.hideElm);
                    }
                    const currDisplayProps = this.state.displayProps;
                    document.getElementById('dataScaleHeatmap').value = currDisplayProps.dataScaleHeatmap;
                    document.getElementById('dataScaleColumns').value = currDisplayProps.dataScaleColumns;
                    document.getElementById('dataScaleRows').value = currDisplayProps.dataScaleRows;

                    currDisplayProps.customDataScale = !e.target.checked;
                    this.setState({ displayProps: currDisplayProps });
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
                  onChange={e => {
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
                  onChange={e => {
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
                  onChange={e => {
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
                  onDateChanged={data => {
                    const currDisplayProps = this.state.displayProps;
                    currDisplayProps.dateRange = data;
                    this.setState({ displayProps: currDisplayProps });
                  }}
                />
              </div>
              <hr />
              <div className={styles.label}>Heatmap Style:</div>
              <div className="field">
                <div className="buttons has-addons">
                  <button
                    id={'heatmapStyleClassic'}
                    className={'button ' + settingsStyles.buttonRowSelected}
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
                    id={'heatmapStyleCompact'}
                    className={'button'}
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
                  <button
                    id={'heatmapStyleModerate'}
                    className={'button'}
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
                </div>
                <hr />
              </div>
            </div>
          </div>
        </div>
      </span>
    );
  }
}

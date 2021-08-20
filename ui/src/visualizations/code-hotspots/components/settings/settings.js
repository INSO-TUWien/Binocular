import React from 'react';
import settingsStyles from './settings.scss';
import styles from '../../styles.scss';
import { settings_black, settings_white } from '../../images/icons';
require('bulma-switch');

export default class Settings extends React.PureComponent {
  render() {
    return (
      <div className={styles.inline}>
        <button
          id={'SettingsButton'}
          className={'button ' + styles.mg1}
          onClick={e => {
            const target = e.currentTarget;
            const panel = target.nextSibling;
            if (document.getElementById('SettingsButton').classList.contains(styles.selected)) {
              document.getElementById('SettingsButton').classList.remove(styles.selected);
              target.innerHTML = "<span class='" + settingsStyles.icon + "'>" + settings_black + '</span>';
              panel.style.display = 'none';
            } else {
              document.getElementById('SettingsButton').classList.add(styles.selected);
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
                  this.props.currThis.dataScaleHeatmap = document.getElementById('dataScaleHeatmap').value;
                  this.props.currThis.dataScaleColumns = document.getElementById('dataScaleColumns').value;
                  this.props.currThis.dataScaleRow = document.getElementById('dataScaleRows').value;
                  this.props.currThis.updateParametrization = true;
                  this.props.currThis.forceUpdate();
                  console.log('Parameters saved!');
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
                  className="switch is-rounded is-outlined is-info"
                  defaultChecked="true"
                  onChange={event => {
                    if (event.target.checked) {
                      document.getElementById('dataScaleContainer').classList.remove(settingsStyles.showElm);
                      document.getElementById('dataScaleContainer').classList.add(settingsStyles.hideElm);
                      document.getElementById('dataScaleHeatmap').value = -1;
                      document.getElementById('dataScaleColumns').value = -1;
                      document.getElementById('dataScaleRows').value = -1;
                    } else {
                      document.getElementById('dataScaleContainer').classList.add(settingsStyles.showElm);
                      document.getElementById('dataScaleContainer').classList.remove(settingsStyles.hideElm);
                      document.getElementById('dataScaleHeatmap').value = this.props.currThis.dataScaleHeatmap;
                      document.getElementById('dataScaleColumns').value = this.props.currThis.dataScaleColumns;
                      document.getElementById('dataScaleRows').value = this.props.currThis.dataScaleRow;
                    }
                  }}
                />
                <label htmlFor="dataScaleSwitch">Custom / Automatic Data Scale</label>
              </div>
              <div id="dataScaleContainer" className={settingsStyles.shAnimation + ' ' + settingsStyles.hideElm}>
                <div className={styles.subLabel}>Heatmap Scale:</div>
                <input id="dataScaleHeatmap" min="0" className={'input'} type="number" />
                <div className={styles.subLabel}>Column summary Scale:</div>
                <input id="dataScaleColumns" min="0" className={'input'} type="number" />
                <div className={styles.subLabel}>Row summary Scale:</div>
                <input id="dataScaleRows" min="0" className={'input'} type="number" />
              </div>
              <hr />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

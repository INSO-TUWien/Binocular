import React from 'react';
import settingsStyles from '../../css/settings.scss'
import styles from '../../styles.scss'
import {settings_black, settings_white} from '../../images/icons'
require("bulma-switch")

export default class Settings extends React.PureComponent{

  render() {
    return <div className={styles.inline}><button id={"SettingsButton"} className={"button "+styles.mg1} onClick={(e)=>{
      let target = e.currentTarget;
      let panel = target.nextSibling;
      if(document.getElementById("SettingsButton").classList.contains(styles.selected)){
        document.getElementById("SettingsButton").classList.remove(styles.selected);
        target.innerHTML = "<span class='"+settingsStyles.icon+"'>"+settings_black+"</span>";
        panel.style.display = "none";
      }else{
        document.getElementById("SettingsButton").classList.add(styles.selected);
        target.innerHTML = "<span class='"+settingsStyles.icon+"'>"+settings_white+"</span>";
        panel.style.display = "inline";
      }

      }}><span className={settingsStyles.icon} dangerouslySetInnerHTML={{__html:settings_black}}/></button>
      <div className={settingsStyles.panel}>
        <div id={"settingsPanel"} className={settingsStyles.settingsPanel}>
          <div className={styles.headline}>Settings</div>
          <hr/>
          <div className={settingsStyles.scrollArea}>
            <div className={styles.label}>Data scale:</div>
            <div className="field">
              <input id="dataScaleSwitch" type="checkbox" name="dataScaleSwitch"
                     className="switch is-rounded is-outlined is-info" defaultChecked="true" onChange={event => {
                       let state = event.target.checked;
                       if(state){
                         document.getElementById("dataScaleContainer").classList.remove(settingsStyles.showElm);
                         document.getElementById("dataScaleContainer").classList.add(settingsStyles.hideElm);
                       }else{
                         document.getElementById("dataScaleContainer").classList.add(settingsStyles.showElm);
                         document.getElementById("dataScaleContainer").classList.remove(settingsStyles.hideElm);
                       }
                       this.props.currThis.setState({dataScaleMode: state})
              }}/>
                <label htmlFor="dataScaleSwitch">Custom / Automatic Data Scale</label>
            </div>
            <div id="dataScaleContainer" className={settingsStyles.shAnimation+" "+settingsStyles.hideElm}>
              <div className={styles.subLabel}>Heatmap Scale:</div>
              <input id="dataScaleHeatmap" min="0" className={"input"} type="number" value={this.props.state.dataScaleHeatmap} onChange={event => {
                this.props.currThis.setState({dataScaleHeatmap:event.target.value})
              }
              }/>
              <div className={styles.subLabel}>Column summary Scale:</div>
              <input id="dataScaleColumns" min="0" className={"input"} type="number" value={this.props.state.dataScaleColumns} onChange={event => {
                this.props.currThis.setState({dataScaleColumns:event.target.value})
              }
              }/>
              <div className={styles.subLabel}>Row summary Scale:</div>
              <input id="dataScaleRows" min="0" className={"input"} type="number" value={this.props.state.dataScaleRow} onChange={event => {
                this.props.currThis.setState({dataScaleRow:event.target.value})
              }
              }/>
            </div>
            <hr/>
          </div>
        </div>
      </div>
    </div>;
  }

}

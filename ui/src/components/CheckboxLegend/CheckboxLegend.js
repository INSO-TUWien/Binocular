'use strict';

import _ from 'lodash';
import React from 'react';
import Measure from 'react-measure';

import styles from './checkboxLegend.scss';

const ICON_WIDTH = 15;
const ICON_HEIGHT = 15;

export default class CheckboxLegend extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      content: props.content   //[{name: "dev1", color: "#ffffff", checked: bool}, ...]
    }
    ;
  }

  render() {
    let items = [];
    _.each(this.state.content, (elem) => {
      items.push(<CheckboxLegendLine text={elem.name} color={elem.color} checked={elem.checked}/>);
    })
    return (<div>
      <div className={styles.legend}>
        {items}
      </div>
      <div className={styles.buttonContainer}>
        <button type="button" className={[styles.changesButtonLeft, "button"].join(" ")}>Select All</button>
        <button type="button" className={[styles.changesButtonRight, "button"].join(" ")}>Deselect All</button>
      </div>
    </div>);
  }
}

class CheckboxLegendLine extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      text: props.text,
      color: props.color,
      checked: props.checked
  }
  }
  render()
  {
    return (
      <div className="checkbox-legend-line">
        <svg className={styles.icon} width={ICON_WIDTH} height={ICON_HEIGHT}>
          <rect width={ICON_HEIGHT} height={ICON_WIDTH} fill={this.state.color}/>
        </svg>
        <input type="checkbox" name={this.state.text} value={this.state.text} checked/>
        <text>{this.state.text}</text>
      </div>
    );
  }
};

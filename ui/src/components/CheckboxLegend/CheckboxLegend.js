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
      content: props.content   //[{name: "dev1 <dev1@email.com>", color: "#ffffff"}, ...] name = git signature
    }
    ;
  }

  render() {
    let items = [];
    _.each(this.props.content, (elem) => {
      items.push(<CheckboxLegendLine key={elem.name} text={elem.name} color={elem.color}/>);
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
      checked: props.checked,
      id: props.id
  }
  }
  render()
  {
    return (
      <div className={styles.checkboxLegendLine}>
        <label className={styles.field}>
          <svg className={styles.icon} width={ICON_WIDTH} height={ICON_HEIGHT}>
            <rect width={ICON_HEIGHT} height={ICON_WIDTH} fill={this.state.color}/>
          </svg>
          <input type="checkbox" name={this.state.text} value={this.state.text}/>
          {this.state.text}
        </label>
      </div>
    );
  }
};

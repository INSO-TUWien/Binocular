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
      initialized: false,
      selected: [] //[name1, name2, ...]
    }
    ;
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if(nextProps.palette && this.state.initialized === false) {
      let selected = Object.keys(nextProps.palette);
      this.setState({initialized: true, selected: selected}, () => this.props.onClick(selected));
    }
  }

  clickCallback(key){
    let checked = this.state.selected.indexOf(key) !== -1;
    if(!checked) {   //Add to selected
      let selected = this.state.selected;
      selected.push(key);
      this.setState({selected: selected}, () => this.props.onClick(selected));
    }
    else {          //Remove from selected
      let selected = this.state.selected;
      selected.splice(selected.indexOf(key),1);
      this.setState({selected: selected}, () => this.props.onClick(selected));
    }
  }

  selectAll(){
    if(this.props.palette == null)
      return;
    let selected = Object.keys(this.props.palette);
    this.setState({selected: selected}, () => this.props.onClick(selected));
  }

  deselectAll(){
    let selected = [];
    this.setState({selected: selected}, () => this.props.onClick(selected));
  }

  render() {
    let items = [];
    if(this.state.initialized) {
      _.each(Object.keys(this.props.palette), (key) => {
        if (this.state.selected.indexOf(key) > -1) {
          items.push(<CheckboxLegendLine key={key} text={key} color={this.props.palette[key]} checked={true} onClick={this.clickCallback.bind(this)}/>);
        } else {
          items.push(<CheckboxLegendLine key={key} text={key} color={this.props.palette[key]} checked={false} onClick={this.clickCallback.bind(this)}/>);
        }
      });
    }
    return (<div>
      <div className={styles.legend}>
        {items}
      </div>
      <div className={styles.buttonContainer}>
        <button type="button" onClick={this.selectAll.bind(this)} className={[styles.changesButtonLeft, "button"].join(" ")}>Select All</button>
        <button type="button" onClick={this.deselectAll.bind(this)} className={[styles.changesButtonRight, "button"].join(" ")}>Deselect All</button>
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
      id: props.id
  }
  }

  clickHandler(){
    this.props.onClick(this.state.text);
  }

  render()
  {
    return (
      <div className={styles.checkboxLegendLine}>
        <label className={styles.field}>
          <svg className={styles.icon} width={ICON_WIDTH} height={ICON_HEIGHT}>
            <rect width={ICON_HEIGHT} height={ICON_WIDTH} fill={this.state.color}/>
          </svg>
          <input type="checkbox" name={this.state.text} value={this.state.text} checked={this.props.checked} onChange={this.clickHandler.bind(this)}/>
          {this.state.text}
        </label>
      </div>
    );
  }
};

'use strict';

import _ from 'lodash';
import React from 'react';
import chroma from 'chroma-js';

import styles from './checkboxLegend.module.scss';
import LegendCompact from '../LegendCompact';

const ICON_WIDTH = 15;
const ICON_HEIGHT = 15;

/**
 * Legend with each entry containing a color, a checkbox and a name. Used for filtering of series in a chart.
 * Takes the following props:
 *  - palette (Format: {seriesName1: color, sseriesName2: color, ...})
 *            Color palette with the keys being the names that should be displayed.
 *  - onClick (Format: (arg) => {...}, arg being [seriesName1, seriesName2, ...])
 *            Callback function for when something is clicked. The function argument contains the selected entries.
 *  - split (Format: true/false)
 *            Split the colors into itself and a brighter version of itself (using chroma-js .brighten())
 *  - explanation:(string) set custom explanation
 */
export default class CheckboxLegend extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initialized: false,
      selected: [], //[name1, name2, ...]
    };
  }

  componentWillReceiveProps(nextProps) {
    this.selectData(nextProps);
  }

  componentDidMount() {
    this.selectData(this.props);
  }

  selectData(props) {
    if (props.palette && this.state.initialized === false) {
      const selected = props.selected === undefined ? Object.keys(props.palette) : props.selected;
      this.setState({ initialized: true, selected: selected }, () => this.props.onClick(selected));
    }
  }

  /**
   * onClick function for a checkbox entry
   * @param key string name of the entry that was clicked.
   */
  clickCallback(key) {
    const checked = this.state.selected.indexOf(key) !== -1;
    if (!checked) {
      //Add to selected
      const selected = this.state.selected;
      selected.push(key);
      this.setState({ selected: selected }, () => this.props.onClick(selected));
    } else {
      //Remove from selected
      const selected = this.state.selected;
      selected.splice(selected.indexOf(key), 1);
      this.setState({ selected: selected }, () => this.props.onClick(selected));
    }
  }

  selectAllAuthors() {
    if (!this.props.palette) {
      return;
    }

    const ticked = this.props.palette && Object.keys(this.props.palette).length === this.state.selected.length;
    if (ticked) {
      this.setState({ selected: [] }, () => this.props.onClick([]));
    } else {
      const selected = Object.keys(this.props.palette);
      this.setState({ selected: selected }, () => this.props.onClick(selected));
    }
  }

  render() {
    const items = [];
    if (this.state.initialized || (this.state.selected && this.state.selected.length)) {
      const otherCommitters = this.props.otherCommitters;
      _.each(Object.keys(this.props.palette), (key) => {
        let text = key;
        if (text === 'others' && otherCommitters) {
          text = '' + otherCommitters + ' Others';
        }
        items.push(
          <CheckboxLegendLine
            id={key}
            key={key}
            text={text}
            color={this.props.palette[key]}
            checked={this.state.selected.indexOf(key) > -1}
            onClick={this.clickCallback.bind(this)}
            split={this.props.split}
          />,
        );
      });
    }

    const loading = (
      <p>
        Loading... <i className="fas fa-spinner fa-pulse" />
      </p>
    );

    let checked = false;
    if (this.state.selected && this.props.palette) {
      checked = Object.keys(this.props.palette).length === this.state.selected.length;
    }

    let explanation;
    if (this.props.palette) {
      if (this.props.split) {
        const keys = Object.keys(this.props.palette);
        const color1 = chroma(this.props.palette[keys[0]]).hex();
        const color2 = chroma(this.props.palette[keys[0]]).darken(0.5).hex();
        explanation = (
          <LegendCompact
            text={this.props.explanation ? this.props.explanation : 'Additions | Deletions (# lines per author)'}
            color={color1}
            color2={color2}
          />
        );
      } else {
        const keys = Object.keys(this.props.palette);
        const color = this.props.palette[keys[0]];
        explanation = (
          <LegendCompact text={this.props.explanation ? this.props.explanation : 'Number of commits (per author)'} color={color} />
        );
      }
    }

    return (
      <div>
        <label className="label">
          <input type="checkbox" checked={checked} onChange={this.selectAllAuthors.bind(this)} disabled={!this.props.palette} />
          {this.props.title}
        </label>
        {explanation}
        <div className={styles.legend}>
          {items.length === 0 || items}
          {items.length > 0 || loading}
        </div>
      </div>
    );
  }
}

/**
 * A single line of the checkboxLegend (text, color)
 * Takes props:
 *  - text: Text to display
 *  - color: Color to display (Format: "#ffffff")
 *  - key: Unique key of the checkbox, usually the same as text.
 */
class CheckboxLegendLine extends React.Component {
  constructor(props) {
    super(props);
  }

  clickHandler() {
    this.props.onClick(this.props.id);
  }

  render() {
    let rects;
    if (this.props.split) {
      rects = (
        <g>
          <rect width={ICON_HEIGHT / 2} height={ICON_WIDTH} fill={chroma(this.props.color).hex()} />
          <rect x={ICON_WIDTH / 2} width={ICON_HEIGHT / 2} height={ICON_WIDTH} fill={chroma(this.props.color).darken(0.5).hex()} />
        </g>
      );
    } else {
      rects = <rect width={ICON_HEIGHT} height={ICON_WIDTH} fill={this.props.color} />;
    }

    return (
      <div className={styles.checkboxLegendLine}>
        <label className={styles.field}>
          <svg className={styles.icon} width={ICON_WIDTH} height={ICON_HEIGHT}>
            {rects}
          </svg>
          <input
            type="checkbox"
            name={this.props.text}
            value={this.props.text}
            checked={this.props.checked}
            onChange={this.clickHandler.bind(this)}
          />
          {this.props.text}
        </label>
      </div>
    );
  }
}

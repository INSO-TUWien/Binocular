'use strict';

import _ from 'lodash';
import React from 'react';
import chroma from 'chroma-js';

import styles from './checkboxLegend.scss';
import LegendCompact from '../../../../../components/LegendCompact';

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
      authors: [], //[name1, name2, ...]
      ticked: false,
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
      const authors = props.authors === undefined ? Object.keys(props.palette) : props.authors;
      this.setState({ initialized: true, authors: authors });
    }
  }

  selectAuthorsMode() {
    const ticked = !(this.state.ticked);
    this.setState({ ticked: ticked}, () => this.props.onClick(ticked))
  }

  render() {
    const items = [];
    if (this.state.initialized || (this.state.authors && this.state.authors.length)) {
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
          />
        );
      });
    }

    const loading = (
      <p>
        Loading... <i className="fas fa-spinner fa-pulse" />
      </p>
    );

    let explanation;
    if (this.props.palette) {
      const keys = Object.keys(this.props.palette);
      const color = this.props.palette[keys[0]];
      if (this.props.displayMetric === 'linesChanged') {
        explanation = (
          <LegendCompact text={'Number of additions and deletions (per author)'} color={color} />
        );
      } else {
        explanation = (
          <LegendCompact text={'Number of commits (per author)'} color={color} />
        );
      }
      
    }

    return (
      <div>
        <label className="label">
          <input type="checkbox" checked={this.state.ticked} onChange={this.selectAuthorsMode.bind(this)} disabled={!this.props.palette} />
          {this.props.title}
        </label>
        {(items.length === 0 || !(this.state.ticked)) || explanation}
        <div className={styles.legend}>
          {(items.length === 0 || !(this.state.ticked)) || items}
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
          {this.props.text}
        </label>
      </div>
    );
  }
}

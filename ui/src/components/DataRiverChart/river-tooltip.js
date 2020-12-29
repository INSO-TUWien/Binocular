import styles from './data-river-chart.component.scss';
import { RiverData } from './RiverData';

import React from 'react';
import MouseTooltip from 'react-sticky-mouse-tooltip';

class RiverTooltip extends React.Component {
  constructor(props) {
    super(props);
    this.state = Object.assign({}, this.props);
  }

  setAttribute(key, value) {
    this.setState(prev => Object.assign({}, prev, { [key]: value }));
  }

  removeAttribute(key) {
    this.setState(prev => Object.assign({}, prev, { [key]: undefined }));
  }

  render() {
    const { name, date, sha, attribute, deletions, additions } = this.state.data || {};
    const isVisible = !this.state.hide && !!this.state.data && this.state.data instanceof RiverData && !!this.state.attribute;
    return (
      <MouseTooltip
        className={styles.tooltip}
        visible={isVisible}
        offsetX={this.state.tooltipLeft || 15}
        offsetY={this.state.tooltipTop || 10}>
        <h1>
          {name}
          {this.state.additional
            ? <span>
                {this.state.additional}
              </span>
            : null}
        </h1>
        <hr />
        <ul>
          <li>
            <i>sha</i>
            <span>
              {sha}
            </span>
          </li>
          <li>
            <i>date</i>
            <span>
              {date ? date.toLocaleString() : ''}
            </span>
          </li>
          <li>
            <i>
              {this.props.attribute}
            </i>
            <span>
              {attribute}
            </span>
          </li>
          <li>
            <i>additions</i>
            <span>
              {additions}
            </span>
          </li>
          <li>
            <i>deletions</i>
            <span>
              {deletions}
            </span>
          </li>
        </ul>
      </MouseTooltip>
    );
  }
}

export default RiverTooltip;

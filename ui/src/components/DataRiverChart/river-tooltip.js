import styles from './data-river-chart.component.scss';
import { BuildStat, RiverData } from './RiverData';

import React from 'react';
import MouseTooltip from 'react-sticky-mouse-tooltip';
import { formatInteger, formatNumber } from '../../utils/format';

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
    const { name, date, sha, attribute, deletions, additions, buildStat, buildWeight, buildSuccessRate } = this.state.data || {};
    const isVisible = !this.state.hide && !!this.state.data && this.state.data instanceof RiverData && !!this.state.attribute;
    const style = this.state.borderColor ? { borderColor: this.state.borderColor } : null;
    return (
      <MouseTooltip
        className={styles.tooltip}
        visible={isVisible}
        offsetX={this.state.tooltipLeft || 15}
        offsetY={this.state.tooltipTop || 10}>
        <h1 style={style}>
          {this.state.additional
            ? <span
                className={styles.additional}
                style={Object.assign({}, style, this.state.color ? { background: this.state.color } : {})}>
                <span>
                  {this.state.additional}
                </span>
              </span>
            : null}
          {name
            ? <span className={styles.name}>
                {name}
              </span>
            : null}
        </h1>
        <ul>
          <li style={style}>
            <i>
              {this.props.attribute}
            </i>
            <span>
              {attribute}
            </span>
          </li>
          <li style={style}>
            <i>date</i>
            <span>
              {date ? date.toLocaleString() : ''}
            </span>
          </li>
          <li style={style}>
            <i>additions</i>
            <span>
              {formatInteger(additions)}
            </span>
          </li>
          <li style={style}>
            <i>deletions</i>
            <span>
              {formatInteger(deletions)}
            </span>
          </li>
          <li style={style}>
            <i>build</i>
            <span>
              {buildStat ? buildStat.name : BuildStat.None.name}
            </span>
          </li>
          <li style={style}>
            <i>build weight</i>
            <span>
              {formatNumber(buildWeight)}
            </span>
          </li>
          <li style={style}>
            <i>build rate</i>
            <span>
              {formatNumber(buildSuccessRate * 100.0) + '%'}
            </span>
          </li>
          <li style={style}>
            <i>sha</i>
            <span>
              {sha}
            </span>
          </li>
        </ul>
      </MouseTooltip>
    );
  }
}
export default RiverTooltip;

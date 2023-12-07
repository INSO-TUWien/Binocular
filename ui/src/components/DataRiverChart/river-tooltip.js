import styles from './data-river-chart.component.module.scss';
import { BuildStat } from './RiverData';

import React from 'react';
import MouseTooltip from 'guyllkegen-react-sticky-mouse-tooltip';
import { formatInteger, formatNumber } from '../../utils/format';
import cx from 'classnames';
import { formatDate } from '../../utils/date';

class RiverTooltip extends React.Component {
  constructor(props) {
    super(props);
    this.state = Object.assign({}, this.props);
  }

  /**
   * allow to set the state dynamically with d3
   *
   * @param key
   * @param value
   */
  setAttribute(key, value) {
    this.setState((prev) => Object.assign({}, prev, { [key]: value }));
  }

  /**
   * allow to set the state dynamically with d3
   *
   * @param key
   */
  removeAttribute(key) {
    this.setState((prev) => Object.assign({}, prev, { [key]: undefined }));
  }

  /**
   * calculates the internal bounds of the tooltip
   * @returns {{offsetX: (*|number), offsetY: (*|number)}|any}
   */
  getBoundingClientRect() {
    const defaultOffset = { offsetX: this.state.tooltipLeft || 15, offsetY: this.state.tooltipTop || 15 };

    if (!this.ref) {
      return defaultOffset;
    }
    const rect = this.ref.getBoundingClientRect();

    return Object.assign({}, rect.toJSON(), defaultOffset, {
      width: rect.width || rect.right - rect.left,
      height: rect.height || rect.bottom - rect.top,
    });
  }

  /**
   * calculates real offset to prevent clipping
   *
   * @returns {{offsetX: (*|number), offsetY: (*|number)}|any|{offsetX: *, offsetY: *}}
   */
  calculateOffset() {
    const origin = this.getBoundingClientRect();

    if (!this.ref || !this.tooltipRef || !this.tooltipRef.props) {
      return origin;
    }

    const originOffset = { x: this.tooltipRef.props.offsetX, y: this.tooltipRef.props.offsetY };

    return {
      offsetX: Math.min(-(origin.right - originOffset.x) + window.innerWidth - origin.offsetX, origin.offsetX),
      offsetY: Math.min(-(origin.bottom - originOffset.y) + window.innerHeight - origin.offsetY, origin.offsetY),
    };
  }

  render() {
    const { name, date, shas, attribute, deletions, additions, buildStat, buildWeight, buildSuccessRate, trend } = this.state.data || {};

    const status = (this.state.data || {}).status || (this.state.issue || {}).status;
    const isVisible = !this.state.hide && !!this.state.data && !!this.state.attribute;
    const style = this.state.attrColor ? { borderColor: this.state.attrColor } : null;
    const { offsetX, offsetY } = this.calculateOffset();

    return (
      <MouseTooltip
        ref={(ref) => (this.tooltipRef = ref)}
        className={styles.tooltip}
        visible={isVisible}
        offsetX={offsetX}
        offsetY={offsetY}>
        <div ref={(div) => (this.ref = div)}>
          <h1 style={style}>
            {this.state.additional ? (
              <span
                className={styles.additional}
                style={Object.assign({}, style, this.state.color ? { background: this.state.color } : {})}>
                <span>{this.state.additional}</span>
              </span>
            ) : null}
            {name ? <span className={styles.name}>{name}</span> : null}
          </h1>
          <ul>
            {status ? (
              <li style={style}>
                <span>
                  <i>status</i>
                </span>
                <span className={styles.additional}>
                  <span
                    className={styles.attribute}
                    style={Object.assign({}, style, this.state.statusColor ? { background: this.state.statusColor } : {})}>
                    {status.name}
                  </span>
                </span>
              </li>
            ) : null}
            {this.props.attribute && attribute ? (
              <li style={style}>
                <span>
                  <i>{this.props.attribute}</i>
                </span>
                <span className={styles.additional}>
                  <span
                    className={styles.attribute}
                    style={Object.assign({}, style, this.state.attrColor ? { background: this.state.attrColor } : {})}>
                    {attribute}
                  </span>
                </span>
              </li>
            ) : null}
            {date ? (
              <li style={style}>
                <i>date</i>
                <span>{this.props.resolution ? formatDate(date, this.props.resolution) : date.toLocaleString()}</span>
              </li>
            ) : null}
            {additions ? (
              <li style={style}>
                <i>additions</i>
                <span>{formatInteger(additions)}</span>
              </li>
            ) : null}
            {deletions ? (
              <li style={style}>
                <i>deletions</i>
                <span>{formatInteger(deletions)}</span>
              </li>
            ) : null}
            {buildStat ? (
              <li style={style}>
                <i>build</i>
                <span>{buildStat ? buildStat.name : BuildStat.None.name}</span>
              </li>
            ) : null}
            {buildWeight !== undefined ? (
              <li style={style}>
                <i>build weight</i>
                <span>{formatNumber(buildWeight)}</span>
              </li>
            ) : null}
            {buildSuccessRate !== undefined ? (
              <li style={style}>
                <i>build rate</i>
                <span>{formatNumber(buildSuccessRate)}</span>
              </li>
            ) : null}
            {trend !== undefined ? (
              <li style={style}>
                <i>build trend</i>
                <span>
                  <i
                    className={cx('fas', !trend ? 'fa-arrow-right' : trend > 0 ? 'fa-arrow-up' : 'fa-arrow-down')}
                    style={{ color: !trend ? 'grey' : trend > 0 ? 'green' : 'red' }}
                  />
                </span>
              </li>
            ) : null}
            {shas && length in shas ? (
              <li style={style}>
                <i>commits</i>
                <span>{shas.length}</span>
              </li>
            ) : null}
          </ul>
        </div>
      </MouseTooltip>
    );
  }
}
export default RiverTooltip;

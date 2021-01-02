import styles from './data-river-chart.component.scss';
import { BuildStat, RiverData } from './RiverData';

import React from 'react';
import MouseTooltip from 'react-sticky-mouse-tooltip';
import { formatInteger, formatNumber } from '../../utils/format';
import cx from 'classnames';

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
    this.setState(prev => Object.assign({}, prev, { [key]: value }));
  }

  /**
   * allow to set the state dynamically with d3
   *
   * @param key
   */
  removeAttribute(key) {
    this.setState(prev => Object.assign({}, prev, { [key]: undefined }));
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
      height: rect.height || rect.bottom - rect.top
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
      offsetX: Math.min(-(origin.right - originOffset.x) + window.innerWidth, 0) + origin.offsetX,
      offsetY: Math.min(-(origin.bottom - originOffset.y) + window.innerHeight, 0) + origin.offsetY
    };
  }

  render() {
    const { name, date, sha, attribute, deletions, additions, buildStat, buildWeight, buildSuccessRate, trend } = this.state.data || {};
    const isVisible = !this.state.hide && !!this.state.data && this.state.data instanceof RiverData && !!this.state.attribute;
    const style = this.state.attrColor ? { borderColor: this.state.attrColor } : null;
    const { offsetX, offsetY } = this.calculateOffset();

    return (
      <MouseTooltip ref={ref => (this.tooltipRef = ref)} className={styles.tooltip} visible={isVisible} offsetX={offsetX} offsetY={offsetY}>
        <div ref={div => (this.ref = div)}>
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
              <span>
                <i>
                  {this.props.attribute}
                </i>
              </span>
              {this.state.additional
                ? <span className={styles.additional}>
                    <span
                      className={styles.attribute}
                      style={Object.assign({}, style, this.state.attrColor ? { background: this.state.attrColor } : {})}>
                      {attribute}
                    </span>
                  </span>
                : null}
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
                {formatNumber((buildSuccessRate * 100.0 + 100.0) / 2) + '%'}
              </span>
            </li>
            <li style={style}>
              <i>build trend</i>
              <span>
                <i
                  className={cx('fas', !trend ? 'fa-arrow-right' : trend > 0 ? 'fa-arrow-up' : 'fa-arrow-down')}
                  style={{ color: !trend ? 'grey' : trend > 0 ? 'green' : 'red' }}
                />
              </span>
            </li>
            <li style={style}>
              <i>sha</i>
              <span>
                {sha}
              </span>
            </li>
          </ul>
        </div>
      </MouseTooltip>
    );
  }
}
export default RiverTooltip;

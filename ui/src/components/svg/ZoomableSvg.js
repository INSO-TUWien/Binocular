'use strict';

import React, { PropTypes } from 'react';
import * as d3 from 'd3';

export default class ZoomableSvg extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transform: d3.zoomIdentity,
      x: props.x,
      y: props.y
    };
  }

  getChildContext() {
    return {
      svgRef: this.ref,
      zoom: this.zoom,
      transform: this.state.transform
      // x: this.state.transform.rescaleX(this.props.x),
      // y: this.state.transform.rescaleY(this.props.y)
    };
  }

  resetZoom() {
    const svg = d3.select(this.ref);

    svg.transition().duration(500).call(this.zoom.transform, d3.zoomIdentity);

    this.setState({ transform: d3.zoomIdentity });
  }

  render() {
    const translate = `translate(${this.state.transform.x}, ${this.state.transform.y})`;
    const scale = `scale(${this.state.transform.k})`;

    return (
      <svg
        tabIndex={this.props.tabIndex || 1}
        className={this.props.className}
        ref={svg => (this.ref = svg)}
        onKeyDown={e => this.onKeyDown(e)}>
        <g transform={`${translate} ${scale}`}>
          {this.props.children}
        </g>
      </svg>
    );
  }

  componentDidUpdate() {
    const svg = d3.select(this.ref);

    this.zoom = d3.zoom();

    if (this.props.scaleExtent) {
      this.zoom = this.zoom.scaleExtent(this.props.scaleExtent);
    }

    this.zoom = this.zoom.on('zoom', () => {
      this.setState({ transform: d3.event.transform });
    });

    svg.call(this.zoom);
  }

  componentWillUnmount() {
    if (this.zoom) {
      this.zoom.on('zoom', null);
      this.zoom.on('start', null);
      this.zoom.on('end', null);
    }
  }

  onKeyDown(e) {
    // escape, '0' or '='
    if (e.keyCode === 27 || e.keyCode === 48 || e.keyCode === 187) {
      this.resetZoom();
    }
  }
}

ZoomableSvg.propTypes = {};

ZoomableSvg.childContextTypes = {
  svgRef: PropTypes.object,
  zoom: PropTypes.func,
  transform: PropTypes.object.isRequired,
  scaleExtent: PropTypes.arrayOf(PropTypes.number)
};

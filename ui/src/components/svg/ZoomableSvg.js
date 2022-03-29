'use strict';

import React from 'react';
import * as d3 from 'd3';
import PropTypes from "prop-types";

/**
 * Provides an svg-element with all necessary handlers attached for zoomability.
 *
 */
export default class ZoomableSvg extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transform: d3.zoomIdentity
    };
  }

  resetZoom() {
    const svg = d3.select(this.ref);

    svg.transition().duration(500).call(this.zoom.transform, d3.zoomIdentity);

    this.setState({ transform: d3.zoomIdentity });
  }

  render() {
    return (
      <svg
        // must specify tabIndex to consume key events
        tabIndex={this.props.tabIndex || 1}
        className={this.props.className}
        // remember ref for attaching d3 zoom behaviour later
        ref={svg => (this.ref = svg)}
        onKeyDown={e => this.onKeyDown(e)}>
        {this.props.children}
      </svg>
    );
  }

  componentDidUpdate() {
    const svg = d3.select(this.ref);

    this.zoom = d3.zoom();

    if (this.props.scaleExtent) {
      this.zoom = this.zoom.scaleExtent(this.props.scaleExtent);
    }

    this.zoom = this.zoom.on('zoom', event => {
      if (this.props.onZoom) {
        this.props.onZoom(event);
      }

      this.setState({ transform: event.transform });
    });

    if (this.props.onStart) {
      this.zoom = this.zoom.on('start', event => this.props.onStart(event));
    }

    if (this.props.onEnd) {
      this.zoom = this.zoom.on('end', event => this.props.onEnd(event));
    }

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

ZoomableSvg.propTypes = {
  tabIndex: PropTypes.number,
  className: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  scaleExtent: PropTypes.arrayOf(PropTypes.number),
  onStart: PropTypes.func,
  onZoom: PropTypes.func,
  onEnd: PropTypes.func
};

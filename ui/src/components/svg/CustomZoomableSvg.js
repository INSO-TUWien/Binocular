'use strict';

import React, { PropTypes } from 'react';
import * as d3 from 'd3';

export default class CustomZoomableSvg extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transform: d3.zoomIdentity,
      x: props.x,
      y: props.y
    };
  }

  resetZoom() {
    const svg = d3.select(this.ref);

    svg.transition().duration(500).call(this.zoom.transform, d3.zoomIdentity);

    this.setState({ transform: d3.zoomIdentity });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      x: this.state.transform.rescaleX(nextProps.x),
      y: this.state.transform.rescaleY(nextProps.y)
    });
  }

  render() {
    const children = this.props.children({
      x: this.state.x,
      y: this.state.y,
      transform: this.state.transform
    });

    return (
      <svg
        tabIndex={this.props.tabIndex || 1}
        className={this.props.className}
        ref={svg => (this.ref = svg)}
        onKeyDown={e => this.onKeyDown(e)}>
        {children}
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
      if (this.props.onZoom) {
        this.props.onZoom(d3.event.transform);
      }

      if (this.props.onViewportChanged) {
        this.props.onViewportChanged(this.state.x.domain(), this.state.y.domain());
      }

      this.setState({ transform: d3.event.transform });
    });

    if (this.props.onStart) {
      this.zoom = this.zoom.on('start', () => this.props.onStart(d3.event));
    }

    if (this.props.onEnd) {
      this.zoom = this.zoom.on('end', () => this.props.onEnd(d3.event));
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

CustomZoomableSvg.propTypes = {
  x: PropTypes.func.isRequired,
  y: PropTypes.func.isRequired,
  onViewportChanged: PropTypes.func.isRequired
};

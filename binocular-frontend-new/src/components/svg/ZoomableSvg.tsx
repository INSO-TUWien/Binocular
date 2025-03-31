'use strict';

import React from 'react';
import * as d3 from 'd3';

// Define props interface
interface ZoomableSvgProps {
  tabIndex?: number;
  className?: string;
  children?: React.ReactNode | React.ReactNode[];
  scaleExtent?: [number, number];
  onStart?: (event: d3.D3ZoomEvent<SVGSVGElement, any>) => void;
  onZoom?: (event: d3.D3ZoomEvent<SVGSVGElement, any>) => void;
  onEnd?: (event: d3.D3ZoomEvent<SVGSVGElement, any>) => void;
}

// Define state interface
interface ZoomableSvgState {
  transform: d3.ZoomTransform;
}

/**
 * Provides an svg-element with all necessary handlers attached for zoomability.
 */
export default class ZoomableSvg extends React.Component<ZoomableSvgProps, ZoomableSvgState> {
  private ref: SVGSVGElement | null = null;
  private zoom: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null;

  constructor(props: ZoomableSvgProps) {
    super(props);
    this.state = {
      transform: d3.zoomIdentity,
    };
  }

  resetZoom(): void {
    if (!this.ref || !this.zoom) return;
    
    const svg = d3.select<SVGSVGElement, unknown>(this.ref);
    svg.transition().duration(500).call(this.zoom.transform, d3.zoomIdentity);
    this.setState({ transform: d3.zoomIdentity });
  }

  render(): React.ReactNode {
    return (
      <svg
        // must specify tabIndex to consume key events
        tabIndex={this.props.tabIndex || 1}
        className={this.props.className}
        // remember ref for attaching d3 zoom behaviour later
        ref={(svg) => (this.ref = svg)}
        onKeyDown={(e) => this.onKeyDown(e)}>
        {this.props.children}
      </svg>
    );
  }

  componentDidUpdate(): void {
    if (!this.ref) return;
    
    const svg = d3.select<SVGSVGElement, unknown>(this.ref);
    this.zoom = d3.zoom<SVGSVGElement, unknown>();

    if (this.props.scaleExtent) {
      this.zoom = this.zoom.scaleExtent(this.props.scaleExtent);
    }

    this.zoom = this.zoom.on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
      if (this.props.onZoom) {
        this.props.onZoom(event);
      }

      this.setState({ transform: event.transform });
    });

    if (this.props.onStart) {
      this.zoom = this.zoom.on('start', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        if (this.props.onStart) {
          this.props.onStart(event);
        }
      });
    }

    if (this.props.onEnd) {
      this.zoom = this.zoom.on('end', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        if (this.props.onEnd) {
          this.props.onEnd(event);
        }
      });
    }

    svg.call(this.zoom);
  }

  componentWillUnmount(): void {
    if (this.zoom) {
      this.zoom.on('zoom', null);
      this.zoom.on('start', null);
      this.zoom.on('end', null);
    }
  }

  onKeyDown(e: React.KeyboardEvent<SVGSVGElement>): void {
    // escape, '0' or '='
    if (e.keyCode === 27 || e.keyCode === 48 || e.keyCode === 187) {
      this.resetZoom();
    }
  }
}
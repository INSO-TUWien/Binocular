import React from 'react';
import * as d3 from 'd3';

export const OVERLAY_PLOT_OPTIONS = Object.freeze({
  FREQUENCY_HEATMAP: 'FREQUENCY_HEATMAP',
  CODE_OWNERSHIP: 'CODE_OWNERSHIP'
});

export default class OverlayPlotter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      svg: undefined
    };
  }

  componentDidMount() {
    this.state.svg = this.drawSVG();
    this.doUpdate();
  }

  componentDidUpdate() {
    this.state.svg.remove();
    this.state.svg = this.drawSVG();
    this.doUpdate();
  }

  componentWillUnmount() {
    if (this.state.svg) {
      this.state.svg.remove();
    }
  }

  doUpdate() {
    if (
      this.props.overlayOptions.includes(OVERLAY_PLOT_OPTIONS.FREQUENCY_HEATMAP) &&
      this.props.overlayOptions.includes(OVERLAY_PLOT_OPTIONS.CODE_OWNERSHIP)
    ) {
      this.drawSplittedRectangle(
        this.state.svg,
        this.getHLSColor(),
        this.props.codeLine.authorColor,
        this.props.splittedWidth[0],
        this.props.splittedWidth[1],
        this.props.splittedWidth[0]
      );
      if (this.props.codeLine.oldAuthorColor) {
        this.drawRectangleLine(
          this.state.svg,
          this.props.codeLine.oldAuthorColor,
          this.props.splittedWidth[0],
          this.props.splittedWidth[1]
        );
      }
      if (this.props.codeLine.oldAuthorColor) {
        this.drawRectangleLine(this.state.svg, this.props.codeLine.oldAuthorColor);
      }
    } else if (this.props.overlayOptions.includes(OVERLAY_PLOT_OPTIONS.FREQUENCY_HEATMAP)) {
      this.drawRectangle(this.state.svg, this.getHLSColor());
    } else if (this.props.overlayOptions.includes(OVERLAY_PLOT_OPTIONS.CODE_OWNERSHIP)) {
      this.drawRectangle(this.state.svg, this.props.codeLine.authorColor);
      if (this.props.codeLine.oldAuthorColor) {
        this.drawRectangleLine(
          this.state.svg,
          this.props.codeLine.oldAuthorColor,
          0,
          this.props.width
        );
      }
    }
  }

  getHLSColor() {
    return d3.hsl(
      this.props.codeLine.hslColor.hue,
      this.props.codeLine.hslColor.saturation,
      this.props.codeLine.hslColor.lightness,
      this.props.codeLine.hslColor.opacity
    );
  }

  drawRectangleLine(svg, color, x, width) {
    svg
      .append('rect')
      .attr('x', x)
      .attr('y', svg.node().getBoundingClientRect().height * 0.8)
      .attr('width', width)
      .attr('height', svg.node().getBoundingClientRect().height * 0.1)
      .attr('fill', color)
      .style('opacity', 0.5);
  }

  drawSVG() {
    return d3
      .select('#' + this.props.id)
      .append('svg')
      .attr('width', this.props.width)
      .attr('height', this.props.height);
  }
  drawSplittedRectangle(svg, colorOne, colorTwo, widthOne, widthTwo, x) {
    svg
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', widthOne)
      .attr('height', this.props.height)
      .attr('fill', colorOne)
      .style('opacity', 0.5);
    svg
      .append('rect')
      .attr('x', x)
      .attr('y', 0)
      .attr('width', widthTwo)
      .attr('height', this.props.height)
      .attr('fill', colorTwo)
      .style('opacity', 0.5);
  }
  drawRectangle(svg, color) {
    svg
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', this.props.width)
      .attr('height', this.props.height)
      .attr('fill', color)
      .style('opacity', 0.5);
  }

  render() {
    return null;
  }
}

'use strict';

import React from 'react';
import * as baseStyles from './bubbleChart.module.scss';
import _ from 'lodash';
import BubbleToolTip from './tooltip';
import { BubbleChartProps, BubbleChartState, BubbleChartWindowSpecs } from './types';

// TODO: refactor to remove duplicate code from ScalableBaseChart
export default class BubbleChart<
  P extends BubbleChartProps = BubbleChartProps,
  S extends BubbleChartState = BubbleChartState,
> extends React.Component<P, S> {
  protected styles: any;
  protected svgRef: SVGSVGElement | null | undefined;

  constructor(props: P | Readonly<P>, styles: any) {
    super(props);
    this.styles = Object.freeze(Object.assign({}, baseStyles, styles));
    this.updateElement = this.updateElement.bind(this);
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  handleResize() {
    this.updateElement();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', () => this.updateElement());
  }

  componentDidMount() {
    this.updateElement();
  }

  async updateElement() {
    throw new Error('Function not implemented by subcomponent');
  }

  getDimsAndPaddings(svg: any): BubbleChartWindowSpecs {
    const paddings = this.props.paddings || { left: 0, right: 0, top: 0, bottom: 0 };
    const node = !svg || typeof svg.node !== 'function' ? { getBoundingClientRec: () => ({}) } : svg.node();
    const clientRect = node ? node.getBoundingClientRect() : {};
    const width = clientRect.width || 0;
    const height = clientRect.height || 0;

    return { width, height, paddings };
  }

  render() {
    return (
      <div className={this.styles.chartDiv}>
        <svg className={this.styles.chartSvg} ref={(svg) => (this.svgRef = svg)} />
        <BubbleToolTip data={this.state.tooltipData} x={this.state.tooltipX} y={this.state.tooltipY} visible={this.state.tooltipVisible} />
      </div>
    );
  }
}

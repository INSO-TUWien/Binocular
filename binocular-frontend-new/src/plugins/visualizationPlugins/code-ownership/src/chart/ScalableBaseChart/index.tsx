'use strict';

import * as React from 'react';
import * as d3 from 'd3';
import * as baseStyles from './scalable-base-chart.module.scss';
import { NoImplementationException } from '../../utils/exception/NoImplementationException.ts';
import { hash } from '../../utils/cryptoUtils.ts';
import { Palette } from '../../../../../../types/data/authorType.ts';

/**
 * ScalableBaseChartComponent
 * Takes the following props:
 *  - content (Format: [{date: timestamp(ms), seriesName1: number, seriesName2, number, ...}, ...],
 *             e.g. array of data points with date and series values)
 *  - palette (Format: {seriesName1: color1, seriesName2: color2, ...}, color in format "#ffffff" as string)
 *  - paddings (optional) (Format: {top: number, left: number, right: number, bottom: number},
 *             number being amount of pixels) Each field in the object is optional and can be left out)
 *  - height (optional) height of the chart
 *  - width (optional) width of the chart
 *  - xAxisCenter (optional) (Format: true/false,
 *             whether the x axis should be at the 0 line (true), or at the bottom (false/unspecified))
 *  - yDims (Format: [topValue, bottomValue],
 *             limits of the y-Axis on top/bottom, should correspond to data.)
 *  - d3offset (Format: d3.stackOffsetNone/d3.stackOffsetDiverging/d3.stackOffsetSilhouette/...
 *             determines the way data is stacked, check d3 docs)
 *  - keys (optional) (Format: [seriesName1, seriesName2, ...])
 *             Filters the chart, only showing the provided keys and leaving everything else out.
 *  - resolution (Format: 'years'/'months'/'weeks'/'days') Needed for date format in tooltips.
 *  - displayNegative (optional) (Format: true/false) Display negative numbers on y-scale.
 *  - order (optional) (Format: [string, string, ...]) Strings containing the keys in desired order (largest to smallest).
 */

interface Props {
  content: { [id: string]: number }[];
  d3offset: any;
  displayNegative?: boolean;
  keys: string[];
  order: string[];
  paddings: { top: number; left: number; bottom: number; right: number };
  height?: number;
  width?: number;
  palette: Palette | undefined;
  resolution: string;
  xAxisCenter?: boolean;
  yDims: number[];
  yScale?: number[];
  disableVerticalZoom?: boolean;
  hideVertical?: boolean;
}

interface State {
  content: { [id: string]: number }[];
  palette: Palette;
  componentMounted: boolean;
  zoomed: boolean;
  zoomedDims: number[];
  zoomedVertical: boolean;
  verticalZoomDims: number[];
  d3offset: any;
  data: any;
}

export default class ScalableBaseChart extends React.Component<Props, State> {
  protected styles: any;
  private svgRef: SVGSVGElement | null | undefined;
  private tooltipRef: HTMLDivElement | null | undefined;
  constructor(props: Props | Readonly<Props>, styles: any) {
    super(props);

    this.styles = Object.freeze(Object.assign({}, baseStyles, styles));

    this.state = {
      content: props.content, //[{name: "dev1", color: "#ffffff", checked: bool}, ...]
      palette: props.palette ? props.palette : {},
      componentMounted: false,
      zoomed: false,
      zoomedDims: [0, 0],
      zoomedVertical: false,
      verticalZoomDims: [0, 0],
      d3offset: props.d3offset,
      data: { data: [], stackedData: [] },
    };
    window.addEventListener('resize', () => this.updateElement());
  }

  /**
   * START OF ABSTRACT
   */

  /**
   *
   * @param scales
   * @returns {*}
   */
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  createAreaFunction(scales: any) {
    throw new NoImplementationException('Base class is abstract and requires implementation!');
  }

  getXDims(): number[] {
    throw new NoImplementationException('Base class is abstract and requires implementation!');
  }

  getYDims(): number[] {
    throw new NoImplementationException('Base class is abstract and requires implementation!');
  }

  /**
   *
   * @param scales
   * @param axes
   * @param brushArea
   * @param area
   */
  // @ts-ignore
  resetZoom(scales: any, axes: any, brushArea: any, area: any) {
    throw new NoImplementationException('Base class is abstract and requires implementation!');
  }

  /**
   * Calculate data for the chart.
   * @param data Chart data in the format [{date: timestamp(ms), series1: value, series2: value, series3: value, series4: value, ...}, ...]
   * @param order
   * @returns Stacked chart data for d3 functions and preprocessed data { stackedData, data }
   */
  // @ts-ignore
  calculateChartData(data: any, order: any) {
    throw new NoImplementationException('Base class is abstract and requires implementation!');
  }

  /**
   *
   * @param path
   * @param bisectDate
   * @param mouseoverDate
   * @param tooltip
   * @param event
   * @param node
   * @param brushArea
   * @param scales
   */
  createdTooltipNode(
    // @ts-ignore
    path: any,
    // @ts-ignore
    bisectDate: any,
    // @ts-ignore
    mouseoverDate: any,
    // @ts-ignore
    tooltip: any,
    // @ts-ignore
    event: any,
    // @ts-ignore
    node: any,
    // @ts-ignore
    brushArea: any,
    // @ts-ignore
    scales: any,
  ) {
    throw new NoImplementationException('Base class is abstract and requires implementation!');
  }

  // @ts-ignore
  getBrushId(data: any): any {
    throw new NoImplementationException('Base class is abstract and requires implementation!');
  }

  /**
   *
   * @param path
   * @param tooltip
   * @param brushArea
   * @param event
   * @param stream
   */
  // @ts-ignore
  onMouseover(path: any, tooltip: any, brushArea: any, event: any, stream: any) {
    throw new NoImplementationException('Base class is abstract and requires implementation!');
  }

  /**
   *
   * @param path
   * @param tooltip
   * @param brushArea
   * @param event
   * @param stream
   */
  // @ts-ignore
  onMouseLeave(path: any, tooltip: any, brushArea: any, event: any, stream: any) {
    throw new NoImplementationException('Base class is abstract and requires implementation!');
  }

  /**
   * END OF ABSTRACT
   */

  componentDidMount() {
    //Needed to restrict d3 to only access DOM when the component is already mounted
    this.setState({ componentMounted: true });
  }

  componentWillUnmount() {
    this.setState({ componentMounted: false });
  }

  //Draw chart after it updated
  componentDidUpdate() {
    //Only update the chart if there is data for it and the component is mounted.
    //it is not currently in a zoom transition (d3 requirement)
    if (this.state.componentMounted && this.props.content) {
      this.updateElement();
    }
  }

  render() {
    return (
      <div className={this.styles.chartDiv + 'h-full w-full'}>
        <svg className={this.styles.chartSvg} ref={(svg) => (this.svgRef = svg)} />
        <div className={this.styles.tooltip} ref={(div) => (this.tooltipRef = div)} />
      </div>
    );
  }

  async hasUpdate() {
    const keysHash = await hash(this.props.keys || []);
    return {
      hashes: { keysHash },
      hasChanges: this.state.data.keysHash !== keysHash || this.state.d3offset !== this.props.d3offset,
    };
  }

  /**
   * Update the chart element. May only be called if this.props.content is not empty and the component is mounted.
   */
  async updateElement() {
    //Initialization
    // stringify important, otherwise `[object Object],[object Object]` etc. will be hashed,
    // leading to skipped updates despite content changes
    const contentHash = await hash(JSON.stringify(this.props.content) || []);
    const orderHash = await hash(this.props.order || []);
    const { hashes, hasChanges } = await this.hasUpdate();

    //Get d3-friendly data
    if (this.state.data.hash !== contentHash || this.state.data.orderHash !== orderHash || hasChanges) {
      this.setState(
        {
          data: Object.assign(
            {
              hash: contentHash,
              orderHash,
            },
            hashes,
            this.calculateChartData(this.props.content, this.props.order),
          ),
          d3offset: this.props.d3offset,
        },
        this.visualizeData,
      );
    } else {
      this.visualizeData();
    }
  }

  /**
   *
   */
  visualizeData() {
    const { stackedData, data } = this.state.data;
    // cannot proceed without data
    if (!data || !stackedData || !this.svgRef) {
      return;
    }
    const yScale = this.props.yScale; //Multiplicator for the values on the y-scale
    const svg = d3.select(this.svgRef); //Select parent svg from render method
    const { width, height, paddings } = this.getDimsAndPaddings(svg); //Get width and height of svg in browser

    //Get and set all required scales, which translate data values into pixel values
    const scales = this.createScales(this.getXDims(), [paddings.left, width - paddings.right], this.getYDims(), [
      height - paddings.bottom,
      paddings.top,
    ]);
    const area = this.createAreaFunction(scales);

    //Brush generator for brush-zoom functionality, with referenced callback-function
    const brush = d3.brushX().extent([
      [paddings.left, 0],
      [width - paddings.right, height],
    ]);

    //Remove old data
    svg.selectAll('*').remove();

    //Draw the chart (and brush box) using everything provided
    const { brushArea, axes } = this.drawChart(svg, area, brush, yScale, scales, height, width, paddings);

    //Set callback for brush-zoom functionality
    brush.on('end', (event) => this.updateZoom(event.selection, scales, axes, brush, brushArea, area));
    //Set callback to reset zoom on double-click
    svg.on('dblclick', () => this.resetZoom(scales, axes, brushArea, area));
  }

  /**
   * Get dimensions and padding of element
   * @param svg Svg-Element to get dimensions and paddings of
   * @returns {width, height, {paddings: {top: *, left: *, bottom: *, right: *}, width: *, height: *}}
   *          Values self-explanatory. All values in pixels.
   */
  getDimsAndPaddings(svg: any) {
    const paddings = this.props.paddings || { left: 0, right: 0, top: 0, bottom: 0 };
    const node = !svg || typeof svg.node !== 'function' ? { getBoundingClientRec: () => ({}) } : svg.node();
    const clientRect = node ? node.getBoundingClientRect() : {};
    const width = this.props.width ? this.props.width : clientRect.width || 0;
    const height = this.props.height ? this.props.height : clientRect.height || 0;

    return { width, height, paddings };
  }

  /**
   *
   * @param xDims Dimensions of x-data in format [timestamp, timestamp] (timestamp = .getTime(),
   *               e.g. timestamp in milliseconds)
   * @param xRange Range of x-data in format [xLeft, xRight] (values in pixels relative to parent,
   *               e.g. insert left padding/right padding to have spacing)
   * @param yDims Dimensions of y-data in format [lowestNumber, highestNumber] (number = e.g. max/min values of data)
   * @param yRange Range of y-data in format [yBottom, yTop] (values in pixels relative to parent,
   *               e.g. insert top padding/bottom padding to have spacing.
   *        CAUTION: y-pixels start at the top, so yBottom should be
   *               e.g. width-paddingBottom and yTop should be e.g. paddingTop)
   * @returns {{x: *, y: *}} d3 x and y scales. x scale as time scale, y scale as linear scale.
   */
  createScales(xDims: number[], xRange: number[], yDims: number[], yRange: number[]) {
    const x = d3.scaleTime().domain(xDims).range(xRange);

    if (this.state.zoomed === true) {
      x.domain(this.state.zoomedDims);
    }

    //Y axis scaled with the maximum amount of change (half in each direction)
    const y = d3.scaleLinear().domain(yDims).range(yRange);

    if (this.state.zoomedVertical === true) {
      y.domain(this.state.verticalZoomDims);
    }
    return { x, y };
  }

  /**
   *
   * @param d
   * @returns {*}
   */
  getColor(d: any) {
    if (!this.props.palette) {
      return '#000000';
    }
    return this.props.palette[this.getBrushId(d)];
  }

  /**
   * Draw the chart onto the svg element.
   * @param svg element to draw on (e.g. d3.select(this.ref))
   * @param area d3 area generator
   * @param brush d3 brush generator
   * @param yScale yScale factor from props (for applying formatting to the y axis)
   * @param scales: x d3 x-scale from method createScales
   *                y d3 y-scale from method createScales
   * @param height element height from getDimsAndPaddings method (required for axis formatting)
   * @param width element width from getDimsAndPaddings method (required for axis formatting)
   * @param paddings paddings of element from getDimsAndPaddings method ()
   * @returns {{brushArea: *, xAxis: *}} brushArea: Area that has all the contents appended to it,
   *               xAxis: d3 x-Axis for later transitioning (for zooming)
   */
  // @ts-ignore
  drawChart(svg: any, area: any, brush: any, yScale: any, scales: any, height: any, width: any, paddings: any) {
    const brushArea = svg.append('g');
    if (!this.tooltipRef) {
      return { brushArea: undefined, axes: { x: undefined, y: undefined } };
    }
    const tooltip = d3.select(this.tooltipRef);

    this.setBrushArea(brushArea.append('g'), brush, area, tooltip, svg, scales);

    //Append visible x-axis on the bottom, with an offset so it's actually visible
    const axes = Object.assign(
      {
        x: this.createXAxis(brushArea, scales, width, height, paddings),
        y: this.createYAxis(brushArea, scales, width, height, paddings),
      },
      this.additionalAxes(brushArea, scales, width, height, paddings),
    );

    // set vertical zoom option if available
    svg.on('wheel', !this.props.disableVerticalZoom ? this.createScrollEvent(svg, scales, axes, brushArea, area) : null);

    // required to support event handling
    svg
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', '0 0 ' + width + ' ' + height)
      .append('defs')
      .append('svg:clipPath')
      .attr('id', 'clip')
      .append('svg:rect')
      .attr('width', width - paddings.right - paddings.left)
      .attr('height', height)
      .attr('x', paddings.left)
      .attr('y', 0);

    return { brushArea, axes };
  }

  /**
   *
   * @param brushArea
   * @param scales
   * @param width
   * @param height
   * @param paddings
   * @returns {*}
   */
  // @ts-ignore
  createXAxis(brushArea: any, scales: any, width: any, height: any, paddings: any) {
    if (this.props.xAxisCenter) {
      return brushArea
        .append('g')
        .attr('class', this.styles.axis)
        .attr('transform', 'translate(0,' + scales.y(0) + ')')
        .call(d3.axisBottom(scales.x));
    }
    return brushArea
      .append('g')
      .attr('class', this.styles.axis)
      .attr('transform', 'translate(0,' + (height - paddings.bottom) + ')')
      .call(d3.axisBottom(scales.x));
  }

  /**
   *
   * @param brushArea
   * @param scales
   * @param width
   * @param height
   * @param paddings
   * @returns {*}
   */
  //@ts-ignore
  createYAxis(brushArea: any, scales: any, width: any, height: any, paddings: any) {
    const yAxis = brushArea
      .append('g')
      .attr('class', this.styles.axis)
      .attr('transform', 'translate(' + paddings.left + ',0)');

    if (!this.props.hideVertical) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      yAxis.call(d3.axisLeft(scales.y).tickFormat((d) => (this.props.displayNegative ? d : Math.abs(d))));
    }
    return yAxis;
  }

  /**
   *
   * @param brushArea
   * @param scales
   * @param width
   * @param height
   * @param paddings
   */
  //@ts-expect-error
  additionalAxes(brushArea: any, scales: any, width: any, height: any, paddings: any) {
    return;
  }

  /**
   *
   * @param brushArea
   * @param brush
   * @param area
   * @param tooltip
   * @param svg
   * @param scales
   */
  setBrushArea(brushArea: any, brush: any, area: any, tooltip: any, svg: any, scales: any) {
    brushArea.append('g').attr('class', 'brush').call(brush);

    const bisectDate = d3.bisector((d: any) => d.date).left;
    //Append data to svg using the area generator and palette
    const pathStreams = brushArea
      .append('g')
      .selectAll('path')
      .data(this.state.data.stackedData)
      .enter()
      .append('path')
      .attr('class', () => `layers ${this.getBrushClass()}`)
      .classed(this.styles.layer, !!this.styles.layer)
      .classed('layer', true)
      .attr('id', this.getBrushId)
      //Color palette with the form {author1: color1, ...}
      .style('fill', this.getColor.bind(this))
      .attr('stroke-width', this.getLayerStrokeWidth.bind(this))
      .attr('stroke', this.getLayerStrokeColor.bind(this))
      .attr('d', area)
      //.attr('clip-path', 'url(#clip)')
      .on('mouseenter', (event: any, stream: any) => {
        return this.onMouseover(this, tooltip, brushArea, event, stream);
      })
      .on('mouseout', (event: any, stream: any) => {
        return this.onMouseLeave(this, tooltip, brushArea, event, stream);
      })
      // @ts-ignore
      .on('mousemove', (event: any, stream: any) => {
        //Calculate values and text for tooltip
        const node = svg.node();
        const pointer = d3.pointer(event, node);
        const mouseoverDate = pointer ? scales.x.invert(pointer[0]) : undefined;

        brushArea.select('.' + this.styles.indicatorLine).remove();
        brushArea.selectAll('.' + this.styles.indicatorCircle).remove();

        if (!mouseoverDate) {
          return;
        }

        this.createdTooltipNode(event.target, bisectDate, mouseoverDate, tooltip, event, node, brushArea, scales);
      });

    this.additionalPathDefs(brushArea, pathStreams, scales);
  }

  /**
   *
   * @param data
   * @returns {number}
   */
  //@ts-ignore
  getLayerStrokeWidth(data: any) {
    return 0;
  }

  /**
   *
   * @param data
   * @returns {undefined}
   */
  //@ts-ignore
  getLayerStrokeColor(data: any): any {
    return undefined;
  }

  getBrushClass() {
    return '';
  }

  /**
   *
   * @param brushArea
   * @param pathStreams
   * @param scales
   */
  //@ts-ignore
  additionalPathDefs(brushArea: any, pathStreams: any, scales: any) {
    return;
  }

  /**
   *
   * @param svg
   * @param scales
   * @param axes
   * @param brushArea
   * @param area
   * @returns scroll event
   */
  //@ts-ignore
  createScrollEvent(svg: any, scales: any, axes: any, brushArea: any, area: any) {
    return (event: any) => {
      // prevent page scrolling
      event.preventDefault();

      const direction = event.deltaY > 0 ? 'down' : 'up';
      let zoomedDims = [...this.getYDims()];
      let top = zoomedDims[1],
        bottom = zoomedDims[0];
      if (this.props.keys && this.props.keys.length === 0) {
        //If everything is filtered, do nothing
        return;
      }

      if (this.state.zoomedVertical) {
        top = this.state.verticalZoomDims[1];
        bottom = this.state.verticalZoomDims[0];
        if (direction === 'up' && top / 2 > 1 && (bottom / 2 < -1 || bottom === 0)) {
          //Zoom limit
          this.updateVerticalZoom([bottom / 2, top / 2], scales, axes, brushArea, area);
        } else if (direction === 'down') {
          if (top * 2 > zoomedDims[1] && (bottom * 2 < zoomedDims[0] || bottom === 0)) {
            this.resetVerticalZoom(scales, axes, brushArea, area);
          } else {
            this.updateVerticalZoom([bottom * 2, top * 2], scales, axes, brushArea, area);
          }
        }
        return;
      }

      if (direction === 'up') {
        if (bottom === 0) {
          zoomedDims = [bottom, top / 2];
        } else if (top > Math.abs(bottom)) {
          zoomedDims = [top / -1, top];
        } else if (Math.abs(bottom) >= top) {
          zoomedDims = [bottom, Math.abs(bottom)];
        }
        this.updateVerticalZoom(zoomedDims, scales, axes, brushArea, area);
      }
    };
  }

  /**
   * Update the vertical zoom (mouse wheel zoom) with new values
   * @param dims Y-Dimensions for new zoom level
   * @param scales Y-Scale from d3
   * @param axes Y-Axis from d3
   * @param area Area that the paths are drawn on
   * @param areaGenerator Area generator for those paths
   */
  updateVerticalZoom(dims: any, scales: any, axes: any, area: any, areaGenerator: any) {
    scales.y.domain(dims);

    axes.y.call(d3.axisLeft(scales.y));
    area.selectAll('.layer').attr('d', areaGenerator);
    this.setState({ zoomedVertical: true, verticalZoomDims: dims });
  }

  /**
   * Reset the vertical zoom to default values.
   * @param scales Y-Scale from d3
   * @param axes Y-Axis from d3
   * @param area Area that the paths are drawn on
   * @param areaGenerator Area generator for those paths
   */
  resetVerticalZoom(scales: any, axes: any, area: any, areaGenerator: any) {
    scales.y.domain(this.getYDims());

    axes.y.call(d3.axisLeft(scales.y));
    area.selectAll('.layer').attr('d', areaGenerator);

    this.setState({ zoomedVertical: false, verticalZoomDims: [0, 0] });
  }

  /**
   * Callback function for brush-zoom functionality. Should be called when brush ends. (.on("end"...)
   * @param extent Call event.selection inside an anonymous/arrow function, put that anonymous/arrow function as the .on callback method
   * @param scales x d3 x Scale provided by createScales function
   * @param axes x d3 x-Axis provided by drawChart function
   * @param brush brush generator
   * @param brushArea Area that the path, x/y-Axis and brush-functionality live on (see drawChart)
   * @param area d3 Area generator (for area graphs)
   */
  updateZoom(extent: any, scales: any, axes: any, brush: any, brushArea: any, area: any) {
    let zoomedDims;
    if (extent) {
      zoomedDims = [scales.x.invert(extent[0]), scales.x.invert(extent[1])];
      scales.x.domain(zoomedDims);
      brushArea.select('.brush').call(brush.move, null);
    } else {
      return;
    }

    axes.x.call(d3.axisBottom(scales.x));
    brushArea.selectAll('.layer').attr('d', area);
    this.setState({ zoomed: true, zoomedDims: zoomedDims });
  }

  /**
   * visualizes the data representation on the given path
   *
   * @param brushArea
   * @param x contains date on x axis
   * @param y0 contains lower y referring to the y axis
   * @param y1 contains upper y referring to the y axis
   * @param color defines the color or the cycles
   */
  paintDataPoint(brushArea: any, x: any, y0: any, y1: any, color: any) {
    brushArea.append('line').attr('class', this.styles.indicatorLine).attr('x1', x).attr('x2', x).attr('y1', y0).attr('y2', y1);
    //.attr('clip-path', 'url(#clip)');

    brushArea
      .append('circle')
      .attr('class', this.styles.indicatorCircle)
      .attr('cx', x)
      .attr('cy', y1)
      .attr('r', 5)
      //.attr('clip-path', 'url(#clip)')
      .style('fill', color);

    brushArea
      .append('circle')
      .attr('class', this.styles.indicatorCircle)
      .attr('cx', x)
      .attr('cy', y0)
      .attr('r', 5)
      //.attr('clip-path', 'url(#clip)')
      .style('fill', color);
  }
}

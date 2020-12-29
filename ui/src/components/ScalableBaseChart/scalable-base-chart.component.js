'use strict';

import _ from 'lodash';
import React from 'react';
import * as d3 from 'd3';
import * as baseStyles from './scalable-base-chart.component.scss';
import { NoImplementationException } from '../../utils/exception/NoImplementationException';
import { hash } from '../../utils/crypto-utils';

/**
 * Stacked area chart
 * Takes the following props:
 *  - content (Format: [{date: timestamp(ms), seriesName1: number, seriesName2, number, ...}, ...],
 *             e.g. array of data points with date and series values)
 *  - palette (Format: {seriesName1: color1, seriesName2: color2, ...}, color in format "#ffffff" as string)
 *  - paddings (optional) (Format: {top: number, left: number, right: number, bottom: number},
 *             number being amount of pixels) Each field in the object is optional and can be left out)
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
export default class ScalableBaseChartComponent extends React.Component {
  constructor(props, styles) {
    super(props);

    this.styles = Object.freeze(Object.assign({}, baseStyles, styles));

    this.state = {
      content: props.content, //[{name: "dev1", color: "#ffffff", checked: bool}, ...]
      palette: props.palette,
      componentMounted: false,
      zoomed: false,
      zoomedDims: [0, 0],
      zoomedVertical: false,
      verticalZoomDims: [0, 0],
      data: { data: [], stackedData: [] }
    };
    window.addEventListener('resize', () => this.updateElement());
  }

  /**
   * START OF ABSTRACT
   */

  /**
   *
   * @param scaleX
   * @param scaleY
   * @returns {*}
   */
  // eslint-disable-next-line no-unused-vars
  createAreaFunction(scaleX, scaleY) {
    throw new NoImplementationException('Base class is abstract and requires implementation!');
  }

  /**
   *
   * @param data
   * @returns {[]}
   */
  // eslint-disable-next-line no-unused-vars
  getXDims(data) {
    throw new NoImplementationException('Base class is abstract and requires implementation!');
  }

  /**
   *
   * @param data
   * @returns {[]}
   */
  // eslint-disable-next-line no-unused-vars
  getYDims(data) {
    throw new NoImplementationException('Base class is abstract and requires implementation!');
  }

  /**
   *
   * @param x
   * @param stackedData
   * @param xAxis
   * @param brushArea
   * @param area
   * @param data
   */
  // eslint-disable-next-line no-unused-vars
  resetZoom(x, stackedData, xAxis, brushArea, area, data) {
    throw new NoImplementationException('Base class is abstract and requires implementation!');
  }

  /**
   * Calculate data for the chart.
   * @param data Chart data in the format [{date: timestamp(ms), series1: value, series2: value, series3: value, series4: value, ...}, ...]
   * @param order
   * @returns Stacked chart data for d3 functions and preprocessed data { stackedData, data }
   */
  // eslint-disable-next-line no-unused-vars
  calculateChartData(data, order) {
    throw new NoImplementationException('Base class is abstract and requires implementation!');
  }

  /**
   *
   * @param path
   * @param bisectDate
   * @param rawData
   * @param mouseoverDate
   * @param data
   * @param resolution
   * @param tooltip
   * @param palette
   * @param event
   * @param node
   * @param brushArea
   * @param x
   * @param y
   */
  createdTooltipNode(path, bisectDate, rawData, mouseoverDate, data, resolution, tooltip, palette, event, node, brushArea, x, y) {
    throw new NoImplementationException('Base class is abstract and requires implementation!');
  }

  // eslint-disable-next-line no-unused-vars
  getBrushId(data) {
    throw new NoImplementationException('Base class is abstract and requires implementation!');
  }

  onMouseover(tooltip, event) {
    throw new NoImplementationException('Base class is abstract and requires implementation!');
  }

  onMouseLeave(tooltip, brushArea, event) {
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
      <div className={this.styles.chartDiv}>
        <svg className={this.styles.chartSvg} ref={svg => (this.svgRef = svg)} />
        <div className={this.styles.tooltip} ref={div => (this.tooltipRef = div)} />
      </div>
    );
  }

  hasUpdate() {
    const keysHash = hash(this.props.keys || []);
    return { hashes: { keysHash }, hasChanges: this.state.data.keysHash !== keysHash };
  }

  /**
   * Update the chart element. May only be called if this.props.content is not empty and the component is mounted.
   */
  updateElement() {
    //Initialization
    const contentHash = hash(this.props.content || []);
    const orderHash = hash(this.props.order || []);

    const { hashes, hasChanges } = this.hasUpdate();

    //Get d3-friendly data
    if (this.state.data.hash !== contentHash || this.state.data.orderHash !== orderHash || hasChanges) {
      this.setState({
        data: Object.assign({ hash: contentHash, orderHash }, hashes, this.calculateChartData(this.props.content, this.props.order))
      });
    }

    const { stackedData, data } = this.state.data;

    // cannot proceed without data
    if (!data || !stackedData || !stackedData.length) {
      return;
    }

    const yScale = this.props.yScale; //Multiplicator for the values on the y-scale
    const svg = d3.select(this.svgRef); //Select parent svg from render method
    const { width, height, paddings } = this.getDimsAndPaddings(svg); //Get width and height of svg in browser

    //Get X and Y scales, which translate data values into pixel values
    const { x, y } = this.createScales(this.getXDims(data), [paddings.left, width - paddings.right], this.getYDims(data), [
      height - paddings.bottom,
      paddings.top
    ]);

    const area = this.createAreaFunction(x, y);

    //Brush generator for brush-zoom functionality, with referenced callback-function
    const brush = d3.brushX().extent([[paddings.left, 0], [width - paddings.right, height]]);

    //Remove old data
    svg.selectAll('*').remove();

    //Draw the chart (and brush box) using everything provided
    const { brushArea, xAxis } = this.drawChart(svg, data, stackedData, area, brush, yScale, x, y, height, width, paddings);

    //Set callback for brush-zoom functionality
    brush.on('end', event => this.updateZoom(event.selection, x, xAxis, brush, brushArea, area));
    //Set callback to reset zoom on double-click
    svg.on('dblclick', () => this.resetZoom(x, stackedData, xAxis, brushArea, area, data));
  }

  /**
   * Get dimensions and padding of element
   * @param svg Svg-Element to get dimensions and paddings of
   * @returns {width, height, {paddings: {top: *, left: *, bottom: *, right: *}, width: *, height: *}}
   *          Values self-explanatory. All values in pixels.
   */
  getDimsAndPaddings(svg) {
    const paddings = this.props.paddings || { left: 0, right: 0, top: 0, bottom: 0 };
    const node = !svg || typeof svg.node !== 'function' ? { getBoundingClientRec: () => ({}) } : svg.node();
    const clientRect = node ? node.getBoundingClientRect() : {};
    const width = clientRect.width || 0;
    const height = clientRect.height || 0;

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
  createScales(xDims, xRange, yDims, yRange) {
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

  getColor(palette, d) {
    return palette[this.getBrushId(d)];
  }

  /**
   * Draw the chart onto the svg element.
   * @param svg element to draw on (e.g. d3.select(this.ref))
   * @param rawData raw, unstacked data, needed for tooltips
   * @param data stacked data from the calculateChartData function
   * @param area d3 area generator
   * @param brush d3 brush generator
   * @param yScale yScale factor from props (for applying formatting to the y axis)
   * @param x d3 x-scale from method createScales
   * @param y d3 y-scale from method createScales
   * @param height element height from getDimsAndPaddings method (required for axis formatting)
   * @param width element width from getDimsAndPaddings method (required for axis formatting)
   * @param paddings paddings of element from getDimsAndPaddings method ()
   * @returns {{brushArea: *, xAxis: *}} brushArea: Area that has all the contents appended to it,
   *               xAxis: d3 x-Axis for later transitioning (for zooming)
   */
  drawChart(svg, rawData, data, area, brush, yScale, x, y, height, width, paddings) {
    //Color palette with the form {author1: color1, ...}
    const palette = this.props.palette;
    const brushArea = svg.append('g');
    const resolution = this.props.resolution;

    const tooltip = d3.select(this.tooltipRef);

    this.setBrushArea(brushArea, brush, data, palette, area, tooltip, svg, x, rawData, resolution, y);

    //Append visible x-axis on the bottom, with an offset so it's actually visible
    let xAxis;
    if (this.props.xAxisCenter) {
      xAxis = brushArea.append('g').attr('transform', 'translate(0,' + y(0) + ')').call(d3.axisBottom(x));
    } else {
      xAxis = brushArea.append('g').attr('transform', 'translate(0,' + (height - paddings.bottom) + ')').call(d3.axisBottom(x));
    }

    const yAxis = brushArea.append('g').attr('transform', 'translate(' + paddings.left + ',0)');

    if (!this.props.hideVertical) {
      yAxis.call(d3.axisLeft(y).tickFormat(d => (this.props.displayNegative ? d : Math.abs(d))));
    }

    svg.on('wheel', this.createScrollEvent(svg, y, yAxis, brushArea, area));

    return { brushArea, xAxis };
  }

  /**
   *
   * @param brushArea
   * @param brush
   * @param data
   * @param palette
   * @param area
   * @param tooltip
   * @param svg
   * @param x
   * @param rawData
   * @param resolution
   * @param y
   */
  setBrushArea(brushArea, brush, data, palette, area, tooltip, svg, x, rawData, resolution, y) {
    brushArea.append('g').attr('class', 'brush').call(brush);

    const bisectDate = d3.bisector(d => d.date).left;
    const _this = this;

    //Append data to svg using the area generator and palette
    brushArea
      .selectAll()
      .data(data)
      .enter()
      .append('path')
      .attr('class', 'layer')
      .attr('id', _this.getBrushId)
      .style('fill', this.getColor.bind(this, palette))
      .attr('d', area)
      .attr('clip-path', 'url(#clip)')
      .on('mouseover', this.onMouseover.bind(this, tooltip))
      .on('mouseout', () => {
        //
        this.onMouseLeave.bind(this, tooltip, brushArea);
      })
      .on('mouseleave', this.onMouseLeave.bind(this, tooltip, brushArea))
      .on('mousemove', function(event) {
        if (event === undefined || event === null) {
          return;
        }

        //Calculate values and text for tooltip
        const node = svg.node();
        const pointer = d3.pointer(event, node);
        const mouseoverDate = x.invert(pointer[0]);
        _this.createdTooltipNode(
          this,
          bisectDate,
          rawData,
          mouseoverDate,
          data,
          resolution,
          tooltip,
          palette,
          event,
          node,
          brushArea,
          x,
          y
        );
      });
  }

  /**
   * Finds the chart values (for the displayed line) for the moused-over data-point
   * @param data
   * @param key
   * @param timeValue
   * @returns {{y1: *, y2: *}}
   */
  findChartValues(data, key, timeValue) {
    let foundValues = [];
    _.each(data, series => {
      if (series.key === key) {
        _.each(series, dataPoint => {
          if (dataPoint.data.date === timeValue) {
            foundValues = dataPoint;
            return false;
          }
        });
        return false;
      }
    });
    return { y1: foundValues[0], y2: foundValues[1] };
  }

  /**
   *
   * @param svg
   * @param y
   * @param yAxis
   * @param brushArea
   * @param area
   * @returns scroll event
   */
  createScrollEvent(svg, y, yAxis, brushArea, area) {
    return event => {
      const direction = event.deltaY > 0 ? 'down' : 'up';
      let zoomedDims = [...this.getYDims(this.state.data.data)];
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
          this.updateVerticalZoom([bottom / 2, top / 2], y, yAxis, brushArea, area);
        } else if (direction === 'down') {
          if (top * 2 > zoomedDims[1] && (bottom * 2 < zoomedDims[0] || bottom === 0)) {
            this.resetVerticalZoom(y, yAxis, brushArea, area);
          } else {
            this.updateVerticalZoom([bottom * 2, top * 2], y, yAxis, brushArea, area);
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
        this.updateVerticalZoom(zoomedDims, y, yAxis, brushArea, area);
      }
    };
  }

  /**
   * Update the vertical zoom (mouse wheel zoom) with new values
   * @param dims Y-Dimensions for new zoom level
   * @param y Y-Scale from d3
   * @param yAxis Y-Axis from d3
   * @param area Area that the paths are drawn on
   * @param areaGenerator Area generator for those paths
   */
  updateVerticalZoom(dims, y, yAxis, area, areaGenerator) {
    y.domain(dims);

    yAxis.call(d3.axisLeft(y));
    area.selectAll('.layer').attr('d', areaGenerator);
    this.setState({ zoomedVertical: true, verticalZoomDims: dims });
  }

  /**
   * Reset the vertical zoom to default values.
   * @param y Y-Scale from d3
   * @param yAxis Y-Axis from d3
   * @param area Area that the paths are drawn on
   * @param areaGenerator Area generator for those paths
   */
  resetVerticalZoom(y, yAxis, area, areaGenerator) {
    y.domain(this.getYDims(this.state.data.data));

    yAxis.call(d3.axisLeft(y));
    area.selectAll('.layer').attr('d', areaGenerator);

    this.setState({ zoomedVertical: false, verticalZoomDims: [0, 0] });
  }

  /**
   * Callback function for brush-zoom functionality. Should be called when brush ends. (.on("end"...)
   * @param extent Call event.selection inside an anonymous/arrow function, put that anonymous/arrow function as the .on callback method
   * @param x d3 x Scale provided by createScales function
   * @param xAxis d3 x-Axis provided by drawChart function
   * @param brush brush generator
   * @param brushArea Area that the path, x/y-Axis and brush-functionality live on (see drawChart)
   * @param area d3 Area generator (for area graphs)
   */
  updateZoom(extent, x, xAxis, brush, brushArea, area) {
    let zoomedDims;
    if (extent) {
      zoomedDims = [x.invert(extent[0]), x.invert(extent[1])];
      x.domain(zoomedDims);
      brushArea.select('.brush').call(brush.move, null);
    } else {
      return;
    }

    xAxis.call(d3.axisBottom(x));
    brushArea.selectAll('.layer').attr('d', area);
    this.setState({ zoomed: true, zoomedDims: zoomedDims });
  }
}

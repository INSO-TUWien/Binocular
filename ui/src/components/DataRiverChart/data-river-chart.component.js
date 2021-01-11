'use strict';

import * as d3 from 'd3';
import chroma from 'chroma-js';
import { BuildStat, RiverData } from './RiverData';
import styles from './data-river-chart.component.scss';
import ScalableBaseChartComponent from '../ScalableBaseChart';
import _ from 'lodash';
import { RiverDataContainer } from './RiverDataContainer';
import { InvalidArgumentException } from '../../utils/exception/InvalidArgumentException';
import RiverTooltip from './river-tooltip';
import { formatPercentage } from '../../utils/format';
import StreamKey from './StreamKey';
import { hash } from '../../utils/crypto-utils';
import IssueStream, { IssueColor, IssueData, IssueStat } from './IssueStream';

/**
 * ScalableBaseChartComponent
 * Takes the following props:
 *  - content (Format: [RiverData, ...],
 *             e.g. array of data points with date and series values)
 *  - authorPalette (Format: {seriesName1: color1, seriesName2: color2, ...}, color as string)
 *  - attributePalette (Format: {attribute1:color1, attribute2: color2...}, color as string)
 *  - issuePalette (Format: {IssueStat[]:{color1, color2...}, issueTicketName:color, ...}, color as string)
 *  - paddings (optional) (Format: {top: number, left: number, right: number, bottom: number},
 *             number being amount of pixels) Each field in the object is optional and can be left out)
 *  - xAxisCenter (optional) (Format: true/false,
 *             whether the x axis should be at the 0 line (true), or at the bottom (false/unspecified))
 *  - yDims (Format: [topValue, bottomValue],
 *             limits of the y-Axis on top/bottom, should correspond to data.)
 *  - keys (optional) (Format: [seriesName1, seriesName2, ...])
 *             Filters the chart, only showing the provided keys and leaving everything else out.
 *  - resolution (Format: 'years'/'months'/'weeks'/'days') Needed for date format in tooltips.
 *  - displayNegative (optional) (Format: true/false) Display negative numbers on y-scale.
 *  - order (optional) (Format: [string, string, ...]) Strings containing the keys in desired order (largest to smallest).
 */
export class DataRiverChartComponent extends ScalableBaseChartComponent {
  constructor(props) {
    super(props, styles);
  }

  /**
   *
   * @param scales
   * @returns {*}
   */
  createAreaFunction(scales) {
    //Area generator for the chart
    return d3
      .area()
      .x(d => scales.x(d.data.date))
      .y0(d => this.getPoint(scales, d).y0)
      .y1(d => this.getPoint(scales, d).y1)
      .curve(d3.curveMonotoneX);
  }

  /**
   *
   * @param scales
   * @param dataPoint
   * @returns {{y0: number, y1: number}}
   */
  getPoint(scales, dataPoint) {
    const rate = scales.y(dataPoint.data.buildSuccessRate);
    const offset = scales.diff(0);
    return { y0: rate + scales.diff(dataPoint[0]) - offset, y1: rate + scales.diff(dataPoint[1]) - offset };
  }

  /**
   *
   * @returns {[]}
   */
  getXDims() {
    const dates = Array.from(
      new Set(
        this.state.data.stackedData && this.state.data.stackedIssues
          ? [...this.state.data.stackedIssues, ...this.state.data.stackedData].reduce(
              (stack, stream) => [...stack, ...stream.filter(exist => exist).map(data => data.data.date)],
              []
            )
          : this.state.data.data.map(data => data.date)
      )
    );
    dates.push(new Date());

    return [d3.min(dates), d3.max(dates)];
  }

  /**
   *
   * @returns {[]}
   */
  getYDims() {
    return (
      this.state.yDims || [
        d3.max(this.state.data.data, data => data.deletions) || 0,
        d3.max(this.state.data.data, data => data.additions) || 0
      ]
    );
  }

  /**
   *
   * @param d
   * @returns {*}
   */
  getColor(d) {
    return `url(#color-${d.key.toId()})`;
  }

  /**
   *
   * @param scales
   * @param axes
   * @param brushArea
   * @param area
   */
  resetZoom(scales, axes, brushArea, area) {
    scales.x.domain(this.getXDims());
    axes.x.call(d3.axisBottom(scales.x));
    brushArea.selectAll('.layer').attr('d', area);
    this.setState({ zoomed: false });
  }

  /**
   * Update the vertical zoom (mouse wheel zoom) with new values
   * @param dims Y-Dimensions for new zoom level
   * @param scales Y-Scale from d3
   * @param axes Y-Axis from d3
   * @param area Area that the paths are drawn on
   * @param areaGenerator Area generator for those paths
   */
  updateVerticalZoom(dims, scales, axes, area, areaGenerator) {
    scales.diff.domain(dims);

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
  resetVerticalZoom(scales, axes, area, areaGenerator) {
    scales.diff.domain(this.getYDims());

    area.selectAll('.layer').attr('d', areaGenerator);

    this.setState({ zoomedVertical: false, verticalZoomDims: [0, 0] });
  }

  /**
   *
   * @param xDims
   * @param xRange
   * @param yDims
   * @param yRange
   * @returns {{x: *, y: *} & {width: *, height: *} & {issue: *, pattern: *, y: *, diff: *}}
   */
  createScales(xDims, xRange, yDims, yRange) {
    //Y axis scaled with the maximum amount of change (half in each direction)
    const scales = super.createScales(xDims, xRange, yDims, yRange);

    const scale = {
      height: d3.scaleLinear().domain([0.0, 100.0]).range(yRange),
      width: d3.scaleLinear().domain([100.0, 0.0]).range(xRange)
    };

    return Object.assign({}, scales, scale, {
      issue: d3
        .scaleOrdinal()
        .domain(IssueStat.getAvailable)
        .range(
          IssueStat.getAvailable.map((_, i, values) =>
            scale.height(i === 0 ? 100.0 : i === values.length - 1 ? 0.0 : 100.0 / (values.length - 1.0) * i)
          )
        ),
      y: d3.scaleLinear().domain([-1.0, 1.0]).range([scale.height(20), scale.height(80)]),
      diff: d3.scaleLinear().domain(scales.y.domain()).range([scale.height(70) - scale.height(100), 0]),

      // define design pattern values
      pattern: d3
        .scaleLinear()
        .domain([0, d3.max(scales.y.domain())])
        .range([
          Math.max(Math.min(scale.height(0) - scale.height(1), scale.width(0) - scale.width(1)), 1),
          Math.max(Math.min(scale.height(0) - scale.height(2), scale.width(0) - scale.width(2)), 5)
        ])
    });
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
  createYAxis(brushArea, scales, width, height, paddings) {
    const yAxis = brushArea.append('g').attr('class', this.styles.axis).attr('transform', 'translate(' + paddings.left + ',0)');

    if (!this.props.hideVertical) {
      yAxis.call(d3.axisLeft(scales.y).tickFormat(d => `${formatPercentage((d * 100 + 100) / 2.0)}%`));
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
  additionalAxes(brushArea, scales, width, height, paddings) {
    const issueAxis = brushArea
      .append('g')
      .attr('class', this.styles.axis)
      .attr('transform', 'translate(' + (width - paddings.right) + ',0)');

    if (!this.props.hideVertical) {
      issueAxis.call(d3.axisRight(scales.issue));
    }
  }

  /**
   *
   * @returns {{hasChanges: (boolean), hashes: {keysHash: string} & {issueHash: string}}}
   */
  hasUpdate() {
    const update = super.hasUpdate();
    const issueHash = hash(this.props.issueStreams || []);

    return {
      hashes: Object.assign(update.hashes, { issueHash }),
      hasChanges: update.hasChanges || this.state.data.issueHash !== issueHash
    };
  }

  /**
   * Calculate data for the chart.
   *
   * @param data Chart data in the format [RiverData, ...]
   * @param order contains the order to draw the data streams
   * @returns Stacked chart data for d3 functions and preprocessed data { stackedData, data }
   */
  calculateChartData(data, order) {
    if (!data.length) {
      return { stackedData: [], data };
    }

    if (data.find(record => !(record instanceof RiverData))) {
      throw new InvalidArgumentException('The provided data are not of the type RiverData!');
    }

    const streamingData = this.processStreamData(data, order);

    // set yDims associated with the presented data
    this.setState(prev =>
      Object.assign({}, prev, {
        yDims: [-d3.max(data, d => d.deletions) || 1, d3.max(data, d => d.additions) || 1]
      })
    );

    return streamingData;
  }

  /**
   *
   * @param data
   * @param order
   * @returns {{data: *, stackedData: *[]}}
   */
  processStreamData(data, order) {
    data = data
      .filter(record => record && record instanceof RiverData)
      .map(record => new RiverData(record))
      .sort((record1, record2) => (record1.date < record2.date ? -1 : record1.date > record2.date ? 1 : 0));

    const reorganizedData = this.preprocessData(data);
    const streamData = _.flatMap(reorganizedData.grouped.map(record => record.sort()));

    const keys = this.props.keys ? this.props.keys : streamData.filter(stream => stream.length).map(stream => new StreamKey(stream[0]));

    //Data formatted for d3
    const stackedData = this.createStackedData(streamData, keys);

    if (order && order.length) {
      stackedData.sort((streamA, streamB) => order.indexOf(streamA.key.name) - order.indexOf(streamB.key.name));
    }

    // add color set to stream
    this.setRiverStreamColors(stackedData);

    const issueStreams = this.preProcessIssueStreams(stackedData);
    const stackedIssues = this.processIssueStreams(issueStreams);

    this.setIssueStreamColors(issueStreams);

    return { data, stackedData, issueStreams, stackedIssues };
  }

  /**
   * @param colorPalette
   * @param name
   * @returns {void|*}
   */
  findColor(colorPalette, name) {
    if (!name || !colorPalette) {
      return name;
    }
    const key = Object.keys(colorPalette).find(colorKey => name.toUpperCase() === colorKey.toUpperCase()) || null;
    const color = key ? colorPalette[key] : undefined;
    return color ? chroma(color).alpha(0.85).hex('rgba') : color;
  }

  /**
   *
   * @param stackedData
   * @param skipChildren
   */
  setRiverStreamColors(stackedData, skipChildren) {
    stackedData.forEach(stack => {
      const nameColorKey = Object.keys(this.props.authorPalette || {}).find(
        colorKey =>
          colorKey.toLowerCase().includes(stack.key.name.toLowerCase()) &&
          colorKey.toLowerCase().includes(stack.key.direction.toLowerCase())
      );

      const color = {
        attribute:
          this.props.attributePalette && stack.key.attribute in this.props.attributePalette
            ? chroma(this.props.attributePalette[stack.key.attribute]).alpha(0.85).hex('rgba')
            : undefined,
        name: this.findColor(this.props.authorPalette, nameColorKey)
      };

      if (!skipChildren) {
        stack.forEach(node => (node.color = color));
      }

      stack.color = color;
    });
  }

  /**
   *
   * @param issueStreams
   */
  setIssueStreamColors(issueStreams) {
    const colors = IssueStat.getAvailable.map(key => this.findColor(this.props.issuePalette, key));
    issueStreams.forEach(stack => {
      stack.color = new (IssueColor.bind.apply(IssueColor, [
        undefined,
        this.findColor(this.props.issuePalette, stack.ticketId),
        ...colors
      ]))();
    });
  }

  /**
   *
   *
   * @param dataStreams
   * @param keys
   * @returns {[]}
   */
  createStackedData(dataStreams, keys) {
    return dataStreams
      .filter(
        stream => !keys || (keys.length && !!keys.find(key => key && key.name === stream[0].name && key.attribute === stream[0].attribute))
      )
      .reduce((stack, dataStream, index) => {
        const stream = {
          additions: this.createStack(dataStream, index * 2, record => [0, record.additions + (!record.shas.length ? 0.001 : 0)]),
          deletions: this.createStack(dataStream, index * 2 + 1, record => [-record.deletions - (!record.shas.length ? 0.001 : 0), 0])
        };

        Object.keys(stream).forEach(key => {
          if (stream[key] && stream[key].length) {
            stream[key].key.direction = key;
            stream[key].key[0] = stream[key].index;
            stream[key].forEach(dataPoint => (dataPoint.key.direction = key));
            stack.push(stream[key]);
          }
        });
        return stack;
      }, []);
  }

  /**
   *
   * @param data
   * @returns {*}
   */
  preprocessData(data) {
    const maxDiff = d3.max(data, d => d.additions + d.deletions);

    return this.createOrganizeDataStreams(data, this.calculateDateDiff(data).dateTicks, maxDiff);
  }

  /**
   *
   * @param data
   * @returns {{dateDiff: (*|number), dateTicks: *[]}}
   */
  calculateDateDiff(data) {
    //calculate minimum x difference
    const dateDiff =
      data
        .map(record => record.date)
        .filter(date => date && !Number.isNaN(date.getTime()) && !isNaN(date.getTime()))
        .map(date => date.getTime())
        .map((date, i, dates) => date - dates[i - 1])
        .filter(diff => !Number.isNaN(diff) && !isNaN(diff) && diff > 0)
        .sort()[0] || 1;

    return {
      dateDiff,
      dateTicks: [
        new Date(data[0].date.getTime() - dateDiff),
        ...data.map(record => record.date),
        new Date(data[data.length - 1].date.getTime() + dateDiff)
      ]
    };
  }

  /**
   *
   * @param data
   * @param dateTicks
   * @param maxDiff
   * @returns RiverDataContainer
   */
  createOrganizeDataStreams(data, dateTicks, maxDiff) {
    return data.reduce((current, record) => {
      const container = current.getValue(record.name).getValue(record.attribute);

      // init all existing date nodes
      if (!container.length) {
        dateTicks.forEach(date => (container.getValue(date.getTime()).value = new RiverData(date, record.attribute, record.name)));
      }

      this.calculateBuildRates(container, record, maxDiff);

      // add record to container
      container.getValue(record.date.getTime()).value = record;

      // set build rate for all future items until a new existing datapoint
      dateTicks.forEach(date => {
        if (date.getTime() > record.date.getTime()) container.getValue(date.getTime()).value.buildSuccessRate = record.buildSuccessRate;
      });
      return current;
    }, new RiverDataContainer(''));
  }

  /**
   *
   * @param container
   * @param record
   * @param maxDiff
   */
  calculateBuildRates(container, record, maxDiff) {
    const prevIndex = container.indexOf(record.date.getTime()) - 1;
    const previous = prevIndex >= 0 ? container.values[prevIndex].value : undefined;

    // calculate ci success rate
    record.buildSuccessRate =
      (previous ? previous.buildSuccessRate : 0.0) +
      (record.buildStat === BuildStat.Success
        ? record.buildWeight * record.totalDiff / maxDiff
        : record.buildStat === BuildStat.Failed || record.buildStat === BuildStat.Errored
          ? -record.buildWeight * record.totalDiff / maxDiff
          : 0.0);

    // define range of success rate
    record.buildSuccessRate =
      record.buildSuccessRate >= 0.0 ? Math.min(record.buildSuccessRate, 1.0) : Math.max(record.buildSuccessRate, -1.0);

    record.trend = Math.sign(record.buildSuccessRate - previous.buildSuccessRate);
  }

  /**
   *
   * @param stream
   * @param index
   * @param offset
   * @returns {{length}|*|*[]}
   */
  createStack(stream, index, offset) {
    const dataStream = stream.map((record, pointIndex) => {
      const dataPoint = offset(record);
      dataPoint.index = pointIndex;
      dataPoint.data = record;
      dataPoint.key = new StreamKey(record);
      return dataPoint;
    });

    if (!dataStream || !dataStream.length) {
      return [];
    }

    dataStream.index = index;
    dataStream.key = dataStream[0].key;

    const size = stream => Math.max(d3.max(stream, d => d.data.additions), d3.max(stream, d => d.data.deletions), 1);
    dataStream.pattern = {
      size,
      position: (scale, stream) => scale(size(stream)) / 2,
      radius: (scale, stream) => scale(size(stream)) / 2 + 0.5,
      offset: (scale, stream) => scale(size(stream)) * 0.75
    };
    return dataStream;
  }

  /**
   *
   * @param stackedData
   */
  preProcessIssueStreams(stackedData) {
    if (!this.props.issueStreams || !this.props.issueStreams.length) {
      return [];
    }

    const issueStreams = this.props.issueStreams.map(stream => new IssueStream(stream));

    issueStreams.forEach(stream => {
      const issueStream = stackedData.reduce(
        (stack, data) => [
          ...stack,
          ...data.filter(
            record =>
              record &&
              record.data &&
              record.data.shas &&
              record.data.shas.length > 0 &&
              !!record.data.shas.find(sha => !!stream.find(issue => sha === issue.sha))
          )
        ],
        []
      );

      stream.forEach(ticketPoint => {
        ticketPoint.values = issueStream.filter(dataPoint => !!dataPoint.data.shas.find(sha => sha === ticketPoint.sha));
        ticketPoint.points = Array.from(new Set(ticketPoint.values.map(record => record.data)));
      });

      stream.__values.sort(
        (point1, point2) =>
          d3.min(point1.points, point => point.data.date.getTime()) - d3.min(point2.points, point => point.data.date.getTime())
      );
    });

    return issueStreams;
  }

  /**
   *
   * @param issueStreams
   * @returns {*}
   */
  processIssueStreams(issueStreams) {
    return issueStreams.reduce((streams, stream) => {
      const maxStreamCount = d3.max(stream.values, ticketDataPoint => ticketDataPoint.points.length);
      const data = [];
      for (let i = 0; i < maxStreamCount * 2; i++) {
        const issueStream = [stream.start, ...stream.map(dataPoint => dataPoint.values[i % dataPoint.values.length])].filter(
          exist => exist
        );
        if (stream.isClosed) {
          issueStream.push(stream.end);
        }
        issueStream.stream = stream;
        issueStream.key = new StreamKey({ data: { name: stream.ticketId, direction: i } });
        data.push(issueStream);
      }
      return [...streams, ...data];
    }, []);
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
  setBrushArea(brushArea, brush, area, tooltip, svg, scales) {
    if (!this.state.data.stackedData || !this.state.data.stackedData.length) {
      return;
    }
    super.setBrushArea(brushArea, brush, area, tooltip, svg, scales);

    this.paintIssueDataPoints(scales, brushArea, tooltip);
  }

  /**
   *
   * @param scales
   * @param brushArea
   * @param tooltip
   */
  paintIssueDataPoints(scales, brushArea, tooltip) {
    if (!this.state.data.issueStreams || !this.state.data.issueStreams.length) {
      return;
    }

    const issueDataPoints = this.getIssueDataPoints();

    const radius = Math.max(
      issueDataPoints.length > 1 ? (scales.x(issueDataPoints[1].data.date) - scales.x(issueDataPoints[0].data.date)) * 0.01 : 0,
      5
    );
    const size = d => Math.max(d.data.additions || 0, d.data.deletions || 1, 1);
    issueDataPoints.forEach(
      d => (d.radius = Math.min(Math.max((scales.diff(0) - scales.diff(size(d))) / 100 * radius, 5), scales.height(50)))
    );
    issueDataPoints.sort((a, b) => b.radius - a.radius);

    const _this = this;

    const getColor = d => d.stream.color[d instanceof IssueData ? d.status.name : d.issue ? d.issue.status.name : undefined];

    brushArea
      .append('g')
      .selectAll('a')
      .data(issueDataPoints)
      .enter()
      .append('a')
      .attr('href', d => (d.issue ? d.issue.webUrl : d.webUrl))
      .attr('target', '_blank')
      .attr('rel', 'noopener noreferrer')
      .append('circle')
      .classed('issue-nodes', true)
      .attr('fill', d => d.stream.color.ticket || getColor(d))
      .attr('cx', d => scales.x(d.data.date))
      .attr('cy', d => (d instanceof IssueData ? scales.issue(d.status.name) : scales.y(d.buildSuccessRate)))
      .attr('r', d => d.radius)
      .attr('stroke-width', d => (!(d instanceof IssueData) && !d.issue ? 0 : 3))
      .attr('stroke', getColor)
      .on('mouseenter', (event, dataPoint) => {
        tooltip.attr('additional', dataPoint.stream.ticketId);
        tooltip.attr('color', `${dataPoint.stream.color.ticket || getColor(dataPoint)}`);

        if (dataPoint instanceof IssueData) {
          tooltip.attr('issue', dataPoint);
          tooltip.attr('data', { name: 'Ticket Status', date: dataPoint.date });
          tooltip.attr('attrColor', dataPoint.stream.color[dataPoint.status.name]);
          tooltip.attr('statusColor', dataPoint.stream.color[dataPoint.status.name]);
          return;
        }

        tooltip.attr('issue', dataPoint.issue);
        tooltip.attr('data', dataPoint);
        tooltip.attr('attrColor', this.findColor(this.props.attributePalette, dataPoint.attribute));
        tooltip.attr('statusColor', dataPoint.stream.color[dataPoint.issue.status.name]);

        this.raiseFilteredStreams(dataPoint.data);

        const normalizedPoint = [-dataPoint.deletions, dataPoint.additions];
        normalizedPoint.data = dataPoint;
        const coords = this.getPoint(scales, normalizedPoint);
        this.paintDataPoint(
          brushArea,
          scales.x(normalizedPoint.data.date),
          coords.y0,
          coords.y1,
          dataPoint.stream.color.ticket || getColor(dataPoint)
        );
      })
      .on('mouseout', function(event, stream) {
        return _this.onMouseLeave.bind(_this, this, tooltip, brushArea)(event, stream);
      });
  }

  /**
   *
   * @returns {any[]}
   */
  getIssueDataPoints() {
    if (!this.state.data.issueStreams || !this.state.data.issueStreams.length) {
      return [];
    }
    return Array.from(
      new Set(
        this.state.data.issueStreams.reduce((dataStream, stream) => {
          const dataPoints = stream.values.reduce(
            (data, item) => [
              ...data,
              ...item.points.map(d => {
                d.issue = item;
                return d;
              })
            ],
            []
          );
          dataPoints.forEach(item => {
            item.stream = stream;
          });
          const start = stream.start;
          start.stream = stream;
          dataStream = [...dataStream, start, ...dataPoints];
          if (stream.isClosed) {
            const end = stream.end;
            end.stream = stream;
            dataStream.push(end);
          }
          return dataStream;
        }, [])
      )
    );
  }

  /**
   *
   * @param brushArea
   * @param pathStreams
   * @param scales
   */
  additionalPathDefs(brushArea, pathStreams, scales) {
    const defs = brushArea.append('defs');

    const pattern = defs
      .selectAll('pattern')
      .data(this.state.data.stackedData.filter(data => data && !data.stream && !(data.stream instanceof IssueData)))
      .enter()
      .append('pattern')
      .attr('width', stream => scales.pattern(stream.pattern.size(stream)))
      .attr('height', stream => scales.pattern(stream.pattern.size(stream)))
      .attr('id', stream => `color-${stream.key.toId()}`)
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('x', stream => stream.pattern.offset(scales.pattern, stream))
      .attr('y', stream => stream.pattern.offset(scales.pattern, stream))
      .attr('patternTransform', (d, i) => `rotate(${(i * 360 / this.state.data.stackedData.length + 1 * i) % 360} 50 50)`);

    pattern.append('rect').attr('fill', d => d.color.attribute).attr('width', '100%').attr('height', '100%');

    pattern
      .append('circle')
      .attr('fill', d => d.color.name)
      .attr('cx', stream => stream.pattern.position(scales.pattern, stream))
      .attr('cy', stream => stream.pattern.position(scales.pattern, stream))
      .attr('r', stream => stream.pattern.radius(scales.pattern, stream));

    pathStreams.attr('opacity', 0.9);

    const gradients = defs
      .selectAll('linearGradient')
      .data(Array.from(new Set(this.state.data.stackedData.filter(data => data && data.stream && data.stream instanceof IssueStream))))
      .enter()
      .append('linearGradient')
      .attr('id', stream => `color-${stream.key.toId()}`);

    gradients.append('stop').attr('offset', '0%').attr('stop-color', stream => stream.color[IssueStat.Open.name]);
    gradients.append('stop').attr('offset', '20%').attr('stop-color', stream => stream.color[IssueStat.InProgress.name]);
    gradients.append('stop').attr('offset', '80%').attr('stop-color', stream => stream.color[IssueStat.InProgress.name]);
    gradients
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', stream => (stream.stream.isClosed ? stream.color[IssueStat.Close.name] : undefined));
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
   * @param stream
   */
  createdTooltipNode(path, bisectDate, mouseoverDate, tooltip, event, node, brushArea, scales, stream) {
    const realDataStream = stream.filter(record => record && record.data && record.data.shas && record.data.shas.length > 0);
    const nearestDateIndex = bisectDate(realDataStream.map(record => record.data), mouseoverDate);
    const candidate1 = realDataStream[nearestDateIndex] || realDataStream[realDataStream.length - 1];
    const candidate2 = realDataStream[nearestDateIndex - 1] || realDataStream[0];

    if (!candidate1 || !candidate2) {
      return;
    }
    const nearestDataPoint =
      Math.abs(mouseoverDate - candidate1.data.date) < Math.abs(mouseoverDate - candidate2.data.date) ? candidate1 : candidate2;

    tooltip.attr('data', nearestDataPoint.data);
    tooltip.attr('additional', nearestDataPoint.key.direction);
    tooltip.attr('color', `${nearestDataPoint.color.name}`);
    tooltip.attr('attrColor', nearestDataPoint.color.attribute);

    const dataPoint = this.getPoint(scales, nearestDataPoint);
    this.paintDataPoint(brushArea, scales.x(nearestDataPoint.data.date), dataPoint.y0, dataPoint.y1, nearestDataPoint.color.name);
  }

  raiseFilteredStreams(key, streamCb) {
    this.state.data.stackedData.forEach(dataStream => {
      if (dataStream.key.eqPrimKey(key)) {
        d3.select(`#${this.getBrushId(dataStream)}`).raise().attr('opacity', 1);
        if (typeof streamCb === 'function') {
          streamCb(dataStream, key);
        }
      } else {
        d3.select(`#${this.getBrushId(dataStream)}`).attr('opacity', 0.5);
      }
    });
  }

  /**
   *
   * @param path
   * @param tooltip
   * @param brushArea
   * @param event
   * @param stream
   */
  // eslint-disable-next-line no-unused-vars
  onMouseover(path, tooltip, brushArea, event, stream) {
    this.raiseFilteredStreams(stream.key);
    event.preventDefault();
  }

  /**
   *
   * @param path
   * @param tooltip
   * @param brushArea
   * @param event
   * @param stream
   */
  // eslint-disable-next-line no-unused-vars
  onMouseLeave(path, tooltip, brushArea, event, stream) {
    tooltip.attr('data', null);
    brushArea.select('.' + this.styles.indicatorLine).remove();
    brushArea.selectAll('.' + this.styles.indicatorCircle).remove();
    brushArea.selectAll('.layer').attr('opacity', 0.9).sort((streamA, streamB) => streamA.index - streamB.index);
  }

  /**
   *
   * @param data
   * @returns {string}
   */
  // eslint-disable-next-line no-unused-vars
  getBrushId(data) {
    return data.stream ? `issue-${data.key.toId()}` : `stream-${data.key.toId()}`;
  }

  /**
   *
   * @param data
   * @returns {string}
   */
  getBrushClass(data) {
    return data.stream ? 'issues' : 'changes';
  }

  render() {
    return (
      <div className={this.styles.chartDiv}>
        <svg className={this.styles.chartSvg} ref={svg => (this.svgRef = svg)} />
        <RiverTooltip ref={div => (this.tooltipRef = div)} attribute={this.props.attribute} resolution={this.props.resolution} />
      </div>
    );
  }
}

export default DataRiverChartComponent;

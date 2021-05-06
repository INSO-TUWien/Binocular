import React from 'react';
import * as d3 from 'd3';
import moment from 'moment';

function wrap(text, width) {
  text.each(function() {
    let text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, // ems
      y = text.attr('y'),
      dy = parseFloat(text.attr('dy')),
      tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');
    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(' '));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(' '));
        line = [word];
        tspan = text
          .append('tspan')
          .attr('x', 0)
          .attr('y', y)
          .attr('dy', ++lineNumber * lineHeight + dy + 'em')
          .text(word);
      }
    }
  });
}

function drawSelectionStroke(className) {
  drawStroke('.' + className, 'black', '2');
}

function drawHoverStroke(className) {
  drawStroke('.' + className, 'yellow', '2');
}

function removeStroke(className) {
  drawStroke('.' + className, 'none', '0');
}

function drawStroke(selection, stroke, strokeWidth) {
  d3
    .selectAll(selection)
    .transition()
    .duration(250)
    .attr('stroke', stroke)
    .attr('stroke-width', strokeWidth);
}

export default class StackedBarChart extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.drawChart();
  }

  drawChart() {
    const data = [];
    const that = this;
    let selectedG = [];
    const selectedBlames = [];
    this.props.data.blames.forEach(blame => {
      data.push({
        date: blame.commit.date,
        additions: blame.commit.stats.additions,
        deletions: -blame.commit.stats.deletions,
        blame: blame
      });
    });

    const stackMin = serie => {
      return d3.min(serie, d => {
        return d[0];
      });
    };

    const stackMax = serie => {
      return d3.max(serie, d => {
        return d[1];
      });
    };

    // set the dimensions and margins of the graph
    const margin = { top: 30, right: 0, bottom: 20, left: 30 },
      width = 450 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    const groups = ['additions', 'deletions'];

    const series = d3.stack().keys(groups).offset(d3.stackOffsetDiverging)(data);

    const x = d3
      .scaleBand()
      .domain(
        data.map(function(d) {
          return moment(d.date).format('DD.MM.YY HH:mm');
        })
      )
      .rangeRound([margin.left, width - margin.right])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([d3.min(series, stackMin), d3.max(series, stackMax)])
      .rangeRound([height - margin.bottom, margin.top]);

    const xAxis = g =>
      g.attr('transform', `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x));

    const color = d3.scaleOrdinal().domain(groups).range(['#5eb837', '#e41a1c']);

    const resizeSelection = (selection, x, y, width) =>
      selection.attr('x', +x + width / 2 - 7.5).attr('y', +y - 5).attr('fill', 'black');

    const zoom = d3.zoom().scaleExtent([0.1, 10]).on('zoom', function() {
      x.range([margin.left, width - margin.right].map(d => d3.event.transform.applyX(d)));
      svg
        .selectAll('.bars rect')
        .attr('x', d => x(moment(d.data.date).format('DD.MM.YY HH:mm')))
        .attr('width', x.bandwidth());
      svg.selectAll('.x-axis').call(xAxis).selectAll('.tick text').call(wrap, x.bandwidth());
      // resize and reposition text of selected bars
      selectedG.forEach(g => {
        const bar = d3.select(g).select('rect');
        const text = d3.select(g).select('text');
        const x = bar.attr('x');
        const y = bar.attr('y');
        const width = bar.attr('width');
        resizeSelection(text, x, y, width);
      });
    });
    const svg = d3
      .select('#' + this.props.data.id)
      .append('svg')
      .attr('viewBox', [
        0,
        0,
        width + margin.left + margin.right,
        height + margin.top + margin.bottom
      ])
      .call(zoom)
      .on('dblclick.zoom', null);

    const g = svg.append('g').attr('transform', 'translate(10, 0)');

    // Set clip region, rect with same width/height as "drawing" area, where we will be able to zoom in
    g
      .append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('x', margin.top)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', height + margin.bottom);

    const main = g.append('g').attr('class', 'main').attr('clip-path', 'url(#clip)');

    main
      .append('g')
      .attr('class', 'bars')
      .selectAll('g')
      .data(series)
      .enter()
      .append('g')
      .attr('fill', function(d) {
        return color(d.key);
      })
      .selectAll('rect')
      .data(function(d) {
        return d;
      })
      .enter()
      .append('g')
      .append('rect')
      .attr('width', x.bandwidth)
      .attr('x', function(d) {
        return x(moment(d.data.date).format('DD.MM.YY HH:mm'));
      })
      .attr('y', function(d) {
        return y(d[1]);
      })
      .attr('height', function(d) {
        return y(d[0]) - y(d[1]);
      });
    main
      .selectAll('rect')
      .attr('class', function(d, i, n) {
        // positive and negative bars should have the same rect class index
        if (i >= n.length / 2) {
          return 'rect' + (i - n.length / 2);
        } else {
          return 'rect' + i;
        }
      })
      .on('click', function() {
        const className = d3.select(this).nodes()[0].getAttribute('class').split(' ')[0];
        const nodes = d3.selectAll('.' + className).nodes();
        const getClassName = g =>
          d3.select(g).select('rect').node().getAttribute('class').split(' ')[0];

        let newSelect = true;
        // check if bar is already selected
        selectedG.forEach((selected, i) => {
          if (getClassName(selected) === className) {
            removeStroke(className);
            nodes.forEach(node => node.classList.remove('selectedBar'));
            selectedBlames.splice(i, 1);
            d3.select(selectedG.splice(i, 1)[0]).select('text').remove();
            newSelect = false;
            that.props.handleChange(selectedBlames);
            drawHoverStroke(className);
            // update text
            d3.select(selectedG[0]).select('text').text('S1');
          }
        });

        if (newSelect) {
          if (selectedG.length === 2) {
            const oldBar = d3.select(selectedG.pop());
            const oldClassName = oldBar
              .select('rect')
              .nodes()[0]
              .getAttribute('class')
              .split(' ')[0];
            oldBar.select('text').remove();
            d3
              .selectAll('.' + oldClassName)
              .nodes()
              .forEach(node => node.classList.remove('selectedBar'));
            removeStroke(oldClassName);
            selectedBlames.pop();
          }
          let displayText = 'S';
          if (selectedG.length === 0) {
            displayText += '1';
          } else {
            displayText += '2';
          }
          drawSelectionStroke(className);
          nodes.forEach(node => node.classList.add('selectedBar'));
          const bar = d3.select(nodes[0]);
          const x = bar.attr('x');
          const y = bar.attr('y');
          const width = bar.attr('width');
          const text = d3.select(bar.node().parentNode).append('text').text(displayText);
          resizeSelection(text, x, y, width);
          selectedG.push(bar.node().parentNode);
          selectedBlames.push(d3.select('.' + className).data()[0].data.blame);
          that.props.handleChange(selectedBlames);
        }
      })
      .on('mouseenter', function() {
        const className = d3.select(this).nodes()[0].getAttribute('class').split(' ')[0];
        drawHoverStroke(className);
      })
      .on('mouseout', function() {
        const classNames = d3.select(this).nodes()[0].getAttribute('class').split(' ');
        const rectClassName = classNames[0];
        if (classNames.includes('selectedBar')) {
          drawSelectionStroke(rectClassName);
        } else {
          // remove hover selection
          removeStroke(rectClassName);
        }
      });
    svg
      .append('g')
      .attr('class', 'y-axis')
      .attr('transform', 'translate(' + margin.left + ',0)')
      .call(d3.axisLeft(y));
    main.append('g').attr('class', 'x-axis').call(xAxis);
    svg.selectAll('.x-axis').call(xAxis).selectAll('.tick text').call(wrap, x.bandwidth());
  }

  render() {
    return null;
  }
}

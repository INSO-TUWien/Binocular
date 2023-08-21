'use strict';

import React, { useRef } from 'react';

import styles from '../styles.scss';
import * as d3 from 'd3';
import moment from 'moment';

export default (props) => {
  const svgChartRef = useRef(null);

  const renderChart = () => {
    const { width, height } = svgChartRef.current.getBoundingClientRect();
    const margin = 20;
    const svg = d3.select(svgChartRef.current).attr('width', '100%').attr('height', '100%');

    let firstDate = moment(props.sprints[0].from);
    let lastDate = moment(props.sprints[0].to);

    props.sprints.forEach((s) => {
      if (moment(s.from) < firstDate) {
        firstDate = moment(s.from);
      }
      if (moment(s.to) > lastDate) {
        lastDate = moment(s.to);
      }
    });

    const scale = d3
      .scaleUtc()
      .domain([firstDate, lastDate])
      .range([margin, width - margin]);

    const sprints = svg.selectAll('rect').data(props.sprints).enter().append('g');
    sprints
      .append('rect')
      .attr('x', (d) => scale(moment(d.from)))
      .attr('y', height - 40)
      .attr('width', (d) => scale(moment(d.to)) - scale(moment(d.from)) - 4)
      .attr('height', '20')
      .attr('fill', '#3273dc')
      .attr('stroke-width', '1')
      .attr('rx', '.2rem')
      .attr('stroke', '#2262ca');
    sprints
      .append('text')
      .text((d) => d.name + ' (' + moment(d.from).format('DD.MM.YYYY') + '-' + moment(d.to).format('DD.MM.YYYY') + ')')
      .attr('width', (d) => scale(moment(d.to)) - scale(moment(d.from)))
      .attr('x', (d) => scale(moment(d.from)) + 5)
      .attr('y', height - 25)
      .attr('height', '20')
      .attr('fill', 'white')
      .attr('font-size', '1rem');

    svg
      .append('g')
      .attr('transform', 'translate(0,' + (height - margin) + ')')
      .call(d3.axisBottom().scale(scale));
  };

  React.useEffect(() => {
    renderChart();
  }, []);
  return (
    <div className={styles.chartContainer}>
      <svg className={styles.chartSvg} ref={svgChartRef} />
    </div>
  );
};

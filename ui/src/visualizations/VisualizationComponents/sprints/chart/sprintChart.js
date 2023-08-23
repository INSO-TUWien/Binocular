'use strict';

import React, { useRef } from 'react';
import ReactDOMServer from 'react-dom/server';

import styles from '../styles.scss';
import * as d3 from 'd3';
import moment from 'moment';
import { aggregateTimeTrackingData, convertToTimeString, extractTimeTrackingDataFromNotes } from '../../../../utils/timeTracking';
import { object } from 'prop-types';

export default (props) => {
  const svgChartRef = useRef(null);

  const renderChart = () => {
    const { width, height } = svgChartRef.current.getBoundingClientRect();
    const margin = 20;
    d3.select(svgChartRef.current).selectAll('*').remove();
    const svg = d3.select(svgChartRef.current).append('svg').attr('width', '100%').attr('height', '100%');
    if (props.sprints.length > 0) {
      let firstDate = moment(props.sprints[0].from);
      let lastDate = moment(props.sprints[0].to);

      //Calculate earliest and latest date
      props.sprints.forEach((s) => {
        if (moment(s.from) < firstDate) {
          firstDate = moment(s.from);
        }
        if (moment(s.to) > lastDate) {
          lastDate = moment(s.to);
        }
      });
      props.issues.forEach((s) => {
        if (moment(s.createdAt) < firstDate) {
          firstDate = moment(s.createdAt);
        }
        if (moment(s.closedAt) > lastDate) {
          lastDate = moment(s.closedAt);
        }
      });

      //calculate amount of most paralell issues
      const events = [];
      props.issues.forEach((i) => {
        events.push({ dateTime: i.createdAt, type: 'opened' });
        events.push({ dateTime: i.closedAt, type: 'closed' });
      });

      events.sort((a, b) => moment(a.dateTime) - moment(b.dateTime));
      let openEvents = 0;
      let maxOpenEvents = 0;

      events.forEach((e) => {
        switch (e.type) {
          case 'opened':
            openEvents++;
            break;
          case 'closed':
            openEvents--;
            break;
        }
        if (openEvents > maxOpenEvents) {
          maxOpenEvents = openEvents;
        }
      });

      //calculate Time Traking Data
      const issuesData = props.issues.map((i) => {
        const extractedTimeTrackingData = extractTimeTrackingDataFromNotes(i.notes);
        const { aggregatedTimeTrackingData, totalTime } = aggregateTimeTrackingData(extractedTimeTrackingData);
        let authorWithMostSpentTime = '';
        let timeSpentAuthorWithMostSpentTime = 0;
        for (const author in aggregatedTimeTrackingData) {
          if (aggregatedTimeTrackingData[author] > timeSpentAuthorWithMostSpentTime) {
            timeSpentAuthorWithMostSpentTime = aggregatedTimeTrackingData[author];
            authorWithMostSpentTime = author;
          }
        }
        i.aggregatedTimeTrackingData = aggregatedTimeTrackingData;
        i.authorWithMostSpentTime = authorWithMostSpentTime;
        i.totalTime = totalTime;
        return i;
      });

      const mergeRequestData = props.mergeRequests.map((mr) => {
        const extractedTimeTrackingData = extractTimeTrackingDataFromNotes(mr.notes);
        const { aggregatedTimeTrackingData, totalTime } = aggregateTimeTrackingData(extractedTimeTrackingData);
        let authorWithMostSpentTime = '';
        let timeSpentAuthorWithMostSpentTime = 0;
        for (const author in aggregatedTimeTrackingData) {
          if (aggregatedTimeTrackingData[author] > timeSpentAuthorWithMostSpentTime) {
            timeSpentAuthorWithMostSpentTime = aggregatedTimeTrackingData[author];
            authorWithMostSpentTime = author;
          }
        }
        mr.aggregatedTimeTrackingData = aggregatedTimeTrackingData;
        mr.authorWithMostSpentTime = authorWithMostSpentTime;
        mr.totalTime = totalTime;
        return mr;
      });

      //create chart

      const scale = d3
        .scaleUtc()
        .domain([firstDate, lastDate])
        .range([margin, width - margin]);

      const tooltip = d3
        .select(svgChartRef.current)
        .append('div')
        .style('position', 'fixed')
        .style('visibility', 'hidden')
        .attr('class', styles.tooltip);

      const issues = svg.append('g').selectAll('g').data(issuesData).enter().append('g');
      issues
        .append('rect')
        .attr('x', (d) => scale(moment(d.createdAt)))
        .attr('y', (d) => 30 + (((d.iid * (height - 110)) / maxOpenEvents) % (height - 110)))
        .attr('width', (d) => Math.max(scale(moment(d.closedAt)) - scale(moment(d.createdAt)) - 4, 1))
        .attr('height', (height - 110) / maxOpenEvents)
        .attr('fill', (d) =>
          props.colorIssuesMergeRequestsMostTimeSpent
            ? getColorForAuthorName(d.authorWithMostSpentTime, props.mergedAuthors)
            : getColorForAuthorName(d.author.name, props.mergedAuthors)
        )
        .attr('stroke-width', '2')
        .attr('rx', '.2rem')
        .attr('stroke', '#fff')
        .on('mouseover', function () {
          tooltip.style('visibility', 'visible');
        })
        .on('mousemove', function (e, d) {
          tooltip.style('top', e.pageY + 10 + 'px').style('left', e.pageX + 10 + 'px');

          tooltip.html(
            ReactDOMServer.renderToStaticMarkup(
              <div>
                <div>
                  <span className={styles.tooltipIID}>#{d.iid}</span>
                  <span className={styles.tooltipTitle}>{d.title}</span>
                  <span>(Click to open)</span>
                </div>
                <div>Created: {d.createdAt}</div>
                <div>Closed: {d.closedAt} </div>
                <div>Author: {d.author.name} </div>
                <div className={styles.timeSpentBar}>
                  {Object.keys(d.aggregatedTimeTrackingData).map((authorName) => {
                    return (
                      <div
                        className={styles.timeSpentBlock}
                        style={{
                          width: (100 / d.totalTime) * d.aggregatedTimeTrackingData[authorName] + '%',
                          background: getColorForAuthorName(authorName, props.mergedAuthors),
                        }}>
                        <div className={styles.timeSpentBlockText}>{authorName}</div>
                        <div className={styles.timeSpentBlockTime}>{convertToTimeString(d.aggregatedTimeTrackingData[authorName])}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          );
        })
        .on('mouseout', function () {
          tooltip.style('visibility', 'hidden');
        })
        .on('click', function (e, d) {
          window.open(d.webUrl, '_blank');
        });

      const mergeRequests = svg.append('g').selectAll('g').data(mergeRequestData).enter().append('g');
      mergeRequests
        .append('rect')
        .attr('x', (d) => scale(moment(d.createdAt)))
        .attr('y', (d) => 30 + (((d.iid * (height - 110)) / maxOpenEvents) % (height - 110)) - 2)
        .attr('width', (height - 110) / maxOpenEvents + 4)
        .attr('height', (height - 110) / maxOpenEvents + 4)
        .attr('fill', (d) =>
          props.colorIssuesMergeRequestsMostTimeSpent
            ? getColorForAuthorName(d.authorWithMostSpentTime, props.mergedAuthors)
            : getColorForAuthorName(d.author.name, props.mergedAuthors)
        )
        .attr('stroke-width', '2')
        .attr('rx', ((height - 110) / maxOpenEvents + 4) / 2)
        .attr('stroke', '#000')
        .on('mouseover', function () {
          tooltip.style('visibility', 'visible');
        })
        .on('mousemove', function (e, d) {
          tooltip.style('top', e.pageY + 10 + 'px').style('left', e.pageX + 10 + 'px');

          tooltip.html(
            ReactDOMServer.renderToStaticMarkup(
              <div>
                <div>
                  <span className={styles.tooltipIID}>#{d.iid}</span>
                  <span className={styles.tooltipTitle}>{d.title}</span>
                  <span>(Click to open)</span>
                </div>
                <div>
                  {d.sourceBranch}&#8594;{d.targetBranch}
                </div>
                <div>Created: {d.createdAt}</div>
                <div>Author: {d.author.name} </div>
                <div className={styles.timeSpentBar}>
                  {Object.keys(d.aggregatedTimeTrackingData).map((authorName) => {
                    return (
                      <div
                        className={styles.timeSpentBlock}
                        style={{
                          width: (100 / d.totalTime) * d.aggregatedTimeTrackingData[authorName] + '%',
                          background: getColorForAuthorName(authorName, props.mergedAuthors),
                        }}>
                        <div className={styles.timeSpentBlockText}>{authorName}</div>
                        <div className={styles.timeSpentBlockTime}>{convertToTimeString(d.aggregatedTimeTrackingData[authorName])}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          );
        })
        .on('mouseout', function () {
          tooltip.style('visibility', 'hidden');
        })
        .on('click', function (e, d) {
          window.open(d.webUrl, '_blank');
        });

      issues
        .append('text')
        .attr('x', (d) => scale(moment(d.createdAt)))
        .attr('width', (d) => Math.max(scale(moment(d.closedAt)) - scale(moment(d.createdAt)) - 4, 1))
        .attr('pointer-events', 'none');

      const sprints = svg.append('g').selectAll('rect').data(props.sprints).enter().append('g');
      sprints
        .append('rect')
        .attr('x', (d) => scale(moment(d.from)))
        .attr('y', height - 40)
        .attr('width', (d) => scale(moment(d.to)) - scale(moment(d.from)) - 2)
        .attr('height', '20')
        .attr('fill', '#3273dc')
        .attr('stroke-width', '2')
        .attr('rx', '.2rem')
        .attr('stroke', '#fff');
      sprints
        .append('text')
        .text((d) => d.name + ' (' + moment(d.from).format('DD.MM.YYYY') + '-' + moment(d.to).format('DD.MM.YYYY') + ')')
        .attr('width', (d) => scale(moment(d.to)) - scale(moment(d.from)))
        .attr('x', (d) => scale(moment(d.from)) + 5)
        .attr('y', height - 25)
        .attr('height', '20')
        .attr('fill', 'white')
        .attr('font-size', '1rem')
        .attr('pointer-events', 'none');

      sprints
        .append('polyline')
        .attr(
          'points',
          (d) =>
            scale(moment(d.from)) +
            ' ' +
            (height - 20) +
            ' ' +
            scale(moment(d.from)) +
            ' 0 ' +
            (scale(moment(d.from)) + 10) +
            ' 10 ' +
            scale(moment(d.from)) +
            ' 20'
        )
        .attr('stroke-width', '2')
        .attr('fill', '#4cd964')
        .attr('stroke', '#4cd964');

      sprints
        .append('polyline')
        .attr(
          'points',
          (d) =>
            scale(moment(d.to)) -
            2 +
            ' ' +
            (height - 20) +
            ' ' +
            (scale(moment(d.to)) - 2) +
            ' 0 ' +
            (scale(moment(d.to)) - 12) +
            ' 10 ' +
            (scale(moment(d.to)) - 2) +
            ' 20'
        )
        .attr('stroke-width', '2')
        .attr('fill', '#cd5c5c')
        .attr('stroke', '#cd5c5c');

      const handleZoom = (e) => {
        issues
          .selectAll('rect')
          .attr('y', (d) => (30 + (((d.iid * (height - 110)) / maxOpenEvents) % (height - 110))) * e.transform.k + e.transform.y)
          .attr('height', ((height - 110) / maxOpenEvents) * e.transform.k);

        issues
          .selectAll('text')
          .attr('y', (d) => (30 + (((d.iid * (height - 110)) / maxOpenEvents) % (height - 110))) * e.transform.k + e.transform.y + 20)
          .attr('height', ((height - 110) / maxOpenEvents) * e.transform.k)
          .text((d) => {
            if (e.transform.k > 3) {
              return '#' + d.iid;
            }
            return '';
          });

        mergeRequests
          .selectAll('rect')
          .attr('y', (d) => (30 + (((d.iid * (height - 110)) / maxOpenEvents) % (height - 110)) - 2) * e.transform.k + e.transform.y)
          .attr('height', ((height - 110) / maxOpenEvents + 4) * e.transform.k);
      };

      const zoom = d3.zoom().on('zoom', handleZoom);
      svg.call(zoom);

      svg
        .append('g')
        .attr('transform', 'translate(0,' + (height - margin) + ')')
        .call(d3.axisBottom().scale(scale));
    }
  };

  React.useEffect(() => {
    renderChart();
  }, [props.sprints, props.issues, props.mergeRequests, props.colorIssuesMergeRequestsMostTimeSpent, props.mergedAuthors]);
  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartSvg} ref={svgChartRef} />
    </div>
  );
};

function getColorForAuthorName(authorName, mergedAuthors) {
  if (authorName === '') {
    return 'white';
  }
  const author = mergedAuthors.filter((mA) => mA.mainCommitter.includes(authorName));
  if (author.length > 0) {
    return author[0].color;
  }
  return 'transparent';
}

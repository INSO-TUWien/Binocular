'use strict';

import React, { useRef, useState } from 'react';
import ReactDOMServer from 'react-dom/server';

import styles from '../styles.scss';
import * as d3 from 'd3';
import moment from 'moment';
import { aggregateTimeTrackingData, convertToTimeString, extractTimeTrackingDataFromNotes } from '../../../../utils/timeTracking';
import { object } from 'prop-types';
import Database from '../../../../database/database';

import InlineLoadingIndicator from '../../../../components/InlineLoadingIndicator/inlineLoadingIndicator';

export default (props) => {
  const svgChartRef = useRef(null);

  const [selectedSprint, setSelectedSprint] = useState(null);

  const renderChart = () => {
    let { width, height } = svgChartRef.current.getBoundingClientRect();
    const margin = 20;
    const mrRowHeight = 80;
    height = height - mrRowHeight;
    d3.select(svgChartRef.current).selectAll('*').remove();
    const svg = d3
      .select(svgChartRef.current)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', [0, 0, width, height])
      .style('cursor', 'crosshair');

    let firstDate = moment();
    let lastDate = moment(0);

    //Calculate earliest and latest date
    if (props.sprints && props.sprints.length > 0) {
      props.sprints.forEach((s) => {
        if (moment(s.from) < firstDate) {
          firstDate = moment(s.from);
        }
        if (moment(s.to) > lastDate) {
          lastDate = moment(s.to);
        }
      });
    }

    let issuesData = props.issues.map((i) => {
      if (i.closedAt === null) {
        i.closedAt = moment();
      }
      return i;
    });
    const events = [];
    //loop through issues to find the first and last date and create an event list for later calculations
    issuesData.forEach((i) => {
      if (moment(i.createdAt) < firstDate) {
        firstDate = moment(i.createdAt);
      }
      if (moment(i.closedAt) > lastDate) {
        lastDate = moment(i.closedAt);
      }
      events.push({ dateTime: i.createdAt, type: 'opened' });
      events.push({ dateTime: i.closedAt, type: 'closed' });
    });

    const scale = d3.scaleUtc().range([margin, width - margin]);
    if (selectedSprint === null) {
      scale.domain([firstDate, lastDate]);
    } else {
      scale.domain([moment(selectedSprint.from), moment(selectedSprint.to)]);
    }

    //calculate the number of most parallel issues
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
    issuesData = issuesData.map((i) => {
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

    const tooltip = d3
      .select(svgChartRef.current)
      .append('div')
      .style('position', 'fixed')
      .style('visibility', 'hidden')
      .attr('class', styles.tooltip);

    let issueTracks = {};

    const issues = svg.append('g').selectAll('g').data(issuesData).enter().append('g');
    issues
      .append('rect')
      .attr('x', (d) => scale(moment(d.createdAt)))
      .attr('y', (d) => calculateIssuePosition(d, issueTracks, height, maxOpenEvents, 1, 0))
      .attr('width', (d) => Math.max(scale(moment(d.closedAt)) - scale(moment(d.createdAt)) - 4, (height - 110) / maxOpenEvents - 2))
      .attr('height', (height - 110) / maxOpenEvents - 2)
      .attr('fill', (d) => {
        switch (props.colorIssuesMergeRequests) {
          case 2:
            return getColorForAuthorName(d.authorWithMostSpentTime, props.mergedAuthors);
          case 1:
            return getColorForAuthorName(d.assignee === null ? '' : d.assignee.name, props.mergedAuthors);
          default:
            return getColorForAuthorName(d.author.name, props.mergedAuthors);
        }
      })
      .attr('stroke-width', '2')
      .attr('rx', '.2rem')
      .attr('stroke', '#fff')
      .style('cursor', 'pointer')
      .on('mouseover', function (e, d) {
        tooltip.style('visibility', 'visible');
        d3.select(this).attr('stroke', '#aaa');
        tooltip.html(
          ReactDOMServer.renderToStaticMarkup(
            <div>
              <div>
                <span className={styles.tooltipIID}>#{d.iid}</span>
                <span className={styles.tooltipTitle}>{d.title}</span>
                <span>(Click to open)</span>
              </div>
              <div>Created: {moment(d.createdAt).format('lll', 'de')}</div>
              <div>Closed: {d.state === 'closed' ? moment(d.closedAt).format('lll', 'de') : 'open'}</div>
              <div>Creator: {d.author.name} </div>
              <hr />
              <div>Assignees ({d.assignees.length}):</div>
              <div>
                {d.assignees.map((a) => {
                  return <div key={'assignee-' + a.name}>- {a.name}</div>;
                })}
              </div>
              <hr />
              <div>Time Tracking:</div>
              <div className={styles.timeSpentBar}>
                {Object.keys(d.aggregatedTimeTrackingData).map((authorName, i) => {
                  return (
                    <div
                      key={'timeSpentBlock' + i}
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
              <hr />
              <div id={'tooltipCommitCount'}>
                <span>Linked Commits: </span>
                <InlineLoadingIndicator />
              </div>
              <div id={'tooltipCommitAdditions'}>
                <span>Additions: </span>
                <InlineLoadingIndicator />
              </div>
              <div id={'tooltipCommitDeletions'}>
                <span>Deletions: </span>
                <InlineLoadingIndicator />
              </div>
            </div>
          )
        );
        Database.getCommitsForIssue(d.iid).then((commits) => {
          if (document.getElementById('tooltipCommitCount') !== null) {
            document.getElementById('tooltipCommitCount').innerText = 'Linked Commits: ' + commits.length;
          }
          let additions = 0;
          let deletions = 0;
          commits.forEach((c) => {
            additions += c.stats.additions;
            deletions += c.stats.deletions;
          });
          if (document.getElementById('tooltipCommitAdditions') !== null) {
            document.getElementById('tooltipCommitAdditions').innerText = 'Additions: ' + additions;
          }
          if (document.getElementById('tooltipCommitDeletions') !== null) {
            document.getElementById('tooltipCommitDeletions').innerText = 'Deletions: ' + deletions;
          }
        });
      })
      .on('mousemove', function (e, d) {
        tooltip.style('top', e.pageY + 10 + 'px').style('left', Math.min(e.pageX + 10, width) + 'px');
      })
      .on('mouseout', function () {
        tooltip.style('visibility', 'hidden');
        d3.select(this).attr('stroke', '#fff');
      })
      .on('click', function (e, d) {
        window.open(d.webUrl, '_blank');
      });

    issues
      .append('text')
      .attr('x', (d) => scale(moment(d.createdAt)))
      .attr('width', (d) => Math.max(scale(moment(d.closedAt)) - scale(moment(d.createdAt)) - 4, 1))
      .attr('pointer-events', 'none');

    svg
      .append('rect')
      .attr('x', margin)
      .attr('y', height - 20)
      .attr('width', width - margin * 2)
      .attr('height', mrRowHeight)
      .attr('fill', '#eee');
    const mergeRequests = svg.append('g').selectAll('g').data(mergeRequestData).enter().append('g');

    let lastMrDate = moment(0);
    let mergeRequestsOnDay = 0;
    mergeRequests
      .append('rect')
      .attr('x', (d) => scale(moment(d.createdAt)))
      .attr('y', (d) => {
        if (moment(d.createdAt) > lastMrDate.set('hour', 23).set('minute', 59)) {
          lastMrDate = moment(d.createdAt);
          mergeRequestsOnDay = 0;
        } else {
          mergeRequestsOnDay++;
        }
        return height - 15 + mergeRequestsOnDay * 10;
      })
      .attr('width', 10)
      .attr('height', 10)
      .attr('fill', (d) => {
        switch (props.colorIssuesMergeRequests) {
          case 2:
            return getColorForAuthorName(d.authorWithMostSpentTime, props.mergedAuthors);
          case 1:
            return getColorForAuthorName(d.assignee === null ? '' : d.assignee.name, props.mergedAuthors);
          default:
            return getColorForAuthorName(d.author.name, props.mergedAuthors);
        }
      })
      .attr('stroke-width', '2')
      .attr('rx', 10)
      .attr('stroke', '#000')
      .style('cursor', 'pointer')
      .on('mouseover', function (e, d) {
        tooltip.style('visibility', 'visible');
        d3.select(this).attr('stroke', '#555');
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
              <div>State: {d.state}</div>
              <div>Created: {moment(d.createdAt).format('lll', 'de')}</div>
              <div>Creator: {d.author.name} </div>
              <div className={styles.timeSpentBar}>
                {Object.keys(d.aggregatedTimeTrackingData).map((authorName, i) => {
                  return (
                    <div
                      key={'timeSpentBlock' + i}
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
      .on('mousemove', function (e, d) {
        tooltip.style('top', e.pageY + 10 + 'px').style('left', Math.min(e.pageX + 10, width) + 'px');
      })
      .on('mouseout', function () {
        tooltip.style('visibility', 'hidden');
        d3.select(this).attr('stroke', '#000');
      })
      .on('click', function (e, d) {
        window.open(d.webUrl, '_blank');
      });
    if (props.sprints && props.sprints.length > 0) {
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
        .attr('stroke', '#fff')
        .style('cursor', 'pointer')
        .on('mouseover', function () {
          d3.select(this).attr('fill', '#1c51a5');
        })
        .on('mouseout', function () {
          d3.select(this).attr('fill', '#3273dc');
        })
        .on('click', function (e, d) {
          if (selectedSprint === null) {
            setSelectedSprint(d);
          } else {
            setSelectedSprint(null);
          }
        });
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
            (height + mrRowHeight) +
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
            (height + mrRowHeight) +
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
    } else {
      svg
        .append('rect')
        .attr('x', margin)
        .attr('y', height - 40)
        .attr('width', width - margin * 2)
        .attr('height', 20)
        .attr('fill', '#f1d2d2');
      svg
        .append('text')
        .attr('x', margin + 4)
        .attr('y', height - 20 - 4)
        .attr('width', width - margin * 2)
        .attr('height', 20)
        .attr('font-size', '1rem')
        .text('No Sprints Defined! Define sprints in Universal Settings > Sprint Manager');
    }

    const handleZoom = (e) => {
      issueTracks = {};
      issues
        .selectAll('rect')
        .attr('y', (d) => calculateIssuePosition(d, issueTracks, height, maxOpenEvents, e.transform.k, e.transform.y))
        .attr('height', ((height - 110) / maxOpenEvents - 2) * e.transform.k);
      issueTracks = {};
      issues
        .selectAll('text')
        .attr('y', (d) => calculateIssuePosition(d, issueTracks, height, maxOpenEvents, e.transform.k, e.transform.y + 20))
        .attr('height', ((height - 110) / maxOpenEvents - 2) * e.transform.k)
        .text((d) => {
          if (((height - 110) / maxOpenEvents - 2) * e.transform.k > 25) {
            return '#' + d.iid;
          }
          return '';
        });
    };

    const zoom = d3
      .zoom()
      .on('zoom', handleZoom)
      .on('start', function (e) {
        if (e.sourceEvent.type === 'wheel') {
          if (e.sourceEvent.deltaY < 0) {
            d3.select(this).style('cursor', 'zoom-in');
          } else {
            d3.select(this).style('cursor', 'zoom-out');
          }
        } else {
          d3.select(this).style('cursor', 'ns-resize');
        }
      })
      .on('end', function (e) {
        d3.select(this).style('cursor', 'crosshair');
      });
    svg.call(zoom);

    svg
      .append('g')
      .attr('transform', 'translate(0,' + (height - margin) + ')')
      .attr('pointer-events', 'none')
      .call(d3.axisBottom().scale(scale));
  };

  React.useEffect(() => {
    renderChart();
  }, [props.sprints, props.issues, props.mergeRequests, props.colorIssuesMergeRequests, props.mergedAuthors, selectedSprint, props.size]);
  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartSvg} ref={svgChartRef} />
    </div>
  );
};

function getColorForAuthorName(authorName, mergedAuthors) {
  if (authorName === '') {
    return 'lightgray';
  }
  const author = mergedAuthors.filter((mA) => mA.mainCommitter.includes(authorName));
  if (author.length > 0) {
    return author[0].color;
  }
  return 'lightgray';
}

function calculateIssuePosition(issue, issueTracks, height, maxOpenEvents, zoom, offset) {
  for (let i = 0; i < maxOpenEvents; i++) {
    if (issueTracks[i] === undefined) {
      issueTracks[i] = issue.closedAt;
      return (30 + (i * (height - 110)) / maxOpenEvents) * zoom + offset;
    } else if (moment(issue.createdAt) > moment(issueTracks[i])) {
      issueTracks[i] = issue.closedAt;
      return (30 + (i * (height - 110)) / maxOpenEvents) * zoom + offset;
    }
  }
  return 30 * zoom + offset;
}

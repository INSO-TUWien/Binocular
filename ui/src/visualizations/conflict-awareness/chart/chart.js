'use strict';

import _ from 'lodash';
import React from 'react';
import * as d3 from 'd3';
import dagreD3 from 'dagre-d3';

import ChartContainer from '../../../components/svg/ChartContainer.js';
import * as zoomUtils from '../../../utils/zoom.js';

import { parseTime } from '../../../utils';
import styles from '../styles.scss';

export default class ConflictAwareness extends React.Component {
  constructor(props) {
    super(props);

    this.elems = {};
    this.state = {
      transform: d3.zoomIdentity,
      dimensions: zoomUtils.initialDimensions(),
    };

    this.onResize = zoomUtils.onResizeFactory(0.7, 0.7);
    this.onZoom = zoomUtils.onZoomFactory({ constrain: false });
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // Store prevUserId in state so we can compare when props change.
    // Clear out any previously-loaded user data (so we don't render stale stuff).
    if (nextProps.commits !== prevState.commits) {
      let { commitNodes, commitParentLinks } = extractData(nextProps);
      return {
        colorBaseProject: nextProps.colorBaseProject,
        colorOtherProject: nextProps.colorOtherProject,
        colorCombinedProject: nextProps.colorCombinedProject,
        commits: nextProps.commits,
        commitNodes,
        commitParentLinks,
      };
    }

    if (nextProps.colorBaseProject !== prevState.colorBaseProject) {
      return {
        colorBaseProject: nextProps.colorBaseProject,
        colorOtherProject: nextProps.colorOtherProject,
        colorCombinedProject: nextProps.colorCombinedProject,
      };
    }

    // No state update necessary
    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.commitNodes !== this.state.commitNodes && this.state.commitNodes.length > 0) {
      let { svg, inner } = _getGraphDOMElements();

      let g = new dagreD3.graphlib.Graph().setGraph({ rankdir: 'TB', ranker: 'tight-tree' });

      // Default to assigning a new object as a label for each new edge.
      g.setDefaultEdgeLabel(function () {
        return {};
      });

      this._setGraphNodes(g);
      this._setGraphEdges(g);

      this._renderGraph(inner, g);
      this._setZoomSupportAndPositionGraph(svg, inner, g);
      this._setNodeMetadataTooltipOnHover(inner, g);
      this._setCodeChangesModalOnDoubleClick(svg, inner, g);

      svg.on('click', function () {
        // hide modal if visible
        if (modal.style('visibility') === 'visible') {
          modal.style('visibility', 'hidden');
        }
      });

      d3.select('body').on('keydown', function (event) {
        // hide modal if visible, when esc pressed
        if (event.keyCode === 27) {
          modal.style('visibility', 'hidden');
        }
      });

      svg.attr('height', '98vh' /*g.graph().height * initialScale + 40*/);

      // set labels above node
      inner.selectAll('g.nodes g.label').attr('transform', 'translate(0,-40)');

      const modal = d3
        .select('body')
        .append('div')
        .attr('id', 'modal')
        .style('position', 'absolute')
        .style('background-color', 'white')
        .style('border', 'solid')
        .style('border-width', '2px')
        .style('border-radius', '5px')
        .style('padding', '5px')
        .style('z-index', '15')
        .style('top', '5%')
        .style('left', '5%')
        .style('width', '90%')
        .style('height', '90%')
        .style('overflow-y', 'auto')
        .style('visibility', 'hidden')
        .text('test');
      // commit infos
      inner
        .selectAll('g.node circle')

        // commit diff infos
        .on('dblclick', function (event) {
          // set loading modal
          modal.html('<p>loading</p>');
          modal.style('visibility', 'visible');
        });

      // branch infos
      inner.selectAll('g.node g.label').on('click', function (event, d) {
        const clickedBranchName = g.node(d).label;
      });
    } else if (prevState.colorBaseProject !== this.state.colorBaseProject) {
      let { svg, inner } = _getGraphDOMElements();
      _colorGraph(inner, this.state.colorBaseProject);
    }
  }

  render() {
    if (this.state.commitNodes) {
      return (
        <ChartContainer onResize={(evt) => this.onResize(evt)}>
          <svg id="test" className={styles.chart} width="960" height="10">
            <g />
          </svg>
        </ChartContainer>
      );
    } else {
      return <p>not loaded</p>;
    }
  }

  _setZoomSupportAndPositionGraph(svg, inner, g) {
    const initialScale = 0.75;

    // Set up zoom support
    const zoom = d3.zoom().on('zoom', function (event) {
      inner.attr('transform', event.transform);
    });

    svg
      .call(zoom)

      // center the graph
      .call(
        zoom.transform,
        d3.zoomIdentity
          .translate((svg.attr('width') - g.graph().width * initialScale) / 2, 20)
          .scale(initialScale)
      )
      .on('dblclick.zoom', null); // disable zoom on double click
  }

  _setGraphNodes(g) {
    this.state.commitNodes.forEach(
      (node) =>
        g.setNode(node.sha, {
          label: node.label,
          shape: 'circle' /*'elipse'*/,
          width: 15,
          height: 15,
          style: `stroke: ${_getRGBAStringFromColor(
            this.state.colorBaseProject
          )}; fill: ${_getRGBAStringFromColor(this.state.colorBaseProject)}; stroke-width: 1px;`,
          sha: node.sha,
          signature: node.signature,
          date: node.date.toString(),
          author: node.author,
          authorDate: node.authorDate.toString(),
          messageHeader: node.messageHeader,
          message: node.message,
        }),
      this
    );
  }

  _setGraphEdges(g) {
    this.state.commitParentLinks.forEach(
      (link) =>
        g.setEdge(link.source, link.target, {
          arrowhead: 'undirected',
          style: `stroke: ${_getRGBAStringFromColor(
            this.state.colorBaseProject
          )}; fill: none; stroke-width: 2px;`,
        }),
      this
    );
  }

  _setNodeMetadataTooltipOnHover(inner, g) {
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('id', 'tooltip_template')
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('border', 'solid')
      .style('border-width', '2px')
      .style('border-radius', '5px')
      .style('padding', '5px')
      .style('z-index', '10')
      .style('visibility', 'hidden')
      .text('Simple Tooltip...');

    // commit infos
    inner
      .selectAll('g.node circle')

      // show tooltip when mouse is over the node
      .on('mouseover', function (event) {
        const node = g.node(
          event.toElement ? event.toElement.__data__ : event.originalTarget.__data__
        );
        const tooltipText =
          '<div style="max-width: 500px">' +
          `<p style="text-align: center"><b>${node.sha}</b></p>` +
          `Committed by ${node.signature}</br>` +
          `on ${node.date.toLocaleString()}</br>` +
          `Authored by ${node.author}</br></br>` +
          `on ${node.authorDate.toLocaleString()}</br>` +
          `<i>${node.messageHeader}</i>` +
          '</div>';

        tooltip.html(tooltipText).style('visibility', 'visible');
      })

      // move tooltip with mouse
      .on('mousemove', function (event) {
        tooltip.style('top', event.pageY - 10 + 'px').style('left', event.pageX + 10 + 'px');
      })

      // hide tooltip if mouse moves out of the node
      .on('mouseout', function () {
        return tooltip.style('visibility', 'hidden');
      });
  }

  _setCodeChangesModalOnDoubleClick(svg, inner, g) {}

  _renderGraph(inner, g) {
    // Create the renderer
    const render = new dagreD3.render();

    // Run the renderer. This is what draws the final graph.
    render(inner, g);
  }
}

function extractData(props) {
  const commitNodes = [];
  const commitParentLinks = [];
  const branches = props.branches;
  const headShas = branches.map((branch) => branch.headSha);

  if (props.commits) {
    props.commits.forEach((commit) => {
      let label = '';

      if (headShas.includes(commit.sha)) {
        label = branches.filter((branch) => branch.headSha === commit.sha)[0].branchName;
      }
      const commitNode = _.cloneDeep(commit);
      commitNode.date = parseTime(commitNode.date);
      commitNode.authorDate = parseTime(commitNode.authorDate);
      commitNode.label = label;
      commitNodes.push(commitNode);

      commit.parents.forEach((parentCommit) => {
        commitParentLinks.push({ source: parentCommit.sha, target: commit.sha });
      });
    });
  }

  return { commitNodes, commitParentLinks };
}

/**
 * Retrieves the <svg> and its <g> child which holds the graph.
 * @returns {{svg, g}}
 * @private
 */
function _getGraphDOMElements() {
  let svg = d3.select('#test');
  let inner = svg.select('g');

  return { svg, inner };
}

function _colorGraph(inner, color) {
  inner
    .selectAll('g.node circle')
    .style('fill', _getRGBAStringFromColor(color))
    .style('stroke', _getRGBAStringFromColor(color));

  inner.selectAll('g.edgePath path').style('stroke', _getRGBAStringFromColor(color));
}

function _getRGBAStringFromColor(color) {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
}

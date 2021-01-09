'use strict';

import _ from 'lodash';
import React from 'react';
import * as d3 from 'd3';
import dagreD3 from 'dagre-d3';

import ChartContainer from '../../../components/svg/ChartContainer.js';
import * as zoomUtils from '../../../utils/zoom.js';

import { parseTime } from '../../../utils';
import styles from '../styles.scss';
import { equals } from '../../../utils/compare';

let codeMirror;

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
    // element which stores the props which were updated
    const updatedProps = {};

    // get the conflict awareness data if the repoFullName was changed
    // this can only occur when the view is mounted
    // is done this way because the updateConflictAwarenessData is reused for the initial data retrieve and for updates
    if (nextProps.repoFullName !== prevState.repoFullName) {
      updatedProps.repoFullName = nextProps.repoFullName;
      nextProps.onUpdateConflictAwarenessData(nextProps.repoFullName);
    }

    // the branches will be retrieved in the same event as the commits (and branches are typically fewer than commits for the comparison)
    if (!equals(nextProps.branches, prevState.branches)) {
      let { commitNodes, commitChildLinks } = extractData(nextProps);
      updatedProps.branches = nextProps.branches;
      updatedProps.commits = nextProps.commits;
      updatedProps.commitNodes = commitNodes;
      updatedProps.commitChildLinks = commitChildLinks;
    }

    // the diffs of a commit were retrieved -> put them into the modal
    if (!equals(nextProps.diffs, prevState.diffs)) {
      updatedProps.diffs = nextProps.diffs;
      if (nextProps.diffs) {
        _setDiffModalHtml(nextProps.diffs);
      }
    }

    // the color of the base project changed
    if (nextProps.colorBaseProject !== prevState.colorBaseProject) {
      updatedProps.colorBaseProject = nextProps.colorBaseProject;
    }

    // the color of the parent/fork changed
    if (nextProps.colorOtherProject !== prevState.colorOtherProject) {
      updatedProps.colorOtherProject = nextProps.colorOtherProject;
    }

    // the color of the combined commits/edges changed
    if (nextProps.colorCombined !== prevState.colorCombined) {
      updatedProps.colorCombined = nextProps.colorCombined;
    }

    // a (new) parent/fork was selected
    if (!_.isEqual(nextProps.otherProject, prevState.otherProject)) {
      updatedProps.otherProject = nextProps.otherProject;
    }

    // a new filter for highlighting commits of an issue was selected
    if (nextProps.issueForFilter !== prevState.issueForFilter) {
      updatedProps.issueForFilter = nextProps.issueForFilter;
      _highlightCommitsFromIssue(
        prevState.issueForFilter,
        nextProps.issueForFilter,
        nextProps.commits
      );
    }

    if (_.isEmpty(updatedProps)) {
      // No state update necessary
      return null;
    } else {
      return updatedProps;
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      !equals(prevState.commitNodes, this.state.commitNodes) &&
      this.state.commitNodes.length > 0
    ) {
      let { svg, inner } = _getGraphDOMElements();

      // init the graph for the commits/edges
      let g = new dagreD3.graphlib.Graph().setGraph({ rankdir: 'BT', ranker: 'tight-tree' });

      // Default to assigning a new object as a label for each new edge.
      g.setDefaultEdgeLabel(function () {
        return {};
      });

      // set the nodes and edges in the graph and render it
      const edgeClassesAndColors = this._setGraphNodes(g);
      this._setGraphEdges(g, edgeClassesAndColors);
      this._renderGraph(inner, g);

      // add zoom and other stuff
      this._setZoomSupportAndPositionGraph(svg, inner, g);
      this._setNodeMetadataTooltipOnHover(inner, g);
      this._setCodeChangesModalOnDoubleClick(svg, inner, g);

      svg.attr('height', '98vh' /*g.graph().height * initialScale + 40*/);

      // set labels above node
      inner.selectAll('g.nodes g.label').attr('transform', 'translate(0,-40)');

      // branch infos
      inner.selectAll('g.node g.label').on('click', function (event, d) {
        const clickedBranchName = g.node(d).label;
      });
    } else if (prevState.colorBaseProject !== this.state.colorBaseProject) {
      // recolor the commits/edges of the base project
      let { svg, inner } = _getGraphDOMElements();
      _colorGraph(inner, this.state.colorBaseProject, 'baseProject');
    } else if (prevState.colorOtherProject !== this.state.colorOtherProject) {
      // recolor the commits/edges of the parent/fork
      let { svg, inner } = _getGraphDOMElements();
      _colorGraph(inner, this.state.colorOtherProject, 'otherProject');
    } else if (prevState.colorCombined !== this.state.colorCombined) {
      // recolor the commits/edges of the combined commits/edges
      let { svg, inner } = _getGraphDOMElements();
      _colorGraph(inner, this.state.colorCombined, 'combined');
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

  /**
   * Adds a zoom support to the visualisation.
   * @param svg the svg element
   * @param inner the g child of the svg element
   * @param g the graph element
   * @private
   */
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

  /**
   * Adds the commit-nodes in the graph.
   * @param g the graph element
   * @returns {Map<string, [string]>} Map containing the commit-sha as key and the [class, color] of the commit as value
   * @private
   */
  _setGraphNodes(g) {
    // map which stores the class and the color of the node (needed for setting the edge/color of the edges later on)
    const edgeClassesAndColors = new Map();

    // for every commit in the node list, set it in the graph (can contain commits of the base project only, but also of a selected fork/parent)
    this.state.commitNodes.forEach((node) => {
      // checks if a node is in the base project and/or in the selected fork/parent (needed for class and color specification of the commit-node)
      const isInBaseProject = node.projects.includes(this.state.repoFullName);
      const isInOtherProject = this.state.otherProject
        ? node.projects.includes(this.state.otherProject.fullName)
        : false;

      // set the class and the color of the node according to its project membership
      let { clazz, color } = _getClassAndColor(this.state, isInBaseProject, isInOtherProject);

      // add the class and the color of the node for the edges later on
      edgeClassesAndColors.set(node.sha, [clazz, color]);

      // set the commit-node in the graph
      g.setNode(node.sha, {
        label: node.label,
        shape: 'circle' /*'elipse'*/,
        width: 15,
        height: 15,
        class: `${clazz} ${node.sha}`,
        style: `stroke: ${color}; fill: ${color}; stroke-width: 1px;`,
        sha: node.sha,
        signature: node.signature,
        date: `${node.date.toDateString()} ${node.date.toTimeString().substr(0, 9)}`,
        author: node.author,
        authorDate: `${node.authorDate.toDateString()} ${node.authorDate
          .toTimeString()
          .substr(0, 9)}`,
        messageHeader: node.messageHeader,
        message: node.message,
      });
    }, this);

    return edgeClassesAndColors;
  }

  /**
   * Adds the parent-child edges between the commit-nodes in the graph.
   * @param g the graph element
   * @param edgeColors {Map<string, [string]>} Map containing the commit-sha as key and the [class, color] of the commit as value
   * @private
   */
  _setGraphEdges(g, edgeColors) {
    this.state.commitChildLinks.forEach((link) => {
      // get the class and the color which the edge should have
      const classAndColor = edgeColors.get(link.target);

      // its possible that a commit has child-connections of a commit in a fork
      // if this is the case, the target node will not be in the commitChildrenLinks list
      // and must not be drawn
      if (classAndColor) {
        g.setEdge(link.source, link.target, {
          arrowhead: 'undirected', // edge without arrow head
          class: classAndColor[0], // class for coloring the edges (only needed for d3 selection, is only a pseudo css class)
          style: `stroke: ${classAndColor[1]}; fill: none; stroke-width: 2px;`,
        });
      }
    }, this);
  }

  /**
   * Handles the tooltip showing the commit's metadata while hovering over a commit node.
   * @param inner the g child of the svg element
   * @param g the graph element
   * @private
   */
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

    // set up the hover events for each commit-nodes
    inner
      .selectAll('g.node circle')

      // show tooltip when mouse is over the node
      .on('mouseover', (event) => {
        const node = _getNodeFromEvent(event, g);
        const tooltipText =
          '<div style="max-width: 500px">' +
          `<p style="text-align: center"><b>${node.sha}</b></p>` +
          `Committed by ${node.signature.replace(/</g, '&lt').replace(/>/g, '&gt')}</br>` +
          `(${node.date})</br></br>` +
          `Authored by ${node.author.replace(/</g, '&lt').replace(/>/g, '&gt')}</br>` +
          `(${node.authorDate})</br></br>` +
          `<i>${node.messageHeader}</i>` +
          '</div>';

        tooltip.html(tooltipText).style('visibility', 'visible');
      })

      // move tooltip with mouse
      .on('mousemove', (event) => {
        tooltip.style('top', event.pageY - 10 + 'px').style('left', event.pageX + 10 + 'px');
      })

      // hide tooltip if mouse moves out of the node
      .on('mouseout', () => {
        return tooltip.style('visibility', 'hidden');
      });
  }

  /**
   * Handles the diff modal showing the commit's diff on double clicking a commit node.
   * @param svg the svg element
   * @param inner the g child of the svg element
   * @param g the graph element
   * @private
   */
  _setCodeChangesModalOnDoubleClick(svg, inner, g) {
    const modal = d3
      .select('body')
      .append('div')
      .attr('id', 'diffModal')
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
      .style('visibility', 'hidden');

    // add a textarea to the modal, needed for CodeMirror
    d3.select('#diffModal').append('textarea').attr('id', 'diffModalTextArea');

    // set up the hover events for each commit-nodes
    inner
      .selectAll('g.node circle')

      // show the diffs modal at doublie click on a commit-node
      .on('dblclick', (event) => {
        modal.style('visibility', 'visible');

        const node = _getNodeFromEvent(event, g);
        this.props.onGetDiff(node.sha);
      });

    d3.select('body').on('keydown', (event) => {
      // hide modal if visible, when esc pressed
      if (event.keyCode === 27) {
        _resetDiffAndHideModal(this);
      }
    });

    svg.on('click', () => {
      // hide modal if visible, when clicking on the body
      if (modal.style('visibility') === 'visible') {
        _resetDiffAndHideModal(this);
      }
    });
  }

  /**
   * Renders the commit graph.
   * @param inner the g child of the svg element
   * @param g the graph element
   * @private
   */
  _renderGraph(inner, g) {
    // Create the renderer
    const render = new dagreD3.render();

    // Run the renderer. This is what draws the final graph.
    render(inner, g);
  }
}

/**
 * Create the commit-notes and the commit-child-links for the graph.
 * @param props
 * @returns {{commitNodes: [], commitChildLinks: []}}
 */
function extractData(props) {
  const commitNodes = [];
  const commitChildLinks = [];

  // the commits are already retrieved, get all the
  if (props.commits) {
    const branches = props.branches;
    const branchesHeadShas = new Map();

    // get all headSha objects of the branches
    branches.forEach((branch) =>
      branch.headShas.forEach((headShaObject) =>
        branchesHeadShas.set(headShaObject.headSha, headShaObject)
      )
    );

    props.commits.forEach((commit) => {
      let label = '';

      // set the branch name as the lable of the commit, if its a head
      if (branchesHeadShas.has(commit.sha)) {
        label = branches.filter(
          (branch) =>
            branch.headShas.filter((headShaObject) =>
              equals(headShaObject, branchesHeadShas.get(commit.sha))
            ).length > 0
        )[0].branchName;
      }

      // clone the commit, parse its dates, set the label and add it to the list
      const commitNode = _.cloneDeep(commit);
      commitNode.date = parseTime(commitNode.date);
      commitNode.authorDate = parseTime(commitNode.authorDate);
      commitNode.label = label;
      commitNodes.push(commitNode);

      // for each child of the commit, set add the parent - child relationship to the list
      commit.children.forEach((childCommit) => {
        commitChildLinks.push({ source: commit.sha, target: childCommit.sha });
      });
    });
  }

  return { commitNodes, commitChildLinks };
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

/**
 * Recolors all nodes/edges with the given classKey.
 * @param inner the g element of the svg
 * @param color {string} color of the nodes/edges
 * @param classKey {string} key indicating which nodes/edges should be recolored
 * @private
 */
function _colorGraph(inner, color, classKey) {
  // recolor nodes
  inner
    .selectAll(`g.node.${classKey} circle`)
    .style('fill', `${color}`)
    .style('stroke', `${color}`);

  // recolor edges
  inner.selectAll(`g.edgePath.${classKey} path`).style('stroke', `${color}`);
}

/**
 * Gets the commit-node of the graph from an event.
 * @param event the event from the commit node (e.g. hover)
 * @param g the graph element
 * @returns {*}
 * @private
 */
function _getNodeFromEvent(event, g) {
  // in firefox, the toElement does not exist as in Chrome, therefore the if clause
  return g.node(event.toElement ? event.toElement.__data__ : event.originalTarget.__data__);
}

/**
 * Gets the diff modal.
 * @returns {*}
 * @private
 */
function _getDiffModal() {
  return d3.select('#diffModal');
}

/**
 * Fills the modal with the commit's diffs.
 * @param diffs {string} diffs of the commit as string
 * @private
 */
function _setDiffModalHtml(diffs) {
  // get the diff modal and set the diff as text
  const diffModal = d3.select('#diffModalTextArea');
  diffModal.text(diffs);

  // if no codeMirror instance exists, create it and bind it to the diff modal
  if (!codeMirror) {
    require(['codemirror/lib/codemirror', 'codemirror/mode/diff/diff'], function (CodeMirror) {
      codeMirror = CodeMirror.fromTextArea(document.getElementById('diffModalTextArea'), {
        lineNumbers: true,
        mode: 'diff',
        readOnly: true,
      });
    });
  } else {
    // codeMirror is already initialised -> update its diff
    codeMirror.setValue(diffModal.text());
  }
}

/**
 * Closes the Modal which shows the diffs and resets the diff object in the state.
 * @param self {ConflictAwareness} this instance
 * @private
 */
function _resetDiffAndHideModal(self) {
  const diffModal = _getDiffModal();
  diffModal.style('visibility', 'hidden');
  self.state.diffs = undefined;
}

/**
 * Retrieves the CSS class and color based on the membership of the base project and/or the other project.
 * @param state {any} state to get the different color options from it
 * @param isInBaseProject {boolean} indicator if the element is in the base project
 * @param isInOtherProject {boolean} indicator if the element is in the other project
 * @returns {{color: *, clazz: string}}
 * @private
 */
function _getClassAndColor(state, isInBaseProject, isInOtherProject) {
  // default: element is only in the base project
  let clazz = 'baseProject';
  let color = state.colorBaseProject;

  if (isInBaseProject && isInOtherProject) {
    // element is in both projects
    clazz = 'combined';
    color = state.colorCombined;
  } else if (isInOtherProject) {
    // element is only in the other project
    clazz = 'otherProject';
    color = state.colorOtherProject;
  }

  return { clazz, color };
}

/**
 * Highlights all commits containing the newIssueID.
 * Resets the node design of all commits containing the oldIssueID.
 * @param oldIssueID {string} issueID from the previous filter
 * @param newIssueID {string} issueID from the current filter
 * @param allCommits {[any]} list of all commits
 * @private
 */
function _highlightCommitsFromIssue(oldIssueID, newIssueID, allCommits) {
  let { inner } = _getGraphDOMElements();

  // reset the last highlighting
  if (oldIssueID) {
    // get all commits from the last issue filter (searched by id + title case insensitive
    let oldIssueCommits = allCommits.filter((commit) =>
      commit.message.toLowerCase().includes(oldIssueID.toLowerCase())
    );
    // change the node back to the previous design (not highlighted
    oldIssueCommits.forEach((commit) => {
      const node = inner.select(`g[class*='${commit.sha}'] circle`);
      node.style('stroke', node.style('fill'));
    });
  }

  // a new highlighting was set
  if (newIssueID) {
    // get all commits form the new filter (searched by id + title case insensitive)
    let newIssueCommits = allCommits.filter((commit) =>
      commit.message.toLowerCase().includes(newIssueID.toLowerCase())
    );
    // color the border of each commit black
    newIssueCommits.forEach((commit) =>
      inner.select(`g[class*='${commit.sha}'] circle`).style('stroke', 'black')
    );
  }
}

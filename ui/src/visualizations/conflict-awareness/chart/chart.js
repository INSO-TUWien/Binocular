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

let codeMirror; // codeMirror instance for showing the diff of a commit
let selectedNodes = []; // the nodes which are selected by the user
let selectedBranch; // the branch which is selected by the user

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
      let { commitNodes, commitChildLinks, branchIDs } = extractData(nextProps);
      updatedProps.branches = nextProps.branches;
      updatedProps.commits = nextProps.commits;
      updatedProps.commitNodes = commitNodes;
      updatedProps.commitChildLinks = commitChildLinks;
      updatedProps.branchIDs = branchIDs;
    }

    // the diffs of a commit were retrieved -> put them into the modal
    if (!equals(nextProps.diff, prevState.diff)) {
      updatedProps.diff = nextProps.diff;
      if (nextProps.diff) {
        _setDiffModalHtml(nextProps.diff);
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

    // a new check for a rebase was performed
    if (!equals(nextProps.rebaseCheck, prevState.rebaseCheck) && nextProps.rebaseCheck) {
      // the rebase shows no conflicts -> show success message
      if (nextProps.rebaseCheck.success) {
        _showRebaseSuccessModal(
          nextProps.rebaseCheck.rebaseRepo,
          nextProps.rebaseCheck.rebaseBranch,
          nextProps.rebaseCheck.upstreamRepo,
          nextProps.rebaseCheck.upstreamBranch
        );
      } else {
        // the rebase shows conflicts -> show them in a modal
        _showRebaseConflictModal(nextProps.rebaseCheck);
      }

      updatedProps.rebaseCheck = nextProps.rebaseCheck;
    }

    // a new check for a merge was performed
    if (!equals(nextProps.mergeCheck, prevState.mergeCheck) && nextProps.mergeCheck) {
      // the merge shows no conflicts -> show success message
      if (nextProps.mergeCheck.success) {
        _showMergeSuccessModal(
          nextProps.mergeCheck.fromRepo,
          nextProps.mergeCheck.fromBranch,
          nextProps.mergeCheck.toRepo,
          nextProps.mergeCheck.toBranch
        );
      } else {
        // the merge shows conflicts -> show them in a modal
        _showMergeConflictModal(nextProps.mergeCheck);
      }

      updatedProps.mergeCheck = nextProps.mergeCheck;
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
      svg.innerHtml = '';

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

      // add modals to the DOM
      _addModals();

      // add events to hide modals
      _hideModals(this);

      // add zoom and other stuff
      this._setZoomSupportAndPositionGraph(svg, inner, g);
      this._setNodeMetadataTooltipOnHover(inner, g);
      this._setCodeChangesModalOnDoubleClick(svg, inner, g);
      this._setUpCherryPickMergeAndRebaseCheck();

      svg.attr('height', '98vh' /*g.graph().height * initialScale + 40*/);

      // set labels above node
      inner.selectAll('g.nodes g.label').attr('transform', 'translate(0,-40)');
    } else if (prevState.colorBaseProject !== this.state.colorBaseProject) {
      // recolor the commits/edges of the base project
      let { inner } = _getGraphDOMElements();
      _colorGraph(inner, this.state.colorBaseProject, 'baseProject');
    } else if (prevState.colorOtherProject !== this.state.colorOtherProject) {
      // recolor the commits/edges of the parent/fork
      let { inner } = _getGraphDOMElements();
      _colorGraph(inner, this.state.colorOtherProject, 'otherProject');
    } else if (prevState.colorCombined !== this.state.colorCombined) {
      // recolor the commits/edges of the combined commits/edges
      let { inner } = _getGraphDOMElements();
      _colorGraph(inner, this.state.colorCombined, 'combined');
    }
  }

  render() {
    if (this.state.commitNodes) {
      return (
        <ChartContainer onResize={(evt) => this.onResize(evt)}>
          <div id="modalContainer">
            <svg id="test" className={styles.chart} width="960" height="10">
              <g />
            </svg>
          </div>
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
    const initialScale = 1;

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
        labelType: node.labelType,
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
    const modal = _getDiffModal();

    // add a textarea to the modal, needed for CodeMirror
    modal.append('textarea').attr('id', 'diffModalTextArea');

    // set up the hover events for each commit-nodes
    inner
      .selectAll('g.node circle')

      // show the diffs modal at doublie click on a commit-node
      .on('dblclick', (event) => {
        modal.style('visibility', 'visible');

        const node = _getNodeFromEvent(event, g);
        this.props.onGetDiff(node.sha);
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

  /**
   * Set up the events for checks, if a rebase, merge or cherry pick(s) are successfull
   * or resolves in a conflict.
   * @private
   */
  _setUpCherryPickMergeAndRebaseCheck() {
    const { inner } = _getGraphDOMElements();

    this.state.branchIDs.forEach((branchID) => {
      inner.select(`span.${branchID.clazz}.${branchID.branchKey}`).on('click', (event) => {
        if (selectedNodes.length > 0) {
          // cherry pick selected nodes onto branch
          // TODO: impl
          selectedNodes.forEach((node) => {
            console.log(
              `Cherry-Pick commit ${node.node().__data__} into branch ${branchID.branchName}.`
            );
            node.style('stroke-width', '1px');
          });
          selectedNodes = [];
        } else if (selectedBranch && !equals(selectedBranch, branchID)) {
          // a branch was already selected, and a new one is currently selected

          // a special key for a merge or rebase check was pressed during the click
          if (event.shiftKey || event.ctrlKey) {
            // ctrl key checks for a rebase
            if (event.ctrlKey) {
              this.props.onCheckRebase(
                selectedBranch.headSha,
                this._getProjectFromCSSClass(selectedBranch.clazz),
                selectedBranch.branchName,
                this._getProjectFromCSSClass(branchID.clazz),
                branchID.branchName
              );
            } else if (event.shiftKey) {
              // shift key checks for a merge
              this.props.onCheckMerge(
                this._getProjectFromCSSClass(selectedBranch.clazz),
                selectedBranch.branchName,
                this._getProjectFromCSSClass(branchID.clazz),
                branchID.branchName
              );
            }

            // reset the highlighting and the selectedBranch
            this._resetBranchNameHighlighting(selectedBranch);
            selectedBranch = undefined;
          } else {
            // no special key was pressed during the click

            // a branch was already selected --> reset the highlighting of the previous selectedBranch
            if (selectedBranch) {
              this._resetBranchNameHighlighting(selectedBranch);
            }

            // set the currently selected branch and highlight it
            selectedBranch = branchID;
            this._highlightBranchName(selectedBranch);
          }
        } else if (selectedBranch && equals(selectedBranch, branchID)) {
          // the same branch was selected again -> reset its highlighting and the selectedBranch
          this._resetBranchNameHighlighting(inner, selectedBranch);
          selectedBranch = undefined;
        } else {
          // no branch was previously selected -> highlight the currently selected branch
          selectedBranch = branchID;
          this._highlightBranchName(selectedBranch);
        }
      });
    });
  }

  /**
   * Highlights a branch with a solid border.
   * @param branch {*} to which a highlighting should be added
   * @private
   */
  _highlightBranchName(branch) {
    d3.select(`span.${branch.clazz}.${branch.branchKey}`).style('border', 'black solid 2px');
  }

  /**
   * Removes the border highlighting of the branch.
   * @param branch {*} from which the highlighting should be removed
   * @private
   */
  _resetBranchNameHighlighting(branch) {
    d3.select(`span.${branch.clazz}.${branch.branchKey}`).style('border', '');
  }

  /**
   * Gets the full name of a repo based on the css class.
   * If the clazz is combined, the full name of the base repo is returned,
   * because there is no difference of the element in both repos.
   * @param clazz {string} the class
   * @returns {string} the full name of the repo based on the provided class
   * @private
   */
  _getProjectFromCSSClass(clazz) {
    switch (clazz) {
      case 'otherProject':
        return this.state.otherProject.fullName;
      default:
        return this.state.repoFullName;
    }
  }
}

/**
 * Create the commit-notes and the commit-child-links for the graph.
 * @param props
 * @returns {{commitNodes: [], commitChildLinks: [], branchIDs: []}}
 */
function extractData(props) {
  const commitNodes = [];
  const commitChildLinks = [];
  const branchIDs = [];

  // the commits are already retrieved, get all the
  if (props.commits) {
    const branches = props.branches;
    const branchesHeadShas = new Map();

    // get all headSha objects of the branches
    branches.forEach((branch) =>
      branch.headShas.forEach((headShaObject) => {
        let branchesHeadSha = branchesHeadShas.get(headShaObject.headSha);
        // head of the branch was not processed -> create new entry
        if (!branchesHeadSha) {
          branchesHeadSha = new Map();
          branchesHeadSha.set(branch.branchName, {
            branchKey: branch.branchKey,
            projects: [headShaObject.project],
          });
        } else {
          // head of the branch was already processed and therefore has an entry in the map
          let branchesMetadata = branchesHeadSha.get(branch.branchName);
          // branch was not processed
          if (!branchesMetadata) {
            branchesMetadata = { branchKey: branch.branchKey, projects: [headShaObject.project] };
          } else {
            // branch was already processed -> update the project if its not in the list
            if (!branchesMetadata.projects.includes(headShaObject.project)) {
              branchesMetadata.projects.push(headShaObject.project);
            }
          }
          branchesHeadSha.set(branch.branchName, branchesMetadata);
        }

        branchesHeadShas.set(headShaObject.headSha, branchesHeadSha);
      })
    );

    // create a commitNode for each commit
    props.commits.forEach((commit) => {
      let label = '';
      let labelType = '';

      // set the branch names as the label of the commit, if its a head
      if (branchesHeadShas.has(commit.sha)) {
        // get the branches where the commit is a head
        const branchProjects = branchesHeadShas.get(commit.sha);
        branchProjects.forEach((metadata, branchName) => {
          // check in which projects the commit is the head the branch
          const isInBaseProject = metadata.projects.includes(props.repoFullName);
          const isInOtherProject = props.otherProject
            ? metadata.projects.includes(props.otherProject.fullName)
            : false;

          // get the css class and color of the node and label based on the project memberships
          let { clazz, color } = _getClassAndColor(props, isInBaseProject, isInOtherProject);

          // add the branch to the label including its key as class (is needed for later selections)
          label =
            label +
            `<span class='${clazz} ${metadata.branchKey}' style='color: ${color}; cursor: pointer'>${branchName}</span></br>`;

          // save important data of the branches for later handling
          branchIDs.push({ headSha: commit.sha, branchKey: metadata.branchKey, branchName, clazz });
        });

        labelType = 'html';
        label = `<div style="text-align: center">${label}</div>`;
      }

      // clone the commit, parse its dates, set the label and add it to the list
      const commitNode = _.cloneDeep(commit);
      commitNode.date = parseTime(commitNode.date);
      commitNode.authorDate = parseTime(commitNode.authorDate);
      commitNode.label = label;
      commitNode.labelType = labelType;
      commitNodes.push(commitNode);

      // for each child of the commit, set add the parent - child relationship to the list
      commit.children.forEach((childCommit) => {
        commitChildLinks.push({ source: commit.sha, target: childCommit.sha });
      });
    });
  }

  return { commitNodes, commitChildLinks, branchIDs };
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
 * @param diff {string} diff of the commit as string
 * @private
 */
function _setDiffModalHtml(diff) {
  // get the diff modal and set the diff as text
  const diffModalTextArea = d3.select('#diffModalTextArea');
  diffModalTextArea.text(diff);

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
    codeMirror.setValue(diffModalTextArea.text());
  }
}

/**
 * Closes the Modal which shows the diff and resets the diff object in the state.
 * @param self {ConflictAwareness} this instance
 * @private
 */
function _resetDiffAndHideModal(self) {
  const diffModal = _getDiffModal();
  diffModal.style('visibility', 'hidden');
  self.state.diff = undefined;
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

/**
 * Gets the successModal.
 * @returns {*}
 * @private
 */
function _getSuccessModal() {
  return d3.select('#successModal');
}

/**
 * Shows the successModal containing a success message that the rebase of
 * 'rebaseBranch' (project 'rebaseRepo') can be rebased onto 'upstreamBranch' (project 'upstreamRepo')
 * can be made without conflicts.
 * @param rebaseRepo {string} the project of 'rebaseBranch'
 * @param rebaseBranch {string} the branch which is rebased onto 'upstreamBranch'
 * @param upstreamRepo {string} the project of 'upstreamBranch'
 * @param upstreamBranch {string} the branch which is rebased onto
 * @private
 */
function _showRebaseSuccessModal(rebaseRepo, rebaseBranch, upstreamRepo, upstreamBranch) {
  _getSuccessModal()
    .text(
      `No conflict was detected. The rebase of "${rebaseBranch}" (project "${rebaseRepo}") onto branch "${upstreamBranch}" (project "${upstreamRepo}") is possible.`
    )
    .style('visibility', 'visible');
}

/**
 * Shows the successModal containing a success message that the merge of
 * 'fromBranch' (project 'fromRepo') can be merged into 'toBranch' (project 'toRepo')
 * can be made without conflicts.
 * @param fromRepo {string} the project of 'fromBranch'
 * @param fromBranch {string} the branch which is merged into 'toBranch'
 * @param toRepo {string} the project of 'toBranch'
 * @param toBranch {string} the branch which is merged into
 * @private
 */
function _showMergeSuccessModal(fromRepo, fromBranch, toRepo, toBranch) {
  _getSuccessModal()
    .text(
      `No conflict was detected. The merge of "${fromBranch}" (project "${fromRepo}") onto branch "${toBranch}" (project "${toRepo}") is possible.`
    )
    .style('visibility', 'visible');
}

/**
 * Hides the successModal.
 * @param self {ConflictAwareness} this instance
 * @private
 */
function _hideSuccessModal(self) {
  _getSuccessModal().style('visibility', 'hidden');
  self.state.rebaseCheck = undefined;
}

/**
 * Sets up and shows the files of a rebase containing conflicting code
 * in expandable and shrinkable cards. The conflicts are highlighted.
 * @param checkRebase {*} the conflict information from the rebase
 * @private
 */
function _showRebaseConflictModal(checkRebase) {
  const {
    rebaseRepo,
    upstreamBranch,
    rebaseBranch,
    upstreamRepo,
    conflictDatas,
    commitsOfRebase,
  } = checkRebase;

  // modal which should show the conflict data
  const conflictModal = _getConflictModal();

  // create the header of the modal containing a message which rebase was checked
  let modalFirstPartHtml = `
    <p class="has-text-centered">Conflicts detected while rebasing "${rebaseBranch}" (project "${rebaseRepo}") onto "${upstreamBranch}" (project "${upstreamRepo}").</p>
    <p><b>Commits:</b></p>
    <ul style="height: 150px; overflow: hidden; overflow-y: scroll;">
    `;

  // add the commits to the header with the information if they were successful,
  // resulted in a conflict or were not checked due to the previous conflict
  commitsOfRebase.forEach((commitOfRebase) => {
    modalFirstPartHtml =
      modalFirstPartHtml + `<li>${commitOfRebase.sha} - ${commitOfRebase.conflictText}</li>`;
  });

  // close the commit list and set the html in the modal
  // the whole header html must be set, because otherwise the first <ul>
  // will automatically closed by the html() function to provide a valid HTML
  modalFirstPartHtml = modalFirstPartHtml + '</ul>';
  conflictModal.html(modalFirstPartHtml);

  // appends the conflict cards to the modal
  _createConflictsCardSection(conflictDatas, conflictModal);

  // show the conflict modal
  _getConflictModal().style('visibility', 'visible');
}

/**
 * Sets up and shows the files of a merge containing conflicting code
 * in expandable and shrinkable cards. The conflicts are highlighted.
 * @param checkMerge {*} the conflict information from the merge
 * @private
 */
function _showMergeConflictModal(checkMerge) {
  const { fromRepo, fromBranch, toRepo, toBranch, conflictDatas } = checkMerge;

  // modal which should show the conflict data
  const conflictModal = _getConflictModal();

  // create the header of the modal containing a message which merge was checked
  conflictModal.html(`
    <p class="has-text-centered">Conflicts detected while merging "${fromBranch}" (project "${fromRepo}") into "${toBranch}" (project "${toRepo}").</p> 
    `);

  // appends the conflict cards to the modal
  _createConflictsCardSection(conflictDatas, conflictModal);

  // show the conflict modal
  _getConflictModal().style('visibility', 'visible');
}

/**
 * Closes the Modal which shows the conflict and resets the rebaseCheck object in the state.
 * @param self {ConflictAwareness} this instance
 * @private
 */
function _resetRebaseCheckAndHideModal(self) {
  const conflictModal = _getConflictModal();
  conflictModal.style('visibility', 'hidden');
  self.state.rebaseCheck = undefined;
}

/**
 * Closes the Modal which shows the conflict and resets the mergeCheck object in the state.
 * @param self {ConflictAwareness} this instance
 * @private
 */
function _resetMergeCheckAndHideModal(self) {
  const conflictModal = _getConflictModal();
  conflictModal.style('visibility', 'hidden');
  self.state.mergeCheck = undefined;
}

/**
 * Gets the conflictModal.
 * @returns {*}
 * @private
 */
function _getConflictModal() {
  return d3.select('#conflictModal');
}

/**
 * Appends expandable conflict cards to the conflictModal.
 * @param conflictDatas [] array that holds information about the conflict
 * @private
 */
function _createConflictsCardSection(conflictDatas) {
  // metadata for setting up the click events for expanding/shrinking the card bodies
  const clickEventMetadatas = [];
  const conflictModal = _getConflictModal();

  // header of the conflict cards section
  conflictModal.html(conflictModal.html() + '<p><b>Conflicts:</b></p>');

  // for each file containing conflicts, create an expendable card
  // showing the file's code in codemirror and highlighting the conflicting parts
  for (let i = 0; i < conflictDatas.length; i++) {
    // IDs to navigate to important elements of the card
    const cardContentID = 'cardContentID' + i;
    const cardHeaderID = 'cardHeaderID' + i;
    const cardArrowID = 'cardArrowID' + i;
    const textAreaID = 'textAreaID' + i;

    // append the newly created card within the modal
    conflictModal.html(
      conflictModal.html() +
        _createExpandableCard(
          cardContentID,
          cardHeaderID,
          cardArrowID,
          textAreaID,
          conflictDatas[i].path
        )
    );

    // save the necessary IDs of the card for setting up the expand/shrink
    // the newly created card body containing the code
    // this is necessary due to a reset of the last click event when appending
    // the new card in the modal
    clickEventMetadatas.push({
      cardContentID,
      cardHeaderID,
      cardArrowID,
    });

    // set up the text area for the codemirror
    const textArea = d3.select(`#${textAreaID}`);
    textArea.text(conflictDatas[i].fileContent);

    // add a codemirror instance based on the created text area
    require(['codemirror/lib/codemirror'], function (CodeMirror) {
      const codeMirrorRebaseConflict = CodeMirror.fromTextArea(
        document.getElementById(textAreaID),
        {
          lineNumbers: true,
          readOnly: true,
        }
      );

      // highlight the conflicting code sections
      for (let j = 0; j < conflictDatas[i].colorOursBegins.length; j++) {
        codeMirrorRebaseConflict.markText(
          conflictDatas[i].colorOursBegins[j],
          conflictDatas[i].colorOursEnds[j],
          { css: 'color: darkviolet' }
        );
        codeMirrorRebaseConflict.markText(
          conflictDatas[i].colorTheirsBegins[j],
          conflictDatas[i].colorTheirsEnds[j],
          { css: 'color: darkcyan' }
        );
      }
    });
  }

  // set the toggle click event after setting up the html,
  // because otherwise these events will be reset after appending a new card
  clickEventMetadatas.forEach((clickEventMetaData) => {
    d3.select(`#${clickEventMetaData.cardHeaderID}`).on('click', () =>
      _toggleCardContentVisibility(clickEventMetaData.cardContentID, clickEventMetaData.cardArrowID)
    );
  });
}

/**
 * Creates a card template with cardTitle as Title.
 * @param cardContentID {string} the DOM-ID of the card content part
 * @param cardHeaderID {string} the DOM-ID of the card header
 * @param cardArrowID {string} the DOM-ID of the card header item indicating if the card is expanded or not
 * @param textAreaID {string} the DOM-ID of the text area in the card content part
 * @param cardTitle {string} the title of the card
 * @returns {string} the html string of the card
 * @private
 */
function _createExpandableCard(cardContentID, cardHeaderID, cardArrowID, textAreaID, cardTitle) {
  return `
    <div class="card is-fullwidth">
      <header id="${cardHeaderID}" class="card-header">
        <p class="card-header-title">${cardTitle}</p>
          <a class="card-header-icon card-toggle">
            <i id="${cardArrowID}" class="fa fa-angle-up"></i>
          </a>
        </header>
      <div id="${cardContentID}" class="card-content">
        <textarea id="${textAreaID}"></textarea>
      </div>
    </div>
  `;
}

/**
 * Selects the DOM-element with cardContentID, toggles its 'is-hidden' css class and
 * toggles between the 'fa-angle-down' and 'fa-angle-up' arrow class of the
 * DOM-element with cardArrowID.
 * @param cardContentID {string} the ID of the card content which visibility should be toggled
 * @param cardArrowID {string} the ID of the card arrow button indicating if the card is expanded or not
 * @private
 */
function _toggleCardContentVisibility(cardContentID, cardArrowID) {
  const cardContent = d3.select(`#${cardContentID}`);
  const cardArrow = d3.select(`#${cardArrowID}`);

  // toggles the visibility of the card content and the arrow icon in the card header
  cardContent.classed('is-hidden', !cardContent.classed('is-hidden'));
  cardArrow.classed('fa-angle-down', !cardArrow.classed('fa-angle-down'));
  cardArrow.classed('fa-angle-up', !cardArrow.classed('fa-angle-up'));
}

/**
 * Appends modal with basic settings to the DOM-element identified by the selector.
 * @param selector {string} selector of the DOM-element to append the basic modal
 * @returns {*} the appended DOM-element
 * @private
 */
function _appendBasicModalToSelector(selector) {
  return d3
    .select(selector)
    .append('div')
    .style('position', 'absolute')
    .style('border', 'solid')
    .style('border-width', '2px')
    .style('border-radius', '5px')
    .style('padding', '5px')
    .style('z-index', '15')
    .style('top', '5%')
    .style('left', '5%')
    .style('width', '90%')
    .style('overflow-y', 'auto')
    .style('visibility', 'hidden');
}

/**
 * Add Modals to the DOM for diffs and rebase/merge/cherry pick checks.
 * @private
 */
function _addModals() {
  _appendBasicModalToSelector('body')
    .style('background-color', 'white')
    .style('height', '90%')
    .attr('id', 'diffModal');

  _appendBasicModalToSelector('body')
    .style('background-color', 'white')
    .style('height', '90%')
    .attr('id', 'conflictModal');

  _appendBasicModalToSelector('#modalContainer')
    .style('background-color', 'lawngreen')
    .attr('id', 'successModal');
}

/**
 * Hide diffModal, successModal and conflictModal when pressing esc
 * or clicking on svg.
 * @private
 */
function _hideModals(self) {
  const { svg } = _getGraphDOMElements();
  const diffModal = _getDiffModal();
  const successModal = _getSuccessModal();
  const conflictModal = _getConflictModal();

  // hide modals when esc pressed
  d3.select('body').on('keydown', (event) => {
    // hide modals if visible, when esc pressed
    if (event.key === 'Escape') {
      if (_isVisible(diffModal)) {
        _resetDiffAndHideModal(self);
      }

      // hide successModal if visible, when clicking on the body
      if (_isVisible(successModal)) {
        _hideSuccessModal(self);
      }

      // hide conflictModal if visible, when clicking on the body
      if (_isVisible(conflictModal)) {
        _resetRebaseCheckAndHideModal(self);
        _resetMergeCheckAndHideModal(self);
      }
    }
  });

  // hide modals when svg is clicked
  svg.on('click', () => {
    // hide diffModal if visible, when clicking on the svg
    if (_isVisible(diffModal)) {
      _resetDiffAndHideModal(self);
    }

    // hide successModal if visible, when clicking on the svg
    if (_isVisible(successModal)) {
      _hideSuccessModal(self);
    }

    // hide conflictModal if visible, when clicking on the svg
    if (_isVisible(conflictModal)) {
      _resetRebaseCheckAndHideModal(self);
      _resetMergeCheckAndHideModal(self);
    }
  });
}

/**
 * Checks if a DOM-element is visible.
 * @param domElement {*} the DOM-element
 * @returns {boolean} true, if the DOM-element is visible, otherwise false
 * @private
 */
function _isVisible(domElement) {
  return domElement.style('visibility') === 'visible';
}

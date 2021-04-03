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

import { Menu, Item, useContextMenu } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';

// data for the context menu of the commit nodes
const COMMIT_NODE_MENU_ID = 'commit-node-menu-id';
const COLLAPSED_NODE_MENU_ID = 'collapsed-node-menu-id';
const { show } = useContextMenu();

let codeMirror; // codeMirror instance for showing the diff of a commit
let selectedNodes = []; // the nodes which are selected by the user
let selectedNodeInfos = [];
let selectedBranch; // the branch which is selected by the user
let commitDependenciesWithDependentCommits = new Map(); // map containing the shas of the commit dependencies as key, and a list of shas of the commits which depend on the key
let commitShasOfSubtree = []; // the commit shas of a subtree
let commitShasOfBranch = new Map(); // the target commit shas of a branch as key, the current ingoing edge color as value

let lastTransform;
let zoom;
let currentLayout;
let g;

export default class ConflictAwareness extends React.Component {
  constructor(props) {
    super(props);

    this.elems = {};
    this.state = {};

    this.onResize = zoomUtils.onResizeFactory(0.7, 0.7);
    this.onZoom = zoomUtils.onZoomFactory({ constrain: false });
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // element which stores the props which were updated
    const updatedProps = {};

    // data is currently fetched or is finished fetching
    if (nextProps.isLoading !== prevState.isLoading) {
      updatedProps.isLoading = nextProps.isLoading;
    }

    // get the conflict awareness data if the repoFullName was changed
    // this can only occur when the view is mounted
    // is done this way because the updateConflictAwarenessData is reused for the initial data retrieve and for updates
    if (nextProps.repoFullName !== prevState.repoFullName) {
      updatedProps.repoFullName = nextProps.repoFullName;
      nextProps.onUpdateConflictAwarenessData(nextProps.repoFullName);
    }

    // the branches will be retrieved in the same event as the commits (and branches are typically fewer than commits for the comparison)
    if (
      !equals(nextProps.collapsedSections, prevState.collapsedSections) ||
      !equals(nextProps.branches, prevState.branches) ||
      !equals(prevState.excludedBranchesBaseProject, nextProps.excludedBranchesBaseProject) ||
      !equals(prevState.excludedBranchesOtherProject, nextProps.excludedBranchesOtherProject) ||
      !equals(nextProps.filterAfterDate, prevState.filterAfterDate) ||
      !equals(nextProps.filterBeforeDate, prevState.filterBeforeDate) ||
      (!equals(nextProps.filterAuthor, prevState.filterAuthor) &&
        nextProps.filterAuthor.author &&
        !nextProps.filterAuthor.showOnly) ||
      (!equals(nextProps.filterCommitter, prevState.filterCommitter) &&
        nextProps.filterCommitter.committer &&
        !nextProps.filterCommitter.showOnly) ||
      !equals(nextProps.filterSubtree, prevState.filterSubtree) ||
      !equals(nextProps.layout, prevState.layout)
    ) {
      // if the subtree filter has changed, calculate the shas in the selected subtree
      // or reset the list if the subtree filter was reset
      if (!equals(nextProps.filterSubtree, prevState.filterSubtree)) {
        commitShasOfSubtree = [];

        // subtree filter is set -> calculate all shas of the subtree
        if (nextProps.filterSubtree.subtree) {
          _getSubtreeCommitShas(
            nextProps.filterSubtree.subtree,
            commitShasOfSubtree,
            nextProps.commits
          );
        }
      }

      if (nextProps.commits) {
        const branchesHeadShas = new Map();

        // get all headSha objects of the branches
        nextProps.branches.forEach((branch) =>
          branch.headShas.forEach((headShaObject) => {
            let branchesHeadSha = branchesHeadShas.get(headShaObject.headSha);
            // head of the branch was not processed -> create new entry
            if (!branchesHeadSha) {
              branchesHeadSha = new Map();
              branchesHeadSha.set(branch.branchName, {
                branchRef: branch.branchRef,
                branchKey: branch.branchKey,
                projects: [headShaObject.project],
              });
            } else {
              // head of the branch was already processed and therefore has an entry in the map
              let branchesMetadata = branchesHeadSha.get(branch.branchName);
              // branch was not processed
              if (!branchesMetadata) {
                branchesMetadata = {
                  branchRef: branch.branchRef,
                  branchKey: branch.branchKey,
                  projects: [headShaObject.project],
                };
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

        let collapsedSections = nextProps.collapsedSections;

        // the collapsedSections were not calculated before -> calculate the graph to be completely expanded
        if (!nextProps.collapsedSections) {
          collapsedSections = _createCompactedCollapsedSections(nextProps, branchesHeadShas);
        }

        // prepare the data for the graph
        let collapsedSectionClones = prepareForDataExtraction(
          nextProps,
          collapsedSections,
          branchesHeadShas
        );
        let { commitNodes, commitChildLinks, branchIDs } = extractData(
          nextProps,
          collapsedSectionClones,
          branchesHeadShas
        );
        updatedProps.branches = nextProps.branches;
        updatedProps.commits = nextProps.commits;
        updatedProps.commitNodes = commitNodes;
        updatedProps.commitChildLinks = commitChildLinks;
        updatedProps.branchIDs = branchIDs;
        updatedProps.excludedBranchesBaseProject = nextProps.excludedBranchesBaseProject;
        updatedProps.excludedBranchesOtherProject = nextProps.excludedBranchesOtherProject;
        updatedProps.filterAfterDate = nextProps.filterAfterDate;
        updatedProps.filterBeforeDate = nextProps.filterBeforeDate;
        updatedProps.filterAuthor = nextProps.filterAuthor;
        updatedProps.filterCommitter = nextProps.filterCommitter;
        updatedProps.filterSubtree = nextProps.filterSubtree;
        updatedProps.layout = nextProps.layout;
        currentLayout = nextProps.layout;
        updatedProps.collapsedSections = collapsedSections;
        updatedProps.branchesHeadShas = branchesHeadShas;

        nextProps.onSetBranchesHeadSha(branchesHeadShas);
      }
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
        _showMergeConflictModal(
          nextProps.mergeCheck,
          nextProps.branchesHeadShas,
          nextProps.commits
        );
      }

      updatedProps.mergeCheck = nextProps.mergeCheck;
    }

    // a new check for a merge was performed
    if (
      !equals(nextProps.cherryPickCheck, prevState.cherryPickCheck) &&
      nextProps.cherryPickCheck
    ) {
      // the cherry picks show no conflicts -> show success message
      if (nextProps.cherryPickCheck.success) {
        _showCherryPickSuccessModal();
      } else {
        // the merge shows conflicts -> show them in a modal
        _showCherryPickConflictModal(nextProps.cherryPickCheck);
      }

      updatedProps.cherryPickCheck = nextProps.cherryPickCheck;
    }

    // new commit dependencies were retrieved
    if (!equals(nextProps.commitDependencies, prevState.commitDependencies)) {
      if (nextProps.commitDependencies) {
        // the commit dependencies could have been retrieved
        if (nextProps.commitDependencies.success) {
          // add all dependencies to the map and mark them
          nextProps.commitDependencies.commitDependencyShas.forEach((sha) => {
            if (sha) {
              // the node was not selected by the user
              // (if the user already selected the node, than the _highlightCommitDependencies would overwrite this styling)
              if (!selectedNodes.filter((selectedNode) => selectedNode.data()[0] === sha)[0]) {
                _highlightCommitDependencies(sha);
              }

              // the commit is already a dependency from another commit
              if (commitDependenciesWithDependentCommits.has(sha)) {
                // add the dependent commit to the list
                commitDependenciesWithDependentCommits
                  .get(sha)
                  .push(nextProps.commitDependencies.sha);
              } else {
                // the commit was not marked as a dependency previously, set an map entry
                commitDependenciesWithDependentCommits.set(sha, [nextProps.commitDependencies.sha]);
              }
            }
          });
        } else {
          // the commit dependencies y
          _showErrorModal(
            `Unable determine the dependencies of the selected commit (${nextProps.commitDependencies.sha}).`
          );
        }
      }

      updatedProps.commitDependencies = nextProps.commitDependencies;
    }

    // the whole graph should be expanded
    if (nextProps.expandAll !== prevState.expandAll) {
      if (nextProps.expandAll) {
        // the expandAll function is only usable with
        // no filterAuthor or filterCommitter (with show only option set) used
        if (
          (nextProps.filterAuthor.author && nextProps.filterAuthor.showOnly) ||
          (nextProps.filterCommitter.committer && nextProps.filterCommitter.showOnly)
        ) {
          _showErrorModal(
            'Unable to expand the graph when filtering after an author or a committer with "show only" option.'
          );
          nextProps.onSetExpandAll(false);
        } else {
          let collapsedSections = _createExpandedCollapsedSections(nextProps.commits);
          nextProps.onSetCollapsedSections(collapsedSections);
        }
      }

      updatedProps.expandAll = nextProps.expandAll;
    }

    // the whole graph should be compacted
    if (
      nextProps.compactAll !== prevState.compactAll ||
      (!equals(nextProps.filterAuthor, prevState.filterAuthor) &&
        nextProps.filterAuthor.showOnly) ||
      (!equals(nextProps.filterCommitter, prevState.filterCommitter) &&
        nextProps.filterCommitter.showOnly)
    ) {
      // if the graph should be compacted OR
      // the author/committer filter is set with showOnly
      if (
        nextProps.compactAll ||
        (nextProps.filterAuthor.author && nextProps.filterAuthor.showOnly) ||
        (nextProps.filterCommitter.committer && nextProps.filterCommitter.showOnly)
      ) {
        // create fully compacted sections
        const collapsedSections = _createCompactedCollapsedSections(
          nextProps,
          nextProps.branchesHeadShas || updatedProps.branchesHeadShas
        );

        // put the fully compacted collapsed sections to the state
        nextProps.onSetCollapsedSections(collapsedSections);
      }

      updatedProps.compactAll = nextProps.compactAll;
    }

    // a compacted node should be expanded
    if (!equals(nextProps.nodeToExpand, prevState.nodeToExpand)) {
      // the expandAll function is only usable with
      // no filterAuthor or filterCommitter (with show only option set) used
      if (
        (nextProps.filterAuthor.author && nextProps.filterAuthor.showOnly) ||
        (nextProps.filterCommitter.committer && nextProps.filterCommitter.showOnly)
      ) {
        _showErrorModal(
          'Unable to expand the node when filtering after an author or a committer with "show only" option.'
        );
        nextProps.onExpandCollapsedNode(undefined);
      } else {
        _expandCompactedNode(nextProps);
      }
      updatedProps.nodeToExpand = nextProps.nodeToExpand;
    }

    // an expanded section should be compacted
    if (nextProps.nodeToCompactSection !== prevState.nodeToCompactSection) {
      _compactExpandedSection(nextProps);
      updatedProps.nodeToCompactSection = nextProps.nodeToCompactSection;
    }

    // resets the location of the graph, helps if the user is lost
    if (nextProps.shouldResetLocation !== prevState.shouldResetLocation) {
      if (nextProps.shouldResetLocation) {
        let { svg } = _getGraphDOMElements();
        svg
          // center the graph
          .call(zoom.transform, d3.zoomIdentity.translate(20, 20).scale(1));

        nextProps.onShouldResetLocation(false);
      }
      updatedProps.shouldResetLocation = nextProps.shouldResetLocation;
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
      !equals(prevState.layout, this.state.layout) ||
      (!equals(prevState.commitNodes, this.state.commitNodes) && this.state.commitNodes.length > 0)
    ) {
      let { svg, inner } = _getGraphDOMElements();
      if (zoom) {
        svg.call(zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1));
      }
      svg.innerHtml = '';
      svg.attr('width', '960'); // needed because transition cannot read with 100% which results in an error

      // init the graph for the commits/edges
      g = new dagreD3.graphlib.Graph().setGraph({
        rankdir: this.state.layout,
        ranker: 'tight-tree',
        nodesep: 100,
        ranksep: 100,
      });

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
      _hideModalsOnClickOutside(prevProps);

      // add zoom and other stuff
      this._setZoomSupportAndPositionGraph(svg, inner, g);
      this._setNodeMetadataTooltipOnHover(inner, g);
      this._setLabelCurrentActionTooltipOnHover(inner);
      this._setCodeChangesModalOnDoubleClick(svg, inner, g);
      this._setUpCommitNodeSelectionEvent(prevProps, g);
      this._setUpCollapsedNodeContextMenuEvent();
      this._setUpCommitNodeContextMenuEvent(g);
      this._setUpCherryPickMergeAndRebaseCheck();
      _handleEscapePress(prevProps);

      svg.attr('height', '98vh' /*g.graph().height * initialScale + 40*/);
      svg.attr('width', '100%');

      // set the branch labels above node
      inner.selectAll('g.node circle').each(function () {
        d3.select(this.parentNode)
          .select('g.label')
          .attr(
            'transform',
            currentLayout === 'TB' ? 'translate(0,45) rotate(-45)' : 'translate(0,-45) rotate(-45)'
          );
      });

      prevProps.onSetIsLoading(false);
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
          <div
            id="loadingContainer"
            hidden={this.state.isLoading ? '' : 'hidden'}
            className={styles.loadingHintContainer}>
            <h1 className={styles.loadingHint}>
              Loading... <i className="fas fa-spinner fa-pulse" />
            </h1>
          </div>
          <div
            id="modalContainer"
            style={
              this.state.isLoading ? { opacity: 0, width: '100%' } : { opacity: 1, width: '100%' }
            }>
            <svg id="test" className={styles.chart} width="960" height="10">
              <g />
            </svg>
          </div>

          {/* the context menu for a commit node */}
          <Menu id={COMMIT_NODE_MENU_ID}>
            <Item id="copySha" onClick={_handleCommitContextMenuItemSelection}>
              Copy Sha to Clipboard
            </Item>
            <Item id="compactSection" onClick={_handleCommitContextMenuItemSelection}>
              Compact Section
            </Item>
          </Menu>

          {/* the context menu for a commit node */}
          <Menu id={COLLAPSED_NODE_MENU_ID}>
            <Item id="expandCollapsedNode" onClick={_handleCollapsedNodeContextMenuItemSelection}>
              Expand
            </Item>
          </Menu>
        </ChartContainer>
      );
    } else {
      return (
        <div className={styles.loadingHintContainer}>
          <h1 className={styles.loadingHint}>
            Loading... <i className="fas fa-spinner fa-pulse" />
          </h1>
        </div>
      );
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
    if (!zoom) {
      // Set up zoom support
      zoom = d3.zoom().on('zoom', function (event) {
        inner.attr('transform', event.transform);
        if (event.transform.x !== 0 || event.transform.y !== 0 || event.transform.k !== 1) {
          lastTransform = event.transform;
        }
      });
    }

    svg
      .call(zoom)

      // center the graph
      .call(
        zoom.transform,
        lastTransform
          ? d3.zoomIdentity.translate(lastTransform.x, lastTransform.y).scale(lastTransform.k)
          : d3.zoomIdentity.translate((svg.attr('width') - g.graph().width) / 2, 20).scale(1)
      )
      .on('dblclick.zoom', null); // disable zoom on double click
  }

  /**
   * Adds the commit-nodes and collapsed nodes in the graph.
   * @param g the graph element
   * @returns {Map<string, [string]>} Map containing the commit-sha as key and the [class, color] of the commit as value
   * @private
   */
  _setGraphNodes(g) {
    // map which stores the class and the color of the node (needed for setting the edge/color of the edges later on)
    const edgeClassesAndColors = new Map();

    // for every commit in the node list, set it in the graph (can contain commits of the base project only, but also of a selected fork/parent)
    this.state.commitNodes.forEach((node) => {
      if (node.sha) {
        // checks if a node is in the base project and/or in the selected fork/parent (needed for class and color specification of the commit-node)
        const isInBaseProject = node.projects.includes(this.state.repoFullName);
        const isInOtherProject = this.state.otherProject
          ? node.projects.includes(this.state.otherProject.fullName)
          : false;

        // set the class and the color of the node according to its project membership
        let { clazz, color, repo } = _getClassColorAndRepo(
          this.state,
          isInBaseProject,
          isInOtherProject
        );

        // add the class and the color of the node for the edges later on
        edgeClassesAndColors.set(node.sha, [clazz, color]);

        // set the commit-node in the graph
        g.setNode(node.sha, {
          label: node.label,
          labelType: node.labelType,
          shape: 'circle',
          width: 15,
          height: 15,
          class: `${clazz} ${node.sha}`,
          style: `stroke: ${color}; fill: ${color}; stroke-width: 1px; ${node.additionalStyle}`,
          repo: repo,
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
      } else {
        // the node is a collapsed node
        edgeClassesAndColors.set(node.id, [node.clazz, node.color]);

        // collapsed nodes are ellipses with the number of commits it 'holds'
        g.setNode(node.id, {
          label: node.label,
          shape: 'ellipse',
          width: 60,
          height: 25,
          style: `stroke: ${node.color}; stroke-width: 1px; fill: white;`,
          class: node.clazz,
        });
      }
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
          class: `${classAndColor[0]} ${link.target}`, // class for coloring the edges (only needed for d3 selection, is only a pseudo css class) and for branch hover edge highlighting
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
    this._setTooltipOnNodes(inner.selectAll('g.node circle'), (event) => {
      const node = _getNodeFromEvent(event, g);
      return (
        '<div style="max-width: 500px">' +
        `<p style="text-align: center"><b>${node.sha}</b></p>` +
        `Committed by ${node.signature.replace(/</g, '&lt').replace(/>/g, '&gt')}</br>` +
        `(${node.date})</br></br>` +
        `Authored by ${node.author.replace(/</g, '&lt').replace(/>/g, '&gt')}</br>` +
        `(${node.authorDate})</br></br>` +
        `<i>${node.messageHeader}</i>` +
        '</div>'
      );
    });
  }

  /**
   * Sets up tooltips over branch names showing which action the user will do
   * (selecting a branch, try merging, try rebasing or try cherry picking).
   * @param inner the g child of the svg element
   * @private
   */
  _setLabelCurrentActionTooltipOnHover(inner) {
    this._setTooltipOnNodes(
      inner.selectAll('span.baseProject,span.otherProject,span.combined'),
      (event) => {
        let name = event.target.getAttribute('name');
        let tooltipText = `Select branch '${name}'.`;

        if (selectedNodes.length > 0) {
          tooltipText = `Try cherry-picking selected commits to '${name}'.`;
        } else if (selectedBranch && event.ctrlKey) {
          tooltipText = `Try rebasing selected branch on '${name}'.`;
        } else if (selectedBranch && event.shiftKey) {
          tooltipText = `Try merging selected branch into '${name}'.`;
        }

        return tooltipText;
      },
      (event) => {
        // get the branch name which is hovered
        let name = event.target.getAttribute('name');

        // get all the target nodes of the nodes in the graph
        this.state.commitNodes
          .filter((commit) => {
            let branches = commit.branches.map((branch) => branch.branchName);
            return (
              branches.includes(name) && ((commit.sha && commit.parents.length > 0) || commit.id)
            );
          })
          .forEach((commit) => commitShasOfBranch.set(commit.sha || commit.id), '');

        // save current color of the edge and mark it
        commitShasOfBranch.forEach((color, sha) => {
          const path = d3.selectAll(`g[class$=' ${sha}']`).select('path');
          if (path.node()) {
            commitShasOfBranch.set(sha, path.style('stroke'));
            path.style('stroke', 'black').style('stroke-width', '5px');
          }
        });
      },
      () => {
        // reset the edge coloring
        commitShasOfBranch.forEach((color, sha) =>
          d3
            .selectAll(`g[class$=' ${sha}']`)
            .select('path')
            .style('stroke', color)
            .style('stroke-width', '2px')
        );
        commitShasOfBranch = new Map();
      }
    );
  }

  /**
   * Sets up a tooltip on hovering over the provided nodes showing the text retured from the getTooltipText method.
   * @param nodes {*} the selected nodes to apply show the tooltip on mouseover (d3)
   * @param getTooltipText {function(event): string} the text/html which should be shown in the tooltip
   * @param mouseoverFunction {function(event): void} the function which will additionally called at the mouseover event
   * @param mouseoutFunction {function(event): void} the function which will additionally called at the mouseout event
   * @private
   */
  _setTooltipOnNodes(
    nodes,
    getTooltipText,
    mouseoverFunction = () => {},
    mouseoutFunction = () => {}
  ) {
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
    nodes

      // show tooltip when mouse is over the node and call provided function
      .on('mouseover', (event) => {
        tooltip.html(getTooltipText(event)).style('visibility', 'visible');
        mouseoverFunction(event);
      })

      // move tooltip with mouse
      .on('mousemove', (event) => {
        tooltip.style('top', event.pageY - 10 + 'px').style('left', event.pageX + 10 + 'px');
      })

      // hide tooltip if mouse moves out of the node and call provided function
      .on('mouseout', (event) => {
        tooltip.style('visibility', 'hidden');
        mouseoutFunction(event);
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
    modal.html('');
    modal.append('p').classed('has-text-centered', true).attr('id', 'diffModalSha');

    modal.html(
      modal.html() +
        `
     <div class="card is-fullwidth">
       <header id="diffModalMessageCardHeader" class="card-header">
         <p class="card-header-title">Commit Message</p>
         <a class="card-header-icon card-toggle">
          <i id="diffModalMessageCardArrow" class="fa fa-angle-up"></i>
         </a>
       </header>
       <div id="diffModalMessageCardContent" class="card-content" style="white-space: pre-wrap"></div>
     </div>
     `
    );
    d3.select('#diffModalMessageCardHeader').on('click', () =>
      _toggleCardContentVisibility('diffModalMessageCardContent', 'diffModalMessageCardArrow')
    );

    modal
      .append('diff')
      .classed('loadingHintContainer', true)
      .classed(styles.loadingHintContainer, true)
      .append('h1')
      .attr('id', 'diffModalLoadingIndicator')
      .classed(styles.loadingHint, true)
      .html('Loading... <i className="fas fa-spinner fa-pulse" />');

    // add a textarea to the modal, needed for CodeMirror
    modal.append('textarea').attr('id', 'diffModalTextArea').attr('hidden', 'true');

    // set up the hover events for each commit-nodes
    inner
      .selectAll('g.node circle')

      // show the diffs modal at doublie click on a commit-node
      .on('dblclick', (event) => {
        const node = _getNodeFromEvent(event, g);
        modal.style('visibility', 'visible');

        d3.select('#diffModalSha').text(node.sha);
        d3.select('#diffModalMessageCardContent').text(node.message);
        d3.select('#diffModalLoadingIndicator').attr('hidden', null);
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
   * Set up the events for checks, if a rebase, merge or cherry pick(s) are successful
   * or resolves in a conflict.
   * @private
   */
  _setUpCherryPickMergeAndRebaseCheck() {
    const { inner } = _getGraphDOMElements();

    this.state.branchIDs.forEach((branchID) => {
      inner.select(`span.${branchID.clazz}.${branchID.branchKey}`).on('click', (event) => {
        if (selectedNodes.length > 0) {
          let otherRepo = this.props.repoFullName;
          if (
            this.props.repoFullName === this._getProjectFromCSSClass(branchID.clazz) &&
            this.props.otherProject
          ) {
            otherRepo = this.props.otherProject.fullName;
          }

          // cherry pick selected nodes onto branch
          this.props.onCheckCherryPick(
            selectedNodeInfos,
            otherRepo,
            this._getProjectFromCSSClass(branchID.clazz),
            branchID.branchName
          );

          // reset the selected commits
          selectedNodes.forEach((node) => _resetCommitHighlighting(node));
          selectedNodes = [];
          selectedNodeInfos = [];

          // remove the highlighting of all commits which are marked as dependency
          // and reset the commitDependency map
          commitDependenciesWithDependentCommits.forEach((value, key) => {
            const commitNode = _getCommitNodeFromShaClass(key);
            _resetCommitHighlighting(commitNode);
          });
          commitDependenciesWithDependentCommits = new Map();
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
            _resetBranchNameHighlighting(selectedBranch);
            selectedBranch = undefined;
          } else {
            // no special key was pressed during the click
            selectedNodes = [];
            selectedNodeInfos = [];

            // a branch was already selected --> reset the highlighting of the previous selectedBranch
            if (selectedBranch) {
              _resetBranchNameHighlighting(selectedBranch);
            }

            // set the currently selected branch and highlight it
            selectedBranch = branchID;
            _highlightBranchName(selectedBranch);
          }
        } else if (selectedBranch && equals(selectedBranch, branchID)) {
          // the same branch was selected again -> reset its highlighting and the selectedBranch
          _resetBranchNameHighlighting(inner, selectedBranch);
          selectedBranch = undefined;
        } else {
          // no branch was previously selected -> highlight the currently selected branch
          selectedBranch = branchID;
          _highlightBranchName(selectedBranch);
        }
      });
    });
  }

  /**
   * Selects the clicked commit node.
   * If the ctrl key is not pressed during the click, reset the previous selection.
   * Otherwise the clicked node will be added to the current selection.
   * If a selected commit node is clicked again (with ctrl key), then the commit node
   * will be removed from the current selection.
   * @param prevProps the props
   * @param g
   * @private
   */
  _setUpCommitNodeSelectionEvent(prevProps, g) {
    d3.selectAll('g.node circle').on('click', function (event) {
      // check if the ctrl key is pressed during the click, if not: reset the current selection
      if (!event.ctrlKey) {
        // remove the highlighting of all commits which are marked as dependency
        // and reset the commitDependency map
        commitDependenciesWithDependentCommits.forEach((value, key) => {
          const commitNode = _getCommitNodeFromShaClass(key);
          _resetCommitHighlighting(commitNode);
        });
        commitDependenciesWithDependentCommits = new Map();

        // remove the highlighting of all commits which are selected
        // and reset the selected nodes list
        selectedNodes.forEach((node) => _resetCommitHighlighting(node));
        selectedNodes = [];
        selectedNodeInfos = [];
      }

      // the commit node which was clicked
      const clickedNode = d3.select(this);
      // the commit stored within the commit node DOM element
      const commitNode = _getNodeFromEvent(event, g);

      // clickedCommit is a dependency -> reset the highlighting in order to overwrite it
      if (clickedNode.style('stroke-dasharray') !== 'none') {
        _resetCommitHighlighting(clickedNode);
      }

      // check if the clicked code was already selected
      const alreadySelectedNode = selectedNodes.filter(
        (selectedNode) => selectedNode.data()[0] === clickedNode.data()[0]
      )[0];

      // node was already selected -> node should be deselected
      if (alreadySelectedNode) {
        // remove its commit dependencies
        commitDependenciesWithDependentCommits.forEach((value, key) => {
          if (value.includes(commitNode.sha)) {
            // check if dependency commit is selected
            // if not: remove its highlighting, otherwise let the selection highlighting be
            if (
              selectedNodes.filter((selectedNode) => selectedNode.data()[0] === key).length === 0
            ) {
              _resetCommitHighlighting(_getCommitNodeFromShaClass(key));
            }

            // if the commit dependency is a dependency for more commits than the selected one
            // remove the selected commit node from the list
            if (value.length > 1) {
              value.splice(value.indexOf(commitNode.sha), 1);
            } else {
              // the commit dependency is a dependency for only the selected commit
              // remove the commit dependency completely from the map
              commitDependenciesWithDependentCommits.delete(key);
            }
          }
        });

        // remove clicked node from selectedNodes and reset its styling
        const index = selectedNodes.indexOf(alreadySelectedNode);
        selectedNodes.splice(index, 1);
        selectedNodeInfos.splice(index, 1);
        _resetCommitHighlighting(clickedNode);

        // the selected commit is still a commit dependency -> mark it as one
        if (commitDependenciesWithDependentCommits.has(commitNode.sha)) {
          _highlightCommitDependencies(commitNode.sha);
        }
      } else {
        // the node was not already selected -> select it

        // mark the node as selected and push it to the selected nodes
        clickedNode.style('stroke-width', '5px').style('stroke', 'black');
        selectedNodes.push(clickedNode);
        selectedNodeInfos.push({
          sha: commitNode.sha,
          fromRepo: commitNode.repo,
          date: commitNode.date,
          author: commitNode.author,
        });

        // get all commit shas the selected commits depends on (not recursive)
        prevProps.onGetCommitDependencies(commitNode.sha);
      }
    });
  }

  /**
   * Sets up the custom context menu for collapsed nodes.
   * @private
   */
  _setUpCollapsedNodeContextMenuEvent() {
    d3.selectAll('g.node ellipse').on('contextmenu', (event) => {
      // prevent the default behaviour of the right click
      event.preventDefault();

      // get the parent and child ids from the selected collapsed node in order to expand it later on
      const parentChildShas = event.target.__data__.split('-');
      const parentSha = parentChildShas[0].trim();
      const childSha = parentChildShas[1].trim();

      // show the custom context menu and set the needed properties
      show(event, {
        id: COLLAPSED_NODE_MENU_ID,
        props: {
          parentSha,
          childSha,
          _onExpandCollapsedNode: this.props.onExpandCollapsedNode,
        },
      });
    });
  }

  /**
   * Sets up the custom context menu for commit nodes.
   * @param g
   * @private
   */
  _setUpCommitNodeContextMenuEvent(g) {
    d3.selectAll('g.node circle').on('contextmenu', (event) => {
      // prevent the default behaviour of the right click
      event.preventDefault();

      // show the custom context menu
      show(event, {
        id: COMMIT_NODE_MENU_ID,
        props: {
          node: _getNodeFromEvent(event, g),
          _onSetNodeToCompactSection: this.props.onSetNodeToCompactSection,
        },
      });
    });
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
 * Provides the logic for the context menu of a commit node.
 * @param event
 * @param props the provided props from the react-contexify context menu
 * @private
 */
function _handleCommitContextMenuItemSelection({ event, props }) {
  switch (event.currentTarget.id) {
    // copy the sha of the commit node
    case 'copySha': {
      // write it to the clipboard
      navigator.clipboard
        .writeText(props.node.sha)
        .then(() => {
          // show a success message and close it automatically after 3 seconds
          _showSuccessModal('Copied the selected SHA to the clipboard.');
          setTimeout(_hideSuccessModal, 3000);
        })
        .catch((e) => {
          // unable to copy the sha to the clipboard
          console.error(e);
          // show an error message and close it automatically after 3 seconds
          _showErrorModal('Unable to copy the selected SHA to the clipboard.');
          setTimeout(_hideErrorModal, 3000);
        });
      break;
    }
    // compact the section where the commit node lies in
    case 'compactSection': {
      props._onSetNodeToCompactSection(props.node.sha);
      break;
    }
  }
}

/**
 * Pushes all child commit shas (incl. commitSha) into the shas list.
 * @param commitSha {string} the sha where to get the shas of it's subtree (incl. commitSha)
 * @param shas {[string]} list of shas which are included in the subtree (will be filled)
 * @param allCommits {[*]} list of all commits
 * @private
 */
function _getSubtreeCommitShas(commitSha, shas, allCommits) {
  // get the commit
  let commit = allCommits.filter((_commit) => _commit.sha === commitSha)[0];

  // if the commit exists in the commit list (check needed if a child is in another project which is not shown)
  if (commit) {
    // push sha into the list and calculate the subtree for all the commits children
    shas.push(commit.sha);
    if (commit.children.length > 0) {
      commit.children.forEach((commitSha) => {
        _getSubtreeCommitShas(commitSha.sha, shas, allCommits);
      });
    }
  }
}

/**
 * Provides the logic for the context menu of a collapsed node.
 * @param event
 * @param props the provided props from the react-contexify context menu
 * @private
 */
function _handleCollapsedNodeContextMenuItemSelection({ event, props }) {
  switch (event.currentTarget.id) {
    // logic for expanding a collapsed node
    case 'expandCollapsedNode': {
      props._onExpandCollapsedNode({ parentSha: props.parentSha, childSha: props.childSha });
      break;
    }
  }
}

/**
 * Retrieves the commit node which has the provided sha as class.
 * @param sha {string} the class indicator of the commit node which should be retrieved
 * @returns {*}
 * @private
 */
function _getCommitNodeFromShaClass(sha) {
  return d3.select(`g[class*='${sha}'] circle`);
}

/**
 * Highlights the commit node with the provided sha as commit dependency.
 * @param sha {string} the sha of the commit which should be highlighted
 * @private
 */
function _highlightCommitDependencies(sha) {
  // get the node from the graph
  const node = _getCommitNodeFromShaClass(sha);

  // if the node was not filtered out previously, mark them as depending commit
  if (node) {
    node.style('stroke', 'black').style('stroke-width', '5px').style('stroke-dasharray', '5,5');
  }
}

/**
 * Highlights a branch with a solid border.
 * @param branch {*} to which a highlighting should be added
 * @private
 */
function _highlightBranchName(branch) {
  d3.select(`span.${branch.clazz}.${branch.branchKey}`).style('border', 'black solid 2px');
}

/**
 * Removes the border highlighting of the branch.
 * @param branch {*} from which the highlighting should be removed
 * @private
 */
function _resetBranchNameHighlighting(branch) {
  d3.select(`span.${branch.clazz}.${branch.branchKey}`).style('border', '');
}

/**
 * Returns the highlighting of a highlighted node.
 * @param node {*} the node which highlighting should be reset
 * @private
 */
function _resetCommitHighlighting(node) {
  if (node.node()) {
    node
      .style('stroke-width', '1px')
      .style('stroke', node.style('fill'))
      .style('stroke-dasharray', null);
  }
}

/**
 * Closes visible modals and (if no modal is visible) resets the selected nodes and branches on key press Escape.
 * @param prevProps the props, needed to call the onResetStateProperty reducer function
 * @private
 */
function _handleEscapePress(prevProps) {
  d3.select('body').on('keydown', (event) => {
    if (event.key === 'Escape') {
      // modals which can be shown
      const diffModal = _getDiffModal();
      const successModal = _getSuccessModal();
      const errorModal = _getErrorModal();
      const conflictModal = _getConflictModal();

      // reset selected nodes and the selected branch if no modal is shown
      if (
        !_isVisible(diffModal) &&
        !_isVisible(successModal) &&
        !_isVisible(conflictModal) &&
        !_isVisible(errorModal)
      ) {
        // reset selected nodes
        if (selectedNodes.length > 0) {
          selectedNodes.forEach((node) => _resetCommitHighlighting(node));
          selectedNodes = [];
          selectedNodeInfos = [];
        }

        // reset selected branch
        if (selectedBranch) {
          _resetBranchNameHighlighting(selectedBranch);
          selectedBranch = undefined;
        }

        // reset the commit dependencies
        commitDependenciesWithDependentCommits.forEach((value, key) => {
          let commitNode = _getCommitNodeFromShaClass(key);
          _resetCommitHighlighting(commitNode);
        });
        commitDependenciesWithDependentCommits = new Map();
      } else {
        // if a modal is shown, hide it without resetting the selected nodes and the selected branch

        // hide diffModal if visible
        if (_isVisible(diffModal)) {
          _resetDiffAndHideModal(prevProps);
        }

        // hide successModal if visible
        if (_isVisible(successModal)) {
          _hideSuccessModal();
        }

        // hide conflictModal if visible
        if (_isVisible(conflictModal)) {
          _resetRebaseCheckAndHideModal(prevProps);
          _resetMergeCheckAndHideModal(prevProps);
        }

        // hide errorModal if visible
        if (_isVisible(errorModal)) {
          _hideErrorModal();
        }
      }
    }
  });
}

/**
 * Collects the information about the headShas of branches and the collapsed sections.
 * Filter out collapsedSections according to set filters and prepares their projects according to un-/selected branches.
 * @param props the props
 * @param collapsedSections {[]} the precalculated, not filtered/prepared collapsedSections
 * @param branchesHeadShas {Map<any, any>} map of the head shas of the branches and their projects
 * @returns collapsedSectionClones
 */
function prepareForDataExtraction(props, collapsedSections, branchesHeadShas) {
  // the commits are already retrieved, get all the
  if (props.commits) {
    // prepare the collapsed sections which should be shown according to
    // set filters and to selected branches
    let isInProjectInfo = {
      isInBaseProject: false,
      isInOtherProject: false,
      lastBranchesChecked: [],
    };
    let collapsedSectionClones = [];

    collapsedSections.forEach((collapsedSection) => {
      // clone the commit in order to be able to modify it safely
      const collapsedSectionClone = _.cloneDeep(collapsedSection);

      // check if the commit should be hidden in the graph or should be toned down
      collapsedSectionClone.parent.additionalStyle = _checkFilters(props, collapsedSection.parent);

      // the node should be shown in the graph
      if (collapsedSectionClone.parent.additionalStyle !== null) {
        // filter out all unused projects of the parent (projects which
        // are not the base project and the selected other project if existing)
        collapsedSectionClone.parent.projects = collapsedSectionClone.parent.projects.filter(
          (project) =>
            project === props.repoFullName ||
            (props.otherProject && project === props.otherProject.fullName)
        );

        // filter out all unused projects of the child, if existing
        if (collapsedSectionClone.child) {
          collapsedSectionClone.child.projects = collapsedSectionClone.child.projects.filter(
            (project) =>
              project === props.repoFullName ||
              (props.otherProject && project === props.otherProject.fullName)
          );
        }

        // remove unselected branches of the base project from the branchesHeadShas
        // so that it is not shown in the label of the HEAD (labels are only at the parent nodes)
        // if multiple branches refer to it
        collapsedSectionClone.parent.branches.forEach((branch) => {
          if (props.excludedBranchesBaseProject.includes(branch.branchName)) {
            let branchHeadCommit = branchesHeadShas.get(collapsedSectionClone.parent.sha);
            // the current commit is a head
            if (branchHeadCommit) {
              const branchMetadata = branchHeadCommit.get(branch.branchName);
              // check if the current branch is in the base project, if yes: check if it should be removed
              if (branchMetadata && branchMetadata.projects.includes(props.repoFullName)) {
                // if the commit is only in the base project, delete the whole branch entry, because it was excluded
                if (branchMetadata.projects.length === 1) {
                  branchHeadCommit.delete(branch.branchName);
                } else {
                  // if the commit is a head of multiple projects, remove the project from the list,
                  // such that the branch name will not be shown in the node label
                  if (branchMetadata.projects.includes(props.repoFullName)) {
                    branchMetadata.projects = branchMetadata.projects.splice(
                      branchMetadata.projects.indexOf(props.repoFullName),
                      1
                    );
                  }
                }
              }
            }
          }

          // remove unselected branches of the other project from the branchesHeadShas
          // so that it is not shown in the label of the HEAD
          // if multiple branches refer to it
          if (
            props.otherProject &&
            props.excludedBranchesOtherProject.includes(branch.branchName)
          ) {
            // TODO: if something is off -> changed 'collapsedSectionClone.sha' to collapsedSectionClone.parent.sha
            let branchHeadCommit = branchesHeadShas.get(collapsedSectionClone.parent.sha);
            // the current commit is a head
            if (branchHeadCommit) {
              const branchMetadata = branchHeadCommit.get(branch.branchName);
              // check if the current branch is in the other project, if yes: check if it should be removed
              if (branchMetadata && branchMetadata.projects.includes(props.otherProject.fullName)) {
                // if the commit is only in the other project, delete the whole branch entry, because it was excluded
                if (branchMetadata.projects.length === 1) {
                  branchHeadCommit.delete(branch.branchName);
                } else {
                  // if the commit is a head of multiple projects, remove the project from the list,
                  // such that the branch name will not be shown in the node label
                  if (branchMetadata.projects.includes(props.otherProject.fullName)) {
                    branchMetadata.projects = branchMetadata.projects.splice(
                      branchMetadata.projects.indexOf(props.otherProject.fullName),
                      1
                    );
                  }
                }
              }
            }
          }
        });

        // remove all the projects from the collapsed sections parent
        // which are excluded from the graph due to the exclusion of specific branches
        isInProjectInfo = _removeUnusedProjectsFromCommit(
          collapsedSectionClone.parent,
          isInProjectInfo,
          props
        );

        // remove all the projects from the collapsed sections child (if existing)
        // which are excluded from the graph due to the exclusion of specific branches
        if (collapsedSectionClone.child) {
          isInProjectInfo = _removeUnusedProjectsFromCommit(
            collapsedSectionClone.child,
            isInProjectInfo,
            props
          );
        }
      } else {
        // the node should not be shown according to the filters
        // -> remove the projects of the collapsed sections parent
        // (will be filtered out when the nodes will be added to the graph)
        collapsedSectionClone.parent.projects = [];
      }

      collapsedSectionClones.push(collapsedSectionClone);
    });

    return collapsedSectionClones;
  }

  // the commits are currently not retrieved -> the info cannot be calculated at the moment
  return undefined;
}

function _removeUnusedProjectsFromCommit(commit, isInProjectInfo, props) {
  // if the branches of the last commit differ from the branches of the current commit
  // check if the commit is still in the base project and in the other project if selected
  // if the branches does not differ, the values from the last check are used
  if (!equals(isInProjectInfo.lastBranchesChecked, commit.branches)) {
    let branchesToShowBaseProject;
    let branchesToShowOtherProject;

    // update the last branches which were checked to the current branch list
    isInProjectInfo.lastBranchesChecked = _.assign(
      [],
      commit.branches.map((branch) => branch.branchName)
    );

    // get the branches of the base project which should be shown
    // (overall branches - excluded branches)
    branchesToShowBaseProject = props.branchesBaseProject
      .map((branch) => branch.branchName)
      .filter((branch) => !props.excludedBranchesBaseProject.includes(branch));

    // get the branches of the other project which should be shown
    // (overall branches - excluded branches)
    branchesToShowOtherProject = props.branchesOtherProject
      ? props.branchesOtherProject
          .map((branch) => branch.branchName)
          .filter((branch) => !props.excludedBranchesOtherProject.includes(branch))
      : [];

    // reset the flags indicating in which project the commit is
    isInProjectInfo.isInBaseProject = false;
    isInProjectInfo.isInOtherProject = false;

    for (let i = 0; i < isInProjectInfo.lastBranchesChecked.length; i = i + 1) {
      const branch = isInProjectInfo.lastBranchesChecked[i];
      if (isInProjectInfo.isInBaseProject && isInProjectInfo.isInOtherProject) {
        break;
      } else {
        if (branchesToShowBaseProject.includes(branch)) {
          isInProjectInfo.isInBaseProject = true;
        }
        if (branchesToShowOtherProject.includes(branch)) {
          isInProjectInfo.isInOtherProject = true;
        }
      }
    }
  }

  // if the commit is not in the base project, remove the base project from the commits project list
  if (!isInProjectInfo.isInBaseProject && commit.projects.includes(props.repoFullName)) {
    commit.projects.splice(commit.projects.indexOf(props.repoFullName), 1);
  }

  // if the commit is not in the other project, remove the other project from the commits project list
  if (
    props.otherProject &&
    !isInProjectInfo.isInOtherProject &&
    commit.projects.includes(props.otherProject.fullName)
  ) {
    commit.projects.splice(commit.projects.indexOf(props.otherProject.fullName), 1);
  }

  return isInProjectInfo;
}

/**
 * Create the commit-notes and the commit-child-links for the graph.
 * @returns {{commitNodes: [], commitChildLinks: [], branchIDs: []}}
 */
function extractData(props, collapsedSections, branchesHeadShas) {
  const commitNodes = [];
  const commitChildLinks = [];
  const branchIDs = [];

  if (collapsedSections) {
    collapsedSections.forEach(({ parent, nodes, child }) => {
      // if the commit is still in at least one project, after the excluded branches are removed,
      // add it to the graph
      if (parent.projects.length > 0 && (!child || child.projects.length > 0)) {
        let label = '';
        let labelType = '';

        // set the branch names as the label of the commit, if its a head
        if (branchesHeadShas.has(parent.sha)) {
          // get the branches where the commit is a head
          const branchProjects = branchesHeadShas.get(parent.sha);
          let index = 0;
          branchProjects.forEach((metadata, branchName) => {
            // check in which projects the commit is the head the branch
            const isInBaseProject = metadata.projects.includes(props.repoFullName);
            const isInOtherProject = props.otherProject
              ? metadata.projects.includes(props.otherProject.fullName)
              : false;

            // get the css class and color of the node and label based on the project memberships
            let { clazz, color } = _getClassColorAndRepo(props, isInBaseProject, isInOtherProject);

            if (index % 3 === 0) {
              label = label + '<br />';
            }
            // add the branch to the label including its key as class (is needed for later selections)
            label =
              label +
              `<span name='${branchName}' class='${clazz} ${metadata.branchKey}' style='color: ${color}; cursor: pointer'>${metadata.branchRef}</span>, `;

            // save important data of the branches for later handling
            branchIDs.push({
              headSha: parent.sha,
              branchKey: metadata.branchKey,
              branchRef: metadata.branchRef,
              branchName,
              clazz,
            });

            index = index + 1;
          });

          labelType = 'html';
          label = `<div style="text-align: center; background-color: white;">${label.substring(
            6,
            label.length - 2
          )}</div>`;
        }

        // check if the sections parent node is not already set
        // (can happen if the node has more than one children)
        if (commitNodes.filter((commitNode) => commitNode.sha === parent.sha).length === 0) {
          // clone the commit, parse its dates, set the label,
          // sets the additional style if it should be toned down and add it to the list
          const commitNode = _.cloneDeep(parent);
          commitNode.date = parseTime(commitNode.date);
          commitNode.authorDate = parseTime(commitNode.authorDate);
          commitNode.label = label;
          commitNode.labelType = labelType;
          commitNodes.push(commitNode);
        }

        // the collapsed section has no nodes which should be collapsed
        // -> only add the link vom the sections parent to the child
        if (nodes.length === 0 && child) {
          commitChildLinks.push({ source: parent.sha, target: child.sha });
        } else if (nodes.length === 1) {
          // The collapsed section has only one section which should be collapsed
          // it makes no sense to collapse a single node, therefore the node itself should be shown
          // and the links between the sections parent and the node,
          // and the link between the node and the sections child must be created
          const commitNode = _.cloneDeep(nodes[0]);
          commitNode.date = parseTime(nodes[0].date);
          commitNode.authorDate = parseTime(nodes[0].authorDate);
          commitNode.label = '';
          commitNode.labelType = '';
          commitNodes.push(commitNode);

          commitChildLinks.push({ source: parent.sha, target: commitNode.sha });
          commitChildLinks.push({ source: commitNode.sha, target: child.sha });
        } else if (nodes.length > 1) {
          // the collapsed section has multiple commits which should be collapsed

          // check in which projects the child commit of the collapsed section is
          // head nodes of branches will not be collapsed, therefore, all the parent commits will be
          // in the same projects as the child commit
          const isInBaseProject = child.projects.includes(props.repoFullName);
          const isInOtherProject = props.otherProject
            ? child.projects.includes(props.otherProject.fullName)
            : false;

          // get the clazz and color which the clusterNode should have in the graph
          const { clazz, color } = _getClassColorAndRepo(props, isInBaseProject, isInOtherProject);

          // create the cluster node
          const clusterNode = {};
          clusterNode.id = `${parent.sha}-${child.sha}`;
          clusterNode.label = nodes.length;
          clusterNode.clazz = clazz;
          clusterNode.color = color;
          clusterNode.branches = child.branches; // needed for branch edges highlighting
          commitNodes.push(clusterNode);

          // push the links from the parent and the cluster node,
          // and from the cluster node to the child to the links list
          commitChildLinks.push({ source: parent.sha, target: clusterNode.id });
          commitChildLinks.push({ source: clusterNode.id, target: child.sha });
        }
      }
    });

    // reset the flags indicating that the whole graph should be compacted or expanded
    props.onSetExpandAll(false);
    props.onSetCompactAll(false);
  }

  return { commitNodes, commitChildLinks, branchIDs };
}

/**
 * Retrieves the data for a collapsed node section.
 * Fills the nodes list with all children between the given commit (inclusive) and the next commit which is a special commit.
 * The calculation begins with the first child of the parent node from a collapsed section because a parent can have multiple children.
 * Therefore the specific child of the parent will indicate which path to follow for the calculation.
 * Returns the child node of the collapsed section (= the next section commit following the child paths).
 * @param commit {*} the child of a commit, from which the collapsed section should be created
 * @param nodes {[*]} the list of nodes that will be compacted (will be filled during calculation)
 * @param fromCommitShas {[*]} list containing all commits that will not be compacted and will be a parent/child of a collapsed section
 * @param allCommits {[*]} list of all commits
 * @returns {*} the child commit of the collapsed section
 * @private
 */
function _getCommitSection(commit, nodes, fromCommitShas, allCommits) {
  // check if the commit is no special commit
  if (fromCommitShas.filter((_commit) => _commit.sha === commit.sha).length === 0) {
    // get the child of the commit, put the commit to the list of compacted nodes and start the calculation all over again
    const child = allCommits.filter((_commit) => _commit.sha === commit.children[0].sha)[0];
    nodes.push(commit);
    return _getCommitSection(child, nodes, fromCommitShas, allCommits);
  } else {
    // the commit is a special commit -> the commit is the child of the collapsed section
    return commit;
  }
}

/**
 * Checks if a commit should be hidden in the graph or should toned down according to the set filters.
 * @param props {any} the props including the filter
 * @param commit {any} the commit which should be checked according to the set filter
 * @returns {string|null} null if the commit should not be shown in the graph,
 * otherwise the additional style the commit node should have ('' if the node should be highlighted,
 * opacity 0.5 if the node should be toned down)
 * @private
 */
function _checkFilters(props, commit) {
  let additionalStyle = '';

  // the commit was not committed after the provided date
  if (
    props.filterAfterDate.date &&
    props.filterAfterDate.date.getTime() > parseTime(commit.date).getTime()
  ) {
    // not showing filters have more priority than highlighted filter
    if (props.filterAfterDate.showOnly) {
      return null;
    } else {
      additionalStyle = 'opacity: 0.5;';
    }
  }

  // the commit was not committed before the provided date
  if (
    props.filterBeforeDate.date &&
    props.filterBeforeDate.date.getTime() < parseTime(commit.date).getTime()
  ) {
    // not showing filters have more priority than highlighted filter
    if (props.filterBeforeDate.showOnly) {
      return null;
    } else {
      additionalStyle = 'opacity: 0.5;';
    }
  }

  // the commit has a different committer than the user selected in the filter
  if (props.filterCommitter.committer && props.filterCommitter.committer !== commit.signature) {
    // if the filterCommitter is shown, the show only option will be handled differently
    // this filter will compact the whole graph
    // each node with the specific author will be handled as branching node
    // each branching node with a different committer will be toned down
    additionalStyle = 'opacity: 0.5;';
  }

  // the commit has a different author than the user selected in the filter
  if (props.filterAuthor.author && props.filterAuthor.author !== commit.author) {
    // if the filterAuthor is shown, the show only option will be handled differently
    // this filter will compact the whole graph
    // each node with the specific author will be handled as branching node
    // each branching node with a different author will be toned down
    additionalStyle = 'opacity: 0.5;';
  }

  // the subtree filter is selected
  if (commitShasOfSubtree.length > 0) {
    // the commit is not in the selected subtree
    if (!commitShasOfSubtree.includes(commit.sha)) {
      // not showing filters have more priority than highlighted filters
      if (props.filterSubtree.showOnly) {
        return null;
      } else {
        additionalStyle = 'opacity: 0.5;';
      }
    }
  }

  return additionalStyle;
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

  // recolor collapsed node
  inner.selectAll(`g.node.${classKey} ellipse`).style('stroke', color);

  // recolor node labels (branch names)
  inner.selectAll(`span.${classKey}`).style('color', `${color}`);

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
  return g.node(event.target ? event.target.__data__ : event.originalTarget.__data__);
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
  d3.select('#diffModalLoadingIndicator').attr('hidden', true);
  // get the diff modal and set the diff as text
  const diffModalTextArea = d3.select('#diffModalTextArea');
  diffModalTextArea.text(diff);

  // create codeMirror and bind it to the diff modal
  require(['codemirror/lib/codemirror', 'codemirror/mode/diff/diff'], function (CodeMirror) {
    codeMirror = CodeMirror.fromTextArea(document.getElementById('diffModalTextArea'), {
      lineNumbers: true,
      mode: 'diff',
      readOnly: true,
    });
  });
}

/**
 * Closes the Modal which shows the diff and resets the diff object in the state.
 * @param prevProps {*} the props
 * @private
 */
function _resetDiffAndHideModal(prevProps) {
  d3.select('#diffModalTextArea').html('');
  codeMirror.setValue('');
  const diffModal = _getDiffModal();
  diffModal.style('visibility', 'hidden');
  prevProps.onResetStateProperty('diff');
}

/**
 * Retrieves the CSS class and color based on the membership of the base project and/or the other project.
 * Also includes the membership. If the item is in both projects, the membership of the baseProject is returned
 * @param state {any} state to get the different color options from it
 * @param isInBaseProject {boolean} indicator if the element is in the base project
 * @param isInOtherProject {boolean} indicator if the element is in the other project
 * @returns {{color: *, clazz: string, repo: string}}
 * @private
 */
function _getClassColorAndRepo(state, isInBaseProject, isInOtherProject) {
  // default: element is only in the base project
  let clazz = 'baseProject';
  let color = state.colorBaseProject;
  let repo = state.repoFullName;

  if (isInBaseProject && isInOtherProject) {
    // element is in both projects
    clazz = 'combined';
    color = state.colorCombined;
  } else if (isInOtherProject) {
    // element is only in the other project
    clazz = 'otherProject';
    color = state.colorOtherProject;
    repo = state.otherProject.fullName;
  }

  return { clazz, color, repo };
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
  // reset the last highlighting
  if (oldIssueID) {
    // get all commits from the last issue filter (searched by id + title case insensitive
    let oldIssueCommits = allCommits.filter((commit) =>
      commit.message.toLowerCase().includes(oldIssueID.toLowerCase())
    );
    // change the node back to the previous design (not highlighted
    oldIssueCommits.forEach((commit) => {
      const node = _getCommitNodeFromShaClass(commit.sha);
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
      _getCommitNodeFromShaClass(commit.sha).style('stroke', 'black')
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
  _showSuccessModal(
    `No conflict was detected. The rebase of "${rebaseBranch}" (project "${rebaseRepo}") onto branch "${upstreamBranch}" (project "${upstreamRepo}") is possible.`
  );
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
  _showSuccessModal(
    `No conflict was detected. The merge of "${fromBranch}" (project "${fromRepo}") onto branch "${toBranch}" (project "${toRepo}") is possible.`
  );
}

/**
 * Shows the successModal containing a success message that the cherry picks of the selected commits
 * were without conflicts.
 * @private
 */
function _showCherryPickSuccessModal() {
  _showSuccessModal('The selected Commits can be cherry picked without conflicts.');
}

/**
 * Shows the successModal with the given text.
 * @param text {string} the text of the success modal
 * @private
 */
function _showSuccessModal(text) {
  _getSuccessModal().text(text).style('visibility', 'visible');
}

/**
 * Hides the successModal.
 * @private
 */
function _hideSuccessModal() {
  _getSuccessModal().style('visibility', 'hidden');
}

/**
 * Gets the errorModal.
 * @returns {*} the errorModal DOM element
 * @private
 */
function _getErrorModal() {
  return d3.select('#errorModal');
}

/**
 * Shows the errorModal containing the provided message.
 * can be made without conflicts.
 * @param message {string} the message which should be shown in the modal
 * @private
 */
function _showErrorModal(message) {
  _getErrorModal().text(message).style('visibility', 'visible');
}

/**
 * Hides the errorModal.
 * @private
 */
function _hideErrorModal() {
  _getErrorModal().style('visibility', 'hidden');
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
  conflictModal.html(
    `<p class="has-text-centered">Conflicts detected while rebasing "${rebaseBranch}" (project "${rebaseRepo}") onto "${upstreamBranch}" (project "${upstreamRepo}").</p>`
  );

  // appends the commit section to the modal
  _createCommitsSection(commitsOfRebase);

  // appends the conflict cards to the modal
  _createConflictsCardSection(conflictDatas);

  // show the conflict modal
  _getConflictModal().style('visibility', 'visible');
}

/**
 * Sets up and shows the files of a rebase containing conflicting code
 * in expandable and shrinkable cards. The conflicts are highlighted.
 * @param checkCherryPick {*} the conflict information from the cherry pick(s)
 * @private
 */
function _showCherryPickConflictModal(checkCherryPick) {
  const { toRepo, toBranch, conflictDatas, cherryPickCommitInfos } = checkCherryPick;

  // modal which should show the conflict data
  const conflictModal = _getConflictModal();

  // create the header of the modal
  conflictModal.html(
    `<p class="has-text-centered">Conflicts detected while cherry picking the selected commits onto "${toBranch}" (project "${toRepo}").</p>`
  );

  // appends the commit section to the modal
  _createCommitsSection(cherryPickCommitInfos);

  // appends the conflict cards to the modal
  _createConflictsCardSection(conflictDatas);

  // show the conflict modal
  _getConflictModal().style('visibility', 'visible');
}

/**
 * Sets up and shows the files of a merge containing conflicting code
 * in expandable and shrinkable cards. The conflicts are highlighted.
 * @param checkMerge {*} the conflict information from the merge
 * @private
 */
function _showMergeConflictModal(checkMerge, branchesHeadShas, commits) {
  const { fromRepo, fromBranch, toRepo, toBranch, conflictDatas } = checkMerge;

  // retrieve the authors of the commits that belong to the merge
  // these commits are all commits which have exactly one reference of the branches of the merge
  // if the commit has no reference of either branch, it does not belong to the merge (this is a commit of a separate branch)
  // if the commit has a reference to each branch, it is already merged and also do not belong to the merge
  let headShaFromBranch;
  let headShaToBranch;
  let authors = [];

  // get the heads of the merges branches
  branchesHeadShas.forEach((valueBranches, shaKey) => {
    valueBranches.forEach((valueBranchInfos, branchName) => {
      if (fromBranch === branchName && valueBranchInfos.projects.includes(fromRepo)) {
        headShaFromBranch = commits.filter((commit) => commit.sha === shaKey)[0];
      }

      if (toBranch === branchName && valueBranchInfos.projects.includes(toRepo)) {
        headShaToBranch = commits.filter((commit) => commit.sha === shaKey)[0];
      }
    });
  });

  _getAuthorsForMergeConflict(headShaFromBranch, toBranch, toRepo, commits, authors);
  _getAuthorsForMergeConflict(headShaToBranch, fromBranch, fromRepo, commits, authors);

  // modal which should show the conflict data
  let conflictModal = _getConflictModal();

  // create the header of the modal containing a message which merge was checked
  conflictModal.html(`
    <p class="has-text-centered">Conflicts detected while merging "${fromBranch}" (project "${fromRepo}") into "${toBranch}" (project "${toRepo}").</p> 
  `);

  // add shrinkable authors card section
  conflictModal.html(
    conflictModal.html() +
      `<div class="card is-fullwidth">
         <header id="authorsCardHeader" class="card-header">
           <p class="card-header-title">Authors</p>
           <a class="card-header-icon card-toggle">
            <i id="authorsCardArrow" class="fa fa-angle-up"></i>
           </a>
         </header>
         <div id="authorsCardContent" class="card-content" style="white-space: pre-wrap">${authors
           .map((author) => author.replace(/</g, '&lt').replace(/>/g, '&gt'))
           .join('\n')}</div>
       </div>
        <br />`
  );

  // appends the conflict cards to the modal
  _createConflictsCardSection(conflictDatas);

  // show the conflict modal
  _getConflictModal().style('visibility', 'visible');

  d3.select('#authorsCardHeader').on('click', () =>
    _toggleCardContentVisibility('authorsCardContent', 'authorsCardArrow')
  );
}

/**
 * Saves all (distinct) authors of all parent commits of currentCommit (inclusive), until the parents have a specific branch of a specific project.
 * @param currentCommit {*} the commit from which the author should be added to the list (if requirements meet)
 * @param untilHasBranch {string} the specific branch
 * @param untilHasProject {string} the specific commit
 * @param commits {[*]} list of all commits
 * @param authors {[string]} distict list of autors of the selected commits
 * @private
 */
function _getAuthorsForMergeConflict(
  currentCommit,
  untilHasBranch,
  untilHasProject,
  commits,
  authors
) {
  // commit doesn't has branch and project
  if (
    !(
      currentCommit.branches.map((branch) => branch.branchName).includes(untilHasBranch) &&
      currentCommit.projects.includes(untilHasProject)
    )
  ) {
    // add commits author if not in array
    if (!authors.includes(currentCommit.author)) {
      authors.push(currentCommit.author);
    }

    // repeat for all parents
    currentCommit.parents.forEach((parent) => {
      const parentCommit = commits.filter((commit) => commit.sha === parent.sha)[0];
      _getAuthorsForMergeConflict(parentCommit, untilHasBranch, untilHasProject, commits, authors);
    });
  }
}

/**
 * Closes the Modal which shows the conflict and resets the rebaseCheck object in the state.
 * @param prevProps {*} the props
 * @private
 */
function _resetRebaseCheckAndHideModal(prevProps) {
  const conflictModal = _getConflictModal();
  conflictModal.style('visibility', 'hidden');
  prevProps.onResetStateProperty('rebaseCheck');
}

/**
 * Closes the Modal which shows the conflict and resets the mergeCheck object in the state.
 * @param prevProps {*} the props
 * @private
 */
function _resetMergeCheckAndHideModal(prevProps) {
  const conflictModal = _getConflictModal();
  conflictModal.style('visibility', 'hidden');
  prevProps.onResetStateProperty('mergeCheck');
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
 * Appends the commit section to the conflictModal which shows which commits are processed.
 * @param commits [] commit array
 * @private
 */
function _createCommitsSection(commits) {
  const conflictModal = _getConflictModal();
  let commitSectionHtml = `
    <p><b>Commits:</b></p>
    <ul style="height: 150px; overflow: hidden; overflow-y: scroll;">
    `;

  // add the commits to the header with the information if they were successful,
  // resulted in a conflict or were not checked due to the previous conflict
  commits.forEach((commit) => {
    commitSectionHtml =
      commitSectionHtml +
      `<li>${commit.sha} (${commit.author.replace(/</g, '&lt').replace(/>/g, '&gt')}) - ${
        commit.conflictText
      }</li>`;
  });

  // close the commit list and set the html in the modal
  // the whole header html must be set, because otherwise the first <ul>
  // will automatically closed by the html() function to provide a valid HTML
  commitSectionHtml = commitSectionHtml + '</ul><br />';
  conflictModal.html(conflictModal.html() + commitSectionHtml);
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
 * Add Modals to the DOM for diffs, rebase/merge/cherry pick checks and general error messages.
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

  _appendBasicModalToSelector('#modalContainer')
    .style('background-color', 'darksalmon')
    .attr('id', 'errorModal');
}

/**
 * Hide diffModal, successModal and conflictModal when pressing esc
 * or clicking on the "root" element.
 * @param prevProps the props
 * @private
 */
function _hideModalsOnClickOutside(prevProps) {
  const diffModal = _getDiffModal();
  const successModal = _getSuccessModal();
  const conflictModal = _getConflictModal();
  const errorModal = _getErrorModal();

  // hide modals when svg is clicked
  d3.select('#root').on('click', () => {
    // hide diffModal if visible
    if (_isVisible(diffModal)) {
      _resetDiffAndHideModal(prevProps);
    }

    // hide successModal if visible
    if (_isVisible(successModal)) {
      _hideSuccessModal();
    }

    // hide conflictModal if visible
    if (_isVisible(conflictModal)) {
      _resetRebaseCheckAndHideModal(prevProps);
      _resetMergeCheckAndHideModal(prevProps);
    }

    // hide errorModal if visible
    if (_isVisible(errorModal)) {
      _hideErrorModal();
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

/**
 * Returns a list of collapsed sections which are all expanded.
 * (each commit will have an own collapsed section with an empty node list)
 * @param commits {[]} list of all commits
 * @returns {[]|undefined} the expanded collapsed sections or undefined, if the commits are not retrieved
 */
function _createExpandedCollapsedSections(commits) {
  let collapsedSections = [];

  // the commits are already retrieved
  if (commits) {
    // create a collapsed section for each commit
    commits.forEach((commit) => {
      let commitClone = _.assign({}, commit);
      // the commit has children -> create a collapsed section for each child (parent will be the same node on each section)
      if (commitClone.children.length > 0) {
        commitClone.children.forEach((childSha) => {
          const child = commits.filter((__commit) => __commit.sha === childSha.sha)[0];
          // it is possible that the child will point to a commit which is in a fork that is currently not showing
          // therefore this check is necessary
          if (child) {
            const childClone = _.assign({}, child);
            collapsedSections.push({
              parent: commitClone,
              nodes: [],
              child: childClone,
            });
          }
        });
      } else {
        // commit is a leaf and has no child
        collapsedSections.push({
          parent: commitClone,
          nodes: [],
          child: null,
        });
      }
    });

    return collapsedSections;
  } else {
    return undefined;
  }
}

/**
 * Returns a list of collapsed sections which are all compacted.
 * (each commit which has only one child and one parent, is not a leaf or
 * is not a head of a branch will be in a compacted node)
 * @param props the props
 * @param branchesHeadShas {Map<any, any>} map of the head shas of the branches and their projects
 * @returns {[]} the compacted collapsed sections
 */
function _createCompactedCollapsedSections(props, branchesHeadShas) {
  if (props.commits && branchesHeadShas) {
    const commitClones = _.cloneDeep(props.commits);
    let collapsedSections = [];

    // get all the branching nodes (nodes which have multiple parents, multiple children
    // or nodes which are heads of branches)
    // these nodes should not be compacted and will be the borders for the collapsed sections
    // if the filterAuthor and filterCommit is set with the show only option, these node will also
    // be included to preserve the basic git history
    let fromCommitShas = commitClones.filter(
      (commit) =>
        commit.parents.length !== 1 ||
        commit.children.length !== 1 ||
        branchesHeadShas.has(commit.sha) ||
        (props.filterAuthor.showOnly &&
          props.filterAuthor.author &&
          props.filterAuthor.author === commit.author) ||
        (props.filterCommitter.showOnly &&
          props.filterCommitter.committer &&
          props.filterCommitter.committer === commit.signature)
    );

    // for each branching node, create a collapsed section
    fromCommitShas.forEach((commit) => {
      // the node has one child which is also a branching node
      // -> no commits will be compacted
      if (
        commit.children.length === 1 &&
        fromCommitShas.filter((_commit) => _commit.sha === commit.children[0]).length > 0
      ) {
        // get the child
        const commitChild = commitClones.filter(
          (_commit) => _commit.sha === commit.children[0].sha
        )[0];

        // add the simple collapsed sections to the list
        collapsedSections.push({
          parent: commit,
          nodes: [],
          child: commitChild,
        });
      }
      // the nodes has one child which is not a branching node
      else if (
        commit.children.length === 1 &&
        fromCommitShas.filter((_commit) => _commit.sha === commit.children[0]).length === 0
      ) {
        // get the child
        const commitChild = commitClones.filter(
          (_commit) => _commit.sha === commit.children[0].sha
        )[0];

        // get the nodes between the current branching node and the next one (in child path)
        const nodes = [];
        const jsonChild = _getCommitSection(commitChild, nodes, fromCommitShas, commitClones);

        // add the collapsed section with the calculated nodes and last child to the list
        collapsedSections.push({
          parent: commit,
          nodes,
          child: jsonChild,
        });
      }
      // the node has multiple children
      else if (commit.children.length > 1) {
        // get the child commits
        const children = commitClones.filter((_commit) =>
          commit.children.map((obj) => obj.sha).includes(_commit.sha)
        );

        // create a collapsed section with each child
        children.forEach((child) => {
          // the child commit has no further children -> no compacting needed
          if (child.children.length === 0) {
            collapsedSections.push({
              parent: commit,
              nodes: [],
              child,
            });
          }
          // the child has one child which is also a branching node
          else if (
            child.children.length === 1 &&
            fromCommitShas.filter((__commit) => __commit.sha === child.children[0]).length > 0
          ) {
            // get the child commit of child
            const childOfChild = fromCommitShas.filter(
              (__commit) => __commit.sha === child.children[0]
            )[0];

            // put the collapsed section with the single node to the list
            collapsedSections.push({
              parent: commit,
              nodes: [child],
              child: childOfChild,
            });
          }
          // the child has one commit which is not a branching node
          else if (
            child.children.length === 1 &&
            fromCommitShas.filter((__commit) => __commit.sha === child.children[0]).length === 0
          ) {
            // get all the nodes which should be collapsed and the last child for the collapsed section
            // and put it into the list
            const nodes = [];
            const jsonChild = _getCommitSection(child, nodes, fromCommitShas, commitClones);
            collapsedSections.push({
              parent: commit,
              nodes,
              child: jsonChild,
            });
          }
        });
      }
      // the child has no children (is a leaf)
      // -> put the collapsed section with no nodes and no child in the list
      else if (commit.children.length === 0) {
        collapsedSections.push({
          parent: commit,
          nodes: [],
          child: null,
        });
      }
    });

    return collapsedSections;
  } else {
    return undefined;
  }
}

/**
 * Expands a compacted node and updates the collapsedSections in the state accordingly.
 * @param props
 * @private
 */
function _expandCompactedNode(props) {
  if (props.nodeToExpand) {
    let collapsedSections = _.assign([], props.collapsedSections);

    // get the collapsedSection which should be expanded
    const collapsedNode = collapsedSections.filter(
      (node) =>
        node.parent.sha === props.nodeToExpand.parentSha &&
        node.child.sha === props.nodeToExpand.childSha
    )[0];
    if (collapsedNode) {
      // remove the collapsed node from the collapsed section,
      // because it will be replaced with the commits that the node compacted
      collapsedSections.splice(collapsedSections.indexOf(collapsedNode), 1);

      // get the parent and the first compacted node
      let parent = collapsedNode.parent;
      let child = collapsedNode.nodes[0];

      // for every compacted node, add an own collapsed section to the list
      for (let i = 0; i < collapsedNode.nodes.length; i++) {
        collapsedSections.push({
          parent,
          nodes: [],
          child,
        });

        // there is another node in the compacted node list -> set it as the next child
        if (collapsedNode.nodes[i + 1]) {
          child = collapsedNode.nodes[i + 1];
        }
        // the current child is the last one of the compacted node list
        // set the collapsedNode child as the next child
        else {
          child = collapsedNode.child;
        }

        // update the parent with the current node of the compacted list
        parent = collapsedNode.nodes[i];
      }

      // add last node, because for loop will end before
      collapsedSections.push({
        parent,
        nodes: [],
        child,
      });

      // reset the nodeToExpand in the state
      props.onExpandCollapsedNode(undefined);
      // update the collapsedSections in the state
      props.onSetCollapsedSections(collapsedSections);
    }
  }
}

/**
 * Collapses a expanded section of commits and
 * updates the collapsedSections in the state accordingly.
 * If the selected node is a branching node, all its child paths will be compacted.
 * @param props
 * @private
 */
function _compactExpandedSection(props) {
  if (props.nodeToCompactSection) {
    let clonedCollapsedSections = _.cloneDeep(props.collapsedSections);
    let nodes = [];

    // get collapsed node which has nodeToCompactSection as parent or in nodes
    let nodeToCompactSectionCommit = _.cloneDeep(
      props.commits.filter((commit) => commit.sha === props.nodeToCompactSection)[0]
    );

    // get the collapsed section where the selected node is the parent
    let collapsedSection = _.cloneDeep(
      clonedCollapsedSections.filter(
        (collapsedSection) => collapsedSection.parent.sha === props.nodeToCompactSection
      )[0]
    );

    // if the selected node is a branching node, compact all their outgoing paths
    if (collapsedSection.parent.children.length > 1 || collapsedSection.parent.parents.length > 1) {
      collapsedSection.parent.children.forEach((childSha) => {
        // get the first child
        let child = _.cloneDeep(props.commits.filter((commit) => commit.sha === childSha.sha)[0]);

        // child can be from another project which is not shown in the graph, therefore the check is needed
        if (child) {
          // get all the other following children
          child = _fillNodesWithChildrenAndRemoveThemFromCollapsedSections(
            _.cloneDeep(child),
            nodes,
            clonedCollapsedSections,
            props
          );

          // set the node combination for a compacted section
          clonedCollapsedSections.push({
            parent: nodeToCompactSectionCommit,
            nodes,
            child,
          });
        }

        // reset the nodes for the next child
        nodes = [];
      });
    }
    // the node is no branching node
    // -> get all parents and children until a branching node occurs and compact these
    else {
      nodes.push(nodeToCompactSectionCommit);
      // get all parents until one parent has multiple children or multiple parents
      const parent = _fillNodesWithParentsAndRemoveThemFromCollapsedSections(
        nodeToCompactSectionCommit,
        nodes,
        clonedCollapsedSections,
        props
      );

      // get all children until one children has no children, has multiple children or has multiple parents
      // get the first child
      let child = _.cloneDeep(
        props.commits.filter(
          (commit) => commit.sha === nodeToCompactSectionCommit.children[0].sha
        )[0]
      );

      // get all the other following children
      child = _fillNodesWithChildrenAndRemoveThemFromCollapsedSections(
        child,
        nodes,
        clonedCollapsedSections,
        props
      );

      // set the node combination for a compacted section
      clonedCollapsedSections.push({
        parent,
        nodes,
        child,
      });
    }
    props.onSetNodeToCompactSection(undefined);
    props.onSetCollapsedSections(clonedCollapsedSections);
  }
}

/**
 * Gets all parents until one parent has multiple children or multiple parents.
 * The parents will be added in the correct order to the nodes-array and
 * the corresponding collapsedSections of these nodes will be removed from the clonedCollapsedSections.
 * @param nodeToCompactSectionCommit {*} the commit from which the command to compact the section was triggered
 * @param nodes {[]} array of commits where the parents should be inserted
 * @param clonedCollapsedSections {[]} the current list of collapsed sections
 * @param props the props
 * @private
 */
function _fillNodesWithParentsAndRemoveThemFromCollapsedSections(
  nodeToCompactSectionCommit,
  nodes,
  clonedCollapsedSections,
  props
) {
  // get the first parent
  let parent = _.cloneDeep(
    props.commits.filter((commit) => commit.sha === nodeToCompactSectionCommit.parents[0].sha)[0]
  );

  // get all further parents until one parent has multiple children or multiple parents
  while (parent.parents.length === 1 && parent.children.length === 1) {
    // add the parent at the beginning of the nodes array
    nodes.unshift(parent);

    // remove the single collapsedSection of the parent from the list, will be in the collapsed section
    let parentCollapsedSection = clonedCollapsedSections.filter(
      (section) => section.parent.sha === parent.sha
    )[0];
    clonedCollapsedSections.splice(clonedCollapsedSections.indexOf(parentCollapsedSection), 1);

    // set next parent
    parent = _.cloneDeep(props.commits.filter((commit) => commit.sha === parent.parents[0].sha)[0]);
  }

  return parent;
}

/**
 * Gets all parents until one parent has multiple children or multiple parents.
 * The parents will be added in the correct order to the nodes-array and
 * the corresponding collapsedSections of these nodes will be removed from the clonedCollapsedSections.
 * @param child {*} the first child of the commit from which the command to compact the section was triggered
 * @param nodes {[]} array of commits where the parents should be inserted
 * @param clonedCollapsedSections {[]} the current list of collapsed sections
 * @param props the props
 * @private
 */
function _fillNodesWithChildrenAndRemoveThemFromCollapsedSections(
  child,
  nodes,
  clonedCollapsedSections,
  props
) {
  // get all further children until one children has no children, has multiple children or
  // has multiple parents
  while (child.parents.length === 1 && child.children.length === 1) {
    // add node at the end of the nodes array
    nodes.push(child);

    // remove the single collapsedSection of the child from the list, will be in the collapsed section
    let childCollapsedSection = clonedCollapsedSections.filter(
      (section) => section.child && section.child.sha === child.sha
    )[0];
    clonedCollapsedSections.splice(clonedCollapsedSections.indexOf(childCollapsedSection), 1);

    child = props.commits.filter(
      (commit) => child.children.length > 0 && commit.sha === child.children[0].sha
    )[0];
  }

  // remove the single collapsedSection of the child from the list, will be in the collapsed section
  // is necessary because the while loop does not remove the single collapsed section of last node in nodes
  let childCollapsedSection = clonedCollapsedSections.filter(
    (section) => section.child && section.child.sha === child.sha
  )[0];
  clonedCollapsedSections.splice(clonedCollapsedSections.indexOf(childCollapsedSection), 1);

  return child;
}

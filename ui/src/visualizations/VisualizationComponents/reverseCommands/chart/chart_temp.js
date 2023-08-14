'use strict';

import Graph from 'react-graph-vis';
import React from 'react';
import dagre from 'dagre';
import graphlib from '@dagrejs/graphlib';
import styles from '../styles.scss';

export default class ReverseCommands extends React.Component {
  constructor(props) {
    super(props);
    // this.filterCommits(this.props.commits,'feature/20');

    this.state = {
      branch: 'main',
      clickedNode: null,
      clickedCommitInfo: null,
      popupVisible: false,
    };
  }

  render() {
    if (this.props.filteredCommits.length > 0) {
      const nodes = [];
      const edges = [];

      this.props.filteredCommits.forEach((commit) => {
        nodes.push({ id: commit.sha, label: ' ' });
        if (commit.parent !== null) {
          edges.push({ from: commit.parents, to: commit.sha });
        }
      });

      const graph = { nodes: nodes, edges: edges };

      const options = {
        layout: {
          hierarchical: {
            direction: 'LR',
          }
        },
        edges: {
          color: "#000000"
        },
        height: "500px"
      };

      const events = {
        select: function(event) {
          var { nodes, edges } = event;
        },
        click: event => {
          if (event.nodes.length === 1) {
            console.log(event);
            const clickedNodeId = event.nodes[0];
            this.handleNodeClick(clickedNodeId); // Update the state
          }
        }
      };
      return (
        <div className={styles.chartContainer}>
          <div className={styles.chartLine}>
            <Graph
              graph={graph}
              options={options}
              events={events}
              getNetwork={network => {
                //  if you want access to vis.js network api you can set the state in a parent component using this property
              }}
            />
            {this.state.popupVisible && this.state.clickedNode && (
             this.getCommitInfos()
            )}
          </div>
        </div>
      );
    } else {
      const chart = (
        <div>
          Fallback :)
        </div>
      );
    }
  }

  handleNodeClick = nodeId => {
    // Update the state to the clicked node ID
    this.setState({    popupVisible: false});
    this.setState({ clickedNode: nodeId });
    this.setCommitInfos(nodeId);
    this.setState({    popupVisible: true});
  };

  setCommitInfos( nodeId ) {
    const commitInfo = this.props.filteredCommits.find((commit) => commit.sha === nodeId);
    this.setState({ clickedCommitInfo: commitInfo });
    console.log(this.state.clickedCommitInfo);
  }

  getCommitInfos() {
    const commit = this.state.clickedCommitInfo;
    return (
      <div
        className="popup"
        style={{
          position: 'absolute',
          top: `${this.state.clickedNode.y}px`,
          left: `${this.state.clickedNode.x}px`,
        }}
      >
        <div className={styles.commitHeading}>
          Commit-Summary:
        </div>
        <br/>
        <b>SHA:</b> {commit.sha} <br/>
        <b>Author:</b> {commit.signature} <br/>
        <b>Branch:</b> {commit.branch} <br/> <br/>
        <b>Message:</b> {commit.message} <br/>
      </div>
    );
  }
}

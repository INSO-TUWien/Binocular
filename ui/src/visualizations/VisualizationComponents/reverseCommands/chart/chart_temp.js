'use strict';

import Graph from 'react-graph-vis';
import React from 'react';
import styles from '../styles.scss';
import { generateTestGraph } from './helper.js';


export default class ReverseCommands extends React.Component {
  constructor(props) {
    super(props);
    // this.filterCommits(this.props.commits,'feature/20');

    const initGraph = generateTestGraph();

    const options = {
      layout: {
        hierarchical: {
          direction: 'LR',
        }
      },
      edges: {
        color: "#000000"
      },
      height: "500px",
    };

    this.state = {
      branch: 'main',
      clickedNode: null,
      clickedCommitInfo: null,
      popupVisible: false,
      graph: initGraph,
      testProp: false,
      options: options,
    };
  }

  render() {
    //if (this.props.filteredCommits.length > 0 ) {
    if (true) {
        const nodes = [];
        const edges = [];

        /*this.props.filteredCommits.forEach((commit) => {
          nodes.push({ id: commit.sha, label: ' ' });
          if (commit.parents !== null) {
            commit.parents.split(',').forEach((parent) =>
              edges.push({ from: parent, to: commit.sha })
            );
          }
        });

        const graph = { nodes: nodes, edges: edges };
        const graph = this.generateTestGraph();
        this.state.graph = graph;*/

        const events = {
          select: function(event) {
            var { nodes, edges } = event;
          },
          click: event => {
            if (event.nodes.length === 1) {
              console.log(event);
              const clickedNodeId = event.nodes[0];
              this.handleNodeClick2(clickedNodeId, nodes, edges); // Update the state
            }
          }
        };
        return (
          <div className={styles.chartContainer}>
            <div className={styles.chartLine}>
              <button onClick={this.handleNodeClick}>Add Node</button>
              <Graph
                graph={this.state.graph}
                options={this.state.options}
                events={events}
                getNetwork={network => {
                  //  if you want access to vis.js network api you can set the state in a parent component using this property
                }}
              />
              { this.state.popupVisible && this.state.clickedNode  (
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

        return chart;
      }
  }

  handleNodeClick1 = (nodeId, nodes, edges) => {
    // Update the state to the clicked node ID
    this.setState({ clickedNode: nodeId });
    /*this.setState({    popupVisible: false});tes
    this.setCommitInfos(nodeId);
    this.setState({    popupVisible: true});*/

    // Adding Head Node:
    console.log('before pushing: ', this.state.graph.nodes.length);
    const newNode = { id: 'head', label: 'head' };
    const newEdge = { from: nodeId, to: 'head' };
    var nodesCopy = this.state.graph.nodes.slice(); // this will create a copy with the same items
    nodesCopy.push({id: 'head', label: '2'});
    console.log('nodes length: ', this.state.graph);
    console.log('node copy length: ', nodesCopy.length);
    const graph = {nodes: nodesCopy, edges: []};
    this.setState( {graph : graph});
    console.log('after state setting: ', this.state.graph);
    console.log('before state setting: ', this.state.testProp);
    this.setState({    testProp: true});
    console.log('before state setting: ', this.state.testProp);

  };

  handleNodeClick2 = (nodeId, nodes, edges) => {
    // Update the state to the clicked node ID
    this.setState({ clickedNode: nodeId });
    /*this.setState({    popupVisible: false});tes
    this.setCommitInfos(nodeId);
    this.setState({    popupVisible: true});*/

    // Adding Head Node:
    console.log('current Node: ', nodeId);

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
        <b>Date-Time:</b> {commit.date} <br/>
      </div>
    );
  }

  handleNodeClick = () => {
    // Add a new node and edge when a node is clicked
    const { nodes, edges } = this.state.graph;
    const newNodeId = 'HEAD';
    const newEdge = { from: 15, to: 'HEAD' };

    const options = {
      edges: {
        color: "#000000"
      },
      height: "500px",

    };

    this.setState({
      graph: {
        nodes: [...nodes, { id: newNodeId, label: newNodeId, layout: {}, physics: false, fixed: false}],
        edges: [...edges],
      },
    });

    console.log('before state setting: ', this.state.options);

    this.setState({
      options: options,
    });

    console.log('before state setting: ', this.state.options);

    this.setState({});

  };
}

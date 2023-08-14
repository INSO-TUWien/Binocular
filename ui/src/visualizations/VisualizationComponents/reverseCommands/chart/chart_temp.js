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
    };
  }

  render() {
    if (this.props.filteredCommits.length > 0) {
      /*const graph = {
        nodes: [
          { id: 1, label: "Node 1", title: "node 1 tootip text" },
          { id: 2, label: "Node 2", title: "node 2 tootip text" },
          { id: 3, label: "Node 3", title: "node 3 tootip text" },
          { id: 4, label: "Node 4", title: "node 4 tootip text" },
          { id: 5, label: "Node 5", title: "node 5 tootip text" }
        ],
        edges: [
          { from: 1, to: 2 },
          { from: 1, to: 3 },
          { from: 2, to: 4 },
          { from: 2, to: 5 }
        ]
      };*/

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
          </div>
        </div>
      );

      /*const g = new graphlib.Graph();
      const nodes = [];
      const edges = [];

      this.props.filteredCommits.forEach((commit) => {
        nodes.push({ id: commit.sha, label: commit.sha });
        edges.push({ from: commit.parent, to: commit.id });
      });

      dagre.layout(g);

      const graph = {
        nodes,
        edges,
      };

      const options = {
        layout: {
          hierarchical: true,
        },
      }; */

      //return <Graph graph={graph} options={options} />;
      /*const commits = this.props.filteredCommits;
      if(commits.length > 0) {
        console.log('println ',commits[0]);
      } else {
        console.log(':(');
      }*/

      const chart = (
        <div>
          <Graph graph={graph} options={options} />
        </div>
      );

      return chart;
    } else {
      const chart = (
        <div>
          Fallback :)
        </div>
      );
    }
  }

  filterCommits(commits, branchName) {
    const filtered = commits[0].filter((commit) => commit.branch === branchName);
    console.log(filtered);
    return filtered;
  }

  drawNode() {
    // Implement your circle drawing logic here
    // You might use SVG <circle> element or other methods
    return (
      <svg width="100" height="100">
        <circle cx="50" cy="50" r="40" stroke="black" strokeWidth="2" fill="red" />
      </svg>
    );
  }
  buildGraph(g, nodes, edges) {

  }

  drawConnection(node,commits) {

  }

}

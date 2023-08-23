'use strict';

import React from 'react';
import { Stage, Layer, Circle, Arrow, Line } from 'react-konva';
import { generateKonvaGraph, generateSimpleGraph } from './helper.js';
import { layoutGraph } from './d3_graph_simulation.js';
import styles from '../styles.scss';

export default class ReverseCommands extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      graph_konva: this.generateDAG(1000,300),
      isDrawingLine: false,
      startLinePoint: { x: 0, y: 0 },
      endLinePoint: { x: 0, y: 0 },
      graph: null,
      selectedBranches: [],
    };

    this.stageRef = React.createRef();
  }

  async componentDidMount() {
    this.generateDAG(1000,300);
    /*const graph = generateSimpleGraph();
    const simulation = layoutGraph(graph);
    try {
      const graph = generateSimpleGraph();
      const sim_graph = await layoutGraph(graph);
      this.setState({ graph_konva: sim_graph });
      console.log('im done', graph);
    } catch (error) {
      console.log('something bad happened!');
      console.log(error);
    }*/
  }

  render() {
    return (
      <div className={styles.chartContainer}>
        <Stage ref={this.stageRef} width={window.innerWidth} height={window.innerHeight} onMouseUp={this.handleStageMouseUp}
        >
          <Layer>
            {this.state.graph_konva.nodes.map((node) => (
              <Circle
                key={node.index}
                id={node.index}
                x={node.x}
                y={node.y}
                radius={10}
                fill="red"
                onClick={() => this.handleCircleClick(node)} // Add this line
                onMouseEnter={() => this.handleCircleMouseEnter(node.id)} // Add hover event handler
                onMouseLeave={this.handleCircleMouseLeave} // Add mouse leave event handler
                stroke={
                  this.state.hoveredCircleIndex === node.id ? 'yellow' : null
                } // Conditionally add stroke color for hover effect
                strokeWidth={1}
              />
            ))}
            {this.state.graph_konva.edges.map((edge) => {
              const fromNode = this.state.graph_konva.nodes.find((node) => node.id === edge.from);
              const toNode = this.state.graph_konva.nodes.find((node) => node.id === edge.to);

              if (fromNode && toNode) {
                return (
                  <Line
                    points={[fromNode.x, fromNode.y, toNode.x, toNode.y]}
                    stroke="black"
                    strokeWidth={2}
                  />
                );
              }

              return null; // Handle the case where nodes for the edge are not found
            })}
            {this.state.isDrawingLine && (
              <Arrow
                points={[
                  this.state.startLinePoint.x,
                  this.state.startLinePoint.y,
                  this.state.endLinePoint.x,
                  this.state.endLinePoint.y,
                ]}
                stroke="black"
                strokeWidth={2}
              />
            )}
          </Layer>
        </Stage>
      </div>
    );
  }

  handleCircleClick(node) {
    console.log(`Circle with ID ${node.id} was clicked.`);

    if(!this.state.isDrawingLine) {
      this.setState({
        isDrawingLine: true,
        startLinePoint: { x: node.x, y: node.y },
      });

      this.stageRef.current.addEventListener('mousemove', this.handleMouseMove);
    } else {
      console.log('wanna merge?');
    }
  }

  handleMouseMove = (e) => {
    const stage = this.stageRef.current;
    const mousePos = stage.getPointerPosition();

    this.setState({
      endLinePoint: { x: mousePos.x, y: mousePos.y },
    });
  };

  handleStageMouseUp = () => {
    this.setState({
      isDrawingLine: false,
    });

    this.stageRef.current.removeEventListener('mousemove', this.handleMouseMove);
  };

  handleCircleMouseEnter = (circleIndex) => {
    this.setState({
      hoveredCircleIndex: circleIndex,
    });
  };

  handleCircleMouseLeave = () => {
    this.setState({
      hoveredCircleIndex: null,
    });
  };

  generateDAG( width, height) {
    // values i want to know
    const steps_x = 25;
    const steps_y = 50;

    const buffer_y = 300;
    const buffer_x = 100;
    const nodes = [];
    const edges = [];

    // Use reduce() to organize commits by branch
    const organizedCommits = this.props.filteredCommits.reduce((result, commit) => {
      const branch = commit.branch;

      if (!result[branch]) {
        result[branch] = [];
      }

      result[branch].push(commit);

      return result;
    }, {});

    console.log('dag infos');
    console.log(organizedCommits);

    const branchNames = Object.keys(organizedCommits);
    const numBranches = branchNames.length;
    console.log('numbranch',numBranches);

    const heights = branchNames.map((branch, index) => ({
      name: branch,
      height: (height / numBranches) * index + buffer_y,
    }));

    console.log('widths:',heights);
    ////////////////////////////////// - Parents
    const crossBranchParents = [];
    this.props.filteredCommits.forEach((commit) => {
      if (commit.parents !== null) {
        commit.parents.split(',').forEach((parent) => {
          const parentCommit = this.props.filteredCommits.find(c => c.sha === parent);

          if (parentCommit && parentCommit.branch === commit.branch) {
            edges.push({ from: parent, to: commit.sha });
          } else if (parentCommit) {
            crossBranchParents.push({ from: parent, to: commit.sha });
          }
        });
      }
    });
    console.log('edges: ', edges);
    console.log('crossParent: ', crossBranchParents);
    ////////////////////////////////// - Node Creation
    const nodesData = [];

    branchNames.forEach((branch, branchIndex) => {
      const branchCommits = organizedCommits[branch];
      const branchHeights = heights.find( (pair) => pair.name === branch)?.height;

      branchCommits.forEach((commit, commitIndex) => {
        const parentCommit = crossBranchParents.find(c => c.to === commit.sha);
        console.log('found cross parent', parentCommit);

        const parentNode = nodesData.find(node => node.id === parentCommit?.from);
        const parentX = parentNode ? parentNode.x : 0;

        const node = {
          id: commit.sha,
          label: `Commit ${ commit.sha}`,
          x: parentCommit ? parentX + steps_x : steps_x * commitIndex + buffer_x,
          y: branchHeights, // You can adjust the y-coordinate as needed
        };
        nodesData.push(node);
      });
    });

    console.log('nodes:', nodesData);
    const graph = { nodes: nodesData, edges: [...edges,...crossBranchParents]};
    console.log('graph:', graph);

    return graph;
  }
}

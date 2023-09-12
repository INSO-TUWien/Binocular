'use strict';

import React from 'react';
import { Stage, Layer, Circle, Arrow, Line, Text, Wedge, Rect } from 'react-konva';
import styles from '../styles.scss';
import * as eventHandlers from  './eventHandlers';
import BranchAwayModal from '../modals/BranchAway';
import CheckoutModal from '../modals/SwitchBranch';
import MergeModal from '../modals/MergeOrRebaseBranch';


export default class ReverseCommands extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      graph_konva: this.generateDAG(1000, 300),
      isDrawingLine: false,
      startLinePoint: { x: 0, y: 0 },
      endLinePoint: { x: 0, y: 0 },
      selectedBranches: [],
      scale: 1,
      isModalOpen: false,
      checkedOutBranch: null,
      selectedBranch: null,
      checkoutPointer: null,
      isBranchAwayModalOpen: false,
      originNode: null,
      branchName: "",
      isModalOpenMerge: false,
      targetNode: null,
      isModalOpenSquash: false,
      commitSummaryModal: false,
      hoveredCircleIndex: false,
    };

    this.stageRef = React.createRef();
  }

  async componentDidMount() {
    this.setState({ graph_konva: this.generateDAG(1000, 300) });
  }

  componentDidUpdate(prevProps) {
    if (this.props.filteredCommits !== prevProps.filteredCommits) {
      this.setState({ graph_konva: this.generateDAG(1000, 300) });
    }
  }

  render() {

    const controlPoint = {
      x: (this.state.startLinePoint.x + this.state.endLinePoint.x) / 2,
      y: ((this.state.startLinePoint.y + this.state.endLinePoint.y) / 2) + -40
    }; // Adjust the y value to control the curvature

    return (
      <div className={styles.chartContainer}>
        <Stage
          ref={this.stageRef}
          width={window.innerWidth}
          height={window.innerHeight}
          onMouseUp={() => eventHandlers.handleStageMouseUp(this)}
          onWheel={(e) => eventHandlers.handleWheel(e, this)}
          onMouseMove={() => eventHandlers.handleMouseMove(this)}
          onClick={(e) => eventHandlers.handleMouseClick(e, this)}
          scaleX={this.state.scale}
          scaleY={this.state.scale}
          draggable
        >
          <Layer>
            {this.state.isDrawingLine && (
              <Arrow
                points={[
                  this.state.startLinePoint.x,
                  this.state.startLinePoint.y,
                  controlPoint.x,
                  controlPoint.y,
                  this.state.endLinePoint.x,
                  this.state.endLinePoint.y,
                ]}
                stroke="black"
                strokeWidth={2}
                tension={0.5}
              />
            )}
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
            {this.state.graph_konva.nodes.map((node) => (
              <Circle
                key={node.index}
                id={node.index}
                x={node.x}
                y={node.y}
                radius={10}
                fill={node.color}
                onClick={() => eventHandlers.handleCircleClick(node, this)} // Add this line
                onMouseEnter={() => eventHandlers.handleCircleMouseEnter(node, this)} // Add hover event handler
                onMouseLeave={() => eventHandlers.handleCircleMouseLeave(this)} // Add mouse leave event handler
                stroke={
                  this.state.hoveredCircleIndex?.id === node.id ? 'yellow' : null
                } // Conditionally add stroke color for hover effect
                strokeWidth={1}
                hitStrokeWidth={10}

              />
            ))}
            {(this.state.hoveredCircleIndex ) && (
              <React.Fragment>
                <Rect
                  x={this.state.hoveredCircleIndex.x}
                  y={this.state.hoveredCircleIndex.y + 20}
                  width={450}
                  height={100}
                  fill="white"
                  stroke="black"
                  strokeWidth={1}
                  cornerRadius={5}
                  opacity={0.5}
                />
                <Text
                  x={this.state.hoveredCircleIndex.x + 10} // Adjust the positioning as needed
                  y={this.state.hoveredCircleIndex.y + 25} // Adjust the positioning as needed
                  text="Summary:"
                  fontSize={14}
                  fontStyle="bold"
                  fontFamily="Arial"
                  fill="black"
                />
                <Text
                  x={this.state.hoveredCircleIndex.x + 10} // Adjust the positioning as needed
                  y={this.state.hoveredCircleIndex.y + 45} // Adjust the positioning as needed
                  text={`Date: ${this.state.hoveredCircleIndex.date}`}
                  fontSize={14}
                  fontFamily="Arial"
                  fill="black"
                />
                <Text
                  x={this.state.hoveredCircleIndex.x + 10} // Adjust the positioning as needed
                  y={this.state.hoveredCircleIndex.y + 60} // Adjust the positioning as needed
                  text={`Branch: ${this.state.hoveredCircleIndex.branch}`}
                  fontSize={14}
                  fontFamily="Arial"
                  fill="black"
                />
                <Text
                  x={this.state.hoveredCircleIndex.x + 10} // Adjust the positioning as needed
                  y={this.state.hoveredCircleIndex.y + 75} // Adjust the positioning as needed
                  text={`Author: ${this.state.hoveredCircleIndex.signature}`}
                  fontSize={14}
                  fontFamily="Arial"
                  fill="black"
                />
                <Text
                  x={this.state.hoveredCircleIndex.x + 10} // Adjust the positioning as needed
                  y={this.state.hoveredCircleIndex.y + 90} // Adjust the positioning as needed
                  text={`Message: ${this.state.hoveredCircleIndex.message}`}
                  fontSize={14}
                  fontFamily="Arial"
                  fill="black"
                />
              </React.Fragment>
            )}

            {this.state.graph_konva.branches.map((branch) => (
              <Text
                key={branch.name}
                id={branch.name}
                x={-50}
                y={branch.height}
                text={branch.name}
                onClick={() => eventHandlers.handleTextClick(branch, this)}
              />
            ))}
            {this.state.checkoutPointer && (
              <Wedge
                x={this.state.checkoutPointer.x} // x-coordinate of the center of the wedge
                y={this.state.checkoutPointer.y} // y-coordinate of the center of the wedge
                radius={20} // radius of the wedge
                angle={90} // angle in degrees (quarter circle)
                rotation={135} // rotation to make the starting point at the right
                fill="lightgreen" // fill color of the wedge
                stroke="black" // stroke color of the wedge
                strokeWidth={1} // stroke width
              />
            )
            }
          </Layer>
        </Stage>
        <MergeModal
          isOpen={this.state.isModalOpenMerge}
          originNode={this.state.originNode}
          targetNode={this.state.targetNode}
          chartComponent={this}
        />
        <BranchAwayModal
          isOpen={this.state.isBranchAwayModalOpen}
          originNode={this.state.originNode}
          branchName={this.state.branchName}
          chartComponent={this}
        />
        <CheckoutModal
          isOpen={this.state.isModalOpen}
          selectedBranch={this.state.selectedBranch}
          graph_konva={this.state.graph_konva}
          chartComponent={this}
        />
      </div>
    );
  }

  generateDAG(width, height) {
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


    const branchNames = Object.keys(organizedCommits);
    const numBranches = branchNames.length;
    console.log('Number of Branches', numBranches);

    const heights = branchNames.map((branch, index) => ({
      name: branch,
      height: (height / numBranches) * index + buffer_y,
    }));

    ////////////////////////////////// - Color Generation
    const colors = this.generateRandomRGBColors(numBranches);

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
    console.log('sameBranchRelationships: ', edges);
    console.log('crossBranchRelationships: : ', crossBranchParents);
    ////////////////////////////////// - Node Creation
    const nodesData = [];

    branchNames.forEach((branch, branchIndex) => {
      const branchCommits = organizedCommits[branch];
      const branchHeights = heights.find((pair) => pair.name === branch)?.height;
      const color = colors[branchIndex];

      let branch_offset = 0;
      branchCommits.forEach((commit, commitIndex) => {
        const parentCommit = crossBranchParents.find(c => c.to === commit.sha);

        const parentNode = nodesData.find(node => node.id === parentCommit?.from);
        const parentX = parentNode ? parentNode.x : 0;

        if (parentNode !== undefined) {
          branch_offset = parentX - buffer_x + steps_x;
        }

        const node = {
          id: commit.sha,
          label: `Commit ${commit.sha}`,
          x: parentCommit ? parentX + steps_x : steps_x * commitIndex + branch_offset + buffer_x,
          y: branchHeights, // You can adjust the y-coordinate as needed
          color: color,
          message: commit.message,
          signature: commit.signature,
          date: commit.date,
          branch: commit.branch,
        };
        nodesData.push(node);
      });
    });

    const graph = {
      nodes: nodesData,
      edges: [...edges, ...crossBranchParents],
      branches: heights,
      organizedCommits: organizedCommits,
      crossBranchParents: crossBranchParents
    };
    console.log('graph:', graph);

    return graph;
  }

  generateRandomRGBColors(numBranches) {
    const colors = [];

    for (let i = 0; i < numBranches; i++) {
      const intensity = Math.floor((i / (numBranches - 1)) * 255);
      const red = 255;
      const green = intensity;
      const blue = intensity;

      colors.push(`rgb(${red}, ${green}, ${blue})`);
    }

    return colors;
  }
}

'use strict';

import React from 'react';
import { Stage, Layer, Circle, Arrow, Line, Text, Wedge } from 'react-konva';
import styles from '../styles.scss';
import * as eventHandlers from  './eventHandlers';
import BranchAwayModal from '../modals/BranchAway';
import CheckoutModal from '../modals/SwitchBranch';
import MergeModal from '../modals/MergeOrRebaseBranch';
import CommitSummary from '../konvaComponents/commitSummary';
import GraphGeneration from './gitGraphGeneration';

export default class ReverseCommands extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      graph_konva: GraphGeneration.generateGitGraph(1000, 300, this.props.filteredCommits),
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
    this.setState({ graph_konva: GraphGeneration.generateGitGraph(1000, 300, this.props.filteredCommits) });
  }

  componentDidUpdate(prevProps) {
    if (this.props.filteredCommits !== prevProps.filteredCommits) {
      this.setState({ graph_konva: GraphGeneration.generateGitGraph(1000, 300, this.props.filteredCommits) });
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
            {this.state.hoveredCircleIndex && (
              <CommitSummary
                x={this.state.hoveredCircleIndex.x}
                y={this.state.hoveredCircleIndex.y}
                hoveredCircleIndex={this.state.hoveredCircleIndex}
              />
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
}

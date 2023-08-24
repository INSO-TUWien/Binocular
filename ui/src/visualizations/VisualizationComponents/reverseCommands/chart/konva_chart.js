'use strict';

import React from 'react';
import { Stage, Layer, Circle, Arrow, Line, Text } from 'react-konva';
import { generateKonvaGraph, generateSimpleGraph } from './helper.js';
import styles from '../styles.scss';
import Modal from 'react-modal';

export default class ReverseCommands extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      graph_konva: this.generateDAG(1000,300),
      isDrawingLine: false,
      startLinePoint: { x: 0, y: 0 },
      endLinePoint: { x: 0, y: 0 },
      selectedBranches: [],
      scale: 1,
      isModalOpen: false,
      checkedOutBranch: null,
      selectedBranch: null,
    };

    this.stageRef = React.createRef();
  }

  async componentDidMount() {
    this.setState({graph_konva: this.generateDAG(1000,300)});
  }

  componentDidUpdate(prevProps) {
    if (this.props.filteredCommits !== prevProps.filteredCommits) {
      this.setState({ graph_konva: this.generateDAG(1000, 300) });
    }
  }

  render() {
  const redValue = 255;
    return (
      <div className={styles.chartContainer}>
        <Stage
          ref={this.stageRef}
          width={window.innerWidth}
          height={window.innerHeight}
          onMouseUp={this.handleStageMouseUp}
          onWheel={this.handleWheel}
          scaleX={this.state.scale}
          scaleY={this.state.scale}
          draggable
        >
          <Layer>
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
                onClick={() => this.handleCircleClick(node)} // Add this line
                onMouseEnter={() => this.handleCircleMouseEnter(node.id)} // Add hover event handler
                onMouseLeave={this.handleCircleMouseLeave} // Add mouse leave event handler
                stroke={
                  this.state.hoveredCircleIndex === node.id ? 'yellow' : null
                } // Conditionally add stroke color for hover effect
                strokeWidth={1}
              />
            ))}

            {this.state.graph_konva.branches.map((branch) => (
              <Text
                key={branch.name}
                id={branch.name}
                x={-50}
                y={branch.height}
                text={branch.name}
                onClick={() => this.handleTextClick(branch)}
              />
            ))}

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
        <Modal
          isOpen={this.state.isModalOpen}
          onRequestClose={this.closeModal}
          contentLabel="Checkout Modal"
          style={this.customModalStyles} //
        >
          {this.state.selectedBranch ? (
            <div>
              <h2>Checkout Branch: {this.state.selectedBranch.name}</h2>
              <button onClick={this.handleCheckout}>Checkout</button>
            </div>
          ) : (
            <div>
              <p>No branch selected.</p>
            </div>
          )}
          <button onClick={this.closeModal}>Cancel</button>
        </Modal>
      </div>
    );
  }

  customModalStyles = {
    content: {
      width: '50%',  // Adjust the width as needed
      height: '50%', // Let the height adjust based on content
      margin: 'auto',
    },
  };

  handleTextClick = (branch) => {
    this.setState({
      selectedBranch: branch,
      isModalOpen: true,
    });
  };

  handleCheckout = () => {
    // Implement your branch checkout logic here
    // This function will be called when the "Checkout" button in the modal is clicked
    console.log(`Checking out the branch: ${this.state.selectedBranch.name}`);
    this.setState({
      selectedBranch: null,
      isModalOpen: false,
    });
  };

  closeModal = () => {
    this.setState({
      selectedBranch: null,
      isModalOpen: false,
    });
  };

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

  handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.2;
    const newScale = e.evt.deltaY > 0 ? this.state.scale / scaleBy : this.state.scale * scaleBy;
    this.setState({ scale: newScale} );
  };

  handleMouseMove = (e) => {
    const stage = this.stageRef.current;
    const mousePos = stage.getRelativePointerPosition();

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


    const branchNames = Object.keys(organizedCommits);
    const numBranches = branchNames.length;
    console.log('Number of Branches',numBranches);

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
      const branchHeights = heights.find( (pair) => pair.name === branch)?.height;
      const color = colors[branchIndex];

      let branch_offset = 0;
      branchCommits.forEach((commit, commitIndex) => {
        const parentCommit = crossBranchParents.find(c => c.to === commit.sha);

        const parentNode = nodesData.find(node => node.id === parentCommit?.from);
        const parentX = parentNode ? parentNode.x : 0;

        if(parentNode !== undefined){
          branch_offset = parentX - buffer_x + steps_x;
        }

        const node = {
          id: commit.sha,
          label: `Commit ${ commit.sha}`,
          x: parentCommit ? parentX + steps_x : steps_x * commitIndex + branch_offset + buffer_x,
          y: branchHeights, // You can adjust the y-coordinate as needed
          color: color,
          message: commit.message
        };
        nodesData.push(node);
      });
    });

    const graph = { nodes: nodesData, edges: [...edges,...crossBranchParents], branches: heights};
    console.log('graph:', graph);

    return graph;
  }

  generateRandomRGBColors(numBranches) {
    const colors = [];

    for (let i = 0; i < numBranches; i++) {
      const red = Math.floor(Math.random() * 256);
      const green = Math.floor(Math.random() * 256);
      const blue = Math.floor(Math.random() * 256);

      colors.push(`rgb(${red}, ${green}, ${blue})`);
    }

    return colors;
  }
}

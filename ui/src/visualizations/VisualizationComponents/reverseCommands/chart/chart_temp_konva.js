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
      graph_konva: generateKonvaGraph(),
      isDrawingLine: false,
      startLinePoint: { x: 0, y: 0 },
      endLinePoint: { x: 0, y: 0 },
    };

    this.stageRef = React.createRef();
  }

  async componentDidMount() {
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
}

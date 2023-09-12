import React from 'react';
import { Rect, Text } from 'react-konva';

export default class CommitSummary extends React.Component {
  render() {
    const { x, y, hoveredCircleIndex } = this.props;

    return (
      <React.Fragment>
        <Rect x={x} y={y + 20} width={450} height={100} fill="white" stroke="black" strokeWidth={1} cornerRadius={5} opacity={0.5} />
        <Text x={x + 10} y={y + 25} text="Summary:" fontSize={14} fontStyle="bold" fontFamily="Arial" fill="black" />
        <Text x={x + 10} y={y + 45} text={`Date: ${hoveredCircleIndex.date}`} fontSize={14} fontFamily="Arial" fill="black" />
        <Text x={x + 10} y={y + 60} text={`Branch: ${hoveredCircleIndex.branch}`} fontSize={14} fontFamily="Arial" fill="black" />
        <Text x={x + 10} y={y + 75} text={`Author: ${hoveredCircleIndex.signature}`} fontSize={14} fontFamily="Arial" fill="black" />
        <Text x={x + 10} y={y + 90} text={`Message: ${hoveredCircleIndex.message}`} fontSize={14} fontFamily="Arial" fill="black" />
      </React.Fragment>
    );
  }
}

export const handleTextClick = (branch, component) => {
  component.setState({
    selectedBranch: branch,
    isModalOpen: true,
  });
};

export const handleCheckout = (component) => {
  console.log(`Checking out the branch: ${component.state.selectedBranch.name}`);
  component.setState({
    checkoutPointer: { label: 'Checked Out', x: -75, y: component.state.selectedBranch.height },
    isModalOpen: false,
  });
};

export const closeModal = (component) => {
  component.setState({
    selectedBranch: null,
    isModalOpen: false,
  });
};

export const handleCircleClick = (node, component) => {
  console.log(`Circle with ID ${node.id} was clicked.`);

  if (!component.state.isDrawingLine) {
    component.setState({
      isDrawingLine: true,
      startLinePoint: { x: node.x, y: node.y },
    });
  } else {
    console.log('wanna merge?');
  }
};

export const handleWheel = (e, component) => {
  e.evt.preventDefault();
  const scaleBy = 1.2;
  const newScale = e.evt.deltaY > 0 ? component.state.scale / scaleBy : component.state.scale * scaleBy;
  component.setState({ scale: newScale });
};

export const handleMouseMove = (component) => {
  const stage = component.stageRef.current;
  const mousePos = stage.getRelativePointerPosition();

  component.setState({
    endLinePoint: { x: mousePos.x, y: mousePos.y },
  });
};

export const handleStageMouseUp = (component) => {
  component.setState({
    isDrawingLine: false,
  });
};

export const handleCircleMouseEnter = (circleIndex, component) => {
  component.setState({
    hoveredCircleIndex: circleIndex,
  });
};

export const handleCircleMouseLeave = (component) => {
  component.setState({
    hoveredCircleIndex: null,
  });
};

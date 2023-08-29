'use strict';

import React from 'react';
import { Stage, Layer, Circle, Arrow, Line, Text, Wedge } from 'react-konva';
import { generateKonvaGraph, generateSimpleGraph } from './helper.js';
import styles from '../styles.scss';
import Modal from 'react-modal';
import * as eventHandlers from  './eventHandlers';
import copyToClipboard from '../../../dashboard/assets/copyToClipboardIcon.svg';

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
                onMouseEnter={() => eventHandlers.handleCircleMouseEnter(node.id, this)} // Add hover event handler
                onMouseLeave={() => eventHandlers.handleCircleMouseLeave(this)} // Add mouse leave event handler
                stroke={
                  this.state.hoveredCircleIndex === node.id ? 'yellow' : null
                } // Conditionally add stroke color for hover effect
                strokeWidth={1}
                hitStrokeWidth={10}

              />
            ))}

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
        <Modal
          isOpen={this.state.isModalOpenMerge}
          onRequestClose={() => eventHandlers.closeModal(this)}
          contentLabel="Merge Modal"
          style={this.customMergeModalStyles} //
        >
          {this.state.originNode && this.state.targetNode && (
            <div>
              <b>Would you like to perform a merge?</b>
              <br/> <br/>
              {this.checkForMerge(this.state.targetNode,this.state.originNode)}
              <button className={styles.switchButton} onClick={() => eventHandlers.createNewBranch(this)}>Merge</button>
            </div>
          )}
          <button className={styles.cancelButton} onClick={() => eventHandlers.closeModal(this)}>Cancel</button>

        </Modal>
        <Modal
          isOpen={this.state.isBranchAwayModalOpen}
          onRequestClose={() => eventHandlers.closeModal(this)}
          contentLabel="Branch Away Modal"
          style={this.customBranchAwayInfoModalStyles} //
        >
          {this.state.originNode && (
            <div>
              <b>Would you like to create a new Branch from this Commit?</b>
              <br />
              Origin Node: {this.state.originNode.id}
              <br /> <br />
              <label> What should be the new branches name? </label>
              <br />
              <input className={styles.inputBox} id="branchNameInput" onChange={(e) => eventHandlers.handleInputChange(e, this)} type="text"
                     placeholder="e.i.: feature/XX" />
              <br /> <br />
              <div id="switchCMD" className={styles.terminal}>$ git branch {this.state.branchName} {this.state.originNode.id} </div>
              <button onClick={() => this.copyToClipboard(`git branch ${this.state.branchName} ${this.state.originNode.id}`)}><img
                src={copyToClipboard} alt="CopyToClipboard" className={styles.svgIcon} /></button>
              <br /><br />

              <button className={styles.switchButton} onClick={() => eventHandlers.createNewBranch(this)}>Create new Branch</button>
            </div>
          )}
          <button className={styles.cancelButton} onClick={() => eventHandlers.closeModal(this)}>Cancel</button>

        </Modal>
        <Modal
          isOpen={this.state.isModalOpen}
          onRequestClose={() => eventHandlers.closeModal(this)}
          contentLabel="Checkout Modal"
          style={this.customBranchInfoModalStyles} //
        >
          {this.state.selectedBranch ? (
            <div>
              <b>Branch Name: {this.state.selectedBranch.name}</b>
              <br /> <br />
              #Commits: {this.state.graph_konva.organizedCommits[this.state.selectedBranch.name].length} <br />
              Originated
              from: {this.originatesFrom(this.state.selectedBranch.name, this.state.graph_konva.organizedCommits, this.state.graph_konva.crossBranchParents)}
              <br /> <br />
              To Checkout this Branch:
              <br />
              <div id="switchCMD" className={styles.terminal}>$ git switch {this.state.selectedBranch.name}</div>
              <button onClick={() => this.copyToClipboard(`git switch ${this.state.selectedBranch.name}`)}><img src={copyToClipboard}
                                                                                                                alt="CopyToClipboard"
                                                                                                                className={styles.svgIcon} />
              </button>
              <br /><br />

              <button className={styles.switchButton} onClick={() => eventHandlers.handleCheckout(this)}>Switch</button>
            </div>
          ) : (
            <div>
              <p>No branch selected.</p>
            </div>
          )}
          <button className={styles.cancelButton} onClick={() => eventHandlers.closeModal(this)}>Cancel</button>
        </Modal>
      </div>
    );
  }

  copyToClipboard(text) {
    // Copy the text inside the text field
    navigator.clipboard.writeText(text).then(
      () => {
        /* clipboard successfully set */
        alert("Copied the text: " + text);
      },
      () => {
        /* clipboard write failed */
        alert("Error occurred when trying to copy to clipboard");
      },
    );
  }

  customBranchInfoModalStyles = {
    content: {
      width: '35%',  // Adjust the width as needed
      height: '35%', // Let the height adjust based on content
      margin: 'auto',
    },
  };

  customBranchAwayInfoModalStyles = {
    content: {
      width: '50%',  // Adjust the width as needed
      height: '35%', // Let the height adjust based on content
      margin: 'auto',
    },
  };

  customMergeModalStyles = {
    content: {
      width: '50%',  // Adjust the width as needed
      height: '70%', // Let the height adjust based on content
      margin: 'auto',
    },
  };

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

  originatesFrom = (branchName, organizedCommits, crossBranchParents) => {
    const firstCommit = organizedCommits[branchName][0];
    console.log(firstCommit);
    console.log(crossBranchParents);
    const erg = crossBranchParents.filter((r) => r.to === firstCommit.sha);
    if (erg.length === 0) {
      return "This is the initial branch."
    } else {
      const searchFor = erg[0].from;

      for (const branch in organizedCommits) {
        const value = organizedCommits[branch];

        for (const c of value) {
          if (c.sha === searchFor) {
            return branch; // Return the branch directly from here
          }
        }
      }
    }
  }

  checkForMerge = (targetCommit, originCommit) => {
    //Check if TargetBranch is Origin Branch
    const targetBranch = targetCommit.branch;
    console.log('target Branch', targetBranch);

    const sourceBranch = originCommit.branch;
    console.log('source Branch', sourceBranch);

    const originBranch = this.originatesFrom(sourceBranch, this.state.graph_konva.organizedCommits, this.state.graph_konva.crossBranchParents);
    console.log('origin Branch', originBranch)

    if (originBranch === targetBranch) {
      console.log('Merge to origin is possible!');
      // Check for type of merge , 3 way or fast forward
      const commitsInOrigin = this.state.graph_konva.organizedCommits[originBranch];
      const firstCommitInSource =  this.state.graph_konva.organizedCommits[sourceBranch][0];
      const originCommitInOrigin = this.state.graph_konva.crossBranchParents.filter((x) => x.to === firstCommitInSource.sha)[0].from;
      const indexOfOriginCommitInOrigin =  this.state.graph_konva.organizedCommits[targetBranch].findIndex((x) => x.sha === originCommitInOrigin);

      const commitsSinceBranch = ( commitsInOrigin.length - 1) - indexOfOriginCommitInOrigin
      let merge_content;
      let rebase_content = null;
      if (commitsSinceBranch === 0) {
        // Fast forward
        merge_content = (<div>
          If so you can perform a <b>fast-forward</b> merge because there haven't been any commits
          in <b>{targetBranch}</b> since <b>{sourceBranch}</b> was created.
        </div>);
      } else {
        // Three-way or rebase
        merge_content = (<div>
          If so you can perform a <b>three-way</b> merge but keep in mind that there could potentially be merge conflicts because
          there have been <b>{commitsSinceBranch}</b> Commits in <b>{targetBranch}</b> since <b>{sourceBranch}</b> was created.
        </div>);

        rebase_content = (<div>
          Another way to apply the changes from <b>{sourceBranch}</b> to <b>{targetBranch}</b> is a <b>rebase</b>. A rebase applies the
          changes into a linear timeline in <b>{targetBranch}</b>. To achieve this run the following command and resolve potential conflicts
          in the IDE of your choice.
          <br/>
        </div>);
      }
      return <div>
        {merge_content}
        <br/>
        {(this.state.checkoutPointer?.branchName !== targetBranch) && (
          <div>
            You additionally have to checkout the target branch before merging!
            <br/>
          * <div id="switchCMD" className={styles.terminal}>$ git checkout {targetBranch}</div>
            <br/><br/>
          </div>
          )}
          * <div id="switchCMD" className={styles.terminal}>$ git merge {sourceBranch}</div>
        {(rebase_content !== null) && (<div>
          <br/>
          {rebase_content}
          <br/>
          {(this.state.checkoutPointer?.branchName !== sourceBranch) && (
            <div>
              You additionally have to checkout the branch containing the changes before rebasing!
              <br/>
              * <div id="switchCMD" className={styles.terminal}>$ git checkout {sourceBranch}</div>
              <br/><br/>
            </div>
          )}
          * <div id="switchCMD" className={styles.terminal}>$ git rebase {originBranch}</div>
        </div>)}
      </div>;
    }
    return "Type of request merge is not implemented yet";
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

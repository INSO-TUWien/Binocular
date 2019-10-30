'use strict';


export let ownershipOfFileList = [];
export let arrayForVisualization = [];
import chroma from "chroma-js";

export var temp2Node;
export var deletedFile = false;


export default function getOwnershipList(selectedFile) {
  deletedFile = false;
  ownershipOfFileList = [];
  arrayForVisualization = [];
  let commitedBy = [];
  console.log('Ownership for file', selectedFile);
  let ownersPerLine = [];
  for (let i = 0; i < selectedFile.commits.length; i++) {
    let k = selectedFile.commits[i].signature;
    for (let k = 0; k < selectedFile.commits[i].hunks.length; k++) {
      //Just adding new lines
      if (selectedFile.commits[i].hunks[k].newLines > 0 && selectedFile.commits[i].hunks[k].oldLines === 0) {
        let tempArray = [...ownersPerLine];
        for (let j = selectedFile.commits[i].hunks[k].newStart - 1; j < (selectedFile.commits[i].hunks[k].newStart - 1 + selectedFile.commits[i].hunks[k].newLines); j++) {
          tempArray.splice(j, 0, selectedFile.commits[i].signature);
        }
        ownersPerLine = [...tempArray];
        // console.log('ADD LINES after', ownersPerLine);
      }
      //Just deleting lines

      else if (selectedFile.commits[i].hunks[k].newLines === 0 && selectedFile.commits[i].hunks[k].oldLines > 0) {
        let tempArray = [...ownersPerLine];
        for (let j = selectedFile.commits[i].hunks[k].newStart + selectedFile.commits[i].hunks[k].oldLines; j >= selectedFile.commits[i].hunks[k].newStart; j--) {
          tempArray.splice(j, 1);
        }
        ownersPerLine = [...tempArray];
        // console.log('DELETE LINES', ownersPerLine);
      }
      //Overwriting lines

      else {
        if (selectedFile.commits[i].hunks[k].newLines === selectedFile.commits[i].hunks[k].oldLines) {
          //just overwriting
          let tempArray = [...ownersPerLine];
          for (let j = selectedFile.commits[i].hunks[k].newStart - 1; j < (selectedFile.commits[i].hunks[k].newStart - 1 + selectedFile.commits[i].hunks[k].newLines); j++) {
            tempArray[j] = selectedFile.commits[i].signature;
          }
          ownersPerLine = [...tempArray];
          // console.log('just Overwriting', ownersPerLine);
        } else if (selectedFile.commits[i].hunks[k].newLines > selectedFile.commits[i].hunks[k].oldLines) {
          //overwriting + adding
          let tempArray = [...ownersPerLine];
          for (let j = selectedFile.commits[i].hunks[k].newStart - 1; j < (selectedFile.commits[i].hunks[k].newStart - 1 + selectedFile.commits[i].hunks[k].oldLines); j++) {
            tempArray[j] = selectedFile.commits[i].signature;
          }
          //adding
          for (let j = (selectedFile.commits[i].hunks[k].newStart + selectedFile.commits[i].hunks[k].oldLines - 1); j < (selectedFile.commits[i].hunks[k].newStart - 1 + selectedFile.commits[i].hunks[k].newLines); j++) {
            tempArray.splice(j, 0, selectedFile.commits[i].signature);
          }
          ownersPerLine = [...tempArray];
          // console.log('Overwriting + adding ', ownersPerLine);
        } else if (selectedFile.commits[i].hunks[k].newLines < selectedFile.commits[i].hunks[k].oldLines) {
          //overwriting + deleting
          let tempArray = [...ownersPerLine];
          for (let j = selectedFile.commits[i].hunks[k].newStart - 1; j < (selectedFile.commits[i].hunks[k].newStart - 1 + selectedFile.commits[i].hunks[k].newLines); j++) {
            tempArray[j] = selectedFile.commits[i].signature;
          }
          for (let j = (selectedFile.commits[i].hunks[k].newStart - 1 + selectedFile.commits[i].hunks[k].oldLines); j > (selectedFile.commits[i].hunks[k].newStart - 1 + selectedFile.commits[i].hunks[k].newLines); j--) {
            tempArray.splice(j, 1);
          }
          ownersPerLine = [...tempArray];
          // console.log('Overwriting + deleting ', ownersPerLine);
        }
      }
    }
    commitedBy.push(k);
    ownershipOfFileList.push(ownersPerLine);
  }
  console.log('List of owners per line for each commit', ownershipOfFileList);
  console.log('Commiters', commitedBy);

  //calculate how many nodes and transition of lines for commit
  let nodes = [];
  let links = [];
  let tempDev2 = [];



  for (let i = 0; i < ownershipOfFileList.length; i++) {
    let tempDev = [];
    for (let j = 0; j < ownershipOfFileList[i].length; j++) {
      if (!tempDev.includes(ownershipOfFileList[i][j])) {
        tempDev.push(ownershipOfFileList[i][j]);
        nodes.push({name: ownershipOfFileList[i][j], commit: i});
      }
      if(!tempDev2.includes(ownershipOfFileList[i][j])) {
        tempDev2.push(ownershipOfFileList[i][j]);
      }
    }
    let counts = {};
    let tempArray = [];
    ownershipOfFileList[i].forEach(function (x) {
      counts[x] = (counts[x] || 0) + 1;
    });
    for (let k in counts) {
      tempArray.push({name: k, value: counts[k], commit: i, commitDoneBy: commitedBy[i]});
    }
    links.push(tempArray);
  }



  console.log('LINKS', links);


  //set color to the nodes for visualization + configure name
  let nodeVis = [];
  let tempNode = [];
  temp2Node = [];
  // nodes = [{name: 'dev1', commit: 0}, {name: 'dev2', commit: 0}, {name: 'dev1', commit: 1}, {name: 'dev2', commit: 1}, {name: 'dev3', commit: 1}, {name: 'dev3', commit: 2}, {name: 'dev3', commit: 3}, {name: 'dev3', commit: 4 }];
  // links = [ [{name: 'dev1', commit: 0, value: 20, commitDoneBy: 'dev1' }, {name: 'dev2', commit: 0, value: 10, commitDoneBy: 'dev1' }], [{name: 'dev1', commit: 1, value: 20, commitDoneBy: 'dev3'}, {name: 'dev2', commit: 1, value: 5, commitDoneBy: 'dev3'}, {name: 'dev3', commit: 1, value: 25, commitDoneBy: 'dev3'}],
  //   [{name: 'dev3', commit: 2, value: 30, commitDoneBy: 'dev3' }]];

  const colors = chroma.scale('spectral').colors((tempDev2.length + 5));
  let num = 1;
  for (let i = 0; i < nodes.length; i++) {
    if (!tempNode.includes(nodes[i].name)) {
      tempNode.push(nodes[i].name);
      let colorNum = num++;
      let color;
       if (colorNum % 2) {
        color = colors[colorNum];
      } else  color = colors[colors.length - colorNum];
      temp2Node.push({name: nodes[i].name, color: color});
      nodeVis.push({name: nodes[i].name + ', ' + 'Commit: ' + (nodes[i].commit + 1), color: color});
    } else {
      let index = temp2Node.indexOf(temp2Node.find(node => node.name === nodes[i].name));
      nodeVis.push({name: nodes[i].name + ', ' + 'Commit: ' + (nodes[i].commit + 1), color: temp2Node[index].color})
    }
  }


  let temp = [];
  let numberOfLinesEnd = 0;

  for (let i = 0; i < links.length; i++) {
    if (i + 1 < links.length) { // this is target - last node not a source

      for (let k = 0; k < links[i + 1].length; k++) { //loop target
        let val = links[i + 1][k].value;
        numberOfLinesEnd = val;

        for (let j = 0; j < links[i].length; j++) { //loop source
          if (links[i][j].name !== links[i + 1][k].commitDoneBy && links[i][j].name === links[i + 1][k].name) {
            let nodeSource = nodes.find(node => node.name === links[i][j].name && node.commit === links[i][j].commit);
            let nodeTarget = nodes.find(node => node.name === links[i + 1][k].name && node.commit === links[i + 1][k].commit);
            let indexSource = nodes.indexOf(nodeSource);
            let indexTarget = nodes.indexOf(nodeTarget);
            temp.push({source: indexSource, target: indexTarget, value: links[i + 1][k].value});
          } else if (links[i + 1][k].name === links[i + 1][k].commitDoneBy ) { // developer which did commit flow
            let nodeSource = nodes.find(node => node.name === links[i][j].name && node.commit === links[i][j].commit);
            let nodeTarget = nodes.find(node => node.name === links[i + 1][k].commitDoneBy && node.commit === links[i + 1][k].commit);
            let indexSource = nodes.indexOf(nodeSource);
            let indexTarget = nodes.indexOf(nodeTarget);
            let findA = links[i + 1].find(node => node.name === links[i][j].name);
            if (!findA) { // all lines of this developer are overwritten, he is not existing in next commit
              let value = links[i][j].value;
              val = val - value;
              temp.push({source: indexSource, target: indexTarget, value: value});
            } else if (findA.name === links[i + 1][k].commitDoneBy) {
              if (findA.value - links[i][j].value >= 0) {
                temp.push({source: indexSource, target: indexTarget, value:  val});
              } else {
                temp.push({source: indexSource, target: indexTarget, value: val});
              }
            } else {
              let value = links[i][j].value - findA.value;
                val = val - value;
                temp.push({source: indexSource, target: indexTarget, value: value});
            }

          }
        }
      }
    }
  }
  if (links.length === 1) {
    temp.push(links);
  }
  if(!links[links.length - 1].length){
    let counts = {};
    nodeVis.push({name: 'File is deleted', color: chroma('black')});
    temp2Node.push({name: 'File is deleted', color: chroma('black')});
    console.log('Last commit is empty array', links[links.length - 1]);
    for (let i = ownershipOfFileList.length -1; i > 0; i--) {
      if(ownershipOfFileList[i].length > 0) {
        ownershipOfFileList[i].forEach(function (x) {
          counts[x] = (counts[x] || 0) + 1;
        });
         break;
      }
    }
    let num = Object.keys(counts).length;
    let add = 0;
    for (let i = 1; i <= num; i++) {
      temp.push({source: temp[temp.length - i - add].target, target: nodeVis[nodeVis.length - 1], value: temp[temp.length - i - add].value});
      add++;
    }
    deletedFile = true;
  }

  console.log('Visualization array:', temp);
  arrayForVisualization = {nodes: nodeVis, links: temp};
}

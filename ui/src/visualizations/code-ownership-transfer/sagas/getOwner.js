'use strict';
export let ownershipOfFileList = [];

export default function getOwnershipList(selectedFile) {
  ownershipOfFileList = [];
  console.log('Ownership for file', selectedFile);
  let ownersPerLine = [];
  for (let i = 0; i < selectedFile.commits.length; i++) {
    for (let k = 0; k < selectedFile.commits[i].hunks.length; k++) {
      //Just adding new lines
      if (selectedFile.commits[i].hunks[k].newLines > 0 && selectedFile.commits[i].hunks[k].oldLines === 0) {
        let tempArray = [...ownersPerLine];
        for (let j = selectedFile.commits[i].hunks[k].newStart - 1; j < (selectedFile.commits[i].hunks[k].newStart - 1 + selectedFile.commits[i].hunks[k].newLines); j++) {
          tempArray.splice(j, 0, selectedFile.commits[i].signature);
        }
        ownersPerLine = [...tempArray];
        console.log('ADD LINES after', ownersPerLine);
      }
      //Just deleting lines

      else if (selectedFile.commits[i].hunks[k].newLines === 0 && selectedFile.commits[i].hunks[k].oldLines > 0) {
        let tempArray = [...ownersPerLine];
        for (let j = selectedFile.commits[i].hunks[k].newStart + selectedFile.commits[i].hunks[k].oldLines; j >= selectedFile.commits[i].hunks[k].newStart; j--) {
          tempArray.splice(j, 1);
        }
        ownersPerLine = [...tempArray];
        console.log('DELETE LINES', ownersPerLine);
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
          console.log('just Overwriting', ownersPerLine);
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
          console.log('Overwriting + adding ', ownersPerLine);
        } else if (selectedFile.commits[i].hunks[k].newLines < selectedFile.commits[i].hunks[k].oldLines) {
          //overwriting + deleting
          let tempArray = [...ownersPerLine];
          for (let j = selectedFile.commits[i].hunks[k].newStart - 1; j < (selectedFile.commits[i].hunks[k].newStart - 1 + selectedFile.commits[i].hunks[k].newLines); j++) {
            tempArray[j] = selectedFile.commits[i].signature;
          }
          for (let j = (selectedFile.commits[i].hunks[k].newStart - 1 + selectedFile.commits[i].hunks[k].oldLines); j > (selectedFile.commits[i].hunks[k].newStart - 1 + selectedFile.commits[i].hunks[k].newLines) ; j--) {
            tempArray.splice(j, 1);
          }
          ownersPerLine = [...tempArray];
          console.log('Overwriting + deleting ', ownersPerLine);
        }
      }
    }
    ownershipOfFileList.push(ownersPerLine);
  }
  console.log('List for visualization', ownershipOfFileList);
}

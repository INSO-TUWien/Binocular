'use strict';


export default function getOwnershipList(selectedFile) {
  console.log('Ownership for file', selectedFile);
  let ownershipOfFileList = [];
  let ownersPerLine = [];
  for (let i = 0; i < selectedFile.commits.length; i++) {
    for (let k = 0; k < selectedFile.commits[i].hunks.length; k++) {
      //Just adding new lines
      if (selectedFile.commits[i].hunks[k].newLines > 0 && selectedFile.commits[i].hunks[k].oldLines === 0) {
        for (let j = selectedFile.commits[i].hunks[k].newStart; j < (selectedFile.commits[i].hunks[k].newStart + selectedFile.commits[i].hunks[k].newLines); j++) {
          ownersPerLine.splice(j, 0, selectedFile.commits[i].signature);
        }
        console.log('ADD LINES', ownersPerLine);
      }
      //Just deleting lines
      else if (selectedFile.commits[i].hunks[k].newLines === 0 && selectedFile.commits[i].hunks[k].oldLines > 0) {
        for (let j = selectedFile.commits[i].hunks[k].newStart; j < (selectedFile.commits[i].hunks[k].newStart + selectedFile.commits[i].hunks[k].oldLines); j++) {
          ownersPerLine.splice(j, 1);
        }
        console.log('DELETE LINES', ownersPerLine);
      }
      //Overwriting lines
      else {
        if (selectedFile.commits[i].hunks[k].newLines === selectedFile.commits[i].hunks[k].oldLines) {
          for (let j = selectedFile.commits[i].hunks[k].newStart; j < (selectedFile.commits[i].hunks[k].newStart + selectedFile.commits[i].hunks[k].newLines); j++) {
            //just overwriting
            ownersPerLine[j] = selectedFile.commits[i].signature;
          }
        } else if (selectedFile.commits[i].hunks[k].newLines >= selectedFile.commits[i].hunks[k].oldLines) {
          //overwriting + adding
          for (let j = selectedFile.commits[i].hunks[k].newStart; j < (selectedFile.commits[i].hunks[k].newStart + selectedFile.commits[i].hunks[k].oldLines); j++) {
            ownersPerLine[j] = selectedFile.commits[i].signature;
          }
          for (let j = (selectedFile.commits[i].hunks[k].newStart + selectedFile.commits[i].hunks[k].oldLines); j < (selectedFile.commits[i].hunks[k].newStart + selectedFile.commits[i].hunks[k].newLines); j++) {
            ownersPerLine.splice(j, 0, selectedFile.commits[i].signature);
          }
        } else if(selectedFile.commits[i].hunks[k].newLines <= selectedFile.commits[i].hunks[k].oldLines) {
          //overwriting + deleting
          for (let j = selectedFile.commits[i].hunks[k].newStart; j < (selectedFile.commits[i].hunks[k].newStart + selectedFile.commits[i].hunks[k].newLines); j++) {
            ownersPerLine[j] = selectedFile.commits[i].signature;
          }
          for (let j = (selectedFile.commits[i].hunks[k].newStart + selectedFile.commits[i].hunks[k].newLines); j < (selectedFile.commits[i].hunks[k].newStart + selectedFile.commits[i].hunks[k].oldLines); j++) {
            ownersPerLine.splice(j, 1);
          }
        }
        console.log('Overwriting', ownersPerLine);
      }
    }
    ownershipOfFileList.push(ownersPerLine);
  }
  console.log('List for visualization', ownershipOfFileList);

}

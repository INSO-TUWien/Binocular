'use strict';

import _ from 'lodash';

export default class HunkHandler {
  static handle (hunk,data,column) {
    let maxValue=0;
    for (let k = 0; k < hunk.newLines; k++) {
      let cellIndex = _.findIndex(data,{column:""+column,row:hunk.newStart+k-1});
      if(cellIndex!==-1){
        data[cellIndex].value += 1;
        if(data[cellIndex].value>maxValue){
          maxValue = data[cellIndex].value;
        }
      }
    }

    for (let k = 0; k < hunk.oldLines; k++) {
      let cellIndex = _.findIndex(data,{column:""+column,row:hunk.oldStart+k-1});
      if(cellIndex!==-1){
        data[cellIndex].value += 1;
        if(data[cellIndex].value>maxValue){
          maxValue = data[cellIndex].value;
        }
      }
    }
    return maxValue;
  }
}

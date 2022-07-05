import React, { useState, useEffect } from "react";
import ModuleLine from "./ModuleLine";

const FilePicker = ({ fileList }) => {
  const [fileMap, setFileMap] = useState({})

  useEffect(() => {

    const fileMap = {};

    const set = (pathSplitArray, fileMap) => {
      //start at the top layer
      let map = fileMap;

      for (const pathItemIndex in pathSplitArray) {
        const pathItem = pathSplitArray[pathItemIndex];

        if (pathItemIndex == pathSplitArray.length - 1) {
          map[pathItem] = pathSplitArray.join("/");
          break;
        }

        //if this path is not already in the map, create an empty object as value
        if (!map[pathItem]) {
          map[pathItem] = {};
        }
        //follow the path
        map = map[pathItem];
      }
    };

    fileList
      .map((path) => path.split("/"))
      .forEach((pathSplitArray) => {
        set(pathSplitArray, fileMap);
      });

    setFileMap(fileMap)

  }, [fileList])
  

  

  return (
    <div>
      <ModuleLine moduleName={"root"} children={fileMap} initiallyExpanded={true}/>
    </div>
  );
};

export default FilePicker;
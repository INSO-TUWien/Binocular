import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import styles from './styles.module.scss';

const ModuleLine = ({
  moduleName,
  children,
  initiallyExpanded = false,
  globalActiveFiles,
  setActiveFiles,
  ownership = null,
  authorColors = null,
}) => {
  const [isExpanded, setExpanded] = useState(initiallyExpanded);
  const [isChecked, setChecked] = useState(false);
  const [childNodes, setChildNodes] = useState([]);
  const [allChildPaths, setAllChildPaths] = useState([]);

  const svgRef = useRef(null);
  const buttonRef = useRef(null);
  const [buttonWidth, setButtonWidth] = useState(0);

  //if this component has no children, it means that it is a file, otherwise it is a module
  const isModule = !(Object.keys(children).length === 0);

  const dispatchCheckFiles = (files, check) => {
    if (check) {
      //add path to global state
      setActiveFiles(unique(globalActiveFiles.concat(files)));
    } else if (!check) {
      //remove file from global list of checked Files
      setActiveFiles(unique(globalActiveFiles.filter((fileName) => !files.includes(fileName))));
    }
  };

  //is called when module/file is (un-)checked
  const onCheck = (checked) => {
    if (!isModule) {
      //if this is a file, add/remove it to/from checked files state
      dispatchCheckFiles([moduleName], checked);
    } else {
      //if it is a module, (un)check all child modules/files
      dispatchCheckFiles(allChildPaths, checked);
    }
  };

  const getAllPaths = (childObjects) => {
    let childPaths = [];

    for (const key in childObjects) {
      const value = childObjects[key];

      if (value.path) {
        childPaths.push(value.path);
      } else {
        childPaths = childPaths.concat(getAllPaths(value.children));
      }
    }

    return childPaths;
  };

  // generate child nodes
  useEffect(() => {
    const childNodes = [];
    for (const key in children) {
      const value = children[key];
      if (value.path) {
        childNodes.push(
          <ModuleLine
            moduleName={value.path}
            ownership={value.ownership}
            authorColors={authorColors}
            children={{}}
            key={key}
            globalActiveFiles={globalActiveFiles}
            setActiveFiles={setActiveFiles}
          />,
        );
      } else {
        childNodes.push(
          <ModuleLine
            moduleName={key}
            ownership={value.ownership}
            authorColors={authorColors}
            children={value.children}
            key={key}
            globalActiveFiles={globalActiveFiles}
            setActiveFiles={setActiveFiles}
          />,
        );
      }
    }

    setChildNodes(childNodes);

    //get all paths of all children. Used to bulk-check / uncheck them
    setAllChildPaths(getAllPaths(children));
  }, [children, globalActiveFiles, ownership]);

  useEffect(() => {
    if (!isModule) {
      //this line is checked if the gobal state includes the filename
      setChecked(globalActiveFiles.includes(moduleName));
    } else {
      //if allChildPaths are all in global state -> check this module
      setChecked(allChildPaths.every((path) => globalActiveFiles.includes(path)));
    }
  }, [globalActiveFiles, allChildPaths]);

  //measure the width of the button before it is rendered
  useLayoutEffect(() => {
    const { width } = buttonRef.current.getBoundingClientRect();
    setButtonWidth(width);
  }, []);

  //generate ownership svg
  useEffect(() => {
    if (!buttonWidth || buttonWidth === 0) return;

    const ownershipLine = d3
      .create('svg')
      .attr('width', '100%')
      .attr('height', '0px')
      .attr('display', 'flex')
      .attr('flex-direction', 'row')
      .attr('id', 'svg-' + moduleName);

    if (ownership && ownership.length !== 0 && !_.isEqual(ownership, {}) && authorColors) {
      //calc sum of additions
      const additions = ownership.reduce((accumulator, { signature, ownedLines }) => accumulator + ownedLines, 0);

      //append colored line for every dev
      let margin = 0;
      for (const { signature, ownedLines } of _.sortBy(ownership, ['signature'])) {
        if (ownedLines === 0) continue;
        const devWidth = buttonWidth * (ownedLines / additions);
        ownershipLine.append('rect').attr('x', margin).attr('width', devWidth).attr('height', '100%').attr('fill', authorColors[signature]);

        margin += devWidth;
      }
    } else {
      ownershipLine.append('rect').attr('x', 0).attr('width', buttonWidth).attr('height', '100%').attr('fill', '#4882e0');
    }

    if (svgRef.current) {
      svgRef.current.appendChild(ownershipLine.node());
    }
  }, [buttonWidth, ownership, authorColors]);

  //if this is a file
  if (!isModule) {
    //since files have the whole path as name, display only the last part
    const nameSplit = moduleName.split('/');
    const displayName = nameSplit[nameSplit.length - 1];

    return (
      <div className={styles.button + ' ' + styles.fileCol}>
        <div className={styles.fileLine} ref={buttonRef}>
          <input type="checkbox" checked={isChecked} onChange={(event) => onCheck(event.target.checked)} />

          <div className={styles.fileName}>
            <span>{displayName}</span>
          </div>
        </div>

        {/* small line on the bottom indicating the ownership */}
        <div ref={svgRef} />
      </div>
    );
  }

  //if this is a module
  return (
    <div className={styles.moduleAndChildContainer}>
      <div className={styles.moduleContainer} ref={buttonRef}>
        {/* svg as background indicating the ownership */}
        <div ref={svgRef} />

        <div className={styles.button + ' ' + styles.moduleLine}>
          <div>
            <input type="checkbox" checked={isChecked} onChange={(event) => onCheck(event.target.checked)} />
          </div>

          <div className={styles.moduleName} onClick={() => setExpanded(!isExpanded)}>
            <span>{moduleName}</span>
          </div>
        </div>
      </div>
      {isExpanded && <div className={styles.childContainer}>{childNodes}</div>}
    </div>
  );
};

const unique = (array) => {
  return [...new Set(array)];
};

export default ModuleLine;

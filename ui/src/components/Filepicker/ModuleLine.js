import { useState, useEffect } from 'react';
import styles from './styles.scss';

const ModuleLine = ({ moduleName, children, initiallyExpanded = false, globalActiveFiles, setActiveFiles }) => {
  const [isExpanded, setExpanded] = useState(initiallyExpanded);
  const [isChecked, setChecked] = useState(false);
  const [childNodes, setChildNodes] = useState([]);
  const [allChildPaths, setAllChildPaths] = useState([]);

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

      if (typeof value === 'string') {
        childPaths.push(value);
      } else {
        childPaths = childPaths.concat(getAllPaths(value));
      }
    }

    return childPaths;
  };

  // generate child nodes
  useEffect(() => {
    const childNodes = [];

    for (const key in children) {
      const value = children[key];
      if (typeof value === 'string') {
        childNodes.push(
          <ModuleLine moduleName={value} children={{}} key={key} globalActiveFiles={globalActiveFiles} setActiveFiles={setActiveFiles} />
        );
      } else {
        childNodes.push(
          <ModuleLine moduleName={key} children={value} key={key} globalActiveFiles={globalActiveFiles} setActiveFiles={setActiveFiles} />
        );
      }
    }

    setChildNodes(childNodes);

    //get all paths of all children. Used to bulk-check / uncheck them
    setAllChildPaths(getAllPaths(children));
  }, [children, globalActiveFiles]);

  useEffect(() => {
    if (!isModule) {
      //this line is checked if the gobal state includes the filename
      setChecked(globalActiveFiles.includes(moduleName));
    } else {
      //if allChildPaths are all in global state -> check this module
      setChecked(allChildPaths.every((path) => globalActiveFiles.includes(path)));
    }
  }, [globalActiveFiles, allChildPaths]);

  //if this is a file
  if (!isModule) {
    //since files have the whole path as name, display only the last part
    const nameSplit = moduleName.split('/');
    const displayName = nameSplit[nameSplit.length - 1];

    return (
      <div className={styles.button + ' ' + styles.fileLine}>
        <div>
          <input type="checkbox" checked={isChecked} onChange={(event) => onCheck(event.target.checked)} />
        </div>

        <div className={styles.fileName}>
          <span>{displayName}</span>
        </div>
      </div>
    );
  }

  //if this is a module
  return (
    <div>
      <div className={styles.button + ' ' + styles.moduleLine}>
        <div>
          <input type="checkbox" checked={isChecked} onChange={(event) => onCheck(event.target.checked)} />
        </div>

        <div className={styles.moduleName} onClick={() => setExpanded(!isExpanded)}>
          <span>{moduleName}</span>
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

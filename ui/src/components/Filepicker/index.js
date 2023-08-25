'use-strict';

import { useState, useEffect } from 'react';
import ModuleLine from './ModuleLine';
import styles from './styles.scss';
import _ from 'lodash';

/**
 * This component renders a filepicker.
 * Files and whole directories can be checked or unchecked.
 * It is designed to mutate local or global state that tracks which files are currently checked.
 *
 * @param fileList array containing all files that this component should display.
 *                          Example: `[fortytwo.txt, foo/bar.txt, foo/baz.txt]`
 *                                   results in a filepicker with one file `fortytwo.txt` and a sirectory `foo` containing two files.
 * @param globalActiveFiles array of all files that are currently checked.
 *                          Example: `[foo/bar.txt, foo/baz.txt]` will result in a filepicker
 *                                   where the whole `foo` directory is checked (including the two files in it)
 *                                   and where the file `fortytwo.txt` is not checked.
 * @param setActiveFiles function that takes an array of filenames and mutates the global/local state.
 *                       This function is called everytime a file is checked and will get an array of *all* currently checked files.
 *                       Example: If `globalActiveFiles` is in the global state managed by redux,
 *                       `setActiveFiles` should look something like `(files) => dispatch(setGlobalFiles(files))`
 * @param showSelectButtons if set to false, the `Select All` and `Deselect All` buttons are hidden.
 */
const Filepicker = ({ fileList, globalActiveFiles = [], setActiveFiles, showSelectButtons = true }) => {
  const [fileMap, setFileMap] = useState({});

  const resetActiveFiles = () => {
    if (globalActiveFiles.length !== 0) {
      setActiveFiles([]);
    }
  };

  const selectAllFiles = () => {
    if (!_.isEqual(globalActiveFiles, fileList)) {
      setActiveFiles(fileList);
    }
  };

  //every time the fileList changes, construct a map that has the same structure as the original directory
  //example:
  //files = [fortytwo.txt, foo/bar.txt, foo/baz.txt]
  //generated map => {fortytwo.txt: {}, foo: {bar.txt: {}, baz.txt: {}}}
  useEffect(() => {
    const fileMap = {};

    const set = (pathSplitArray, fileMap) => {
      //start at the top layer
      let map = fileMap;

      for (const pathItemIndex in pathSplitArray) {
        const pathItem = pathSplitArray[pathItemIndex];

        if (parseInt(pathItemIndex) === pathSplitArray.length - 1) {
          map[pathItem] = pathSplitArray.join('/');
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
      .map((path) => path.split('/'))
      .forEach((pathSplitArray) => {
        set(pathSplitArray, fileMap);
      });

    setFileMap(fileMap);
  }, [fileList]);

  return (
    <div className={styles.filepicker}>
      {showSelectButtons && (
        <>
          <button
            className={styles.button + ' mr-2'}
            onClick={(e) => {
              e.preventDefault();
              selectAllFiles();
            }}>
            Select All
          </button>
          <button
            className={styles.button}
            onClick={(e) => {
              e.preventDefault();
              resetActiveFiles();
            }}>
            Deselect All
          </button>
        </>
      )}
      <ModuleLine
        moduleName={'root'}
        children={fileMap}
        initiallyExpanded={true}
        globalActiveFiles={globalActiveFiles}
        setActiveFiles={setActiveFiles}
      />
    </div>
  );
};

export default Filepicker;

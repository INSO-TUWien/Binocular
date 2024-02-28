'use-strict';

import { useState, useEffect } from 'react';
import { Tooltip } from 'react-tippy';
import ModuleLine from './ModuleLine';
import styles from './styles.module.scss';
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
 * @param showSelectButtons (optional, default true) If set to false, the `Select All` and `Deselect All` buttons are hidden.
 * @param fileOwnership (optional) if set, colors in the filepicker will represent ownership of files and modules.
 *                      For every file, an object with authors as keys and owned lines as values is expected.
 *                      Example: {fortytwo.txt: {dev1: 50, dev2: 50}, foo/bar.txt: {dev1: 50}, foo/baz.txt: {dev3: 50}}
 * @param authorColors (optional, required if fileOwnership is set) object containing the colors for each author.
 *                     Example: {dev1: 'blue', dev2: 'green', dev3: 'red'}
 */
const Filepicker = ({
  fileList,
  globalActiveFiles = [],
  setActiveFiles,
  showSelectButtons = true,
  fileOwnership = null,
  authorColors = null,
}) => {
  const [fileMap, setFileMap] = useState({});
  const [readyToRender, setReadyToRender] = useState(false);
  const [useOwnershipData, setUseOwnershipData] = useState(false);

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

  useEffect(() => {
    if (fileOwnership) {
      setUseOwnershipData(true);
    } else {
      setUseOwnershipData(false);
    }
  }, [fileOwnership]);

  //every time the fileList changes, construct a map that has the same structure as the original directory
  //example:
  //files = [fortytwo.txt, foo/bar.txt, foo/baz.txt]
  //generated map:
  //{
  //  fortytwo.txt: { path: 'fortytwo.txt', ownership: {...}},
  //  foo: {
  //    bar.txt: { path: 'foo/bar.txt', ownership: {...} },
  //    baz.txt: { path: 'foo/baz.txt', ownership: {...} },
  //  }
  //}
  useEffect(() => {
    if (!fileList || fileList.length === 0) return;

    const fileMap = { children: {}, ownership: null };

    const set = (pathSplitArray, fileMap) => {
      //start at the top layer
      let map = fileMap;

      for (const pathItemIndex in pathSplitArray) {
        const pathItem = pathSplitArray[pathItemIndex];

        if (parseInt(pathItemIndex) === pathSplitArray.length - 1) {
          const fullPath = pathSplitArray.join('/');
          map[pathItem] = {
            path: fullPath,
            ownership: fileOwnership && useOwnershipData && fileOwnership[fullPath] ? fileOwnership[fullPath] : [],
          };
          break;
        }

        //if this path is not already in the map, create an empty object as value
        if (!map[pathItem]) {
          map[pathItem] = { children: {}, ownership: {} };
        }
        //follow the path
        map = map[pathItem].children;
      }
    };

    fileList
      .map((path) => path.split('/'))
      .forEach((pathSplitArray) => {
        set(pathSplitArray, fileMap.children);
      });

    //if ownership data is available
    if (fileOwnership && !_.isEqual(fileOwnership, {}) && useOwnershipData) {
      //calculate ownership for directories
      const dirOwnership = (obj) => {
        //if this is a directory
        if (obj.children) {
          const res = {};
          for (const [, child] of Object.entries(obj.children)) {
            const childModuleOwnership = dirOwnership(child);
            for (const { signature, ownedLines } of childModuleOwnership) {
              if (res[signature]) {
                res[signature] += ownedLines;
              } else {
                res[signature] = ownedLines;
              }
            }
          }
          obj.ownership = Object.entries(res).map(([sig, lines]) => {
            return { signature: sig, ownedLines: lines };
          });
        }
        return obj.ownership;
      };
      dirOwnership(fileMap);
    }

    setFileMap(fileMap);
    setReadyToRender(true);
  }, [fileList, fileOwnership, useOwnershipData]);

  if (!readyToRender) return;

  return (
    <div className={styles.filepicker}>
      <div className={styles.buttonBar}>
        <div>
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
        </div>

        <div>
          {fileOwnership && (
            <div>
              <Tooltip
                position="bottom"
                arrow={true}
                arrowSize="big"
                theme="transparent"
                title="The colors represent the current ownership distribution of a module/file">
                <input
                  id="ownershipSwitch"
                  type="checkbox"
                  name="ownershipSwitch"
                  className={'switch is-rounded is-outlined is-info'}
                  defaultChecked={true}
                  onChange={(e) => setUseOwnershipData(e.target.checked)}
                />
                <label htmlFor="ownershipSwitch" className={styles.switch}>
                  Show Ownership (?)
                </label>
              </Tooltip>
            </div>
          )}
        </div>
      </div>

      <ModuleLine
        moduleName={'root'}
        children={fileMap.children}
        ownership={useOwnershipData ? fileMap.ownership : null}
        authorColors={authorColors}
        initiallyExpanded={true}
        globalActiveFiles={globalActiveFiles}
        setActiveFiles={setActiveFiles}
      />
    </div>
  );
};

export default Filepicker;

'use-strict';

import { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import styles from './styles.module.scss';

/**
 * This component renders a list where the order can be changed by dragging the elements.
 * Optionally, elements can be displayed with a switch and/or a checkbox
 *
 * @param elements array containing labels for the elements.
 *                          Example: `['element1', 'element2', 'element3']`
 * @param onPositionChange function that receives the new list after users changed the order by dragging.
 *                         This function is meant to alter some local or global state in the parent component
 *                            that ultimately propagates the changes to this component via the `elements` parameter.
 *                         The order of the elements in the list is dependent on the `elements` parameter!
 *                         If `onPositionChange` does not alter it, the order of the elements displayed will not change.
 * @param onCheck (optional) If this function is provided, the checkbox is displayed.
 *                           This function is called with the element that has been (un)checked.
 *                           It is meant to be used to alter some local/global state.
 * @param checkedElements (optional, required if onCheck !== undefined)
 *                         Array that contains the elements that should be checked.
 *                         Elements are only checked if they are contained in this array!
 *                         If onCheck does not alter this prop, there will be no change.
 * @param onSwitch (optional) Similar to onCheck.
 * @param switchedElements (optional, required if onSwitch !== undefined) Similar to `checkedElements`.
 * @param switchLabel (optional) label displayed next to the switch
 */
const DragAndDropList = ({ elements, onPositionChange, onCheck, checkedElements, onSwitch, switchedElements, switchLabel = '' }) => {
  const itemDragged = useRef();
  const itemDraggedOver = useRef();

  const dragStart = (index) => {
    itemDragged.current = index;
  };

  const dragEnd = () => {
    const newList = _.cloneDeep(elements).filter((l, i) => i !== itemDragged.current);
    const draggedElement = elements[itemDragged.current];
    newList.splice(itemDraggedOver.current, 0, draggedElement);
    itemDragged.current = null;
    itemDraggedOver.current = null;
    onPositionChange(newList);
  };

  const dragOver = (index) => {
    itemDraggedOver.current = index;
  };

  const isChecked = (item) => {
    return checkedElements && checkedElements.includes(item);
  };

  const isSwitched = (item) => {
    return switchedElements && switchedElements.includes(item);
  };

  const onChangeCheckbox = (item) => {
    onCheck && onCheck(item);
  };

  const onChangeSwitch = (item) => {
    onSwitch && onSwitch(item);
  };

  return (
    <div>
      {
        <ul onDragOver={(e) => e.preventDefault()}>
          {elements.map((l, index) => {
            return (
              <li
                id={`list_item_${l}`}
                draggable={true}
                onDragOver={() => dragOver(index)}
                onDragStart={() => dragStart(index)}
                onDragEnd={() => dragEnd()}
                key={`dnd_list_item_${index}`}>
                <div className={styles.button + ' ' + styles.dndItem} disabled={!isChecked(l)}>
                  {/* only display checkbox when onCheck function is provided */}
                  {onCheck && <input type="checkbox" checked={isChecked(l)} onChange={() => onChangeCheckbox(l)} />}

                  <div className={styles.itemLabel}>
                    <span>{l}</span>
                  </div>

                  {/* only display switch when onSwitch function is provided */}
                  {onSwitch && (
                    <>
                      <input
                        id={`switch_split_${l}`}
                        type="checkbox"
                        name={`switch_split_${l}`}
                        className={'switch is-rounded is-outlined is-info'}
                        checked={isSwitched(l)}
                        onChange={() => onChangeSwitch(l)}
                      />
                      <label htmlFor={`switch_split_${l}`} className={styles.switch}>
                        {switchLabel}
                      </label>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      }
    </div>
  );
};

export default DragAndDropList;

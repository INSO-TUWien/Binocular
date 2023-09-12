'use strict';

import _ from 'lodash';
import cx from 'classnames';
import { callSafe } from '../../utils';
import React, { useState } from 'react';
import styles from './tabCombo.scss';

export default (props) => {
  const [selection, setSelection] = useState(props.value);
  const currSelectedIndex = props.options.findIndex((i) => i.value === selection);
  let borderRadiusSelection = '.2rem';
  if (currSelectedIndex === 0) {
    borderRadiusSelection = '.4rem .2rem .2rem .4rem';
  } else if (borderRadiusSelection === props.options.length - 1) {
    borderRadiusSelection = '.2rem .4rem .4rem .2rem';
  }

  return (
    <div className={styles.container}>
      <div
        className={styles.selection}
        style={{
          width: 'calc(' + 100 / props.options.length + '% - 6px)',
          left: (100 / props.options.length) * currSelectedIndex + '%',
          borderRadius: borderRadiusSelection,
        }}></div>
      {props.options.map((item, i) => {
        return (
          <button
            key={'multiSwitchItem-' + item.label}
            className={styles.button + (i === 0 ? ' ' + styles.firstButton : i === props.options.length - 1 ? ' ' + styles.lastButton : '')}
            style={{
              width: 100 / props.options.length + '%',
              left: (100 / props.options.length) * i + '%',
              color: item.value === selection ? 'white' : 'black',
            }}
            onClick={() => {
              setSelection(item.value);
              props.onChange(item.value);
            }}>
            <div>
              {item.icon && (
                <span className="icon is-small" style={{ marginRight: '.5rem' }}>
                  <i className={`fa fa-${item.icon}`} />
                </span>
              )}
              <span>{item.label}</span>
            </div>
            {item.hint && <div className={styles.hint}>({item.hint})</div>}
          </button>
        );
      })}
    </div>
  );
};

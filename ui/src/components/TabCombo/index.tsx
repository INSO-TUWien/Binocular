'use strict';

import * as React from 'react';
import styles from './tabCombo.scss';

interface Props {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

interface Option {
  label: string;
  value: string;
  icon?: string;
  hint?: string;
}

export default (props: Props) => {
  const [selection, setSelection] = React.useState(props.value);
  const currSelectedIndex = props.options.findIndex((i: Option) => i.value === selection);
  let borderRadiusSelection = '.2rem';
  if (currSelectedIndex === 0) {
    borderRadiusSelection = '.4rem .2rem .2rem .4rem';
  } else if (currSelectedIndex === props.options.length - 1) {
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
      {props.options.map((item: Option, i: number) => {
        return (
          <button
            key={'multiSwitchItem-' + item.label}
            className={styles.button + (i === 0 ? ' ' + styles.firstButton : i === props.options.length - 1 ? ' ' + styles.lastButton : '')}
            style={{
              width: 100 / props.options.length + '%',
              left: (100 / props.options.length) * i + '%',
              color: item.value === selection ? 'white' : 'black',
            }}
            onClick={(e) => {
              e.preventDefault();
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

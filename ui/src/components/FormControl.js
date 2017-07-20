'use strict';

import cx from 'classnames';

import Labeled from './Labeled.js';

export default function FormControl(props) {
  const { input, label, type, meta, placeholder } = props;

  const fieldClasses = cx('field', {
    'has-addons': !!props.children
  });

  const pClasses = cx('control', {
    'is-expanded': !!props.children
  });

  const control = (
    <div className={fieldClasses}>
      <p className={pClasses}>
        <input
          className={cx('input', { 'is-danger': !!meta.error })}
          type={type}
          placeholder={placeholder}
          {...input}
        />
        {!!meta.error &&
          <span className="help is-danger">
            {meta.error}
          </span>}
      </p>
      {props.children}
    </div>
  );

  if (label) {
    return (
      <Labeled label={label}>
        {control}
      </Labeled>
    );
  }

  return control;
}

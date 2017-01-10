'use strict';

import React from 'react';
import cx from 'classnames';

import Labeled from './Labeled.jsx';

export default function( attrs ) {
  const { input, label, type, meta, icon, placeholder } = attrs;

  const control = (
    <p className={cx('control', {'has-icon': !!icon, 'is-expanded': !!attrs['is-expanded']} )}>
      <input className={cx('input', { 'is-danger': !!meta.error })}
              type={type}
              placeholder={placeholder}
              {...input} />
      {!!icon &&
        <span className='icon is-small'>
          <i className={cx('fa', `fa-${icon}`)} />
        </span>
      }
      {!!meta.error &&
        <span className='help is-danger'>{meta.error}</span>
      }
    </p>
  );

  if( label ) {
    return (
      <Labeled label={label}>
        {control}
      </Labeled>
    );
  }

  return control;
};

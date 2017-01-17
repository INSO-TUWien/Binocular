'use strict';

import React from 'react';
import cx from 'classnames';

import Labeled from './Labeled.jsx';

export default function( attrs ) {
  const { input, label, type, meta, icon, placeholder } = attrs;

  const pClasses = cx( 'control', {
    'has-icon': !!icon,
    'is-expanded': !!attrs['is-expanded'],
    'has-addons': !!attrs.children
  } );

  const control = (
    <p className={pClasses}>
      <input className={cx('input', { 'is-danger': !!meta.error, 'is-expanded': !!attrs.children })}
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
      {attrs.children}
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

'use strict';

import React from 'react';
import cx from 'classnames';

export default function({ input, label, type, meta, icon, placeholder }) {
  return (
    <div>
      {!!label &&
      <label className='label'>{label}</label>
      }
      <p className={cx('control', {'has-icon': !!icon} )}>
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
    </div>
  );
};

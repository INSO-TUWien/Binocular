'use strict';

import React from 'react';
import cx from 'classnames';

export default function( props ) {

  return (
    <div>
      {!!props.label &&
      <label className='label'>{props.label}</label>
      }
      {props.children}
    </div>
  );
};

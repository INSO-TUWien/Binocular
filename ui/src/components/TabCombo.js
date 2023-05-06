'use strict';

import _ from 'lodash';
import cx from 'classnames';
import { callSafe } from '../utils';

export default (props) => {
  const items = _.map(props.options, (option, i) => (
    <li key={i} className={cx({ 'is-active': option.value === props.value })}>
      <a onClick={() => callSafe(props.onChange)(option.value)}>
        <span className="icon is-small">{option.icon && <i className={`fa fa-${option.icon}`} />}</span>
        <span>{option.label}</span>
      </a>
    </li>
  ));

  return (
    <div className="tabs is-toggle">
      <ul>{items}</ul>
    </div>
  );
};

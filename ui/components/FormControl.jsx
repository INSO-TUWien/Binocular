'use strict';

import React from 'react';
import cx from 'classnames';

export default class FormControl extends React.Component {
  render() {

    return (
      <div>
        {!!this.props.label &&
        <label className='label'>{this.props.label}</label>
        }
        <p className={cx('control', {'has-icon': !!this.props.icon} )}>
          <input className='input' type={this.props.type} placeholder={this.props.placeholder} />
          {!!this.props.icon &&
            <span className='icon is-small'>
              <i className={cx('fa', `fa-${this.props.icon}`)} />
            </span>
          }
        </p>
      </div>
    );
  }
}

FormControl.propTypes = {
  type: React.PropTypes.string.isRequired
};

'use strict';

import React from 'react';
import { Field, reduxForm } from 'redux-form';
import cx from 'classnames';

import Message from '../message';
import Monospaced from '../monospaced';
import Icon from '../icon';
import FormControl from '../FormControl.jsx';

import styles from './config-dialog.scss';

const validatePort = function( port ) {
  
  if( isNaN(port) || port < 1 || port > 65535 ) {
    return 'Invalid port';
  }
};


class ConfigDialog extends React.Component {
  render() {
    return (
      <form className={cx( 'modal', {'is-active': this.props.active} ) }
            onSubmit={this.props.handleSubmit}>
        <div className='modal-background' onClick={this.props.onCancel} />
        <div className='modal-card'>
          <div className='modal-card-head'>
            <p className='modal-card-title'>
              Configuration
            </p>
            <button className='delete' onClick={this.props.onCancel} />
          </div>
          <section className='modal-card-body'>
            <Message>
              Configuration will be saved to <Monospaced>{this.props.target}</Monospaced>.
            </Message>
            <Field component={FormControl}
                    name='gitlabUrl'
                    type='text'
                    label='GitLab-URL:'
                    icon='gitlab'
                    placeholder='http://www.gitlab.com/' />

            <Field component={FormControl}
                    name='arangoHost'
                    type='text'
                    label='ArangoDB-Host:'
                    placeholder='localhost' />
            <Field component={FormControl}
                    validate={validatePort}
                    name='arangoPort'
                    type='text'
                    label='ArangoDB-Port:'
                    placeholder='8529' />
            <Field component={FormControl}
                    name='arangoUser'
                    type='text'
                    label='ArangoDB-User:'
                    placeholder='root' />
            <Field component={FormControl}
                    name='arangoPassword'
                    type='password'
                    label='ArangoDB-Password:' />
          </section>
          <footer className='modal-card-foot'>
            <button type='submit' className='button is-primary'>OK</button>
            <a href='#' className='button' onClick={this.props.onCancel}>Cancel</a>
          </footer>
        </div>
      </form>
    );
  }
}

export default reduxForm( { form: 'configForm' } )( ConfigDialog );

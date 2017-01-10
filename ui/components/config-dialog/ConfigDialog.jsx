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
      <div className='modal is-active'>
        <div className='modal-background' />
        <div className='modal-card'>
          <div className='modal-card-head'>
            <p className='modal-card-title'>
              Configuration
            </p>
            <button className='delete' />
          </div>
          <section className='modal-card-body'>
            <Message>
              Configuration will be saved to <Monospaced>{this.props.target}</Monospaced>.
            </Message>
            <form onSubmit={this.props.handleSubmit}>
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
            </form>
          </section>
          <footer className='modal-card-foot'>
            <a href='#' className='button is-primary'>OK</a>
            <a href='#' className='button'>Cancel</a>
          </footer>
        </div>
      </div>
    );
  }
}

export default reduxForm( { form: 'configForm' } )( ConfigDialog );

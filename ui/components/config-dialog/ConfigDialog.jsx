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
            <div className='box'>
              <h2 className='subtitle'><Icon name='gitlab' /> GitLab</h2>
              <Field component={FormControl}
                      name='gitlabUrl'
                      type='text'
                      label='URL:'
                      placeholder='http://www.gitlab.com/' />
              <Field component={FormControl}
                      name='gitlabToken'
                      type='text'
                      label='Private token:'
                      placeholder='Generate this token in your GitLab' >
                <a href='https://docs.gitlab.com/ee/api/README.html#personal-access-tokens'
                   target='_blank'
                   className='button is-info'>
                  ?
                </a>
              </Field>
            </div>

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

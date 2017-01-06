'use strict';

import React from 'react';
import Message from '../message';
import Monospaced from '../monospaced';
import Icon from '../icon';
import FormControl from '../FormControl.jsx';

import styles from './config-dialog.scss';

export default class ConfigDialog extends React.Component {
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
              Configuration will be saved to <Monospaced>{this.props.config.config}</Monospaced>.
            </Message>
            <form>
              <FormControl type='text'
                           label='GitLab-URL:'
                           icon='gitlab'
                           placeholder='http://www.gitlab.com/' />
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

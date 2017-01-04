'use strict';

import React from 'react';
import bulma from 'bulma';
import Message from '../message';
import Monospaced from '../monospaced';

import cx from 'classnames';

export default class ConfigDialog extends React.Component {
  render() {
    return (
      <div className={cx(bulma.modal, bulma['is-active'])}>
        <div className={bulma['modal-background']} />
        <div className={bulma['modal-card']}>
          <div className={bulma['modal-card-head']}>
            <p className={bulma['modal-card-title']}>
              Configuration
            </p>
            <button className={bulma['delete']} />
          </div>
          <section className={bulma['modal-card-body']}>
            <Message>
              Your config will be saved to <Monospaced>{this.props.config.config}</Monospaced>
            </Message>
            <form>
            </form>
          </section>
          <footer className={bulma['modal-card-foot']}>
            <a href='#' className={cx(bulma.button, bulma['is-primary'])}>OK</a>
            <a href='#' className={bulma.button}>Cancel</a>
          </footer>
        </div>
      </div>
    );
  }
}

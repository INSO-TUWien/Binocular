'use strict';

import { Field, reduxForm } from 'redux-form';
import cx from 'classnames';

import Message from '../message';
import Monospaced from '../monospaced';
import FormControl from '../FormControl.js';
import Labeled from '../Labeled.js';

const ConfigDialog = props => {
  return (
    <form className={cx('modal', { 'is-active': props.active })} onSubmit={props.handleSubmit}>
      <div className="modal-background" onClick={props.onCancel} />
      <div className="modal-card">
        <div className="modal-card-head">
          <p className="modal-card-title">Configuration</p>
          <button className="delete" onClick={props.onCancel} />
        </div>
        <section className="modal-card-body">
          <Message>
            Configuration will be saved to <Monospaced>{props.target}</Monospaced>.
          </Message>

          <div className="tabs is-centered">
            <ul>
              <li className={cx({ 'is-active': props.activeTab === 'its' })}>
                <a onClick={() => props.onSwitchTab('its')}>
                  <span className="icon is-small">
                    <i className="fa fa-ticket-alt" />
                  </span>
                  <span>ITS</span>
                </a>
              </li>
              <li className={cx({ 'is-active': props.activeTab === 'arango' })}>
                <a onClick={() => props.onSwitchTab('arango')}>
                  <span className="icon is-small">
                    <i className="fa fa-database" />
                  </span>
                  <span>ArangoDB</span>
                </a>
              </li>
            </ul>
          </div>

          {props.activeTab === 'its' &&
            <div>
              <Labeled className="field" label="Type:">
                <div className="control">
                  <div className="select">
                    <Field component="select" name="itsType">
                      <option value="github">GitHub</option>
                      <option value="gitlab">GitLab</option>
                    </Field>
                  </div>
                </div>
              </Labeled>
              <Field
                component={FormControl}
                name="gitlabUrl"
                type="text"
                label="URL:"
                placeholder="http://www.gitlab.com/"
              />
              <Field
                component={FormControl}
                name="gitlabToken"
                type="text"
                label="Private token:"
                placeholder="Generate this token in your GitLab">
                <p className="control">
                  <a
                    href="https://docs.gitlab.com/ee/api/README.html#personal-access-tokens"
                    target="_blank"
                    className="button is-info">
                    ?
                  </a>
                </p>
              </Field>
            </div>}
          {props.activeTab === 'arango' &&
            <div>
              <Field
                component={FormControl}
                name="arangoHost"
                type="text"
                label="Host:"
                placeholder="localhost"
              />
              <Field
                component={FormControl}
                name="arangoPort"
                type="text"
                label="Port:"
                placeholder="8529"
              />
              <Field
                component={FormControl}
                name="arangoUser"
                type="text"
                label="Username:"
                placeholder="root"
              />
              <Field
                component={FormControl}
                name="arangoPassword"
                type="password"
                label="Password:"
                placeholder="*********"
              />
            </div>}
        </section>
        <footer className="modal-card-foot">
          <button type="submit" className="button is-primary">
            OK
          </button>
          <a href="#" className="button" onClick={props.onCancel}>
            Cancel
          </a>
        </footer>
      </div>
    </form>
  );
};

export default reduxForm({ form: 'configForm' })(ConfigDialog);

'use strict';

import React from 'react';

import styles from './styles.scss';

export default class SymbolLifespanConfig extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={styles.configContainer}>
        <div className="config-wrapper is-overlay">
          <form className="m-3">
            <div className="field">
              <div className="control">
                <input
                  className="input is-rounded"
                  type="text"
                  placeholder="Enter a symbol..."
                  defaultValue={'loader'}
                />
              </div>
            </div>
            <div className="field is-grouped is-justify-content-space-between">
              <div className="field has-addons mb-0">
                <div className="control">
                  <button className="button is-link is-light is-small is-rounded is-active">
                    Days
                  </button>
                </div>
                <div className="control">
                  <button className="button is-link is-light is-small is-rounded">Weeks</button>
                </div>
                <div className="control">
                  <button className="button is-link is-light is-small is-rounded">Months</button>
                </div>
              </div>
              <div className="field is-grouped">
                <div className="control mr-3">
                  <button className="button is-link is-light is-small is-rounded">Sort</button>
                </div>
                <div className="control">
                  <button className="button is-link is-light is-small is-rounded">Filter</button>
                </div>
              </div>
            </div>
          </form>
          <section className="results">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => {
              return (
                <div className="result" key={n}>
                  <div className="icon" />
                  <div className="info">
                    <div className="type">Instance variable {n} in LoadersGroup</div>
                    <div className="symbol">
                      data<b>Loader</b>
                    </div>
                    <div className="file">
                      <a href="#">src/components/loaders/LoadersGroup.js</a>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        </div>
      </div>
    );
  }
}

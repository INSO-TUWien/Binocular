'use strict';

import React from 'react';
import cx from 'classnames';

import styles from './styles.scss';

export default class SymbolLifespanConfig extends React.PureComponent {
  constructor(props) {
    super(props);
    this.zoomGranularities = [
      { label: 'Days', value: 'd' },
      { label: 'Weeks', value: 'w' },
      { label: 'Months', value: 'm' }
    ];
    this.state = {
      searchTermInput: '',
      searchTermCurrent: '',
      activeZoom: this.zoomGranularities[0].value,
    };
  }

  changeZoom(granularity) {
    this.setState({
      activeZoom: granularity.value
    });
  }

  changeSearchTerm(ev) {
    this.setState({
      searchTermInput: ev.target.value
    });
  }

  search(ev) {
    this.setState({
      searchTermCurrent: this.state.searchTermInput
    });
    ev.preventDefault();
  }

  }

  render() {
    const buttonClasses = 'button is-link is-light is-small is-rounded';
    return (
      <div className={styles.configContainer}>
        <div className="config-wrapper is-overlay">
          <form className="m-3" onSubmit={e => this.search(e)}>
            <div className="field">
              <div className="control has-icons-right">
                <input
                  id="term"
                  className="input is-rounded"
                  type="text"
                  placeholder="Enter a symbol name..."
                  value={this.state.searchTermInput}
                  onChange={e => this.changeSearchTerm(e)}
                  autoComplete="off"
                />
                <span className="icon is-small is-right">
                  <i className="fas fa-search" />
                </span>
              </div>
            </div>
            <div className="field is-grouped is-justify-content-space-between">
              <div className="field has-addons mb-0">
                {this.zoomGranularities.map(g => (
                  <div className="control" key={g.value}>
                    <button
                      type="button"
                      className={cx(
                        buttonClasses,
                        this.state.activeZoom === g.value && 'is-active'
                      )}
                      onClick={() => this.changeZoom(g)}>
                      {g.label}
                    </button>
                  </div>
                ))}
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

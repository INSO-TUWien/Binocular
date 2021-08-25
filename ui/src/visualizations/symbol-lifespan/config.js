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
    this.submenus = [{ label: 'Sort', value: 'sort' }, { label: 'Filter', value: 'filter' }];
    this.state = {
      searchTermInput: '',
      searchTermCurrent: '',
      activeZoom: this.zoomGranularities[0].value,
      openSubmenu: null
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

  toggleMenu(menu) {
    const openSubmenu = this.state.openSubmenu;
    this.setState({
      openSubmenu: openSubmenu === menu.value ? null : menu.value
    });
  }

  }

  render() {
    const buttonClasses = 'button is-link is-light is-small is-rounded';
    const showIfSubmenuOpen = menu => ({
      display: this.state.openSubmenu === menu ? 'block' : 'none'
    });
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
                {this.submenus.map((m, i, a) => (
                  <div className={cx('control', i < a.length - 1 && 'mr-3')} key={m.value}>
                    <button
                      className={cx(
                        buttonClasses,
                        this.state.openSubmenu === m.value && 'is-active'
                      )}
                      type="button"
                      onClick={() => this.toggleMenu(m)}>
                      {m.label}
                    </button>
                  </div>
                ))}
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

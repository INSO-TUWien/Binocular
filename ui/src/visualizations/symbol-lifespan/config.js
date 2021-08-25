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
    this.sortOptions = [
      { label: 'Relevance', value: 'v', order: null },
      { label: 'Lifespan length', value: 'l', order: 'number', defaultOrder: 'desc' },
      { label: 'Date added', value: 'a', order: 'date', defaultOrder: 'desc' },
      { label: 'Date removed', value: 'd', order: 'date', defaultOrder: 'desc' },
      { label: 'Date last changed', value: 'c', order: 'date', defaultOrder: 'desc' }
    ];
    this.state = {
      searchTermInput: '',
      searchTermCurrent: '',
      activeZoom: this.zoomGranularities[0].value,
      sortCriteria: this.sortOptions[0].value,
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

  changeSortCriteria(ev) {
    this.setState({
      sortCriteria: ev.target.value
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
          <section className="submenu px-4 pb-4" style={showIfSubmenuOpen('sort')}>
            <h3 className="is-size-6 has-text-weight-medium">Sort results by&hellip;</h3>
            <section onChange={e => this.changeSortCriteria(e)}>
              {this.sortOptions.map(o => (
                <div className="control pt-2" key={o.value}>
                  <label className="radio">
                    <input
                      type="radio"
                      name="sl-sort"
                      value={o.value}
                      defaultChecked={o.value === this.state.sortCriteria}
                    />
                    &ensp;{o.label}
                  </label>
                </div>
              ))}
            </section>
          </section>
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

'use strict';

import React from 'react';
import cx from 'classnames';

import styles from './styles.scss';
import { Submenu, ZoomGranularity } from './enum';

export default class SymbolLifespanConfig extends React.PureComponent {
  constructor(props) {
    super(props);
    this.sortOptions = [
      { label: 'Relevance', value: 'v', order: null },
      { label: 'Lifespan length', value: 'l', order: 'number', defaultOrder: 'desc' },
      { label: 'Date added', value: 'a', order: 'date', defaultOrder: 'desc' },
      { label: 'Date removed', value: 'd', order: 'date', defaultOrder: 'desc' },
      { label: 'Date last changed', value: 'c', order: 'date', defaultOrder: 'desc' }
    ];
    this.filterCategories = [
      {
        label: 'With symbol type',
        value: 'include',
        options: [
          { label: 'Function names', value: 'function' },
          { label: 'Class names', value: 'class' },
          { label: 'Interface names', value: 'interface', ts: true },
          { label: 'Enum names', value: 'enum', ts: true },
          { label: 'Type alias names', value: 'alias', ts: true },
          { label: 'Type parameters', value: 'type', ts: true },
          { label: 'Plain object keys', value: 'key' },
          { label: 'Class members', value: 'static' },
          { label: 'Instance members', value: 'instance' },
          { label: 'Function parameters', value: 'param' },
          { label: 'Local variables', value: 'local' },
          { label: 'Statement labels', value: 'label' },
          { label: 'Import aliases', value: 'import' },
          { label: 'Ambient module names', value: 'module', ts: true }
        ],
        initial: [
          'function',
          'class',
          'interface',
          'enum',
          'alias',
          'type',
          'key',
          'static',
          'instance',
          'param',
          'local',
          'label',
          'import',
          'module'
        ]
      },
      {
        label: 'Unless they are',
        value: 'exclude',
        options: [
          { label: 'Global variables', value: 'global' },
          { label: 'Reassignable', value: 'let' },
          { label: 'Readonly', value: 'readonly', ts: true },
          { label: 'Anonymous function parameters', value: 'anonymous' },
          { label: 'Optional function parameters', value: 'optional' },
          { label: 'Function type parameters', value: 'function-type', ts: true },
          { label: 'Ambient declarations', value: 'ambient', ts: true },
          { label: 'Export aliases', value: 'export', ts: true },
          { label: 'Loop variables', value: 'loop' },
          { label: 'Single-letter variables', value: 'short' },
          { label: 'Initialized on declaration', value: 'initialized' }
        ],
        initial: []
      }
    ];
    this.zoomGranularities = ZoomGranularity.values;
    this.submenus = Submenu.values.filter(m => m !== Submenu.NONE);
    this.state = {
      searchTermInput: '',
      searchTermCurrent: '',
      sortCriteria: this.sortOptions[0].value,
      filters: this.filterCategories
        .map(c => ({ [c.value]: c.initial }))
        .reduce((a, v) => Object.assign({}, a, v)),
      granularity: ZoomGranularity.DAYS,
      openSubmenu: Submenu.NONE
    };
  }

  changeGranularity(granularity) {
    this.setState({
      granularity
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

  toggleSubmenu(menu) {
    const openSubmenu = this.state.openSubmenu;
    const newSubmenu = openSubmenu === menu ? Submenu.NONE : menu;
    this.setState({
      openSubmenu: newSubmenu
    });
  }

  changeSortCriteria(ev) {
    this.setState({
      sortCriteria: ev.target.value
    });
  }

  changeFilters(ev, cat) {
    const { name, checked } = ev.target;
    let catFilters = this.state.filters[cat.value].slice(); // Copy array for snapshot behavior
    // Add or remove name depending on the checkbox state
    if (checked) {
      catFilters.push(name);
    } else {
      catFilters = catFilters.filter(n => n !== name); // Makes sure to remove duplicates, as well
    }
    // Deep state patching is not supported, so create plain object patch and apply it with Object.assign
    const newFilters = { [cat.value]: catFilters };
    this.setState({
      filters: Object.assign({}, this.state.filters, newFilters)
    });
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
                      className={cx(buttonClasses, g === this.state.granularity && 'is-active')}
                      onClick={() => this.changeGranularity(g)}>
                      {g.label}
                    </button>
                  </div>
                ))}
              </div>
              <div className="field is-grouped">
                {this.submenus.map((m, i, a) => (
                  <div className={cx('control', i < a.length - 1 && 'mr-3')} key={m.value}>
                    <button
                      className={cx(buttonClasses, m === this.state.openSubmenu && 'is-active')}
                      type="button"
                      onClick={() => this.toggleSubmenu(m)}>
                      {m.label}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </form>
          <section className="submenu px-4 pb-4" style={showIfSubmenuOpen(Submenu.SORT)}>
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
          <section className="submenu px-4 pb-4" style={showIfSubmenuOpen(Submenu.FILTER)}>
            <h3 className="is-size-6 has-text-weight-medium">Only find symbols&hellip;</h3>
            {this.filterCategories.map(c => (
              <section key={c.value} onChange={e => this.changeFilters(e, c)}>
                <h4 className="is-size-6 mt-3">{c.label}:</h4>
                {c.options
                  .filter(o => !o.ts)
                  .map(o => (
                    <div className="control pt-2" key={o.value}>
                      <label className="checkbox">
                        <input
                          type="checkbox"
                          name={o.value}
                          checked={this.state.filters[c.value].includes(o.value)}
                          defaultChecked={this.state.filters[c.value].includes(o.value)}
                        />
                        &ensp;{o.label}
                        {o.ts && <sup className="has-text-link">TS</sup>}
                      </label>
                    </div>
                  ))}
              </section>
            ))}
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

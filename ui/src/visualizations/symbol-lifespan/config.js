'use strict';

import React from 'react';
import cx from 'classnames';

import styles from './styles.scss';
import { FilterCategory, InclusionFilter, SortCriterion, Submenu, ZoomGranularity } from './enum';

export default class SymbolLifespanConfig extends React.PureComponent {
  constructor(props) {
    super(props);
    this.zoomGranularities = ZoomGranularity.values;
    this.submenus = Submenu.values.filter(m => m !== Submenu.NONE);
    this.sortCriteria = SortCriterion.values;
    this.filterCategories = FilterCategory.values;
    this.state = {
      searchTermInput: '',
      searchTermCurrent: '',
      granularity: ZoomGranularity.DAYS,
      sortCriterion: SortCriterion.RELEVANCE,
      [FilterCategory.INCLUSION_FILTERS.value]: InclusionFilter.values.slice(),
      [FilterCategory.EXCLUSION_FILTERS.value]: [],
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

  changeSortCriterion(event) {
    const sortCriterion = SortCriterion.fromValue(event.target.value);
    this.setState({
      sortCriterion
    });
  }

  changeFilters(event, category) {
    const { name, checked } = event.target;
    const options = category.options;
    const option = options.fromValue(name);
    console.debug(`${category} ${name} ${checked}`);
    let filters = this.state[category.value].slice();
    if (checked) {
      filters.push(option);
    } else {
      filters = filters.filter(o => o !== option); // Makes sure to remove duplicates, as well
    }
    this.setState({
      [category.value]: filters
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
            <section onChange={e => this.changeSortCriterion(e)}>
              {this.sortCriteria.map(c => (
                <div className="control pt-2" key={c.value}>
                  <label className="radio">
                    <input
                      type="radio"
                      name="sl-sort"
                      value={c.value}
                      defaultChecked={c === this.state.sortCriterion}
                    />
                    &ensp;{c.label}
                  </label>
                </div>
              ))}
            </section>
          </section>
          <section className="submenu px-4 pb-4" style={showIfSubmenuOpen(Submenu.FILTER)}>
            <h3 className="is-size-6 has-text-weight-medium">Only find symbols&hellip;</h3>
            {this.filterCategories.map(c => (
              <section
                className="columns flex-wrap mb-0"
                key={c.value}
                onChange={e => this.changeFilters(e, c)}>
                <h4 className="column is-12 is-size-6 mt-3 pb-1">{c.label}</h4>
                {c.options.values
                  .filter(o => !o.ts)
                  .map(o => (
                    <div className="column is-6 control px-3 py-1" key={o.value}>
                      <label className="checkbox">
                        <input
                          type="checkbox"
                          className="mr-0"
                          name={o.value}
                          checked={this.state[c.value].includes(o)}
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

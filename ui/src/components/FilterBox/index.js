'use strict';

import React from 'react';
import _ from 'lodash';
import cx from 'classnames';
import fuzzy from 'fuzzy';

import styles from './styles.scss';

export default class FilterBox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      filterText: '',
    };
    _.merge(this.state, this.extractOptions(props));
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.extractOptions(nextProps));
  }

  getCheckedOptions() {
    return _(this.state.options)
      .filter((o) => o.checked)
      .map('value')
      .value();
  }

  render() {
    const filteredOptions = fuzzy
      .filter(this.state.filterText, this.state.options, {
        extract: (o) => o.label,
      })
      .map((o) => o.original);

    const options = filteredOptions.map((o, i) => {
      return (
        <li key={i}>
          <label className="checkbox">
            <input
              className="checkbox"
              type="checkbox"
              checked={o.checked ? 'checked' : ''}
              onChange={() => {
                const payload = this.getCheckedOptions();

                if (o.checked) {
                  _.remove(payload, (e) => e === o.value);
                } else {
                  payload.push(o.value);
                }

                this.props.onChange(payload);
              }}
            />
            {o.label}
          </label>
        </li>
      );
    });

    return (
      <div className={cx(styles.filterBox)}>
        <div className={'control has-icons-right'}>
          <input
            className={cx('input')}
            type="text"
            placeholder={this.props.placeholder || 'Filter...'}
            value={this.state.filterText}
            onChange={(e) => this.setState({ filterText: e.target.value })}
          />
          <span className={cx('icon', 'is-small is-right')}>
            <i className={cx('fa', 'fa-search')} />
          </span>
        </div>
        <ul>{options}</ul>
      </div>
    );
  }

  extractOptions(props) {
    const options = _.map(props.options, (o) => {
      return {
        label: o.label,
        value: o.value,
        checked: _.includes(props.checkedOptions, o.value),
      };
    });

    return {
      options,
    };
  }
}

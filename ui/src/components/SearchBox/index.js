'use strict';

import Promise from 'bluebird';
import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import cx from 'classnames';

import styles from './styles.scss';

export default class SearchBox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
      isSearching: false,
      activeSearch: null,
      options: [],
      selectedIndex: null,
      dirty: false,
      searchText: ''
    };
  }

  componentWillMount() {
    if (!this.props.value) {
      this.search('');
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value) {
      const idx = _.findIndex(this.state.options, o => o === nextProps.value);
      this.setState({ selectedIndex: idx });
    }
  }

  render() {
    const suggestions = this.state.options.map((o, i) =>
      <div
        ref={div => {
          if (i === this.state.selectedIndex) {
            this.selectedDiv = div;
          }
        }}
        className={cx(styles.suggestion, { [styles.isSelected]: i === this.state.selectedIndex })}
        key={i}
        onClick={this.select.bind(this, o)}>
        {this.props.renderOption(o)}
      </div>
    );

    return (
      <div
        className={cx('control has-icons-right', {
          [styles.isOpen]: this.state.isOpen,
          [styles.hasValue]: !!this.props.value
        })}>
        <input
          className={cx('input')}
          type="text"
          placeholder={this.props.placeholder}
          value={
            this.props.value && !this.state.dirty
              ? this.props.renderOption(this.props.value)
              : this.state.searchText
          }
          onFocus={() => this.setState({ isOpen: true })}
          onBlur={() => this.cancel()}
          onChange={e => this.search(e.target.value)}
          onKeyDown={e => this.onKeyDown(e)}
        />
        <span className={cx('icon', 'is-small is-right', styles.icon)} onClick={() => this.clear()}>
          <i
            className={cx('fa', {
              'fa-times': !!this.props.value,
              'fa-search': !this.props.value,
              'fa-circle-o-notch': this.state.isSearching,
              'fa-spin': this.state.isSearching
            })}
          />
        </span>
        {this.state.isOpen &&
          <div className={cx(styles.suggestions)}>
            {suggestions}
          </div>}
      </div>
    );
  }

  clear() {
    if (this.props.onChange) {
      this.props.onChange(null);
    }

    this.setState({
      searchText: '',
      dirty: false
    });
  }

  search(text) {
    clearTimeout(this.cancelTimer);
    const activeSearch = Promise.try(() => this.props.search(text)).then(options => {
      // make sure not to signal end when there is a more recent
      // search active
      if (this.state.activeSearch === activeSearch) {
        this.setState({
          isSearching: false,
          activeSearch: null,
          options,
          selectedIndex:
            this.state.selectedIndex === null
              ? 0
              : Math.min(this.state.selectedIndex, options.length - 1)
        });
      }
    });

    this.setState(
      {
        searchText: text,
        isSearching: true,
        dirty: true,
        activeSearch
      },
      () => null
    );
  }

  cancel() {
    this.cancelTimer = setTimeout(() => {
      this.setState({ isOpen: false });

      if (this.props.onChange) {
        this.props.onChange(null);
      }
    }, 300);
  }

  select(option) {
    clearTimeout(this.cancelTimer);
    if (this.props.onChange) {
      this.props.onChange(option);
    }
    this.setState({ dirty: false, isOpen: false });
  }

  onKeyDown(e) {
    let { selectedIndex, isOpen } = this.state;
    if (e.key === 'Enter') {
      e.preventDefault();
      if (this.state.options[selectedIndex]) {
        this.select(this.state.options[selectedIndex]);
      }
      return false;
    } else if (e.key === 'Escape') {
      this.clear();
      return false;
    }

    if (e.key === 'ArrowDown' || (e.key === 'j' && e.ctrlKey)) {
      selectedIndex = Math.min(this.state.options.length - 1, selectedIndex + 1);
      isOpen = true;
    } else if (e.key === 'ArrowUp' || (e.key === 'k' && e.ctrlKey)) {
      selectedIndex = Math.max(0, selectedIndex - 1);
      isOpen = true;
    }

    if (this.selectedDiv) {
      this.selectedDiv.scrollIntoView({ block: 'end', behaviour: 'smooth' });
    }

    this.setState({ selectedIndex, isOpen });

    return false;
  }
}

SearchBox.propTypes = {
  renderOption: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  search: PropTypes.func.isRequired
};

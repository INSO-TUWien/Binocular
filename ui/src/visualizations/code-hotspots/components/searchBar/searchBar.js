import React from 'react';
import styles from './searchBar.scss';
import SearchAlgorithm from './searchAlgorithm';
import SearchTextHighlighting from './searchTextHighlighting';

export default class searchBar extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const { searchType, data, onSearchChanged } = this.props;
    return (
      <div className={styles.searchBoxHint}>
        <div className={styles.searchBox}>
          <span className={styles.placeholder}>Search for files!</span>
        </div>
        <input
          id={'fileSearch'}
          className={styles.searchBoxInput}
          placeholder={'Search for files'}
          onFocus={e => {
            if (e.target.parentElement.children[0].innerHTML.includes('placeholder')) {
              e.target.parentElement.children[0].innerHTML = '';
            }
          }}
          onBlur={e => {
            if (e.target.parentElement.children[0].innerHTML === '') {
              e.target.parentElement.children[0].innerHTML = '<span class="' + styles.placeholder + '">Search for files!</span>';
            }
          }}
          onChange={e => {
            if (e.target.value === ' ') {
              e.target.value = '';
            }
            e.target.value = e.target.value.replace(/ +(?= )/g, '');
            switch (searchType) {
              case 'fileSearch':
                e.target.parentElement.children[0].innerHTML = SearchTextHighlighting.performFileSearchTextHighlighting(e.target.value);
                onSearchChanged(SearchAlgorithm.performFileSearch(data, e.target.value));
                break;
              default:
                e.target.parentElement.children[0].innerHTML = e.target.value;
                onSearchChanged(data);
                break;
            }
          }}
        />
        <span>i: -f [term] search file; -t [term] search file type</span>
      </div>
    );
  }
}

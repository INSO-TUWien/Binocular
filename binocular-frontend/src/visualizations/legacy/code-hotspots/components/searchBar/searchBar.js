import React from 'react';
import styles from './searchBar.module.scss';
import SearchAlgorithm from './searchAlgorithm';
import SearchTextHighlighting from './searchTextHighlighting';

export default class searchBar extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const { searchType, data, onSearchChanged, placeholder, hint } = this.props;
    return (
      <div className={styles.searchBoxHint}>
        <div className={styles.searchBox}>
          <span className={styles.placeholder}>{placeholder}</span>
        </div>
        <input
          className={styles.searchBoxInput}
          onFocus={(e) => {
            if (e.target.parentElement.children[0].innerHTML.includes('placeholder')) {
              e.target.parentElement.children[0].innerHTML = '';
            }
          }}
          onBlur={(e) => {
            if (e.target.parentElement.children[0].innerHTML === '') {
              e.target.parentElement.children[0].innerHTML = '<span class="' + styles.placeholder + '">' + placeholder + '</span>';
            }
          }}
          onChange={(e) => {
            if (e.target.value === ' ') {
              e.target.value = '';
            }
            e.target.value = e.target.value.replace(/ +(?= )/g, '');
            switch (searchType) {
              case 'fileSearch':
                e.target.parentElement.children[0].innerHTML = SearchTextHighlighting.performFileSearchTextHighlighting(e.target.value);
                onSearchChanged(SearchAlgorithm.performFileSearch(data, e.target.value));
                break;
              case 'commitSearch':
                e.target.parentElement.children[0].innerHTML = SearchTextHighlighting.performCommitSearchTextHighlighting(e.target.value);
                onSearchChanged(SearchAlgorithm.performCommitSearch(data, e.target.value));
                break;
              case 'developerSearch':
                e.target.parentElement.children[0].innerHTML = SearchTextHighlighting.performDeveloperSearchTextHighlighting(
                  e.target.value,
                );
                onSearchChanged(SearchAlgorithm.performDeveloperSearch(data, e.target.value));
                break;
              case 'issueSearch':
                e.target.parentElement.children[0].innerHTML = SearchTextHighlighting.performIssueSearchTextHighlighting(e.target.value);
                onSearchChanged(SearchAlgorithm.performIssueSearch(data, e.target.value));
                break;
              default:
                e.target.parentElement.children[0].innerHTML = e.target.value;
                onSearchChanged(data);
                break;
            }
          }}
        />
        <span>
          <div className={styles.info}>i</div>
          {hint}
        </span>
      </div>
    );
  }
}

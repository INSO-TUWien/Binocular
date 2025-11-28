import styles from './searchBar.module.scss';
import SearchAlgorithm from './searchAlgorithm';
import SearchTextHighlighting from './searchTextHighlighting';
import type { FileListElementType } from '../../../../../../types/data/fileListType';
import { SearchType } from './SearchType';

function SearchBar(props: {
  searchType: SearchType;
  data: FileListElementType[];
  onSearchChanged: (data: FileListElementType[], value?: string) => unknown;
  placeholder: string;
  hint: string;
}) {
  return (
    <div className={styles.searchBoxHint}>
      <div className={styles.searchBox}>
        <span className={styles.placeholder}>{props.placeholder}</span>
      </div>
      <input
        className={styles.searchBoxInput}
        onFocus={(e) => {
          if (e.target.parentElement?.children[0].innerHTML.includes('placeholder')) {
            e.target.parentElement.children[0].innerHTML = '';
          }
        }}
        onBlur={(e) => {
          if (e.target.parentElement?.children[0].innerHTML === '') {
            e.target.parentElement.children[0].innerHTML = '<span class="' + styles.placeholder + '">' + props.placeholder + '</span>';
          }
        }}
        onChange={(e) => {
          if (e.target.value === ' ') {
            e.target.value = '';
          }
          e.target.value = e.target.value.replace(/ +(?= )/g, '');
          switch (props.searchType) {
            case SearchType.fileSearch:
              if (!e.target.parentElement) return;
              e.target.parentElement.children[0].innerHTML = SearchTextHighlighting.performFileSearchTextHighlighting(e.target.value);
              props.onSearchChanged(SearchAlgorithm.performFileSearch(props.data, e.target.value));
              break;
            default:
              if (!e.target.parentElement) return;
              e.target.parentElement.children[0].innerHTML = e.target.value;
              props.onSearchChanged(props.data);
              break;
          }
        }}
      />
      <span>
        <div className={styles.info}>i</div>
        {props.hint}
      </span>
    </div>
  );
}

export default SearchBar;

import React from 'react';
import styles from './fileBrowser.module.scss';
import { folder_white, folder_open_white } from '../../images/icons';
import SearchBar from '../searchBar/searchBar';

export default class FileBrowser extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      filteredData: this.props.files,
    };
  }

  convertData(data) {
    const convertedData = { content: [] };
    for (const file of data) {
      const pathParts = file.key.split('/');
      this.genPathObjectString(convertedData.content, pathParts, file.webUrl, file.key);
    }

    return convertedData;
  }

  genPathObjectString(convertedData, pathParts, Url, Path) {
    const currElm = pathParts.shift();

    if (pathParts.length === 0) {
      convertedData.push({ name: currElm, type: 'file', url: Url, path: Path });
    } else {
      let elem = convertedData.find((d) => d.name === currElm);
      if (elem === undefined) {
        elem = { name: currElm, type: 'folder', content: [] };
        this.genPathObjectString(elem.content, pathParts, Url, Path);
        convertedData.push(elem);
      } else {
        this.genPathObjectString(elem.content, pathParts, Url, Path);
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.filteredData.length === 0) {
      this.setState({ filteredData: nextProps.files });
    }
  }

  render() {
    const fileCount = this.props.files.length;
    const convertedData = this.convertData(this.state.filteredData);
    const filteredFileCount = this.state.filteredData.length;

    return (
      <div>
        <div className={'label'}>Files:</div>
        <div id={'fileSearch'} style={{ margin: '1rem 0', height: '3rem' }}>
          <SearchBar
            searchType={'fileSearch'}
            data={this.props.files}
            placeholder={'Search for files!'}
            hint={'-f [term] search file; -t [term] search file type'}
            onSearchChanged={function (data) {
              this.setState({ filteredData: data });
            }.bind(this)}
          />
        </div>

        {fileCount === 0 ? <div>Loading Files ...</div> : filteredFileCount === 0 ? <div>No Files found!</div> : null}
        <div className={styles.fileBrowser}>
          <FileStruct data={convertedData} foldOut={fileCount !== filteredFileCount} props={this.props.props} />
        </div>
      </div>
    );
  }
}

class FileStruct extends React.PureComponent {
  render() {
    this.props.data.content.sort((a, b) => (a.type > b.type ? 1 : -1)).reverse();
    return (
      <div>
        {this.props.data.content.map((data, i) => {
          if (data.type === 'file') {
            return (
              <div
                className={styles.button + ' ' + (i % 2 === 0 ? styles.BCEven : styles.BCOdd)}
                key={data.name}
                onClick={() => {
                  this.clickFile(data.url, data.path);
                }}>
                {data.name}
              </div>
            );
          } else if (data.type === 'folder') {
            return (
              <div key={data.name}>
                <button
                  className={styles.button + ' ' + (i % 2 === 0 ? styles.ACEven : styles.ACOdd)}
                  onClick={(e) => {
                    const target = e.currentTarget;
                    const panel = target.nextSibling;
                    if (panel.style.display === 'block') {
                      panel.style.display = 'none';
                      target.innerHTML = "<span class='" + styles.icon + "'>" + folder_white + '</span>' + data.name;
                    } else {
                      panel.style.display = 'block';
                      target.innerHTML = "<span class='" + styles.icon + "'>" + folder_open_white + '</span>' + data.name;
                    }
                  }}>
                  <span
                    className={styles.icon}
                    dangerouslySetInnerHTML={{ __html: this.props.foldOut ? folder_open_white : folder_white }}
                  />
                  {data.name}
                </button>
                <div id={'' + i + 'panel' + data.name} className={styles.panel} style={{ display: this.props.foldOut ? 'block' : 'none' }}>
                  <FileStruct data={data} foldOut={this.props.foldOut} props={this.props.props} />
                </div>
              </div>
            );
          }
        })}
      </div>
    );
  }

  clickFile(Url, Path) {
    this.props.props.onSetFile(Url);
    this.props.props.onSetPath(Path);
  }
}

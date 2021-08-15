import React from 'react';
import styles from '../css/fileBrowser.scss';
import { folder_white, folder_open_white } from '../images/icons';

export default class FileBrowser extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: ''
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
      let elem = convertedData.find(d => d.name === currElm);
      if (elem === undefined) {
        elem = { name: currElm, type: 'folder', content: [] };
        this.genPathObjectString(elem.content, pathParts, Url, Path);
        convertedData.push(elem);
      } else {
        this.genPathObjectString(elem.content, pathParts, Url, Path);
      }
    }
  }

  render() {
    //this.props.props.onSetFile("https://github.com/INSO-TUWien/Binocular/blob/master/pupil.js");
    //this.props.props.onSetPath("pupil.js");
    const fileCount = this.props.files.length;
    const convertedData = this.convertData(this.props.files.filter(d => d.key.includes(this.state.searchTerm)));
    const filteredFileCount = this.props.files.filter(d => d.key.includes(this.state.searchTerm)).length;

    return (
      <div>
        <div className={'label'}>Files:</div>
        <input
          id={'fileSearch'}
          className={styles.searchBox}
          placeholder={'Search for files'}
          onChange={e => {
            this.setState({ searchTerm: e.target.value });
          }}
        />
        {fileCount === 0 ? <div>Loading Files ...</div> : filteredFileCount === 0 ? <div>No Files found!</div> : null}
        <div className={styles.fileBrowser}>
          <FileStruct data={convertedData} searchTerm={this.state.searchTerm} props={this.props.props} />
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
                  this.props.props.onSetFile(data.url);
                  this.props.props.onSetPath(data.path);
                }}>
                {data.name}
              </div>
            );
          } else if (data.type === 'folder') {
            return (
              <div key={data.name}>
                <button
                  className={styles.button + ' ' + (i % 2 === 0 ? styles.ACEven : styles.ACOdd)}
                  onClick={e => {
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
                    dangerouslySetInnerHTML={{ __html: this.props.searchTerm === '' ? folder_white : folder_open_white }}
                  />
                  {data.name}
                </button>
                <div
                  id={'' + i + 'panel' + data.name}
                  className={styles.panel}
                  style={{ display: this.props.searchTerm === '' ? 'none' : 'block' }}>
                  <FileStruct data={data} searchTerm={this.props.searchTerm} props={this.props.props} />
                </div>
              </div>
            );
          }
        })}
      </div>
    );
  }

  clickFile(Url, Path) {
    console.log(Url);
    console.log(Path);
  }
}

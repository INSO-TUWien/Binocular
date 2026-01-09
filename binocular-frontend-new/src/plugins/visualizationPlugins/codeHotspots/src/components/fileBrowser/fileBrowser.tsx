import styles from './fileBrowser.module.scss';
import { folder_open_white, folder_white } from '../../../assets/icons/icons';
import SearchBar from '../searchBar/searchBar';
import type { FileListElementType } from '../../../../../../types/data/fileListType';
import { useEffect, useState } from 'react';
import { SearchType } from '../searchBar/SearchType';

interface ConvertedData {
  name?: string;
  type: ConvertedDataElementType;
  url?: string;
  path?: string;
  content: ConvertedData[];
}

enum ConvertedDataElementType {
  file,
  folder,
}

function FileBrowser(props: { files: FileListElementType[]; onSetFile: (path?: string, url?: string) => void }) {
  const [filteredData, setFilteredData] = useState<FileListElementType[]>(props.files);

  const fileCount = props.files.length;
  const convertedData = convertData(filteredData);
  const filteredFileCount = filteredData.length;

  function convertData(data: FileListElementType[]): ConvertedData {
    const convertedData: ConvertedData = { type: ConvertedDataElementType.folder, content: [] };
    for (const file of data) {
      const pathParts = file.element.path.split('/');
      genPathObjectString(convertedData.content, pathParts, file.element.webUrl, file.element.path);
    }

    return convertedData;
  }

  function genPathObjectString(convertedData: ConvertedData[], pathParts: string[], Url: string, Path: string) {
    const currElm = pathParts.shift();

    if (pathParts.length === 0) {
      convertedData.push({ name: currElm, type: ConvertedDataElementType.file, url: Url, path: Path, content: [] });
    } else {
      let elem = convertedData.find((d) => d.name === currElm);
      if (elem === undefined) {
        elem = { name: currElm, type: ConvertedDataElementType.folder, content: [] };
        genPathObjectString(elem.content, pathParts, Url, Path);
        convertedData.push(elem);
      } else {
        genPathObjectString(elem.content, pathParts, Url, Path);
      }
    }
  }

  useEffect(() => {
    if (filteredData.length === 0) {
      setFilteredData(props.files);
    }
  }, [filteredData.length, props.files]);

  return (
    <div style={{ height: '100%' }}>
      <div className={'label'}>Files:</div>
      <div id={'fileSearch'} style={{ margin: '1rem 0', height: '3rem' }}>
        <SearchBar
          searchType={SearchType.fileSearch}
          data={props.files}
          placeholder={'Search for files!'}
          hint={'-f [term] search file; -t [term] search file type'}
          onSearchChanged={(data: FileListElementType[]) => {
            setFilteredData(data);
          }}
        />
      </div>

      {fileCount === 0 ? <div>Loading Files ...</div> : filteredFileCount === 0 ? <div>No Files found!</div> : null}
      <div className={styles.fileBrowser}>
        <FileStruct data={convertedData} foldOut={fileCount !== filteredFileCount} onSetFile={props.onSetFile} />
      </div>
    </div>
  );
}
export default FileBrowser;

function FileStruct(props: { data: ConvertedData; foldOut: boolean; onSetFile: (url?: string, path?: string) => void }) {
  props.data.content.sort((a, b) => (a.type > b.type ? 1 : -1)).reverse();

  function clickFile(url?: string, path?: string) {
    props.onSetFile(url, path);
  }

  return (
    <div>
      {props.data.content.map((data, i) => {
        if (data.type === ConvertedDataElementType.file) {
          return (
            <div
              className={styles.button + ' ' + (i % 2 === 0 ? styles.BCEven : styles.BCOdd)}
              key={'file' + i + '-' + data.path}
              onClick={() => {
                clickFile(data.url, data.path);
              }}>
              {data.name}
            </div>
          );
        } else if (data.type === ConvertedDataElementType.folder) {
          return (
            <div key={'folder' + i + '-' + data.path}>
              <button
                className={styles.button + ' ' + (i % 2 === 0 ? styles.ACEven : styles.ACOdd)}
                onClick={(e) => {
                  const target = e.currentTarget;
                  const panel = target.nextElementSibling as HTMLDivElement;
                  if (panel !== null) {
                    if (panel.style.display === 'block') {
                      panel.style.display = 'none';
                      target.innerHTML = "<span class='" + styles.icon + "'>" + folder_white + '</span>' + data.name;
                    } else {
                      panel.style.display = 'block';
                      target.innerHTML = "<span class='" + styles.icon + "'>" + folder_open_white + '</span>' + data.name;
                    }
                  }
                }}>
                <span className={styles.icon} dangerouslySetInnerHTML={{ __html: props.foldOut ? folder_open_white : folder_white }} />
                {data.name}
              </button>
              <div id={'' + i + 'panel' + data.name} className={styles.panel} style={{ display: props.foldOut ? 'block' : 'none' }}>
                <FileStruct data={data} foldOut={props.foldOut} onSetFile={props.onSetFile} />
              </div>
            </div>
          );
        }
      })}
    </div>
  );
}

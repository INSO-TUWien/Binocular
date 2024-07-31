import { FileListElementType, FileListElementTypeType } from '../../../../../types/data/fileListType.ts';
import { DataPluginFile } from '../../../../../plugins/interfaces/dataPluginInterfaces/dataPluginFiles.ts';

export function generateFileTree(files: DataPluginFile[]): FileListElementType[] {
  return convertData(files).content;
}

function convertData(files: DataPluginFile[]) {
  const convertedData = { content: [] };
  for (const file of files) {
    const pathParts = file.path.split('/');
    genPathObjectString(convertedData.content, pathParts, file.webUrl, file.path);
  }

  return convertedData;
}

function genPathObjectString(convertedData: FileListElementType[], pathParts: string[], Url: string, Path: string) {
  const currElm = pathParts.shift();
  if (currElm) {
    if (pathParts.length === 0) {
      convertedData.push({ name: currElm, type: FileListElementTypeType.File, webUrl: Url, path: Path });
    } else {
      let elem = convertedData.find((d) => d.name === currElm);
      if (elem === undefined) {
        elem = { name: currElm, type: FileListElementTypeType.Folder, children: [] };
        if (elem.children) {
          genPathObjectString(elem.children, pathParts, Url, Path);
          convertedData.push(elem);
        }
      } else {
        if (elem.children) {
          genPathObjectString(elem.children, pathParts, Url, Path);
        }
      }
    }
  }
}

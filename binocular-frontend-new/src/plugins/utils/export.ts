import JSZip from 'jszip';
import type { MetadataType } from '../../types/data/MetadataType';
import type { JSONObject } from '../interfaces/dataPluginInterfaces/dataPluginFiles';

export async function downloadExportCompressed(
  data: { [id: string]: JSONObject[] },
  metadata?: MetadataType | undefined,
  datatype = 'json',
) {
  const zip = new JSZip();
  const db_export = zip.folder('db_export');
  if (metadata) db_export!.file('metadata.json', JSON.stringify(metadata));

  for (const [key, value] of Object.entries(data)) {
    db_export!.file(key + '.' + datatype, datatype == 'json' ? JSON.stringify(value) : convertToCSV(value));
  }

  zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 9 } }).then((file) => {
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    const url = window.URL.createObjectURL(file);
    a.href = url;
    a.download = 'db_export.zip';
    a.click();
    window.URL.revokeObjectURL(url);
  });
}

export function convertToCSV(jsonObject: JSONObject[]) {
  if (!jsonObject) return '';
  const items = jsonObject;
  const replacer = (_key: string, value: string) => (value === null ? '' : value);
  const header = Object.keys(items[0]);
  return [header.join(','), ...items.map((row) => header.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join(','))].join(
    '\r\n',
  );
}

export interface FileListElementType {
  name: string;
  path?: string;
  type: FileListElementTypeType;
  webUrl?: string;
  maxLength?: number;
  children?: FileListElementType[];
}

export enum FileListElementTypeType {
  Folder,
  File,
}

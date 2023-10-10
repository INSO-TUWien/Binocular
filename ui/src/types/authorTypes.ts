export interface ICommitter {
  signature: string;
  color: string;
}

export interface IPalette {
  [signature: string]: string;
}

export interface IAuthor {
  mainCommitter: string;
  committers: ICommitter[];
  color: string;
}

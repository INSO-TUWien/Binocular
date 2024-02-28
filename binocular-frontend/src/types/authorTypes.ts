export interface Committer {
  signature: string;
  color: string;
}

export interface Palette {
  [signature: string]: string;
}

export interface Author {
  mainCommitter: string;
  committers: Committer[];
  color: string;
}

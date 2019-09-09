export class FileFilter {
  path;
  numOfCommits;
  numOfDev;

  constructor(path, numOfCommits, numOfDev) {
    this.path = path;
    this.numOfCommits = numOfCommits;
    this.numOfDev = numOfDev;
  }
}

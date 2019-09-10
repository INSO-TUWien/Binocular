export class CommitEnt {
  constructor(signature, date, sha, hunks, lineCount) {
    this.signature = signature;
    this.date = date;
    this.sha = sha;
    this.hunks = hunks;
    this.lineCount = lineCount;
  }
  signature;
  date;
  sha;
  hunks;
  lineCount;
}

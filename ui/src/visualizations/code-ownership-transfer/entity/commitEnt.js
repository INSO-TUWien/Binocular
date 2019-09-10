export class CommitEnt {
  constructor(signature, date, sha, hunks) {
    this.signature = signature;
    this.date = date;
    this.sha = sha;
    this.hunks = hunks;
  }
  signature;
  date;
  sha;
  hunks;
}

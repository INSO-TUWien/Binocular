export default interface BranchDto {
  branchName: string;
  currentActive: boolean;
  id: string;
  latestCommit: string;
  tracksFileRenames: boolean;
}

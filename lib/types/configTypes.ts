export interface JiraConfigType {
  url: string;
  username: string;
  project: string;
  token: string;
  organizationId: string | undefined;
  teamsId: string | undefined;
}

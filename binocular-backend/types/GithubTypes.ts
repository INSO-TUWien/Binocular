export interface GithubUser {
  login: string;
  email: string;
  name: string;
  url: string;
  avatarUrl: string;
}

export interface GithubJob {
  id: number;
  run_id: number;
  workflow_name: string;
  head_branch: string;
  run_url: string;
  run_attempt: number;
  node_id: string;
  head_sha: string;
  url: string;
  html_url: string;
  status: string;
  conclusion: string;
  created_at: string;
  started_at: string;
  completed_at: string;
  name: string;
  steps: GithubJobStep[];
  check_run_url: string;
  labels: string[];
  runner_id: number;
  runner_name: string;
  runner_group_id: number;
  runner_group_name: string;
}

export interface GithubJobStep {
  name: string;
  status: string;
  conclusion: string;
  number: number;
  started_at: string;
  completed_at: string;
}

export interface GithubActor {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  url: string;
  html_url: string;
  type: string;
  site_admin: boolean;
  name: string;
}

export interface GithubMilestone {
  id: number;
  url: string;
  number: number;
  state: string;
  title: string;
  description: string;
  creator: GithubActor;
  createdAt: string;
  updatedAt: string;
  closedAt: string;
  dueOn: string;
}

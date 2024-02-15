import { GithubActor, GithubMilestone } from './githubTypes.ts';

export interface ItsIssue {
  id: number;
  node_id: string;
  iid: string;
  url: string;
  number: number;
  title: string;
  body: string;
  user: GithubActor;
  repository_url: string;
  labels_url: string;
  comments_url: string;
  events_url: string;
  html_url: string;
  labels: ItsIssueLabel[];
  state: string;
  locked: boolean;
  assignee: GithubActor;
  assignees: GithubActor[];
  milestone: GithubMilestone;
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at: string;
  author_association: string;
  active_lock_reason: string;
  reactions: ItsIssueReaction[];
  timeline_url: string;
  pull_request: string;
}

export interface ItsIssueEvent {
  id: number;
  node_id: string;
  url: string;
  actor: GithubActor;
  event: string;
  commit_id: string;
  commit_url: string;
  created_at: string;
}

export interface ItsIssueMention {
  commit: string;
  createdAt: string;
  closes: boolean;
}

export interface ItsIssueLabel {
  id: number;
  node_id: string;
  url: string;
  name: string;
  description: string;
  color: string;
  default: boolean;
}

export interface ItsIssueReaction {
  url: string;
  total_count: number;
  '+1': number;
  '-1': number;
  laugh: number;
  hooray: number;
  confused: number;
  heart: number;
  rocket: number;
  eyes: number;
}

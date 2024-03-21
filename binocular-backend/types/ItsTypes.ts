import { GithubActor, GithubMilestone } from './GithubTypes';
import Label from './supportingTypes/Label.ts';

export interface ItsIssue {
  id: number;
  node_id: string;
  iid: string;
  url: string;
  number: number;
  title: string;
  body: string;
  author: GithubActor;
  repository_url: string;
  labels_url: string;
  comments_url: string;
  events_url: string;
  html_url: string;
  labels: { nodes: Label[] };
  state: string;
  locked: boolean;
  assignee: GithubActor;
  assignees: { nodes: GithubActor[] };
  milestone: GithubMilestone;
  comments: number;
  createdAt: string;
  updatedAt: string;
  closedAt: string;
  author_association: string;
  active_lock_reason: string;
  reactions: { nodes: ItsIssueReaction[] };
  timeline_url: string;
  pull_request: string;
  timelineItems: { nodes: ItsIssueEvent[] };
}

export interface ItsIssueEvent {
  id: number;
  createdAt: string;
  commit: { oid: string };
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

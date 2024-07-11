export interface MergeRequest {
  id: number;
  state: string;
  closedAt: string;
  createdAt: string;
  assignee: Author;
  assignees: Author[];
  reviewer: Author;
  reviewers: Author[];
}

export interface Author {
  login: string;
  name: string;
}

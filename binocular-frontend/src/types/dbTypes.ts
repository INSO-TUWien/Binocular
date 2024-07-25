export interface MergeRequest {
  id: number;
  state: string;
  closedAt: string;
  createdAt: string;
  assignee: Author;
  assignees: Author[];
  reviewer: Author;
  reviewers: Author[];
  comments: Comment[];
  reviewThreads: ReviewThread[];
}

export interface Author {
  login: string;
  name: string;
}

export interface Comment {
  author: Author;
  bodyText: string;
  createdAt: string;
  id: string;
  lastEditedAt: string;
  path: string;
  updatedAt: string;
}

export interface ReviewThread {
  id: string;
  isResolved: boolean;
  path: string;
  resolvedBy: Author;
  comments: Comment[];
}

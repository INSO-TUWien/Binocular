import { JiraShortAuthor } from './jiraRestApiTypes';

export interface Mentions {
  commit: string;
  createdAt: string;
  closes: boolean;
  displayId: string | null;
  author: JiraShortAuthor | null;
}

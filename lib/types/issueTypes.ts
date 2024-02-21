import { JiraDevelopmentDetailsAuthor } from './jiraRestApiTypes';

export interface Mentions {
  commit: string;
  createdAt: string;
  closes: boolean;
  // TODO: check if the values for these fields can be really null
  displayId: string | null;
  author: JiraDevelopmentDetailsAuthor | null;
}

import Label from '../supportingTypes/Label.ts';
import User from '../supportingTypes/User.ts';
import Mention from '../supportingTypes/Mention.ts';

export default interface IssueDto {
  id: string;
  iid: number;
  title: string;
  description: string;
  createdAt: string;
  closedAt: string;
  updatedAt: string;
  labels: Label[];
  milestone: any; //TODO: Add type for milestone
  state: string;
  url: string;
  webUrl: string;
  projectId?: string;
  timeStats?: string;
  author: User;
  assignee: User;
  assignees: User[];
  mentions: Mention[];
}

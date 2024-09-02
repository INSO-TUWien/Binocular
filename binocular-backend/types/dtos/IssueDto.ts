import Mention from '../supportingTypes/Mention.ts';

export default interface IssueDto {
  id: string;
  iid: number;
  title: string;
  description: string;
  createdAt: string;
  closedAt: string;
  updatedAt: string;
  labels: string[];
  state: string;
  webUrl: string;
  projectId?: string;
  timeStats?: string;
  mentions: Mention[];
}

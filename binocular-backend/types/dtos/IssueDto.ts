import Label from '../supportingTypes/Label.ts';
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
  webUrl: string;
  projectId?: string;
  timeStats?: string;
  mentions: Mention[];
  notes: any[]; //TODO: Add type for gitlab notes
}

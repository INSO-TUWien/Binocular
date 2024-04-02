import Label from '../supportingTypes/Label';
import User from '../supportingTypes/User';
import Mention from '../supportingTypes/Mention.ts';

export default interface MergeRequestDto {
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
  mentions: Mention[];
  notes: any[]; //TODO: Add type for gitlab notes
}

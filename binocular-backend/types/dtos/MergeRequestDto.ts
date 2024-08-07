import Mention from '../supportingTypes/Mention.ts';

export default interface MergeRequestDto {
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
  mentions: Mention[];
}

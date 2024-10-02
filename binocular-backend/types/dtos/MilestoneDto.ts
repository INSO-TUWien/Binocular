export default interface MilestoneDto {
  id: string;
  iid: number;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  startDate: string;
  dueDate: string;
  state: string;
  expired: boolean;
  webUrl: string;
  projectId?: string;
}

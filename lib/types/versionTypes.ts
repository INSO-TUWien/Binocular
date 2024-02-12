export interface Version {
  id: number;
  iid: number;
  description: string;
  dueDate: Date;
  startDate: Date;
  state: string;
  expired: boolean | null;
}

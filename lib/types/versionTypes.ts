export interface Version {
  id: number;
  iid: number;
  description: string | null;
  dueDate: Date | null;
  startDate: Date | null;
  state: string;
  expired: boolean | null;
}

export interface Version {
  id: string;
  iid: string;
  description: string | null;
  dueDate: string | null;
  title: string;
  startDate: string | null;
  state: string;
  expired: boolean | null;
}

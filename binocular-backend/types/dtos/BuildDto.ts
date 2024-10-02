import Job from '../supportingTypes/Job.ts';

export default interface BuildDto {
  id: string;
  user: string;
  userFullName: string;
  committedAt: string;
  createdAt: string;
  startedAt: string;
  updatedAt: string;
  finishedAt: string;
  webUrl: string;
  tag: string;
  status: string;
  duration: number;
  sha: string;
  ref: string;
  jobs: Job[];
}

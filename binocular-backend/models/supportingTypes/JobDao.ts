export default interface JobDao {
  id: string;
  name: string;
  createdAt: string;
  finishedAt: string;
  webUrl: string;
  status: string;
  stage: string;
}

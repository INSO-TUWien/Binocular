import Commits from './commits.ts';
import { DataPlugin } from '../../../interfaces/dataPlugin.ts';

const MockData: DataPlugin = {
  name: 'Mock Data',
  description: 'Mocked Data for testing purposes!',
  commits: Commits,
};

export default MockData;

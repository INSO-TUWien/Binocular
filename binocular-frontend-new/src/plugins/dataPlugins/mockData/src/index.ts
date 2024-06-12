import Commits from './commits.ts';
import { DataPlugin } from '../../../interfaces/dataPlugin.ts';
import Authors from './authors.ts';

const MockData: DataPlugin = {
  name: 'Mock Data',
  description: 'Mocked Data for testing purposes!',
  commits: Commits,
  authors: Authors,
};

export default MockData;

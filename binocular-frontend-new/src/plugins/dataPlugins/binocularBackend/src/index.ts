import Commits from './commits.ts';
import { DataPlugin } from '../../../interfaces/dataPlugin.ts';

const BinocularBackend: DataPlugin = {
  name: 'Binocular Backend',
  description: 'Connection to the Binocular GraphQL Backend!',
  commits: Commits,
};

export default BinocularBackend;

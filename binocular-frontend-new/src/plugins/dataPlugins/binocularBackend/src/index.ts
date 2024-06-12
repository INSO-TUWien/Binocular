import Commits from './commits.ts';
import { DataPlugin } from '../../../interfaces/dataPlugin.ts';
import Authors from './authors.ts';

const BinocularBackend: DataPlugin = {
  name: 'Binocular Backend',
  description: 'Connection to the Binocular GraphQL Backend!',
  commits: Commits,
  authors: Authors,
};

export default BinocularBackend;

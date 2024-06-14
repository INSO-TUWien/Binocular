import Commits from './commits.ts';
import { DataPlugin } from '../../../interfaces/dataPlugin.ts';
import Authors from './authors.ts';

const BinocularBackend: DataPlugin = {
  name: 'Github',
  description: 'Connect directly to the github API!',
  commits: Commits,
  authors: Authors,
};

export default BinocularBackend;

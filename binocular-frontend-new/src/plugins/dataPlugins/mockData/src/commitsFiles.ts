import { DataPluginCommitFile, DataPluginCommitsFiles } from '../../../interfaces/dataPluginInterfaces/dataPluginCommitsFiles.ts';

export default class CommitsFiles implements DataPluginCommitsFiles {
  getAll(sha: string): Promise<DataPluginCommitFile[]> {
    switch (sha) {
      case '1':
        return Promise.resolve([
          {
            file: { path: 'Frontend/file1.ts' },
            stats: { additions: 32, deletions: 0 },
          },
          {
            file: { path: 'Backend/file2.java' },
            stats: { additions: 0, deletions: 8 },
          },
          {
            file: { path: 'Backend/file3.java' },
            stats: { additions: 4, deletions: 4 },
          },
          {
            file: { path: 'DevOps/file.java' },
            stats: { additions: 12, deletions: 4 },
          },
        ]);
      case '2':
        return Promise.resolve([
          {
            file: { path: 'folder/src/ui/file1' },
            stats: { additions: 64, deletions: 8 },
          },
          {
            file: { path: 'folder/src/file1' },
            stats: { additions: 0, deletions: 8 },
          },
          {
            file: { path: 'Backend/file3.java' },
            stats: { additions: 12, deletions: 50 },
          },
          {
            file: { path: 'file' },
            stats: { additions: 12, deletions: 4 },
          },
          {
            file: { path: 'package.json' },
            stats: { additions: 120, deletions: 4 },
          },
        ]);
      default:
        return Promise.resolve([]);
    }
  }
}

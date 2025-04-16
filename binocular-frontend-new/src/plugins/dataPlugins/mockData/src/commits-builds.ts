import { DataPluginCommitBuild, DataPluginCommitsBuilds } from '../../../interfaces/dataPluginInterfaces/dataPluginCommitsBuilds.ts';
import Commits from './commits';
import Builds from './builds';

export default class CommitsBuilds implements DataPluginCommitsBuilds {
  private commits: Commits;
  private builds: Builds;

  constructor() {
    this.commits = new Commits();
    this.builds = new Builds();
  }

  public async getAll(from: string, to: string): Promise<DataPluginCommitBuild[]> {
    console.log(`Getting CommitsBuilds from ${from} to ${to}`);
    
    // Get all commits and builds
    const commits = await this.commits.getAll(from, to);
    const builds = await this.builds.getAll(from, to);
    
    // Map to create combined data
    const commitsBuilds: DataPluginCommitBuild[] = [];
    
    // For each commit, find a matching build based on timestamp
    for (const commit of commits) {
      const matchingBuild = builds.find(build => 
        build.committedAt === commit.date
      );
      console.log(matchingBuild)
      // Only include commits that have a matching build
      if (matchingBuild) {
        const commitBuild: DataPluginCommitBuild = {
          ...commit,
          builds: [{
            id: matchingBuild.id,
            status: matchingBuild.status,
            duration: matchingBuild.duration,
            startedAt: matchingBuild.startedAt,
            finishedAt: matchingBuild.finishedAt,
            jobs: matchingBuild.jobs.map(job => ({
              id: parseInt(job.id),
              name: job.name,
              status: job.status,
              stage: job.stage
            }))
          }]
        };
        
        commitsBuilds.push(commitBuild);
      }
    }
    
    return commitsBuilds;
  }
}

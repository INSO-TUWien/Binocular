'use strict';

import Database from '../../../database/database.js';

const minDate = new Date(0);
const maxDate = new Date();

export function getIssues() {
  return Database.getIssueData([], [minDate, maxDate])
    .then((issues) => {
      return issues;
    })
    .catch((error) => {
      console.error('Error in getIssues:', error);
      throw error;
    });
}

export function getBranches() {
  return Database.getAllBranches()
    .then((resp) => {
      return resp.branches.data;
    })
    .catch((error) => {
      throw error;
    });
}

export async function processIssueLabelData(dateRange, selectedLabels, branch) {
  try {
    // 1. Get all issues within the date range
    const issues = await Database.getIssueData(dateRange, dateRange);

    // 2. Filter issues to those that contain ALL selected labels
    const issuesWithAllSelectedLabels = issues.filter(
      (issue) => issue.labels && Array.isArray(issue.labels) && selectedLabels.every((label) => issue.labels.includes(label)),
    );

    if (issuesWithAllSelectedLabels.length === 0) {
      // Return a structure that indicates no issues were found
      return {};
    }

    // 3. Get issue IDs for the filtered issues
    const issueIds = issuesWithAllSelectedLabels.map((issue) => issue.iid);

    // 4. Load commits and merge requests by issue IDs
    const issueCommits = await Database.getCommitsForIssues(issueIds);
    const issueMRs = await Database.getMergeRequestsForIssues(issueIds);

    // 5. Load commits by merge requests
    const mrCommits = [];
    for (const mr of issueMRs) {
      try {
        const commits = await Database.getCommitsForMergeRequest(mr.iid);
        mrCommits.push(...commits);
      } catch (error) {
        console.error(`Error fetching commits for merge request ${mr.iid}:`, error);
      }
    }

    // 6. Combine all commits, removing duplicates by SHA
    const allCommits = [...issueCommits, ...mrCommits];
    const uniqueCommits = [];
    const seenShas = new Set();

    for (const commit of allCommits) {
      if (!seenShas.has(commit.sha)) {
        seenShas.add(commit.sha);
        uniqueCommits.push(commit);
      }
    }

    // 7. Group commits by date and sum their stats
    const changesByDate = {};
    uniqueCommits.forEach((commit) => {
      // Truncate the date to YYYY-MM-DD
      const date = new Date(commit.date).toISOString().split('T')[0];

      if (!changesByDate[date]) {
        changesByDate[date] = {
          date,
          additions: 0,
          deletions: 0,
        };
      }

      // Add the stats from the commit
      changesByDate[date].additions += commit.stats?.additions || 0;
      changesByDate[date].deletions += commit.stats?.deletions || 0;
    });

    // 8. Convert the grouped changes to an array and sort by date
    const timelineChanges = Object.values(changesByDate).sort((a, b) => new Date(a.date) - new Date(b.date));

    return { timelineChanges };
  } catch (error) {
    console.error('Error processing issue label data:', error);
    return {};
  }
}

export async function fetchIssueLabelsDataHelper(dateRange, selectedLabels, branch) {
  if (!branch) {
    return {};
  }

  try {
    const data = await processIssueLabelData(dateRange, selectedLabels, branch);
    return data;
  } catch (error) {
    console.error('Error fetching issue label data:', error);
    return {};
  }
}

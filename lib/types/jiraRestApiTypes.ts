export interface PullRequestsSummary {
  overall: {
    count: number;
    lastUpdated: string | null;
    stateCount: number;
    state: string;
    dataType: string;
    open: boolean;
  };
  byInstanceType: any;
}

export interface DevelopmentSummary {
  pullrequest: PullRequestsSummary;
  repository: CommitSummary;
  [key: string]: any;
}

export interface CommitSummary {
  overall: {
    count: number;
    lastUpdated: string | null;
    dataType: string;
  };
  byInstanceType: any;
}

export interface JiraVersion {
  self: string;
  id: string;
  description: string | undefined;
  name: string;
  archived: boolean;
  released: boolean;
  startDate: string | undefined;
  releaseDate: string;
  userStartDate: string;
  overdue: boolean | undefined;
  userReleaseDate: string;
  projectId: string;
}

export interface PullRequestDetail {
  author: JiraShortAuthor;
  id: string;
  name: string;
  commentCount: number;
  source: {
    branch: string;
    url: string;
  };
  destination: {
    branch: string;
    url: string;
  };
  reviewers: any[];
  status: string;
  url: string;
  lastUpdate: string;
  repositoryId: string;
  repositoryName: string;
  repositoryUrl: string;
}

export interface ChangelogType {
  body: string;
  created_at: string;
  worklogId: string;
  author: JiraFullAuthor;
  [key: string]: any;
}

export interface CommitRestResponse {
  repositories: CommitsFullDetail[];
  _instance: _instance;
}

export interface _instance {
  name: string;
  baseUrl: string;
  [key: string]: any;
}

export interface PullrequestRestResponse {
  branches: any[];
  pullRequests: PullRequestDetail[];
  instance: _instance;
}

export interface CommitsFullDetail {
  id: string;
  name: string;
  url: string;
  commits: CommitDetail[];
}

export interface CommitDetail {
  id: string;
  displayId: string;
  authorTimestamp: string;
  url: string;
  author: JiraShortAuthor;
  fileCount: number;
  merge: boolean;
  message: string;
  files: CommitFiles[];
}

export interface CommitFiles {
  path: string;
  url: string;
  changeType: string;
  linesAdded: number;
  linesRemoved: number;
}

export interface JiraShortAuthor {
  name: string;
  avatar: string;
}

export interface JiraFullAuthor {
  self: string;
  accountId: string;
  emailAddress: string;

  avatarUrls: {
    '48x48': string;
    '24x24': string;
    '16x16': string;
    '32x32': string;
  };
  displayName: string;
  active: boolean;
  timeZone: string;
  accountType: string;

  name: string | null;
  state: string | null;
  avatar_url: string | null;
  web_url: string | null;
  login: string | null;
  id: string | null;
}

export interface JiraComment {
  self: string;
  id: string;
  author: JiraFullAuthor;
  body:
    | {
        version: number;
        type: string;
        content: {
          type: string;
          content: {
            type: string;
            [key: string]: any;
          }[];
        }[];
        [key: string]: any;
      }
    | string;
  updateAuthor: JiraFullAuthor;
  created: string;
  updated: string;

  [key: string]: any;
}

export interface JiraIssueResponse {
  id: string;
  key: string;
  self: string;
  changelog: {
    startAt: number;
    maxResults: number;
    total: number;
    histories: JiraChangelog[];
  };
  fields: {
    description:
      | {
          type: string;
          version: number;
          content: {
            type: string;
            content: {
              type: string;
              text: string;
            }[];
          }[];
        }
      | string;
    project: {
      id: string;
      key: string;
      name: string;
      self: string;
      [key: string]: any;
    };
    comment: {
      self: string;
      maxResults: number;
      total: number;
      startAt: number;
      comments: JiraComment[];
    };
    issuelinks: object[];
    priority: {
      self: string;
      iconUrl: string;
      name: string;
      id: string;
    };

    issuetype: {
      self: string;
      id: string;
      description: string;
      name: string;
      subtask: boolean;
      [key: string]: any;
    };

    issuerestriction: {
      issuerestrictions: object;
      shouldDisplay: boolean;
    };

    worklog: {
      startAt: number;
      maxResults: number;
      total: number;
      worklogs: JiraWorklog[];
    };

    votes: {
      self: string;
      votes: number;
      hasVoted: boolean;
    };

    watches: {
      self: string;
      watchCount: number;
      isWatching: boolean;
    };

    status: {
      self: string;
      name: string;
      id: string;
      statusCategory: {
        self: string;
        id: number;
        key: string;
        name: string;
        [key: string]: any;
      };
      [key: string]: any;
    };

    updated: string;
    duedate: string | null;
    summary: string;
    creator: JiraFullAuthor;
    resolutiondate: string | null;
    created: string;
    assignee: JiraFullAuthor | null;

    [key: string]: any;
  };
}

export interface JiraChangelog {
  id: string;
  author: JiraFullAuthor;
  created: string;
  items: JiraChangelogItem[];
}

export interface JiraWorklog {
  author: {
    accountId: string;
    active: boolean;
    displayName: string;
    self: string;
  };
  comment: JiraComment;
  created: string;
  id: string;
  issueId: string;
  self: string;
  started: string;
  timeSpent: string;
  timeSpentSeconds: number;
  updateAuthor: {
    accountId: string;
    active: boolean;
    displayName: string;
    self: string;
  };
  updated: string;
  visibility: {
    identifier: string;
    type: string;
    value: string;
  };
}

export interface JiraChangelogItem {
  field: string;
  fieldtype: string;
  fieldId: string;
  from: string | null;
  fromString: string | null;
  to: string | null;
  toString: string | null;
}

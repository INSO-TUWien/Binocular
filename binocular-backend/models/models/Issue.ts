'use strict';

import _ from 'lodash';
import { aql } from 'arangojs';
import Model from '../Model';
import Stakeholder from './Stakeholder';
import IssueStakeholderConnection from '../connections/IssueStakeholderConnection';

import debug from 'debug';
import Label from '../../types/supportingTypes/Label';
import User from '../../types/supportingTypes/User';
import Mention from '../../types/supportingTypes/Mention';
import IssueDto from '../../types/dtos/IssueDto';
const log = debug('db:Issue');

export interface IssueDao {
  id: string;
  iid: number;
  title: string;
  description: string;
  createdAt: string;
  closedAt: string;
  updatedAt: string;
  labels: Label[];
  milestone: any; //TODO: Add type for milestone
  state: string;
  url: string;
  webUrl: string;
  author: User;
  assignee: User;
  assignees: User[];
  mentions: Mention[];
}

class Issue extends Model<IssueDao> {
  constructor() {
    super({
      name: 'Issue',
      keyAttribute: 'id',
    });
  }

  persist(_issueData: IssueDto) {
    const issueData = _.clone(_issueData);
    if (_issueData.id) {
      issueData.id = _issueData.id.toString();
    }

    delete issueData.projectId;
    delete issueData.timeStats;

    return this.ensureById(issueData.id, issueData, {});
  }

  async deduceStakeholders() {
    if (this.rawDb === undefined) {
      throw Error('Database undefined!');
    }
    return Promise.resolve(
      this.rawDb.query(
        aql`
    FOR issue IN ${this.collection}
        LET stakeholders = (FOR stakeholder
                            IN
                            INBOUND issue ${IssueStakeholderConnection.collection}
                                RETURN stakeholder)
        FILTER LENGTH(stakeholders) == 0
        COLLECT authorId = issue.author.id INTO issuesPerAuthor = issue
        RETURN {
          "author": FIRST(issuesPerAuthor).author,
          "issues": issuesPerAuthor
        }`,
      ),
    )
      .then((cursor) => cursor.all())
      .then((authors) => {
        return authors.map((issuesPerAuthor) =>
          Stakeholder.findOneBy('gitlabID', issuesPerAuthor.author.id)
            .then(function (stakeholder) {
              if (!stakeholder) {
                log('No existing stakeholder found for gitlabId %o', issuesPerAuthor.author.id);
                return findBestStakeholderMatch(issuesPerAuthor.author).then(function (stakeholder) {
                  if (!stakeholder) {
                    return;
                  }

                  log('Best stakeholder match: %o', stakeholder.toString());

                  stakeholder.gitlabId = issuesPerAuthor.author.id;
                  stakeholder.gitlabName = issuesPerAuthor.author.name;
                  stakeholder.gitlabWebUrl = issuesPerAuthor.author.web_url;
                  stakeholder.gitlabAvatarUrl = issuesPerAuthor.author.avatar_url;
                  return stakeholder.save();
                });
              }

              return stakeholder;
            })
            .then((stakeholder) => {
              if (!stakeholder) {
                log('No stakeholder match found for %o', issuesPerAuthor.author.name);
                return;
              }
              return issuesPerAuthor.issues.map((issueData) => {
                if (issueData === null) {
                  return;
                }
                const issue = this.parse(issueData);
                if (issue === null) {
                  return;
                }
                return IssueStakeholderConnection.connect({}, { from: issue, to: stakeholder });
              });
            }),
        );
      });
  }

  deleteMentionsAttribute() {
    if (this.rawDb === undefined) {
      throw Error('Database undefined!');
    }
    return this.rawDb.query(
      aql`
    FOR i IN issues
    REPLACE i WITH UNSET(i, "mentions") IN issues`,
    );
  }
}

export default new Issue();

async function findBestStakeholderMatch(author: User) {
  const stakeholder = await Stakeholder.findAll();
  const bestMatch = stakeholder.reduce((best: any, stakeholderEntry) => {
    if (stakeholderEntry === null) {
      return;
    }
    const stakeholderName = normalizeName(stakeholderEntry.data.gitSignature);
    const authorName = normalizeName(author.name);
    let score = 0;

    if (stakeholderName.plain === authorName.plain) {
      score++;
    }

    if (stakeholderName.sorted === authorName.sorted) {
      score++;
    }

    if (!best || score > best.score) {
      return { score, stakeholder };
    } else if (score > 0) {
      return best;
    }
  }, null);
  return bestMatch ? bestMatch.data.stakeholder : null;
}

function normalizeName(name: string) {
  const plain = _.chain(name).deburr().lowerCase().trim().value();
  const sorted = _.chain(plain).split(/\s+/).sort().join(' ').value();

  return { plain, sorted };
}

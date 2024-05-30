'use strict';

import _ from 'lodash';
import { aql } from 'arangojs';
import Model from '../Model';
import User from './User';
import IssueUserConnection from '../connections/IssueUserConnection';

import debug from 'debug';
import AccountUser from '../../types/supportingTypes/AccountUser';
import Mention from '../../types/supportingTypes/Mention';
import IssueDto from '../../types/dtos/IssueDto';
import IssueAccountConnection from '../connections/IssueAccountConnection.ts';
const log = debug('db:Issue');

export interface IssueDataType {
  id: string;
  iid: number;
  title: string;
  description: string;
  createdAt: string;
  closedAt: string;
  updatedAt: string;
  labels: string[];
  state: string;
  webUrl: string;
  mentions: Mention[];
}

class Issue extends Model<IssueDataType> {
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

    return this.ensureByExample({ id: issueData.id }, issueData, {});
  }

  async deduceUsers() {
    if (this.rawDb === undefined) {
      throw Error('Database undefined!');
    }
    return Promise.resolve(
      this.rawDb.query(
        aql`FOR issue IN issues
        LET users = (FOR user
                            IN
                            INBOUND issue ${IssueUserConnection.collection}
                            RETURN user)
        LET a = FIRST(
              FOR
              account, edge
              IN
              OUTBOUND issue ${IssueAccountConnection.collection}
              FILTER edge.role == "author"
              RETURN account
        )
        FILTER LENGTH(users) == 0
        COLLECT author = a INTO issuesPerAuthor = issue
        RETURN {
          "author": author,
          "issues": issuesPerAuthor
        }`,
      ),
    )
      .then((cursor) => cursor.all())
      .then((authors) => {
        return authors.map((issuesPerAuthor) =>
          User.findOneBy('gitlabID', issuesPerAuthor.author.id)
            .then(function (user) {
              if (!user) {
                log('No existing user found for gitlabId %o', issuesPerAuthor.author.id);
                return findBestUserMatch(issuesPerAuthor.author).then(function (user) {
                  if (!user) {
                    return;
                  }

                  log('Best user match: %o', user.toString());

                  user.gitlabId = issuesPerAuthor.author.id;
                  user.gitlabName = issuesPerAuthor.author.name;
                  user.gitlabWebUrl = issuesPerAuthor.author.web_url;
                  user.gitlabAvatarUrl = issuesPerAuthor.author.avatar_url;
                  return user.save();
                });
              }

              return user;
            })
            .then((user) => {
              if (!user) {
                log('No user match found for %o', issuesPerAuthor.author.name);
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
                return IssueUserConnection.connect({}, { from: issue, to: user });
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

async function findBestUserMatch(author: AccountUser) {
  const user = await User.findAll();
  const bestMatch = user.reduce((best: any, userEntry) => {
    if (userEntry === null) {
      return;
    }
    const userName = normalizeName(userEntry.data.gitSignature);
    const authorName = normalizeName(author.name);
    let score = 0;

    if (userName.plain === authorName.plain) {
      score++;
    }

    if (userName.sorted === authorName.sorted) {
      score++;
    }

    if (!best || score > best.score) {
      return { score, user };
    } else if (score > 0) {
      return best;
    }
  }, null);
  return bestMatch ? bestMatch.data.user : null;
}

function normalizeName(name: string) {
  const plain = _.chain(name).deburr().lowerCase().trim().value();
  const sorted = _.chain(plain).split(/\s+/).sort().join(' ').value();

  return { plain, sorted };
}

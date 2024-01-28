'use strict';

import { graphQl, traversePages } from '../../utils';
import _ from 'lodash';
import moment from 'moment/moment';

export default class Milestones {
  static getMilestoneData() {
    const milestoneList = [];
    const getMilestonesPage = () => (page, perPage) => {
      return graphQl
        .query(
          `
          query($page: Int, $perPage: Int) {
            milestones(page: $page, perPage: $perPage) {
              count
              page
              perPage
              count
              data {
                  id
                  iid
                  title
                  description
                  state
                  createdAt
                  updatedAt
                  dueDate
                  startDate
                  expired
                  webUrl
              }
            }
          }`,
          { page, perPage },
        )
        .then((resp) => resp.milestones);
    };

    return traversePages(getMilestonesPage(), (milestone) => {
      milestoneList.push(milestone);
    }).then(function () {
      return milestoneList;
    });
  }
}

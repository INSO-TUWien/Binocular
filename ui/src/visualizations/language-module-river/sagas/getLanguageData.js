'use strict';

import { traversePages, graphQl } from '../../../utils';

export default function getLanguageData() {
  const languages = [];

  return traversePages(getLanguagePage, language => {
    languages.push(language);
  }).then(function() {
    return languages;
  });
}

const getLanguagePage = (page, perPage) => {
  return graphQl
    .query(
      `
    query($page: Int, $perPage: Int) {
      languages(page: $page, perPage: $perPage) {
        page
        perPage
        count
        data{
          name,
          aliases,
          color,
          popular
        }
      }
    }`,
      { page, perPage }
    )
    .then(resp => resp.languages);
};

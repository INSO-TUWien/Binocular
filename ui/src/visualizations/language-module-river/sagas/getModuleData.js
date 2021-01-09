'use strict';

import { traversePages, graphQl } from '../../../utils';

export default function getModuleData() {
  const modules = [];

  return traversePages(getModulesPage, module => {
    module.subModules = module.subModules && module.subModules.data ? (module.subModules.data || []).map(subModule => subModule.path) : [];
    modules.push(module);
  }).then(function() {
    return modules;
  });
}

const getModulesPage = (page, perPage) => {
  return graphQl
    .query(
      `query($page: Int, $perPage: Int) {
        modules(page: $page, perPage: $perPage) {
          data{
            path,
            subModules {
              data {path}
            }
          }
        }
      }`,
      { page, perPage }
    )
    .then(resp => resp.modules);
};

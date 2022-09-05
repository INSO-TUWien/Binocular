'use strict';

import { graphQl } from '../../../../utils';

/**
 * Gets all modules with their respective files and submodules
 * @returns {*} (see below)
 */
export default function getModuleData() {

  return graphQl
    .query(
      `{
        moduleData: modules {
          data {
            path
            files {
              data {
                  path
              }
            }
            subModules {
              data {
                path
              }
            }
          }
        }
      }`,
    )
    .then((resp) => ({
      moduleData: resp.moduleData.data
    }));
};
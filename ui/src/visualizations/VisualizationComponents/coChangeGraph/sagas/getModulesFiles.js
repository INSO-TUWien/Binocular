'use strict';

import { graphQl } from '../../../../utils';

/**
 * Gets all commits with their respective modules
 * @returns {*} (see below)
 */
export default function getModulesFiles() {

  return graphQl
    .query(
      `{
        modulesFiles: modules {
            data {
                path
                files {
                    data {
                        path
                    }
                }
            }
        }
      }`,
    )
    .then((resp) => ({
        modulesFiles: resp.modulesFiles.data
    }));
};
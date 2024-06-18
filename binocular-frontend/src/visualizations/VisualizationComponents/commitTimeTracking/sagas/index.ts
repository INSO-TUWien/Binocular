'use strict';

import { fetchFactory } from '../../../../sagas/utils.ts';

interface ChangesData {} //TODO: replace empty interface

//TODO: Add actions

export default function* () {} //TODO: replace function with yielding forks for the watchers

//TODO: Add watchers

/**
 * Fetch data for dashboard, this still includes old functions that were copied over.
 */
export const fetchChangesData = fetchFactory(function* () {}, {}, {}, {}); //TODO: replace for fetching the data

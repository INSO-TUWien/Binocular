'use strict';

//Formats the date for the tooltip
import { UniversalSettings } from '../types/unversalSettingsTypes.ts';
import { Author } from '../types/authorTypes.ts';
import { getContext } from './context';

const ctx = getContext();
const LOCAL_STORAGE_VERSION: number = 1;
export function updateUniversalSettingsLocalStorage(key: string, value: any, defaultConfig: UniversalSettings): UniversalSettings {
  let currConfig: UniversalSettings;
  if (localStorage.getItem(ctx.repo.name + '-UniversalSettings-V' + LOCAL_STORAGE_VERSION) === null) {
    currConfig = defaultConfig;
  } else {
    try {
      currConfig = JSON.parse(<string>localStorage.getItem(ctx.repo.name + '-UniversalSettings-V' + LOCAL_STORAGE_VERSION));
    } catch (e) {
      currConfig = defaultConfig;
    }
  }

  (currConfig[key as keyof UniversalSettings] as any) = value;
  if (currConfig.mergedAuthors.length > 0 && (currConfig.initialized === undefined || currConfig.initialized === false)) {
    selectAllAuthors(currConfig);
    currConfig.initialized = true;
  }

  localStorage.setItem(ctx.repo.name + '-UniversalSettings-V' + LOCAL_STORAGE_VERSION, JSON.stringify(currConfig));
  return currConfig;
}

export function getUniversalSettingsLocalStorage(defaultConfig: UniversalSettings): UniversalSettings {
  let currConfig: UniversalSettings;
  if (localStorage.getItem(ctx.repo.name + '-UniversalSettings-V' + LOCAL_STORAGE_VERSION) === null) {
    currConfig = defaultConfig;
  } else {
    try {
      currConfig = JSON.parse(<string>localStorage.getItem(ctx.repo.name + '-UniversalSettings-V' + LOCAL_STORAGE_VERSION));
      if (currConfig.initialized === undefined || currConfig.initialized === false) {
        selectAllAuthors(currConfig);
        currConfig.initialized = true;
      }
    } catch (e) {
      currConfig = defaultConfig;
    }
  }

  return currConfig;
}

function selectAllAuthors(config: UniversalSettings) {
  config.selectedAuthorsGlobal = config.mergedAuthors.map((mergedAuthor: Author) => mergedAuthor.mainCommitter);
}

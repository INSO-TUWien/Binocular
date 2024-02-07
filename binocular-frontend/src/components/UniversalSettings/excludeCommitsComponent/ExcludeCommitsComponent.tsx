'use strict';

import styles from './styles.module.scss';
import * as React from 'react';
import { useState } from 'react';
import _ from 'lodash';

export default ({ excludedCommits, setGlobalExcludeCommits }) => {
  // local state
  const [excludeCommitsInput, setExcludeCommitsInput] = useState('');

  const addExcludedCommits = () => {
    if (excludeCommitsInput === '' || excludeCommitsInput === undefined || excludeCommitsInput === null) {
      setExcludeCommitsInput('');
      return;
    }

    // try to extract commit hashes
    const newHashes = excludeCommitsInput
      .split(',')
      .filter((h) => h !== '')
      .map((h) => h.trim());

    setGlobalExcludeCommits(_.uniq(excludedCommits.concat(newHashes)));
    setExcludeCommitsInput('');
  };

  const removeExcludedCommits = (toBeRemoved: string) => {
    setGlobalExcludeCommits(excludedCommits.filter((c: string) => c !== toBeRemoved));
  };

  const removeAllExcludedCommits = () => {
    setGlobalExcludeCommits([]);
  };

  return (
    <div className={styles.field}>
      <label htmlFor="hideExcludeCommitSettingsInput">Exclude specific commits:</label>
      <div className={styles.inputBar}>
        <input
          id="hideExcludeCommitSettingsInput"
          name="hideExcludeCommitSettingsInput"
          className={'input'}
          value={excludeCommitsInput}
          onChange={(e) => setExcludeCommitsInput(e.target.value)}
        />
        <button className={'button'} onClick={() => addExcludedCommits()}>
          <i className={'fa fa-check'} />
        </button>
      </div>

      {excludedCommits.length > 0 && (
        <>
          <button className={styles.button} onClick={removeAllExcludedCommits}>
            Remove all
          </button>
          <div className={styles.commitList}>
            {excludedCommits.map((c: string) => (
              <div className={styles.card + ' ' + styles.listItem} key={`exclude_${c}`}>
                <p>{c}</p>
                <button className="card-header-icon" onClick={() => removeExcludedCommits(c)}>
                  <i className="fa fa-times"></i>
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

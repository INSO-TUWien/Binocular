import type { DataPluginCommit } from '../../../../../interfaces/dataPluginInterfaces/dataPluginCommits';
import CommitInfo from './commitInfo';
import CommitHunks from './commitHunks';
import type { SelectedFile } from '../../reducer';
import { useState } from 'react';

function CommitsList(props: { commits: DataPluginCommit[]; file: SelectedFile | null }) {
  const [commits, setCommits] = useState<DataPluginCommit[]>(props.commits);

  return (
    <>
      <h2>Commits:</h2>
      <label className="input">
        <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </g>
        </svg>
        <input
          type="search"
          required
          placeholder="Search"
          onChange={(e) => {
            setCommits(
              props.commits.filter(
                (commit) => commit.sha.includes(e.target.value) || commit.message.toLowerCase().includes(e.target.value.toLowerCase()),
              ),
            );
          }}
        />
      </label>
      {commits.map((commit: DataPluginCommit, i: number) => {
        return (
          <details
            key={`rowOverviewTooltipCommit${i}`}
            className={'collapse collapse-arrow bg-base-100 border border-base-300 mb-1'}
            name={'tooltip-accordeon'}>
            <summary className={'collapse-title'}>
              <div className={'font-semibold'}>{commit.sha}</div>
              <div className={'font-extralight'}>{commit.message}</div>
            </summary>
            <div className={'collapse-content text-sm'}>
              <div>
                <CommitInfo commit={commit} />
              </div>
              <details className={'collapse collapse-arrow bg-base-100 border border-base-300 mb-1'} name={'tooltip-sub-accordeon'}>
                <summary className={'collapse-title font-semibold'}>Hunks</summary>
                <div className={'collapse-content text-sm'}>
                  <CommitHunks hunks={commit.files?.data.find((file) => file.file.path === props.file?.path)?.hunks} />
                </div>
              </details>
            </div>
          </details>
        );
      })}
    </>
  );
}

export default CommitsList;

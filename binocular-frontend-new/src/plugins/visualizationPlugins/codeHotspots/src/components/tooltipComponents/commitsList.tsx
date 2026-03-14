import type { DataPluginCommit } from '../../../../../interfaces/dataPluginInterfaces/dataPluginCommits';
import CommitInfo from './commitInfo';
import CommitHunks from './commitHunks';
import type { SelectedFile } from '../../reducer';
import { useState } from 'react';
import SearchBar from '../../../../../../components/searchBar/searchBar';

function CommitsList(props: { commits: DataPluginCommit[]; file: SelectedFile | null }) {
  const [commits, setCommits] = useState<DataPluginCommit[]>(props.commits);

  return (
    <>
      <h2>Commits:</h2>
      <SearchBar
        onSearch={(search) =>
          setCommits(
            props.commits.filter((commit) => commit.sha.includes(search) || commit.message.toLowerCase().includes(search.toLowerCase())),
          )
        }
      />
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

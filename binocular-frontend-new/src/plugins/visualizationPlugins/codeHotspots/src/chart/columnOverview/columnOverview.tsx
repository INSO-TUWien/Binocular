import type { DataPluginCommit } from '../../../../../interfaces/dataPluginInterfaces/dataPluginCommits';
import type { SelectedFile } from '../../reducer';
import { useRef } from 'react';
import InfoTooltip from '../../../../../../components/infoTooltip/infoTooltip';
import { hideInfoTooltip, showInfoTooltip } from '../../../../../../components/infoTooltip/infoTooltipHelper';
import CommitInfo from '../../components/tooltipComponents/commitInfo';
import CommitHunks from '../../components/tooltipComponents/commitHunks';
import CommitOtherFiles from '../../components/tooltipComponents/commitOtherFiles';
import chroma from 'chroma-js';

function ColumnOverview(props: {
  commits: DataPluginCommit[];
  file: SelectedFile | null;
  onSetFile: (path?: string, url?: string) => void;
  onSelectCommit: (sha: string) => void;
}) {
  const maxChanges = findMaxChanged(props.commits);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const tooltipVisibleFlagRef = useRef(false);

  function findMaxChanged(commits: DataPluginCommit[]) {
    let maxChanges = 0;
    commits.forEach((commit) => {
      maxChanges = Math.max(maxChanges, calcChangedLines(commit));
    });
    return maxChanges;
  }

  function calcChangedLines(commit: DataPluginCommit) {
    let changes = 0;
    commit.files?.data
      .find((file) => file.file.path === props.file?.path)
      ?.hunks.forEach((hunk) => {
        changes += hunk.newLines + hunk.oldLines;
      });
    return changes;
  }

  return (
    <>
      <InfoTooltip ref={tooltipRef} tooltipVisibleFlagRef={tooltipVisibleFlagRef}></InfoTooltip>
      <div id={'columnOverview'} style={{ width: '100%', height: '100%', position: 'relative' }}>
        {props.commits.map((commit: DataPluginCommit, i: number) => {
          const changes = calcChangedLines(commit);
          return (
            <div
              key={commit.sha}
              className="columnOverviewColumn"
              style={{
                width: `${100 / props.commits.length}%`,
                height: '100%',
                position: 'absolute',
                left: `${(100 / props.commits.length) * i}%`,
                top: 0,
              }}
              onMouseLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                hideInfoTooltip(tooltipRef, tooltipVisibleFlagRef);
              }}
              onMouseEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                showInfoTooltip(tooltipRef, tooltipVisibleFlagRef, e.clientX + 10, e.clientY + 20, {
                  headline: commit.sha,
                  reactContent: (
                    <>
                      <button className={'btn mb-1 btn-outline'} onClick={() => props.onSelectCommit(commit.sha)}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-git-commit-horizontal-icon lucide-git-commit-horizontal">
                          <circle cx="12" cy="12" r="3" />
                          <line x1="3" x2="9" y1="12" y2="12" />
                          <line x1="15" x2="21" y1="12" y2="12" />
                        </svg>
                        View file at commit
                      </button>
                      <details className="collapse collapse-arrow bg-base-100 border border-base-300 mb-1" name="tooltip-accordeon" open>
                        <summary className="collapse-title font-semibold">Info</summary>
                        <div className="collapse-content text-sm">
                          <CommitInfo commit={commit} />
                        </div>
                      </details>
                      <details className="collapse collapse-arrow bg-base-100 border border-base-300 mb-1" name="tooltip-accordeon">
                        <summary className="collapse-title font-semibold">Hunks</summary>
                        <div className="collapse-content text-sm">
                          <CommitHunks hunks={commit.files?.data.find((file) => file.file.path === props.file?.path)?.hunks} />
                        </div>
                      </details>
                      <details className="collapse collapse-arrow bg-base-100 border border-base-300" name="tooltip-accordeon">
                        <summary className="collapse-title font-semibold">Other Edited Files</summary>
                        <div className="collapse-content text-sm">
                          <CommitOtherFiles
                            files={commit.files?.data || []}
                            onSetFile={(path, url) => {
                              hideInfoTooltip(tooltipRef, tooltipVisibleFlagRef);
                              props.onSetFile(path, url);
                            }}
                          />
                        </div>
                      </details>
                    </>
                  ),
                });
              }}>
              <div
                key={commit.sha}
                style={{
                  position: 'absolute',
                  width: `100%`,
                  height: `${(100 / maxChanges) * changes}%`,
                  bottom: '0',
                  border: '1px solid #0088ff55',
                  backgroundColor: chroma.mix('#0088ff22', '#0088ffcc', (1.0 / maxChanges) * changes).hex(),
                }}></div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default ColumnOverview;

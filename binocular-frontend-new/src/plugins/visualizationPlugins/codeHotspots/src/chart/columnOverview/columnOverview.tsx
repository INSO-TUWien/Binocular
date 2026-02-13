import type { DataPluginCommit } from '../../../../../interfaces/dataPluginInterfaces/dataPluginCommits';
import type { SelectedFile } from '../../reducer';
import { useRef } from 'react';
import InfoTooltip from '../../../../../../components/infoTooltip/infoTooltip';
import { showInfoTooltip } from '../../../../../../components/infoTooltip/infoTooltipHelper';
import CommitInfo from './tooltipComponents/commitInfo';
import CommitHunks from './tooltipComponents/commitHunks';
import CommitOtherFiles from './tooltipComponents/commitOtherFiles';
import chroma from "chroma-js";

function ColumnOverview(props: {
  commits: DataPluginCommit[];
  file: SelectedFile | null;
  onSetFile: (path?: string, url?: string) => void;
}) {
  const maxChanges = findMaxChanged(props.commits);
  const tooltipRef = useRef<HTMLDivElement>(null);

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
      <InfoTooltip ref={tooltipRef}></InfoTooltip>
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
              onMouseEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();

                showInfoTooltip(tooltipRef, e.clientX + 10, e.clientY + 20, {
                  headline: commit.sha,
                  reactContent: (
                    <>
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
                          <CommitOtherFiles files={commit.files?.data || []} onSetFile={props.onSetFile} />
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
                  backgroundColor: chroma.mix('#0088ff22', '#0088ffff', (1.0 / maxChanges) * changes).hex(),
                }}></div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default ColumnOverview;

import type { DataPluginCommit } from '../../../../../interfaces/dataPluginInterfaces/dataPluginCommits';
import type { SelectedFile } from '../../reducer';
import { useRef } from 'react';
import InfoTooltip from '../../../../../../components/infoTooltip/infoTooltip';
import chroma from 'chroma-js';
import { hideInfoTooltip, showInfoTooltip } from '../../../../../../components/infoTooltip/infoTooltipHelper';
import CommitInfo from '../../components/tooltipComponents/commitInfo';
import CommitHunks from '../../components/tooltipComponents/commitHunks';

interface RowInfo {
  changes: number;
  rowNumber: number;
  commits: DataPluginCommit[];
}

function RowOverview(props: { commits: DataPluginCommit[]; file: SelectedFile | null; lineHeight: number; topOffset: number }) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipVisibleFlagRef = useRef(false);

  const rowInfos: { [RowNumber: string]: RowInfo } = {};
  let maxChanges: number = 0;
  for (const commit of props.commits) {
    const hunks = getCommitHunks(commit) || [];
    for (const hunk of hunks) {
      addToRowInfos(hunk.oldStart, hunk.oldLines, commit);
      addToRowInfos(hunk.newStart, hunk.newLines, commit);
    }
  }

  function addToRowInfos(startLine: number, lines: number, commit: DataPluginCommit) {
    for (let i = startLine; i <= startLine + lines; i++) {
      if (rowInfos[`Row#${i}`] == undefined) {
        rowInfos[`Row#${i}`] = { changes: 1, rowNumber: i, commits: [commit] };
      } else {
        const commits = rowInfos[`Row#${i}`].commits;
        if (commits.filter((c) => c.sha === commit.sha).length == 0) {
          commits.push(commit);
        }
        rowInfos[`Row#${i}`].commits = commits;
        rowInfos[`Row#${i}`].changes = rowInfos[`Row#${i}`].changes + 1;
        if (rowInfos[`Row#${i}`].changes > maxChanges) {
          maxChanges = rowInfos[`Row#${i}`].changes;
        }
      }
    }
  }

  function getCommitHunks(commit: DataPluginCommit) {
    return commit.files?.data.find((file) => file.file.path === props.file?.path)?.hunks;
  }

  return (
    <>
      <InfoTooltip ref={tooltipRef} tooltipVisibleFlagRef={tooltipVisibleFlagRef}></InfoTooltip>
      <div id={'columnOverview'} style={{ width: '100%', height: '100%', position: 'relative' }}>
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: `${props.topOffset}px`, left: 0 }}>
          {Object.values(rowInfos).map((rowInfo) => (
            <div
              key={rowInfo.rowNumber}
              style={{
                width: '100%',
                height: `${props.lineHeight}px`,
                position: 'absolute',
                top: `${(rowInfo.rowNumber-1) * props.lineHeight}px`,
                left: '2px',
                border: '1px solid #0088ff55',
                backgroundColor: chroma.mix('#0088ff22', '#0088ffff', (1.0 / maxChanges) * rowInfo.changes).hex(),
              }}
              onMouseLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                hideInfoTooltip(tooltipRef, tooltipVisibleFlagRef);
              }}
              onMouseEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();

                showInfoTooltip(tooltipRef, tooltipVisibleFlagRef, e.clientX - 30, e.clientY + 20, {
                  headline: `Row ${rowInfo.rowNumber}`,
                  reactContent: (
                    <>
                      {rowInfo.commits.map((commit: DataPluginCommit, i: number) => {
                        return (
                          <details
                            key={`rowOverviewTooltipCommit${i}`}
                            className="collapse collapse-arrow bg-base-100 border border-base-300 mb-1"
                            name="tooltip-accordeon">
                            <summary className="collapse-title font-semibold">{commit.sha}</summary>
                            <div className="collapse-content text-sm">
                              <div>
                                <CommitInfo commit={commit} />
                              </div>
                              <details
                                className="collapse collapse-arrow bg-base-100 border border-base-300 mb-1"
                                name="tooltip-sub-accordeon">
                                <summary className="collapse-title font-semibold">Hunks</summary>
                                <div className="collapse-content text-sm">
                                  <CommitHunks hunks={commit.files?.data.find((file) => file.file.path === props.file?.path)?.hunks} />
                                </div>
                              </details>
                            </div>
                          </details>
                        );
                      })}
                    </>
                  ),
                });
              }}></div>
          ))}
        </div>
      </div>
    </>
  );
}

export default RowOverview;

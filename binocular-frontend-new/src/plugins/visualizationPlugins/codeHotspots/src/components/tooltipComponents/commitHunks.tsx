import type { DataPluginHunk } from '../../../../../interfaces/dataPluginInterfaces/dataPluginFiles';

function CommitHunks(props: { hunks?: DataPluginHunk[] }) {
  return (
    <>
      <div className="rounded-box border border-base-content/5 bg-base-100">
        <table className="table text-base-content">
          <tbody>
            {props.hunks?.map((hunk: DataPluginHunk, index: number) => (
              <tr key={index}>
                <td>{index}</td>
                <td>
                  <table className="table text-base-content">
                    <tbody>
                      <tr>
                        <td>Old Start</td>
                        <td>
                          <span>{hunk.oldStart}</span>
                        </td>
                      </tr>
                      <tr>
                        <td>Old Lines</td>
                        <td>
                          <span>{hunk.oldLines}</span>
                        </td>
                      </tr>
                      <tr>
                        <td>New Start</td>
                        <td>
                          <span>{hunk.newStart}</span>
                        </td>
                      </tr>
                      <tr>
                        <td>New Lines</td>
                        <td>
                          <span>{hunk.newLines}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default CommitHunks;

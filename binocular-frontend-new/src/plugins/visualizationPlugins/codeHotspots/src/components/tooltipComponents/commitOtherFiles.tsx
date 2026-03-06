import type { DataPluginFileInCommit } from '../../../../../interfaces/dataPluginInterfaces/dataPluginFiles';

function CommitOtherFiles(props: { files: DataPluginFileInCommit[]; onSetFile: (path?: string, url?: string) => void }) {
  return (
    <>
      <div className="rounded-box border border-base-content/5 bg-base-100">
        <table className="table text-base-content">
          <tbody>
            {props.files.map((file, index) => (
              <tr key={index}>
                <td>{file.file.path}</td>
                <td>
                  <button className={'btn'} onClick={() => props.onSetFile(file.file.path, file.file.webUrl)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default CommitOtherFiles;

import type { DataPluginFileInCommit } from '../../../../../interfaces/dataPluginInterfaces/dataPluginFiles';

function CommitOtherFiles(props: { files: DataPluginFileInCommit[] }) {
  return (
    <>
      <div className="rounded-box border border-base-content/5 bg-base-100">
        <table className="table text-base-content">
          <tbody>
            {props.files.map((file, index) => (
              <tr key={index}>
                <td>{file.file.path}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default CommitOtherFiles;

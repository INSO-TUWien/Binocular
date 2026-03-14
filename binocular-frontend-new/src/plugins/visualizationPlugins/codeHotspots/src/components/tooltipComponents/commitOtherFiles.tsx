import type { DataPluginFileInCommit } from '../../../../../interfaces/dataPluginInterfaces/dataPluginFiles';
import { useState } from 'react';
import SearchBar from '../../../../../../components/searchBar/searchBar';

function CommitOtherFiles(props: { files: DataPluginFileInCommit[]; onSetFile: (path?: string, url?: string) => void }) {
  const [files, setFiles] = useState<DataPluginFileInCommit[]>(props.files);
  return (
    <>
      <SearchBar
        onSearch={(search) => setFiles(props.files.filter((file) => file.file.path.toLowerCase().includes(search.toLowerCase())))}
      />
      <div className="rounded-box border border-base-content/5 bg-base-100">
        <table className="table text-base-content">
          <tbody>
            {files.map((file, index) => (
              <tr key={index}>
                <td>{file.file.path}</td>
                <td style={{ minWidth: '10rem' }}>
                  <button className={'btn btn-accent'} onClick={() => props.onSetFile(file.file.path, file.file.webUrl)}>
                    View
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-6">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
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

import { addDataPlugin } from '../../../redux/settings/settingsReducer.ts';
import { DataPlugin } from '../../../plugins/interfaces/dataPlugin.ts';
import { createRef, useState } from 'react';
import { AppDispatch, useAppDispatch } from '../../../redux';

enum State {
  unconfigured,
  uploading,
  configured,
  error,
}

function AddDataPluginCard(props: { dataPlugin: DataPlugin }) {
  const dispatch: AppDispatch = useAppDispatch();

  const apiKeyRef = createRef<HTMLInputElement>();
  const endpointRef = createRef<HTMLInputElement>();
  const fileRef = createRef<HTMLInputElement>();
  const fileNameRef = createRef<HTMLInputElement>();

  const [fileName, setFileName] = useState<string | undefined>(undefined);

  const [state, setState] = useState(State.unconfigured);

  return (
    <div className={'card w-96 bg-base-100 shadow-xl mb-3 mr-3 border-2 border-base-300'} key={props.dataPlugin.name}>
      <div className="card-body">
        <h2 className="card-title">
          {props.dataPlugin.name}
          {props.dataPlugin.experimental && <div className="badge badge-warning">Experimental</div>}
        </h2>
        <div>{props.dataPlugin.description}</div>
        <h3 className="font-bold">Capabilities:</h3>
        <ul className={'list-disc ml-6'}>
          {props.dataPlugin.capabilities.map((capability) => (
            <li key={`plugin${props.dataPlugin.name}Capability${capability}`}>{capability}</li>
          ))}
        </ul>
        {props.dataPlugin.requirements.apiKey && (
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="font-bold">API Key:</span>
            </div>
            <input type="text" placeholder="API Key" className="input input-bordered w-full max-w-xs" ref={apiKeyRef} />
          </label>
        )}
        {props.dataPlugin.requirements.endpoint && (
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="font-bold">Endpoint URL:</span>
            </div>
            <input type="text" placeholder="Endpoint URL" className="input input-bordered w-full max-w-xs" ref={endpointRef} />
          </label>
        )}
        {props.dataPlugin.requirements.file && state === State.unconfigured && (
          <>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="font-bold">File:</span>
              </div>
              <input
                ref={fileRef}
                type={'file'}
                id={'importStorageFilePicker'}
                className={'mt-1 file-input file-input-bordered w-full max-w-xs'}
                accept={'text/json'}
              />
            </label>
            <label>
              <div className="label">
                <span className="font-bold">Name:</span>
              </div>
              <input
                ref={fileNameRef}
                type={'text'}
                id={'importStorageFileName'}
                className={'input input-bordered w-full max-w-xs'}
                accept={'text/json'}
                placeholder={'Name'}
              />
            </label>
            <button
              className={'btn btn-outline btn-xs mt-1'}
              onClick={() => {
                const fileInput = fileRef.current;
                const fileNameInput = fileNameRef.current;
                if (fileInput && fileNameInput) {
                  if (fileInput.files && fileInput.files.length > 0) {
                    fileInput.classList.remove('file-input-error');
                    if (fileNameInput.value.length > 0) {
                      fileNameInput.classList.remove('input-error');
                      const file: File = fileInput.files[0];
                      setState(State.uploading);
                      props.dataPlugin
                        .init(undefined, undefined, { name: fileNameInput.value.replace(' ', '_'), file: file })
                        .then(() => {
                          setFileName(fileNameInput.value.replace(' ', '_'));
                          setState(State.configured);
                        })
                        .catch(() => {
                          setState(State.error);
                        });
                    } else {
                      fileNameInput.classList.add('input-error');
                    }
                  } else {
                    fileInput.classList.add('file-input-error');
                  }
                }
              }}>
              Upload
            </button>
          </>
        )}
        {props.dataPlugin.requirements.file && state === State.uploading && (
          <div>
            <span>Uploading Database</span>
            <span className="loading loading-spinner loading-xs"></span>
          </div>
        )}
        {props.dataPlugin.requirements.file && state === State.configured && (
          <div>
            <span className={'font-bold'}>Database:</span>
            <span>{fileName}</span>
          </div>
        )}
        {props.dataPlugin.requirements.file && state === State.error && (
          <div>
            <div className={'text-error'}>Error Uploading</div>
            <button
              className="btn btn-outline"
              onClick={() => {
                setState(State.unconfigured);
              }}>
              Retry
            </button>
          </div>
        )}
        <p></p>
        <div className="card-actions justify-end">
          <button
            className="btn btn-outline"
            disabled={
              (props.dataPlugin.requirements.apiKey && apiKeyRef.current?.value.length === 0) ||
              (props.dataPlugin.requirements.endpoint && endpointRef.current?.value.length === 0) ||
              (props.dataPlugin.requirements.file && !(fileName && fileName.length >= 0))
            }
            onClick={() => {
              dispatch(
                addDataPlugin({
                  name: props.dataPlugin.name,
                  color: '#000',
                  parameters: {
                    apiKey: apiKeyRef.current?.value,
                    endpoint: endpointRef.current?.value,
                    fileName: fileName,
                  },
                }),
              );
            }}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddDataPluginCard;

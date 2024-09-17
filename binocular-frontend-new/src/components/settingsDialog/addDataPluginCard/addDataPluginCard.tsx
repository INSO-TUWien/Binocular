import { addDataPlugin } from '../../../redux/settings/settingsReducer.ts';
import { DataPlugin } from '../../../plugins/interfaces/dataPlugin.ts';
import { createRef } from 'react';
import { AppDispatch, useAppDispatch } from '../../../redux';

function AddDataPluginCard(props: { dataPlugin: DataPlugin }) {
  const dispatch: AppDispatch = useAppDispatch();

  const apiKeyRef = createRef<HTMLInputElement>();
  const endpointRef = createRef<HTMLInputElement>();
  const fileRef = createRef<HTMLInputElement>();

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
        {props.dataPlugin.requirements.file && (
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
        )}
        <p></p>
        <div className="card-actions justify-end">
          <button
            className="btn btn-outline"
            disabled={
              (props.dataPlugin.requirements.apiKey && apiKeyRef.current?.value.length === 0) ||
              (props.dataPlugin.requirements.endpoint && endpointRef.current?.value.length === 0)
            }
            onClick={() => {
              if (props.dataPlugin.requirements.file) {
                const fileInput = fileRef.current;
                if (fileInput && fileInput.files) {
                  const file: File = fileInput.files[0];
                  dispatch(
                    addDataPlugin({
                      name: props.dataPlugin.name,
                      color: '#000',
                      parameters: { apiKey: apiKeyRef.current?.value, endpoint: endpointRef.current?.value, file: file },
                    }),
                  );
                }
              } else {
                dispatch(
                  addDataPlugin({
                    name: props.dataPlugin.name,
                    color: '#000',
                    parameters: { apiKey: apiKeyRef.current?.value, endpoint: endpointRef.current?.value, file: undefined },
                  }),
                );
              }
            }}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddDataPluginCard;

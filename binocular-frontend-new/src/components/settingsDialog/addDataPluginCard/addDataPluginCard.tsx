import { addDataPlugin } from '../../../redux/reducer/settings/settingsReducer.ts';
import type { DataPlugin } from '../../../plugins/interfaces/dataPlugin.ts';
import { createRef, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { type AppDispatch, useAppDispatch } from '../../../redux';
import type { MetadataType } from '../../../types/data/MetadataType.ts';
import { capabilityDescriptions } from '../../../plugins/capabilityDescriptions.ts';
import type { VisualizationPluginMetadataCategory } from '../../../plugins/interfaces/visualizationPluginInterfaces/visualizationPluginMetadata.ts';

function CapabilityBadge({ capability }: { capability: VisualizationPluginMetadataCategory }) {
  const [visible, setVisible] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({ visibility: 'hidden' });
  const badgeRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const description = capabilityDescriptions[capability];

  useLayoutEffect(() => {
    if (!visible || !badgeRef.current || !tooltipRef.current) return;

    const badge = badgeRef.current.getBoundingClientRect();
    const tip = tooltipRef.current.getBoundingClientRect();
    const vw = window.innerWidth;

    let left = badge.left + badge.width / 2;
    left = Math.max(tip.width / 2 + 8, Math.min(left, vw - tip.width / 2 - 8));

    const fitsAbove = badge.top - tip.height - 6 >= 8;
    const top = fitsAbove ? badge.top - 6 : badge.bottom + 6;
    const translateY = fitsAbove ? '-100%' : '0%';

    setStyle({ left, top, transform: `translate(-50%, ${translateY})`, visibility: 'visible' });
  }, [visible]);

  return (
    <>
      <span
        ref={badgeRef}
        className="badge badge-outline rounded-full cursor-default"
        onMouseEnter={() => {
          setStyle({ visibility: 'hidden' });
          setVisible(true);
        }}
        onMouseLeave={() => setVisible(false)}>
        {capability}
      </span>
      {visible &&
        description &&
        createPortal(
          <div
            ref={tooltipRef}
            className="fixed z-[9999] px-2 py-1 text-xs bg-neutral text-neutral-content rounded whitespace-nowrap pointer-events-none"
            style={style}>
            {description}
          </div>,
          document.getElementById('settingsDialog') ?? document.body,
        )}
    </>
  );
}

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

  const progressUpdateUseRef = createRef<HTMLInputElement>();
  const progressUpdateEndpointRef = createRef<HTMLInputElement>();

  const [uploadInfo, setUploadInfo] = useState<string>('');

  const [fileName, setFileName] = useState<string | undefined>(undefined);
  const [metadata, setMetadata] = useState<MetadataType | undefined>(undefined);

  const [state, setState] = useState(State.unconfigured);

  return (
    <div className={'card w-96 bg-base-100 shadow-md mb-3 mr-3 border border-base-300 min-w-96'} key={props.dataPlugin.name}>
      <div className="card-body">
        <h2 className="card-title">
          {props.dataPlugin.name}
          {props.dataPlugin.experimental && <div className="badge badge-warning">Experimental</div>}
        </h2>
        <div>{props.dataPlugin.description}</div>
        <div className="font-bold ">Capabilities:</div>
        <div className={'flex flex-wrap gap-1'}>
          {props.dataPlugin.capabilities.map((capability) => (
            <CapabilityBadge key={`plugin${props.dataPlugin.name}Capability${capability}`} capability={capability} />
          ))}
        </div>
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
              <span className="font-bold">Endpoint URL (leave empty for default):</span>
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
                        .init(
                          undefined,
                          undefined,
                          { name: fileNameInput.value.replace(' ', '_'), file: file, dbObjects: undefined },
                          undefined,
                          setUploadInfo,
                        )
                        .then((meta) => {
                          setFileName(fileNameInput.value.replace(' ', '_'));
                          setMetadata(meta);
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
        {props.dataPlugin.requirements.progressUpdate && (
          <>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="font-bold">Use Progress Update:</span>
              </div>
              <input type="checkbox" className="toggle toggle-primary" ref={progressUpdateUseRef} />
            </label>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="font-bold text-wrap">
                  Progress Update Endpoint URL (only necessary if progress update is used, leave empty for default):
                </span>
              </div>
              <input
                type="text"
                placeholder="Progress Update Endpoint URL"
                className="input input-bordered w-full max-w-xs"
                ref={progressUpdateEndpointRef}
              />
            </label>
          </>
        )}
        {props.dataPlugin.requirements.file && state === State.uploading && (
          <div>
            <span>Uploading Database</span>
            <span className="loading loading-spinner loading-xs"></span>
            <br />
            <progress
              className="progress progress-primary w-56"
              value={uploadInfo.split('/')[0]}
              max={uploadInfo.includes('/') ? parseInt(uploadInfo.split('/')[1]) : 0}></progress>
            <br />
            <span>{uploadInfo}</span>
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
                    progressUpdate: progressUpdateUseRef.current
                      ? {
                          endpoint: progressUpdateEndpointRef.current?.value,
                          useAutomaticUpdate: progressUpdateUseRef.current.checked,
                        }
                      : undefined,
                  },
                  metadata: metadata,
                }),
              );
              setState(State.unconfigured);
              setMetadata(undefined);
            }}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddDataPluginCard;

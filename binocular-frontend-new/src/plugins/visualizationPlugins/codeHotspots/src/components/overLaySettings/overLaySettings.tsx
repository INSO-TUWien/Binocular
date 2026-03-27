import { type Ref, useEffect, useState } from 'react';
import type { CodeHotspotsGitlabSettings } from '../../types/CodeHotspotsGitlabSettings';

export function OverLaySettings(props: {
  ref: Ref<HTMLDialogElement>;
  gitlabSettings: CodeHotspotsGitlabSettings;
  onGitLabSettingsChange: (newGitlabSettings: CodeHotspotsGitlabSettings) => void;
}) {
  const [gitlabServerUrl, setGitlabServerUrl] = useState<string>(props.gitlabSettings.serverUrl);
  const [gitlabProjectId, setGitlabProjectId] = useState<string>(props.gitlabSettings.projectId);
  const [gitlabApiKey, setGitlabApiKey] = useState<string>(props.gitlabSettings.apiKey);

  useEffect(() => {
    setGitlabServerUrl(props.gitlabSettings.serverUrl);
    setGitlabProjectId(props.gitlabSettings.projectId);
    setGitlabApiKey(props.gitlabSettings.apiKey);
  }, [props.gitlabSettings]);

  return (
    <dialog ref={props.ref} id={'codeHotspotsOverLaySettingsDialog'} className={'modal'}>
      <div className={'modal-box max-w-full'}>
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <h1>Code Hotspots Settings</h1>
        <h2>Gitlab Settings</h2>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Server URL</legend>
          <input
            type="text"
            className={'input border'}
            placeholder="Type here"
            defaultValue={props.gitlabSettings.serverUrl}
            onChange={(e) => setGitlabServerUrl(e.target.value)}
          />
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Project ID</legend>
          <input
            type="text"
            className={'input border'}
            placeholder="Type here"
            defaultValue={props.gitlabSettings.projectId}
            onChange={(e) => setGitlabProjectId(e.target.value)}
          />
          <p className="label">(Example Format: [Group Name]/[SubgroupName]/[ProjectName])</p>
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">API Key</legend>
          <input
            type="text"
            className={'input border'}
            placeholder="Type here"
            defaultValue={props.gitlabSettings.apiKey}
            onChange={(e) => setGitlabApiKey(e.target.value)}
          />
        </fieldset>
        <button
          className={'btn btn-accent mt-5'}
          onClick={() => props.onGitLabSettingsChange({ serverUrl: gitlabServerUrl, projectId: gitlabProjectId, apiKey: gitlabApiKey })}>
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
            className="lucide lucide-save-icon lucide-save">
            <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
            <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
            <path d="M7 3v4a1 1 0 0 0 1 1h7" />
          </svg>
          Save
        </button>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

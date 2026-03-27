import { type Ref, useState } from 'react';
import type { CodeHotspotsGitlabSettings } from '../../types/CodeHotspotsGitlabSettings';

export function OverLaySettings(props: {
  ref: Ref<HTMLDialogElement>;
  onGitLabSettingsChange: (newGitlabSettings: CodeHotspotsGitlabSettings) => void;
}) {
  const [gitlabServerUrl, setGitlabServerUrl] = useState<string>('');
  const [gitlabProjectId, setGitlabProjectId] = useState<string>('');
  const [gitlabApiKey, setGitlabApiKey] = useState<string>('');
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
          <input type="text" className={'input border'} placeholder="Type here" onChange={(e) => setGitlabServerUrl(e.target.value)} />
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Project ID</legend>
          <input type="text" className={'input border'} placeholder="Type here" onChange={(e) => setGitlabProjectId(e.target.value)} />
          <p className="label">(Example Format: [Group Name]/[SubgroupName]/[ProjectName])</p>
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">API Key</legend>
          <input type="text" className={'input border'} placeholder="Type here" onChange={(e) => setGitlabApiKey(e.target.value)} />
        </fieldset>
        <button
          className={'btn btn-accent'}
          onClick={() => props.onGitLabSettingsChange({ serverUrl: gitlabServerUrl, projectId: gitlabProjectId, apiKey: gitlabApiKey })}>
          Save
        </button>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

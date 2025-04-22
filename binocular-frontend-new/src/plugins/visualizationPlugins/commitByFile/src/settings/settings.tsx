import { useState } from 'react';

export interface SettingsType {
  sha: string;
}

function Settings(props: Readonly<{ settings: SettingsType; setSettings: (newSettings: SettingsType) => void }>) {
  const [localSha, setLocalSha] = useState(props.settings.sha);

  const handleSetSha = () => {
    props.setSettings({ sha: localSha });
  };

  return (
    <div>
      <input
        type="text"
        className="input input-xs input-accent w-full mb-1"
        value={localSha}
        onChange={(e) => setLocalSha(e.target.value)}
        placeholder="Enter SHA"
      />
      <button className="btn btn-accent btn-xs w-full" onClick={handleSetSha}>
        Set SHA
      </button>
    </div>
  );
}

export default Settings;

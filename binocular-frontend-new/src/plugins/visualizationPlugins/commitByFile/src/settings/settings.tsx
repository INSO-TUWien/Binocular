export interface SettingsType {
  sha: string;
}

function Settings(props: { settings: SettingsType; setSettings: (newSettings: SettingsType) => void }) {
  return (
    <div>
      <input
        type="text"
        className="input input-xs input-accent w-full mb-1"
        value={props.settings.sha}
        onChange={(e) => props.setSettings({ sha: e.target.value })}
        placeholder="Enter SHA"
      />
    </div>
  );
}

export default Settings;

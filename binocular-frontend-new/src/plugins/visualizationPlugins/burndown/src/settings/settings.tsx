export interface BurndownSettings {
  showSprints: boolean;
}

interface Props {
  settings: BurndownSettings;
  setSettings: (newSettings: BurndownSettings) => void;
}

const Settings = ({ settings, setSettings }: Props) => (
  <>
    <div>
      <label className="label cursor-pointer flex w-full justify-between items-center mt-0.5">
        <span className="label-text">Show Sprints:</span>
        <input
          type="checkbox"
          className="toggle toggle-accent toggle-sm"
          defaultChecked={settings.showSprints}
          onChange={(event) => setSettings({ ...settings, showSprints: event.target.checked })}
        />
      </label>
    </div>
  </>
);

export default Settings;

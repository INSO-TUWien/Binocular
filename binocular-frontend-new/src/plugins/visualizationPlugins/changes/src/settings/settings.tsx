export interface SettingsType {
  splitAdditionsDeletions: boolean;
  visualizationStyle: string;
}

function Settings(props: { settings: SettingsType; setSettings: (newSettings: SettingsType) => void }) {
  return (
    <>
      <div>
        <label className="label cursor-pointer">
          <span className="label-text">Split Additions and Deletions:</span>
          <input
            type="checkbox"
            className="toggle toggle-accent toggle-sm"
            checked={props.settings.splitAdditionsDeletions}
            onChange={(event) =>
              props.setSettings({
                splitAdditionsDeletions: event.target.checked,
                visualizationStyle: props.settings.visualizationStyle,
              })
            }
          />
        </label>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Visualization Style:</span>
          </div>
          <select
            className="select select-bordered select-sm"
            defaultValue={props.settings.visualizationStyle}
            onChange={(e) =>
              props.setSettings({
                splitAdditionsDeletions: props.settings.splitAdditionsDeletions,
                visualizationStyle: e.target.value,
              })
            }>
            <option value={'curved'}>curved</option>
            <option value={'stepped'}>stepped</option>
            <option value={'linear'}>linear</option>
          </select>
        </label>
      </div>
    </>
  );
}

export default Settings;

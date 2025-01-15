export interface SettingsType {
  fileName: string;
  splitAdditionsDeletions: boolean;
  visualizationStyle: string;
  showSprints: boolean;
}

function Settings(props: { settings: SettingsType; setSettings: (newSettings: SettingsType) => void }) {
  return (
    <>
      <div>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">File:</span>
          </div>
          <select
            className="select select-bordered select-sm"
            defaultValue={props.settings.visualizationStyle}
            onChange={(e) =>
              props.setSettings({
                fileName: e.target.value,
                splitAdditionsDeletions: props.settings.splitAdditionsDeletions,
                visualizationStyle: props.settings.visualizationStyle,
                showSprints: props.settings.showSprints,
              })
            }>
            <option value={'curved'}>curved</option>
            <option value={'stepped'}>stepped</option>
            <option value={'linear'}>linear</option>
          </select>
        </label>
        <label className="label cursor-pointer">
          <span className="label-text">Split Additions and Deletions:</span>
          <input
            type="checkbox"
            className="toggle toggle-accent toggle-sm"
            defaultChecked={props.settings.splitAdditionsDeletions}
            onChange={(event) =>
              props.setSettings({
                fileName: props.settings.fileName,
                splitAdditionsDeletions: event.target.checked,
                visualizationStyle: props.settings.visualizationStyle,
                showSprints: props.settings.showSprints,
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
                fileName: props.settings.fileName,
                splitAdditionsDeletions: props.settings.splitAdditionsDeletions,
                visualizationStyle: e.target.value,
                showSprints: props.settings.showSprints,
              })
            }>
            <option value={'curved'}>curved</option>
            <option value={'stepped'}>stepped</option>
            <option value={'linear'}>linear</option>
          </select>
        </label>
        <label className="label cursor-pointer">
          <span className="label-text">Show Sprints:</span>
          <input
            type="checkbox"
            className="toggle toggle-accent toggle-sm"
            defaultChecked={props.settings.showSprints}
            onChange={(event) =>
              props.setSettings({
                fileName: props.settings.fileName,
                splitAdditionsDeletions: props.settings.splitAdditionsDeletions,
                visualizationStyle: props.settings.visualizationStyle,
                showSprints: event.target.checked,
              })
            }
          />
        </label>
      </div>
    </>
  );
}

export default Settings;

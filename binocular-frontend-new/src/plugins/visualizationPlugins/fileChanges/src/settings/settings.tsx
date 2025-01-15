import { useSelector } from "react-redux";
import { store } from "../../../../../redux";

export interface SettingsType {
  file: string;
  splitAdditionsDeletions: boolean;
  visualizationStyle: string;
  showSprints: boolean;
}

function Settings(props: { 
  settings: SettingsType; 
  setSettings: (newSettings: SettingsType) => void,
  }) {
  //const files = useSelector((state: any) => state.files);
  //const files = ["init.lua"]
  type RootState = ReturnType<typeof store.getState>;
  const f = useSelector((state: RootState) => state);
  console.log("Files: ", f);

  const files = ["init.lua"]

  return (
    <>
      <div>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">File:</span>
          </div>
          <select
            className="select select-bordered select-sm"
            defaultValue={props.settings.file}
            onChange={(e) =>
              props.setSettings({
                file: e.target.value,
                splitAdditionsDeletions: props.settings.splitAdditionsDeletions,
                visualizationStyle: e.target.value,
                showSprints: props.settings.showSprints,
              })
            }>
            {files.map((f, index) => (
              <option key={index} value={f}>
                {f}
              </option>
            ))}
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
                file: props.settings.file,
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
                file: props.settings.file,
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
                file: props.settings.file,
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

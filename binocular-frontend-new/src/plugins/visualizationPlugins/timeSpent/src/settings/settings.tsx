import { DefaultSettings } from '../../../simpleVisualizationPlugin/src/settings/settings';

export interface TimeSpentSettings extends DefaultSettings {
  splitTimePerIssue: boolean;
  splitSpentRemoved: boolean;
}

function Settings(props: { settings: TimeSpentSettings; setSettings: (newSettings: TimeSpentSettings) => void }) {
  return (
    <>
      <div>
        <label className="label cursor-pointer">
          <span className="label-text">Split Time per Issue:</span>
          <input
            type="checkbox"
            className="toggle toggle-accent toggle-sm"
            defaultChecked={props.settings.splitTimePerIssue}
            onChange={(event) =>
              props.setSettings({
                splitTimePerIssue: event.target.checked,
                splitSpentRemoved: props.settings.splitSpentRemoved,
                visualizationStyle: props.settings.visualizationStyle,
                showSprints: props.settings.showSprints,
              })
            }
          />
        </label>
        <label className="label cursor-pointer">
          <span className="label-text">Split Spent and Removed:</span>
          <input
            type="checkbox"
            className="toggle toggle-accent toggle-sm"
            defaultChecked={props.settings.splitSpentRemoved}
            onChange={(event) =>
              props.setSettings({
                splitTimePerIssue: props.settings.splitTimePerIssue,
                splitSpentRemoved: event.target.checked,
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
            onChange={(event) =>
              props.setSettings({
                splitTimePerIssue: props.settings.splitTimePerIssue,
                splitSpentRemoved: props.settings.splitSpentRemoved,
                visualizationStyle: event.target.value,
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
                splitTimePerIssue: props.settings.splitTimePerIssue,
                splitSpentRemoved: props.settings.splitSpentRemoved,
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

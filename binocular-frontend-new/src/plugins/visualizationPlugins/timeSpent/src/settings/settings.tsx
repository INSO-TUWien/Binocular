import type { DefaultSettings } from '../../../simpleVisualizationPlugin/src/settings/settings';

export interface TimeSpentSettings extends DefaultSettings {
  splitTimePerIssue: boolean;
  splitSpentRemoved: boolean;
  breakdown: boolean;
}

function Settings(props: { settings: TimeSpentSettings; setSettings: (newSettings: TimeSpentSettings) => void }) {
  return (
    <>
      <div>
        <label className="label cursor-pointer flex w-full justify-between items-center mt-0.5">
          <span className="label-text">Show Sprints:</span>
          <input
            type="checkbox"
            className="toggle toggle-accent toggle-sm"
            defaultChecked={props.settings.showSprints}
            onChange={(event) =>
              props.setSettings({
                splitTimePerIssue: props.settings.splitTimePerIssue,
                splitSpentRemoved: props.settings.splitSpentRemoved,
                breakdown: props.settings.breakdown,
                visualizationStyle: props.settings.visualizationStyle,
                showSprints: event.target.checked,
              })
            }
          />
        </label>
        <label className="label cursor-pointer flex w-full justify-between items-center mt-0.5">
          <span className="label-text">Visualization Style:</span>
          <select
            className={'select select-bordered select-xs w-24'}
            defaultValue={props.settings.visualizationStyle}
            onChange={(event) =>
              props.setSettings({
                splitTimePerIssue: props.settings.splitTimePerIssue,
                splitSpentRemoved: props.settings.splitSpentRemoved,
                breakdown: props.settings.breakdown,
                visualizationStyle: event.target.value,
                showSprints: props.settings.showSprints,
              })
            }>
            <option value={'curved'}>curved</option>
            <option value={'stepped'}>stepped</option>
            <option value={'linear'}>linear</option>
          </select>
        </label>
        <label className="label cursor-pointer flex w-full justify-between items-center mt-0.5">
          <span className="label-text">Split Time per Issue:</span>
          <input
            type="checkbox"
            className="toggle toggle-accent toggle-sm"
            defaultChecked={props.settings.splitTimePerIssue}
            onChange={(event) =>
              props.setSettings({
                splitTimePerIssue: event.target.checked,
                splitSpentRemoved: props.settings.splitSpentRemoved,
                breakdown: props.settings.breakdown,
                visualizationStyle: props.settings.visualizationStyle,
                showSprints: props.settings.showSprints,
              })
            }
          />
        </label>
        <label className="label cursor-pointer flex w-full justify-between items-center mt-0.5">
          <span className="label-text">Split Spent and Removed:</span>
          <input
            type="checkbox"
            className="toggle toggle-accent toggle-sm"
            defaultChecked={props.settings.splitSpentRemoved}
            checked={Boolean(props.settings.splitSpentRemoved)}
            onChange={(event) =>
              props.setSettings({
                splitTimePerIssue: props.settings.splitTimePerIssue,
                splitSpentRemoved: event.target.checked,
                breakdown: props.settings.breakdown,
                visualizationStyle: props.settings.visualizationStyle,
                showSprints: props.settings.showSprints,
              })
            }
          />
        </label>
        <label className="label cursor-pointer flex w-full justify-between items-center mt-0.5">
          <span className="label-text">Breakdown (Total Time):</span>
          <input
            type="checkbox"
            className="toggle toggle-accent toggle-sm"
            defaultChecked={props.settings.breakdown}
            onChange={(event) =>
              props.setSettings({
                splitTimePerIssue: props.settings.splitTimePerIssue,
                splitSpentRemoved: props.settings.splitSpentRemoved,
                breakdown: event.target.checked,
                visualizationStyle: props.settings.visualizationStyle,
                showSprints: props.settings.showSprints,
              })
            }
          />
        </label>
      </div>
    </>
  );
}

export default Settings;

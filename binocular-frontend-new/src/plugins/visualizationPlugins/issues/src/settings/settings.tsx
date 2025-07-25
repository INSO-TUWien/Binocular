import { DefaultSettings } from '../../../simpleVisualizationPlugin/src/settings/settings';

export interface IssueSettings extends DefaultSettings {
  splitIssuesPerAuthor: boolean;
  breakdown: boolean;
}

function Settings(props: { settings: IssueSettings; setSettings: (newSettings: IssueSettings) => void }) {
  return (
    <>
      <div>
        <label className="label cursor-pointer">
          <span className="label-text">Split Issues per Assignee:</span>
          <input
            type="checkbox"
            className="toggle toggle-accent toggle-sm"
            defaultChecked={props.settings.splitIssuesPerAuthor}
            onChange={(event) =>
              props.setSettings({
                splitIssuesPerAuthor: event.target.checked,
                breakdown: props.settings.breakdown,
                visualizationStyle: props.settings.visualizationStyle,
                showSprints: props.settings.showSprints,
              })
            }
          />
        </label>
        <label className="label cursor-pointer">
          <span className="label-text">Breakdown (Total Open Issues):</span>
          <input
            type="checkbox"
            className="toggle toggle-accent toggle-sm"
            defaultChecked={props.settings.breakdown}
            onChange={(event) =>
              props.setSettings({
                splitIssuesPerAuthor: props.settings.splitIssuesPerAuthor,
                breakdown: event.target.checked,
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
                splitIssuesPerAuthor: props.settings.splitIssuesPerAuthor,
                breakdown: props.settings.breakdown,
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
                splitIssuesPerAuthor: props.settings.splitIssuesPerAuthor,
                breakdown: props.settings.breakdown,
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

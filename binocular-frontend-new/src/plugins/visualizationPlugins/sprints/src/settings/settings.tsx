import type { DefaultSettings } from '../../../simpleVisualizationPlugin/src/settings/settings';

export interface SprintSettings extends DefaultSettings {
  splitIssuesPerAuthor: boolean;
  breakdown: boolean;
  coloringMode: 'author' | 'assignee' | 'time-spent';
}

interface Props {
  settings: SprintSettings;
  setSettings: (newSettings: SprintSettings) => void;
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
          onChange={(event) =>
            setSettings({ ...settings, showSprints: event.target.checked })
          }
        />
      </label>
      <label className="label cursor-pointer flex w-full justify-between items-center mt-0.5">
        <span className="label-text">Visualization Style:</span>
        <select
          className={'select select-bordered select-xs w-24'}
          defaultValue={settings.visualizationStyle}
          onChange={(e) =>
            setSettings({ ...settings, visualizationStyle: e.target.value })
          }
        >
          <option value={'curved'}>curved</option>
          <option value={'stepped'}>stepped</option>
          <option value={'linear'}>linear</option>
        </select>
      </label>
      <label className="label cursor-pointer flex w-full justify-between items-center mt-0.5">
        <span className="label-text">Coloring Mode:</span>
        <select
          className={'select select-bordered select-xs w-24'}
          defaultValue={settings.visualizationStyle}
          onChange={(e) =>
            setSettings({
              ...settings,
              coloringMode: e.target.value as SprintSettings['coloringMode'],
            })
          }
        >
          <option value={'author'}>Author</option>
          <option value={'assignee'}>Assignee</option>
          <option value={'time-spent'}>Most Spent Time (Gitlab only)</option>
        </select>
      </label>
      <label className="label cursor-pointer flex w-full justify-between items-center mt-0.5">
        <span className="label-text">Split Issues per Assignee:</span>
        <input
          type="checkbox"
          className="toggle toggle-accent toggle-sm"
          defaultChecked={settings.splitIssuesPerAuthor}
          onChange={(event) =>
            setSettings({
              ...settings,
              splitIssuesPerAuthor: event.target.checked,
            })
          }
        />
      </label>
      <label className="label cursor-pointer flex w-full justify-between items-center mt-0.5">
        <span className="label-text">Breakdown (Total Open Issues):</span>
        <input
          type="checkbox"
          className="toggle toggle-accent toggle-sm"
          defaultChecked={settings.breakdown}
          onChange={(event) =>
            setSettings({ ...settings, breakdown: event.target.checked })
          }
        />
      </label>
    </div>
  </>
);

export default Settings;

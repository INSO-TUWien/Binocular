export interface SprintSettings {
  coloringMode: 'author' | 'assignee' | 'time-spent' | 'labels';
  maxNumberOfDifferencesBetweenLabels?: number;
  minNumberOfLabelsPerGroup?: number;

  showSprints: boolean;
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
          onChange={(event) => setSettings({ ...settings, showSprints: event.target.checked })}
        />
      </label>
      <label className="label cursor-pointer flex w-full justify-between items-center mt-0.5">
        <span className="label-text">Coloring Mode:</span>
        <select
          className={'select select-bordered select-xs w-24'}
          defaultValue={settings.coloringMode}
          onChange={(e) =>
            setSettings({
              ...settings,
              coloringMode: e.target.value as SprintSettings['coloringMode'],
            })
          }>
          <option value={'author'}>Author</option>
          <option value={'assignee'}>Assignee</option>
          <option value={'time-spent'}>Most Spent Time (Gitlab only)</option>
          <option value={'labels'}>Labels</option>
        </select>
      </label>

      {settings.coloringMode === 'labels' && (
        <>
          <label className="label cursor-pointer flex w-full justify-between items-center mt-0.5">
            <span className="label-text">Max differences between labels:</span>
            <input
              type="number"
              min={0}
              max={100}
              placeholder="Type here"
              value={settings.maxNumberOfDifferencesBetweenLabels ?? 3}
              className="input input-xs input-bordered w-full"
              onChange={(e) =>
                setSettings({
                  ...settings,
                  maxNumberOfDifferencesBetweenLabels: Number.parseInt(e.target.value),
                })
              }
              style={{ width: 56 }}
            />
          </label>
          <label className="label cursor-pointer flex w-full justify-between items-center mt-0.5">
            <span className="label-text">Min group size:</span>
            <input
              type="number"
              min={0}
              max={100}
              placeholder="Type here"
              value={settings.minNumberOfLabelsPerGroup ?? 3}
              className="input input-xs input-bordered w-full"
              onChange={(e) =>
                setSettings({
                  ...settings,
                  minNumberOfLabelsPerGroup: Number.parseInt(e.target.value),
                })
              }
              style={{ width: 56 }}
            />
          </label>
        </>
      )}
    </div>
  </>
);

export default Settings;

import type { DefaultSettings } from '../../../../simpleVisualizationPlugin/src/settings/settings';

export interface SumSettings extends DefaultSettings {
  showMean: boolean;
  showOther: boolean;
  minCommits: number;
  topN: number;
}

function Settings(props: { settings: SumSettings; setSettings: (newSettings: SumSettings) => void }) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <label className="label cursor-pointer flex w-full justify-between items-center mt-0.5">
          <span className="label-text">Show Mean:</span>
          <input
            type="checkbox"
            className="toggle toggle-primary toggle-sm"
            defaultChecked={props.settings.showMean}
            onChange={(event) =>
              props.setSettings({
                ...props.settings,
                showMean: event.target.checked,
              })
            }
          />
        </label>
        <label className="label cursor-pointer flex w-full justify-between items-center mt-0.5">
          <span className="label-text">Show other authors:</span>
          <input
            type="checkbox"
            className="toggle toggle-primary toggle-sm"
            defaultChecked={props.settings.showOther}
            onChange={(event) =>
              props.setSettings({
                ...props.settings,
                showOther: event.target.checked,
              })
            }
          />
        </label>
      </div>

      <div className="divider my-0" />
      <label className="label cursor-pointer flex w-full justify-between items-center mt-0.5">
        <span className="label-text">Minimum Commits</span>
        <input
          type="number"
          min={0}
          step={1}
          className="input input-xs input-bordered w-20"
          value={props.settings.minCommits}
          onChange={(event) =>
            props.setSettings({
              ...props.settings,
              minCommits: Math.max(0, Number(event.target.value)),
            })
          }
        />
      </label>

      <label className="label cursor-pointer flex w-full justify-between items-center mt-0.5">
        <span className="label-text">Top N Authors</span>
        <input
          type="number"
          min={0}
          step={1}
          className="input input-xs input-bordered w-20"
          value={props.settings.topN}
          onChange={(event) =>
            props.setSettings({
              ...props.settings,
              topN: Math.max(0, Number(event.target.value)),
            })
          }
        />
      </label>
      <span className="label-text-alt pl-1">Use 0 to show all authors</span>
    </>
  );
}

export default Settings;

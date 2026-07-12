import type { DefaultSettings } from '../../../../simpleVisualizationPlugin/src/settings/settings';

export interface LizardSettings extends DefaultSettings {
  topN: number;
  maxWeight: number;
}

function Settings(props: { settings: LizardSettings; setSettings: (newSettings: LizardSettings) => void }) {
  return (
    <>
      <label className="label cursor-pointer flex w-full justify-between items-center mt-0.5">
        <span className="label-text">Top N Files</span>
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
      <span className="label-text-alt pl-1">Use 0 to show all files</span>

      <div className="divider my-0" />

      <label className="label flex flex-col items-start gap-2 mt-0.5">
        <span className="label-text">
          Score weighting: {Math.round(props.settings.maxWeight * 100)}% max /{' '}
          {100 - Math.round(props.settings.maxWeight * 100)}% average
        </span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          className="range range-primary range-sm"
          value={props.settings.maxWeight}
          onChange={(event) =>
            props.setSettings({
              ...props.settings,
              maxWeight: Number(event.target.value),
            })
          }
        />
      </label>
    </>
  );
}

export default Settings;

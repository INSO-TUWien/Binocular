import type { DefaultSettings } from '../../../../simpleVisualizationPlugin/src/settings/settings';

export interface SumSettings extends DefaultSettings {
  showMean: boolean;
  showOther: boolean;
}

function Settings(props: { settings: SumSettings; setSettings: (newSettings: SumSettings) => void }) {
  return (
    <>
      <div>
        <label className="label cursor-pointer">
          <span className="label-text">Show Mean:</span>
          <input
            type="checkbox"
            className="toggle toggle-accent toggle-sm"
            defaultChecked={props.settings.showMean}
            onChange={(event) =>
              props.setSettings({
                ...props.settings,
                showMean: event.target.checked,
              })
            }
          />
        </label>
        <label className="label cursor-pointer">
          <span className="label-text">Show other authors:</span>
          <input
            type="checkbox"
            className="toggle toggle-accent toggle-sm"
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

      <p className="text-xs text-base-content/70">Author merging is handled globally by the sidebar.</p>
    </>
  );
}

export default Settings;

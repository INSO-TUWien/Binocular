export interface SettingsType {
  showMean: boolean;
  showOther: boolean;
}

function Settings(props: { settings: SettingsType; setSettings: (newSettings: SettingsType) => void }) {
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
                showMean: event.target.checked,
                showOther: props.settings.showOther,
              })
            }
          />
        </label>
        <label className="label cursor-pointer">
          <span className="label-text">Show unknown authors:</span>
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
    </>
  );
}

export default Settings;

export interface RepositoryActivitySettings {
  displayWeekly: boolean;
}

function Settings(props: { settings: RepositoryActivitySettings; setSettings: (newSettings: RepositoryActivitySettings) => void }) {
  return (
    <>
      <label className="label cursor-pointer flex w-full justify-between items-center mt-0.5">
        <span className="label-text">Display Weekly:</span>
        <input
          type="checkbox"
          className="toggle toggle-accent toggle-sm"
          defaultChecked={props.settings.displayWeekly}
          onChange={(event) =>
            props.setSettings({
              displayWeekly: event.target.checked,
            })
          }
        />
      </label>
    </>
  );
}

export default Settings;

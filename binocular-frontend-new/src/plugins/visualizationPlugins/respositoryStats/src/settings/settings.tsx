export interface SettingsType {
  commits: boolean;
  contributors: boolean;
  issues: boolean;
  builds: boolean;
  mergeRequests: boolean;
}

function Settings(props: { settings: SettingsType; setSettings: (newSettings: SettingsType) => void }) {
  return (
    <>
      <div>
        <label className="label cursor-pointer">
          <span className="label-text">Show contributors:</span>
          <input
            type="checkbox"
            className="toggle toggle-accent toggle-sm"
            defaultChecked={props.settings.contributors}
            onChange={(event) =>
              props.setSettings({
                commits: props.settings.commits,
                contributors: event.target.checked,
                issues: props.settings.issues,
                builds: props.settings.builds,
                mergeRequests: props.settings.mergeRequests,
              })
            }
          />
        </label>
        <label className="label cursor-pointer">
          <span className="label-text">Show commits:</span>
          <input
            type="checkbox"
            className="toggle toggle-accent toggle-sm"
            defaultChecked={props.settings.commits}
            onChange={(event) =>
              props.setSettings({
                commits: event.target.checked,
                contributors: props.settings.contributors,
                issues: props.settings.issues,
                builds: props.settings.builds,
                mergeRequests: props.settings.mergeRequests,
              })
            }
          />
        </label>
        <label className="label cursor-pointer">
          <span className="label-text">Show issues:</span>
          <input
            type="checkbox"
            className="toggle toggle-accent toggle-sm"
            defaultChecked={props.settings.issues}
            onChange={(event) =>
              props.setSettings({
                commits: props.settings.commits,
                contributors: props.settings.contributors,
                issues: event.target.checked,
                builds: props.settings.builds,
                mergeRequests: props.settings.mergeRequests,
              })
            }
          />
        </label>
        <label className="label cursor-pointer">
          <span className="label-text">Show builds:</span>
          <input
            type="checkbox"
            className="toggle toggle-accent toggle-sm"
            defaultChecked={props.settings.builds}
            onChange={(event) =>
              props.setSettings({
                commits: props.settings.commits,
                contributors: props.settings.contributors,
                issues: props.settings.issues,
                builds: event.target.checked,
                mergeRequests: props.settings.mergeRequests,
              })
            }
          />
        </label>
        <label className="label cursor-pointer">
          <span className="label-text">Show merge requests:</span>
          <input
            type="checkbox"
            className="toggle toggle-accent toggle-sm"
            defaultChecked={props.settings.mergeRequests}
            onChange={(event) =>
              props.setSettings({
                commits: props.settings.commits,
                contributors: props.settings.contributors,
                issues: props.settings.issues,
                builds: props.settings.builds,
                mergeRequests: event.target.checked,
              })
            }
          />
        </label>
      </div>
    </>
  );
}

export default Settings;

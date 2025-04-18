import { DataPluginBranch } from '../../../../interfaces/dataPluginInterfaces/dataPluginBranches.ts';

export interface CodeOwnerShipSettings {
  displayMode: string;
  currentBranch: DataPluginBranch;
}

function Settings(props: { settings: CodeOwnerShipSettings; setSettings: (newSettings: CodeOwnerShipSettings) => void }) {
  return (
    <>
      <div>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Display Mode:</span>
          </div>
          <select
            className="select select-bordered select-sm"
            defaultValue={props.settings.displayMode}
            onChange={(e) =>
              props.setSettings({
                displayMode: e.target.value,
                currentBranch: props.settings.currentBranch,
              })
            }>
            <option value={'absolute'}>absolute</option>
            <option value={'relative'}>relative</option>
          </select>
        </label>
        <label className="label cursor-pointer">
          <span className="label-text">Select branch:</span>
          {/*<input*/}
          {/*  type="checkbox"*/}
          {/*  className="toggle toggle-accent toggle-sm"*/}
          {/*  defaultChecked={props.settings.showSprints}*/}
          {/*  onChange={(event) =>*/}
          {/*    props.setSettings({*/}
          {/*      splitBuildsPerAuthor: props.settings.splitBuildsPerAuthor,*/}
          {/*      visualizationStyle: props.settings.visualizationStyle,*/}
          {/*      showSprints: event.target.checked,*/}
          {/*    })*/}
          {/*  }*/}
          {/*/>*/}
          <div>todo</div>
        </label>
      </div>
    </>
  );
}

export default Settings;

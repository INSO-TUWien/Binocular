import { DataPluginBranch } from '../../../../interfaces/dataPluginInterfaces/dataPluginBranches.ts';
import { useEffect, useState } from 'react';
import { CodeOwnershipState, setCurrentBranch } from '../reducer';
import { useSelector } from 'react-redux';
import { toNumber } from 'lodash';

export interface CodeOwnerShipSettings {
  displayMode: string;
  allBranches: DataPluginBranch[];
  currentBranch?: number;
}

function Settings(props: { settings: CodeOwnerShipSettings; setSettings: (newSettings: CodeOwnerShipSettings) => void }) {
  const state = useSelector((state: CodeOwnershipState) => state);

  const [branchOptions, setBranchOptions] = useState([
    <option key={-1} value={''}>
      Select a Branch
    </option>,
  ]);

  function setBranches() {
    if (props.settings.allBranches) {
      const branches = props.settings.allBranches.sort((a, b) => a.branch.localeCompare(b.branch)).map((b) => b.branch);
      //build the selection box
      const temp = [];
      //placeholder option
      temp.push(
        <option key={-1} value={''}>
          Select a Branch
        </option>,
      );
      branches.forEach((value: string, index: number) => {
        temp.push(
          <option key={index} value={index}>
            {value}
          </option>,
        );
      });
      setBranchOptions(temp);
    }
  }

  useEffect(() => {
    setBranches();
  }, [props.settings.allBranches, state.allBranches]);

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
                allBranches: props.settings.allBranches,
              })
            }>
            <option value={'absolute'}>absolute</option>
            <option value={'relative'}>relative</option>
          </select>
        </label>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Branch:</span>
          </div>
          <select
            value={state.branch}
            className="select select-bordered select-sm"
            onChange={(e) => {
              setCurrentBranch(toNumber(e.target.value));
              props.setSettings({
                displayMode: props.settings.displayMode,
                allBranches: props.settings.allBranches,
                currentBranch: toNumber(e.target.value),
              });
            }}>
            {branchOptions}
          </select>
        </label>
      </div>
    </>
  );
}

export default Settings;

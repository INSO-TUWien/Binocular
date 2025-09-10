import { DataPluginBranch } from '../../../../interfaces/dataPluginInterfaces/dataPluginBranches.ts';
import { useEffect, useState } from 'react';
import { setCurrentBranch } from '../reducer';
import { useSelector } from 'react-redux';
import { toNumber } from 'lodash';

export interface BranchSettings {
  allBranches: DataPluginBranch[];
  currentBranch?: number;
}

function Settings(props: { settings: BranchSettings; setSettings: (newSettings: BranchSettings) => void }) {
  const state = useSelector((state) => state);

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
    if (props.settings.allBranches.length > 0) setBranches();
  }, [props.settings.allBranches, state]);

  return (
    <>
      <div>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Branch:</span>
          </div>
          <select
            value={props.settings.currentBranch ? props.settings.currentBranch : ''}
            className="select select-bordered select-sm"
            onChange={(e) => {
              setCurrentBranch(toNumber(e.target.value));
              props.setSettings({
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

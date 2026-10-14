import React, { useCallback, useMemo, useSyncExternalStore } from 'react';
import type { Store } from '@reduxjs/toolkit';
import type { DataPluginIssue } from '../../../../../interfaces/dataPluginInterfaces/dataPluginIssues.ts';

const EMPTY_ISSUES: DataPluginIssue[] = [];

export interface IssueLabelsSettings {
  selectedLabels: string[];
  visualizationStyle: string;
  showSprints: boolean;
}

function LabelSelector({
  selectedLabels,
  onSelectionChange,
  labels,
}: {
  selectedLabels: string[];
  onSelectionChange: (labels: string[]) => void;
  labels: string[];
}) {
  const [searchTerm, setSearchTerm] = React.useState('');

  if (!labels || labels.length === 0) {
    return <div className="alert alert-warning">No labels found in the currently loaded issues.</div>;
  }

  const filteredLabels = labels.filter((label) => label.toLowerCase().includes(searchTerm.toLowerCase()));

  const toggleLabel = (label: string) => {
    if (selectedLabels.includes(label)) {
      onSelectionChange(selectedLabels.filter((l) => l !== label));
    } else {
      onSelectionChange([...selectedLabels, label]);
    }
  };

  return (
    <div className="w-full max-w-xs rounded-lg bg-base-200 p-3 shadow mb-1">
      <input
        type="text"
        className="input input-sm w-full mb-2"
        placeholder="Search labels..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="max-h-48 overflow-y-auto flex flex-col gap-1">
        {filteredLabels.map((label) => (
          <label key={label} className="label cursor-pointer justify-start gap-2 py-0.5">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={selectedLabels.includes(label)}
              onChange={() => toggleLabel(label)}
            />
            <span className="label-text">{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function Settings(props: { settings: IssueLabelsSettings; setSettings: (newSettings: IssueLabelsSettings) => void; store?: Store }) {
  const subscribe = useCallback(
    (callback: () => void) => {
      if (!props.store) return () => {};
      return props.store.subscribe(callback);
    },
    [props.store],
  );
  const getSnapshot = useCallback(() => props.store?.getState()?.plugin?.issues ?? EMPTY_ISSUES, [props.store]);
  const issues: DataPluginIssue[] = useSyncExternalStore(subscribe, getSnapshot);

  const labels = useMemo(() => [...new Set(issues.flatMap((issue) => issue.labels))].sort(), [issues]);

  return (
    <>
      <div>
        <label className="label cursor-pointer flex w-full justify-between items-center mt-0.5">
          <span className="label-text">Visualization Style:</span>
          <select
            className={'select select-bordered select-xs w-24'}
            defaultValue={props.settings.visualizationStyle}
            onChange={(e) =>
              props.setSettings({
                ...props.settings,
                visualizationStyle: e.target.value,
              })
            }>
            <option value={'curved'}>curved</option>
            <option value={'stepped'}>stepped</option>
            <option value={'linear'}>linear</option>
          </select>
        </label>
        <label className="label cursor-pointer flex w-full justify-between items-center mt-0.5">
          <span className="label-text">Show Sprints:</span>
          <input
            type="checkbox"
            className="toggle toggle-primary toggle-sm"
            defaultChecked={props.settings.showSprints}
            onChange={(event) =>
              props.setSettings({
                ...props.settings,
                showSprints: event.target.checked,
              })
            }
          />
        </label>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Labels ({props.settings.selectedLabels.length} selected):</span>
          </div>
          <LabelSelector
            selectedLabels={props.settings.selectedLabels}
            onSelectionChange={(selectedLabels) =>
              props.setSettings({
                ...props.settings,
                selectedLabels,
              })
            }
            labels={labels}
          />
        </label>
      </div>
    </>
  );
}

export default Settings;

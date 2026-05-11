import React, { useCallback } from 'react';
import type { DefaultSettings } from '../../../../simpleVisualizationPlugin/src/settings/settings';

export interface CollaborationSettings extends DefaultSettings {
  minEdgeValue: number;
  maxEdgeValue: number;
  includeCommitMessageRefs: boolean;
}

const MIN_POSSIBLE = 1;

interface SettingsProps {
  settings: CollaborationSettings;
  setSettings: (newSettings: CollaborationSettings) => void;
}

export default function Settings({ settings, setSettings }: SettingsProps) {
  const { minEdgeValue, maxEdgeValue, includeCommitMessageRefs } = settings;

  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);
      setSettings({
        ...settings,
        minEdgeValue: Math.min(value, maxEdgeValue),
      });
    },
    [maxEdgeValue, settings, setSettings],
  );

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);
      setSettings({
        ...settings,
        maxEdgeValue: Math.max(value, minEdgeValue),
      });
    },
    [minEdgeValue, settings, setSettings],
  );

  return (
    <div className=" space-y-2">
      <label className="block text-sm font-medium ">Collaboration Strength Range</label>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm w-12">Min</span>
          <input
            type="number"
            min={MIN_POSSIBLE}
            max={maxEdgeValue}
            value={minEdgeValue}
            onChange={handleMinChange}
            className="w-16 border rounded px-2 py-1"
          />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm w-12">Max</span>
          <input
            type="number"
            min={minEdgeValue}
            value={maxEdgeValue}
            onChange={handleMaxChange}
            className="w-16 border rounded px-2 py-1"
          />
        </div>
      </div>
      <label className="label cursor-pointer flex w-full justify-between items-center mt-0.5">
        <span className="label-text">Include commit message references</span>
        <input
          type="checkbox"
          className="toggle toggle-primary toggle-sm"
          checked={includeCommitMessageRefs}
          onChange={(e) => setSettings({ ...settings, includeCommitMessageRefs: e.target.checked })}
        />
      </label>
    </div>
  );
}

import React, { useCallback, useRef } from "react";
import type { DefaultSettings } from "../../../simpleVisualizationPlugin/src/settings/settings";

export interface CollaborationSettings extends DefaultSettings {
  data: {
    nodes: { id: string; group: string; url: string }[];
    links: { source: string; target: string; value: number }[];
  };
  from: string;
  to: string;
  minEdgeValue: number;
  maxEdgeValue: number;
}
const MIN_POSSIBLE = 1;
const MAX_POSSIBLE = Infinity;

interface SettingsProps {
  settings: CollaborationSettings;
  setSettings: (newSettings: CollaborationSettings) => void;
}

export default function Settings({ settings, setSettings }: SettingsProps) {
  const { minEdgeValue, maxEdgeValue } = settings;
  const rootRef = useRef<HTMLDivElement>(null);

  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);
      setSettings({
        ...settings,
        minEdgeValue: Math.min(value, maxEdgeValue), //limit to maxEdgeValue
      });
    },
    [maxEdgeValue, settings, setSettings],
  );

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);
      setSettings({
        ...settings,
        maxEdgeValue: Math.max(value, minEdgeValue), //limit to minEdgeValue
      });
    },
    [minEdgeValue, settings, setSettings],
  );

  return (
    <div className="mt-6 space-y-4" ref={rootRef}>
      <label className="block text-sm font-medium dark:text-white">
        Collaboration Strength Range
      </label>
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
            max={MAX_POSSIBLE}
            value={maxEdgeValue}
            onChange={handleMaxChange}
            className="w-16 border rounded px-2 py-1"
          />
        </div>
      </div>
    </div>
  );
}

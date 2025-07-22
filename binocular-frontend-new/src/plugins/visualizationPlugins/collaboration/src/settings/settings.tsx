import React, { useCallback, useEffect, useRef } from "react";

export interface SettingsType {
  data: {
    nodes: { id: string; group: string; url: string }[];
    links: { source: string; target: string; value: number }[];
  };
  minEdgeValue: number;
  maxEdgeValue: number;
}
const MIN_POSSIBLE = 1;
const MAX_POSSIBLE = Infinity;

interface Props {
  settings: SettingsType;
  setSettings: (newSettings: SettingsType) => void;
}

export default function Settings(props: Props) {
  const { settings, setSettings } = props;
  const { minEdgeValue, maxEdgeValue } = settings;

  //TODO: hack to remove global parameters like dateRange since they are not used in the visualization
  // alternate solution would be to add a flag to the generic DashboardItem that allows plugins to
  // (de)activate global settings
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!rootRef.current) return;

    const labelsToHide = [
      "Date Range:",
      "Ignore Global Parameters:",
      "General:",
    ];

    labelsToHide.forEach((labelText) => {
      const matchingElements = Array.from(
        rootRef.current!.parentElement?.querySelectorAll("div") || [],
      ).filter((div) =>
        Array.from(div.children).some(
          (child) => child.textContent?.trim() === labelText,
        ),
      );

      matchingElements.forEach((el) => {
        const parent = el.closest("div");
        if (parent instanceof HTMLElement) {
          parent.style.display = "none";

          // Remove next sibling <hr> if present
          let next = parent.nextElementSibling;
          while (next && next.tagName !== "HR") {
            next = next.nextElementSibling;
          }
          if (next?.tagName === "HR") {
            (next as HTMLElement).style.display = "none";
          }
        }
      });
    });
  }, []);

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

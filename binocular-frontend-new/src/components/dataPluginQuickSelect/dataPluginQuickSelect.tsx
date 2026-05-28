import type { DatabaseSettingsDataPluginType } from '../../types/settings/databaseSettingsType.ts';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux';

function DataPluginQuickSelect(props: {
  selected: DatabaseSettingsDataPluginType | undefined;
  onChange: (dataPlugin: DatabaseSettingsDataPluginType) => void;
}) {
  const currentDataPlugins = useSelector((state: RootState) => state.settings.database.dataPlugins);
  const accentColor = props.selected?.color ? props.selected.color.substring(0, 7) : undefined;

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div ref={ref} className="relative w-full max-w-xs">
      <div
        role="button"
        tabIndex={0}
        className="relative select select-bordered w-full flex items-center cursor-pointer"
        style={accentColor ? { borderColor: accentColor } : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => e.key === 'Enter' && setOpen((o) => !o)}>
        {accentColor && <div className="absolute left-0 inset-y-0 rounded-l" style={{ background: accentColor, width: '5px' }} />}
        <span className={'flex-1 text-left truncate' + (accentColor ? ' pl-2' : '')}>
          {props.selected ? `${props.selected.name} #${props.selected.id}${props.selected.isDefault ? ' (default)' : ''}` : '—'}
        </span>
      </div>
      {open && (
        <ul className="absolute z-50 w-full mt-1 bg-base-100 rounded-box shadow-md border border-base-300 p-1 flex flex-col gap-1">
          {currentDataPlugins.length === 0 ? (
            <li className="px-4 py-2 text-sm text-base-content/40">No plugins configured</li>
          ) : (
            currentDataPlugins.map((dP: DatabaseSettingsDataPluginType) => {
              const color = dP.color ? dP.color.substring(0, 7) : undefined;
              const isSelected = props.selected?.id === dP.id;
              return (
                <li key={`dataPluginQuickSelect${dP.id}`}>
                  <button
                    className={'w-full text-left px-3 py-1.5 rounded hover:bg-base-200 text-sm' + (isSelected ? ' bg-base-200' : '')}
                    style={color ? { borderLeft: `5px solid ${color}` } : undefined}
                    onClick={() => {
                      props.onChange(dP);
                      setOpen(false);
                    }}>
                    {`${dP.name} #${dP.id}${dP.isDefault ? ' (default)' : ''}`}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}

export default DataPluginQuickSelect;

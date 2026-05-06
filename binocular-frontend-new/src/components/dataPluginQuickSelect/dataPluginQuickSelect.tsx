import type { DatabaseSettingsDataPluginType } from '../../types/settings/databaseSettingsType.ts';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux';

function DataPluginQuickSelect(props: {
  selected: DatabaseSettingsDataPluginType | undefined;
  onChange: (dataPlugin: DatabaseSettingsDataPluginType) => void;
}) {
  const currentDataPlugins = useSelector((state: RootState) => state.settings.database.dataPlugins);
  const theme = localStorage.getItem('theme') || '';

  return (
    <>
      <select
        className={'select select-bordered w-full max-w-xs'}
        style={{ background: props.selected?.color ? getHueFromRGBA(props.selected.color, theme) : 'white' }}
        disabled={currentDataPlugins.length === 0}
        value={props.selected ? props.selected.id : 0}
        onChange={(e) => {
          const selectedDataPlugin = currentDataPlugins.filter((dP: DatabaseSettingsDataPluginType) => dP.id === Number(e.target.value))[0];
          if (selectedDataPlugin) {
            props.onChange(selectedDataPlugin);
          }
        }}>
        {currentDataPlugins.map((dP: DatabaseSettingsDataPluginType) => (
          <option key={`dataPluginQuickSelect${dP.id}`} value={dP.id}>{`${dP.name} #${dP.id} ${dP.isDefault ? '(default)' : ''}`}</option>
        ))}
      </select>
    </>
  );
}

function getHueFromRGBA(rgba: string, theme: string) {
  const background = theme == 'binocularDark' ? 17 : 255;
  const alpha = parseInt(rgba.substring(7, 9), 16) / 255;
  return `rgba(${Math.round((1 - alpha) * background + parseInt(rgba.substring(1, 3), 16) * alpha)}, ${Math.round((1 - alpha) * background + parseInt(rgba.substring(3, 5), 16) * alpha)}, ${Math.round((1 - alpha) * background + parseInt(rgba.substring(5, 7), 16) * alpha)})`;
}

export default DataPluginQuickSelect;

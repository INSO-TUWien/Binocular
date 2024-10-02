import { DatabaseSettingsDataPluginType } from '../../types/settings/databaseSettingsType.ts';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux';

function DataPluginQuickSelect(props: {
  selected: DatabaseSettingsDataPluginType | undefined;
  onChange: (dataPlugin: DatabaseSettingsDataPluginType) => void;
}) {
  const currentDataPlugins = useSelector((state: RootState) => state.settings.database.dataPlugins);
  return (
    <>
      <select
        className={'select select-bordered w-full max-w-xs'}
        style={{ background: props.selected ? props.selected.color : 'white' }}
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

export default DataPluginQuickSelect;

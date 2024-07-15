import { useSelector } from 'react-redux';
import { AppDispatch, RootState, useAppDispatch } from '../../../redux';
import { setGeneralSettings } from '../../../redux/settings/settingsReducer.ts';
import { SettingsGeneralGridSize } from '../../../types/settings/generalSettingsType.ts';

function GeneralSettings() {
  const dispatch: AppDispatch = useAppDispatch();

  const generalSettings = useSelector((state: RootState) => state.settings.general);

  return (
    <>
      <div className={'h-4/5 overflow-x-hidden overflow-y-scroll p-1'}>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Dashboard Grid Size</span>
          </div>
          <select
            className="select select-bordered"
            value={generalSettings.gridSize}
            onChange={(e) => dispatch(setGeneralSettings({ gridSize: Number(e.target.value) }))}>
            <option value={SettingsGeneralGridSize.small}>Small</option>
            <option value={SettingsGeneralGridSize.medium}>Medium</option>
            <option value={SettingsGeneralGridSize.large}>Large</option>
          </select>
        </label>
      </div>
    </>
  );
}

export default GeneralSettings;

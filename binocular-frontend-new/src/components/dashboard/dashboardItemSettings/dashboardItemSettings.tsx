import type { ReactElement } from 'react';
import type { DashboardItemType } from '../../../types/general/dashboardItemType.ts';
import DateRange from '../../tabs/parameters/dataRange/dateRange.tsx';
import ParametersGeneral from '../../tabs/parameters/parametersGeneral/parametersGeneral.tsx';
import type { ParametersGeneralType } from '../../../types/parameters/parametersGeneralType.ts';
import type { ParametersDateRangeType } from '../../../types/parameters/parametersDateRangeType.ts';
import DataPluginQuickSelect from '../../dataPluginQuickSelect/dataPluginQuickSelect.tsx';
import type { DatabaseSettingsDataPluginType } from '../../../types/settings/databaseSettingsType.ts';

function DashboardItemSettings(props: {
  selectedDataPlugin: DatabaseSettingsDataPluginType | undefined;
  onSelectDataPlugin: (dP: DatabaseSettingsDataPluginType) => void;
  item: DashboardItemType;
  settingsComponent: ReactElement;
  onClickDelete: () => void;
  onClickRefresh: () => void;
  ignoreGlobalParameters: boolean;
  setIgnoreGlobalParameters: (ignoreGlobalParameters: boolean) => void;
  doAutomaticUpdate: boolean;
  setDoAutomaticUpdate: (doAutomaticUpdate: boolean) => void;
  parametersGeneral: ParametersGeneralType;
  setParametersGeneral: (parametersGeneral: ParametersGeneralType) => void;
  parametersDateRange: ParametersDateRangeType;
  setParametersDateRange: (parametersDateRange: ParametersDateRangeType) => void;
}) {
  const hideGlobalParameters = props.item.pluginName === 'Lizard Stats';
  return (
    <>
      <h2>{props.item.pluginName + ' (#' + props.item.id + ')'}</h2>
      <hr className={'text-base-300 m-1'} />
      <DataPluginQuickSelect selected={props.selectedDataPlugin} onChange={props.onSelectDataPlugin}></DataPluginQuickSelect>
      <hr className={'text-base-300 m-1'} />
      <button className={'btn btn-primary btn-xs w-full'} onClick={props.onClickRefresh}>
        Refresh
      </button>
      <hr className={'text-base-300 m-1'} />
      {!hideGlobalParameters && (
        <>
          <div>
            <label className="label cursor-pointer flex w-full justify-between items-center mt-0.5">
              <span className="label-text">Ignore Global Parameters:</span>
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                defaultChecked={props.ignoreGlobalParameters}
                onChange={(e) => props.setIgnoreGlobalParameters(e.target.checked)}
              />
            </label>
          </div>
          {props.selectedDataPlugin?.parameters.progressUpdate?.useAutomaticUpdate && (
            <div>
              <label className="label cursor-pointer">
                <span className="label-text">Automatic Update:</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary toggle-sm"
                  defaultChecked={props.doAutomaticUpdate}
                  onChange={(e) => props.setDoAutomaticUpdate(e.target.checked)}
                />
              </label>
            </div>
          )}
          <hr className={'text-base-300 m-1'} />
          <div className={!props.ignoreGlobalParameters ? ' text-base-300' : ''}>
            <div className={'font-bold'}>Date Range:</div>
            <DateRange
              disabled={!props.ignoreGlobalParameters}
              parametersDateRange={props.parametersDateRange}
              setParametersDateRange={props.setParametersDateRange}></DateRange>
            <div className={'font-bold'}>General:</div>
            <ParametersGeneral
              disabled={!props.ignoreGlobalParameters}
              parametersGeneral={props.parametersGeneral}
              setParametersGeneral={props.setParametersGeneral}></ParametersGeneral>
          </div>
          <hr className={'text-base-300 m-1'} />
        </>
      )}
      {props.settingsComponent}
      <hr className={'text-base-300 m-1'} />
      <button className={'btn btn-error btn-xs w-full'} onClick={props.onClickDelete}>
        Delete
      </button>
    </>
  );
}

export default DashboardItemSettings;

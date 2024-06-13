import { ReactElement } from 'react';
import { DashboardItemType } from '../dashboardItem/dashboardItem.tsx';
import ParametersDateRange from '../../tabs/parameters/parametersDateRange/parametersDateRange.tsx';
import ParametersGeneral from '../../tabs/parameters/parametersGeneral/parametersGeneral.tsx';
import { ParametersGeneralType } from '../../../types/parametersGeneralType.ts';
import { ParametersDateRangeType } from '../../../types/parametersDateRangeType.ts';

function DashboardItemSettings(props: {
  item: DashboardItemType;
  settingsComponent: ReactElement;
  onClickDelete: () => void;
  ignoreGlobalParameters: boolean;
  setIgnoreGlobalParameters: (ignoreGlobalParameters: boolean) => void;
  parametersGeneral: ParametersGeneralType;
  setParametersGeneral: (parametersGeneral: ParametersGeneralType) => void;
  parametersDateRange: ParametersDateRangeType;
  setParametersDateRange: (parametersDateRange: ParametersDateRangeType) => void;
}) {
  return (
    <>
      <div className={'font-bold underline'}>{props.item.pluginName + ' (#' + props.item.id + ')'}</div>
      <hr className={'text-base-300 m-1'} />
      <div>
        <label className="label cursor-pointer">
          <span className="label-text">Ignore Global Parameters:</span>
          <input
            type="checkbox"
            className="toggle toggle-accent toggle-sm"
            checked={props.ignoreGlobalParameters}
            onChange={(e) => props.setIgnoreGlobalParameters(e.target.checked)}
          />
        </label>
      </div>
      <hr className={'text-base-300 m-1'} />
      <div className={!props.ignoreGlobalParameters ? ' text-base-300' : ''}>
        <div className={'font-bold'}>Date Range:</div>
        <ParametersDateRange
          disabled={!props.ignoreGlobalParameters}
          parametersDateRange={props.parametersDateRange}
          setParametersDateRange={props.setParametersDateRange}></ParametersDateRange>
        <div className={'font-bold'}>General:</div>
        <ParametersGeneral
          disabled={!props.ignoreGlobalParameters}
          parametersGeneral={props.parametersGeneral}
          setParametersGeneral={props.setParametersGeneral}></ParametersGeneral>
      </div>
      <hr className={'text-base-300 m-1'} />
      {props.settingsComponent}
      <hr className={'text-base-300 m-1'} />
      <button className={'btn btn-error btn-xs w-full'} onClick={props.onClickDelete}>
        Delete
      </button>
    </>
  );
}

export default DashboardItemSettings;

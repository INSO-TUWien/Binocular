import { ParametersDateRangeType } from '../../../../types/parametersDateRangeType.ts';

function DateRange(props: {
  disabled: boolean;
  parametersDateRange: ParametersDateRangeType;
  setParametersDateRange: (parametersDateRange: ParametersDateRangeType) => void;
}) {
  return (
    <div className={'text-xs'}>
      <table>
        <tbody>
          <tr>
            <td>From:</td>
            <td>
              <input
                className={'input input-accent input-xs'}
                type={'datetime-local'}
                disabled={props.disabled}
                value={props.parametersDateRange.from.split('.')[0]}
                onChange={(e) => props.setParametersDateRange({ from: e.target.value, to: props.parametersDateRange.to })}
              />
            </td>
          </tr>
          <tr>
            <td>To:</td>
            <td>
              <input
                className={'input input-accent input-xs'}
                type={'datetime-local'}
                disabled={props.disabled}
                value={props.parametersDateRange.to.split('.')[0]}
                onChange={(e) => props.setParametersDateRange({ from: props.parametersDateRange.from, to: e.target.value })}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default DateRange;

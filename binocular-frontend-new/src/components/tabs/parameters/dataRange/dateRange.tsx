import { ParametersDateRangeType } from '../../../../types/parameters/parametersDateRangeType.ts';
import { useEffect, useState } from 'react';

function DateRange(props: {
  disabled: boolean;
  parametersDateRange: ParametersDateRangeType;
  setParametersDateRange: (parametersDateRange: ParametersDateRangeType) => void;
}) {
  const [altMode, setAltMode] = useState(false);
  function keyDown(e: KeyboardEvent) {
    if (e.key === 'Shift') {
      setAltMode(true);
    }
  }

  function keyUp(e: KeyboardEvent) {
    if (e.key === 'Shift') {
      setAltMode(false);
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);

    return () => {
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
    };
  }, []);

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
            <td>
              <button
                className={'btn btn-xs btn-accent'}
                onClick={() => props.setParametersDateRange({ from: today(), to: props.parametersDateRange.to })}
                title={'set date to today'}
                disabled={props.disabled}>
                T
              </button>
            </td>
            <td>
              <button
                className={'btn btn-xs btn-accent'}
                onClick={() =>
                  altMode
                    ? props.setParametersDateRange({
                        from: subtractYear(props.parametersDateRange.from),
                        to: props.parametersDateRange.to,
                      })
                    : props.setParametersDateRange({
                        from: subtractMonth(props.parametersDateRange.from),
                        to: props.parametersDateRange.to,
                      })
                }
                title={altMode ? 'remove 1 year' : 'remove 1 month'}
                disabled={props.disabled}>
                {altMode ? '-Y' : '-M'}
              </button>
            </td>
            <td>
              <button
                className={'btn btn-xs btn-accent'}
                onClick={() =>
                  altMode
                    ? props.setParametersDateRange({
                        from: addYear(props.parametersDateRange.from),
                        to: props.parametersDateRange.to,
                      })
                    : props.setParametersDateRange({
                        from: addMonth(props.parametersDateRange.from),
                        to: props.parametersDateRange.to,
                      })
                }
                title={altMode ? 'add 1 year' : 'add 1 month'}
                disabled={props.disabled}>
                {altMode ? '+Y' : '+M'}
              </button>
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
                onChange={(e) =>
                  props.setParametersDateRange({
                    from: props.parametersDateRange.from,
                    to: e.target.value,
                  })
                }
              />
            </td>
            <td>
              <button
                className={'btn btn-xs btn-accent'}
                onClick={() => props.setParametersDateRange({ from: props.parametersDateRange.from, to: today() })}
                title={'set date to today'}
                disabled={props.disabled}>
                T
              </button>
            </td>
            <td>
              <button
                className={'btn btn-xs btn-accent'}
                onClick={() =>
                  altMode
                    ? props.setParametersDateRange({
                        from: props.parametersDateRange.from,
                        to: subtractYear(props.parametersDateRange.to),
                      })
                    : props.setParametersDateRange({
                        from: props.parametersDateRange.from,
                        to: subtractMonth(props.parametersDateRange.to),
                      })
                }
                title={altMode ? 'remove 1 year' : 'remove 1 month'}
                disabled={props.disabled}>
                {altMode ? '-Y' : '-M'}
              </button>
            </td>
            <td>
              <button
                className={'btn btn-xs btn-accent'}
                onClick={() =>
                  altMode
                    ? props.setParametersDateRange({
                        from: props.parametersDateRange.from,
                        to: addYear(props.parametersDateRange.to),
                      })
                    : props.setParametersDateRange({
                        from: props.parametersDateRange.from,
                        to: addMonth(props.parametersDateRange.to),
                      })
                }
                title={altMode ? 'add 1 year' : 'add 1 month'}
                disabled={props.disabled}>
                {altMode ? '+Y' : '+M'}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function today() {
  let dateSting = new Date().toISOString().split('.')[0];
  dateSting = dateSting.substring(0, dateSting.length - 3);
  return dateSting;
}

function subtractMonth(currentDateTime: string) {
  const date = new Date(currentDateTime);
  date.setMonth(date.getMonth() - 1);
  let dateSting = date.toISOString().split('.')[0];
  dateSting = dateSting.substring(0, dateSting.length - 3);
  return dateSting;
}

function addMonth(currentDateTime: string) {
  const date = new Date(currentDateTime);
  date.setMonth(date.getMonth() + 1);
  let dateSting = date.toISOString().split('.')[0];
  dateSting = dateSting.substring(0, dateSting.length - 3);
  return dateSting;
}

function subtractYear(currentDateTime: string) {
  const date = new Date(currentDateTime);
  date.setFullYear(date.getFullYear() - 1);
  let dateSting = date.toISOString().split('.')[0];
  dateSting = dateSting.substring(0, dateSting.length - 3);
  return dateSting;
}

function addYear(currentDateTime: string) {
  const date = new Date(currentDateTime);
  date.setFullYear(date.getFullYear() + 1);
  let dateSting = date.toISOString().split('.')[0];
  dateSting = dateSting.substring(0, dateSting.length - 3);
  return dateSting;
}

export default DateRange;

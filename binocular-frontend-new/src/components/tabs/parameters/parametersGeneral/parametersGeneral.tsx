import { ParametersGeneralType } from '../../../../types/parametersGeneralType.ts';

function ParametersGeneral(props: {
  disabled: boolean;
  parametersGeneral: ParametersGeneralType;
  setParametersGeneral: (parametersGeneral: ParametersGeneralType) => void;
}) {
  return (
    <div className={'text-xs'}>
      <table>
        <tbody>
          <tr>
            <td>Granularity:</td>
            <td>
              <select
                className={'select select-accent select-xs'}
                disabled={props.disabled}
                value={props.parametersGeneral.granularity}
                onChange={(e) =>
                  props.setParametersGeneral({
                    granularity: e.target.value,
                    excludeMergeCommits: props.parametersGeneral.excludeMergeCommits,
                  })
                }>
                <option value={'years'}>Year</option>
                <option value={'months'}>Month</option>
                <option value={'weeks'}>Week</option>
                <option value={'days'}>Day</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Exclude Merge Commits:</td>
            <td>
              <input
                type={'checkbox'}
                className={'toggle toggle-accent toggle-sm'}
                disabled={props.disabled}
                checked={props.parametersGeneral.excludeMergeCommits}
                onChange={(e) =>
                  props.setParametersGeneral({ granularity: props.parametersGeneral.granularity, excludeMergeCommits: e.target.checked })
                }
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default ParametersGeneral;

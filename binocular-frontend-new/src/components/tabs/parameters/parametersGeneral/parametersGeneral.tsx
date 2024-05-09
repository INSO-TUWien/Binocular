function ParametersGeneral() {
  return (
    <div className={'text-xs'}>
      <table>
        <tbody>
          <tr>
            <td>Granularity:</td>
            <td>
              <select className="select select-accent select-xs">
                <option>Year</option>
                <option>Month</option>
                <option>Day</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Exclude Merge Commits:</td>
            <td>
              <input type="checkbox" className="toggle toggle-accent toggle-sm" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default ParametersGeneral;

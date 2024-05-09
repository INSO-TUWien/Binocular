function ParametersDateRange() {
  return (
    <div className={'text-xs'}>
      <table>
        <tbody>
          <tr>
            <td>From:</td>
            <td>
              <input className={'input input-accent input-xs'} type={'datetime-local'} />
            </td>
          </tr>
          <tr>
            <td>To:</td>
            <td>
              <input className={'input input-accent input-xs'} type={'datetime-local'} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default ParametersDateRange;

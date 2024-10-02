import { useState } from 'react';
import { AppDispatch, RootState, useAppDispatch } from '../../../../../redux';
import { addSprint } from '../../../../../redux/data/sprintsReducer.ts';
import { addNotification } from '../../../../../redux/general/notificationsReducer.ts';
import { AlertType } from '../../../../../types/general/alertType.ts';
import { useSelector } from 'react-redux';

function AddSprintDialogMultipleTabs() {
  const dispatch: AppDispatch = useAppDispatch();

  const sprintList = useSelector((state: RootState) => state.sprints.sprintList);

  const [name, setName] = useState('S [Nr]');
  const [from, setFrom] = useState(new Date().toISOString().split('.')[0]);
  const [sprintLength, setSprintLength] = useState(7);
  const [amount, setAmount] = useState(1);

  return (
    <>
      <label className="form-control w-full max-w-xs">
        <div className="label">
          <span className="label-text">Name:</span>
        </div>
        <input
          type="text"
          placeholder="Type here"
          value={name}
          className="input input-xs input-bordered w-full"
          onChange={(e) => setName(e.target.value)}
        />
        <div className="label">
          <span className="label-text-alt">
            <div className={'underline'}>Name Modifier:</div>
            <div>
              <span className={'font-bold'}>[Nr]</span>
              <span> - Number of Sprint added</span>
            </div>
            <div>
              <span className={'font-bold'}>[GlobalNR]</span>
              <span> - Global Sprint counter</span>
            </div>
            <div>
              <span className={'font-bold'}>[StartDate]</span>
              <span> - StartDate of Sprint</span>
            </div>
            <div>
              <span className={'font-bold'}>[EndDate]</span>
              <span> - EndDate ofSprint</span>
            </div>
          </span>
        </div>
      </label>
      <label className="form-control w-full max-w-xs">
        <div className="label">
          <span className="label-text">From:</span>
        </div>
        <input
          type="datetime-local"
          value={from}
          className="input input-xs input-bordered w-full"
          onChange={(e) => setFrom(e.target.value)}
        />
      </label>
      <label className="form-control w-full max-w-xs">
        <div className="label">
          <span className="label-text">Sprint Length (Days):</span>
        </div>
        <input
          type="number"
          value={sprintLength}
          className="input input-xs input-bordered w-full"
          onChange={(e) => {
            if (Number(e.target.value) > 0) {
              setSprintLength(Number(e.target.value));
            }
          }}
        />
      </label>
      <label className="form-control w-full max-w-xs">
        <div className="label">
          <span className="label-text">Amount:</span>
        </div>
        <input
          type="number"
          value={amount}
          className="input input-xs input-bordered w-full"
          onChange={(e) => {
            if (Number(e.target.value) > 0) {
              setAmount(Number(e.target.value));
            }
          }}
        />
      </label>
      <div></div>
      <div className={'modal-action'}>
        <button
          className={'btn btn-sm btn-success text-base-100 mr-4'}
          onClick={() => {
            if (name.length > 0) {
              const startDate = new Date(from);
              const endDate = new Date(from);
              endDate.setDate(startDate.getDate() + sprintLength);

              for (let i = 0; i < amount; i++) {
                const startDateString = startDate.toISOString().split('.')[0];
                const endDateString = endDate.toISOString().split('.')[0];

                //Generate Sprint name
                let currName = name;
                currName = currName.replace('[Nr]', `${i}`);
                currName = currName.replace('[GlobalNr]', `${sprintList.length + i}`);
                currName = currName.replace('[StartDate]', `${startDateString}`);
                currName = currName.replace('[EndDate]', `${endDateString}`);

                dispatch(addNotification({ text: `Added Sprint: ${currName}`, type: AlertType.success }));
                dispatch(addSprint({ name: currName, startDate: startDateString, endDate: endDateString }));

                startDate.setDate(startDate.getDate() + sprintLength);
                endDate.setDate(endDate.getDate() + sprintLength);
              }
              (document.getElementById('addSprintDialog') as HTMLDialogElement).close();
            } else {
              dispatch(addNotification({ text: `Error adding Sprint, no name given`, type: AlertType.error }));
            }
          }}>
          Add All
        </button>
        <form method={'dialog'}>
          <button className={'btn btn-sm btn-accent'}>Close</button>
        </form>
      </div>
    </>
  );
}

export default AddSprintDialogMultipleTabs;

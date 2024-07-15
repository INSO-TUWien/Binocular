import { useState } from 'react';
import { AppDispatch, useAppDispatch } from '../../../../redux';
import { addSprint } from '../../../../redux/data/sprintsReducer.ts';
import { addNotification } from '../../../../redux/general/notificationsReducer.ts';
import { AlertType } from '../../../../types/general/alertType.ts';

function AddSprintDialog() {
  const dispatch: AppDispatch = useAppDispatch();

  const [name, setName] = useState('');
  const [from, setFrom] = useState(new Date().toISOString().split('.')[0]);
  const [to, setTo] = useState(new Date().toISOString().split('.')[0]);

  return (
    <dialog id={'addSprintDialog'} className={'modal'}>
      <div className={'modal-box'}>
        <h3 id={'informationDialogHeadline'} className={'font-bold text-lg'}>
          Add Sprint
        </h3>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Name:</span>
          </div>
          <input
            type="text"
            placeholder="Type here"
            value={name}
            className="input input-bordered w-full max-w-xs"
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">From:</span>
          </div>
          <input
            type="datetime-local"
            value={from}
            className="input input-bordered w-full max-w-xs"
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">To:</span>
          </div>
          <input
            type="datetime-local"
            value={to}
            className="input input-bordered w-full max-w-xs"
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        <div></div>
        <div className={'modal-action'}>
          <button
            className={'btn btn-sm btn-success text-base-100 mr-4'}
            onClick={() => {
              if (name.length > 0) {
                dispatch(addNotification({ text: `Added Sprint: ${name}`, type: AlertType.success }));
                dispatch(addSprint({ name: name, startDate: from, endDate: to }));
              } else {
                dispatch(addNotification({ text: `Error adding Sprint, no name given`, type: AlertType.error }));
              }
            }}>
            Add
          </button>
          <form method={'dialog'}>
            <button className={'btn btn-sm btn-accent'}>Close</button>
          </form>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

export default AddSprintDialog;

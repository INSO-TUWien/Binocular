import { useEffect, useState } from 'react';
import { AppDispatch, RootState, useAppDispatch } from '../../../../redux';
import { addSprint, saveSprint } from '../../../../redux/data/sprintsReducer.ts';
import { addNotification } from '../../../../redux/general/notificationsReducer.ts';
import { AlertType } from '../../../../types/general/alertType.ts';
import { useSelector } from 'react-redux';

function AddSprintDialog() {
  const dispatch: AppDispatch = useAppDispatch();

  const sprintToEdit = useSelector((state: RootState) => state.sprints.sprintToEdit);

  const [name, setName] = useState(sprintToEdit ? sprintToEdit.name : '');
  const [from, setFrom] = useState(sprintToEdit ? sprintToEdit.startDate : new Date().toISOString().split('.')[0]);
  const [to, setTo] = useState(sprintToEdit ? sprintToEdit.endDate : new Date().toISOString().split('.')[0]);

  useEffect(() => {
    setName(sprintToEdit ? sprintToEdit.name : '');
    setFrom(sprintToEdit ? sprintToEdit.startDate : new Date().toISOString().split('.')[0]);
    setTo(sprintToEdit ? sprintToEdit.endDate : new Date().toISOString().split('.')[0]);
  }, [sprintToEdit]);

  return (
    <dialog id={'addSprintDialog'} className={'modal'}>
      <div className={'modal-box'}>
        <h3 id={'informationDialogHeadline'} className={'font-bold text-lg'}>
          {sprintToEdit ? 'Edit Sprint' : 'Add Sprint'}
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
          {sprintToEdit ? (
            <button
              className={'btn btn-sm btn-success text-base-100 mr-4'}
              onClick={() => {
                if (name.length > 0) {
                  dispatch(addNotification({ text: `Edited Sprint: ${name}`, type: AlertType.success }));
                  dispatch(saveSprint({ name: name, startDate: from, endDate: to, id: sprintToEdit.id }));
                } else {
                  dispatch(addNotification({ text: `Error editing Sprint, no name given`, type: AlertType.error }));
                }
                (document.getElementById('addSprintDialog') as HTMLDialogElement).close();
              }}>
              Save
            </button>
          ) : (
            <button
              className={'btn btn-sm btn-success text-base-100 mr-4'}
              onClick={() => {
                if (name.length > 0) {
                  dispatch(addNotification({ text: `Added Sprint: ${name}`, type: AlertType.success }));
                  dispatch(addSprint({ name: name, startDate: from, endDate: to }));
                } else {
                  dispatch(addNotification({ text: `Error adding Sprint, no name given`, type: AlertType.error }));
                }
                (document.getElementById('addSprintDialog') as HTMLDialogElement).close();
              }}>
              Add
            </button>
          )}
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

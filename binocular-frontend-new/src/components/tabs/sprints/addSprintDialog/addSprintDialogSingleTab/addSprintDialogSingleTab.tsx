import { useEffect, useState } from 'react';
import { type AppDispatch, type RootState, useAppDispatch } from '../../../../../redux';
import { addSprint, saveSprint } from '../../../../../redux/reducer/data/sprintsReducer.ts';
import { addNotification } from '../../../../../redux/reducer/general/notificationsReducer.ts';
import { AlertType } from '../../../../../types/general/alertType.ts';
import { useSelector } from 'react-redux';

function AddSprintDialogSingleTab() {
  const dispatch: AppDispatch = useAppDispatch();

  const sprintToEdit = useSelector((state: RootState) => state.sprints.sprintToEdit);
  const sprints = useSelector((state: RootState) => state.sprints.sprintList);

  const lastSprintEnd = sprints.length > 0 ? sprints[sprints.length - 1].endDate : new Date().toISOString().split('.')[0];
  const lastDuration =
    sprints.length > 0
      ? Math.ceil(
          (new Date(sprints[sprints.length - 1].endDate).getTime() - new Date(sprints[sprints.length - 1].startDate).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 14;

  const computeDefaultTo = (fromValue: string, duration: number) => {
    const d = new Date(fromValue);
    d.setDate(d.getDate() + duration);
    return d.toISOString().split('.')[0];
  };

  const [name, setName] = useState(sprintToEdit ? sprintToEdit.name : '');
  const [from, setFrom] = useState(sprintToEdit ? sprintToEdit.startDate : lastSprintEnd);
  const [to, setTo] = useState(sprintToEdit ? sprintToEdit.endDate : computeDefaultTo(lastSprintEnd, lastDuration));

  useEffect(() => {
    setName(sprintToEdit ? sprintToEdit.name : '');
    setFrom(sprintToEdit ? sprintToEdit.startDate : lastSprintEnd);
    setTo(sprintToEdit ? sprintToEdit.endDate : computeDefaultTo(lastSprintEnd, lastDuration));
  }, [sprintToEdit, sprints]);

  const isInvalid = to <= from;

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
      </label>
      <label className="form-control w-full max-w-xs">
        <div className="label">
          <span className="label-text">From:</span>
        </div>
        <input
          type="datetime-local"
          value={from}
          className="input input-xs input-bordered w-full"
          onChange={(e) => {
            setFrom(e.target.value);
            if (!sprintToEdit) {
              setTo(computeDefaultTo(e.target.value, lastDuration));
            }
          }}
        />
      </label>
      <label className="form-control w-full max-w-xs">
        <div className="label">
          <span className="label-text">To:</span>
        </div>
        <input
          type="datetime-local"
          value={to}
          className={'input input-xs input-bordered w-full' + (isInvalid ? ' input-error' : '')}
          onChange={(e) => setTo(e.target.value)}
        />
        {isInvalid && (
          <div className="label">
            <span className="label-text-alt text-error">End must be after start</span>
          </div>
        )}
      </label>
      <div></div>
      <div className={'modal-action'}>
        {sprintToEdit ? (
          <button
            className={'btn btn-sm btn-primary text-base-100 mr-4'}
            disabled={isInvalid || name.length === 0}
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
            className={'btn btn-sm btn-primary text-base-100 mr-4'}
            disabled={isInvalid || name.length === 0}
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
          <button className={'btn btn-sm btn-ghost'}>Close</button>
        </form>
      </div>
    </>
  );
}

export default AddSprintDialogSingleTab;

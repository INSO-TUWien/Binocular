import { useMemo, useState } from 'react';
import { type AppDispatch, type RootState, useAppDispatch } from '../../../../../redux';
import { addSprint } from '../../../../../redux/reducer/data/sprintsReducer.ts';
import { addNotification } from '../../../../../redux/reducer/general/notificationsReducer.ts';
import { AlertType } from '../../../../../types/general/alertType.ts';
import { useSelector } from 'react-redux';

function AddSprintDialogMultipleTabs() {
  const dispatch: AppDispatch = useAppDispatch();

  const sprintList = useSelector((state: RootState) => state.sprints.sprintList);

  const lastSprintEnd = sprintList.length > 0 ? sprintList[sprintList.length - 1].endDate : new Date().toISOString().split('.')[0];

  const [name, setName] = useState('S [Nr]');
  const [from, setFrom] = useState(lastSprintEnd);
  const [sprintLength, setSprintLength] = useState(7);
  const [amount, setAmount] = useState(1);

  const previewSprints = useMemo(() => {
    if (!from || sprintLength <= 0 || amount <= 0) return [];
    const startCheck = new Date(from);
    if (isNaN(startCheck.getTime())) return [];
    const result = [];
    const startDate = new Date(from);
    const cap = Math.min(amount, 10);
    for (let i = 0; i < cap; i++) {
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + sprintLength);
      const currName = name
        .replace('[Nr]', `${i + 1}`)
        .replace('[GlobalNr]', `${sprintList.length + i + 1}`)
        .replace('[StartDate]', startDate.toLocaleDateString())
        .replace('[EndDate]', endDate.toLocaleDateString());
      result.push({ name: currName, start: startDate.toLocaleDateString(), end: endDate.toLocaleDateString() });
      startDate.setDate(startDate.getDate() + sprintLength);
    }
    return result;
  }, [from, sprintLength, amount, name, sprintList.length]);

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
        <div className="text-xs mt-1 text-base-content/60 space-y-0.5">
          <div className={'underline'}>Name Modifiers:</div>
          <div>
            <span className={'font-bold'}>[Nr]</span> - Sprint number (starting at 1)
          </div>
          <div>
            <span className={'font-bold'}>[GlobalNr]</span> - Global sprint counter
          </div>
          <div>
            <span className={'font-bold'}>[StartDate]</span> - Start date of sprint
          </div>
          <div>
            <span className={'font-bold'}>[EndDate]</span> - End date of sprint
          </div>
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
      <div className="mt-2">
        <span className="text-xs font-bold">Preview:</span>
        <div className="flex flex-col gap-1 max-h-24 overflow-y-auto mt-1">
          {previewSprints.length === 0 && <div className="text-xs text-base-content/40 text-center py-1">No preview yet</div>}
          {previewSprints.map((p, i) => (
            <div key={i} className="flex justify-between items-center text-xs px-2 py-1 bg-base-200 rounded">
              <span className="font-medium">{p.name}</span>
              <span className="text-base-content/60 ml-2 whitespace-nowrap">
                {p.start} → {p.end}
              </span>
            </div>
          ))}
          {amount > 10 && <div className="text-xs text-base-content/50 text-center py-1">… and {amount - 10} more</div>}
        </div>
      </div>
      <div className={'modal-action'}>
        <button
          className={'btn btn-sm btn-primary text-base-100 mr-4'}
          onClick={() => {
            if (name.length > 0) {
              const startDate = new Date(from);
              const endDate = new Date(from);
              endDate.setDate(startDate.getDate() + sprintLength);

              let firstSprintName = '';
              for (let i = 0; i < amount; i++) {
                const startDateString = startDate.toISOString().split('.')[0];
                const endDateString = endDate.toISOString().split('.')[0];

                let currName = name;
                currName = currName.replace('[Nr]', `${i + 1}`);
                currName = currName.replace('[GlobalNr]', `${sprintList.length + i + 1}`);
                currName = currName.replace('[StartDate]', `${startDateString}`);
                currName = currName.replace('[EndDate]', `${endDateString}`);

                if (i === 0) firstSprintName = currName;
                dispatch(addSprint({ name: currName, startDate: startDateString, endDate: endDateString }));

                startDate.setDate(startDate.getDate() + sprintLength);
                endDate.setDate(endDate.getDate() + sprintLength);
              }

              const notificationText = amount === 1 ? `Added Sprint: ${firstSprintName}` : `Added ${amount} sprints`;
              dispatch(addNotification({ text: notificationText, type: AlertType.success }));
              (document.getElementById('addSprintDialog') as HTMLDialogElement).close();
            } else {
              dispatch(addNotification({ text: `Error adding Sprint, no name given`, type: AlertType.error }));
            }
          }}>
          Add All
        </button>
        <form method={'dialog'}>
          <button className={'btn btn-sm btn-ghost'}>Close</button>
        </form>
      </div>
    </>
  );
}

export default AddSprintDialogMultipleTabs;

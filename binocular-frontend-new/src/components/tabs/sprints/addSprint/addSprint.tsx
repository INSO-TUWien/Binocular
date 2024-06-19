import AddSprintDialog from '../addSprintDialog/addSprintDialog.tsx';

function AddSprint() {
  return (
    <div className={'text-xs'}>
      <button
        className={'button btn btn-accent w-full'}
        onClick={() => {
          (document.getElementById('addSprintDialog') as HTMLDialogElement).showModal();
        }}>
        Add Sprint
      </button>
      <AddSprintDialog></AddSprintDialog>
    </div>
  );
}

export default AddSprint;

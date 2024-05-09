function InformationDialog() {
  return (
    <dialog id={'informationDialog'} className={'modal'}>
      <div className={'modal-box'}>
        <h3 id={'informationDialogHeadline'} className={'font-bold text-lg'}>
          Dialog
        </h3>
        <p id={'informationDialogText'} className={'py-4'}>
          Text
        </p>
        <div className={'modal-action'}>
          <form method={'dialog'}>
            {/* if there is a button in form, it will close the modal */}
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

export default InformationDialog;

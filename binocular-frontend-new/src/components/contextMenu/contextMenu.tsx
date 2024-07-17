import contextMenuStyles from './contextMenu.module.scss';

function ContextMenu() {
  return (
    <dialog
      id={'contextMenu'}
      className={contextMenuStyles.contextMenu}
      onClick={() => {
        (document.getElementById('contextMenu') as HTMLDialogElement).close();
      }}
      onContextMenu={(e) => e.preventDefault()}>
      <div id={'contextMenuPositionController'}>
        <ul id={'contextMenuContent'}></ul>
      </div>
    </dialog>
  );
}

export default ContextMenu;

import infoTooltippStyles from './infoTooltipp.module.scss';

function InfoTooltipp() {
  return (
    <dialog
      id={'infoTooltipp'}
      className={infoTooltippStyles.infoTooltipp}
      onMouseLeave={() => {
        (document.getElementById('infoTooltipp') as HTMLDialogElement).close();
      }}
      onContextMenu={(e) => e.preventDefault()}>
      <div
        id={'infoTooltippPositionController'}
        onMouseLeave={() => {
          (document.getElementById('infoTooltipp') as HTMLDialogElement).close();
        }}>
        <div id={'infoTooltippContent'}></div>
      </div>
    </dialog>
  );
}

export default InfoTooltipp;

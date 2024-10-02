import tabControllerButtonStyles from './tabControllerButton.module.scss';

function TabControllerButton(props: { onClick: () => void; icon: string; name: string; animation: string }) {
  return (
    <>
      <button
        className={tabControllerButtonStyles.tabControllerButton}
        onClick={(e) => {
          (e.target as HTMLButtonElement).classList.remove(
            props.animation === 'rotate' ? tabControllerButtonStyles.animationRotate : tabControllerButtonStyles.animationJump,
          );
          void (e.target as HTMLButtonElement).offsetWidth; //Necessary to trigger animation
          (e.target as HTMLButtonElement).classList.add(
            props.animation === 'rotate' ? tabControllerButtonStyles.animationRotate : tabControllerButtonStyles.animationJump,
          );
          props.onClick();
        }}>
        <img src={props.icon} alt={props.name} style={{ pointerEvents: 'none' }} />
      </button>
    </>
  );
}

export default TabControllerButton;

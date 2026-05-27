import type { ReactNode } from 'react';
import tabControllerButtonStyles from './tabControllerButton.module.scss';

function TabControllerButton(props: { onClick: () => void; icon: ReactNode; name: string; animation: string }) {
  return (
    <>
      <button
        aria-label={props.name}
        className={tabControllerButtonStyles.tabControllerButton + ' opacity-50 hover:opacity-90'}
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
        <span style={{ pointerEvents: 'none' }}>{props.icon}</span>
      </button>
    </>
  );
}

export default TabControllerButton;

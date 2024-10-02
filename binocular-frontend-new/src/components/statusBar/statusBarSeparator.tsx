import statusBarStyles from './statusBarSeparator.module.scss';
function StatusBarSeparator(props: { direction: string }) {
  return (
    <>
      {props.direction === 'horizontal' && <span className={statusBarStyles.statusBarSeparatorHorizontal}></span>}
      {props.direction === 'vertical' && <span className={statusBarStyles.statusBarSeparatorVertical}></span>}
      {props.direction === 'diagonal' && <span className={statusBarStyles.statusBarSeparatorDiagonal}></span>}
    </>
  );
}

export default StatusBarSeparator;

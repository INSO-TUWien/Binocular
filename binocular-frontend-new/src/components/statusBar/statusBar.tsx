import statusBarStyles from './statusBar.module.scss';
import StatusBarSeparator from './statusBarSeparator.tsx';
function StatusBar(props: { vcsIndexer: string; itsIndexer: string; ciIndexer: string; repository: string }) {
  return (
    <>
      <div className={statusBarStyles.statusBar}>
        <div className={statusBarStyles.statusLeft}>
          <span className={statusBarStyles.text}>VCS: {props.vcsIndexer}</span>
          <StatusBarSeparator direction={'diagonal'}></StatusBarSeparator>
          <span className={statusBarStyles.text}>ITS: {props.itsIndexer}</span>
          <StatusBarSeparator direction={'diagonal'}></StatusBarSeparator>
          <span className={statusBarStyles.text}>CI: {props.ciIndexer}</span>
          <StatusBarSeparator direction={'horizontal'}></StatusBarSeparator>
          <span className={statusBarStyles.text}>Repository: {props.repository}</span>
        </div>
        <div className={statusBarStyles.statusRight}>
          <span className={statusBarStyles.text}>
            Indexing <span className="loading loading-spinner loading-xs text-accent"></span>
          </span>
        </div>
      </div>
    </>
  );
}

export default StatusBar;

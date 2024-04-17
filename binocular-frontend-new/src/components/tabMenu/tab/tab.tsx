import tabStyles from './tab.module.scss';
function Tab(props: { displayName: string; defaultAlignment: string }) {
  return (
    <>
      <div className={tabStyles.tab}>{props.displayName}-Content</div>
    </>
  );
}

export default Tab;

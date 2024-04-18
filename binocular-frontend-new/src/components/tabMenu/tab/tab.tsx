import tabStyles from './tab.module.scss';
function Tab(props: { displayName: string; defaultAlignment: string }) {
  return (
    <>
      <div className={tabStyles.tab}>{props.displayName}-Content</div>
      <button className={'btn btn-accent'}>Hello daisyUI</button>
    </>
  );
}

export default Tab;

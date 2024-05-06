import tabStyles from './tab.module.scss';
import { ReactElement } from 'react';
function Tab(props: { children: ReactElement; displayName: string; defaultAlignment: string }) {
  return <div className={tabStyles.tab}>{props.children}</div>;
}

export default Tab;

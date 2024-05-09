import tabStyles from './tabSection.module.scss';
import { ReactElement } from 'react';

export interface TabSectionProps {
  children: ReactElement[] | ReactElement;
  alignment?: string;
  name?: string;
}
function TabSection(props: TabSectionProps) {
  if (props.alignment === undefined || props.alignment === 'top' || props.alignment === 'bottom') {
    return (
      <div className={tabStyles.tabSectionHorizontal}>
        <div className={tabStyles.tabSectionName}>{props.name}</div>
        {props.children}
      </div>
    );
  } else {
    return (
      <div className={tabStyles.tabSectionVertical}>
        <div className={tabStyles.tabSectionName}>{props.name}</div>
        {props.children}
      </div>
    );
  }
}

export default TabSection;

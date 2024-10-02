import tabStyles from './tabSection.module.scss';
import React, { ReactElement } from 'react';

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
        {Array.isArray(props.children)
          ? props.children.map((child) => React.cloneElement(child, { orientation: 'horizontal' }))
          : React.cloneElement(props.children, { orientation: 'horizontal' })}
      </div>
    );
  } else {
    return (
      <div className={tabStyles.tabSectionVertical}>
        <div className={tabStyles.tabSectionName}>{props.name}</div>
        {Array.isArray(props.children)
          ? props.children.map((child) => React.cloneElement(child, { orientation: 'vertical' }))
          : React.cloneElement(props.children, { orientation: 'vertical' })}
      </div>
    );
  }
}

export default TabSection;

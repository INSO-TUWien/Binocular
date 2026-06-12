import tabStyles from './tabSection.module.scss';
import React, { type ReactElement } from 'react';
import { TabAlignment } from '../../../types/general/tabType.ts';

export type TabSectionSize = 'small' | 'medium' | 'large';

export interface TabSectionProps {
  children: ReactElement[] | ReactElement;
  alignment?: TabAlignment;
  name?: string;
  size?: TabSectionSize;
}
function TabSection(props: TabSectionProps) {
  const sizeClass = props.size === 'medium' ? tabStyles.medium : props.size === 'large' ? tabStyles.large : undefined;
  if (props.alignment === undefined || props.alignment === TabAlignment.top || props.alignment === TabAlignment.bottom) {
    return (
      <div className={[tabStyles.tabSectionHorizontal, sizeClass].filter(Boolean).join(' ')}>
        <div className={tabStyles.tabSectionName}>{props.name}</div>
        {Array.isArray(props.children)
          ? props.children.map((child) => React.cloneElement(child as ReactElement<{ orientation: string }>, { orientation: 'horizontal' }))
          : React.cloneElement(props.children as ReactElement<{ orientation: string }>, { orientation: 'horizontal' })}
      </div>
    );
  } else {
    return (
      <div className={tabStyles.tabSectionVertical}>
        <div className={tabStyles.tabSectionName}>{props.name}</div>
        {Array.isArray(props.children)
          ? props.children.map((child) => React.cloneElement(child as ReactElement<{ orientation: string }>, { orientation: 'vertical' }))
          : React.cloneElement(props.children as ReactElement<{ orientation: string }>, { orientation: 'vertical' })}
      </div>
    );
  }
}

export default TabSection;

import tabStyles from './tab.module.scss';
import { ReactElement } from 'react';
import TabSection from "./tabSection/tabSection.tsx";
function Tab(props: { children: ReactElement[]|ReactElement; displayName: string; alignment: string }) {
  if(Array.isArray(props.children)){
    return <div className={tabStyles.tab}>{props.children.map((child,i)=>{
      if(child.type === TabSection){
        return <TabSection key={props.displayName+'Section'+i} alignment={props.alignment}>{child.props.children}</TabSection>
      }
      return child;
    })}</div>;
  }
  return <div className={tabStyles.tab}>{props.children.type===TabSection?<TabSection alignment={props.alignment}>{props.children.props.children}</TabSection>:props.children}</div>;
}

export default Tab;

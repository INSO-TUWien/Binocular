import tabStyles from './tabSection.module.scss';
import { ReactElement } from 'react';
function TabSection(props: { children: ReactElement[]|ReactElement; alignment?:string}) {
  if(props.alignment===undefined || props.alignment==='top'||props.alignment==='bottom'){
    return <div className={tabStyles.tabSectionHorizontal}>{props.children}</div>;
  }else{
    return <div className={tabStyles.tabSectionVertical}>{props.children}</div>;
  }

}

export default TabSection;

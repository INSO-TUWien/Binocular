// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import Popout from 'react-popout';
import { ReactElement } from 'react';
import { RootState } from '../../../redux';
import { useSelector } from 'react-redux';

function DashboardItemPopout(props: { children: ReactElement; onClosing: () => void }) {
  /**
   * TODO: React Popout (https://github.com/JakeGinnivan/react-popout) isn't compatible with react ts and behaves wrong when closing the window directly. It should be converted to ts and fixed
   */
  const popupCount = useSelector((state: RootState) => state.dashboard.popupCount);

  return (
    <Popout url={'popout.html'} title={'Binocular' + popupCount} options={{ width: 1280, height: 720 }}>
      <button className={'btn btn-error btn-xs'} onClick={props.onClosing}>
        close
      </button>
      <div className={'w-full h-4/5'}>{props.children}</div>
    </Popout>
  );
}

export default DashboardItemPopout;

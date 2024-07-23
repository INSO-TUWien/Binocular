// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import { ReactElement } from 'react';
import { AppDispatch, RootState, useAppDispatch } from '../../../redux';
import { useSelector } from 'react-redux';
import PopoutController from './popoutController/popoutController.tsx';
import { addNotification } from '../../../redux/general/notificationsReducer.ts';
import { AlertType } from '../../../types/general/alertType.ts';

function DashboardItemPopout(props: { children: ReactElement; name: string; onClosing: () => void }) {
  const dispatch: AppDispatch = useAppDispatch();
  const popupCount = useSelector((state: RootState) => state.dashboard.popupCount);
  return (
    <PopoutController
      url={'popout.html'}
      title={`Binocular #${popupCount} - ${props.name}`}
      options={{ width: 1280, height: 720 }}
      onClosing={props.onClosing}
      onError={() => dispatch(addNotification({ text: `Error opening out ${props.name} - #${popupCount}`, type: AlertType.error }))}>
      {props.children}
    </PopoutController>
  );
}

export default DashboardItemPopout;

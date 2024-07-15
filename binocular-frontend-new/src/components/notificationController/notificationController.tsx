import { useSelector } from 'react-redux';
import { AppDispatch, RootState, useAppDispatch } from '../../redux';
import notificationControllerStyles from './notificationController.module.scss';
import { AlertType } from '../../types/general/alertType.ts';
import { removeNotification } from '../../redux/general/notificationsReducer.ts';

function NotificationController() {
  const dispatch: AppDispatch = useAppDispatch();
  const notifications = useSelector((state: RootState) => state.notifications.notificationList);
  return (
    <>
      <div className={notificationControllerStyles.notificationView}>
        {notifications.map((notification) => {
          setTimeout(() => {
            (document.getElementById(`notification${notification.id}`) as HTMLDivElement).style.marginLeft = '200vw';
            setTimeout(() => dispatch(removeNotification(notification.id || 0)), 1000);
          }, 10000);
          return (
            <div
              key={`notification${notification.id}`}
              id={`notification${notification.id}`}
              role={'alert'}
              className={`alert w-3/5 m-1 transition-all ease-in-out ${
                notification.type === AlertType.error
                  ? 'alert-error'
                  : notification.type === AlertType.warning
                    ? 'alert-warning'
                    : notification.type === AlertType.success
                      ? 'alert-success'
                      : 'alert-info'
              }`}
              onClick={(e) => {
                (e.target as HTMLDivElement).style.marginLeft = '200vw';
                setTimeout(() => dispatch(removeNotification(notification.id || 0)), 1000);
              }}>
              {notification.type === AlertType.information && (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              )}
              {notification.type === AlertType.error && (
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              {notification.type === AlertType.warning && (
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              )}
              {notification.type === AlertType.success && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-6 w-6 pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className={'pointer-events-none'}>{notification.text}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default NotificationController;

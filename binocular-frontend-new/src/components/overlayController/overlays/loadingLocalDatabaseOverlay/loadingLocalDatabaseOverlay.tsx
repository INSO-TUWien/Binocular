import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../../redux';
import { LocalDatabaseLoadingState, setLocalDatabaseLoadingState } from '../../../../redux/reducer/settings/settingsReducer.ts';

function LoadingLocalDatabaseOverlay() {
  const dispatch = useDispatch();
  const localDatabaseLoadingState = useSelector((state: RootState) => state.settings.localDatabaseLoadingState);
  const localDatabaseLoadingMessage = useSelector((state: RootState) => state.settings.localDatabaseLoadingMessage);
  return (
    <>
      {localDatabaseLoadingState === LocalDatabaseLoadingState.loading && (
        <dialog id="my_modal_1" className="modal" open={true}>
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              Loading Local Database <span className="loading loading-spinner loading-lg text-primary"></span>
            </h3>
            <p className="py-4">
              <progress
                className="progress progress-primary w-full"
                value={localDatabaseLoadingMessage.split('/')[0]}
                max={localDatabaseLoadingMessage.includes('/') ? parseInt(localDatabaseLoadingMessage.split('/')[1]) : 0}></progress>
              <span>{localDatabaseLoadingMessage}</span>
            </p>
            <div className="modal-action">
              <button className="btn btn-sm" onClick={() => dispatch(setLocalDatabaseLoadingState(LocalDatabaseLoadingState.none))}>
                Dismiss
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}

export default LoadingLocalDatabaseOverlay;

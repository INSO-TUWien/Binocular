import { useEffect, useState } from 'react';
import SetupDialogStartPage from './pages/start/setupDialogStartPage.tsx';
import SetupDialogDatabasePage from './pages/database/setupDialogDatabasePage.tsx';
import SetupDialogDashboardPage from './pages/dashboard/setupDialogDashboardPage.tsx';
import SetupDialogAuthorsPage from './pages/authors/setupDialogAuthorsPage.tsx';
import SetupDialogSummaryPage from './pages/summary/setupDialogSummaryPage.tsx';
import { type AppDispatch, useAppDispatch } from '../../redux';
import { initializeDashboardState } from '../../redux/reducer/general/dashboardReducer';
import { initializeSettingsState } from '../../redux/reducer/settings/settingsReducer';

function SetupDialog() {
  const [page, setPage] = useState(1);
  const dispatch: AppDispatch = useAppDispatch();

  const pageCount = 5;

  useEffect(() => {
    for (let i = 1; i <= pageCount; i++) {
      if (i <= page) {
        document.getElementById('setupStep' + i)?.classList.add('step-accent');
      } else {
        document.getElementById('setupStep' + i)?.classList.remove('step-accent');
      }
    }
  }, [page]);

  return (
    <dialog id={'setupDialog'} className={'modal'}>
      <div className={'modal-box max-w-full'}>
        <ul className="steps steps-vertical lg:steps-horizontal w-full">
          <li data-content="●" className="step" id={'setupStep1'}>
            Start
          </li>
          <li data-content="?" className="step" id={'setupStep2'}>
            Database
          </li>
          <li data-content="?" className="step" id={'setupStep3'}>
            Authors
          </li>
          <li data-content="?" className="step" id={'setupStep4'}>
            Dashboard
          </li>
          <li data-content="!" className="step" id={'setupStep5'}>
            Summary
          </li>
        </ul>

        {page === 1 && <SetupDialogStartPage></SetupDialogStartPage>}
        {page === 2 && <SetupDialogDatabasePage></SetupDialogDatabasePage>}
        {page === 3 && <SetupDialogAuthorsPage></SetupDialogAuthorsPage>}
        {page === 4 && <SetupDialogDashboardPage></SetupDialogDashboardPage>}
        {page === 5 && <SetupDialogSummaryPage></SetupDialogSummaryPage>}

        <div className={'modal-action'}>
          {page > 1 && page <= pageCount && (
            <button className={'btn btn-sm btn-accent'} onClick={() => setPage(page - 1)}>
              Back
            </button>
          )}
          {page >= pageCount ? (
            <button
              className="btn btn-sm btn-primary"
              onClick={() => {
                // initialize settings and dashboard state
                dispatch(initializeSettingsState());
                dispatch(initializeDashboardState());
                // timeout needed to get to next event loop tick
                setTimeout(() => {
                  location.reload();
                });
              }}>
              Save
            </button>
          ) : (
            <button className={'btn btn-sm btn-primary'} onClick={() => setPage(page + 1)}>
              Next
            </button>
          )}
          <form method={'dialog'}>
            <button className={'btn btn-sm btn-error'} style={{ color: '#fff' }}>
              Cancel
            </button>
          </form>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

export default SetupDialog;

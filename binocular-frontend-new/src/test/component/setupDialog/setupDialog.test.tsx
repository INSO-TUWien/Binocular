import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

// Mock complex sub-pages to isolate the setupDialog navigation logic
vi.mock('../../../components/setupDialog/pages/start/setupDialogStartPage.tsx', () => ({
  default: () => <div data-testid="page-start">Start Page</div>,
}));
vi.mock('../../../components/setupDialog/pages/database/setupDialogDatabasePage.tsx', () => ({
  default: () => <div data-testid="page-database">Database Page</div>,
}));
vi.mock('../../../components/setupDialog/pages/dashboard/setupDialogDashboardPage.tsx', () => ({
  default: () => <div data-testid="page-dashboard">Dashboard Page</div>,
}));
vi.mock('../../../components/setupDialog/pages/authors/setupDialogAuthorsPage.tsx', () => ({
  default: () => <div data-testid="page-authors">Authors Page</div>,
}));
vi.mock('../../../components/setupDialog/pages/summary/setupDialogSummaryPage.tsx', () => ({
  default: () => <div data-testid="page-summary">Summary Page</div>,
}));

import SetupDialog from '../../../components/setupDialog/setupDialog.tsx';
import DashboardReducer from '../../../redux/reducer/general/dashboardReducer.ts';
import SettingsReducer from '../../../redux/reducer/settings/settingsReducer.ts';
import NotificationsReducer from '../../../redux/reducer/general/notificationsReducer.ts';
import AuthorsReducer from '../../../redux/reducer/data/authorsReducer.ts';
import AccountsReducer from '../../../redux/reducer/data/accountsReducer.ts';
import FilesReducer from '../../../redux/reducer/data/filesReducer.ts';
import ParametersReducer from '../../../redux/reducer/parameters/parametersReducer.ts';
import SprintsReducer from '../../../redux/reducer/data/sprintsReducer.ts';
import ExportReducer from '../../../redux/reducer/export/exportReducer.ts';
import TabsReducer from '../../../redux/reducer/general/tabsReducer.ts';
import ActionsReducer from '../../../redux/reducer/general/actionsReducer.ts';
import LayoutReducer from '../../../redux/reducer/general/layoutReducer.ts';
import actionsMiddleware from '../../../redux/middleware/actions/actionsMiddleware.ts';
import type { Middleware } from 'redux';

const reducerMap = {
  dashboard: DashboardReducer,
  layout: LayoutReducer,
  authors: AuthorsReducer,
  accounts: AccountsReducer,
  files: FilesReducer,
  settings: SettingsReducer,
  export: ExportReducer,
  parameters: ParametersReducer,
  sprints: SprintsReducer,
  notifications: NotificationsReducer,
  tabs: TabsReducer,
  actions: ActionsReducer,
};

function createTestStore() {
  return configureStore({
    reducer: reducerMap,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(actionsMiddleware() as Middleware),
  });
}

function renderWithStore(store: ReturnType<typeof createTestStore>) {
  const result = render(
    <Provider store={store}>
      <SetupDialog />
    </Provider>,
  );
  // Open the dialog so elements are accessible
  const dialog = document.getElementById('setupDialog') as HTMLDialogElement;
  if (dialog && !dialog.open) {
    dialog.setAttribute('open', '');
  }
  return result;
}

/** Helper to find button by text content within the dialog */
function getDialogButton(name: string | RegExp) {
  const dialog = document.getElementById('setupDialog')!;
  const buttons = within(dialog).getAllByRole('button', { hidden: true });
  if (typeof name === 'string') {
    return buttons.find((b) => b.textContent?.toLowerCase().includes(name.toLowerCase()))!;
  }
  return buttons.find((b) => name.test(b.textContent || ''))!;
}

describe('SetupDialog', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    localStorage.clear();
    store = createTestStore();
  });

  it('C4.1 renders page 1 (Start) by default', () => {
    renderWithStore(store);
    expect(screen.getByTestId('page-start')).toBeInTheDocument();
    expect(screen.queryByTestId('page-database')).not.toBeInTheDocument();
  });

  it('C4.2 clicking Next advances to page 2', () => {
    renderWithStore(store);
    const nextButton = getDialogButton(/next/i);
    expect(nextButton).toBeDefined();
    fireEvent.click(nextButton);
    expect(screen.getByTestId('page-database')).toBeInTheDocument();
    expect(screen.queryByTestId('page-start')).not.toBeInTheDocument();
  });

  it('C4.3 clicking Back on page 2 returns to page 1', () => {
    renderWithStore(store);
    // Advance to page 2
    fireEvent.click(getDialogButton(/next/i));
    expect(screen.getByTestId('page-database')).toBeInTheDocument();
    // Go back
    fireEvent.click(getDialogButton(/back/i));
    expect(screen.getByTestId('page-start')).toBeInTheDocument();
  });

  it('C4.4 Back button is absent on page 1', () => {
    renderWithStore(store);
    const dialog = document.getElementById('setupDialog')!;
    const buttons = within(dialog).getAllByRole('button', { hidden: true });
    const backButton = buttons.find((b) => /back/i.test(b.textContent || ''));
    expect(backButton).toBeUndefined();
  });

  it('C4.5 clicking through all 5 pages reaches the Summary page', () => {
    renderWithStore(store);
    // Page 1 → 2 → 3 → 4 → 5
    fireEvent.click(getDialogButton(/next/i));
    fireEvent.click(getDialogButton(/next/i));
    fireEvent.click(getDialogButton(/next/i));
    fireEvent.click(getDialogButton(/next/i));
    expect(screen.getByTestId('page-summary')).toBeInTheDocument();
  });

  it('C4.6 clicking Save on last page dispatches initializeDashboardState', () => {
    vi.useFakeTimers();
    renderWithStore(store);
    // Navigate to last page
    fireEvent.click(getDialogButton(/next/i));
    fireEvent.click(getDialogButton(/next/i));
    fireEvent.click(getDialogButton(/next/i));
    fireEvent.click(getDialogButton(/next/i));

    // Mock location.reload to prevent actual navigation
    const reloadMock = vi.fn();
    try {
      Object.defineProperty(window, 'location', {
        value: { ...window.location, reload: reloadMock },
        configurable: true,
        writable: true,
      });
    } catch {
      // If location cannot be redefined, spy on it instead
      vi.spyOn(window.location, 'reload').mockImplementation(reloadMock);
    }

    const saveButton = getDialogButton(/save/i);
    act(() => {
      fireEvent.click(saveButton);
    });
    // dashboardReducer initialized should be true after initializeDashboardState
    expect(store.getState().dashboard.initialized).toBe(true);
    vi.useRealTimers();
  });

  it('C4.7 Cancel button is present', () => {
    renderWithStore(store);
    const cancelButton = getDialogButton(/cancel/i);
    expect(cancelButton).toBeDefined();
    expect(cancelButton).toBeInTheDocument();
  });

  it('C4.8 progress indicator shows step elements for all 5 pages', () => {
    renderWithStore(store);
    // All 5 step elements should be present
    expect(document.getElementById('setupStep1')).toBeInTheDocument();
    expect(document.getElementById('setupStep2')).toBeInTheDocument();
    expect(document.getElementById('setupStep3')).toBeInTheDocument();
    expect(document.getElementById('setupStep4')).toBeInTheDocument();
    expect(document.getElementById('setupStep5')).toBeInTheDocument();
  });
});

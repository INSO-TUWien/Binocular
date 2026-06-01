import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

// Mock DataPluginStorage before importing the component
vi.mock('../../../utils/dataPluginStorage.ts', () => ({
  default: {
    getDataPlugin: vi.fn(() => new Promise(() => {})), // never-resolving promise
  },
}));

import GeneralSettings from '../../../components/settingsDialog/generalSettings/generalSettings.tsx';
import SettingsReducer from '../../../redux/reducer/settings/settingsReducer.ts';
import DashboardReducer from '../../../redux/reducer/general/dashboardReducer.ts';
import AuthorsReducer from '../../../redux/reducer/data/authorsReducer.ts';
import AccountsReducer from '../../../redux/reducer/data/accountsReducer.ts';
import FilesReducer from '../../../redux/reducer/data/filesReducer.ts';
import ParametersReducer from '../../../redux/reducer/parameters/parametersReducer.ts';
import SprintsReducer from '../../../redux/reducer/data/sprintsReducer.ts';
import TabsReducer from '../../../redux/reducer/general/tabsReducer.ts';
import { SettingsGeneralGridSize } from '../../../types/settings/generalSettingsType.ts';

function createTestStore() {
  return configureStore({
    reducer: {
      settings: SettingsReducer,
      dashboard: DashboardReducer,
      authors: AuthorsReducer,
      accounts: AccountsReducer,
      files: FilesReducer,
      parameters: ParametersReducer,
      sprints: SprintsReducer,
      tabs: TabsReducer,
    },
  });
}

function renderWithStore(store: ReturnType<typeof createTestStore>) {
  return render(
    <Provider store={store}>
      <GeneralSettings />
    </Provider>,
  );
}

describe('GeneralSettings', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    localStorage.clear();
    store = createTestStore();
    vi.restoreAllMocks();
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
  });

  it('C31.1 renders a grid size select element', () => {
    renderWithStore(store);
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('C31.2 changing grid size select dispatches setGeneralSettings and updates store', () => {
    renderWithStore(store);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: String(SettingsGeneralGridSize.large) } });
    expect(store.getState().settings.general.gridSize).toBe(SettingsGeneralGridSize.large);
  });

  it('C31.3 "Clear Storage" button is rendered', () => {
    renderWithStore(store);
    expect(screen.getByRole('button', { name: /clear storage/i })).toBeInTheDocument();
  });

  it('C31.4 "Reload Page" button is NOT visible before clearing storage', () => {
    renderWithStore(store);
    expect(screen.queryByRole('button', { name: /reload page/i })).not.toBeInTheDocument();
  });

  it('C31.5 clicking the clear-storage button causes "Reload Page" button to appear', async () => {
    vi.stubGlobal('location', { reload: vi.fn() });
    renderWithStore(store);
    fireEvent.click(screen.getByRole('button', { name: /clear storage/i }));
    fireEvent.click(screen.getByRole('button', { name: /clear selected/i, hidden: true }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
    });
  });

  it('C31.6 "Export Storage" button is present', () => {
    renderWithStore(store);
    expect(screen.getByRole('button', { name: /export storage/i })).toBeInTheDocument();
  });

  it('C31.7 providing invalid JSON in the file import input shows an error message', async () => {
    // Mock FileReader to return invalid JSON
    class MockFileReader {
      onload: ((e: ProgressEvent) => void) | null = null;
      onerror: ((e: ProgressEvent) => void) | null = null;
      readAsText(_file: File) {
        setTimeout(() => this.onload?.({ target: { result: 'THIS IS NOT JSON }{' } } as unknown as ProgressEvent), 0);
      }
    }
    vi.stubGlobal('FileReader', MockFileReader);

    renderWithStore(store);

    const fileInput = document.getElementById('importStorageFilePicker') as HTMLInputElement;
    const file = new File(['THIS IS NOT JSON }{'], 'state.json', { type: 'text/json' });
    Object.defineProperty(fileInput, 'files', { value: [file], configurable: true });

    const importBtn = screen.getByRole('button', { name: /import/i });
    fireEvent.click(importBtn);

    await waitFor(() => {
      expect(screen.getByText(/error reading file/i)).toBeInTheDocument();
    });
  });

  it('C31.8 providing JSON with wrong storageVersion shows an error message', async () => {
    const badPayload = JSON.stringify({ storageVersion: 9999, storageState: {} });

    class MockFileReader {
      onload: ((e: ProgressEvent) => void) | null = null;
      onerror: ((e: ProgressEvent) => void) | null = null;
      readAsText(_file: File) {
        setTimeout(() => this.onload?.({ target: { result: badPayload } } as unknown as ProgressEvent), 0);
      }
    }
    vi.stubGlobal('FileReader', MockFileReader);

    renderWithStore(store);

    const fileInput = document.getElementById('importStorageFilePicker') as HTMLInputElement;
    const file = new File([badPayload], 'state.json', { type: 'text/json' });
    Object.defineProperty(fileInput, 'files', { value: [file], configurable: true });

    const importBtn = screen.getByRole('button', { name: /import/i });
    fireEvent.click(importBtn);

    await waitFor(() => {
      expect(screen.getByText(/storage version not compatible/i)).toBeInTheDocument();
    });
  });

  it('C31.9 clicking "Reload Page" calls location.reload', async () => {
    const reloadMock = vi.fn();
    vi.stubGlobal('location', { reload: reloadMock });

    renderWithStore(store);

    fireEvent.click(screen.getByRole('button', { name: /clear storage/i }));

    // Uncheck the "Reload Page" toggle so handleClear doesn't auto-reload
    const checkboxes = screen.getAllByRole('checkbox', { hidden: true });
    const reloadToggle = checkboxes[checkboxes.length - 1];
    fireEvent.click(reloadToggle);

    fireEvent.click(screen.getByRole('button', { name: /clear selected/i, hidden: true }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /reload page/i }));
    expect(reloadMock).toHaveBeenCalledOnce();
  });
});

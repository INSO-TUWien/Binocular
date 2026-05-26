import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

// ── Mocks (hoisted before all imports) ──────────────────────────────────────

vi.mock('../../../redux/middleware/socket/socketMiddleware.ts', () => ({
  default: vi.fn(() => () => (next: (action: unknown) => unknown) => (action: unknown) => next(action)),
}));

vi.mock('../../../redux/middleware/refresh/refreshMiddleware.ts', () => ({
  default: vi.fn(() => () => (next: (action: unknown) => unknown) => (action: unknown) => next(action)),
}));

// ── Actual imports (after mocks) ─────────────────────────────────────────────

import StatusBarDataPluginElement from '../../../components/statusBar/statusBarDataPlugin/statusBarDataPluginElement/statusBarDataPluginElement.tsx';
import ProgressReducer, { setConnectionStatus } from '../../../redux/reducer/general/progressReducer.ts';
import { SocketConnectionStatusType } from '../../../types/general/socketConnectionType.ts';
import type { DatabaseSettingsDataPluginType } from '../../../types/settings/databaseSettingsType.ts';
import type { DataPlugin } from '../../../plugins/interfaces/dataPlugin.ts';

// ── Store factory ────────────────────────────────────────────────────────────

function createTestStore() {
  return configureStore({
    reducer: ProgressReducer,
  });
}

// ── Fixtures ─────────────────────────────────────────────────────────────────

const basePluginConfig: DatabaseSettingsDataPluginType = {
  id: 1,
  name: 'TestPlugin',
  color: '#ff0000',
  isDefault: false,
  parameters: {},
};

const preloadedPluginConfig: DatabaseSettingsDataPluginType = {
  id: 0,
  name: 'PreLoaded',
  color: '#0000ff',
  isDefault: true,
  parameters: {},
};

const mockDataPlugin: Partial<DataPlugin> = {
  description: 'A test data plugin description',
};

// ── Render helper ─────────────────────────────────────────────────────────────

function renderElement(
  dataPluginConfig: DatabaseSettingsDataPluginType,
  store: ReturnType<typeof createTestStore>,
  dataPlugin?: Partial<DataPlugin>,
) {
  return render(
    <Provider store={store}>
      <StatusBarDataPluginElement dataPluginConfig={dataPluginConfig} dataPlugin={dataPlugin as DataPlugin | undefined} store={store} />
    </Provider>,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('StatusBarDataPluginElement', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('C33.1: with dataPluginConfig.id === 0 (pre-loaded), renders the "pre-loaded" badge', () => {
    renderElement(preloadedPluginConfig, store);
    expect(screen.getByText('pre-loaded')).toBeInTheDocument();
  });

  it('C33.2: with dataPluginConfig.id !== 0 (regular plugin), renders the plugin name with id', () => {
    renderElement(basePluginConfig, store);
    // The regular plugin renders "<name> #<id>" — pre-loaded badge should NOT be present
    expect(screen.queryByText('pre-loaded')).not.toBeInTheDocument();
    // The name is rendered
    expect(screen.getByText(`${basePluginConfig.name} #${basePluginConfig.id}`)).toBeInTheDocument();
  });

  it('C33.3: socket status Idle → idle icon is present', () => {
    // Initial state is already Idle
    renderElement(basePluginConfig, store);
    const idleImgs = screen.getAllByRole('img', { name: 'idle' });
    expect(idleImgs.length).toBeGreaterThan(0);
  });

  it('C33.4: socket status Connected → connected icon/element is present', () => {
    act(() => {
      store.dispatch(setConnectionStatus({ status: SocketConnectionStatusType.Connected }));
    });
    renderElement(basePluginConfig, store);
    const imgs = screen.getAllByRole('img', { name: 'connected_to_api' });
    expect(imgs.length).toBeGreaterThan(0);
    // Confirm the connected state is actually in the store
    expect(store.getState().socketConnection.status).toBe(SocketConnectionStatusType.Connected);
  });

  it('C33.5: socket status Disconnected → disconnected icon/element is present', () => {
    act(() => {
      store.dispatch(setConnectionStatus({ status: SocketConnectionStatusType.Disconnected }));
    });
    renderElement(basePluginConfig, store);
    const imgs = screen.getAllByRole('img', { name: 'connected_to_api_failed' });
    expect(imgs.length).toBeGreaterThan(0);
    // Confirm the disconnected state is actually in the store
    expect(store.getState().socketConnection.status).toBe(SocketConnectionStatusType.Disconnected);
  });

  it('C33.6: dataPluginConfig.parameters.progressUpdate.useAutomaticUpdate = true → progress bar elements rendered', () => {
    const configWithProgress: DatabaseSettingsDataPluginType = {
      ...basePluginConfig,
      parameters: {
        progressUpdate: {
          useAutomaticUpdate: true,
          endpoint: 'ws://localhost:1234',
        },
      },
    };
    renderElement(configWithProgress, store);
    // At least one <progress> element should be present
    const progressBars = document.querySelectorAll('progress');
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it('C33.7: progressUpdate not set → progress bars absent, description text rendered instead', () => {
    const configNoProgress: DatabaseSettingsDataPluginType = {
      ...basePluginConfig,
      parameters: {
        // progressUpdate is intentionally omitted (undefined)
      },
    };
    renderElement(configNoProgress, store, mockDataPlugin);
    // No <progress> elements
    const progressBars = document.querySelectorAll('progress');
    expect(progressBars.length).toBe(0);
    // The dataPlugin description is shown
    expect(screen.getByText(mockDataPlugin.description as string)).toBeInTheDocument();
  });
});

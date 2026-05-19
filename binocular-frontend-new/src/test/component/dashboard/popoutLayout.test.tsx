import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock ImageExportPanel so we can detect its presence without running PNG/SVG logic
vi.mock('../../../components/exportDialog/imageExportPanel/imageExportPanel.tsx', () => ({
  default: () => <div data-testid="image-export-panel">ImageExportPanel</div>,
}));

import PopoutLayout from '../../../components/dashboard/popoutLayout/popoutLayout.tsx';
import type { VisualizationPlugin } from '../../../plugins/interfaces/visualizationPlugin.ts';

function makePlugin(exportEnabled: boolean): VisualizationPlugin<unknown, unknown> {
  return {
    name: 'TestPlugin',
    chartComponent: undefined,
    settingsComponent: () => null,
    helpComponent: () => <div data-testid="help-content">Help Text</div>,
    defaultSettings: {},
    capabilities: { export: exportEnabled, popoutOnly: false },
    export: { getSVGData: vi.fn(() => '<svg></svg>') },
    reducer: (s: Record<string, unknown> = {}) => s,
    saga: vi.fn() as unknown as VisualizationPlugin<unknown, unknown>['saga'],
    images: { thumbnail: '' },
    metadata: {} as VisualizationPlugin<unknown, unknown>['metadata'],
  } as unknown as VisualizationPlugin<unknown, unknown>;
}

const settingsNode = <div data-testid="settings-content">Settings</div>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PopoutLayout', () => {
  it('C44.1 renders the plugin name in the toolbar', () => {
    const plugin = makePlugin(false);
    (plugin as { name: string }).name = 'Changes';
    const ref = { current: null };
    render(
      <PopoutLayout plugin={plugin} chartContainerRef={ref}>
        <div />
      </PopoutLayout>,
    );
    expect(screen.getByText('Changes')).toBeInTheDocument();
  });

  it('C44.2 children (chart content) are rendered', () => {
    const plugin = makePlugin(false);
    const ref = { current: null };
    render(
      <PopoutLayout plugin={plugin} chartContainerRef={ref}>
        <div data-testid="chart-content">Chart</div>
      </PopoutLayout>,
    );
    expect(screen.getByTestId('chart-content')).toBeInTheDocument();
  });

  it('C44.3 export button absent when capabilities.export is false', () => {
    const plugin = makePlugin(false);
    const ref = { current: null };
    render(
      <PopoutLayout plugin={plugin} chartContainerRef={ref}>
        <div />
      </PopoutLayout>,
    );
    expect(screen.queryByTitle('Export Image')).toBeNull();
  });

  it('C44.4 export button present when capabilities.export is true', () => {
    const plugin = makePlugin(true);
    const ref = { current: null };
    render(
      <PopoutLayout plugin={plugin} chartContainerRef={ref}>
        <div />
      </PopoutLayout>,
    );
    expect(screen.getByTitle('Export Image')).toBeInTheDocument();
  });

  it('C44.5 no panel visible by default', () => {
    const plugin = makePlugin(true);
    const ref = { current: null };
    render(
      <PopoutLayout plugin={plugin} chartContainerRef={ref} settingsElement={settingsNode}>
        <div />
      </PopoutLayout>,
    );
    expect(screen.queryByTestId('help-content')).toBeNull();
    expect(screen.queryByTestId('image-export-panel')).toBeNull();
    expect(screen.queryByTestId('settings-content')).toBeNull();
  });

  it('C44.6 clicking Help button shows help panel', () => {
    const plugin = makePlugin(false);
    const ref = { current: null };
    render(
      <PopoutLayout plugin={plugin} chartContainerRef={ref}>
        <div />
      </PopoutLayout>,
    );
    fireEvent.click(screen.getByTitle('Help'));
    expect(screen.getByTestId('help-content')).toBeInTheDocument();
  });

  it('C44.7 clicking Help again closes the help panel', () => {
    const plugin = makePlugin(false);
    const ref = { current: null };
    render(
      <PopoutLayout plugin={plugin} chartContainerRef={ref}>
        <div />
      </PopoutLayout>,
    );
    const helpBtn = screen.getByTitle('Help');
    fireEvent.click(helpBtn);
    fireEvent.click(helpBtn);
    expect(screen.queryByTestId('help-content')).toBeNull();
  });

  it('C44.8 clicking Export calls getSVGData and shows ImageExportPanel', () => {
    const plugin = makePlugin(true);
    const ref = { current: null };
    render(
      <PopoutLayout plugin={plugin} chartContainerRef={ref}>
        <div />
      </PopoutLayout>,
    );
    fireEvent.click(screen.getByTitle('Export Image'));
    expect(plugin.export.getSVGData).toHaveBeenCalledOnce();
    expect(screen.getByTestId('image-export-panel')).toBeInTheDocument();
  });

  it('C44.9 clicking Export again closes the export panel', () => {
    const plugin = makePlugin(true);
    const ref = { current: null };
    render(
      <PopoutLayout plugin={plugin} chartContainerRef={ref}>
        <div />
      </PopoutLayout>,
    );
    const exportBtn = screen.getByTitle('Export Image');
    fireEvent.click(exportBtn);
    fireEvent.click(exportBtn);
    expect(screen.queryByTestId('image-export-panel')).toBeNull();
  });

  it('C44.10 opening Help closes any previously open panel', () => {
    const plugin = makePlugin(true);
    const ref = { current: null };
    render(
      <PopoutLayout plugin={plugin} chartContainerRef={ref}>
        <div />
      </PopoutLayout>,
    );
    fireEvent.click(screen.getByTitle('Export Image'));
    expect(screen.getByTestId('image-export-panel')).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Help'));
    expect(screen.queryByTestId('image-export-panel')).toBeNull();
    expect(screen.getByTestId('help-content')).toBeInTheDocument();
  });

  it('C44.11 settings button absent when no settingsElement is provided', () => {
    const plugin = makePlugin(false);
    const ref = { current: null };
    render(
      <PopoutLayout plugin={plugin} chartContainerRef={ref}>
        <div />
      </PopoutLayout>,
    );
    expect(screen.queryByTitle('Settings')).toBeNull();
  });

  it('C44.12 settings button present when settingsElement prop is provided', () => {
    const plugin = makePlugin(false);
    const ref = { current: null };
    render(
      <PopoutLayout plugin={plugin} chartContainerRef={ref} settingsElement={settingsNode}>
        <div />
      </PopoutLayout>,
    );
    expect(screen.getByTitle('Settings')).toBeInTheDocument();
  });

  it('C44.13 clicking Settings shows the settings panel', () => {
    const plugin = makePlugin(false);
    const ref = { current: null };
    render(
      <PopoutLayout plugin={plugin} chartContainerRef={ref} settingsElement={settingsNode}>
        <div />
      </PopoutLayout>,
    );
    fireEvent.click(screen.getByTitle('Settings'));
    expect(screen.getByTestId('settings-content')).toBeInTheDocument();
  });

  it('C44.14 clicking Settings again closes the settings panel', () => {
    const plugin = makePlugin(false);
    const ref = { current: null };
    render(
      <PopoutLayout plugin={plugin} chartContainerRef={ref} settingsElement={settingsNode}>
        <div />
      </PopoutLayout>,
    );
    const settingsBtn = screen.getByTitle('Settings');
    fireEvent.click(settingsBtn);
    fireEvent.click(settingsBtn);
    expect(screen.queryByTestId('settings-content')).toBeNull();
  });

  it('C44.15 opening Settings closes any previously open panel', () => {
    const plugin = makePlugin(false);
    const ref = { current: null };
    render(
      <PopoutLayout plugin={plugin} chartContainerRef={ref} settingsElement={settingsNode}>
        <div />
      </PopoutLayout>,
    );
    fireEvent.click(screen.getByTitle('Help'));
    expect(screen.getByTestId('help-content')).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Settings'));
    expect(screen.queryByTestId('help-content')).toBeNull();
    expect(screen.getByTestId('settings-content')).toBeInTheDocument();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import ExportDialog from '../../../components/exportDialog/exportDialog';
import ExportReducer, { ExportType } from '../../../redux/reducer/export/exportReducer';
import SettingsReducer from '../../../redux/reducer/settings/settingsReducer';

vi.mock('../../../../utils/dataPluginStorage.ts', () => ({
  default: {
    getDataPlugin: vi.fn(() => new Promise(() => {})),
  },
}));

function makeStore(
  exportType: ExportType = ExportType.all,
  exportSVGData = '<svg></svg>',
  exportName = 'export',
  exportLoading = false,
  exportData = {},
  exportDataType = 'json',
) {
  return configureStore({
    reducer: { export: ExportReducer, settings: SettingsReducer },
    preloadedState: { export: { exportType, exportSVGData, exportName, exportLoading, exportData, exportDataType } },
  });
}

function renderDialog(
  exportType: ExportType = ExportType.all,
  exportSVGData = '<svg></svg>',
  exportName = 'export',
  exportLoading = false,
  exportData = {},
  exportDataType = 'json',
) {
  return render(
    <Provider store={makeStore(exportType, exportSVGData, exportName, exportLoading, exportData, exportDataType)}>
      <ExportDialog />
    </Provider>,
  );
}

describe('ExportDialog', () => {
  it('C26.1 renders dialog with id="exportDialog"', () => {
    renderDialog();
    expect(document.getElementById('exportDialog')).not.toBeNull();
  });

  it('C26.2 shows heading "Export" for ExportType.all', () => {
    const { getByText } = renderDialog(ExportType.all);
    expect(getByText('Export')).not.toBeNull();
  });

  it('C26.3 shows heading "Image Export" for ExportType.image', () => {
    const { getByText } = renderDialog(ExportType.image);
    expect(getByText('Image Export')).not.toBeNull();
  });

  it('C26.4 shows heading "Data Export" for ExportType.data', () => {
    const { getByText } = renderDialog(ExportType.data);
    expect(getByText('Data Export')).not.toBeNull();
  });

  it('C26.5 shows "Export SVG" button for ExportType.image', () => {
    const { getByText } = renderDialog(ExportType.image);
    expect(getByText('Export SVG')).not.toBeNull();
  });

  it('C26.6 no "Export SVG" button for ExportType.all', () => {
    const { queryByText } = renderDialog(ExportType.all);
    expect(queryByText('Export SVG')).toBeNull();
  });

  it('C26.7 always renders a "Close" button', () => {
    const { getAllByText } = renderDialog(ExportType.all);
    expect(getAllByText('Close').length).toBeGreaterThan(0);
  });
});

describe('ExportDialog — extended', () => {
  beforeEach(() => {
    vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:test'), revokeObjectURL: vi.fn() });
  });

  it('C26.8 exportType === ExportType.all → "Export" heading visible; "Image Export" and "Data Export" headings absent', () => {
    renderDialog(ExportType.all);
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.queryByText('Image Export')).toBeNull();
    expect(screen.queryByText('Data Export')).toBeNull();
  });

  it('C26.9 exportType === ExportType.data → "Data Export" heading visible; "Export SVG" button absent; no preview div', () => {
    renderDialog(ExportType.data);
    expect(screen.getByText('Data Export')).toBeInTheDocument();
    expect(screen.queryByText('Export SVG')).toBeNull();
    expect(screen.queryByText('Preview:')).toBeNull();
  });

  it('C26.10 exportType === ExportType.image → "Image Export" heading + preview div + "Export SVG" button all visible', () => {
    renderDialog(ExportType.image, '<svg><circle r="5"/></svg>', 'my-chart');
    expect(screen.getByText('Image Export')).toBeInTheDocument();
    expect(screen.getByText('Preview:')).toBeInTheDocument();
    expect(screen.getByText('Export SVG')).toBeInTheDocument();
  });

  it('C26.11 clicking "Export SVG" calls URL.createObjectURL', () => {
    renderDialog(ExportType.image, '<svg></svg>', 'test-export');
    const exportButton = screen.getByText('Export SVG');
    fireEvent.click(exportButton);
    expect(URL.createObjectURL).toHaveBeenCalledOnce();
  });
});

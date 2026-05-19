import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ImageExportPanel from '../../../components/exportDialog/imageExportPanel/imageExportPanel.tsx';

const SVG_DATA = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50"><rect width="100" height="50"/></svg>';

beforeEach(() => {
  vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:test'), revokeObjectURL: vi.fn() });
  vi.clearAllMocks();
});

describe('ImageExportPanel', () => {
  it('C43.1 renders format toggle with "SVG" and "PNG" buttons', () => {
    render(<ImageExportPanel svgData={SVG_DATA} exportName="test" />);
    expect(screen.getByText('SVG')).toBeInTheDocument();
    expect(screen.getByText('PNG')).toBeInTheDocument();
  });

  it('C43.2 "SVG" is active by default; scale and background controls are absent', () => {
    render(<ImageExportPanel svgData={SVG_DATA} exportName="test" />);
    const svgBtn = screen.getByText('SVG');
    expect(svgBtn.className).toContain('btn-primary');
    expect(screen.queryByText('1x')).toBeNull();
    expect(screen.queryByText('Transparent')).toBeNull();
  });

  it('C43.3 clicking "PNG" shows scale (1x/2x/4x) and background (Transparent/White) controls', () => {
    render(<ImageExportPanel svgData={SVG_DATA} exportName="test" />);
    fireEvent.click(screen.getByText('PNG'));
    expect(screen.getByText('1x')).toBeInTheDocument();
    expect(screen.getByText('2x')).toBeInTheDocument();
    expect(screen.getByText('4x')).toBeInTheDocument();
    expect(screen.getByText('Transparent')).toBeInTheDocument();
    expect(screen.getByText('White')).toBeInTheDocument();
  });

  it('C43.4 default scale is "1x" (has btn-primary class) after switching to PNG', () => {
    render(<ImageExportPanel svgData={SVG_DATA} exportName="test" />);
    fireEvent.click(screen.getByText('PNG'));
    expect(screen.getByText('1x').className).toContain('btn-primary');
  });

  it('C43.5 clicking "2x" makes it active and deactivates "1x"', () => {
    render(<ImageExportPanel svgData={SVG_DATA} exportName="test" />);
    fireEvent.click(screen.getByText('PNG'));
    fireEvent.click(screen.getByText('2x'));
    expect(screen.getByText('2x').className).toContain('btn-primary');
    expect(screen.getByText('1x').className).not.toContain('btn-primary');
  });

  it('C43.6 default background is "Transparent" after switching to PNG', () => {
    render(<ImageExportPanel svgData={SVG_DATA} exportName="test" />);
    fireEvent.click(screen.getByText('PNG'));
    expect(screen.getByText('Transparent').className).toContain('btn-primary');
  });

  it('C43.7 clicking "White" makes it active', () => {
    render(<ImageExportPanel svgData={SVG_DATA} exportName="test" />);
    fireEvent.click(screen.getByText('PNG'));
    fireEvent.click(screen.getByText('White'));
    expect(screen.getByText('White').className).toContain('btn-primary');
    expect(screen.getByText('Transparent').className).not.toContain('btn-primary');
  });

  it('C43.8 in SVG mode, clicking the export button calls URL.createObjectURL', () => {
    render(<ImageExportPanel svgData={SVG_DATA} exportName="my-chart" />);
    vi.clearAllMocks(); // discard the preview-blob call from mount
    fireEvent.click(screen.getByText('Export SVG'));
    expect(URL.createObjectURL).toHaveBeenCalledOnce();
  });

  it('C43.9 export button text contains "Export SVG" in SVG mode', () => {
    render(<ImageExportPanel svgData={SVG_DATA} exportName="test" />);
    expect(screen.getByText('Export SVG')).toBeInTheDocument();
  });

  it('C43.10 export button text contains "Export PNG" after switching to PNG mode', () => {
    render(<ImageExportPanel svgData={SVG_DATA} exportName="test" />);
    fireEvent.click(screen.getByText('PNG'));
    expect(screen.getByText(/Export PNG/)).toBeInTheDocument();
  });

  it('C43.11 SVG preview renders an img element and passes svgData to createObjectURL', async () => {
    const svgContent = '<svg><rect id="my-rect"/></svg>';
    render(<ImageExportPanel svgData={svgContent} exportName="test" />);
    expect(screen.getByAltText('SVG preview')).toBeInTheDocument();
    const blob: Blob = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0][0];
    const text = await blob.text();
    expect(text).toContain('my-rect');
  });
});

import { useState, useEffect } from 'react';
import DownloadIcon from '../../../assets/download.svg?react';
import styles from './imageExportPanel.module.scss';

type ImageFormat = 'svg' | 'png';
type PngScale = 1 | 2 | 4;
type PngBackground = 'transparent' | 'white';

interface ImageExportPanelProps {
  svgData: string;
  exportName: string;
}

function download(name: string, data: Blob): void {
  const url = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

async function exportAsPng(svgData: string, scale: PngScale, background: PngBackground, filename: string): Promise<void> {
  let width = 800;
  let height = 600;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgData, 'image/svg+xml');
    const svg = doc.querySelector('svg');
    if (svg) {
      const viewBox = svg.getAttribute('viewBox');
      if (viewBox) {
        const parts = viewBox.split(/[\s,]+/);
        if (parts.length === 4) {
          width = parseFloat(parts[2]) || width;
          height = parseFloat(parts[3]) || height;
        }
      } else {
        const w = parseFloat(svg.getAttribute('width') ?? '');
        const h = parseFloat(svg.getAttribute('height') ?? '');
        if (!isNaN(w)) width = w;
        if (!isNaN(h)) height = h;
      }
    }
  } catch {
    // use defaults
  }

  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  try {
    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d')!;
        if (background === 'white') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((pngBlob) => {
          if (pngBlob) {
            download(filename + '.png', pngBlob);
            resolve();
          } else {
            reject(new Error('Canvas toBlob returned null'));
          }
        }, 'image/png');
      };
      img.onerror = () => reject(new Error('Failed to load SVG as image'));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function ImageExportPanel({ svgData, exportName }: ImageExportPanelProps) {
  const [format, setFormat] = useState<ImageFormat>('svg');
  const [scale, setScale] = useState<PngScale>(1);
  const [background, setBackground] = useState<PngBackground>('transparent');
  const [error, setError] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [svgData]);

  function handleDownload() {
    setError('');
    if (format === 'svg') {
      download(exportName, new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' }));
    } else {
      exportAsPng(svgData, scale, background, exportName).catch((e: Error) => setError(e.message));
    }
  }

  return (
    <div className={styles.panel}>
      <div className={`${styles.controls} flex flex-wrap items-end gap-4`}>
        <div>
          <label className="font-bold text-sm block mb-1">Format</label>
          <div className="join">
            <button className={`join-item btn btn-sm ${format === 'svg' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFormat('svg')}>
              SVG
            </button>
            <button className={`join-item btn btn-sm ${format === 'png' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFormat('png')}>
              PNG
            </button>
          </div>
        </div>

        {format === 'png' && (
          <>
            <div>
              <label className="font-bold text-sm block mb-1">Scale</label>
              <div className="join">
                {([1, 2, 4] as PngScale[]).map((s) => (
                  <button
                    key={s}
                    className={`join-item btn btn-sm ${scale === s ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setScale(s)}>
                    {s}x
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="font-bold text-sm block mb-1">Background</label>
              <div className="join">
                <button
                  className={`join-item btn btn-sm ${background === 'transparent' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setBackground('transparent')}>
                  Transparent
                </button>
                <button
                  className={`join-item btn btn-sm ${background === 'white' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setBackground('white')}>
                  White
                </button>
              </div>
            </div>
          </>
        )}

        <button className="btn btn-primary btn-sm" onClick={handleDownload}>
          <DownloadIcon fill="currentColor" width="1.4em" height="1.4em" />
          {format === 'svg' ? 'Export SVG' : `Export PNG (${scale}x${background === 'white' ? ', white bg' : ''})`}
        </button>
      </div>

      {error && <p className="text-error text-xs mb-1">{error}</p>}

      <div className={styles.previewWrapper}>{previewUrl && <img src={previewUrl} alt="SVG preview" />}</div>
    </div>
  );
}

export default ImageExportPanel;

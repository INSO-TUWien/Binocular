import { type ReactNode, type RefObject, useState } from 'react';
import type { VisualizationPlugin } from '../../../plugins/interfaces/visualizationPlugin.ts';
import ImageExportPanel from '../../exportDialog/imageExportPanel/imageExportPanel.tsx';
import styles from './popoutLayout.module.scss';

type ActivePanel = 'export' | 'help' | 'settings' | null;

interface PopoutLayoutProps {
  plugin: VisualizationPlugin<unknown, unknown>;
  chartContainerRef: RefObject<HTMLDivElement | null>;
  settingsElement?: ReactNode;
  children: ReactNode;
}

function PopoutLayout({ plugin, chartContainerRef, settingsElement, children }: PopoutLayoutProps) {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [svgData, setSvgData] = useState('');

  function toggle(panel: ActivePanel) {
    if (panel === 'export' && activePanel !== 'export') {
      setSvgData(plugin.export.getSVGData(chartContainerRef));
    }
    setActivePanel((prev) => (prev === panel ? null : panel));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>{plugin.name}</div>
        <div className={styles.toolbarRight}>
          {plugin.capabilities.export && (
            <button
              className={`${styles.exportButton} ${activePanel === 'export' ? styles.active : ''}`}
              title="Export Image"
              onClick={() => toggle('export')}
            />
          )}
          <button
            className={`${styles.helpButton} ${activePanel === 'help' ? styles.active : ''}`}
            title="Help"
            onClick={() => toggle('help')}
          />
          {settingsElement !== undefined && (
            <button
              className={`${styles.settingsButton} ${activePanel === 'settings' ? styles.active : ''}`}
              title="Settings"
              onClick={() => toggle('settings')}
            />
          )}
        </div>
      </div>

      <div className={styles.chartArea}>
        {children}

        {activePanel !== null && (
          <div className={activePanel === 'export' ? styles.overlayPanelWide : styles.overlayPanel}>
            {activePanel === 'export' && <ImageExportPanel svgData={svgData} exportName={`${plugin.name}Export`} />}
            {activePanel === 'help' && <plugin.helpComponent />}
            {activePanel === 'settings' && settingsElement}
          </div>
        )}
      </div>
    </div>
  );
}

export default PopoutLayout;

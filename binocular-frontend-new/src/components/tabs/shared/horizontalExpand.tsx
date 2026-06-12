import { type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useExpandOverlay } from './useExpandOverlay';

function HorizontalExpand(props: {
  orientation?: string;
  label: string;
  overlayContent: ReactNode;
  verticalContent: ReactNode;
  overlayMaxHeight?: string;
  overlayMaxWidth?: number;
}) {
  const { isOpen, containerRef, overlayRef, overlayStyle, toggle } = useExpandOverlay(props.orientation, props.overlayMaxWidth);

  if (props.orientation !== 'horizontal') {
    return <>{props.verticalContent}</>;
  }

  return (
    <>
      <div ref={containerRef}>
        <button className="btn" onClick={toggle}>
          {isOpen ? `Collapse ${props.label}` : `Expand ${props.label}`}
        </button>
      </div>
      {isOpen &&
        overlayStyle &&
        createPortal(
          <div
            ref={overlayRef}
            className="fixed z-50 bg-base-100 border border-base-300 rounded-lg shadow-xl flex flex-col"
            style={{ ...overlayStyle, maxHeight: props.overlayMaxHeight ?? '70vh' }}>
            {props.overlayContent}
          </div>,
          document.body,
        )}
    </>
  );
}

export default HorizontalExpand;

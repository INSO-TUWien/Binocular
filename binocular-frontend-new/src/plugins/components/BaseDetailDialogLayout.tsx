import * as React from 'react';

const detailDialogWidth = 400;
const detailDialogDefaultHeight = 600;

const marginBetweenDialogAndAnchor = 4;

export const BaseDetailDialogLayout: React.FC<
  React.PropsWithChildren<{
    anchor: SVGElement;
    invisible: boolean;

    onClickClose: React.MouseEventHandler;
  }>
> = ({ children, anchor, invisible, onClickClose }) => {
  const svg = anchor.closest('svg');
  if (!svg) {
    return null;
  }

  const svgRect = svg?.getBoundingClientRect();
  // we can assume the visualization is in popout mode if the svg starts at 0,0
  const isPopout = svgRect.left == 0;
  const anchorRect = anchor.getBoundingClientRect();

  const top = isPopout
    ? anchorRect.top - svgRect.top + anchorRect.height + marginBetweenDialogAndAnchor
    : anchorRect.top + anchorRect.height + marginBetweenDialogAndAnchor;
  const bottom = isPopout
    ? svgRect.bottom - anchorRect.bottom + anchorRect.height + marginBetweenDialogAndAnchor
    : innerHeight - anchorRect.bottom + anchorRect.height + marginBetweenDialogAndAnchor;
  const left = isPopout ? anchorRect.left - svgRect.left : anchorRect.left;
  const right = isPopout ? 0 : innerWidth - anchorRect.right;

  const useLeftPositioning = isPopout ? left + detailDialogWidth <= svgRect.width : left + detailDialogWidth <= innerWidth;
  const maxHeightForTopPositioning = isPopout
    ? Math.min(svgRect.height - top, detailDialogDefaultHeight)
    : Math.min(innerHeight - top, detailDialogDefaultHeight);
  const maxHeightForBottomPositioning = isPopout
    ? Math.min(svgRect.height - bottom, detailDialogDefaultHeight)
    : Math.min(innerHeight - bottom, detailDialogDefaultHeight);
  const useTopPositioning = maxHeightForTopPositioning >= maxHeightForBottomPositioning;

  return (
    <div
      className={'card bg-base-100 shadow-xl rounded border-2 p-2 break-all'}
      style={{
        position: isPopout ? 'absolute' : 'fixed',
        top: useTopPositioning ? top : undefined,
        bottom: useTopPositioning ? undefined : bottom,
        left: useLeftPositioning ? left : undefined,
        right: useLeftPositioning ? undefined : right,

        maxHeight: useTopPositioning ? maxHeightForTopPositioning : maxHeightForBottomPositioning,
        width: detailDialogWidth,

        display: invisible ? 'none' : undefined,
        overflow: 'auto',
        zIndex: 1,
      }}>
      {(useTopPositioning && maxHeightForTopPositioning < 100) || (!useTopPositioning && maxHeightForBottomPositioning < 100) ? (
        <p>Dialog is too small to display content correctly.</p>
      ) : (
        children
      )}

      <div className={'card-actions justify-end mt-1'}>
        <button className={'btn btn-xs'} onClick={onClickClose}>
          Close
        </button>
      </div>
    </div>
  );
};

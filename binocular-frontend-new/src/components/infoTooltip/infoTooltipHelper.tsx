import React, { type RefObject } from 'react';
import { createRoot } from 'react-dom/client';

export interface infoTooltipContent {
  headline: string;
  textContent?: string;
  reactContent?: React.ReactNode;
  borderColor?: string;
}

export function showInfoTooltip(
  ref: RefObject<HTMLDivElement | null>,
  tooltipVisibleFlagRef: RefObject<boolean>,
  x: number,
  y: number,
  content: infoTooltipContent,
) {
  if (!ref.current) {
    return;
  }
  tooltipVisibleFlagRef.current = true;

  const tooltipContent = document.createElement('div');

  const contentElement = ref.current.querySelector('#infoTooltipContent') as HTMLDivElement;
  contentElement.innerHTML = '';
  if (content.headline) {
    const headline = document.createElement('h1');
    headline.innerText = content.headline;
    tooltipContent.appendChild(headline);
  }
  if (content.textContent) {
    const text = document.createElement('p');
    text.innerText = content.textContent;
    tooltipContent.appendChild(text);
  }

  if (content.reactContent) {
    const reactContent = document.createElement('div');

    const root = createRoot(reactContent);
    root.render(
      <div
        style={{ margin: '0' }}
        onMouseOver={() => {
          tooltipVisibleFlagRef.current = true;
        }}>
        {content.reactContent}
      </div>,
    );

    tooltipContent.appendChild(reactContent);
  }

  contentElement.appendChild(tooltipContent);
  contentElement.style.borderColor = content.borderColor ?? '';

  ref.current.style.display = 'block';
  const controllerElement = ref.current.querySelector('#infoTooltipPositionController') as HTMLDivElement;

  if (y >= controllerElement.ownerDocument.body.clientHeight / 2) {
    controllerElement.style.top = `auto`;
    controllerElement.style.bottom = `${controllerElement.ownerDocument.body.clientHeight - y - 10}px`;
  } else {
    controllerElement.style.top = `${y - 10}px`;
    controllerElement.style.bottom = `auto`;
  }
  if (x >= controllerElement.ownerDocument.body.clientWidth / 2) {
    controllerElement.style.left = `auto`;
    controllerElement.style.right = `${controllerElement.ownerDocument.body.clientWidth - x - 10}px`;
  } else {
    controllerElement.style.left = `${x - 10}px`;
    controllerElement.style.right = `auto`;
  }
}

export function hideInfoTooltip(ref: RefObject<HTMLDivElement | null>, tooltipVisibleFlagRef: RefObject<boolean>) {
  tooltipVisibleFlagRef.current = false;
  setTimeout(() => {
    if (ref.current && !tooltipVisibleFlagRef.current) {
      ref.current.style.display = 'none';
    }
  }, 500);
}

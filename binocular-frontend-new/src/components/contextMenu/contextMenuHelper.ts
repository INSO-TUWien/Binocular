import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

export interface ContextMenuOption {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>> | null;
  function: () => void;
}

export function showContextMenu(x: number, y: number, options: ContextMenuOption[]) {
  (document.getElementById('contextMenu') as HTMLDialogElement).showModal();
  if (y >= window.innerHeight / 2) {
    (document.getElementById('contextMenuPositionController') as HTMLDivElement).style.top = `auto`;
    (document.getElementById('contextMenuPositionController') as HTMLDivElement).style.bottom = `${window.innerHeight - y - 10}px`;
  } else {
    (document.getElementById('contextMenuPositionController') as HTMLDivElement).style.top = `${y - 10}px`;
    (document.getElementById('contextMenuPositionController') as HTMLDivElement).style.bottom = `auto`;
  }
  if (x >= window.innerWidth / 2) {
    (document.getElementById('contextMenuPositionController') as HTMLDivElement).style.left = `auto`;
    (document.getElementById('contextMenuPositionController') as HTMLDivElement).style.right = `${window.innerWidth - x - 10}px`;
  } else {
    (document.getElementById('contextMenuPositionController') as HTMLDivElement).style.left = `${x - 10}px`;
    (document.getElementById('contextMenuPositionController') as HTMLDivElement).style.right = `auto`;
  }

  const content = document.getElementById('contextMenuContent') as HTMLDivElement;
  content.innerHTML = '';
  content.style.padding = '';
  content.style.width = '';
  options.forEach((o) => {
    const optionLabel = document.createElement('span');
    optionLabel.textContent = o.label;

    const optionButton = document.createElement('span');
    optionButton.addEventListener('click', o.function);
    if (o.icon) {
      const iconWrapper = document.createElement('span');
      iconWrapper.style.cssText = 'width:1rem;height:1rem;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;';
      iconWrapper.innerHTML = renderToStaticMarkup(React.createElement(o.icon, { style: { width: '1rem', height: '1rem' } }));
      optionButton.appendChild(iconWrapper);
    }
    optionButton.appendChild(optionLabel);

    const option = document.createElement('li');
    option.appendChild(optionButton);

    content.appendChild(option);
  });
}

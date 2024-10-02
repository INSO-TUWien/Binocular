interface ContextMenuOption {
  label: string;
  icon: string | null;
  function: () => void;
}

export function showContextMenu(x: number, y: number, options: ContextMenuOption[]) {
  (document.getElementById('contextMenu') as HTMLDialogElement).showModal();
  (document.getElementById('contextMenuPositionController') as HTMLDivElement).style.top = `${y}px`;
  (document.getElementById('contextMenuPositionController') as HTMLDivElement).style.left = `${x}px`;

  (document.getElementById('contextMenuContent') as HTMLDivElement).innerHTML = '';
  options.forEach((o) => {
    const optionIcon = document.createElement('img');
    if (o.icon) {
      optionIcon.src = o.icon;
    }

    const optionLabel = document.createElement('span');
    optionLabel.textContent = o.label;

    const optionButton = document.createElement('a');
    optionButton.addEventListener('click', o.function);
    optionButton.appendChild(optionIcon);
    optionButton.appendChild(optionLabel);

    const option = document.createElement('li');
    option.appendChild(optionButton);

    (document.getElementById('contextMenuContent') as HTMLDivElement).appendChild(option);
  });
}

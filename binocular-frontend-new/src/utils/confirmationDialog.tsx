export interface ConfirmationDialogOptions {
  label: string;
  icon: string | null;
  function: () => void;
}
/**
 * shows a confirmation dropdown dialog with 2 options
 * please use similar widths to stay consistent current width used is 350px, feel free to add different widths if they differ a lot
 */
export function showConfirmationDialog(x: number, y: number, width: number, text: string, options: ConfirmationDialogOptions[]) {
  (document.getElementById('contextMenu') as HTMLDialogElement).showModal();
  (document.getElementById('contextMenuContent') as HTMLDivElement).innerHTML = '';

  const dialog = document.getElementById('contextMenu') as HTMLDialogElement;
  const container = document.getElementById('contextMenuPositionController') as HTMLDivElement;
  const content = document.getElementById('contextMenuContent') as HTMLDivElement;

  dialog.showModal();

  // Position logic
  container.style.top = y >= window.innerHeight / 2 ? 'auto' : `${y}px`;
  container.style.bottom = y >= window.innerHeight / 2 ? `${window.innerHeight - y}px` : 'auto';
  container.style.left = x >= window.innerWidth / 2 ? 'auto' : `${x}px`;
  container.style.right = x >= window.innerWidth / 2 ? `${window.innerWidth - x}px` : 'auto';
  content.innerHTML = '';

  // window with
  content.style.width = `${width}px`;

  const message = document.createElement('div');
  message.textContent = text;
  message.style.marginBottom = '1em';
  message.style.fontWeight = 'bold';
  message.style.textAlign = 'center';
  content.appendChild(message);

  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'center';
  buttonContainer.style.gap = '1em';

  // Button Yes
  const yesButton = document.createElement('button');
  yesButton.className = 'btn btn-sm btn-error';
  yesButton.onclick = options[0].function;
  yesButton.style.display = 'inline-flex';
  yesButton.style.alignItems = 'center';
  yesButton.style.gap = '0.5em';

  if (options[0].icon) {
    const yesIcon = document.createElement('img');
    yesIcon.src = options[0].icon;
    yesIcon.style.height = '1em';
    yesIcon.style.verticalAlign = 'middle';
    yesButton.appendChild(yesIcon);
  }

  const yesLabel = document.createElement('span');
  yesLabel.textContent = options[0].label;
  yesButton.appendChild(yesLabel);
  buttonContainer.appendChild(yesButton);

  // Button No
  const noButton = document.createElement('button');
  noButton.className = 'btn btn-sm btn-accent';
  noButton.onclick = options[1].function;
  noButton.style.display = 'inline-flex';
  noButton.style.alignItems = 'center';
  noButton.style.gap = '0.5em';

  if (options[1].icon) {
    const noIcon = document.createElement('img');
    noIcon.src = options[1].icon;
    noIcon.style.height = '1em';
    noIcon.style.verticalAlign = 'middle';
    noButton.appendChild(noIcon);
  }

  const noLabel = document.createElement('span');
  noLabel.textContent = options[1].label;
  noButton.appendChild(noLabel);
  buttonContainer.appendChild(noButton);

  content.appendChild(buttonContainer);
}

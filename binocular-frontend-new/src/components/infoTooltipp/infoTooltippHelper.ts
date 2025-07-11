export interface infoTooltippContent {
  headline: string;
  text: string;
}

export function showInfoTooltipp(x: number, y: number, content: infoTooltippContent) {
  (document.getElementById('infoTooltipp') as HTMLDialogElement).showModal();
  if (y >= window.innerHeight / 2) {
    (document.getElementById('infoTooltippPositionController') as HTMLDivElement).style.top = `auto`;
    (document.getElementById('infoTooltippPositionController') as HTMLDivElement).style.bottom = `${window.innerHeight - y - 10}px`;
  } else {
    (document.getElementById('infoTooltippPositionController') as HTMLDivElement).style.top = `${y - 10}px`;
    (document.getElementById('infoTooltippPositionController') as HTMLDivElement).style.bottom = `auto`;
  }
  if (x >= window.innerWidth / 2) {
    (document.getElementById('infoTooltippPositionController') as HTMLDivElement).style.left = `auto`;
    (document.getElementById('infoTooltippPositionController') as HTMLDivElement).style.right = `${window.innerWidth - x - 10}px`;
  } else {
    (document.getElementById('infoTooltippPositionController') as HTMLDivElement).style.left = `${x - 10}px`;
    (document.getElementById('infoTooltippPositionController') as HTMLDivElement).style.right = `auto`;
  }

  (document.getElementById('infoTooltippContent') as HTMLDivElement).innerHTML = '';
  const headline = document.createElement('h1');
  headline.innerText = content.headline;
  const text = document.createElement('p');
  text.innerText = content.text;
  (document.getElementById('infoTooltippContent') as HTMLDivElement).appendChild(headline);
  (document.getElementById('infoTooltippContent') as HTMLDivElement).appendChild(text);
}

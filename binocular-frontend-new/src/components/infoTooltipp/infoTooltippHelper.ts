import { type VisualizationPluginCompatibility } from '../../plugins/interfaces/visualizationPluginInterfaces/visualizationPluginMetadata';

export interface infoTooltippContent {
  headline: string;
  text: string;
}

export function showInfoTooltipp(x: number, y: number, content: infoTooltippContent, compatibilityInfo?: VisualizationPluginCompatibility) {
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
  const contentElement = document.getElementById('infoTooltippContent') as HTMLDivElement;
  contentElement.innerHTML = '';
  const headline = document.createElement('h1');
  headline.innerText = content.headline;
  const text = document.createElement('p');
  text.innerText = content.text;
  contentElement.appendChild(headline);
  contentElement.appendChild(text);
  if (compatibilityInfo) {
    const divider = document.createElement('div');
    divider.setAttribute('class', 'divider');
    contentElement.appendChild(divider);
    const text2 = document.createElement('h3');
    text2.innerText = 'Compatibility';
    const text3 = document.createElement('p');
    text3.innerText = 'GitHub: ' + compatibilityInfo.github + '\nGitLab: ' + compatibilityInfo.gitlab
    contentElement.appendChild(text2);
    contentElement.appendChild(text3);
  }
}

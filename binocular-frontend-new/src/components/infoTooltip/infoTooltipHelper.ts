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
    const compatibility = document.createElement('div');
    compatibility.innerHTML = `<h3>Compatibility</h3>
      <div id="compatibility">
        <div>
          <p><b>Datatypes</b></p>
          <p>GitHub: ${compatibilityInfo.github ? 'yes' : 'no'}<br>
          GitLab: ${compatibilityInfo.gitlab ? 'yes' : 'no'}</p>
        </div>
        <div>
          <p><b>Databases</b></p>
          <p>Binocular Backend: ${compatibilityInfo.binocularBackend ? 'yes' : 'no'}<br>
          PouchDB: ${compatibilityInfo.pouchDB ? 'yes' : 'no'}<br>
          Mock Data: ${compatibilityInfo.mockData ? 'yes' : 'no'}<br>
          GitHub API: ${compatibilityInfo.githubAPI ? 'yes' : 'no'}</p>
        </div>
      </div>`;
    contentElement.appendChild(compatibility);
  }
}

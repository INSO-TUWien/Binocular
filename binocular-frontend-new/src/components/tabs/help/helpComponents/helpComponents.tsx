import { visualizationPlugins } from '../../../../plugins/pluginRegistry.ts';
import { useState } from 'react';

function HelpComponents() {
  const [selectedComponent, setSelectedComponent] = useState<string>();
  const selectedVisualisationPlugin = visualizationPlugins.find((p) => p.name === selectedComponent);
  return (
    <div className={'h-4/5 overflow-x-hidden max-w-3xl'}>
      <h2>Components</h2>
      {selectedComponent
        ? selectedVisualisationPlugin && (
            <>
              <button className={'btn btn-xs mb-1 btn-outline'} onClick={() => setSelectedComponent(undefined)}>
                <svg
                  xmlns={'http://www.w3.org/2000/svg'}
                  className={'h-4 w-4'}
                  fill={'currentColor'}
                  viewBox={'0 -960 960 960'}
                  stroke={'currentColor'}>
                  <path
                    strokeLinecap={'round'}
                    strokeLinejoin={'round'}
                    strokeWidth={'2'}
                    d={'M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z'}
                  />
                </svg>
                back
              </button>
              <selectedVisualisationPlugin.helpComponent></selectedVisualisationPlugin.helpComponent>
            </>
          )
        : visualizationPlugins.map((p) => (
            <div key={`helpVisualization${p.name}`}>
              <button className={'btn btn-xs mb-1 btn-outline'} onClick={() => setSelectedComponent(p.name)}>
                {p.name}
              </button>
            </div>
          ))}
    </div>
  );
}

export default HelpComponents;

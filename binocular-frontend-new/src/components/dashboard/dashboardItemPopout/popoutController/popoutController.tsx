import { type ReactElement, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { throttle } from 'throttle-debounce';
import Config from '../../../../config.ts';

/**
 *  React Popout (https://github.com/JakeGinnivan/react-popout)
 *  ported to typescript and modern react lifecycles to fix bug with closing the window
 */

interface PropsType {
  title: string;
  onClosing: () => void;
  options: OptionsType;
  containerId?: string;
  containerClassName?: string;
  children: ReactElement;
  onError: () => void;
  onResize: () => void;
}

interface OptionsType {
  toolbar?: string;
  location?: string;
  directories?: string;
  status?: string;
  menubar?: string;
  scrollbars?: string;
  resizable?: string;
  width: number;
  height: number;
  top?: (o: OptionsType, w: Window) => number;
  left?: (o: OptionsType, w: Window) => number;
}

const DEFAULT_OPTIONS: OptionsType = {
  toolbar: 'no',
  location: 'no',
  directories: 'no',
  status: 'no',
  menubar: 'no',
  scrollbars: 'yes',
  resizable: 'yes',
  width: 500,
  height: 400,
  top: (o, w) => (w.innerHeight - o.height) / 2 + w.screenY,
  left: (o, w) => (w.innerWidth - o.width) / 2 + w.screenX,
};

export default function PopoutController(props: PropsType) {
  const [container, setContainer] = useState<HTMLDivElement>();
  const popoutWindow = useRef<Window>(null);

  const storedTheme = localStorage.getItem(`${Config.localStoragePrefix}theme`);
  const [theme] = useState(storedTheme || 'binocularLight');

  useEffect(() => {
    const newContainer: HTMLDivElement = document.createElement('div');
    newContainer.style.height = '100vh';
    newContainer.style.width = '100vw';
    newContainer.setAttribute('data-theme', theme);
    setContainer(newContainer);
  }, []);

  useEffect(() => {
    if (container) {
      popoutWindow.current = window.open('', props.title, createOptions());

      if (!popoutWindow.current) {
        props.onError();
        return;
      }

      popoutWindow.current.document.body.setAttribute('style', 'margin:0');
      popoutWindow.current.document.body.appendChild(container);
      popoutWindow.current.addEventListener('beforeunload', popoutWindowUnloading);
      popoutWindow.current.addEventListener('resize', throttledResize);
      // Trigger an initial resize after the container is in the popout window's DOM
      // so visualizations can measure their correct dimensions.
      setTimeout(() => props.onResize(), 0);

      const styleSheets = Array.from(document.styleSheets);
      styleSheets.forEach((styleSheet) => {
        try {
          if (styleSheet.href) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = styleSheet.href;
            popoutWindow.current?.document.head.appendChild(link);
          } else if (styleSheet.cssRules) {
            const style = document.createElement('style');
            Array.from(styleSheet.cssRules).forEach((rule) => {
              style.appendChild(document.createTextNode(rule.cssText));
            });
            popoutWindow.current?.document.head.appendChild(style);
          }
        } catch (e) {
          console.warn('Could not copy stylesheet:', e);
        }
      });

      const curWindow = popoutWindow.current;

      return () => curWindow?.close();
    }
  }, [container]);

  function popoutWindowUnloading() {
    if (container) {
      props.onClosing();
    }
  }

  function createOptions() {
    const mergedOptions = Object.assign({}, DEFAULT_OPTIONS, props.options);
    return Object.keys(mergedOptions)
      .map((key) => key + '=' + mergedOptions[key as keyof OptionsType])
      .join(',');
  }

  const throttledResize = throttle(
    1000,
    () => {
      props.onResize();
    },
    { noLeading: false, noTrailing: false },
  );

  return container && createPortal(props.children, container);
}

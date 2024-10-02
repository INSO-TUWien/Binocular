import { ReactElement, useEffect, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';

/**
 *  React Popout (https://github.com/JakeGinnivan/react-popout)
 *  ported to typescript and modern react lifecycles to fix bug with closing the window
 */

interface PropsType {
  title: string;
  url: string;
  onClosing: () => void;
  options: OptionsType;
  window?: Window;
  containerId?: string;
  containerClassName?: string;
  children: ReactElement;
  onError: () => void;
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
  const [popoutWindow, setPopoutWindow] = useState<Window>();
  const [container, setContainer] = useState<HTMLDivElement>();
  const [root, setRoot] = useState<Root>();

  let interval: number;
  useEffect(() => {
    const ownerWindow = props.window || window;

    // May not exist if server-side rendering
    if (ownerWindow) {
      openPopoutWindow(ownerWindow);

      // Close any open popouts when page unloads/refreshes
      ownerWindow.addEventListener('beforeunload', mainWindowClosed);
    }

    return () => {
      mainWindowClosed();
    };
  }, []);

  useEffect(() => {
    if (container) {
      renderToContainer(container, props.children);
    }
  }, [container, props.children]);

  useEffect(() => {
    if (popoutWindow === undefined) {
      return;
    }
    popoutWindow.document.title = props.title;
  }, [props]);

  useEffect(() => {
    if (popoutWindow) {
      popoutWindow.addEventListener('load', popoutWindowLoaded);
      popoutWindow.addEventListener('beforeunload', () => popoutWindowUnloading(container, root, props, interval));

      checkForPopoutWindowClosure();
    }
  }, [popoutWindow]);

  function openPopoutWindow(ownerWindow: Window) {
    const popoutWindow = ownerWindow.open(props.url, props.title, createOptions(ownerWindow));
    if (!popoutWindow) {
      props.onError();
      return;
    }
    setPopoutWindow(popoutWindow);
  }

  function createOptions(ownerWindow: Window) {
    const mergedOptions = Object.assign({}, DEFAULT_OPTIONS, props.options);

    return Object.keys(mergedOptions)
      .map((key) => {
        return (
          key +
          '=' +
          // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
          (key === 'top'
            ? (ownerWindow.innerHeight - mergedOptions.height) / 2 + ownerWindow.screenY
            : key === 'left'
              ? (ownerWindow.innerWidth - mergedOptions.width) / 2 + ownerWindow.screenX
              : mergedOptions[key as keyof OptionsType])
        );
      })
      .join(',');
  }

  function popoutWindowLoaded() {
    if (!container && popoutWindow) {
      // Popout window is passed from openPopoutWindow if no url is specified.
      // In this case this.state.popoutWindow will not yet be set, so use the argument.
      popoutWindow.document.title = props.title;
      const container = popoutWindow.document.createElement('div');
      container.id = props.containerId || '';
      container.className = props.containerClassName || '';
      container.style.width = '100%';
      container.style.height = '100%';
      popoutWindow.document.body.appendChild(container);

      setContainer(container);
      renderToContainer(container, props.children);
    }
  }

  /**
   * Use if a URL was passed to the popout window. Checks every 500ms if the window has been closed.
   * Calls the onClosing() prop if the window is closed.
   *
   * @param popoutWindow
   */
  function checkForPopoutWindowClosure() {
    interval = setInterval(() => {
      if (popoutWindow && popoutWindow.closed) {
        clearInterval(interval);
        props.onClosing();
      }
    }, 500);
  }

  function mainWindowClosed() {
    popoutWindow && popoutWindow.close();
    (props.window || window).removeEventListener('beforeunload', mainWindowClosed);
  }

  function popoutWindowUnloading(container: HTMLDivElement | undefined, root: Root | undefined, props: PropsType, interval: number) {
    if (container) {
      clearInterval(interval);
      if (root) {
        root.unmount();
      }
      props.onClosing();
    }
  }

  function renderToContainer(container: HTMLDivElement, children: React.ReactElement) {
    // For SSR we might get updated but there will be no container.
    if (container) {
      if (!root) {
        setRoot(createRoot(container));
      } else {
        root.render(children);
      }
    }
  }

  return null;
}

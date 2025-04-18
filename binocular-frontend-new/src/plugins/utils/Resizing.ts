import { Store } from '@reduxjs/toolkit';
import { throttle } from 'throttle-debounce';

export function handelPopoutResizing(store: Store, fn: () => void) {
  /**
   * Throttle the resize of the svg (refresh rate) to every 1s to not overwhelm the renderer,
   * This isn't really necessary for this visualization, but for bigger visualization this can be quite essential
   */
  const throttledResize = throttle(1000, fn, { noLeading: false, noTrailing: false });

  store.subscribe(() => {
    if (store !== undefined) {
      if (store.getState().actions.lastAction === 'RESIZE') {
        throttledResize();
      }
    }
  });
}

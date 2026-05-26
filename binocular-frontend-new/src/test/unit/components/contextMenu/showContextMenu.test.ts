import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { showContextMenu } from '../../../../components/contextMenu/contextMenuHelper';
import type { ContextMenuOption } from '../../../../components/contextMenu/contextMenuHelper';

const W = 1000;
const H = 800;

beforeEach(() => {
  document.body.innerHTML = `
    <dialog id="contextMenu"></dialog>
    <div id="contextMenuPositionController" style=""></div>
    <ul id="contextMenuContent"></ul>
  `;
  HTMLDialogElement.prototype.showModal = vi.fn();
  Object.defineProperty(window, 'innerWidth', { value: W, writable: true, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: H, writable: true, configurable: true });
});

function getController() {
  return document.getElementById('contextMenuPositionController') as HTMLDivElement;
}

function getContent() {
  return document.getElementById('contextMenuContent') as HTMLElement;
}

describe('showContextMenu – vertical positioning', () => {
  it('U31.1 y < innerHeight/2 → top is set, bottom is auto', () => {
    showContextMenu(100, 100, []);
    const ctrl = getController();
    expect(ctrl.style.top).toBe('90px');
    expect(ctrl.style.bottom).toBe('auto');
  });

  it('U31.2 y >= innerHeight/2 → bottom is set, top is auto', () => {
    showContextMenu(100, 600, []);
    const ctrl = getController();
    expect(ctrl.style.bottom).toBe(`${H - 600 - 10}px`);
    expect(ctrl.style.top).toBe('auto');
  });
});

describe('showContextMenu – horizontal positioning', () => {
  it('U31.3 x < innerWidth/2 → left is set, right is auto', () => {
    showContextMenu(200, 100, []);
    const ctrl = getController();
    expect(ctrl.style.left).toBe('190px');
    expect(ctrl.style.right).toBe('auto');
  });

  it('U31.4 x >= innerWidth/2 → right is set, left is auto', () => {
    showContextMenu(700, 100, []);
    const ctrl = getController();
    expect(ctrl.style.right).toBe(`${W - 700 - 10}px`);
    expect(ctrl.style.left).toBe('auto');
  });
});

describe('showContextMenu – menu item rendering', () => {
  it('U31.5 creates one <li> per option', () => {
    const options: ContextMenuOption[] = [
      { label: 'A', icon: null, function: vi.fn() },
      { label: 'B', icon: null, function: vi.fn() },
      { label: 'C', icon: null, function: vi.fn() },
    ];
    showContextMenu(100, 100, options);
    expect(getContent().querySelectorAll('li')).toHaveLength(3);
  });

  it('U31.6 sets option label text correctly', () => {
    const options: ContextMenuOption[] = [{ label: 'Delete', icon: null, function: vi.fn() }];
    showContextMenu(100, 100, options);

    // second span inside the button span is the label
    const spans = getContent().querySelectorAll('span span');
    expect(spans[0].textContent).toBe('Delete');
  });

  it('U31.7 renders icon SVG when icon component is provided', () => {
    const TrashIcon = () => React.createElement('svg', { 'data-icon': 'trash' });
    const options: ContextMenuOption[] = [{ label: 'Delete', icon: TrashIcon, function: vi.fn() }];
    showContextMenu(100, 100, options);
    expect(getContent().querySelector('svg')).not.toBeNull();
  });

  it('U31.8 does not render an icon when icon is null', () => {
    const options: ContextMenuOption[] = [{ label: 'Delete', icon: null, function: vi.fn() }];
    showContextMenu(100, 100, options);
    expect(getContent().querySelector('svg')).toBeNull();
  });

  it('U31.9 clicking option span invokes the option function', () => {
    const fn = vi.fn();
    const options: ContextMenuOption[] = [{ label: 'Click me', icon: null, function: fn }];
    showContextMenu(100, 100, options);
    const clickTarget = getContent().querySelector('li span') as HTMLElement;
    clickTarget.click();
    expect(fn).toHaveBeenCalledOnce();
  });

  it('U31.10 calls showModal() on the dialog', () => {
    showContextMenu(100, 100, []);
    const dialog = document.getElementById('contextMenu') as HTMLDialogElement;
    expect(dialog.showModal).toHaveBeenCalledOnce();
  });
});

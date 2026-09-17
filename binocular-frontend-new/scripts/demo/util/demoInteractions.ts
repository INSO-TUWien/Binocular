// Human-paced Playwright interaction primitives for scripted demo-video recordings — not correctness testing.

import type { Locator, Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

// beat() logs the real wall-clock offset since module load. dumpBeatLog() persists it, but narrate.mjs no longer reads it —
// cues are placed sequentially with a fixed gap instead (see README.md's Timing model). demo:record shares one process across
// tests — call resetBeatClock() at each test's start.
let beatClockStart: number | null = null;
let beatLog: { index: number; tMs: number; ms: number }[] = [];

// Call at the very start of each test, before any beat() call.
export function resetBeatClock(): void {
  beatClockStart = null;
  beatLog = [];
}

// Named wait, holds the current frame long enough for a viewer to read it.
export function beat(page: Page, ms = 1200): Promise<void> {
  if (beatClockStart === null) beatClockStart = Date.now();
  beatLog.push({ index: beatLog.length, tMs: Date.now() - beatClockStart, ms });
  return page.waitForTimeout(ms);
}

// Call once at the very end of a test to persist the real timings captured above.
export function dumpBeatLog(categorySlug: string): void {
  const dir = path.resolve('demo-output/cue-timing');
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, `${categorySlug}.json`), JSON.stringify(beatLog, null, 2), 'utf-8');
}

// Intermediate steps so the cursor animates smoothly and drag/resize handlers reading movementX/Y get realistic deltas instead of one jump.
export async function humanMove(page: Page, x: number, y: number, steps = 25): Promise<void> {
  await page.mouse.move(x, y, { steps });
}

export async function humanClick(page: Page, x: number, y: number): Promise<void> {
  await humanMove(page, x, y);
  await page.mouse.down();
  await page.waitForTimeout(80);
  await page.mouse.up();
}

// A preceding settings change can trigger a re-render that detaches the element before boundingBox() runs — retry briefly to ride it out.
async function boundingBoxWithRetry(locator: Locator, attempts = 5, delayMs = 200) {
  for (let i = 0; i < attempts; i++) {
    const box = await locator.boundingBox();
    if (box) return box;
    if (i < attempts - 1) await locator.page().waitForTimeout(delayMs);
  }
  return null;
}

// Clicks the locator's visual center via real mouse movement so the synthetic cursor animates to it on camera.
export async function humanClickLocator(page: Page, locator: Locator): Promise<void> {
  const box = await boundingBoxWithRetry(locator);
  if (!box) throw new Error('humanClickLocator: locator has no bounding box (not visible/attached)');
  await humanClick(page, box.x + box.width / 2, box.y + box.height / 2);
}

// Dismisses a sub-window by clicking the button that opened it. Its backdrop is pointer-events:none, so clicking the grid instead
// would fall through to the chart — and some plugins act on that (networkChart opens a URL on node click).
export async function closeSubWindow(page: Page, panel: Locator): Promise<void> {
  if (!(await panel.isVisible())) return;
  const panelId = (await panel.getAttribute('id')) ?? '';
  const [itemId, kind] = panelId.split(/_(?=settings$|help$)/);
  const button = page.locator(`#${itemId} [class*="${kind === 'help' ? 'helpButton' : 'settingsButton'}"]`);
  await humanClickLocator(page, button);
  await panel.waitFor({ state: 'hidden', timeout: 5_000 });
}

export async function humanHoverLocator(page: Page, locator: Locator, steps?: number): Promise<void> {
  const box = await boundingBoxWithRetry(locator);
  if (!box) throw new Error('humanHoverLocator: locator has no bounding box (not visible/attached)');
  await humanMove(page, box.x + box.width / 2, box.y + box.height / 2, steps);
}

// Opens a dashboard item's settings sub-window; the button toggles, so it is only clicked when the panel is actually closed.
export async function openItemSettings(page: Page, item: Locator, panel: Locator): Promise<void> {
  if (!(await panel.isVisible())) {
    await humanClickLocator(page, item.locator('[class*="settingsButton"]'));
  }
  await panel.waitFor({ state: 'visible', timeout: 10_000 });
}

// Every settings.tsx wraps one control per <label> with a text sibling; `:visible` skips the closed panel's dormant duplicate controls.
export function settingsControl(container: Locator, labelText: string): Locator {
  return container.locator('label', { hasText: labelText }).locator('select:visible, input:visible');
}

// Keeps Visualizations/Authors open throughout every category video; idempotent (checks tabHandleSelected*) so it's safe to call again on every plugin swap.
export async function openTabIfClosed(page: Page, tabName: string): Promise<void> {
  const tab = page.locator(`#tab_${tabName}`);
  const cls = (await tab.getAttribute('class')) ?? '';
  if (!cls.includes('tabHandleSelected')) {
    await humanClickLocator(page, tab);
  }
}

// Native <select> option lists render via the OS and aren't captured on camera, so just hover for the visual before driving it with selectOption().
export async function humanSelectOption(page: Page, select: Locator, value: string | { index: number } | { label: string }): Promise<void> {
  await humanHoverLocator(page, select);
  await page.waitForTimeout(150);
  await select.selectOption(value);
}

// Clicks the input, clears it, and types the new value with per-character delay so it's visible in the recording.
export async function humanFill(page: Page, input: Locator, value: string): Promise<void> {
  await humanClickLocator(page, input);
  await input.fill('');
  await input.pressSequentially(value, { delay: 60 });
}

// Mirrors screenshots.test.ts's wait logic: each VISUALIZATIONS entry declares exactly one of these three readiness signals.
export async function waitForVisReady(
  item: Locator,
  opts: { waitFor?: string; waitForText?: string; waitForHidden?: string },
): Promise<void> {
  if (opts.waitFor) {
    await item.locator(opts.waitFor).first().waitFor({ state: 'visible', timeout: 20_000 });
  } else if (opts.waitForText) {
    await item.getByText(opts.waitForText).first().waitFor({ state: 'visible', timeout: 20_000 });
  } else if (opts.waitForHidden) {
    await item.getByText(opts.waitForHidden).first().waitFor({ state: 'hidden', timeout: 20_000 });
  }
}

export async function humanDrag(
  page: Page,
  from: { x: number; y: number },
  to: { x: number; y: number },
  intermediateSteps = 6,
): Promise<void> {
  await humanMove(page, from.x, from.y);
  await page.mouse.down();
  for (let i = 1; i <= intermediateSteps; i++) {
    const t = i / intermediateSteps;
    await humanMove(page, from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t, 8);
    await page.waitForTimeout(40);
  }
  await page.waitForTimeout(60);
  await page.mouse.up();
}

// Waits until a locator's bounding box stops moving — e.g. Collaboration's networkChart nodes keep drifting after a resize-triggered reheat.
export async function waitForLocatorStable(locator: Locator, tries = 30, intervalMs = 200): Promise<void> {
  let previous: { x: number; y: number } | null = null;
  for (let i = 0; i < tries; i++) {
    const box = await locator.boundingBox();
    if (box && previous && Math.abs(box.x - previous.x) < 1 && Math.abs(box.y - previous.y) < 1) return;
    previous = box ? { x: box.x, y: box.y } : null;
    await locator.page().waitForTimeout(intervalMs);
  }
}

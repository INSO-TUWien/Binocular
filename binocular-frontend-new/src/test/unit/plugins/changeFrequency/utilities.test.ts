import { describe, it, expect } from 'vitest';
import { colorGradient, escapeHtml } from '../../../../plugins/visualizationPlugins/changeFrequency/src/utilities/utilities';

describe('colorGradient', () => {
  it('returns the neutral gray when there are no changes', () => {
    expect(colorGradient(0, 0)).toBe('#a0a0a0');
  });

  it('returns the pure-deletion and pure-addition endpoints', () => {
    expect(colorGradient(0, 10).toLowerCase()).toBe('rgb(255, 26, 26)'); // red
    expect(colorGradient(10, 0).toLowerCase()).toBe('rgb(46, 204, 64)'); // green
  });

  it('returns the midpoint yellow for a balanced ratio', () => {
    expect(colorGradient(5, 5).toLowerCase()).toBe('rgb(255, 204, 0)'); // yellow
  });
});

describe('escapeHtml', () => {
  it('escapes characters that would break or inject markup', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
    expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(escapeHtml(`"quoted" & 'apostrophe'`)).toBe('&quot;quoted&quot; &amp; &#39;apostrophe&#39;');
  });

  it('leaves ordinary paths and signatures untouched', () => {
    expect(escapeHtml('src/components/chart.tsx')).toBe('src/components/chart.tsx');
  });
});

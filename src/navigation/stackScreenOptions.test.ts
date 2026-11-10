import { describe, it, expect } from 'vitest';
import { getStackScreenOptions } from './stackScreenOptions';

describe('getStackScreenOptions', () => {
  it('serene=false tiene headerStyle', () => {
    const opts = getStackScreenOptions(false) as { headerStyle: { backgroundColor: string } };
    expect(opts.headerStyle.backgroundColor).toBeTruthy();
  });

  it('serene=true tiene headerShadowVisible false', () => {
    const opts = getStackScreenOptions(true) as { headerShadowVisible: boolean };
    expect(opts.headerShadowVisible).toBe(false);
  });
});

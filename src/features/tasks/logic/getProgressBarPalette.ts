export type ProgressBarPaletteTone = 'default' | 'onDark';

export type ProgressBarPalette = {
  done: string;
  current: string;
  pending: string;
  track: string;
  fill: string;
};

export function getProgressBarPalette(tone: ProgressBarPaletteTone): ProgressBarPalette {
  if (tone === 'onDark') {
    return {
      done: 'on-primary-container',
      current: 'on-primary',
      pending: 'primary',
      track: 'primary',
      fill: 'on-primary',
    };
  }
  return {
    done: 'primary-container',
    current: 'secondary-container',
    pending: 'surface-container-high',
    track: 'surface-container-high',
    fill: 'primary-container',
  };
}
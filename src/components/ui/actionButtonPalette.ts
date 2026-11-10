export type ActionButtonVariant = 'primary' | 'secondary';

export type ActionButtonPalette = {
  background: string;
  content: string;
};

export function getActionButtonPalette(variant: ActionButtonVariant): ActionButtonPalette {
  if (variant === 'secondary') {
    return { background: 'on-secondary-container', content: 'on-primary' };
  }
  return { background: 'primary-container', content: 'on-primary' };
}
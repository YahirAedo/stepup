import { sereneColors } from '../theme/serene/colors';
import { sereneTypography } from '../theme/serene/typography';

export const sereneStackScreenOptions = {
  headerStyle: { backgroundColor: sereneColors.surface },
  headerTintColor: sereneColors['on-surface'],
  headerShadowVisible: false,
  headerTitleAlign: 'left' as const,
  headerTitleStyle: {
    fontFamily: sereneTypography['title-md'].fontFamily,
    fontSize: sereneTypography['title-md'].fontSize,
    fontWeight: sereneTypography['title-md'].fontWeight,
  },
};

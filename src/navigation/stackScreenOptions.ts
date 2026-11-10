import { zenithStackScreenOptions } from './zenithStackScreenOptions';
import { sereneStackScreenOptions } from './sereneStackScreenOptions';

export function getStackScreenOptions(serene: boolean) {
  return serene ? sereneStackScreenOptions : zenithStackScreenOptions;
}

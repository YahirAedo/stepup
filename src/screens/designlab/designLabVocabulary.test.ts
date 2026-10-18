import { describe, it, expect } from 'vitest';
import * as flujoA from './tareasFlujoAFixtures';
import * as focus from './focusFixtures';
import * as perfil from './perfilFixtures';
import * as logros from './logrosAFixtures';
import * as conflictos from './conflictosAFixtures';
import * as sereneTabs from './sereneTabsFixtures';

/**
 * Guarda de tono del rediseno: ningun texto VISIBLE de los fixtures del flujo
 * redisenado (Tareas A, Focus, Perfil A + logros y conflictos) puede contener
 * las palabras prohibidas.
 *
 * Las variantes B y C ya no existen en el repo; quedan fuera del escaneo.
 */

const FORBIDDEN_WORDS = [
  'consciente',
  'sereno',
  'serena',
  'calma',
  'respiro',
  'mente',
  'resistencia',
  'ritual',
  'mindful',
  'friccion',
  'abrumamiento',
];

const FORBIDDEN_PHRASES = ['sin prisa', 'micro-paso', 'micropaso'];

const NON_TEXT_KEYS = new Set(['icon', 'imageUrl', 'url', 'id', 'key', 'variant', 'image']);

function stripDiacritics(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function collectStrings(value: unknown, parentKey: string | null, out: string[]): void {
  if (typeof value === 'string') {
    if (parentKey && NON_TEXT_KEYS.has(parentKey)) return;
    if (/^https?:\/\//i.test(value)) return;
    out.push(value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectStrings(item, parentKey, out));
    return;
  }
  if (value && typeof value === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([key, nested]) => {
      collectStrings(nested, key, out);
    });
  }
}

function collectAllTexts(modules: Array<Record<string, unknown>>): Array<{ text: string; origin: string }> {
  const found: Array<{ text: string; origin: string }> = [];
  modules.forEach((mod) => {
    Object.entries(mod).forEach(([exportName, value]) => {
      const strings: string[] = [];
      collectStrings(value, null, strings);
      strings.forEach((text) => found.push({ text, origin: exportName }));
    });
  });
  return found;
}

describe('vocabulario prohibido en los fixtures del Design Lab', () => {
  const allTexts = collectAllTexts([flujoA, focus, perfil, logros, conflictos, sereneTabs]);

  it('recolecta textos de los fixtures', () => {
    expect(allTexts.length).toBeGreaterThan(0);
  });

  it('no contiene palabras prohibidas', () => {
    const violations: string[] = [];
    allTexts.forEach(({ text, origin }) => {
      const normalized = stripDiacritics(text.toLowerCase());
      const tokens = normalized.split(/[^a-z]+/).filter(Boolean);
      tokens.forEach((token) => {
        if (FORBIDDEN_WORDS.includes(token)) {
          violations.push(`"${token}" en ${origin}: "${text}"`);
        }
      });
      FORBIDDEN_PHRASES.forEach((phrase) => {
        if (normalized.includes(phrase)) {
          violations.push(`"${phrase}" en ${origin}: "${text}"`);
        }
      });
    });
    expect(violations).toEqual([]);
  });
});

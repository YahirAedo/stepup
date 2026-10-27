import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, type Dirent } from 'node:fs';
import { join, resolve } from 'node:path';
import * as flujoA from './tareasFlujoAFixtures';
import * as focus from './focusFixtures';
import * as perfil from './perfilFixtures';
import * as logros from './logrosAFixtures';
import * as conflictos from './conflictosAFixtures';
import * as sereneTabs from './sereneTabsFixtures';
import * as onboarding from './onboardingAFixtures';
import * as auth from './authAFixtures';

/**
 * Guarda de tono del rediseno (Design Lab).
 *
 * Hay dos capas:
 *  1. Datos: ningun texto VISIBLE de los fixtures (Tareas A, Focus, Perfil A +
 *     logros y conflictos) puede contener las palabras prohibidas.
 *  2. Codigo fuente: ningun literal/JSX de `src/screens/designlab` ni
 *     `src/components/designlab` puede contener las palabras prohibidas. Los
 *     comentarios se ignoran (son documentacion, no copy visible).
 *
 * Las variantes B y C ya no existen en el repo; quedan fuera del escaneo.
 */

const FORBIDDEN_WORDS = [
  'consciente',
  'sereno',
  'serena',
  'calma',
  'calmo',
  'respiro',
  'respiracion',
  'mente',
  'resistencia',
  'ritual',
  'mindful',
  'friccion',
  'abrumamiento',
];

const FORBIDDEN_PHRASES = ['sin prisa', 'micro-paso', 'micropaso', 'anti-abrumamiento'];

const NON_TEXT_KEYS = new Set(['icon', 'imageUrl', 'url', 'id', 'key', 'variant', 'image']);

/** Raices del codigo fuente del Design Lab, relativas a la raiz del repo. */
const SOURCE_ROOTS = ['src/screens/designlab', 'src/components/designlab'];

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

function findViolations(text: string): string[] {
  const normalized = stripDiacritics(text.toLowerCase());
  const hits: string[] = [];
  const tokens = normalized.split(/[^a-z]+/).filter(Boolean);
  const tokenSet = new Set(tokens);
  FORBIDDEN_WORDS.forEach((word) => {
    if (tokenSet.has(word)) hits.push(word);
  });
  FORBIDDEN_PHRASES.forEach((phrase) => {
    if (normalized.includes(phrase)) hits.push(phrase);
  });
  return hits;
}

function walkSourceFiles(dir: string, out: string[]): void {
  let entries: Dirent<string>[];
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  entries.forEach((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkSourceFiles(full, out);
      return;
    }
    const isSource = /\.tsx?$/.test(entry.name);
    const isTest = /\.test\.tsx?$/.test(entry.name);
    if (isSource && !isTest) out.push(full);
  });
}

/** Saca comentarios de bloque y de linea (evita los `://` de URLs). */
function stripComments(source: string): string {
  const withoutBlock = source.replace(/\/\*[\s\S]*?\*\//g, ' ');
  return withoutBlock.replace(/(^|[^:])\/\/[^\n]*/gm, '$1');
}

describe('vocabulario prohibido en los fixtures del Design Lab', () => {
  const allTexts = collectAllTexts([flujoA, focus, perfil, logros, conflictos, sereneTabs, onboarding, auth]);

  it('recolecta textos de los fixtures', () => {
    expect(allTexts.length).toBeGreaterThan(0);
  });

  it('no contiene palabras prohibidas', () => {
    const violations: string[] = [];
    allTexts.forEach(({ text, origin }) => {
      findViolations(text).forEach((hit) => {
        violations.push(`"${hit}" en ${origin}: "${text}"`);
      });
    });
    expect(violations).toEqual([]);
  });
});

describe('vocabulario prohibido en el codigo fuente del Design Lab', () => {
  const rootDir = process.cwd();
  const files: string[] = [];
  SOURCE_ROOTS.forEach((root) => walkSourceFiles(resolve(rootDir, root), files));

  it('encuentra archivos del Design Lab para escanear', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it('no contiene palabras ni frases prohibidas en literales ni JSX', () => {
    const violations: string[] = [];
    files.forEach((file) => {
      const code = stripComments(readFileSync(file, 'utf8'));
      findViolations(code).forEach((hit) => {
        violations.push(`"${hit}" en ${file.replace(rootDir, '').replace(/\\/g, '/')}`);
      });
    });
    expect(violations).toEqual([]);
  });
});

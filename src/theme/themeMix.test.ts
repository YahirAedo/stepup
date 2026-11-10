import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, type Dirent } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';

/**
 * Una pantalla importa el theme de produccion (Zenith) o el rediseno (Serene),
 * nunca los dos. Mezclar los dos en el mismo archivo deja tokens de dos sistemas
 * visuales en una sola pantalla y rompe la migracion pantalla por pantalla.
 *
 * Neutrales: `src/theme/layout.ts` (medidas de la barra y el FAB) y
 * `src/theme/responsive.ts` (escala). No tienen tokens visuales y se permiten en
 * ambos lados.
 */
const NEUTRAL_MODULES = ['layout', 'responsive'];

/**
 * Excepciones justificadas: ruta relativa a `src/` con la razon al lado.
 * Vacia a proposito. Cada entrada necesita su razon; si no la tiene, se corrige
 * el import en vez de agregarla aca.
 */
const ALLOWED_MIXED: Record<string, string> = {};

const SRC_DIR = resolve(process.cwd(), 'src');
const THEME_DIR = join(SRC_DIR, 'theme');

type ThemeFamily = 'zenith' | 'serene';

const IMPORT_RE = /(?:from\s+|require\(\s*)['"]([^'"]+)['"]/g;

/** Especificadores relativos del archivo (los de paquete no pueden ser del theme). */
function collectRelativeImports(source: string): string[] {
  const specs: string[] = [];
  IMPORT_RE.lastIndex = 0;
  let match: RegExpExecArray | null = IMPORT_RE.exec(source);
  while (match !== null) {
    if (match[1].startsWith('.')) specs.push(match[1]);
    match = IMPORT_RE.exec(source);
  }
  return specs;
}

/** 'zenith' | 'serene' si el especificador resuelve dentro de `src/theme`; null si no. */
function classify(spec: string, file: string): ThemeFamily | null {
  const target = resolve(dirname(file), spec);
  const rel = relative(THEME_DIR, target);
  if (rel === '') return 'zenith'; // el barrel `src/theme` es Zenith
  const segments = rel.split(sep);
  if (segments[0] === '..') return null;
  if (segments[0] === 'serene') return 'serene';
  if (NEUTRAL_MODULES.includes(rel.replace(/\.tsx?$/, ''))) return null;
  return 'zenith';
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
      if (full === THEME_DIR) return; // el theme no se escanea a si mismo
      walkSourceFiles(full, out);
      return;
    }
    if (!/\.tsx?$/.test(entry.name)) return;
    if (/\.test\.tsx?$/.test(entry.name)) return;
    out.push(full);
  });
}

describe('un archivo no mezcla los dos themes', () => {
  const files: string[] = [];
  walkSourceFiles(SRC_DIR, files);

  it('encuentra archivos para escanear', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it('no hay ningun archivo que importe Zenith y Serene a la vez', () => {
    const mixed: string[] = [];
    let zenithCount = 0;
    let sereneCount = 0;

    files.forEach((file) => {
      const families = new Set<ThemeFamily>();
      collectRelativeImports(readFileSync(file, 'utf8')).forEach((spec) => {
        const family = classify(spec, file);
        if (family !== null) families.add(family);
      });

      if (families.has('zenith')) zenithCount += 1;
      if (families.has('serene')) sereneCount += 1;

      const rel = relative(SRC_DIR, file).split(sep).join('/');
      if (families.size === 2 && !(rel in ALLOWED_MIXED)) mixed.push(rel);
    });

    // Autochequeo: si el clasificador dejara de detectar un theme, el test
    // pasaria en falso porque `mixed` quedaria vacio.
    expect(zenithCount).toBeGreaterThan(0);
    expect(sereneCount).toBeGreaterThan(0);
    expect(mixed).toEqual([]);
  });
});

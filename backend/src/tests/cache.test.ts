import { ResponseCache } from '../services/cache';

describe('ResponseCache', () => {
  it('debe retornar undefined para clave no existente', () => {
    const cache = new ResponseCache<string>(60, 10);
    expect(cache.get('nonexistent')).toBeUndefined();
  });

  it('debe almacenar y recuperar valores', () => {
    const cache = new ResponseCache<string>(60, 10);
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('debe expirar valores después del TTL', async () => {
    const cache = new ResponseCache<string>(1, 10); // 1 segundo TTL
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
    
    await new Promise((resolve) => setTimeout(resolve, 1100));
    expect(cache.get('key1')).toBeUndefined();
  });

  it('debe respetar el tamaño máximo (LRU)', () => {
    const cache = new ResponseCache<string>(60, 3);
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');
    
    // Todos deben estar presentes
    expect(cache.get('key1')).toBe('value1');
    expect(cache.get('key2')).toBe('value2');
    expect(cache.get('key3')).toBe('value3');
    
    // Agregar un cuarto elemento debe evictar el menos recientemente usado (key1)
    cache.set('key4', 'value4');
    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key4')).toBe('value4');
  });

  it('debe permitir limpiar el cache', () => {
    const cache = new ResponseCache<string>(60, 10);
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    
    cache.clear();
    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBeUndefined();
  });

  it('debe reportar el tamaño actual', () => {
    const cache = new ResponseCache<string>(60, 10);
    expect(cache.size).toBe(0);
    
    cache.set('key1', 'value1');
    expect(cache.size).toBe(1);
    
    cache.set('key2', 'value2');
    expect(cache.size).toBe(2);
    
    cache.clear();
    expect(cache.size).toBe(0);
  });
});

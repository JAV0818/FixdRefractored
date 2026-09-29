// mapWithLimit — like Promise.all(items.map(fn)) but runs at most `limit` calls
// at once, so a big batch (e.g. 12 photos) doesn't spike memory. Keeps result
// order and rejects on the first failure, same as Promise.all.

export const mapWithLimit = async <T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> => {
  const results: R[] = new Array(items.length);
  let next = 0;

  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index], index);
    }
  };

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
};

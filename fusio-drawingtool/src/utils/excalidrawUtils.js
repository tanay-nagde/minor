/* -------------------------------------
   Debounce utility
-------------------------------------- */
export const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export function mergeElements(localElements, incomingElements) {
  const merged = new Map();

  // Map all local elements by ID
  for (const el of localElements) {
    merged.set(el.id, el);
  }

  // Merge incoming elements
  for (const incoming of incomingElements) {
    const existing = merged.get(incoming.id);

    if (!existing) {
      merged.set(incoming.id, incoming);
    } else if (incoming.version > existing.version) {
      merged.set(incoming.id, incoming);
    } else if (
      incoming.version === existing.version &&
      incoming.versionNonce !== existing.versionNonce
    ) {
      // Conflict resolution: pick higher versionNonce
      if (incoming.versionNonce > existing.versionNonce) {
        merged.set(incoming.id, incoming);
      }
    }
    // Else: keep existing
  }

  return Array.from(merged.values());
}
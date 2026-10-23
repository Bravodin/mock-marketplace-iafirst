const PREFIX = 'loja:';

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* ignora */
  }
}

export function clearAll() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignora */
  }
}

/** Latência simulada das chamadas mock (ms). Padrão 600; ?delay=0 desliga. */
export function getDelay() {
  return load('delay', 600);
}

export function applyUrlFlags() {
  const url = new URL(window.location.href);
  let changed = false;
  if (url.searchParams.get('reset') === '1') {
    clearAll();
    url.searchParams.delete('reset');
    changed = true;
  }
  const delay = url.searchParams.get('delay');
  if (delay !== null && !Number.isNaN(Number(delay))) {
    save('delay', Math.max(0, Number(delay)));
    url.searchParams.delete('delay');
    changed = true;
  }
  if (changed) window.history.replaceState(null, '', url.pathname + url.search);
}

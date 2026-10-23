// Roteador mínimo baseado na History API (sem dependências externas).
import { useEffect, useSyncExternalStore } from 'react';

const listeners = new Set();

function subscribe(cb) {
  listeners.add(cb);
  window.addEventListener('popstate', cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('popstate', cb);
  };
}

const getSnapshot = () => window.location.pathname + window.location.search;

export function navigate(to, { replace = false } = {}) {
  if (replace) window.history.replaceState(null, '', to);
  else window.history.pushState(null, '', to);
  listeners.forEach((l) => l());
  window.scrollTo(0, 0);
}

export function useLocation() {
  const full = useSyncExternalStore(subscribe, getSnapshot);
  const url = new URL(full, window.location.origin);
  return { pathname: url.pathname, search: url.search, query: url.searchParams };
}

export function matchRoute(pattern, pathname) {
  const p = pattern.split('/').filter(Boolean);
  const s = pathname.split('/').filter(Boolean);
  if (p.length !== s.length) return null;
  const params = {};
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(':')) params[p[i].slice(1)] = decodeURIComponent(s[i]);
    else if (p[i] !== s[i]) return null;
  }
  return params;
}

export function Link({ to, children, onClick, ...rest }) {
  return (
    <a
      href={to}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        navigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

export function Redirect({ to }) {
  useEffect(() => navigate(to, { replace: true }), [to]);
  return null;
}

import { supabase } from './supabase.js';

let initialized = false;
let reporting = false;
let lastErrorKey = '';

function clean(value, max = 4000) {
  return String(value ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').slice(0, max);
}
function pageName() {
  return (window.location.pathname.split('/').pop() || 'app') + (window.location.hash || '');
}
function errorKey(message, page) {
  return clean(message, 180) + '|' + page;
}

export async function submitAppErrorReport(error, extraContext = '') {
  if (reporting) return { ok: false, skipped: true };
  reporting = true;
  try {
    const { data } = await supabase.auth.getSession();
    if (!data?.session?.user) return { ok: false, unauthenticated: true };
    const message = clean(error?.message || error || 'Unknown application error', 2000);
    const stack = clean(error?.stack || '', 4500);
    const context = clean(extraContext || ('Browser: ' + navigator.userAgent), 2200);
    const { error: rpcError } = await supabase.rpc('submit_app_error_report', {
      p_message: message, p_page: pageName(), p_stack: stack, p_context: context
    });
    if (rpcError) throw rpcError;
    return { ok: true };
  } catch (reportError) {
    console.warn('Automatic error report could not be submitted:', reportError);
    return { ok: false, error: reportError };
  } finally {
    reporting = false;
  }
}

export function initErrorReporter() {
  if (initialized) return;
  initialized = true;

  const announce = (error, source) => {
    const message = clean(error?.message || error || 'Unhandled application error', 2000);
    const key = errorKey(message, pageName());
    if (key === lastErrorKey) return;
    lastErrorKey = key;
    window.dispatchEvent(new CustomEvent('campus:app-error', {
      detail: { error: error instanceof Error ? error : new Error(message), message, source, page: pageName() }
    }));
  };

  window.addEventListener('error', event => announce(event?.error || event?.message, 'unhandled-error'));
  window.addEventListener('unhandledrejection', event => announce(event?.reason, 'unhandled-rejection'));
}

export function initErrorReportUI() {
  initErrorReporter();
  window.addEventListener('campus:app-error', event => {
    const detail = event.detail || {};
    document.getElementById('globalAppErrorReport')?.remove();

    const card = document.createElement('div');
    card.id = 'globalAppErrorReport';
    card.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 z-[120] w-[min(92vw,520px)] rounded-2xl border border-error/30 bg-inverse-surface text-inverse-on-surface shadow-2xl p-4';
    card.innerHTML = '<div class="flex gap-3"><span class="material-symbols-outlined text-error">error</span><div class="min-w-0 flex-1"><div class="font-bold text-sm">Something went wrong</div><div class="text-xs opacity-80 mt-1 break-words"></div><div class="flex items-center gap-2 mt-3"><button type="button" data-global-report class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold">Report this error</button><button type="button" data-global-close class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs">Dismiss</button></div></div></div>';
    card.querySelector('.text-xs') .textContent = detail.message || 'An unexpected application error occurred.';
    document.body.appendChild(card);

    card.querySelector('[data-global-close]')?.addEventListener('click', () => card.remove());
    card.querySelector('[data-global-report]')?.addEventListener('click', async event2 => {
      const button = event2.currentTarget;
      button.disabled = true;
      button.textContent = 'Sending...';
      const result = await submitAppErrorReport(detail.error, 'Source: ' + (detail.source || 'unknown'));
      if (result.ok) button.textContent = 'Reported ✓';
      else if (result.unauthenticated) { button.textContent = 'Sign in to report'; button.disabled = false; }
      else { button.textContent = 'Try again'; button.disabled = false; }
    });
  });
}

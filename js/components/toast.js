import { submitAppErrorReport } from '../error-reporter.js?v=20261008-error1';

// Simple & Elegant Toast Feedback System
export function showToast(message, type = 'info', duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-item flex items-center gap-2.5 px-4 py-3 bg-inverse-surface text-inverse-on-surface rounded-xl shadow-lg font-body-sm text-body-sm text-[13px] border border-outline-variant/30 min-w-[280px] max-w-md';

  let iconName = 'info';
  let iconColor = 'text-primary-fixed';
  if (type === 'success') { iconName = 'check_circle'; iconColor = 'text-emerald-400'; }
  else if (type === 'warning') { iconName = 'warning'; iconColor = 'text-amber-400'; }
  else if (type === 'error') { iconName = 'error'; iconColor = 'text-error'; }

  toast.innerHTML = `
    <span class="material-symbols-outlined text-[20px] ${iconColor} flex-shrink-0">${iconName}</span>
    <span class="flex-1"></span>
    ${type === 'error' ? '<button data-report-toast-error type="button" class="text-xs font-bold text-white/90 hover:text-white whitespace-nowrap">Report</button>' : ''}
    <button class="text-outline hover:text-white transition-colors" type="button" aria-label="Close">
      <span class="material-symbols-outlined text-[16px]">close</span>
    </button>`;
  toast.querySelector('.flex-1').textContent = message;

  const closeBtn = toast.querySelector('button[aria-label="Close"]');
  closeBtn.addEventListener('click', () => toast.remove());

  const reportBtn = toast.querySelector('[data-report-toast-error]');
  if (reportBtn) {
    reportBtn.addEventListener('click', async () => {
      reportBtn.disabled = true;
      reportBtn.textContent = 'Sending...';
      const result = await submitAppErrorReport(new Error(String(message)), 'Visible error toast');
      if (result.ok) reportBtn.textContent = 'Reported ✓';
      else if (result.unauthenticated) { reportBtn.textContent = 'Sign in'; reportBtn.disabled = false; }
      else { reportBtn.textContent = 'Try again'; reportBtn.disabled = false; }
    });
  }

  container.appendChild(toast);
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease-out';
      setTimeout(() => toast.remove(), 250);
    }
  }, duration);
}

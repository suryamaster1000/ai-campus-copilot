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

  if (type === 'success') {
    iconName = 'check_circle';
    iconColor = 'text-emerald-400';
  } else if (type === 'warning') {
    iconName = 'warning';
    iconColor = 'text-amber-400';
  } else if (type === 'error') {
    iconName = 'error';
    iconColor = 'text-error';
  }

  toast.innerHTML = `
    <span class="material-symbols-outlined text-[20px] ${iconColor} flex-shrink-0">${iconName}</span>
    <span class="flex-1">${message}</span>
    <button class="text-outline hover:text-white transition-colors" type="button" aria-label="Close">
      <span class="material-symbols-outlined text-[16px]">close</span>
    </button>
  `;

  const closeBtn = toast.querySelector('button');
  closeBtn.addEventListener('click', () => {
    toast.remove();
  });

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

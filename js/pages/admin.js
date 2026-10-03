// Admin Panel - live Supabase data only
import { supabase } from '../supabase.js';
import { showToast } from '../components/toast.js';

const OWNER_USER_ID = '53d68054-50f2-41b5-a666-5789db48ae02';

export function renderAdminPanel(container) {
  if (!container) return;
  container.innerHTML = `
    <div class="max-w-[1200px] mx-auto py-space-md space-y-space-md">
      <div class="bg-surface-container-lowest rounded-2xl p-space-md lg:p-space-lg border border-surface-container-high shadow-sm">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[24px]">admin_panel_settings</span>
          <h1 class="font-headline-md text-xl lg:text-2xl font-bold text-on-surface">Admin Panel</h1>
        </div>
        <p class="text-xs text-on-surface-variant mt-1">Live administration. No demo campus records are loaded.</p>
      </div>

      <section class="bg-surface-container-lowest rounded-2xl p-space-md lg:p-space-lg border border-surface-container-high shadow-sm">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">manage_accounts</span>
              <h2 class="font-headline-md text-base font-bold text-on-surface">Admin Access Control</h2>
              <span id="ownerBadge" class="hidden px-2 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">OWNER</span>
            </div>
            <p id="accessSubtitle" class="text-xs text-on-surface-variant mt-1">Loading permissions...</p>
          </div>
        </div>
        <div id="adminAccessBody" class="mt-4 space-y-3">
          <div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">Loading...</div>
        </div>
      </section>

      <section class="bg-surface-container-lowest rounded-2xl p-space-md lg:p-space-lg border border-surface-container-high shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">how_to_reg</span>
            <h2 class="font-headline-md text-base font-bold text-on-surface">Student Registration Approvals</h2>
          </div>
          <button id="refreshRegistrationsBtn" type="button" class="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-surface-container text-on-surface text-xs font-bold border border-surface-container-high">
            <span class="material-symbols-outlined text-[17px]">refresh</span>
            Refresh
          </button>
        </div>
        <p class="text-xs text-on-surface-variant mt-1">Review verified registrations and create their Supabase student accounts. Authorized admins and the owner can approve. Only the owner can manage administrator accounts.</p>
        <div id="registrationApprovalBody" class="mt-4 space-y-2">
          <div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">Loading registrations...</div>
        </div>
      </section>

      <div id="adminExtraTools" class="space-y-space-md"></div>

      <section class="bg-surface-container-lowest rounded-2xl p-space-md lg:p-space-lg border border-primary/30 shadow-sm">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary">psychology</span>
          <h2 class="font-headline-md text-base font-bold text-on-surface">Admin Campus Intelligence AI</h2>
          <span class="px-2 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">ADMIN ONLY</span>
        </div>
        <p class="text-xs text-on-surface-variant mt-1">Authorized administrators can query connected campus records across sections and directory data.</p>
        <div class="mt-4 space-y-3">
          <div id="adminAiAnswer" class="min-h-24 p-3 rounded-xl bg-surface-container-low text-sm text-on-surface whitespace-pre-wrap">Ask the Admin AI to search or extract information from the connected campus data.</div>
          <form id="adminAiForm" class="flex gap-2">
            <input id="adminAiInput" class="flex-1 px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="e.g. Show the complete CSM7 admission directory" autocomplete="off">
            <button class="px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-bold" type="submit">Ask AI</button>
          </form>
          <div class="flex flex-wrap gap-2">
            <button type="button" data-admin-ai-query="Show the complete CSM7 admission directory" class="px-3 py-1.5 rounded-full bg-surface-container text-xs font-semibold">CSM7 admissions</button>
            <button type="button" data-admin-ai-query="Give me a summary of all connected student profiles" class="px-3 py-1.5 rounded-full bg-surface-container text-xs font-semibold">Student summary</button>
            <button type="button" data-admin-ai-query="List all connected faculty, subjects and programs" class="px-3 py-1.5 rounded-full bg-surface-container text-xs font-semibold">Academic catalog</button>
          </div>
        </div>
      </section>

      <section class="bg-surface-container-lowest rounded-2xl p-space-md lg:p-space-lg border border-surface-container-high shadow-sm">
        <h2 class="font-headline-md text-base font-bold text-on-surface">Live Campus Data</h2>
        <p class="text-xs text-on-surface-variant mt-1">No sample notices, courses, timetable, events, or student records are stored in the frontend. Add real records through the connected data source.</p>
      </section>
    </div>
  `;

  // Defer data loading until the DOM has been painted so the panel itself
  // is visible even when a Supabase query is slow or fails.
  queueMicrotask(() => {
    loadAdminAccessControl().catch((error) => {
      console.error('Admin access control failed:', error);
    });
    loadStudentRegistrations().catch((error) => {
      console.error('Student registrations failed:', error);
    });
    import('./admin-tools.js?v=20261003-live1')
      .then((module) => module.renderAdminTools(document.getElementById('adminExtraTools')))
      .catch((error) => console.error('Admin tools module failed:', error));
  });

  document.getElementById('refreshRegistrationsBtn')?.addEventListener('click', async (event) => {
    const button = event.currentTarget;
    const icon = button.querySelector('.material-symbols-outlined');
    button.disabled = true;
    button.classList.add('opacity-70');
    if (icon) icon.classList.add('animate-spin');
    try {
      await loadStudentRegistrations();
      showToast('Registration list refreshed.', 'success');
    } finally {
      button.disabled = false;
      button.classList.remove('opacity-70');
      if (icon) icon.classList.remove('animate-spin');
    }
  });

  async function loadAdminAccessControl() {
    const body = document.getElementById('adminAccessBody');
    const subtitle = document.getElementById('accessSubtitle');
    const ownerBadge = document.getElementById('ownerBadge');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !body) return;

    const { data: admins, error } = await supabase
      .from('admin_users')
      .select('user_id, role, authorized_at, authorized_by')
      .order('authorized_at', { ascending: true });

    if (error) {
      body.innerHTML = '<div class="text-xs text-error p-3 rounded-xl bg-error-container">Unable to load admin permissions. Check the Supabase RLS policies.</div>';
      return;
    }

    const owner = user.id === OWNER_USER_ID || (admins || []).some(a => a.user_id === user.id && a.role === 'owner');
    const adminCanAuthorize = owner;
    if (owner) ownerBadge?.classList.remove('hidden');
    subtitle.textContent = owner
      ? 'You are the owner. Only the owner can authorize, revoke, and assign administrator accounts.'
      : adminCanAuthorize
        ? 'You are an authorized admin. The owner manages administrator accounts and class assignments.'
        : 'You have Admin Panel access.';

    const adminIds = new Set((admins || []).map(a => a.user_id));
    const ids = [...adminIds];
    const { data: adminProfiles } = ids.length
      ? await supabase.from('profiles').select('id,name,email,section,program').in('id', ids)
      : { data: [] };
    const profileMap = new Map((adminProfiles || []).map(p => [p.id, p]));

    const rows = (admins || []).map(a => {
      const p = profileMap.get(a.user_id) || {};
      const rowOwner = a.user_id === OWNER_USER_ID || a.role === 'owner';
      return `<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-surface-container-low border border-surface-container-high">
        <div class="min-w-0">
          <div class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px] ${rowOwner ? 'text-primary' : 'text-emerald-600'}">${rowOwner ? 'verified_user' : 'admin_panel_settings'}</span><span class="text-sm font-bold truncate">${p.name || 'Authorized account'}</span><span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${rowOwner ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-emerald-100 text-emerald-800'}">${rowOwner ? 'OWNER' : 'ADMIN'}</span></div>
          <p class="text-[11px] text-on-surface-variant mt-0.5 ml-6 truncate">${p.email || a.user_id}</p>
        </div>
        ${owner && !rowOwner ? `<button data-revoke="${a.user_id}" class="px-3 py-2 rounded-lg bg-error-container text-on-error-container text-xs font-bold">Revoke Admin</button>` : ''}
      </div>`;
    }).join('');

    let candidateHtml = '';
    if (adminCanAuthorize) {
      const { data: profiles, error: profileError } = await supabase.from('profiles').select('id,name,email,section,program').order('name', { ascending: true });
      if (profileError) {
        candidateHtml = '<div class="text-xs text-error p-3 rounded-xl bg-error-container">Unable to load student accounts. Check the profiles SELECT policy.</div>';
      } else {
        const candidates = (profiles || []).filter(p => !adminIds.has(p.id) && p.id !== OWNER_USER_ID);
        candidateHtml = `<div class="pt-3 border-t border-surface-container-high"><div class="flex items-center justify-between mb-2"><h3 class="text-xs font-bold uppercase tracking-wider text-outline">Authorize another student</h3><span class="text-[10px] text-on-surface-variant">${candidates.length} available</span></div>${candidates.length ? candidates.map(p => `<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 mb-2 rounded-xl border border-surface-container-high"><div class="min-w-0"><div class="text-sm font-semibold truncate">${p.name || 'Student'}</div><div class="text-[11px] text-on-surface-variant truncate">${p.email || ''}${p.section ? ' • Section ' + p.section : ''}</div></div><button data-authorize="${p.id}" class="px-3 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold">Authorize Admin</button></div>`).join('') : '<div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">No other student accounts are available yet.</div>'}</div>`;
      }
    }

    body.innerHTML = (rows || '<div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">No authorized administrators.</div>') + candidateHtml;

    body.querySelectorAll('[data-authorize]').forEach(btn => btn.onclick = async () => {
      btn.disabled = true;
      const { error: insertError } = await supabase.from('admin_users').insert({ user_id: btn.dataset.authorize, role: 'admin', authorized_by: user.id });
      if (insertError) { showToast(insertError.message, 'error'); btn.disabled = false; return; }
      showToast('Admin account authorized.', 'success');
      await loadAdminAccessControl();
    });

    body.querySelectorAll('[data-revoke]').forEach(btn => btn.onclick = async () => {
      if (!confirm('Revoke admin access for this account?')) return;
      btn.disabled = true;
      const { error: deleteError } = await supabase.from('admin_users').delete().eq('user_id', btn.dataset.revoke);
      if (deleteError) { showToast(deleteError.message, 'error'); btn.disabled = false; return; }
      showToast('Admin access revoked.', 'success');
      await loadAdminAccessControl();
    });
  }
  async function loadStudentRegistrations() {
    const body = document.getElementById('registrationApprovalBody');
    if (!body) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: admins } = await supabase.from('admin_users').select('user_id,role').eq('user_id', user.id);
    const canApprove = user.id === OWNER_USER_ID || (admins || []).some(a => a.role === 'owner' || a.role === 'admin');
    if (!canApprove) {
      body.innerHTML = '<div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">Registration approval is restricted to authorized administrators.</div>';
      return;
    }

    const { data: registrations, error } = await supabase
      .from('student_registrations')
      .select('id,admission_no,student_name,email,section,phone,status,created_at')
      .order('created_at', { ascending: false });

    if (error) {
      body.innerHTML = '<div class="text-xs text-error p-3 rounded-xl bg-error-container">Unable to load student registrations.</div>';
      return;
    }

    if (!(registrations || []).length) {
      body.innerHTML = '<div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">No student registrations yet.</div>';
      return;
    }

    body.innerHTML = registrations.map(r => {
      const pending = r.status === 'pending';
      const statusClass = r.status === 'linked'
        ? 'bg-emerald-100 text-emerald-800'
        : r.status === 'rejected'
          ? 'bg-error-container text-on-error-container'
          : 'bg-amber-100 text-amber-800';
      return `<div data-registration-id="${r.id}" class="p-3 rounded-xl border border-surface-container-high bg-surface-container-low">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-sm font-bold">${r.student_name || 'Student'}</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${statusClass}">${r.status.toUpperCase()}</span>
            </div>
            <div class="text-[11px] text-on-surface-variant mt-1">${r.admission_no} • Section ${r.section} • ${r.email}</div>
            ${r.phone ? `<div class="text-[11px] text-on-surface-variant mt-0.5">${r.phone}</div>` : ''}
          </div>
          ${pending ? `<button data-approve-registration="${r.id}" class="px-3 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold">Approve & Create Account</button>` : ''}
        </div>
      </div>`;
    }).join('');

    body.querySelectorAll('[data-approve-registration]').forEach(btn => btn.onclick = async () => {
      if (!confirm('Approve this verified student and create their Supabase account?')) return;
      btn.disabled = true;
      btn.textContent = 'Creating...';
      const initialPassword = window.prompt('Enter the student initial password. Leave blank to keep the normal invitation/password-setup flow:');
      if (initialPassword === null) {
        btn.disabled = false;
        btn.textContent = 'Approve & Create Account';
        return;
      }
      if (initialPassword && initialPassword.length < 8) {
        showToast('Password must be at least 8 characters.', 'error');
        btn.disabled = false;
        btn.textContent = 'Approve & Create Account';
        return;
      }

      const { data, error: invokeError } = await supabase.functions.invoke('approve-student-registration', {
        body: {
          registration_id: btn.dataset.approveRegistration
        }
      });
      if (invokeError || data?.error) {
        showToast(data?.error || invokeError?.message || 'Approval failed.', 'error');
        btn.disabled = false;
        btn.textContent = 'Approve & Create Account';
        return;
      }
      if (initialPassword) {
        const { data: syncData, error: syncError } = await supabase.functions.invoke(
          'sync-student-default-password',
          { body: { password: initialPassword } }
        );
        if (syncError || syncData?.error || syncData?.ok === false) {
          showToast(syncData?.error || syncData?.message || syncError?.message || 'Student account created, but default password could not be applied.', 'error');
          await loadStudentRegistrations();
          return;
        }
        showToast('Student account created. Default student password applied.', 'success');
        await loadStudentRegistrations();
        return;
      }

      if (data?.action_link) {
        const copied = await navigator.clipboard?.writeText(data.action_link).then(() => true).catch(() => false);
        showToast(
          copied
            ? 'Account created. Secure password-setup link copied to clipboard.'
            : 'Account created. Supabase email was rate-limited.',
          'success'
        );
        await loadStudentRegistrations();
        const row = document.querySelector(`[data-registration-id="${btn.dataset.approveRegistration}"]`);
        if (row) {
          const linkBox = document.createElement('div');
          linkBox.className = 'mt-3 p-3 rounded-xl border border-amber-300 bg-amber-50 text-xs text-amber-900';
          linkBox.innerHTML = '<div class="font-bold mb-1">Secure password-setup link</div><input readonly class="w-full px-2 py-2 rounded-lg border border-amber-200 bg-white text-[11px]" value="' +
            String(data.action_link).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;') + '">';
          row.appendChild(linkBox);
        }
      } else {
        showToast('Student account and profile created. Invitation email sent.', 'success');
        await loadStudentRegistrations();
      }
    });
  }

  const adminAiForm = document.getElementById('adminAiForm');
  const adminAiInput = document.getElementById('adminAiInput');
  const adminAiAnswer = document.getElementById('adminAiAnswer');

  async function askAdminAi(query) {
    const text = String(query || '').trim();
    if (!text || !adminAiAnswer) return;
    adminAiAnswer.textContent = 'Searching connected administrative campus data...';
    try {
      const { data, error } = await supabase.functions.invoke('ai-campus-copilot', {
        body: { question: text, admin_mode: true }
      });
      if (error) throw error;
      if (!data?.answer) throw new Error(data?.error || 'Admin AI returned no answer.');
      adminAiAnswer.textContent = data.answer;
    } catch (error) {
      adminAiAnswer.textContent = error?.message || 'Admin AI request failed.';
      showToast(adminAiAnswer.textContent, 'error');
    }
  }

  adminAiForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = adminAiInput?.value || '';
    if (adminAiInput) adminAiInput.value = '';
    askAdminAi(query);
  });

  document.querySelectorAll('[data-admin-ai-query]').forEach((button) => {
    button.addEventListener('click', () => askAdminAi(button.getAttribute('data-admin-ai-query')));
  });
}

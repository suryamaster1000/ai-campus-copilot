// Admin Panel - live Supabase data only
import { supabase } from '../supabase.js';
import { showToast } from '../components/toast.js';

const OWNER_USER_ID = '53d68054-50f2-41b5-a666-5789db48ae02';

export function renderAdminPanel(container) {
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
        <h2 class="font-headline-md text-base font-bold text-on-surface">Live Campus Data</h2>
        <p class="text-xs text-on-surface-variant mt-1">No sample notices, courses, timetable, events, or student records are stored in the frontend. Add real records through the connected data source.</p>
      </section>
    </div>
  `;

  loadAdminAccessControl();

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
    if (owner) ownerBadge?.classList.remove('hidden');
    subtitle.textContent = owner
      ? 'Only the owner can authorize or revoke Admin Panel access.'
      : 'You have Admin Panel access. Only the owner can change permissions.';

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
    if (owner) {
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
}

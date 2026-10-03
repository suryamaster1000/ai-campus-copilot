// Admin Panel Page - RAG Index Management & Campus System Telemetry
import { campusData } from '../data.js';
import { supabase } from '../supabase.js';
import { showToast } from '../components/toast.js';

const OWNER_USER_ID = '53d68054-50f2-41b5-a666-5789db48ae02';

export function renderAdminPanel(container) {
  let isIndexing = false;

  function render() {
    container.innerHTML = `
      <div class="max-w-[1720px] mx-auto py-space-sm space-y-space-md animate-fade-in">
        
        <!-- Header Strip -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-surface-container-high">
          <div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[24px]">admin_panel_settings</span>
              <h1 class="font-headline-md text-xl lg:text-2xl font-bold text-on-surface">Campus Administration &amp; Copilot RAG</h1>
              <span class="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-semibold">Registrar &amp; IT Ops</span>
            </div>
            <p class="text-xs text-on-surface-variant mt-1">
              Verify vector index status, monitor student query volume, and publish official academic bulletins.
            </p>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <button id="triggerSyncRagBtn" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-on-primary hover:bg-tertiary-container text-xs font-semibold rounded-xl shadow-sm transition-colors ${isIndexing ? 'opacity-70 cursor-not-allowed' : ''}">
              <span class="material-symbols-outlined text-[18px] ${isIndexing ? 'animate-spin' : ''}">sync</span>
              <span>${isIndexing ? 'Syncing Embeddings...' : 'Sync Vector Database'}</span>
            </button>
          </div>
        </div>

        <!-- System Telemetry Row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          <div class="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-surface-container-high">
            <span class="text-xs font-bold text-outline uppercase tracking-wider block">Daily Queries Handled</span>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="font-headline-lg text-3xl font-extrabold text-on-surface">1,420</span>
              <span class="text-xs text-emerald-600 font-bold">+18% this week</span>
            </div>
            <span class="text-[11px] text-on-surface-variant mt-1 block">Peak traffic: 09:30 AM – 11:00 AM</span>
          </div>

          <div class="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-surface-container-high">
            <span class="text-xs font-bold text-outline uppercase tracking-wider block">Grounding Accuracy</span>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="font-headline-lg text-3xl font-extrabold text-emerald-600">99.4%</span>
              <span class="text-xs text-outline font-semibold">SIS Verified</span>
            </div>
            <span class="text-[11px] text-on-surface-variant mt-1 block">Zero unauthorized hallucinations</span>
          </div>

          <div class="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-surface-container-high">
            <span class="text-xs font-bold text-outline uppercase tracking-wider block">Average Query Latency</span>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="font-headline-lg text-3xl font-extrabold text-on-surface">320ms</span>
              <span class="text-xs text-outline font-medium">p95: 580ms</span>
            </div>
            <span class="text-[11px] text-on-surface-variant mt-1 block">Internal campus edge cluster</span>
          </div>

          <div class="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-surface-container-high">
            <span class="text-xs font-bold text-outline uppercase tracking-wider block">Active RAG Documents</span>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="font-headline-lg text-3xl font-extrabold text-primary">148</span>
              <span class="text-xs text-outline font-medium">8,410 chunks</span>
            </div>
            <span class="text-[11px] text-on-surface-variant mt-1 block">768-dim embeddings synchronized</span>
          </div>
        </div>

        <!-- Admin Access Control -->
        <div id="adminAccessControl" class="bg-surface-container-lowest rounded-2xl p-space-md lg:p-space-lg shadow-sm border border-surface-container-high space-y-4">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[22px]">manage_accounts</span>
                <h3 class="font-headline-md text-base font-bold text-on-surface">Admin Access Control</h3>
              </div>
              <p id="adminAccessSubtitle" class="text-xs text-on-surface-variant mt-1">Loading authorization controls...</p>
            </div>
            <span id="adminOwnerBadge" class="hidden px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold uppercase tracking-wider">Owner controls</span>
          </div>
          <div id="adminAccessBody" class="space-y-4">
            <div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">Loading authorized accounts...</div>
          </div>
        </div>

        <!-- Main Admin Workspace Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
          
          <!-- Left 2 Cols: Vector Knowledge Base Table -->
          <div class="lg:col-span-2 bg-surface-container-lowest rounded-2xl p-space-md lg:p-space-lg shadow-sm border border-surface-container-high space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-headline-md text-base font-bold text-on-surface">Authoritative Campus Knowledge Base</h3>
                <p class="text-xs text-on-surface-variant">Documents indexed in PostgreSQL pgvector / semantic search layer.</p>
              </div>
              <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Index Healthy
              </span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="border-b border-surface-container-high text-outline uppercase font-semibold text-[11px]">
                    <th class="py-2.5 px-3">Document Title</th>
                    <th class="py-2.5 px-3">Authority / Dept</th>
                    <th class="py-2.5 px-3">Chunks</th>
                    <th class="py-2.5 px-3">Last Synced</th>
                    <th class="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-surface-container">
                  <tr class="hover:bg-surface-container-low transition-colors">
                    <td class="py-3 px-3 font-semibold text-on-surface flex items-center gap-2">
                      <span class="material-symbols-outlined text-[18px] text-error">picture_as_pdf</span>
                      CS204_Syllabus_Fall2024.pdf
                    </td>
                    <td class="py-3 px-3 text-on-surface-variant">Dept. of Computer Science</td>
                    <td class="py-3 px-3 text-outline">142 chunks</td>
                    <td class="py-3 px-3 text-outline">Today, 04:12 AM</td>
                    <td class="py-3 px-3 text-right">
                      <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">100% Synced</span>
                    </td>
                  </tr>

                  <tr class="hover:bg-surface-container-low transition-colors">
                    <td class="py-3 px-3 font-semibold text-on-surface flex items-center gap-2">
                      <span class="material-symbols-outlined text-[18px] text-error">picture_as_pdf</span>
                      Student_Handbook_2024-25.pdf
                    </td>
                    <td class="py-3 px-3 text-on-surface-variant">Dean of Academic Affairs</td>
                    <td class="py-3 px-3 text-outline">518 chunks</td>
                    <td class="py-3 px-3 text-outline">Yesterday</td>
                    <td class="py-3 px-3 text-right">
                      <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">100% Synced</span>
                    </td>
                  </tr>

                  <tr class="hover:bg-surface-container-low transition-colors">
                    <td class="py-3 px-3 font-semibold text-on-surface flex items-center gap-2">
                      <span class="material-symbols-outlined text-[18px] text-error">picture_as_pdf</span>
                      Midterm_DateSheet_Fall2024.pdf
                    </td>
                    <td class="py-3 px-3 text-on-surface-variant">Controller of Examinations</td>
                    <td class="py-3 px-3 text-outline">88 chunks</td>
                    <td class="py-3 px-3 text-outline">2 days ago</td>
                    <td class="py-3 px-3 text-right">
                      <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">100% Synced</span>
                    </td>
                  </tr>

                  <tr class="hover:bg-surface-container-low transition-colors">
                    <td class="py-3 px-3 font-semibold text-on-surface flex items-center gap-2">
                      <span class="material-symbols-outlined text-[18px] text-error">picture_as_pdf</span>
                      Hostel_Rules_ByLaws.pdf
                    </td>
                    <td class="py-3 px-3 text-on-surface-variant">Chief Warden Office</td>
                    <td class="py-3 px-3 text-outline">64 chunks</td>
                    <td class="py-3 px-3 text-outline">Sep 28, 2024</td>
                    <td class="py-3 px-3 text-right">
                      <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">100% Synced</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Right 1 Col: Quick Notice Broadcaster -->
          <div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container-high space-y-3">
            <h3 class="font-headline-md font-bold text-sm text-on-surface uppercase tracking-wider text-outline">Broadcast Notice Circular</h3>
            <p class="text-xs text-on-surface-variant">
              Post an official announcement instantly to student dashboards and Copilot reasoning index.
            </p>

            <form id="broadcastNoticeForm" class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-on-surface mb-1">Circular Title</label>
                <input id="bcTitle" required class="w-full px-3 py-2 bg-surface-container-low rounded-xl text-xs text-on-surface outline-none border border-surface-container-high focus:border-primary" placeholder="e.g. Schedule for Lab Makeup Exam" type="text"/>
              </div>
              <div>
                <label class="block text-xs font-semibold text-on-surface mb-1">Target Department</label>
                <select id="bcDept" class="w-full px-3 py-2 bg-surface-container-low rounded-xl text-xs text-on-surface outline-none border border-surface-container-high focus:border-primary">
                  <option value="All Students">All Enrolled Students</option>
                  <option value="Computer Science" selected>B.Tech Computer Science</option>
                  <option value="Hostel Residents">Hostel Residents</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-on-surface mb-1">Announcement Body</label>
                <textarea id="bcBody" required rows="3" class="w-full px-3 py-2 bg-surface-container-low rounded-xl text-xs text-on-surface outline-none border border-surface-container-high focus:border-primary resize-none" placeholder="Enter verified university circular notice text..."></textarea>
              </div>
              <button type="submit" class="w-full py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-tertiary-container transition-colors shadow-sm">
                Publish &amp; Broadcast Notice
              </button>
            </form>
          </div>

        </div>

      </div>
    `;

    // Sync button
    const syncBtn = document.getElementById('triggerSyncRagBtn');
    if (syncBtn) {
      syncBtn.onclick = () => {
        if (isIndexing) return;
        isIndexing = true;
        render();
        setTimeout(() => {
          isIndexing = false;
          showToast("✅ Vector index refreshed! 8,410 chunks synced with registrar databases.", "success");
          render();
        }, 1500);
      };
    }

    // Broadcast notice form
    const bcForm = document.getElementById('broadcastNoticeForm');
    if (bcForm) {
      bcForm.onsubmit = (e) => {
        e.preventDefault();
        const title = document.getElementById('bcTitle').value;
        const body = document.getElementById('bcBody').value;
        campusData.notices.unshift({
          id: 'N-' + Date.now(),
          title,
          category: 'Academic',
          badgeClass: 'bg-primary-fixed text-on-primary-fixed',
          date: 'Just Now',
          author: 'Office of Academic Affairs',
          urgent: false,
          summary: body,
          attachment: null,
          read: false
        });
        showToast("📢 Notice broadcast published successfully!", "success");
        bcForm.reset();
      };
    }
  }

  async function loadAdminAccessControl() {
    const body = document.getElementById('adminAccessBody');
    const subtitle = document.getElementById('adminAccessSubtitle');
    const ownerBadge = document.getElementById('adminOwnerBadge');
    if (!body) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: admins, error: adminsError } = await supabase
      .from('admin_users')
      .select('user_id, role, authorized_at, authorized_by')
      .order('authorized_at', { ascending: true });

    if (adminsError) {
      body.innerHTML = '<div class="text-xs text-error p-3 rounded-xl bg-error-container">Unable to load admin permissions.</div>';
      return;
    }

    const adminIds = new Set((admins || []).map(a => a.user_id));
    const owner = user.id === OWNER_USER_ID;
    if (owner) ownerBadge?.classList.remove('hidden');
    subtitle.textContent = owner
      ? 'Only your owner account can authorize or revoke other admin accounts.'
      : 'You have admin access. Only the owner account can change administrator permissions.';

    const profileIds = owner ? null : [...adminIds];
    let profilesQuery = supabase.from('profiles').select('id,name,email,section,program');
    if (profileIds) profilesQuery = profilesQuery.in('id', profileIds);
    const { data: profiles, error: profilesError } = await profilesQuery.order('name', { ascending: true });

    if (profilesError) {
      body.innerHTML = '<div class="text-xs text-error p-3 rounded-xl bg-error-container">Unable to load account list.</div>';
      return;
    }

    const profileMap = new Map((profiles || []).map(p => [p.id, p]));
    const authorizedRows = (admins || []).map(a => {
      const p = profileMap.get(a.user_id) || {};
      return { ...a, ...p };
    });

    const authorizedHtml = authorizedRows.map(a => {
      const isOwnerRow = a.user_id === OWNER_USER_ID || a.role === 'owner';
      return `<div class="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-surface-container-low border border-surface-container-high">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px] ${isOwnerRow ? 'text-primary' : 'text-emerald-600'}">${isOwnerRow ? 'verified_user' : 'admin_panel_settings'}</span>
            <span class="text-sm font-bold text-on-surface truncate">${a.name || 'Authorized Student'}</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${isOwnerRow ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-emerald-100 text-emerald-800'}">${isOwnerRow ? 'OWNER' : 'ADMIN'}</span>
          </div>
          <p class="text-[11px] text-on-surface-variant mt-0.5 ml-6 truncate">${a.email || a.user_id}</p>
        </div>
        ${owner && !isOwnerRow ? `<button type="button" data-revoke-admin="${a.user_id}" class="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-error-container text-on-error-container text-xs font-bold hover:opacity-80 transition-opacity"><span class="material-symbols-outlined text-[16px]">person_remove</span>Revoke Admin</button>` : ''}
      </div>`;
    }).join('');

    let candidatesHtml = '';
    if (owner) {
      const { data: allProfiles } = await supabase.from('profiles').select('id,name,email,section,program').order('name', { ascending: true });
      const candidates = (allProfiles || []).filter(p => !adminIds.has(p.id) && p.id !== OWNER_USER_ID);
      candidatesHtml = `<div class="space-y-2">
        <div class="flex items-center justify-between"><h4 class="text-xs font-bold uppercase tracking-wider text-outline">Authorize another student</h4><span class="text-[10px] text-on-surface-variant">${candidates.length} available</span></div>
        ${candidates.length ? candidates.map(p => `<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-surface-container-high">
          <div class="min-w-0"><div class="text-sm font-semibold text-on-surface truncate">${p.name || 'Student'}</div><div class="text-[11px] text-on-surface-variant truncate">${p.email || ''} ${p.section ? '• Section ' + p.section : ''}</div></div>
          <button type="button" data-authorize-admin="${p.id}" class="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold hover:opacity-90"><span class="material-symbols-outlined text-[16px]">person_add</span>Authorize Admin</button>
        </div>`).join('') : '<div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">No other student accounts are available yet.</div>')}
      </div>`;
    }

    body.innerHTML = `
      <div class="space-y-2">
        <div class="flex items-center justify-between"><h4 class="text-xs font-bold uppercase tracking-wider text-outline">Authorized administrators</h4><span class="text-[10px] text-on-surface-variant">${authorizedRows.length} account${authorizedRows.length === 1 ? '' : 's'}</span></div>
        ${authorizedHtml || '<div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">No authorized administrators found.</div>'}
      </div>
      ${owner ? '<div class="h-px bg-surface-container-high"></div>' + candidatesHtml : ''}
    `;

    body.querySelectorAll('[data-authorize-admin]').forEach(btn => {
      btn.onclick = async () => {
        const userId = btn.dataset.authorizeAdmin;
        btn.disabled = true;
        const { error } = await supabase.from('admin_users').insert({
          user_id: userId,
          role: 'admin',
          authorized_by: user.id
        });
        if (error) {
          showToast(error.message || 'Could not authorize this account.', 'error');
          btn.disabled = false;
          return;
        }
        showToast('Admin account authorized successfully.', 'success');
        await loadAdminAccessControl();
      };
    });

    body.querySelectorAll('[data-revoke-admin]').forEach(btn => {
      btn.onclick = async () => {
        const userId = btn.dataset.revokeAdmin;
        if (!confirm('Revoke admin access for this account?')) return;
        btn.disabled = true;
        const { error } = await supabase.from('admin_users').delete().eq('user_id', userId);
        if (error) {
          showToast(error.message || 'Could not revoke this account.', 'error');
          btn.disabled = false;
          return;
        }
        showToast('Admin access revoked.', 'success');
        await loadAdminAccessControl();
      };
    });
  }

  render();
  loadAdminAccessControl();
}

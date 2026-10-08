// Admin Panel - live Supabase data only
import { supabase } from '../supabase.js';
import { showToast } from '../components/toast.js';

const OWNER_USER_ID = '53d68054-50f2-41b5-a666-5789db48ae02';

const OWNER_SECTIONS = Array.from({ length: 8 }, (_, index) => 'CSM' + (index + 1));

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
        <div id="ownerTeacherQuick" class="hidden mt-4">
          <button id="openTeacherManager" type="button" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-sm">
            <span class="material-symbols-outlined text-[17px]">school</span>
            Manage Teachers
          </button>
          <span class="text-[11px] text-on-surface-variant ml-2">Create teacher login accounts and assign CSM1–CSM8</span>
        </div>
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

      <div id="ownerControlCenter" class="space-y-space-md"></div>

      <section class="bg-surface-container-lowest rounded-2xl p-space-md lg:p-space-lg border border-surface-container-high shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">how_to_reg</span>
            <h2 class="font-headline-md text-base font-bold text-on-surface">Student Registration Approvals</h2>
          </div>
          <div class="flex flex-wrap items-center justify-end gap-2">
            <button id="approveAllRegistrationsBtn" type="button" class="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold shadow-sm">
              <span class="material-symbols-outlined text-[17px]">done_all</span>
              Approve & Accept All
            </button>
            <button id="refreshRegistrationsBtn" type="button" class="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-surface-container text-on-surface text-xs font-bold border border-surface-container-high">
              <span class="material-symbols-outlined text-[17px]">refresh</span>
              Refresh
            </button>
          </div>
        </div>
        <p class="text-xs text-on-surface-variant mt-1">Review verified registrations and create their Supabase student accounts. Authorized admins and the owner can approve. Only the owner can manage administrator accounts.</p>
        <div id="registrationApprovalBody" class="mt-4 space-y-2">
          <div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">Loading registrations...</div>
        </div>
      </section>

      <section class="bg-surface-container-lowest rounded-2xl p-space-md lg:p-space-lg border border-primary/20 shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <span class="material-symbols-outlined text-primary">groups</span>
              <h2 class="font-headline-md text-base font-bold text-on-surface">Section Students</h2>
              <span id="ownerSectionBadge" class="hidden px-2 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">OWNER VIEW</span>
            </div>
            <p id="sectionStudentsSubtitle" class="text-xs text-on-surface-variant mt-1">Select a section to view and manage its students.</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <select id="ownerSectionSelect" class="hidden px-3 py-2 rounded-lg border border-surface-container-high bg-white text-xs font-bold outline-none focus:border-primary">
              <option value="">Select section...</option>
              ${OWNER_SECTIONS.map(section => `<option value="${section}">${section}</option>`).join('')}
            </select>
            <button id="refreshSectionStudentsBtn" type="button" class="px-3 py-2 rounded-lg bg-surface-container text-on-surface text-xs font-bold border border-surface-container-high">Refresh</button>
          </div>
        </div>
        <div id="sectionStudentsBody" class="mt-4 space-y-2">
          <div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">Loading students...</div>
        </div>
      </section>

      <section class="bg-surface-container-lowest rounded-2xl p-space-md lg:p-space-lg border border-surface-container-high shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-error">report_problem</span>
              <h2 class="font-headline-md text-base font-bold text-on-surface">Student Reports</h2>
              <span id="studentReportsOpenCount" class="px-2 py-1 rounded-full bg-error-container text-on-error-container text-[10px] font-bold">0 open</span>
            </div>
            <p class="text-xs text-on-surface-variant mt-1">Reports from students are visible to the owner and the authorized admin responsible for the student's section.</p>
          </div>
          <button id="refreshStudentReportsBtn" type="button" class="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-surface-container text-on-surface text-xs font-bold border border-surface-container-high">
            <span class="material-symbols-outlined text-[17px]">refresh</span>
            Refresh Reports
          </button>
        </div>
        <div id="studentReportsBody" class="mt-4 space-y-3">
          <div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">Loading reports...</div>
        </div>
      </section>

      <div id="adminTeacherManagement" class="space-y-space-md hidden"></div>
      <div id="adminExtraTools" class="space-y-space-md"></div>
      <div id="adminContentManagement" class="space-y-space-md"></div>
      <div id="adminSubjectNotes" class="space-y-space-md"></div>

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
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">fact_check</span>
              <h2 class="font-headline-md text-base font-bold text-on-surface">Admin Student Log</h2>
              <span class="px-2 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">CLICK A STUDENT</span>
            </div>
            <p class="text-xs text-on-surface-variant mt-1">Live registration and report activity connected to student profiles. This log does not invent audit events; it uses available Supabase records.</p>
          </div>
          <button id="refreshStudentLogBtn" type="button" class="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container text-on-surface text-xs font-bold border border-surface-container-high">
            <span class="material-symbols-outlined text-[17px]">refresh</span>Refresh Log
          </button>
        </div>
        <div class="mt-4">
          <input id="studentLogSearch" type="search" maxlength="80" placeholder="Search student name, email, roll number or section..." class="w-full px-3 py-2.5 rounded-xl border border-surface-container-high bg-white text-xs outline-none focus:border-primary">
        </div>
        <div id="studentLogBody" class="mt-4 space-y-2">
          <div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">Loading student activity...</div>
        </div>
      </section>

      <div id="studentLogModal" class="fixed inset-0 z-[90] hidden items-center justify-center p-4">
        <div data-student-log-backdrop class="absolute inset-0 bg-black/45 backdrop-blur-sm"></div>
        <section role="dialog" aria-modal="true" aria-labelledby="studentLogModalTitle" class="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-surface-container-lowest rounded-2xl border border-surface-container-high shadow-2xl">
          <div class="p-5 border-b border-surface-container-high flex items-start justify-between gap-3">
            <div>
              <h3 id="studentLogModalTitle" class="text-lg font-bold text-on-surface">Student Details</h3>
              <p class="text-xs text-on-surface-variant mt-1">Live profile data from Supabase.</p>
            </div>
            <button type="button" data-student-log-close class="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container"><span class="material-symbols-outlined text-[20px]">close</span></button>
          </div>
          <div id="studentLogModalBody" class="p-5 space-y-3"></div>
        </section>
      </div>

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
    import('./owner-control.js?v=20261006-owner6')
      .then((module) => module.renderOwnerControl(document.getElementById('ownerControlCenter')))
      .catch((error) => console.error('Owner control module failed:', error));

    loadStudentRegistrations().catch((error) => {
      console.error('Student registrations failed:', error);
    });
    loadStudentReports().catch((error) => {
      console.error('Student reports failed:', error);
    });
    loadStudentLog().catch((error) => {
      console.error('Student log failed:', error);
    });
    loadSectionStudents().catch((error) => {
      console.error('Section student management failed:', error);
    });
    import('./admin-teachers.js?v=20261006-teachers10')
      .then((module) => module.renderAdminTeachers(document.getElementById('adminTeacherManagement')))
      .catch((error) => console.error('Admin teachers module failed:', error));
    import('./admin-tools.js?v=20261005-tools2')
      .then((module) => module.renderAdminTools(document.getElementById('adminExtraTools')))
      .catch((error) => console.error('Admin tools module failed:', error));
    import('./admin-content.js?v=20261006-live5')
      .then((module) => module.renderAdminContent(document.getElementById('adminContentManagement')))
      .catch((error) => console.error('Admin content module failed:', error));
    import('./admin-subject-notes.js?v=20261006-notes2')
      .then((module) => module.renderSubjectNotes(document.getElementById('adminSubjectNotes')))
      .catch((error) => console.error('Subject notes module failed:', error));
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

  document.getElementById('refreshStudentLogBtn')?.addEventListener('click', async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
      await loadStudentLog();
      showToast('Student log refreshed.', 'success');
    } finally {
      button.disabled = false;
    }
  });

  document.getElementById('studentLogSearch')?.addEventListener('input', () => {
    loadStudentLog().catch(error => console.error('Student log search failed:', error));
  });

  document.getElementById('ownerSectionSelect')?.addEventListener('change', async () => {
    await loadSectionStudents();
  });

  document.getElementById('refreshSectionStudentsBtn')?.addEventListener('click', async () => {
    await loadSectionStudents();
    showToast('Section students refreshed.', 'success');
  });

  document.getElementById('refreshStudentReportsBtn')?.addEventListener('click', async (event) => {
    const button = event.currentTarget;
    const icon = button.querySelector('.material-symbols-outlined');
    button.disabled = true;
    button.classList.add('opacity-70');
    if (icon) icon.classList.add('animate-spin');
    try {
      await loadStudentReports();
      showToast('Student reports refreshed.', 'success');
    } finally {
      button.disabled = false;
      button.classList.remove('opacity-70');
      if (icon) icon.classList.remove('animate-spin');
    }
  });

  document.getElementById('approveAllRegistrationsBtn')?.addEventListener('click', async (event) => {
    const button = event.currentTarget;
    const icon = button.querySelector('.material-symbols-outlined');
    if (button.disabled) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: admins, error: adminError } = await supabase
      .from('admin_users')
      .select('user_id,role')
      .eq('user_id', user.id);

    const canApprove = user.id === OWNER_USER_ID || (admins || []).some(a => ['owner','admin','teacher','faculty','instructor'].includes(String(a.role || '').toLowerCase()));
    if (!canApprove) {
      showToast('Registration approval is restricted to authorized administrators and teachers.', 'error');
      return;
    }

    const { data: access } = await supabase.from('admin_users').select('role,assigned_section').eq('user_id', user.id).maybeSingle();
    const accessRole = String(access?.role || '').toLowerCase();
    const sectionStaff = ['teacher','faculty','instructor'].includes(accessRole);
    let pendingQuery = supabase.from('student_registrations').select('id,student_name,admission_no,email,status,section').eq('status', 'pending').order('created_at', { ascending: true });
    if (sectionStaff) pendingQuery = pendingQuery.eq('section', access?.assigned_section || '');
    const { data: registrations, error } = await pendingQuery;

    if (error) {
      showToast(error.message || 'Unable to load pending registrations.', 'error');
      return;
    }

    const pending = registrations || [];
    if (!pending.length) {
      showToast('There are no pending students to approve.', 'success');
      return;
    }

    if (!window.confirm(
      'Approve and accept all ' + pending.length + ' pending student registrations?\\n\\n' +
      'This will create their student accounts and mark the registrations as linked. ' +
      'The action will process students one by one.'
    )) return;

    button.disabled = true;
    button.classList.add('opacity-70');
    if (icon) icon.classList.add('animate-spin');
    const refreshButton = document.getElementById('refreshRegistrationsBtn');
    if (refreshButton) refreshButton.disabled = true;

    let approved = 0;
    let failed = 0;
    const failedNames = [];

    try {
      for (let index = 0; index < pending.length; index += 1) {
        const student = pending[index];
        button.innerHTML =
          '<span class="material-symbols-outlined text-[17px] animate-spin">progress_activity</span>' +
          'Approving ' + (index + 1) + '/' + pending.length;

        try {
          const { data, error: invokeError } = await supabase.functions.invoke('approve-student-registration', {
            body: { registration_id: student.id }
          });

          if (invokeError || data?.error) {
            throw new Error(data?.error || invokeError?.message || 'Approval failed.');
          }

          approved += 1;
        } catch (approvalError) {
          failed += 1;
          failedNames.push(student.student_name || student.admission_no || student.email || student.id);
          console.error('Bulk student approval failed:', student.id, approvalError);
        }
      }

      await loadStudentRegistrations();

      if (failed === 0) {
        showToast('Approved and accepted all ' + approved + ' students successfully.', 'success');
      } else {
        showToast(
          'Approved ' + approved + ' students. ' + failed + ' failed — please review those registrations and try again.',
          'error'
        );
        console.warn('Students that failed bulk approval:', failedNames);
      }
    } finally {
      button.disabled = false;
      button.classList.remove('opacity-70');
      button.innerHTML = '<span class="material-symbols-outlined text-[17px]">done_all</span>Approve & Accept All';
      if (refreshButton) refreshButton.disabled = false;
    }
  });

  async function loadAdminAccessControl() {
    const body = document.getElementById('adminAccessBody');
    const subtitle = document.getElementById('accessSubtitle');
    const ownerBadge = document.getElementById('ownerBadge');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !body) return;

    const { data: accessRows, error } = await supabase
      .from('admin_users')
      .select('user_id, role, authorized_at, authorized_by')
      .order('authorized_at', { ascending: true });

    if (error) {
      body.innerHTML = '<div class="text-xs text-error p-3 rounded-xl bg-error-container">Unable to load admin permissions. Check the Supabase RLS policies.</div>';
      return;
    }

    const allAccessRows = accessRows || [];
    const admins = allAccessRows.filter(a => ['owner', 'admin'].includes(String(a.role || '').toLowerCase()));
    const owner = user.id === OWNER_USER_ID || admins.some(a => a.user_id === user.id && String(a.role || '').toLowerCase() === 'owner');
    const currentAccess = allAccessRows.find(a => a.user_id === user.id);
    const teacherAccess = ['teacher','faculty','instructor'].includes(String(currentAccess?.role || '').toLowerCase());
    const adminCanAuthorize = owner;
    if (owner) ownerBadge?.classList.remove('hidden');
    subtitle.textContent = owner
      ? 'You are the owner. Only the owner can authorize, revoke, and assign administrator accounts.'
      : teacherAccess
        ? 'You are an authorized teacher with admin-level campus management access. The owner manages administrator accounts.'
        : adminCanAuthorize
          ? 'You are an authorized admin. The owner manages administrator accounts and class assignments.'
          : 'You have Admin Panel access.';

    const adminIds = new Set(admins.map(a => a.user_id));
    const staffIds = new Set(allAccessRows.filter(a => ['teacher','faculty','instructor'].includes(String(a.role || '').toLowerCase())).map(a => a.user_id));
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
        const candidates = (profiles || []).filter(p => !adminIds.has(p.id) && !staffIds.has(p.id) && p.id !== OWNER_USER_ID);
        candidateHtml = `<div class="pt-3 border-t border-surface-container-high">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-xs font-bold uppercase tracking-wider text-outline">Authorize another student</h3>
            <span class="text-[10px] text-on-surface-variant">${candidates.length} available</span>
          </div>
          ${candidates.length ? `
            <div class="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
              <select id="authorizeAdminStudentSelect" class="w-full px-3 py-2.5 rounded-xl border border-surface-container-high bg-white text-xs outline-none focus:border-primary">
                <option value="">Select a student to authorize as admin...</option>
                ${candidates.map(p => `<option value="${p.id}">${p.name || 'Student'} — ${p.email || 'No email'}${p.section ? ' • ' + p.section : ''}</option>`).join('')}
              </select>
              <button id="authorizeSelectedAdminBtn" type="button" class="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold">Authorize Admin</button>
            </div>
            <div class="mt-2 text-[11px] text-on-surface-variant">Choose a student from the dropdown instead of scrolling through the full list.</div>
          ` : '<div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">No other student accounts are available yet.</div>'}
        </div>`;
      }
    }

    body.innerHTML = (rows || '<div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">No authorized administrators.</div>') + candidateHtml;

    body.querySelector('#authorizeSelectedAdminBtn')?.addEventListener('click', async () => {
      const select = body.querySelector('#authorizeAdminStudentSelect');
      const selectedUserId = select?.value;
      if (!selectedUserId) {
        showToast('Select a student first.', 'error');
        return;
      }

      const btn = body.querySelector('#authorizeSelectedAdminBtn');
      btn.disabled = true;
      const { error: insertError } = await supabase.from('admin_users').insert({ user_id: selectedUserId, role: 'admin', authorized_by: user.id });
      if (insertError) {
        showToast(insertError.message, 'error');
        btn.disabled = false;
        return;
      }
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
  async function loadSectionStudents() {
    const body = document.getElementById('sectionStudentsBody');
    if (!body) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: access } = await supabase
      .from('admin_users')
      .select('role,assigned_section')
      .eq('user_id', user.id)
      .maybeSingle();

    const role = String(access?.role || '').toLowerCase();
    const owner = user.id === OWNER_USER_ID || role === 'owner';
    const staff = ['teacher','faculty','instructor'].includes(role);
    const ownerSectionSelect = document.getElementById('ownerSectionSelect');
    const ownerSectionBadge = document.getElementById('ownerSectionBadge');
    if (owner) {
      ownerSectionSelect?.classList.remove('hidden');
      ownerSectionBadge?.classList.remove('hidden');
      if (ownerSectionSelect && !ownerSectionSelect.value) {
        ownerSectionSelect.value = 'CSM1';
      }
    }
    if (!owner && !staff) {
      body.innerHTML = '<div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">Section student management is restricted.</div>';
      return;
    }

    const selectedOwnerSection = owner ? String(ownerSectionSelect?.value || '').trim() : '';
    let query = supabase.from('profiles').select('id,name,email,roll_number,program,term,section').order('name', { ascending: true });
    if (staff) {
      query = query.eq('section', access?.assigned_section || '').neq('program', 'Faculty');
    } else if (owner && selectedOwnerSection) {
      query = query.eq('section', selectedOwnerSection).neq('program', 'Faculty');
    }
    const { data: students, error } = await query;
    if (error) {
      body.innerHTML = '<div class="text-xs text-error p-3 rounded-xl bg-error-container">Unable to load students: ' + escReportValue(error.message) + '</div>';
      return;
    }

    const section = staff ? access?.assigned_section : (selectedOwnerSection || 'No section selected');
    const subtitle = document.getElementById('sectionStudentsSubtitle');
    if (subtitle) {
      subtitle.textContent = staff
        ? 'Manage students in ' + section + ' only.'
        : 'Owner view • Manage students in ' + section + ' only.';
    }
    if (!students?.length) {
      body.innerHTML = '<div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">No students found in ' + escReportValue(section || 'this section') + '.</div>';
      return;
    }

    body.innerHTML = students.map(student => '<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-surface-container-low border border-surface-container-high">' +
      '<div class="min-w-0">' +
        '<div class="text-sm font-bold">' + escReportValue(student.name || 'Student') + '</div>' +
        '<div class="text-[11px] text-on-surface-variant mt-1">' + escReportValue(student.email || '') + ' • ' + escReportValue(student.roll_number || 'No roll number') + ' • ' + escReportValue(student.section || '') + '</div>' +
      '</div>' +
      '<button type="button" data-remove-student="' + escReportValue(student.id) + '" class="px-3 py-2 rounded-lg bg-error-container text-on-error-container text-xs font-bold">Remove Student</button>' +
    '</div>').join('');

    body.querySelectorAll('[data-remove-student]').forEach(button => {
      button.addEventListener('click', async () => {
        if (!confirm('Remove this student from campus access? They will be signed out and their profile will be removed.')) return;
        button.disabled = true;
        const { data, error } = await supabase.functions.invoke('remove-student-account', { body: { student_id: button.dataset.removeStudent } });
        if (error || data?.error) {
          showToast(data?.error || error?.message || 'Could not remove student.', 'error');
          button.disabled = false;
          return;
        }
        showToast('Student removed from campus access.', 'success');
        await loadSectionStudents();
      });
    });
  }

  async function loadStudentReports() {
    const body = document.getElementById('studentReportsBody');
    const countBadge = document.getElementById('studentReportsOpenCount');
    if (!body) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: access } = await supabase
      .from('admin_users')
      .select('user_id,role,assigned_section')
      .eq('user_id', user.id)
      .maybeSingle();

    const canView = user.id === OWNER_USER_ID || ['owner','admin'].includes(String(access?.role || '').toLowerCase());
    if (!canView) {
      body.innerHTML = '<div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">Student reports are restricted to the owner and authorized administrators.</div>';
      if (countBadge) countBadge.textContent = '0 open';
      return;
    }

    const { data: reports, error } = await supabase
      .from('student_reports')
      .select('id,reporter_id,category,subject,details,affected_page,priority,status,admin_note,created_at,updated_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      body.innerHTML = '<div class="text-xs text-error p-3 rounded-xl bg-error-container">Unable to load student reports: ' + String(error.message || 'Unknown error') + '</div>';
      return;
    }

    const ids = [...new Set((reports || []).map(r => r.reporter_id).filter(Boolean))];
    const { data: profiles } = ids.length
      ? await supabase.from('profiles').select('id,name,email,section,roll_number').in('id', ids)
      : { data: [] };
    const profileMap = new Map((profiles || []).map(p => [p.id, p]));

    const visibleReports = (reports || []).filter(r => {
      if (user.id === OWNER_USER_ID || access?.role === 'owner') return true;
      const profile = profileMap.get(r.reporter_id);
      return ['admin','teacher','faculty','instructor'].includes(String(access?.role || '').toLowerCase()) && access?.assigned_section && profile?.section === access.assigned_section;
    });

    const openCount = visibleReports.filter(r => r.status === 'open' || r.status === 'in_review').length;
    if (countBadge) countBadge.textContent = openCount + ' open';

    if (!visibleReports.length) {
      body.innerHTML = '<div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">No student reports found.</div>';
      return;
    }

    const categoryLabels = {
      bug: 'Bug / App problem',
      person: 'Report a person',
      content: 'Content / Notice / Event',
      account: 'Account / Login',
      other: 'Other concern'
    };

    const priorityClasses = {
      high: 'bg-error-container text-on-error-container',
      medium: 'bg-amber-100 text-amber-800',
      low: 'bg-surface-container text-on-surface-variant'
    };

    body.innerHTML = visibleReports.map(r => {
      const p = profileMap.get(r.reporter_id) || {};
      const created = r.created_at ? new Date(r.created_at).toLocaleString() : '';
      return '<article class="p-4 rounded-2xl border border-surface-container-high bg-surface-container-low" data-report-id="' + escReportValue(r.id) + '">' +
        '<div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">' +
          '<div class="min-w-0 flex-1">' +
            '<div class="flex flex-wrap items-center gap-2">' +
              '<span class="text-sm font-bold">' + escReportValue(r.subject) + '</span>' +
              '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-fixed text-on-primary-fixed">' + escReportValue(categoryLabels[r.category] || r.category || 'Report') + '</span>' +
              '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold ' + (priorityClasses[r.priority] || priorityClasses.medium) + '">' + escReportValue(String(r.priority || 'medium').toUpperCase()) + '</span>' +
            '</div>' +
            '<div class="text-[11px] text-on-surface-variant mt-1">' + escReportValue(p.name || 'Student') + ' • ' + escReportValue(p.email || '') + (p.section ? ' • Section ' + escReportValue(p.section) : '') + (p.roll_number ? ' • ' + escReportValue(p.roll_number) : '') + '</div>' +
            '<div class="text-[11px] text-outline mt-0.5">' + escReportValue(created) + (r.affected_page ? ' • Page: ' + escReportValue(r.affected_page) : '') + '</div>' +
          '</div>' +
          '<select data-report-status="' + escReportValue(r.id) + '" class="px-3 py-2 rounded-lg border border-surface-container-high bg-white text-xs font-semibold">' +
            '<option value="open"' + (r.status === 'open' ? ' selected' : '') + '>Open</option>' +
            '<option value="in_review"' + (r.status === 'in_review' ? ' selected' : '') + '>In Review</option>' +
            '<option value="resolved"' + (r.status === 'resolved' ? ' selected' : '') + '>Resolved</option>' +
            '<option value="rejected"' + (r.status === 'rejected' ? ' selected' : '') + '>Rejected</option>' +
          '</select>' +
        '</div>' +
        '<div class="mt-3 p-3 rounded-xl bg-white border border-surface-container-high text-sm text-on-surface whitespace-pre-wrap">' + escReportValue(r.details) + '</div>' +
        '<div class="mt-3 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-2">' +
          '<textarea data-report-note="' + escReportValue(r.id) + '" rows="2" maxlength="3000" placeholder="Admin note / action taken..." class="w-full px-3 py-2.5 rounded-xl border border-surface-container-high bg-white text-xs outline-none focus:border-primary">' + escReportValue(r.admin_note || '') + '</textarea>' +
          '<button data-save-report="' + escReportValue(r.id) + '" type="button" class="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold self-end">Save Update</button>' +
        '</div>' +
      '</article>';
    }).join('');

    body.querySelectorAll('[data-save-report]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.saveReport;
        const statusSelect = body.querySelector('[data-report-status="' + id + '"]');
        const noteInput = body.querySelector('[data-report-note="' + id + '"]');
        const nextStatus = statusSelect?.value || 'open';
        const update = {
          status: nextStatus,
          admin_note: noteInput?.value.trim() || null,
          updated_at: new Date().toISOString()
        };
        if (nextStatus === 'resolved') {
          update.resolved_at = new Date().toISOString();
          update.resolved_by = user.id;
        } else {
          update.resolved_at = null;
          update.resolved_by = null;
        }

        btn.disabled = true;
        btn.textContent = 'Saving...';
        const { error: updateError } = await supabase
          .from('student_reports')
          .update(update)
          .eq('id', id);
        if (updateError) {
          showToast(updateError.message || 'Could not update the report.', 'error');
          btn.disabled = false;
          btn.textContent = 'Save Update';
          return;
        }
        showToast('Report updated.', 'success');
        await loadStudentReports();
      });
    });
  }

  function escReportValue(value) {
    return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[ch]));
  }

  async function loadStudentLog() {
    const body = document.getElementById('studentLogBody');
    const searchInput = document.getElementById('studentLogSearch');
    const modal = document.getElementById('studentLogModal');
    const modalBody = document.getElementById('studentLogModalBody');
    if (!body) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: access } = await supabase
      .from('admin_users')
      .select('role,assigned_section')
      .eq('user_id', user.id)
      .maybeSingle();

    const role = String(access?.role || '').toLowerCase();
    const canView = user.id === OWNER_USER_ID || ['owner','admin'].includes(role);
    if (!canView) {
      body.innerHTML = '<div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">Student log is restricted to the owner and authorized administrators.</div>';
      return;
    }

    const [{ data: profiles, error: profileError }, { data: registrations }, { data: reports }] = await Promise.all([
      supabase.from('profiles').select('id,name,email,roll_number,program,term,section,cgpa').order('name', { ascending: true }),
      supabase.from('student_registrations').select('id,student_name,email,admission_no,section,status,created_at').order('created_at', { ascending: false }).limit(100),
      supabase.from('student_reports').select('id,reporter_id,subject,category,priority,status,created_at').order('created_at', { ascending: false }).limit(100)
    ]);

    if (profileError) {
      body.innerHTML = '<div class="text-xs text-error p-3 rounded-xl bg-error-container">Unable to load student profiles.</div>';
      return;
    }

    const profileMap = new Map((profiles || []).map(p => [p.id, p]));
    const emailMap = new Map((profiles || []).filter(p => p.email).map(p => [String(p.email).toLowerCase(), p]));
    const events = [];

    for (const report of (reports || [])) {
      const profile = profileMap.get(report.reporter_id);
      events.push({
        id: 'report-' + report.id,
        studentId: profile?.id || '',
        student: profile?.name || 'Student',
        email: profile?.email || '',
        section: profile?.section || '',
        time: report.created_at,
        kind: 'Report',
        detail: report.subject || report.category || 'Student report',
        status: report.status || 'open',
        priority: report.priority || 'medium'
      });
    }

    for (const registration of (registrations || [])) {
      const profile = emailMap.get(String(registration.email || '').toLowerCase());
      events.push({
        id: 'registration-' + registration.id,
        studentId: profile?.id || '',
        student: profile?.name || registration.student_name || 'Student',
        email: profile?.email || registration.email || '',
        section: profile?.section || registration.section || '',
        time: registration.created_at,
        kind: 'Registration',
        detail: 'Admission ' + (registration.admission_no || 'record'),
        status: registration.status || 'pending',
        priority: ''
      });
    }

    const query = String(searchInput?.value || '').trim().toLowerCase();
    const matchingProfiles = (profiles || []).filter(p => {
      if (!query) return true;
      return [p.name,p.email,p.roll_number,p.program,p.term,p.section].filter(Boolean).some(v => String(v).toLowerCase().includes(query));
    });
    const matchedIds = new Set(matchingProfiles.map(p => p.id));

    const filteredEvents = events
      .filter(e => !query || matchedIds.has(e.studentId) || [e.student,e.email,e.section,e.detail,e.kind,e.status].some(v => String(v || '').toLowerCase().includes(query)))
      .sort((a,b) => new Date(b.time || 0) - new Date(a.time || 0));

    const directoryOnly = !filteredEvents.length && matchingProfiles.length
      ? matchingProfiles.map(p => ({
          id: 'profile-' + p.id,
          studentId: p.id,
          student: p.name || 'Student',
          email: p.email || '',
          section: p.section || '',
          time: '',
          kind: 'Student',
          detail: 'Current profile',
          status: 'active',
          priority: ''
        }))
      : [];

    const rows = [...filteredEvents, ...directoryOnly].slice(0, 100);

    if (!rows.length) {
      body.innerHTML = '<div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">No student log entries match your search.</div>';
      return;
    }

    body.innerHTML = rows.map(entry => '<button type="button" data-student-log-id="' + escReportValue(entry.studentId) + '" class="w-full text-left p-3 rounded-xl bg-surface-container-low border border-surface-container-high hover:bg-surface-container transition-colors ' + (entry.studentId ? 'cursor-pointer' : 'cursor-default') + '">' +
      '<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">' +
        '<div class="min-w-0">' +
          '<div class="flex flex-wrap items-center gap-2">' +
            '<span class="text-sm font-bold truncate">' + escReportValue(entry.student) + '</span>' +
            '<span class="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">' + escReportValue(entry.kind) + '</span>' +
            (entry.status ? '<span class="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px] font-bold">' + escReportValue(entry.status) + '</span>' : '') +
          '</div>' +
          '<div class="text-[11px] text-on-surface-variant mt-1">' + escReportValue(entry.email) + (entry.section ? ' • Section ' + escReportValue(entry.section) : '') + '</div>' +
          '<div class="text-[11px] text-outline mt-0.5">' + escReportValue(entry.detail) + (entry.time ? ' • ' + escReportValue(new Date(entry.time).toLocaleString()) : '') + '</div>' +
        '</div>' +
        (entry.studentId ? '<span class="material-symbols-outlined text-primary text-[18px] shrink-0">chevron_right</span>' : '') +
      '</div>' +
    '</button>').join('');

    const openStudent = (studentId) => {
      if (!studentId || !modal || !modalBody) return;
      const p = profileMap.get(studentId);
      if (!p) {
        showToast('The student profile is no longer available.', 'error');
        return;
      }
      modalBody.innerHTML = [
        ['Name', p.name],
        ['Email', p.email],
        ['Roll / Admission', p.roll_number],
        ['Program', p.program],
        ['Term', p.term],
        ['Section', p.section],
        ['CGPA', p.cgpa]
      ].map(([label,value]) => '<div class="flex items-start justify-between gap-4 p-3 rounded-xl bg-surface-container-low border border-surface-container-high"><span class="text-[11px] font-bold uppercase tracking-wider text-outline">' + escReportValue(label) + '</span><span class="text-sm font-semibold text-on-surface text-right break-all">' + escReportValue(value || 'Not available') + '</span></div>').join('');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    };

    body.querySelectorAll('[data-student-log-id]').forEach(btn => {
      btn.addEventListener('click', () => openStudent(btn.dataset.studentLogId));
    });

    const closeStudent = () => {
      modal?.classList.add('hidden');
      modal?.classList.remove('flex');
    };
    modal?.querySelectorAll('[data-student-log-close]').forEach(btn => btn.onclick = closeStudent);
    modal?.querySelector('[data-student-log-backdrop]')?.addEventListener('click', closeStudent);
  }

  async function loadStudentRegistrations() {
    const body = document.getElementById('registrationApprovalBody');
    if (!body) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: admins } = await supabase.from('admin_users').select('user_id,role').eq('user_id', user.id);
    const canApprove = user.id === OWNER_USER_ID || (admins || []).some(a => ['owner','admin','teacher','faculty','instructor'].includes(String(a.role || '').toLowerCase()));
    if (!canApprove) {
      body.innerHTML = '<div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">Registration approval is restricted to authorized administrators.</div>';
      return;
    }

    const access = await supabase.from('admin_users').select('role,assigned_section').eq('user_id', user.id).maybeSingle();
    const accessRole = String(access.data?.role || '').toLowerCase();
    const sectionStaff = ['teacher','faculty','instructor'].includes(accessRole);
    let registrationQuery = supabase.from('student_registrations').select('id,admission_no,student_name,email,section,phone,status,created_at').order('created_at', { ascending: false });
    if (sectionStaff) registrationQuery = registrationQuery.eq('section', access.data?.assigned_section || '');
    const { data: registrations, error } = await registrationQuery;

    if (error) {
      body.innerHTML = '<div class="text-xs text-error p-3 rounded-xl bg-error-container">Unable to load student registrations.</div>';
      return;
    }

    if (!(registrations || []).length) {
      body.innerHTML = '<div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">No student registrations yet.</div>';
      return;
    }

    const pendingRegistrations = (registrations || []).filter(r => r.status === 'pending');
    const statusCounts = (registrations || []).reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});

    if (!registrations.length) {
      body.innerHTML = '<div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">No student registrations yet.</div>';
      return;
    }

    const statusSummary = `<div class="flex flex-wrap gap-2 mb-3">
      <span class="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">${statusCounts.pending || 0} pending</span>
      <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">${statusCounts.linked || 0} linked</span>
      <span class="px-2.5 py-1 rounded-full bg-error-container text-on-error-container text-[10px] font-bold">${statusCounts.rejected || 0} rejected</span>
      ${statusCounts.approved ? `<span class="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant text-[10px] font-bold">${statusCounts.approved} approved</span>` : ''}
    </div>`;

    if (!pendingRegistrations.length) {
      body.innerHTML = statusSummary + '<div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 font-semibold">There are no pending student registrations. All currently actionable students have been processed.</div>';
      return;
    }

    body.innerHTML = statusSummary + `
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3">
        <div>
          <label class="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1">Select student to approve</label>
          <select id="approveStudentSelect" class="w-full px-3 py-3 rounded-xl border border-surface-container-high bg-white text-sm outline-none focus:border-primary">
            <option value="">Select a pending student...</option>
            ${pendingRegistrations.map(r => `<option value="${r.id}">
              ${r.student_name || 'Student'} — ${r.admission_no || 'No admission no.'} • ${r.section || 'No section'}
            </option>`).join('')}
          </select>
          <div class="mt-2 text-[11px] text-on-surface-variant">Use the dropdown to switch between students without scrolling through the entire registration list.</div>
        </div>
        <div class="flex items-end">
          <button id="approveSelectedRegistrationBtn" type="button" disabled class="w-full lg:w-auto px-4 py-3 rounded-xl bg-primary text-on-primary text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed">Approve & Create Account</button>
        </div>
      </div>
      <div id="selectedRegistrationDetails" class="mt-3"></div>
    `;

    const registrationSelect = document.getElementById('approveStudentSelect');
    const approveSelectedBtn = document.getElementById('approveSelectedRegistrationBtn');
    const detailBox = document.getElementById('selectedRegistrationDetails');

    const renderSelectedRegistration = () => {
      const selectedId = registrationSelect?.value;
      const student = pendingRegistrations.find(r => r.id === selectedId);
      if (!student) {
        if (detailBox) detailBox.innerHTML = '<div class="p-3 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface-variant">Select a student to view their details.</div>';
        if (approveSelectedBtn) approveSelectedBtn.disabled = true;
        return;
      }

      if (detailBox) {
        detailBox.innerHTML = `
          <div class="p-4 rounded-2xl border border-primary/20 bg-surface-container-low">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-sm font-bold">${student.student_name || 'Student'}</span>
              <span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">PENDING</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-3 text-[11px]">
              <div><span class="font-bold">Admission No:</span> ${student.admission_no || '—'}</div>
              <div><span class="font-bold">Email:</span> ${student.email || '—'}</div>
              <div><span class="font-bold">Section:</span> ${student.section || '—'}</div>
              <div><span class="font-bold">Phone:</span> ${student.phone || '—'}</div>
            </div>
          </div>`;
      }
      if (approveSelectedBtn) approveSelectedBtn.disabled = false;
    };

    registrationSelect?.addEventListener('change', renderSelectedRegistration);
    renderSelectedRegistration();

    approveSelectedBtn?.addEventListener('click', async () => {
      const registrationId = registrationSelect?.value;
      if (!registrationId) {
        showToast('Select a student first.', 'error');
        return;
      }

      const selectedStudent = pendingRegistrations.find(r => r.id === registrationId);
      if (!selectedStudent) return;

      if (!confirm('Approve ' + (selectedStudent.student_name || 'this student') + ' and create their Supabase account?')) return;

      approveSelectedBtn.disabled = true;
      approveSelectedBtn.textContent = 'Creating...';

      let initialPassword = '';
      const { data: currentUserData } = await supabase.auth.getUser();
      const currentUser = currentUserData?.user;

      if (currentUser?.id === OWNER_USER_ID) {
        const enteredPassword = window.prompt('Enter the student initial password. Leave blank to keep the normal invitation/password-setup flow:');
        if (enteredPassword === null) {
          approveSelectedBtn.disabled = false;
          approveSelectedBtn.textContent = 'Approve & Create Account';
          return;
        }
        if (enteredPassword && enteredPassword.length < 8) {
          showToast('Password must be at least 8 characters.', 'error');
          approveSelectedBtn.disabled = false;
          approveSelectedBtn.textContent = 'Approve & Create Account';
          return;
        }
        initialPassword = enteredPassword;
      }

      const { data, error: invokeError } = await supabase.functions.invoke('approve-student-registration', {
        body: { registration_id: registrationId }
      });

      if (invokeError || data?.error) {
        showToast(data?.error || invokeError?.message || 'Approval failed.', 'error');
        approveSelectedBtn.disabled = false;
        approveSelectedBtn.textContent = 'Approve & Create Account';
        return;
      }

      if (initialPassword) {
        const { data: syncData, error: syncError } = await supabase.functions.invoke(
          'sync-student-default-password',
          { body: { password: initialPassword, registration_id: registrationId } }
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
        const row = document.querySelector(`[data-registration-id="${registrationId}"]`);
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

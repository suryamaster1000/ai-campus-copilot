import { supabase } from '../supabase.js';
import { showToast } from '../components/toast.js';

const OWNER_USER_ID = '53d68054-50f2-41b5-a666-5789db48ae02';
const SECTIONS = Array.from({ length: 8 }, (_, index) => 'CSM' + (index + 1));

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));
}

export async function renderAdminTeachers(mount) {
  if (!mount) return;

  const { data: { user } } = await supabase.auth.getUser();
  const { data: access } = user?.id
    ? await supabase.from('admin_users').select('role,assigned_section').eq('user_id', user.id).maybeSingle()
    : { data: null };
  const role = String(access?.role || '').toLowerCase();
  const isOwner = user?.id === OWNER_USER_ID || role === 'owner';
  const isSectionStaff = ['teacher','faculty','instructor'].includes(role);

  if (!isOwner && !isSectionStaff) {
    mount.innerHTML = '';
    return;
  }

  const quick = document.getElementById('ownerTeacherQuick');
  quick?.classList.remove('hidden');

  const manager = document.getElementById('adminTeacherManagement');
  manager?.classList.remove('hidden');

  mount.innerHTML = `
    <section class="bg-surface-container-lowest rounded-2xl p-space-md lg:p-space-lg border border-primary/30 shadow-sm">
      <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">school</span>
            <h2 class="font-headline-md text-base font-bold text-on-surface">Teacher Management</h2>
            <span class="px-2 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">SECTION MANAGEMENT</span>
          </div>
          <p class="text-xs text-on-surface-variant mt-1">Create faculty login accounts. Teachers can manage teacher accounts only within their assigned section; the owner can manage all sections.</p>
        </div>
        <button id="refreshTeachersBtn" type="button" class="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-surface-container text-on-surface text-xs font-bold border border-surface-container-high">
          <span class="material-symbols-outlined text-[17px]">refresh</span>
          Refresh
        </button>
      </div>

      <div class="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <form id="createTeacherForm" class="rounded-2xl bg-surface-container-low border border-surface-container-high p-4 space-y-3">
          <div>
            <div class="text-sm font-extrabold text-on-surface">Add Teacher</div>
            <div class="text-[11px] text-on-surface-variant mt-1">The username is the teacher's email address used at Faculty Login.</div>
          </div>

          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1">Teacher Name</label>
            <input id="teacherNameInput" type="text" minlength="2" maxlength="100" required autocomplete="name"
              class="w-full px-3 py-2.5 rounded-xl border border-surface-container-high bg-white text-sm outline-none focus:border-primary"
              placeholder="e.g. Ravi Kumar">
          </div>

          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1">Username / Email</label>
            <input id="teacherEmailInput" type="email" maxlength="254" required autocomplete="username"
              class="w-full px-3 py-2.5 rounded-xl border border-surface-container-high bg-white text-sm outline-none focus:border-primary"
              placeholder="teacher@campus.edu">
          </div>

          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1">Password</label>
            <input id="teacherPasswordInput" type="password" minlength="8" maxlength="72" required autocomplete="new-password"
              class="w-full px-3 py-2.5 rounded-xl border border-surface-container-high bg-white text-sm outline-none focus:border-primary"
              placeholder="Set initial password (8+ characters)">
            <div class="text-[10px] text-on-surface-variant mt-1">The password is sent only to the secure server-side account-creation function.</div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1">Assigned Section</label>
              <select id="teacherSectionInput" ${isSectionStaff ? 'disabled' : ''} required
                class="w-full px-3 py-2.5 rounded-xl border border-surface-container-high bg-white text-sm outline-none focus:border-primary">
                ${SECTIONS.map((section) => `<option value="${section}" ${isSectionStaff && access?.assigned_section === section ? 'selected' : ''}>${section}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1">Assigned Subject</label>
              <select id="teacherSubjectInput" required
                class="w-full px-3 py-2.5 rounded-xl border border-surface-container-high bg-white text-sm outline-none focus:border-primary">
                <option value="">Loading subjects...</option>
              </select>
            </div>
          </div>

          <button id="createTeacherBtn" type="submit" class="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-on-primary text-sm font-bold shadow-sm">
            <span class="material-symbols-outlined text-[18px]">person_add</span>
            Create Teacher Account
          </button>
          <div id="teacherCreateStatus" class="hidden rounded-xl px-3 py-2.5 text-xs"></div>
        </form>

        <div class="rounded-2xl bg-white border border-surface-container-high p-4">
          <div class="flex items-center justify-between gap-3">
            <div>
              <div class="text-sm font-extrabold text-on-surface">Authorized Teachers</div>
              <div class="text-[11px] text-on-surface-variant mt-1">Each account is restricted to its assigned section on the Faculty Portal.</div>
            </div>
            <span id="teacherCountBadge" class="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">0</span>
          </div>
          <div id="teacherList" class="mt-4 space-y-2">
            <div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">Loading teachers...</div>
          </div>
        </div>
      </div>
    </section>
  `;

  const editModal = document.createElement('div');
  editModal.id = 'teacherEditModal';
  editModal.className = 'fixed inset-0 z-[110] hidden items-center justify-center p-4';
  editModal.innerHTML = 
    '<div data-teacher-edit-backdrop class="absolute inset-0 bg-black/45 backdrop-blur-sm"></div>' +
    '<section role="dialog" aria-modal="true" class="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-2xl">' +
      '<div class="p-5 border-b border-slate-200 flex items-start justify-between gap-3">' +
        '<div><h3 class="text-lg font-extrabold text-slate-900">Edit Teacher</h3><p class="text-xs text-slate-500 mt-1">Owner-only teacher account management</p></div>' +
        '<button type="button" data-teacher-edit-close class="p-2 rounded-lg hover:bg-slate-100"><span class="material-symbols-outlined text-[20px]">close</span></button>' +
      '</div>' +
      '<form id="teacherEditForm" class="p-5 space-y-4">' +
        '<input id="teacherEditId" type="hidden">' +
        '<div><label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Teacher Name</label><input id="teacherEditName" required maxlength="120" class="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"></div>' +
        '<div><label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Username / Email</label><input id="teacherEditEmail" type="email" required maxlength="254" class="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"></div>' +
        '<div class="grid grid-cols-2 gap-3"><div><label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Assigned Section</label><select id="teacherEditSection" required class="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm">' +
          SECTIONS.map((section) => '<option value="' + section + '">' + section + '</option>').join('') +
        '</select></div><div><label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Assigned Subject</label><select id="teacherEditSubject" required class="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"><option value="">Select subject...</option></select></div></div>' +
        '<div id="teacherEditStatus" class="hidden rounded-xl px-3 py-2.5 text-xs"></div>' +
        '<div class="flex justify-end gap-2"><button type="button" data-teacher-edit-close class="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">Cancel</button><button id="teacherEditSave" type="submit" class="px-5 py-2.5 rounded-xl bg-blue-700 text-white text-xs font-bold">Save Changes</button></div>' +
      '</form>' +
    '</section>';
  document.body.appendChild(editModal);

  async function loadTeachers() {
    const list = document.getElementById('teacherList');
    const badge = document.getElementById('teacherCountBadge');
    if (!list) return;

    list.innerHTML = '<div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">Loading teachers...</div>';

    const { data: teachers, error } = await supabase
      .from('admin_users')
      .select('user_id,role,assigned_section,assigned_subject,authorized_at,subjects:assigned_subject(id,name,code)')
      .in('role', ['teacher','faculty','instructor'])
      .order('authorized_at', { ascending: true });

    if (error) {
      list.innerHTML = '<div class="text-xs text-error p-3 rounded-xl bg-error-container">Unable to load teacher accounts.</div>';
      return;
    }

    const visibleTeachers = isSectionStaff
      ? (teachers || []).filter(row => row.assigned_section === access?.assigned_section)
      : (teachers || []);

    const ids = visibleTeachers.map((row) => row.user_id);
    const { data: profiles } = ids.length
      ? await supabase.from('profiles').select('id,name,email,section').in('id', ids)
      : { data: [] };

    const profileMap = new Map((profiles || []).map((profile) => [profile.id, profile]));
    badge.textContent = String(visibleTeachers.length);

    if (!visibleTeachers.length) {
      list.innerHTML = '<div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">No teacher accounts have been created yet.</div>';
      return;
    }

    list.innerHTML = visibleTeachers.map((teacher) => {
      const profile = profileMap.get(teacher.user_id) || {};
      const section = String(teacher.assigned_section || '').trim();
      return '<div class="p-3 rounded-xl border border-surface-container-high bg-surface-container-low">' +
        '<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">' +
          '<div class="min-w-0">' +
            '<div class="text-sm font-bold truncate">' + esc(profile.name || 'Teacher') + '</div>' +
            '<div class="text-[11px] text-on-surface-variant truncate mt-1">' + esc(profile.email || teacher.user_id) + '</div>' +
          '</div>' +
          '<div class="flex items-center gap-2">' +
            '<span class="px-3 py-2 rounded-lg bg-primary-fixed text-on-primary-fixed text-xs font-bold">' + esc(section || 'Unassigned') + '</span>' +
            '<span class="px-3 py-2 rounded-lg bg-secondary-container text-on-secondary-container text-xs font-bold">' + esc(teacher.subjects?.code ? teacher.subjects.code + ' — ' + teacher.subjects.name : teacher.subjects?.name || 'No subject') + '</span>' +
            '<button type="button" data-edit-teacher="' + esc(teacher.user_id) + '" aria-label="Edit ' + esc(profile.name || 'teacher') + '" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-on-primary text-xs font-extrabold shadow-sm">✎ Edit</button>' +
            (teacher.user_id !== user?.id ? '<button type="button" data-remove-teacher="' + esc(teacher.user_id) + '" class="px-3 py-2 rounded-lg bg-error-container text-on-error-container text-xs font-bold">Remove</button>' : '') +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    list.onclick = async (event) => {
      const editButton = event.target.closest('[data-edit-teacher]');
      if (editButton) {
        await openTeacherEdit(editButton.dataset.editTeacher);
        return;
      }

      const removeButton = event.target.closest('[data-remove-teacher]');
      if (removeButton) {
        const teacherId = removeButton.dataset.removeTeacher;
        if (!teacherId || !confirm('Remove this teacher account from the campus?')) return;
        removeButton.disabled = true;
        const { data, error } = await supabase.functions.invoke('remove-teacher-account', { body: { teacher_id: teacherId } });
        if (error || data?.error) {
          showToast(data?.error || error?.message || 'Could not remove teacher.', 'error');
          removeButton.disabled = false;
          return;
        }
        showToast('Teacher account removed.', 'success');
        await loadTeachers();
      }
    };
  }

  function closeTeacherEdit() {
    editModal.classList.add('hidden');
    editModal.classList.remove('flex');
  }

  async function openTeacherEdit(teacherId) {
    if (!isOwner) {
      showToast('Only the Owner can edit teacher accounts.', 'error');
      return;
    }
    const status = document.getElementById('teacherEditStatus');
    const subjectSelect = document.getElementById('teacherEditSubject');
    const saveButton = document.getElementById('teacherEditSave');
    const [profileRes, accessRes] = await Promise.all([
      supabase.from('profiles').select('name,email').eq('id', teacherId).maybeSingle(),
      supabase.from('admin_users').select('assigned_section,assigned_subject,role').eq('user_id', teacherId).maybeSingle()
    ]);
    if (profileRes.error || accessRes.error || !accessRes.data) {
      showToast(profileRes.error?.message || accessRes.error?.message || 'Teacher account could not be loaded.', 'error');
      return;
    }
    if (!['teacher','faculty','instructor'].includes(String(accessRes.data.role || '').toLowerCase())) {
      showToast('This account is not a teacher account.', 'error');
      return;
    }
    document.getElementById('teacherEditId').value = teacherId;
    document.getElementById('teacherEditName').value = profileRes.data?.name || '';
    document.getElementById('teacherEditEmail').value = profileRes.data?.email || '';
    document.getElementById('teacherEditSection').value = accessRes.data.assigned_section || SECTIONS[0];
    subjectSelect.innerHTML = '<option value="">Select subject...</option>' + subjects.map((subject) => '<option value="' + esc(subject.id) + '">' + esc((subject.code ? subject.code + ' — ' : '') + (subject.name || 'Subject')) + '</option>').join('');
    subjectSelect.value = accessRes.data.assigned_subject || '';
    status.className = 'hidden';
    saveButton.disabled = false;
    saveButton.textContent = 'Save Changes';
    editModal.classList.remove('hidden');
    editModal.classList.add('flex');
    setTimeout(() => document.getElementById('teacherEditName')?.focus(), 0);
  }

  editModal.querySelectorAll('[data-teacher-edit-close]').forEach((button) => button.addEventListener('click', closeTeacherEdit));
  editModal.querySelector('[data-teacher-edit-backdrop]')?.addEventListener('click', closeTeacherEdit);
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeTeacherEdit(); });

  document.getElementById('teacherEditForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!isOwner) return showToast('Only the Owner can edit teacher accounts.', 'error');
    const id = document.getElementById('teacherEditId').value;
    const status = document.getElementById('teacherEditStatus');
    const saveButton = document.getElementById('teacherEditSave');
    const payload = {
      teacher_id: id,
      name: document.getElementById('teacherEditName').value.trim(),
      email: document.getElementById('teacherEditEmail').value.trim().toLowerCase(),
      section: document.getElementById('teacherEditSection').value,
      subject_id: document.getElementById('teacherEditSubject').value
    };
    saveButton.disabled = true;
    saveButton.textContent = 'Saving...';
    status.className = 'rounded-xl px-3 py-2.5 text-xs bg-blue-50 border border-blue-100 text-blue-800';
    status.textContent = 'Updating secure teacher account...';
    try {
      const { data, error } = await supabase.functions.invoke('owner-update-teacher', { body: payload });
      if (error || data?.error) throw new Error(data?.error || error?.message || 'Teacher update failed.');
      status.className = 'rounded-xl px-3 py-2.5 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800';
      status.textContent = 'Teacher account updated successfully.';
      showToast('Teacher account updated.', 'success');
      await loadTeachers();
      setTimeout(closeTeacherEdit, 250);
    } catch (error) {
      status.className = 'rounded-xl px-3 py-2.5 text-xs bg-red-50 border border-red-200 text-red-700';
      status.textContent = error?.message || 'Teacher update failed.';
      showToast(status.textContent, 'error');
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = 'Save Changes';
    }
  });

  document.getElementById('createTeacherForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const button = document.getElementById('createTeacherBtn');
    const status = document.getElementById('teacherCreateStatus');
    const name = document.getElementById('teacherNameInput')?.value.trim() || '';
    const email = document.getElementById('teacherEmailInput')?.value.trim() || '';
    const password = document.getElementById('teacherPasswordInput')?.value || '';
    const section = isSectionStaff ? String(access?.assigned_section || '').trim() : (document.getElementById('teacherSectionInput')?.value || '');
    const subjectId = document.getElementById('teacherSubjectInput')?.value || '';

    if (password.length < 8) {
      showToast('Password must be at least 8 characters.', 'error');
      return;
    }
    if (!subjectId) {
      showToast('Please select a subject.', 'error');
      return;
    }

    button.disabled = true;
    button.textContent = 'Creating Teacher...';
    status.className = 'rounded-xl px-3 py-2.5 text-xs bg-blue-50 border border-blue-100 text-blue-800';
    status.textContent = 'Creating secure Supabase login, section and subject assignment...';

    try {
      const { data, error } = await supabase.functions.invoke('create-teacher-account', {
        body: { name, email, password, section, subject_id: subjectId }
      });

      if (error || data?.error) {
        throw new Error(data?.error || error?.message || 'Teacher account creation failed.');
      }

      status.className = 'rounded-xl px-3 py-2.5 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800';
      status.textContent = 'Teacher account created successfully for ' + section + '. The assigned subject is now restricted to this faculty account.';
      form.reset();

      showToast('Teacher account created.', 'success');
      await Promise.all([loadSubjects(), loadTeachers()]);
    } catch (error) {
      status.className = 'rounded-xl px-3 py-2.5 text-xs bg-error-container text-on-error-container';
      status.textContent = error?.message || 'Teacher account creation failed.';
      showToast(status.textContent, 'error');
    } finally {
      button.disabled = false;
      button.innerHTML = '<span class="material-symbols-outlined text-[18px]">person_add</span>Create Teacher Account';
    }
  });

  async function loadSubjects() {
    const select = document.getElementById('teacherSubjectInput');
    if (!select) return;
    const { data, error } = await supabase
      .from('subjects')
      .select('id,name,code,term')
      .order('term', { ascending: true })
      .order('code', { ascending: true });
    if (error) {
      select.innerHTML = '<option value="">Unable to load subjects</option>';
      showToast('Subjects could not be loaded: ' + error.message, 'error');
      return;
    }
    select.innerHTML = data?.length
      ? '<option value="">Select a subject...</option>' + data.map(subject =>
          '<option value="' + esc(subject.id) + '">' +
          esc((subject.code ? subject.code + ' — ' : '') + (subject.name || 'Subject')) +
          '</option>'
        ).join('')
      : '<option value="">No subjects found</option>';
  }

  document.getElementById('refreshTeachersBtn')?.addEventListener('click', loadTeachers);
  document.getElementById('openTeacherManager')?.addEventListener('click', () => {
    document.getElementById('adminTeacherManagement')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  await Promise.all([loadSubjects(), loadTeachers()]);
}

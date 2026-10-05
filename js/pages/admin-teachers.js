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
  const isOwner = user?.id === OWNER_USER_ID;

  if (!isOwner) {
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
            <span class="px-2 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">OWNER ONLY</span>
          </div>
          <p class="text-xs text-on-surface-variant mt-1">Create faculty login accounts and assign each teacher to CSM1–CSM8. Teacher passwords are set by you during account creation and are not displayed afterward.</p>
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
              <select id="teacherSectionInput" required
                class="w-full px-3 py-2.5 rounded-xl border border-surface-container-high bg-white text-sm outline-none focus:border-primary">
                ${SECTIONS.map((section) => `<option value="${section}">${section}</option>`).join('')}
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

    const ids = (teachers || []).map((row) => row.user_id);
    const { data: profiles } = ids.length
      ? await supabase.from('profiles').select('id,name,email,section').in('id', ids)
      : { data: [] };

    const profileMap = new Map((profiles || []).map((profile) => [profile.id, profile]));
    badge.textContent = String((teachers || []).length);

    if (!teachers?.length) {
      list.innerHTML = '<div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">No teacher accounts have been created yet.</div>';
      return;
    }

    list.innerHTML = teachers.map((teacher) => {
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
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

  }

  document.getElementById('createTeacherForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const button = document.getElementById('createTeacherBtn');
    const status = document.getElementById('teacherCreateStatus');
    const name = document.getElementById('teacherNameInput')?.value.trim() || '';
    const email = document.getElementById('teacherEmailInput')?.value.trim() || '';
    const password = document.getElementById('teacherPasswordInput')?.value || '';
    const section = document.getElementById('teacherSectionInput')?.value || '';
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

  await loadTeachers();
}

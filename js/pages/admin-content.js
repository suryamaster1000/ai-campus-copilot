import { supabase } from '../supabase.js';
import { showToast } from '../components/toast.js';

const OWNER_USER_ID = '53d68054-50f2-41b5-a666-5789db48ae02';
const STANDARD_SECTIONS = Array.from({ length: 8 }, (_, index) => 'CSM' + (index + 1));

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));
}

function selected(value, current) {
  return String(value ?? '') === String(current ?? '') ? ' selected' : '';
}

function localDateTimeValue(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
    'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

function expiryFromChoice(choice, customValue, baseValue = new Date()) {
  if (choice === 'none') return null;
  if (choice === 'custom') {
    if (!customValue) throw new Error('Choose a custom display-until date and time.');
    const custom = new Date(customValue);
    if (Number.isNaN(custom.getTime()) || custom <= new Date()) {
      throw new Error('Custom display-until date and time must be in the future.');
    }
    return custom.toISOString();
  }
  const days = Number.parseInt(String(choice).replace('d', ''), 10);
  if (!Number.isFinite(days)) throw new Error('Choose a valid display duration.');
  const base = new Date(baseValue);
  if (Number.isNaN(base.getTime())) throw new Error('Choose a valid date and time.');
  base.setDate(base.getDate() + days);
  return base.toISOString();
}

function eventDisplayUntil(choice, customValue, startsAt, endsAt) {
  const base = endsAt || startsAt;
  if (!base) throw new Error('Choose the event start time before setting display duration.');
  if (choice === 'event_end') return new Date(base).toISOString();
  return expiryFromChoice(choice, customValue, new Date(base));
}

export async function renderAdminContent(mount) {
  if (!mount) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: access } = await supabase
    .from('admin_users')
    .select('user_id,role,assigned_section')
    .eq('user_id', user.id)
    .maybeSingle();

  const owner = user.id === OWNER_USER_ID || access?.role === 'owner';
  const teacherRole = ['teacher','faculty','instructor'].includes(String(access?.role || '').toLowerCase());
  const authorized = owner || access?.role === 'admin' || teacherRole;

  if (!authorized) {
    mount.innerHTML = '';
    return;
  }

  const [sectionsRes, subjectsRes, facultyRes, programsRes] = await Promise.all([
    supabase.from('admission_directory').select('section').limit(1000),
    supabase.from('subjects').select('id,program_id,code,name,description,credits,term').order('name'),
    supabase.from('faculty').select('id,name,department,designation').order('name'),
    supabase.from('programs').select('id,code,name,duration_years').order('name')
  ]);

  const sections = [...new Set([
    ...STANDARD_SECTIONS,
    ...(sectionsRes.data || [])
      .map(r => String(r.section || '').trim())
      .filter(Boolean)
  ])].sort();

  const assignedSection = String(access?.assigned_section || '').trim();
  const allowedSections = owner ? sections : (assignedSection ? [assignedSection] : []);
  const defaultTerm = (subjectsRes.data || []).find(s => s.term)?.term || 'Term 4';

  mount.innerHTML = `
    <section class="bg-surface-container-lowest rounded-2xl p-space-md lg:p-space-lg border border-primary/30 shadow-sm">
      <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">edit_calendar</span>
            <h2 class="font-headline-md text-base font-bold text-on-surface">Campus Content Management</h2>
            <span class="px-2 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">${owner ? 'OWNER' : (teacherRole ? 'TEACHER' : 'ADMIN')}</span>
          </div>
          <p class="text-xs text-on-surface-variant mt-1">
            Add live notices, events, timetables, exams and academic assignments directly to the campus database.
            ${owner ? 'You can manage every section.' : 'Section-based records are restricted to your assigned class: ' + esc(assignedSection || 'Not assigned') + '.'}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-1.5 overflow-x-auto mt-5 pb-1" role="tablist">
        <button data-content-tab="notice" class="content-tab px-3 py-2 rounded-xl text-xs font-bold bg-primary text-on-primary">Notices</button>
        <button data-content-tab="event" class="content-tab px-3 py-2 rounded-xl text-xs font-bold bg-surface-container text-on-surface-variant">Events</button>
        <button data-content-tab="timetable" class="content-tab px-3 py-2 rounded-xl text-xs font-bold bg-surface-container text-on-surface-variant">Timetable</button>
        <button data-content-tab="exam" class="content-tab px-3 py-2 rounded-xl text-xs font-bold bg-surface-container text-on-surface-variant">Exams</button>
        <button data-content-tab="assignment" class="content-tab px-3 py-2 rounded-xl text-xs font-bold bg-surface-container text-on-surface-variant">Assignments</button>
      </div>

      <div id="adminContentTabBody" class="mt-4"></div>
      <div id="adminContentStatus" class="mt-3 text-[11px] text-on-surface-variant"></div>
    </section>
  `;

  const tabBody = document.getElementById('adminContentTabBody');
  const status = document.getElementById('adminContentStatus');

  const commonClassOptions = allowedSections.length
    ? allowedSections.map(s => `<option value="${esc(s)}"${selected(s, assignedSection || allowedSections[0])}>${esc(s)}</option>`).join('')
    : '<option value="">No class assigned</option>';

  const subjectOptions = (subjectsRes.data || []).map(s =>
    `<option value="${esc(s.id)}">${esc(s.code || 'SUBJECT')} — ${esc(s.name || '')} (${esc(s.term || '')})</option>`
  ).join('');

  const facultyOptions = (facultyRes.data || []).map(f =>
    `<option value="${esc(f.id)}">${esc(f.name || '')}${f.designation ? ' — ' + esc(f.designation) : ''}</option>`
  ).join('');

  const programOptions = (programsRes.data || []).map(p =>
    `<option value="${esc(p.id)}">${esc(p.code || '')} — ${esc(p.name || '')}</option>`
  ).join('');

  function setStatus(message, ok = true) {
    status.textContent = message;
    status.className = 'mt-3 text-[11px] ' + (ok ? 'text-emerald-700' : 'text-error');
  }


  // ─── Existing record management ───────────────────────────────────────────
  const managerConfig = {
    notice: {
      label: 'Notices',
      table: 'notices',
      icon: 'campaign',
      order: 'published_at',
      title: r => r.title || 'Untitled notice',
      meta: r => (r.category || 'Notice') + ' • ' + (r.is_published ? 'Published' : 'Draft'),
      empty: 'No notices found.'
    },
    event: {
      label: 'Events',
      table: 'events',
      icon: 'event',
      order: 'starts_at',
      title: r => r.title || 'Untitled event',
      meta: r => (r.event_type || 'Campus Event') + ' • ' + (r.is_published ? 'Published' : 'Draft'),
      empty: 'No events found.'
    },
    timetable: {
      label: 'Timetable',
      table: 'timetable',
      icon: 'schedule',
      order: 'created_at',
      title: r => {
        const s = (subjectsRes.data || []).find(x => x.id === r.subject_id);
        return (s?.code || 'Class') + ' • ' + (s?.name || 'Subject');
      },
      meta: r => [r.section || 'No section', r.day_of_week, r.start_time?.slice(0,5) + '–' + r.end_time?.slice(0,5)].filter(Boolean).join(' • '),
      empty: 'No timetable records found.'
    },
    exam: {
      label: 'Exams',
      table: 'exams',
      icon: 'event_note',
      order: 'exam_date',
      title: r => {
        const s = (subjectsRes.data || []).find(x => x.id === r.subject_id);
        return (s?.code || 'Exam') + ' • ' + (s?.name || 'Subject');
      },
      meta: r => [r.section || 'No section', r.exam_type || 'Exam', r.exam_date || 'No date'].filter(Boolean).join(' • '),
      empty: 'No exam records found.'
    },
    assignment: {
      label: 'Assignments',
      table: 'academic_assignments',
      icon: 'assignment',
      order: 'created_at',
      title: r => r.title || 'Untitled assignment',
      meta: r => {
        const s = (subjectsRes.data || []).find(x => x.id === r.subject_id);
        return [s?.code || 'No subject', r.due_date ? 'Due ' + r.due_date : 'No due date'].join(' • ');
      },
      empty: 'No assignment records found.'
    }
  };

  const managerSection = document.createElement('section');
  managerSection.className = 'bg-surface-container-lowest rounded-2xl p-space-md lg:p-space-lg border border-surface-container-high shadow-sm';
  managerSection.innerHTML = `
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
      <div>
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary">manage_search</span>
          <h2 class="font-headline-md text-base font-bold text-on-surface">Manage Existing Content</h2>
        </div>
        <p class="text-xs text-on-surface-variant mt-1">Search, edit, publish/unpublish, or delete live campus records. Permissions are still enforced by Supabase RLS.</p>
      </div>
      <div class="flex items-center gap-2">
        <select id="contentManagerKind" class="px-3 py-2.5 rounded-xl border border-surface-container-high bg-white text-xs font-semibold">
          <option value="notice">Notices</option>
          <option value="event">Events</option>
          <option value="timetable">Timetable</option>
          <option value="exam">Exams</option>
          <option value="assignment">Assignments</option>
        </select>
        <button id="refreshContentManagerBtn" type="button" class="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-surface-container text-on-surface text-xs font-bold border border-surface-container-high">
          <span class="material-symbols-outlined text-[17px]">refresh</span> Refresh
        </button>
      </div>
    </div>
    <div class="mt-3 relative">
      <span class="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">search</span>
      <input id="contentManagerSearch" class="w-full pl-9 pr-3 py-2.5 rounded-xl border border-surface-container-high bg-white text-xs outline-none focus:border-primary" placeholder="Search existing records..." autocomplete="off">
    </div>
    <div id="contentManagerList" class="mt-4 space-y-2"></div>

    <div id="contentEditorModal" class="fixed inset-0 z-[70] hidden items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div class="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-surface-container-high p-5">
        <div class="flex items-center justify-between gap-3 border-b border-surface-container-high pb-3">
          <div>
            <h3 id="contentEditorTitle" class="text-base font-bold text-on-surface">Edit Content</h3>
            <p id="contentEditorMeta" class="text-[11px] text-on-surface-variant mt-0.5"></p>
          </div>
          <button id="closeContentEditorBtn" type="button" class="p-2 rounded-lg text-outline hover:bg-surface-container">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <form id="contentEditorForm" class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3"></form>
      </div>
    </div>
  `;
  mount.appendChild(managerSection);

  const managerKind = managerSection.querySelector('#contentManagerKind');
  const managerSearch = managerSection.querySelector('#contentManagerSearch');
  const managerList = managerSection.querySelector('#contentManagerList');
  const managerModal = managerSection.querySelector('#contentEditorModal');
  const managerForm = managerSection.querySelector('#contentEditorForm');
  const managerTitle = managerSection.querySelector('#contentEditorTitle');
  const managerMeta = managerSection.querySelector('#contentEditorMeta');

  let managerRows = [];
  let managerEditing = null;

  const formatDateTime = (value) => value ? new Date(value).toLocaleString() : '—';

  function managerFields(kind, row) {
    const common = (inner) => inner + `
      <div class="md:col-span-2 pt-2 flex items-center justify-end gap-2">
        <button id="cancelContentEditBtn" type="button" class="px-4 py-2.5 rounded-xl bg-surface-container text-on-surface text-xs font-bold">Cancel</button>
        <button type="submit" class="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold">
          <span class="material-symbols-outlined text-[16px] align-middle mr-1">save</span>Save Changes
        </button>
      </div>`;
    if (kind === 'notice') {
      return common(
        input('editNoticeTitle','Title','text',true,'value="' + esc(row.title) + '"') +
        textarea('editNoticeBody','Notice / circular text',true,true) +
        select('editNoticeCategory','Category',
          '<option'+selected('Academic',row.category)+'>Academic</option><option'+selected('Examinations',row.category)+'>Examinations</option><option'+selected('Placements',row.category)+'>Placements</option><option'+selected('Facilities',row.category)+'>Facilities</option><option'+selected('General',row.category)+'>General</option>',true) +
        input('editNoticeSource','Source URL','url',false,'value="' + esc(row.source_url || '') + '"') +
        input('editNoticeExpiry','Display until','datetime-local',false,'value="' + esc(localDateTimeValue(row.expires_at)) + '"') +
        select('editNoticePublished','Publish status','<option value="true"'+selected('true',String(row.is_published))+'>Published</option><option value="false"'+selected('false',String(row.is_published))+'>Draft</option>',true)
      );
    }
    if (kind === 'event') {
      return common(
        input('editEventTitle','Event title','text',true,'value="' + esc(row.title) + '"') +
        textarea('editEventDescription','Description',true,true) +
        input('editEventType','Event type','text',false,'value="' + esc(row.event_type || '') + '"') +
        input('editEventStarts','Starts at','datetime-local',true,'value="' + esc(localDateTimeValue(row.starts_at)) + '"') +
        input('editEventEnds','Ends at','datetime-local',false,'value="' + esc(localDateTimeValue(row.ends_at)) + '"') +
        input('editEventDisplayUntil','Display until','datetime-local',false,'value="' + esc(localDateTimeValue(row.display_until)) + '"') +
        input('editEventVenue','Venue','text',false,'value="' + esc(row.venue || '') + '"') +
        input('editEventSource','Source URL','url',false,'value="' + esc(row.source_url || '') + '"') +
        select('editEventPublished','Publish status','<option value="true"'+selected('true',String(row.is_published))+'>Published</option><option value="false"'+selected('false',String(row.is_published))+'>Draft</option>',true)
      );
    }
    if (kind === 'timetable') {
      if (!allowedSections.length) return '<div class="md:col-span-2 p-3 rounded-xl bg-amber-50 text-xs text-amber-800">No assigned class is available.</div>';
      return common(
        select('editTtSection','Class / Section',commonClassOptions,true) +
        select('editTtSubject','Subject',subjectOptions,true) +
        select('editTtFaculty','Faculty','<option value="">Faculty not assigned</option>' + facultyOptions) +
        select('editTtDay','Day','<option'+selected('Monday',row.day_of_week)+'>Monday</option><option'+selected('Tuesday',row.day_of_week)+'>Tuesday</option><option'+selected('Wednesday',row.day_of_week)+'>Wednesday</option><option'+selected('Thursday',row.day_of_week)+'>Thursday</option><option'+selected('Friday',row.day_of_week)+'>Friday</option><option'+selected('Saturday',row.day_of_week)+'>Saturday</option><option'+selected('Sunday',row.day_of_week)+'>Sunday</option>',true) +
        input('editTtStart','Start time','time',true,'value="' + esc((row.start_time || '').slice(0,5)) + '"') +
        input('editTtEnd','End time','time',true,'value="' + esc((row.end_time || '').slice(0,5)) + '"') +
        input('editTtRoom','Room','text',false,'value="' + esc(row.room || '') + '"') +
        input('editTtTerm','Term','text',false,'value="' + esc(row.term || defaultTerm) + '"') +
        input('editTtNotes','Notes','text',false,'value="' + esc(row.notes || '') + '"')
      );
    }
    if (kind === 'exam') {
      return common(
        select('editExamSection','Class / Section',commonClassOptions,true) +
        select('editExamSubject','Subject',subjectOptions,true) +
        select('editExamType','Exam type','<option'+selected('Mid-1',row.exam_type)+'>Mid-1</option><option'+selected('Mid-2',row.exam_type)+'>Mid-2</option><option'+selected('Semester',row.exam_type)+'>Semester</option><option'+selected('Practical',row.exam_type)+'>Practical</option><option'+selected('Internal',row.exam_type)+'>Internal</option><option'+selected('Other',row.exam_type)+'>Other</option>',true) +
        input('editExamDate','Exam date','date',true,'value="' + esc(row.exam_date || '') + '"') +
        input('editExamStart','Start time','time',false,'value="' + esc((row.start_time || '').slice(0,5)) + '"') +
        input('editExamEnd','End time','time',false,'value="' + esc((row.end_time || '').slice(0,5)) + '"') +
        input('editExamRoom','Room','text',false,'value="' + esc(row.room || '') + '"') +
        input('editExamTerm','Term','text',false,'value="' + esc(row.term || defaultTerm) + '"') +
        textarea('editExamInstructions','Instructions',false,true)
      );
    }
    return common(
      select('editAsSubject','Subject',subjectOptions,true) +
      select('editAsProgram','Program','<option value="">No program</option>' + programOptions) +
      input('editAsTerm','Term','text',false,'value="' + esc(row.term || defaultTerm) + '"') +
      input('editAsTitle','Assignment title','text',true,'value="' + esc(row.title || '') + '"') +
      textarea('editAsDescription','Description',false,true) +
      input('editAsDue','Due date','date',false,'value="' + esc(row.due_date || '') + '"') +
      input('editAsSubmission','Submission information','text',false,'value="' + esc(row.submission_info || '') + '"')
    );
  }

  function setEditorTextareas(kind, row) {
    const valueMap = {
      notice: { editNoticeBody: row.body || '' },
      event: { editEventDescription: row.description || '' },
      exam: { editExamInstructions: row.instructions || '' },
      assignment: { editAsDescription: row.description || '' }
    };
    Object.entries(valueMap[kind] || {}).forEach(([id, value]) => {
      const el = managerForm.querySelector('#' + id);
      if (el) el.value = value;
    });

    const setVal = (id, value) => {
      const el = managerForm.querySelector('#' + id);
      if (el) el.value = value ?? '';
    };

    if (kind === 'timetable') {
      setVal('editTtSection', row.section || assignedSection || allowedSections[0] || '');
      setVal('editTtSubject', row.subject_id);
      setVal('editTtFaculty', row.faculty_id || '');
    }
    if (kind === 'exam') {
      setVal('editExamSection', row.section || assignedSection || allowedSections[0] || '');
      setVal('editExamSubject', row.subject_id);
    }
    if (kind === 'assignment') {
      setVal('editAsSubject', row.subject_id || '');
      setVal('editAsProgram', row.program_id || '');
    }
  }

  function openEditor(kind, row) {
    managerEditing = { kind, id: row.id };
    const config = managerConfig[kind];
    managerTitle.textContent = 'Edit ' + config.label.slice(0, -1);
    managerMeta.textContent = config.title(row) + ' • Created ' + formatDateTime(row.created_at);
    managerForm.innerHTML = managerFields(kind, row);
    setEditorTextareas(kind, row);
    managerModal.classList.remove('hidden');
    managerModal.classList.add('flex');

    managerForm.querySelector('#cancelContentEditBtn')?.addEventListener('click', closeEditor);
  }

  function closeEditor() {
    managerEditing = null;
    managerModal.classList.add('hidden');
    managerModal.classList.remove('flex');
    managerForm.innerHTML = '';
  }

  managerSection.querySelector('#closeContentEditorBtn').addEventListener('click', closeEditor);

  async function saveEditor(event) {
    event.preventDefault();
    if (!managerEditing) return;
    const { kind, id } = managerEditing;
    let payload = {};

    if (kind === 'notice') {
      let expiresAt = null;
      const expiry = managerForm.querySelector('#editNoticeExpiry')?.value || '';
      if (expiry) {
        const d = new Date(expiry);
        if (Number.isNaN(d.getTime())) return showToast('Choose a valid display-until date and time.', 'error');
        expiresAt = d.toISOString();
      }
      payload = {
        title: managerForm.querySelector('#editNoticeTitle').value.trim(),
        body: managerForm.querySelector('#editNoticeBody').value.trim(),
        category: managerForm.querySelector('#editNoticeCategory').value,
        source_url: managerForm.querySelector('#editNoticeSource').value.trim() || null,
        expires_at: expiresAt,
        is_published: managerForm.querySelector('#editNoticePublished').value === 'true'
      };
    }

    if (kind === 'event') {
      const starts = managerForm.querySelector('#editEventStarts').value;
      const ends = managerForm.querySelector('#editEventEnds').value;
      const displayUntil = managerForm.querySelector('#editEventDisplayUntil').value;
      if (!starts) return showToast('Event start time is required.', 'error');
      payload = {
        title: managerForm.querySelector('#editEventTitle').value.trim(),
        description: managerForm.querySelector('#editEventDescription').value.trim(),
        event_type: managerForm.querySelector('#editEventType').value.trim() || null,
        starts_at: new Date(starts).toISOString(),
        ends_at: ends ? new Date(ends).toISOString() : null,
        display_until: displayUntil ? new Date(displayUntil).toISOString() : null,
        venue: managerForm.querySelector('#editEventVenue').value.trim() || null,
        source_url: managerForm.querySelector('#editEventSource').value.trim() || null,
        is_published: managerForm.querySelector('#editEventPublished').value === 'true'
      };
    }

    if (kind === 'timetable') {
      payload = {
        section: managerForm.querySelector('#editTtSection').value,
        subject_id: managerForm.querySelector('#editTtSubject').value || null,
        faculty_id: managerForm.querySelector('#editTtFaculty').value || null,
        program_id: (subjectsRes.data || []).find(s => s.id === managerForm.querySelector('#editTtSubject').value)?.program_id || null,
        term: managerForm.querySelector('#editTtTerm').value.trim() || null,
        day_of_week: managerForm.querySelector('#editTtDay').value,
        start_time: managerForm.querySelector('#editTtStart').value,
        end_time: managerForm.querySelector('#editTtEnd').value,
        room: managerForm.querySelector('#editTtRoom').value.trim() || null,
        notes: managerForm.querySelector('#editTtNotes').value.trim() || null
      };
    }

    if (kind === 'exam') {
      payload = {
        section: managerForm.querySelector('#editExamSection').value,
        subject_id: managerForm.querySelector('#editExamSubject').value || null,
        program_id: (subjectsRes.data || []).find(s => s.id === managerForm.querySelector('#editExamSubject').value)?.program_id || null,
        term: managerForm.querySelector('#editExamTerm').value.trim() || null,
        exam_type: managerForm.querySelector('#editExamType').value,
        exam_date: managerForm.querySelector('#editExamDate').value,
        start_time: managerForm.querySelector('#editExamStart').value || null,
        end_time: managerForm.querySelector('#editExamEnd').value || null,
        room: managerForm.querySelector('#editExamRoom').value.trim() || null,
        instructions: managerForm.querySelector('#editExamInstructions').value.trim() || null
      };
    }

    if (kind === 'assignment') {
      const subject = (subjectsRes.data || []).find(s => s.id === managerForm.querySelector('#editAsSubject').value);
      payload = {
        subject_id: subject?.id || null,
        program_id: managerForm.querySelector('#editAsProgram').value || subject?.program_id || null,
        term: managerForm.querySelector('#editAsTerm').value.trim() || null,
        title: managerForm.querySelector('#editAsTitle').value.trim(),
        description: managerForm.querySelector('#editAsDescription').value.trim() || null,
        due_date: managerForm.querySelector('#editAsDue').value || null,
        submission_info: managerForm.querySelector('#editAsSubmission').value.trim() || null
      };
    }

    const { error } = await supabase.from(managerConfig[kind].table).update(payload).eq('id', id);
    if (error) {
      showToast(error.message || 'Unable to save changes.', 'error');
      return;
    }

    showToast(managerConfig[kind].label.slice(0, -1) + ' updated successfully.', 'success');
    closeEditor();
    await refreshManager();
  }

  managerForm.addEventListener('submit', saveEditor);

  async function deleteRecord(kind, row) {
    const config = managerConfig[kind];
    if (!window.confirm('Delete this ' + config.label.slice(0,-1).toLowerCase() + '? This cannot be undone.')) return;
    const { error } = await supabase.from(config.table).delete().eq('id', row.id);
    if (error) {
      showToast(error.message || 'Delete failed.', 'error');
      return;
    }
    showToast(config.label.slice(0, -1) + ' deleted.', 'success');
    await refreshManager();
  }

  async function togglePublish(kind, row) {
    const config = managerConfig[kind];
    if (kind !== 'notice' && kind !== 'event') return;
    const next = !row.is_published;
    const { error } = await supabase.from(config.table).update({ is_published: next }).eq('id', row.id);
    if (error) {
      showToast(error.message || 'Unable to change publish status.', 'error');
      return;
    }
    showToast(next ? config.label.slice(0, -1) + ' published.' : config.label.slice(0, -1) + ' moved to draft.', 'success');
    await refreshManager();
  }

  async function refreshManager() {
    const kind = managerKind.value;
    const config = managerConfig[kind];
    managerList.innerHTML = '<div class="p-4 rounded-xl bg-surface-container-low text-xs text-on-surface-variant">Loading ' + config.label.toLowerCase() + '...</div>';

    let select = '*';
    if (kind === 'notice') select = 'id,title,body,category,published_at,expires_at,source_url,is_published,created_at';
    if (kind === 'event') select = 'id,title,description,event_type,starts_at,ends_at,display_until,venue,source_url,is_published,created_at';
    if (kind === 'timetable') select = 'id,subject_id,faculty_id,program_id,term,section,day_of_week,start_time,end_time,room,notes,created_at';
    if (kind === 'exam') select = 'id,subject_id,program_id,term,section,exam_type,exam_date,start_time,end_time,room,instructions,created_at';
    if (kind === 'assignment') select = 'id,subject_id,program_id,term,title,description,due_date,submission_info,created_at';

    let query = supabase.from(config.table).select(select).order(config.order, { ascending: false }).limit(100);
    if ((kind === 'timetable' || kind === 'exam') && !owner && assignedSection) {
      query = query.eq('section', assignedSection);
    }

    const { data, error } = await query;
    if (error) {
      managerRows = [];
      managerList.innerHTML = '<div class="p-4 rounded-xl bg-error-container text-on-error-container text-xs">Unable to load records: ' + esc(error.message) + '</div>';
      return;
    }

    managerRows = data || [];
    renderManagerList();
  }

  function renderManagerList() {
    const q = String(managerSearch.value || '').trim().toLowerCase();
    const filtered = managerRows.filter(row => {
      const config = managerConfig[managerKind.value];
      const s = JSON.stringify(row).toLowerCase();
      return !q || s.includes(q) || config.title(row).toLowerCase().includes(q) || config.meta(row).toLowerCase().includes(q);
    });

    if (!filtered.length) {
      managerList.innerHTML = '<div class="p-8 rounded-xl bg-surface-container-low text-center text-xs text-on-surface-variant">' +
        esc(managerConfig[managerKind.value].empty) + '</div>';
      return;
    }

    managerList.innerHTML = filtered.map(row => {
      const kind = managerKind.value;
      const config = managerConfig[kind];
      const statusChip = (kind === 'notice' || kind === 'event')
        ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold ' + (row.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-surface-container text-outline') + '">' + (row.is_published ? 'PUBLISHED' : 'DRAFT') + '</span>'
        : '';
      const expiry = kind === 'notice'
        ? (row.expires_at ? 'Expires ' + formatDateTime(row.expires_at) : 'No expiry')
        : kind === 'event'
          ? (row.display_until ? 'Displayed until ' + formatDateTime(row.display_until) : 'No display expiry')
          : '';

      return '<div class="p-3 rounded-xl border border-surface-container-high bg-surface-container-low">' +
        '<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">' +
          '<div class="min-w-0">' +
            '<div class="flex flex-wrap items-center gap-2">' +
              '<span class="material-symbols-outlined text-[18px] text-primary">' + config.icon + '</span>' +
              '<span class="text-sm font-bold truncate">' + esc(config.title(row)) + '</span>' +
              statusChip +
            '</div>' +
            '<div class="text-[11px] text-on-surface-variant mt-1">' + esc(config.meta(row)) + (expiry ? ' • ' + esc(expiry) : '') + '</div>' +
          '</div>' +
          '<div class="flex flex-wrap items-center gap-2 shrink-0">' +
            ((kind === 'notice' || kind === 'event')
              ? '<button data-toggle-publish="' + esc(row.id) + '" class="px-3 py-2 rounded-lg bg-surface-container text-on-surface text-xs font-bold">' + (row.is_published ? 'Move to Draft' : 'Publish') + '</button>'
              : '') +
            '<button data-edit-content="' + esc(row.id) + '" class="px-3 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold">Edit</button>' +
            '<button data-delete-content="' + esc(row.id) + '" class="px-3 py-2 rounded-lg bg-error-container text-on-error-container text-xs font-bold">Delete</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    managerList.querySelectorAll('[data-edit-content]').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = managerRows.find(r => r.id === btn.dataset.editContent);
        if (row) openEditor(managerKind.value, row);
      });
    });
    managerList.querySelectorAll('[data-delete-content]').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = managerRows.find(r => r.id === btn.dataset.deleteContent);
        if (row) deleteRecord(managerKind.value, row);
      });
    });
    managerList.querySelectorAll('[data-toggle-publish]').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = managerRows.find(r => r.id === btn.dataset.togglePublish);
        if (row) togglePublish(managerKind.value, row);
      });
    });
  }

  managerKind.addEventListener('change', refreshManager);
  managerSearch.addEventListener('input', renderManagerList);
  managerSection.querySelector('#refreshContentManagerBtn').addEventListener('click', refreshManager);

  function syncManagerWithContentTab(kind) {
    const mapped = {
      notice: 'notice',
      event: 'event',
      timetable: 'timetable',
      exam: 'exam',
      assignment: 'assignment'
    };
    if (mapped[kind]) {
      managerKind.value = mapped[kind];
      refreshManager();
    }
  }

  function switchTab(kind) {
    document.querySelectorAll('.content-tab').forEach(btn => {
      const active = btn.getAttribute('data-content-tab') === kind;
      btn.className = 'content-tab px-3 py-2 rounded-xl text-xs font-bold ' +
        (active ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant');
    });

    if (kind === 'notice') renderNoticeForm();
    if (kind === 'event') renderEventForm();
    if (kind === 'timetable') renderTimetableForm();
    if (kind === 'exam') renderExamForm();
    if (kind === 'assignment') renderAssignmentForm();
    syncManagerWithContentTab(kind);
  }

  document.querySelectorAll('.content-tab').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.getAttribute('data-content-tab')));
  });

  function formShell(title, icon, description, fields, buttonText, onSubmit) {
    tabBody.innerHTML = `
      <div class="p-4 rounded-2xl bg-surface-container-low border border-surface-container-high">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary">${icon}</span>
          <div>
            <h3 class="text-sm font-bold text-on-surface">${title}</h3>
            <p class="text-[11px] text-on-surface-variant">${description}</p>
          </div>
        </div>
        <form id="adminContentForm" class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          ${fields}
          <div class="md:col-span-2 pt-2">
            <button type="submit" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold">
              <span class="material-symbols-outlined text-[17px]">save</span>
              ${buttonText}
            </button>
          </div>
        </form>
      </div>
    `;
    document.getElementById('adminContentForm').addEventListener('submit', onSubmit);
  }

  const input = (id, label, type='text', required=false, extra='') => `
    <div class="space-y-1">
      <label class="block text-[11px] font-bold text-on-surface">${label}</label>
      <input id="${id}" type="${type}" ${required ? 'required' : ''} ${extra}
        class="w-full px-3 py-2.5 rounded-xl border border-surface-container-high bg-white text-xs outline-none focus:border-primary">
    </div>`;

  const textarea = (id, label, required=false, span=false) => `
    <div class="space-y-1 ${span ? 'md:col-span-2' : ''}">
      <label class="block text-[11px] font-bold text-on-surface">${label}</label>
      <textarea id="${id}" rows="4" ${required ? 'required' : ''}
        class="w-full px-3 py-2.5 rounded-xl border border-surface-container-high bg-white text-xs outline-none focus:border-primary"></textarea>
    </div>`;

  const select = (id, label, options, required=false, span=false) => `
    <div class="space-y-1 ${span ? 'md:col-span-2' : ''}">
      <label class="block text-[11px] font-bold text-on-surface">${label}</label>
      <select id="${id}" ${required ? 'required' : ''}
        class="w-full px-3 py-2.5 rounded-xl border border-surface-container-high bg-white text-xs outline-none focus:border-primary">
        ${options}
      </select>
    </div>`;

  function renderNoticeForm() {
    if (!tabBody) return;
    formShell(
      'Publish Notice',
      'campaign',
      'Students will see published notices on the Notices page after they refresh the app.',
      input('noticeTitle','Title','text',true) +
      textarea('noticeBody','Notice / circular text',true) +
      select('noticeCategory','Category',
        '<option>Academic</option><option>Examinations</option><option>Placements</option><option>Facilities</option><option>General</option>',true) +
      input('noticeSource','Source URL','url') +
      select('noticeDisplayDuration','How long should this notice be displayed?',
        '<option value="7d">7 days</option><option value="1d">1 day</option><option value="3d">3 days</option><option value="14d">14 days</option><option value="30d">30 days</option><option value="custom">Until a specific date & time</option><option value="none">No expiry</option>',true) +
      input('noticeDisplayUntil','Custom display-until date & time','datetime-local') +
      select('noticePublished','Publish status','<option value="true">Published</option><option value="false">Save as draft</option>',true),
      'Publish Notice',
      async (e) => {
        e.preventDefault();
        const published = document.getElementById('noticePublished').value === 'true';
        let expiresAt = null;
        if (published) {
          try {
            expiresAt = expiryFromChoice(
              document.getElementById('noticeDisplayDuration').value,
              document.getElementById('noticeDisplayUntil').value
            );
          } catch (error) {
            return setStatus(error.message, false);
          }
        }
        const payload = {
          title: document.getElementById('noticeTitle').value.trim(),
          body: document.getElementById('noticeBody').value.trim(),
          category: document.getElementById('noticeCategory').value,
          source_url: document.getElementById('noticeSource').value.trim() || null,
          expires_at: expiresAt,
          is_published: published
        };
        const { error } = await supabase.from('notices').insert(payload);
        if (error) return setStatus(error.message, false);
        setStatus(
          published
            ? (expiresAt ? 'Notice added successfully. It will automatically disappear after the selected display period.' : 'Notice added successfully with no expiry.')
            : 'Notice saved as draft.'
        );
        e.target.reset();
      }
    );
  }

  function renderEventForm() {
    formShell(
      'Add Campus Event',
      'event',
      'Add hackathons, seminars, workshops, cultural events or career activities.',
      input('eventTitle','Event title','text',true) +
      textarea('eventDescription','Description',true) +
      input('eventType','Event type','text',true) +
      input('eventStarts','Starts at','datetime-local',true) +
      input('eventEnds','Ends at','datetime-local') +
      select('eventDisplayDuration','How long should this event be displayed?',
        '<option value="event_end">Until the event ends</option><option value="1d">1 day after event</option><option value="3d">3 days after event</option><option value="7d">7 days after event</option><option value="14d">14 days after event</option><option value="custom">Until a specific date & time</option>',true) +
      input('eventDisplayUntil','Custom display-until date & time','datetime-local') +
      input('eventVenue','Venue','text',true) +
      input('eventSource','Source URL','url') +
      select('eventPublished','Publish status','<option value="true">Published</option><option value="false">Save as draft</option>',true),
      'Add Event',
      async (e) => {
        e.preventDefault();
        const start = document.getElementById('eventStarts').value;
        const end = document.getElementById('eventEnds').value;
        const published = document.getElementById('eventPublished').value === 'true';
        let displayUntil = null;
        if (published) {
          try {
            displayUntil = eventDisplayUntil(
              document.getElementById('eventDisplayDuration').value,
              document.getElementById('eventDisplayUntil').value,
              start,
              end
            );
          } catch (error) {
            return setStatus(error.message, false);
          }
        }
        const payload = {
          title: document.getElementById('eventTitle').value.trim(),
          description: document.getElementById('eventDescription').value.trim(),
          event_type: document.getElementById('eventType').value.trim(),
          starts_at: start ? new Date(start).toISOString() : null,
          ends_at: end ? new Date(end).toISOString() : null,
          display_until: displayUntil,
          venue: document.getElementById('eventVenue').value.trim(),
          source_url: document.getElementById('eventSource').value.trim() || null,
          is_published: published
        };
        const { error } = await supabase.from('events').insert(payload);
        if (error) return setStatus(error.message, false);
        setStatus(
          published
            ? (displayUntil ? 'Event added successfully. It will automatically disappear after the selected display period.' : 'Event added successfully.')
            : 'Event saved as draft.'
        );
        e.target.reset();
      }
    );
  }

  const scopeSelect = () => select('ttSection','Class / Section',
    commonClassOptions, true);

  function renderTimetableForm() {
    if (!allowedSections.length) {
      tabBody.innerHTML = '<div class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">Assign this admin a class before adding timetable records.</div>';
      return;
    }
    formShell(
      'Add Timetable Session',
      'schedule',
      'Add one lecture/lab/tutorial session to the selected class timetable.',
      scopeSelect() +
      select('ttSubject','Subject',subjectOptions,true) +
      select('ttFaculty','Faculty','<option value="">Faculty not assigned</option>' + facultyOptions) +
      select('ttDay','Day','<option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option><option>Sunday</option>',true) +
      input('ttStart','Start time','time',true) +
      input('ttEnd','End time','time',true) +
      input('ttRoom','Room') +
      input('ttTerm','Term','text',true, 'value="' + esc(defaultTerm) + '"') +
      input('ttNotes','Notes (e.g. Lab)','text',false) +
      '',
      'Add to Timetable',
      async (e) => {
        e.preventDefault();
        const subject = (subjectsRes.data || []).find(s => s.id === document.getElementById('ttSubject').value);
        const payload = {
          subject_id: subject?.id || null,
          faculty_id: document.getElementById('ttFaculty').value || null,
          program_id: subject?.program_id || null,
          term: document.getElementById('ttTerm').value.trim(),
          section: document.getElementById('ttSection').value,
          day_of_week: document.getElementById('ttDay').value,
          start_time: document.getElementById('ttStart').value,
          end_time: document.getElementById('ttEnd').value,
          room: document.getElementById('ttRoom').value.trim() || null,
          notes: document.getElementById('ttNotes').value.trim() || null
        };
        if (!payload.subject_id) return setStatus('Select a subject.', false);
        const { error } = await supabase.from('timetable').insert(payload);
        if (error) return setStatus(error.message, false);
        setStatus('Timetable session added.');
        e.target.reset();
        document.getElementById('ttTerm').value = defaultTerm;
        if (!owner) document.getElementById('ttSection').value = assignedSection;
      }
    );
  }

  function renderExamForm() {
    if (!allowedSections.length) {
      tabBody.innerHTML = '<div class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">Assign this admin a class before adding exam records.</div>';
      return;
    }
    formShell(
      'Add Exam Schedule',
      'event_note',
      'Add exam date, time, room and instructions for your assigned class.',
      scopeSelect() +
      select('examSubject','Subject',subjectOptions,true) +
      select('examType','Exam type','<option>Mid-1</option><option>Mid-2</option><option>Semester</option><option>Practical</option><option>Internal</option><option>Other</option>',true) +
      input('examDate','Exam date','date',true) +
      input('examStart','Start time','time') +
      input('examEnd','End time','time') +
      input('examRoom','Room') +
      input('examTerm','Term','text',true,'value="' + esc(defaultTerm) + '"') +
      textarea('examInstructions','Instructions',false,true),
      'Add Exam',
      async (e) => {
        e.preventDefault();
        const subject = (subjectsRes.data || []).find(s => s.id === document.getElementById('examSubject').value);
        const payload = {
          subject_id: subject?.id || null,
          program_id: subject?.program_id || null,
          term: document.getElementById('examTerm').value.trim(),
          section: document.getElementById('examSection').value,
          exam_type: document.getElementById('examType').value,
          exam_date: document.getElementById('examDate').value,
          start_time: document.getElementById('examStart').value || null,
          end_time: document.getElementById('examEnd').value || null,
          room: document.getElementById('examRoom').value.trim() || null,
          instructions: document.getElementById('examInstructions').value.trim() || null
        };
        if (!payload.subject_id) return setStatus('Select a subject.', false);
        const { error } = await supabase.from('exams').insert(payload);
        if (error) return setStatus(error.message, false);
        setStatus('Exam schedule added.');
        e.target.reset();
        document.getElementById('examTerm').value = defaultTerm;
        if (!owner) document.getElementById('examSection').value = assignedSection;
      }
    );

    const examSection = document.getElementById('ttSection');
    if (examSection) examSection.id = 'examSection';
  }

  function renderAssignmentForm() {
    formShell(
      'Add Academic Assignment',
      'assignment',
      'Add homework, project or submission information to the academic workspace.',
      select('asSubject','Subject',subjectOptions,true) +
      select('asProgram','Program','<option value="">No program</option>' + programOptions) +
      input('asTerm','Term','text',true,'value="' + esc(defaultTerm) + '"') +
      input('asTitle','Assignment title','text',true) +
      textarea('asDescription','Description',false,true) +
      input('asDue','Due date','date') +
      input('asSubmission','Submission information','text') ,
      'Add Assignment',
      async (e) => {
        e.preventDefault();
        const subject = (subjectsRes.data || []).find(s => s.id === document.getElementById('asSubject').value);
        const selectedProgram = document.getElementById('asProgram').value;
        const payload = {
          subject_id: subject?.id || null,
          program_id: selectedProgram || subject?.program_id || null,
          term: document.getElementById('asTerm').value.trim(),
          title: document.getElementById('asTitle').value.trim(),
          description: document.getElementById('asDescription').value.trim() || null,
          due_date: document.getElementById('asDue').value || null,
          submission_info: document.getElementById('asSubmission').value.trim() || null
        };
        const { error } = await supabase.from('academic_assignments').insert(payload);
        if (error) return setStatus(error.message, false);
        setStatus('Academic assignment added.');
        e.target.reset();
        document.getElementById('asTerm').value = defaultTerm;
      }
    );
  }

  // Notices is the default tab.
  switchTab('notice');
}

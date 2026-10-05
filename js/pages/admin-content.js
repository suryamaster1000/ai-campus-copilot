import { supabase } from '../supabase.js';
import { showToast } from '../components/toast.js';

const OWNER_USER_ID = '53d68054-50f2-41b5-a666-5789db48ae02';

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
  const authorized = owner || access?.role === 'admin';

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

  const sections = [...new Set((sectionsRes.data || [])
    .map(r => String(r.section || '').trim())
    .filter(Boolean))].sort();

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
            <span class="px-2 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">${owner ? 'OWNER' : 'ADMIN'}</span>
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

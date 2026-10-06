import { supabase } from '../supabase.js';
import { showToast } from '../components/toast.js';

const OWNER_USER_ID = '53d68054-50f2-41b5-a666-5789db48ae02';
const SECTIONS = Array.from({ length: 8 }, (_, i) => 'CSM' + (i + 1));
const esc = (v) => String(v ?? '').replace(/[&<>\"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
const withTimeout = (promise, ms = 8000, label = 'Request') =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(label + ' timed out')), ms))
  ]);

export async function renderSubjectNotes(mount) {
  if (!mount) return;
  const { data: { user } } = await withTimeout(supabase.auth.getUser(), 8000, 'Authentication check');
  if (!user) return;
  const { data: access } = await withTimeout(
    supabase.from('admin_users').select('role,assigned_section,assigned_subject').eq('user_id', user.id).maybeSingle(),
    8000,
    'Teacher access check'
  );
  const role = String(access?.role || '').toLowerCase();
  const isAdmin = user.id === OWNER_USER_ID || ['owner','admin'].includes(role);
  const isStaff = ['teacher','faculty','instructor'].includes(role);
  if (!isAdmin && !isStaff) { mount.innerHTML = ''; return; }

  mount.innerHTML = '<section class="bg-surface-container-lowest rounded-2xl p-space-md lg:p-space-lg border border-primary/30 shadow-sm">' +
    '<div class="flex items-center justify-between gap-3"><div><div class="flex items-center gap-2"><span class="material-symbols-outlined text-primary">menu_book</span><h2 class="font-headline-md text-base font-bold">Subject Notes</h2><span class="px-2 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">LIVE</span></div>' +
    '<p class="text-xs text-on-surface-variant mt-1">' + (isStaff ? 'Post notes only for your assigned section and subject.' : 'Create and manage subject notes for campus sections.') + '</p></div>' +
    '<button id="refreshSubjectNotesBtn" type="button" class="px-3 py-2 rounded-lg bg-surface-container text-xs font-bold border border-surface-container-high">Refresh</button></div>' +
    '<div class="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">' +
    '<form id="subjectNoteForm" class="rounded-2xl bg-surface-container-low border border-surface-container-high p-4 space-y-3"><input id="subjectNoteId" type="hidden">' +
    '<div class="text-sm font-extrabold" id="subjectNoteFormTitle">Post a Note</div>' +
    '<input id="subjectNoteTitle" maxlength="180" required placeholder="e.g. Python Loops — Quick Notes" class="w-full px-3 py-2.5 rounded-xl border bg-white text-sm">' +
    '<div class="grid grid-cols-2 gap-3"><select id="subjectNoteSection" required ' + (isStaff ? 'disabled' : '') + ' class="w-full px-3 py-2.5 rounded-xl border bg-white text-sm">' + SECTIONS.map(s => '<option value="'+s+'" '+(isStaff && access?.assigned_section === s ? 'selected' : '')+'>'+s+'</option>').join('') + '</select>' +
    '<select id="subjectNoteSubject" required ' + (isStaff ? 'disabled' : '') + ' class="w-full px-3 py-2.5 rounded-xl border bg-white text-sm"><option value="">Loading subjects...</option></select></div>' +
    '<textarea id="subjectNoteContent" rows="9" maxlength="20000" required placeholder="Write the notes, examples, important points, or instructions..." class="w-full px-3 py-2.5 rounded-xl border bg-white text-sm resize-y"></textarea>' +
    '<input id="subjectNoteUrl" type="url" maxlength="1000" placeholder="Optional resource link: https://..." class="w-full px-3 py-2.5 rounded-xl border bg-white text-sm">' +
    '<div class="flex gap-2"><button id="saveSubjectNoteBtn" type="submit" class="flex-1 px-4 py-3 rounded-xl bg-primary text-on-primary text-sm font-bold">Publish Note</button><button id="cancelSubjectNoteBtn" type="button" class="hidden px-4 py-3 rounded-xl bg-surface-container text-sm font-bold">Cancel</button></div></form>' +
    '<div class="rounded-2xl bg-white border border-surface-container-high p-4"><div class="flex items-center justify-between"><div><div class="text-sm font-extrabold">Published Notes</div><div class="text-[11px] text-on-surface-variant mt-1">Students see these in Study Assistant.</div></div><span id="subjectNotesCount" class="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">0</span></div>' +
    '<div id="subjectNotesList" class="mt-4 space-y-2"><div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">Loading notes...</div></div></div></div></section>';

  const form = document.getElementById('subjectNoteForm');
  const title = document.getElementById('subjectNoteTitle');
  const body = document.getElementById('subjectNoteContent');
  const section = document.getElementById('subjectNoteSection');
  const subject = document.getElementById('subjectNoteSubject');
  const url = document.getElementById('subjectNoteUrl');
  const id = document.getElementById('subjectNoteId');
  const save = document.getElementById('saveSubjectNoteBtn');
  const cancel = document.getElementById('cancelSubjectNoteBtn');

  async function loadSubjects() {
    let data, error;
    try {
      ({ data, error } = await withTimeout(
        supabase.from('subjects').select('id,name,code,term').order('term').order('code'),
        8000,
        'Subjects request'
      ));
    } catch (e) {
      subject.innerHTML = '<option value="">Unable to load subjects</option>';
      showToast(e?.message || 'Subjects could not be loaded.', 'error');
      return;
    }
    if (error) { subject.innerHTML = '<option value="">Unable to load subjects</option>'; showToast(error.message, 'error'); return; }
    if (isStaff && !access?.assigned_subject) {
      subject.innerHTML = '<option value="">No subject assigned — contact the administrator</option>';
      subject.disabled = true;
      save.disabled = true;
      return;
    }
    const rows = isStaff ? (data || []).filter(s => s.id === access.assigned_subject) : (data || []);
    subject.innerHTML = '<option value="">Select a subject...</option>' + rows.map(s => '<option value="'+esc(s.id)+'">'+esc((s.code ? s.code+' — ' : '')+s.name)+'</option>').join('');
    if (isStaff && access?.assigned_subject) subject.value = access.assigned_subject;
  }

  async function loadNotes() {
    const list = document.getElementById('subjectNotesList');
    let query = supabase.from('subject_notes').select('id,title,content,section,subject_id,source_url,created_by,published_at,subjects:subject_id(id,name,code)').order('published_at',{ascending:false});
    if (isStaff) query = query.eq('section', access?.assigned_section || '');
    let data, error;
    try {
      ({ data, error } = await withTimeout(query, 8000, 'Subject notes request'));
    } catch (e) {
      list.innerHTML = '<div class="text-xs text-error p-3 rounded-xl bg-error-container">' + esc(e?.message || 'Subject notes could not be loaded.') + '</div>';
      return;
    }
    if (error) { list.innerHTML = '<div class="text-xs text-error p-3 rounded-xl bg-error-container">'+esc(error.message)+'</div>'; return; }
    const notes = data || [];
    document.getElementById('subjectNotesCount').textContent = String(notes.length);
    if (!notes.length) { list.innerHTML = '<div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">No subject notes published yet.</div>'; return; }
    list.innerHTML = notes.map(n => {
      const label = n.subjects?.code ? n.subjects.code+' — '+n.subjects.name : (n.subjects?.name || 'Subject');
      const preview = String(n.content || '').replace(/\s+/g,' ').slice(0,180);
      const canEdit = isAdmin || n.created_by === user.id;
      return '<article class="p-3 rounded-xl border border-surface-container-high bg-surface-container-low"><div class="flex flex-col md:flex-row md:justify-between gap-3"><div><div class="text-sm font-bold">'+esc(n.title)+'</div><div class="mt-1 flex gap-1.5"><span class="px-2 py-1 rounded-full bg-secondary-container text-[10px] font-bold">'+esc(n.section)+'</span><span class="px-2 py-1 rounded-full bg-primary-fixed text-[10px] font-bold">'+esc(label)+'</span></div><p class="text-[11px] text-on-surface-variant mt-2">'+esc(preview)+(n.content?.length > 180 ? '…' : '')+'</p></div><div class="flex gap-2 shrink-0">'+(n.source_url ? '<a target="_blank" rel="noopener noreferrer" href="'+esc(n.source_url)+'" class="px-3 py-2 rounded-lg bg-surface-container text-primary text-xs font-bold">Open Link</a>' : '')+(canEdit ? '<button data-edit-note="'+esc(n.id)+'" type="button" class="px-3 py-2 rounded-lg bg-surface-container text-xs font-bold">Edit</button><button data-delete-note="'+esc(n.id)+'" type="button" class="px-3 py-2 rounded-lg bg-error-container text-on-error-container text-xs font-bold">Delete</button>' : '')+'</div></div></article>';
    }).join('');
    list.querySelectorAll('[data-edit-note]').forEach(btn => btn.addEventListener('click', () => { const n = notes.find(x => x.id === btn.dataset.editNote); if (!n) return; id.value=n.id; title.value=n.title||''; body.value=n.content||''; section.value=n.section||''; subject.value=n.subject_id||''; url.value=n.source_url||''; document.getElementById('subjectNoteFormTitle').textContent='Edit Subject Note'; save.textContent='Save Changes'; cancel.classList.remove('hidden'); form.scrollIntoView({behavior:'smooth'}); }));
    list.querySelectorAll('[data-delete-note]').forEach(btn => btn.addEventListener('click', async () => { if (!confirm('Delete this subject note?')) return; btn.disabled=true; const {error}=await supabase.from('subject_notes').delete().eq('id',btn.dataset.deleteNote); if(error){showToast(error.message,'error');btn.disabled=false;return;} showToast('Subject note deleted.','success'); await loadNotes(); }));
  }

  function resetForm() { id.value=''; form.reset(); if(isStaff){section.value=access?.assigned_section||'';subject.value=access?.assigned_subject||'';} document.getElementById('subjectNoteFormTitle').textContent='Post a Note'; save.textContent='Publish Note'; cancel.classList.add('hidden'); }
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload={title:title.value.trim(),content:body.value.trim(),section:String(section.value||'').trim(),subject_id:String(subject.value||'').trim(),source_url:url.value.trim()||null,created_by:user.id};
    if (isStaff && !access?.assigned_subject) { showToast('No subject is assigned to this teacher yet.', 'error'); return; }
    if(!payload.title||!payload.content||!payload.section||!payload.subject_id){showToast('Title, section, subject and note content are required.','error');return;}
    save.disabled=true;
    try {
      let result;
      if(id.value) result=await supabase.from('subject_notes').update({title:payload.title,content:payload.content,section:payload.section,subject_id:payload.subject_id,source_url:payload.source_url,updated_at:new Date().toISOString()}).eq('id',id.value);
      else result=await supabase.from('subject_notes').insert(payload);
      if(result.error) throw result.error;
      showToast(id.value?'Subject note updated.':'Subject note published.','success'); resetForm(); await loadNotes();
    } catch(error) { showToast(error?.message||'Could not save subject note.','error'); }
    finally { save.disabled=false; }
  });
  cancel.addEventListener('click', resetForm);
  document.getElementById('refreshSubjectNotesBtn')?.addEventListener('click', loadNotes);
  await loadSubjects();
  await loadNotes();
}
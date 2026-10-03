import { supabase } from '../supabase.js';
import { showToast } from '../components/toast.js';

const OWNER_USER_ID = '53d68054-50f2-41b5-a666-5789db48ae02';
const MAX_FILE_BYTES = 25 * 1024 * 1024;

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));
}

function bytesLabel(value) {
  const n = Number(value || 0);
  if (!n) return 'Unknown size';
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  return (n / (1024 * 1024)).toFixed(1) + ' MB';
}

function safeFileName(name) {
  return String(name || 'file').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-160);
}

export async function renderAdminTools(mount) {
  if (!mount) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: access, error: accessError } = await supabase
    .from('admin_users')
    .select('user_id,role,assigned_section')
    .eq('user_id', user.id)
    .maybeSingle();

  const owner = user.id === OWNER_USER_ID || access?.role === 'owner';
  const authorized = owner || (!accessError && access?.role === 'admin');

  if (!authorized) {
    mount.innerHTML = '';
    return;
  }

  const sectionResult = await supabase.from('admission_directory').select('section').limit(1000);
  const sections = [...new Set((sectionResult.data || [])
    .map((row) => String(row.section || '').trim())
    .filter(Boolean))].sort();

  const assignedSection = String(access?.assigned_section || '').trim();
  const uploadSections = owner ? sections : (assignedSection ? [assignedSection] : []);

  mount.innerHTML =
    '<section class="bg-surface-container-lowest rounded-2xl p-space-md lg:p-space-lg border border-primary/30 shadow-sm">' +
      '<div class="flex flex-col md:flex-row md:items-start md:justify-between gap-3">' +
        '<div>' +
          '<div class="flex items-center gap-2">' +
            '<span class="material-symbols-outlined text-primary">school</span>' +
            '<h2 class="font-headline-md text-base font-bold text-on-surface">Admin Class Assignment</h2>' +
            '<span class="px-2 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">' + (owner ? 'OWNER' : 'ASSIGNED') + '</span>' +
          '</div>' +
          '<p class="text-xs text-on-surface-variant mt-1">Each admin is scoped to one class for knowledge uploads. The owner can assign or change that class.</p>' +
        '</div>' +
      '</div>' +
      '<div id="classAssignmentBody" class="mt-4"></div>' +
    '</section>' +

    '<section class="bg-surface-container-lowest rounded-2xl p-space-md lg:p-space-lg border border-primary/30 shadow-sm">' +
      '<div class="flex flex-col md:flex-row md:items-start md:justify-between gap-3">' +
        '<div>' +
          '<div class="flex items-center gap-2">' +
            '<span class="material-symbols-outlined text-primary">cloud_upload</span>' +
            '<h2 class="font-headline-md text-base font-bold text-on-surface">Class Knowledge Upload</h2>' +
            '<span class="px-2 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">ADMIN ONLY</span>' +
          '</div>' +
          '<p class="text-xs text-on-surface-variant mt-1">Upload class files and index their contents for the AI assistant. Your class scope is enforced on the server.</p>' +
        '</div>' +
        '<div class="text-[11px] text-on-surface-variant px-3 py-2 rounded-lg bg-surface-container-low">25 MB max per file</div>' +
      '</div>' +
      '<div id="knowledgeUploadBody" class="mt-4"></div>' +
    '</section>' +

    (owner ? (
    '<section class="bg-surface-container-lowest rounded-2xl p-space-md lg:p-space-lg border border-error/20 shadow-sm">' +
      '<div class="flex items-center gap-2">' +
        '<span class="material-symbols-outlined text-error">edit_note</span>' +
        '<h2 class="font-headline-md text-base font-bold text-on-surface">Rejected Registration Corrections</h2>' +
        '<span class="px-2 py-1 rounded-full bg-error-container text-on-error-container text-[10px] font-bold">OWNER ONLY</span>' +
      '</div>' +
      '<p class="text-xs text-on-surface-variant mt-1">Reopen a rejected registration and give the student a secure 24-hour Tally correction link. After resubmission, it returns to pending for approval.</p>' +
      '<div id="registrationCorrectionBody" class="mt-4"></div>' +
    '</section>'
    ) : '');

  if (owner) await renderAssignments();
  else await renderAssignmentsForAdmin();
  await renderKnowledge();
  if (owner) await renderCorrections();

  async function renderAssignmentsForAdmin() {
    const el = document.getElementById('classAssignmentBody');
    if (!el) return;
    el.innerHTML =
      '<div class="p-3 rounded-xl bg-surface-container-low border border-surface-container-high">' +
      '<div class="text-sm font-bold">Assigned class: ' + esc(assignedSection || 'Not assigned') + '</div>' +
      '<div class="text-[11px] text-on-surface-variant mt-1">' +
      (assignedSection ? 'You can upload and manage knowledge only for this class.' : 'Ask the owner to assign your class before uploading.') +
      '</div></div>';
  }

  async function renderAssignments() {
    const el = document.getElementById('classAssignmentBody');
    if (!el) return;

    const { data: admins, error } = await supabase
      .from('admin_users')
      .select('user_id,role,assigned_section,authorized_at')
      .order('authorized_at', { ascending: true });

    if (error) {
      el.innerHTML = '<div class="text-xs text-error p-3 rounded-xl bg-error-container">Unable to load admin assignments.</div>';
      return;
    }

    const ids = (admins || []).map((a) => a.user_id);
    const { data: profiles } = ids.length
      ? await supabase.from('profiles').select('id,name,email,section').in('id', ids)
      : { data: [] };
    const map = new Map((profiles || []).map((p) => [p.id, p]));

    const rows = (admins || []).map((a) => {
      const p = map.get(a.user_id) || {};
      const isRowOwner = a.user_id === OWNER_USER_ID || a.role === 'owner';
      if (isRowOwner) {
        return '<div class="p-3 rounded-xl bg-primary-fixed/30 border border-primary/20">' +
          '<div class="text-sm font-bold">' + esc(p.name || 'Owner') + ' <span class="text-[10px] font-bold ml-1">OWNER</span></div>' +
          '<div class="text-[11px] text-on-surface-variant mt-1">' + esc(p.email || '') + '</div>' +
        '</div>';
      }

      const options = '<option value="">Unassigned</option>' + sections.map((s) =>
        '<option value="' + esc(s) + '"' + (a.assigned_section === s ? ' selected' : '') + '>' + esc(s) + '</option>'
      ).join('');

      return '<div class="p-3 rounded-xl border border-surface-container-high bg-surface-container-low">' +
        '<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">' +
          '<div class="min-w-0">' +
            '<div class="text-sm font-bold truncate">' + esc(p.name || 'Admin account') + '</div>' +
            '<div class="text-[11px] text-on-surface-variant mt-1 truncate">' + esc(p.email || a.user_id) + '</div>' +
          '</div>' +
          '<div class="flex items-center gap-2">' +
            '<select data-class-select="' + esc(a.user_id) + '" class="px-3 py-2 rounded-lg border border-surface-container-high bg-white text-xs">' + options + '</select>' +
            '<button data-save-class="' + esc(a.user_id) + '" class="px-3 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold">Save Class</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    el.innerHTML = rows || '<div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">No administrators have been authorized yet.</div>';

    el.querySelectorAll('[data-save-class]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const select = el.querySelector('[data-class-select="' + btn.dataset.saveClass + '"]');
        btn.disabled = true;
        const { error: updateError } = await supabase
          .from('admin_users')
          .update({ assigned_section: select?.value || null })
          .eq('user_id', btn.dataset.saveClass);
        if (updateError) {
          showToast(updateError.message, 'error');
          btn.disabled = false;
          return;
        }
        showToast('Admin class assignment saved.', 'success');
        await renderAssignments();
      });
    });
  }

  async function renderKnowledge() {
    const el = document.getElementById('knowledgeUploadBody');
    if (!el) return;

    if (!uploadSections.length) {
      el.innerHTML = '<div class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">No class is assigned to this admin yet. The owner must assign a class first.</div>';
      return;
    }

    el.innerHTML =
      '<div class="grid gap-3 md:grid-cols-[220px_1fr_auto]">' +
        '<div>' +
          '<label class="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1">Class</label>' +
          '<select id="knowledgeSection" class="w-full px-3 py-2 rounded-xl border border-surface-container-high bg-white text-sm">' +
            uploadSections.map((s) => '<option value="' + esc(s) + '">' + esc(s) + '</option>').join('') +
          '</select>' +
        '</div>' +
        '<div>' +
          '<label class="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1">Files</label>' +
          '<input id="knowledgeFiles" type="file" multiple class="block w-full text-xs text-on-surface file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-primary file:text-white file:font-bold file:text-xs">' +
        '</div>' +
        '<div class="flex items-end">' +
          '<button id="uploadKnowledgeBtn" type="button" class="w-full md:w-auto px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold">Upload & Index</button>' +
        '</div>' +
      '</div>' +
      '<div class="mt-2 text-[11px] text-on-surface-variant">AI indexing handles text/code/CSV/JSON, ZIP/DOCX/XLSX/PPTX archives, and common PDF/image/audio/video files. Binary AI extraction is limited to 7 MB.</div>' +
      '<div id="knowledgeUploadProgress" class="mt-3 space-y-2"></div>' +
      '<div class="mt-5">' +
        '<div class="flex items-center justify-between mb-2">' +
          '<h3 class="text-xs font-bold uppercase tracking-wider text-outline">Indexed class files</h3>' +
          '<button id="refreshKnowledge" type="button" class="text-xs font-bold text-primary">Refresh</button>' +
        '</div>' +
        '<div id="knowledgeDocumentsList" class="space-y-2"></div>' +
      '</div>';

    const sectionSelect = document.getElementById('knowledgeSection');
    if (!owner) sectionSelect.disabled = true;

    async function refreshKnowledge() {
      const list = document.getElementById('knowledgeDocumentsList');
      if (!list) return;
      let q = supabase.from('knowledge_documents')
        .select('id,title,section,original_name,mime_type,size_bytes,storage_path,created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      if (!owner) q = q.eq('section', uploadSections[0]);
      const { data, error } = await q;
      if (error) {
        list.innerHTML = '<div class="text-xs text-error p-3 rounded-xl bg-error-container">Unable to load class knowledge files.</div>';
        return;
      }
      if (!data?.length) {
        list.innerHTML = '<div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">No knowledge files uploaded yet.</div>';
        return;
      }

      list.innerHTML = data.map((d) =>
        '<div class="p-3 rounded-xl border border-surface-container-high bg-surface-container-low">' +
          '<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">' +
            '<div class="min-w-0">' +
              '<div class="flex flex-wrap items-center gap-2">' +
                '<span class="text-sm font-bold truncate">' + esc(d.title || d.original_name || 'Document') + '</span>' +
                '<span class="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">' + esc(d.section) + '</span>' +
              '</div>' +
              '<div class="text-[11px] text-on-surface-variant mt-1 truncate">' + esc(d.original_name || '') + ' • ' + esc(bytesLabel(d.size_bytes)) + ' • ' + esc(d.mime_type || 'file') + '</div>' +
            '</div>' +
            '<button data-delete-knowledge="' + esc(d.id) + '" data-delete-path="' + esc(d.storage_path || '') + '" class="px-3 py-2 rounded-lg bg-error-container text-on-error-container text-xs font-bold">Delete</button>' +
          '</div>' +
        '</div>'
      ).join('');

      list.querySelectorAll('[data-delete-knowledge]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          if (!confirm('Delete this file and its AI index?')) return;
          btn.disabled = true;
          try {
            if (btn.dataset.deletePath) {
              const { error: storageError } = await supabase.storage.from('campus-knowledge').remove([btn.dataset.deletePath]);
              if (storageError) throw storageError;
            }
            const { error: docError } = await supabase.from('knowledge_documents').delete().eq('id', btn.dataset.deleteKnowledge);
            if (docError) throw docError;
            showToast('Knowledge file deleted.', 'success');
            await refreshKnowledge();
          } catch (error) {
            showToast(error?.message || 'Delete failed.', 'error');
            btn.disabled = false;
          }
        });
      });
    }

    await refreshKnowledge();
    document.getElementById('refreshKnowledge')?.addEventListener('click', refreshKnowledge);

    document.getElementById('uploadKnowledgeBtn')?.addEventListener('click', async () => {
      const section = sectionSelect?.value || '';
      const input = document.getElementById('knowledgeFiles');
      const files = [...(input?.files || [])];
      const progress = document.getElementById('knowledgeUploadProgress');

      if (!section) { showToast('Choose a class.', 'error'); return; }
      if (!files.length) { showToast('Choose at least one file.', 'error'); return; }

      const btn = document.getElementById('uploadKnowledgeBtn');
      btn.disabled = true;
      progress.innerHTML = '';

      for (const file of files) {
        const row = document.createElement('div');
        row.className = 'p-3 rounded-xl border border-surface-container-high bg-surface-container-low text-xs';
        row.textContent = file.name + ' — uploading...';
        progress.appendChild(row);

        if (file.size > MAX_FILE_BYTES) {
          row.textContent = file.name + ' — skipped: exceeds 25 MB.';
          row.classList.add('text-error');
          continue;
        }

        const storagePath = section + '/' + user.id + '/' + crypto.randomUUID() + '-' + safeFileName(file.name);

        try {
          const { error: uploadError } = await supabase.storage.from('campus-knowledge').upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type || 'application/octet-stream'
          });
          if (uploadError) throw uploadError;

          const { data, error: ingestError } = await supabase.functions.invoke('ingest-knowledge-document', {
            body: {
              section,
              storage_path: storagePath,
              original_name: file.name,
              mime_type: file.type || 'application/octet-stream',
              size_bytes: file.size,
              title: file.name
            }
          });

          if (ingestError || data?.error) {
            await supabase.storage.from('campus-knowledge').remove([storagePath]);
            throw ingestError || new Error(data?.error || 'AI indexing failed.');
          }

          row.textContent = file.name + ' — indexed (' + (data.chunks || 0) + ' AI chunks).';
          row.classList.add('text-emerald-700');
        } catch (error) {
          row.textContent = file.name + ' — failed: ' + (error?.message || 'Upload failed.');
          row.classList.add('text-error');
        }
      }

      btn.disabled = false;
      input.value = '';
      await refreshKnowledge();
    });
  }

  async function renderCorrections() {
    const el = document.getElementById('registrationCorrectionBody');
    if (!el) return;

    const { data, error } = await supabase.from('student_registrations')
      .select('id,admission_no,student_name,email,section,status,created_at,updated_at')
      .in('status', ['rejected','needs_edit'])
      .order('updated_at', { ascending: false })
      .limit(50);

    if (error) {
      el.innerHTML = '<div class="text-xs text-error p-3 rounded-xl bg-error-container">Unable to load rejected registrations.</div>';
      return;
    }
    if (!data?.length) {
      el.innerHTML = '<div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">No rejected or reopened registrations.</div>';
      return;
    }

    el.innerHTML = data.map((r) =>
      '<div data-correction-row="' + esc(r.id) + '" class="p-3 rounded-xl border border-surface-container-high bg-surface-container-low">' +
        '<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">' +
          '<div class="min-w-0">' +
            '<div class="flex flex-wrap items-center gap-2">' +
              '<span class="text-sm font-bold">' + esc(r.student_name) + '</span>' +
              '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold ' + (r.status === 'needs_edit' ? 'bg-amber-100 text-amber-800' : 'bg-error-container text-on-error-container') + '">' + esc(r.status.toUpperCase()) + '</span>' +
            '</div>' +
            '<div class="text-[11px] text-on-surface-variant mt-1">' + esc(r.admission_no) + ' • ' + esc(r.section) + ' • ' + esc(r.email) + '</div>' +
          '</div>' +
          (r.status === 'rejected'
            ? '<button data-reopen="' + esc(r.id) + '" class="px-3 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold">Reopen for Edit</button>'
            : '<span class="text-[11px] font-semibold text-amber-800">Waiting for corrected Tally submission</span>') +
        '</div>' +
      '</div>'
    ).join('');

    el.querySelectorAll('[data-reopen]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Reopen this rejected registration for correction? The secure link expires in 24 hours.')) return;
        btn.disabled = true;
        btn.textContent = 'Preparing...';

        const { data: result, error: invokeError } = await supabase.functions.invoke('reopen-student-registration', {
          body: { registration_id: btn.dataset.reopen }
        });

        if (invokeError || result?.error) {
          showToast(result?.error || invokeError?.message || 'Could not reopen registration.', 'error');
          btn.disabled = false;
          btn.textContent = 'Reopen for Edit';
          return;
        }

        const copied = await navigator.clipboard?.writeText(result.edit_url).then(() => true).catch(() => false);
        await renderCorrections();

        const row = document.querySelector('[data-correction-row="' + btn.dataset.reopen + '"]');
        if (row) {
          const box = document.createElement('div');
          box.className = 'mt-3 p-3 rounded-xl border border-amber-300 bg-amber-50 text-xs text-amber-900';
          box.innerHTML =
            '<div class="font-bold">Secure correction link ' + (copied ? '(copied)' : '') + '</div>' +
            '<div class="mt-1">Send this link to the student. It expires in 24 hours and can be used to resubmit corrected registration details.</div>' +
            '<input readonly class="mt-2 w-full px-2 py-2 rounded-lg border border-amber-200 bg-white text-[11px]" value="' + esc(result.edit_url) + '">';
          row.appendChild(box);
        }

        showToast(copied ? 'Correction link copied.' : 'Registration reopened. Copy the link shown in the row.', 'success');
      });
    });
  }
}

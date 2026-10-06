import { supabase } from '../supabase.js';
import { showToast } from '../components/toast.js';

const OWNER='53d68054-50f2-41b5-a666-5789db48ae02';
const OWNER_EMAIL='suryaneerukonda1@gmail.com';
const SECTIONS=Array.from({length:8},(_,i)=>'CSM'+(i+1));
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let activeTab='students';
let cache={profiles:[],students:[],admins:[],teachers:[],subjects:[]};

export async function renderOwnerControl(mount){
  if(!mount)return;
  const {data:{user}}=await supabase.auth.getUser();
  if(!user){mount.innerHTML='';return;}
  const {data:access}=await supabase.from('admin_users').select('role').eq('user_id',user.id).maybeSingle();
  const role=String(access?.role||'').toLowerCase();
  const isOwner=user.id===OWNER||role==='owner';
  if(!isOwner){mount.innerHTML='';return;}

  mount.innerHTML=`
  <section class="bg-surface-container-lowest rounded-2xl p-space-md lg:p-space-lg border-2 border-primary/30 shadow-sm">
    <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
      <div>
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary">shield_person</span>
          <h2 class="font-headline-md text-lg font-bold text-on-surface">Owner Control Center</h2>
          <span class="px-2 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">OWNER ONLY</span>
        </div>
        <p class="text-xs text-on-surface-variant mt-1">Master management for existing students, administrators, and teachers. Changes are enforced through secure Supabase functions.</p>
      </div>
      <button id="ownerRefresh" type="button" class="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container text-xs font-bold border border-surface-container-high"><span class="material-symbols-outlined text-[17px]">refresh</span>Refresh</button>
    </div>

    <div class="mt-5 flex flex-wrap gap-2" id="ownerTabs">
      <button data-tab="students" class="px-4 py-2.5 rounded-xl text-xs font-bold bg-primary text-on-primary">Students</button>
      <button data-tab="admins" class="px-4 py-2.5 rounded-xl text-xs font-bold bg-surface-container text-on-surface">Administrators</button>
      <button data-tab="teachers" class="px-4 py-2.5 rounded-xl text-xs font-bold bg-surface-container text-on-surface">Teachers</button>
    </div>

    <div class="mt-4">
      <input id="ownerSearch" type="search" maxlength="100" placeholder="Search name, email, roll number, section or subject..." class="w-full px-3 py-3 rounded-xl border border-surface-container-high bg-white text-sm outline-none focus:border-primary">
    </div>

    <div id="ownerList" class="mt-4 space-y-2"><div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">Loading...</div></div>
  </section>

  <div id="ownerEditModal" class="fixed inset-0 z-[100] hidden items-center justify-center p-4">
    <div data-owner-backdrop class="absolute inset-0 bg-black/45 backdrop-blur-sm"></div>
    <section role="dialog" aria-modal="true" class="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-surface-container-lowest rounded-2xl border border-surface-container-high shadow-2xl">
      <div class="p-5 border-b border-surface-container-high flex items-start justify-between gap-3">
        <div><h3 id="ownerModalTitle" class="text-lg font-bold text-on-surface">Edit Account</h3><p id="ownerModalSubtitle" class="text-xs text-on-surface-variant mt-1">Owner controls</p></div>
        <button type="button" data-owner-close class="p-2 rounded-lg hover:bg-surface-container"><span class="material-symbols-outlined text-[20px]">close</span></button>
      </div>
      <form id="ownerEditForm" class="p-5 space-y-4">
        <input id="ownerEditId" type="hidden"><input id="ownerEditType" type="hidden">
        <div><label class="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1">Name</label><input id="ownerName" required maxlength="120" class="w-full px-3 py-2.5 rounded-xl border border-surface-container-high bg-white text-sm"></div>
        <div><label class="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1">Email</label><input id="ownerEmail" required type="email" maxlength="254" class="w-full px-3 py-2.5 rounded-xl border border-surface-container-high bg-white text-sm"></div>
        <div id="ownerStudentFields" class="hidden space-y-4">
          <div><label class="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1">Admission / Roll Number</label><input id="ownerRoll" maxlength="80" class="w-full px-3 py-2.5 rounded-xl border border-surface-container-high bg-white text-sm"></div>
          <div class="grid grid-cols-2 gap-3"><div><label class="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1">Program</label><input id="ownerProgram" maxlength="160" class="w-full px-3 py-2.5 rounded-xl border border-surface-container-high bg-white text-sm"></div><div><label class="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1">Term</label><input id="ownerTerm" maxlength="80" class="w-full px-3 py-2.5 rounded-xl border border-surface-container-high bg-white text-sm"></div></div>
          <div class="grid grid-cols-2 gap-3"><div><label class="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1">CGPA</label><input id="ownerCgpa" maxlength="30" class="w-full px-3 py-2.5 rounded-xl border border-surface-container-high bg-white text-sm"></div><div><label class="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1">Section</label><select id="ownerStudentSection" class="w-full px-3 py-2.5 rounded-xl border border-surface-container-high bg-white text-sm">${SECTIONS.map(s=>`<option value="${s}">${s}</option>`).join('')}</select></div></div>
        </div>
        <div id="ownerStaffFields" class="hidden">
          <label class="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1">Assigned Section</label>
          <select id="ownerStaffSection" class="w-full px-3 py-2.5 rounded-xl border border-surface-container-high bg-white text-sm"><option value="">No section assigned</option>${SECTIONS.map(s=>`<option value="${s}">${s}</option>`).join('')}</select>
        </div>
        <div id="ownerTeacherFields" class="hidden">
          <label class="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1">Assigned Subject</label>
          <select id="ownerTeacherSubject" class="w-full px-3 py-2.5 rounded-xl border border-surface-container-high bg-white text-sm"></select>
        </div>
        <div id="ownerEditStatus" class="hidden rounded-xl px-3 py-2.5 text-xs"></div>
        <div class="flex justify-end gap-2 pt-1">
          <button type="button" data-owner-close class="px-4 py-2.5 rounded-xl bg-surface-container text-xs font-bold">Cancel</button>
          <button id="ownerSave" type="submit" class="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold">Save Changes</button>
        </div>
      </form>
    </section>
  </div>`;

  async function load(){
    const list=document.getElementById('ownerList');
    list.innerHTML='<div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">Loading...</div>';
    const [students,admins,teachers,subjects]=await Promise.all([
      supabase.from('profiles').select('id,name,email,roll_number,program,term,cgpa,section').order('name'),
      supabase.from('admin_users').select('user_id,role,assigned_section,assigned_subject,authorized_at,subjects:assigned_subject(id,name,code)').in('role',['admin']).order('authorized_at'),
      supabase.from('admin_users').select('user_id,role,assigned_section,assigned_subject,authorized_at,subjects:assigned_subject(id,name,code)').in('role',['teacher','faculty','instructor']).order('authorized_at'),
      supabase.from('subjects').select('id,name,code,term').order('term').order('code')
    ]);
    if(students.error){list.innerHTML='<div class="text-xs text-error p-3 rounded-xl bg-error-container">Students could not be loaded: '+esc(students.error.message)+'</div>';return;}
    cache.profiles=students.data||[]; cache.admins=admins.data||[]; cache.teachers=teachers.data||[]; cache.subjects=subjects.data||[];
    const staffIds=new Set([...cache.admins,...cache.teachers].map(row=>row.user_id));
    cache.students=cache.profiles.filter(profile=>!staffIds.has(profile.id));
    await loadCurrent();
  }
  function labelSubject(row){const s=Array.isArray(row?.subjects)?row.subjects[0]:row?.subjects;return s?(s.code?(s.code+' — '+s.name):s.name):'No subject assigned';}
  function profileFor(id){return cache.profiles.find(p=>p.id===id)||{};}
  async function loadCurrent(){
    const q=(document.getElementById('ownerSearch').value||'').trim().toLowerCase();
    const list=document.getElementById('ownerList');
    if(activeTab==='students'){
      const rows=cache.students.filter(s=>[s.name,s.email,s.roll_number,s.section,s.program].join(' ').toLowerCase().includes(q));
      document.getElementById('ownerList').innerHTML=rows.length?rows.map(s=>`<div class="p-3 rounded-xl border border-surface-container-high bg-surface-container-low"><div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3"><div class="min-w-0"><div class="text-sm font-bold truncate">${esc(s.name||'Student')}</div><div class="text-[11px] text-on-surface-variant mt-1">${esc(s.email||'')} • ${esc(s.roll_number||'No roll')} • ${esc(s.section||'')}</div><div class="text-[10px] text-outline mt-1">${esc(s.program||'')} • Term ${esc(s.term||'—')} • CGPA ${esc(s.cgpa||'—')}</div></div><div class="flex gap-2 shrink-0"><button data-edit="students" data-id="${esc(s.id)}" class="px-3 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold">Edit</button><button data-remove="students" data-id="${esc(s.id)}" class="px-3 py-2 rounded-lg bg-error-container text-on-error-container text-xs font-bold">Remove</button></div></div></div>`).join(''):'<div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">No students match your search.</div>';
    } else {
      const rows=cache[activeTab].filter(t=>{const p=profileFor(t.user_id);return [p.name,p.email,t.assigned_section,labelSubject(t)].join(' ').toLowerCase().includes(q);});
      document.getElementById('ownerList').innerHTML=rows.length?rows.map(t=>{const p=profileFor(t.user_id);const isAdmin=activeTab==='admins';return `<div class="p-3 rounded-xl border border-surface-container-high bg-surface-container-low"><div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3"><div class="min-w-0"><div class="text-sm font-bold truncate">${esc(p.name|| (isAdmin?'Administrator':'Teacher'))}</div><div class="text-[11px] text-on-surface-variant truncate mt-1">${esc(p.email||t.user_id)}</div><div class="text-[10px] text-outline mt-1">Section: ${esc(t.assigned_section||'Unassigned')} • ${esc(isAdmin?'Administrator':labelSubject(t))}</div></div><div class="flex gap-2 shrink-0"><button data-edit="${activeTab}" data-id="${esc(t.user_id)}" class="px-3 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold">Edit</button><button data-remove="${activeTab}" data-id="${esc(t.user_id)}" class="px-3 py-2 rounded-lg bg-error-container text-on-error-container text-xs font-bold">Remove</button></div></div></div>`}).join(''):'<div class="text-xs text-on-surface-variant p-3 rounded-xl bg-surface-container-low">No accounts match your search.</div>';
    }
    bindRows();
  }
  function bindRows(){
    document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openEdit(b.dataset.edit,b.dataset.id));
    document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>remove(b.dataset.remove,b.dataset.id));
  }
  function setTab(tab){
    activeTab=tab;
    document.querySelectorAll('#ownerTabs [data-tab]').forEach(b=>{const on=b.dataset.tab===tab;b.className='px-4 py-2.5 rounded-xl text-xs font-bold '+(on?'bg-primary text-on-primary':'bg-surface-container text-on-surface');});
    loadCurrent();
  }
  async function openEdit(type,id){
    const modal=document.getElementById('ownerEditModal');
    const sf=document.getElementById('ownerStudentFields'), stf=document.getElementById('ownerStaffFields'), tf=document.getElementById('ownerTeacherFields');
    const p=profileFor(id);
    document.getElementById('ownerEditId').value=id; document.getElementById('ownerEditType').value=type;
    document.getElementById('ownerName').value=p.name||''; document.getElementById('ownerEmail').value=p.email||'';
    sf.classList.toggle('hidden',type!=='students');
    stf.classList.toggle('hidden',type==='students');
    tf.classList.toggle('hidden',type!=='teachers');
    if(type==='students'){
      document.getElementById('ownerRoll').value=p.roll_number||'';document.getElementById('ownerProgram').value=p.program||'';document.getElementById('ownerTerm').value=p.term||'';document.getElementById('ownerCgpa').value=p.cgpa||'';document.getElementById('ownerStudentSection').value=p.section||SECTIONS[0];
      document.getElementById('ownerModalTitle').textContent='Edit Student';document.getElementById('ownerModalSubtitle').textContent='Update profile and section assignment';
    } else {
      const rows=type==='admins'?cache.admins:cache.teachers; const row=rows.find(x=>x.user_id===id)||{};
      document.getElementById('ownerStaffSection').value=row.assigned_section||'';
      document.getElementById('ownerModalTitle').textContent=type==='admins'?'Edit Administrator':'Edit Teacher';
      document.getElementById('ownerModalSubtitle').textContent=type==='admins'?'Update administrator profile and section':'Update teacher profile, section and subject';
      if(type==='teachers'){
        const sel=document.getElementById('ownerTeacherSubject');sel.innerHTML='<option value="">Select subject...</option>'+cache.subjects.map(s=>`<option value="${esc(s.id)}">${esc((s.code?s.code+' — ':'')+s.name)}</option>`).join('');sel.value=row.assigned_subject||'';
      }
    }
    const modalStatus=document.getElementById('ownerEditStatus');modalStatus.className='hidden';
    modal.classList.remove('hidden');modal.classList.add('flex');
  }
  function closeEdit(){const m=document.getElementById('ownerEditModal');m.classList.add('hidden');m.classList.remove('flex');}
  async function remove(type,id){
    if(type==='admins'&&id===OWNER)return showToast('The Owner account cannot be removed.','error');
    if(!confirm('Remove this '+(type==='students'?'student':type==='admins'?'administrator':'teacher')+' account? This also removes the login account.'))return;
    const fn=type==='students'?'remove-student-account':type==='admins'?'owner-remove-admin':'remove-teacher-account';
    const key=type==='students'?'student_id':type==='admins'?'admin_id':'teacher_id';
    const button=[...document.querySelectorAll('[data-remove]')].find(b=>b.dataset.id===id);
    if(button)button.disabled=true;
    try{
      const {data,error}=await supabase.functions.invoke(fn,{body:{[key]:id}});
      if(error||data?.error)throw new Error(data?.error||error?.message||'Removal failed.');
      showToast('Account removed successfully.','success');await load();
    }catch(e){showToast(e?.message||'Removal failed.','error');if(button)button.disabled=false;}
  }
  window.aiCampusOwnerControl = { setTab, openEdit };
  document.getElementById('ownerTabs').querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
  document.getElementById('ownerSearch').addEventListener('input',loadCurrent);
  document.getElementById('ownerRefresh').onclick=load;
  document.querySelectorAll('[data-owner-close]').forEach(b=>b.onclick=closeEdit);
  document.querySelector('[data-owner-backdrop]').onclick=closeEdit;
  document.getElementById('ownerEditForm').onsubmit=async e=>{
    e.preventDefault();
    const type=document.getElementById('ownerEditType').value,id=document.getElementById('ownerEditId').value,save=document.getElementById('ownerSave'),st=document.getElementById('ownerEditStatus');
    const base={name:document.getElementById('ownerName').value.trim(),email:document.getElementById('ownerEmail').value.trim().toLowerCase()};
    let fn,payload;
    if(type==='students'){fn='owner-update-student';payload={student_id:id,...base,roll_number:document.getElementById('ownerRoll').value.trim(),program:document.getElementById('ownerProgram').value.trim(),term:document.getElementById('ownerTerm').value.trim(),cgpa:document.getElementById('ownerCgpa').value.trim(),section:document.getElementById('ownerStudentSection').value};}
    else if(type==='teachers'){fn='owner-update-teacher';payload={teacher_id:id,...base,section:document.getElementById('ownerStaffSection').value,subject_id:document.getElementById('ownerTeacherSubject').value};}
    else {fn='owner-update-admin';payload={admin_id:id,...base,section:document.getElementById('ownerStaffSection').value};}
    save.disabled=true;save.textContent='Saving...';st.className='rounded-xl px-3 py-2.5 text-xs bg-blue-50 border border-blue-100 text-blue-800';st.textContent='Updating secure account records...';
    try{const {data,error}=await supabase.functions.invoke(fn,{body:payload});if(error||data?.error)throw new Error(data?.error||error?.message||'Update failed.');showToast('Account updated successfully.','success');closeEdit();await load();}
    catch(err){st.className='rounded-xl px-3 py-2.5 text-xs bg-error-container text-on-error-container';st.textContent=err?.message||'Update failed.';showToast(st.textContent,'error');}
    finally{save.disabled=false;save.textContent='Save Changes';}
  };
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeEdit();});
  await load();
}

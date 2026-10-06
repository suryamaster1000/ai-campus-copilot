// AI Campus Copilot - Main Application Controller & Router
import { supabase } from './supabase.js';
import { campusData } from './data.js';
import { initCommandPalette } from './components/command-palette.js?v=20261003-live1';
import { showToast } from './components/toast.js?v=20261003-live1';

// ─── Supabase Auth Guard ───────────────────────────────────────────────────
let currentUser = null;
let authReady = false;
let authInitPromise = null;
let isAdmin = false;
let isOwner = false;
const OWNER_USER_ID = '53d68054-50f2-41b5-a666-5789db48ae02';
let adminAccessReady = false;
let authRedirectInProgress = false;

// Never let a slow Supabase request prevent the application shell/router from starting.
function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => {
      console.warn(label + ' timed out after ' + ms + 'ms; continuing with available data.');
      resolve({ data: null, error: new Error(label + ' timed out') });
    }, ms))
  ]);
}

async function loadLiveCampusData(profile) {
  const section = profile?.section || '';
  const term = profile?.term || '';

  const examsQuery = supabase.from('exams').select('id,subject_id,program_id,term,section,exam_type,exam_date,start_time,end_time,room,instructions,subjects(name,code)').eq('term', term);
  if (section) examsQuery.eq('section', section);
  examsQuery.limit(100);

  const [noticesRes, eventsRes, timetableRes, examsRes, assignmentsRes, attendanceRes, subjectsRes, facultyRes, locationsRes, rulesRes] = await Promise.all([
    supabase.from('notices').select('id,title,body,category,published_at,expires_at,source_url').eq('is_published', true).order('published_at', { ascending: false }).limit(50),
    supabase.from('events').select('id,title,description,event_type,starts_at,ends_at,display_until,venue,source_url').eq('is_published', true).order('starts_at', { ascending: true }).limit(50),
    supabase.from('timetable').select('id,subject_id,faculty_id,program_id,term,section,day_of_week,start_time,end_time,room,notes,subjects(name,code),faculty(name,designation)').eq('term', term).limit(200),
    examsQuery,
    supabase.from('academic_assignments').select('id,subject_id,program_id,term,title,description,due_date,submission_info,subjects(name,code)').eq('term', term).limit(100),
    supabase.from('attendance').select('id,subject_id,attendance_date,status,section,marked_at,subjects(name,code)').eq('user_id', currentUser.id).order('attendance_date', { ascending: true }).limit(500),
    supabase.from('subjects').select('id,program_id,code,name,description,credits,term').eq('term', term).limit(100),
    supabase.from('faculty').select('id,name,department,designation,email,office').limit(200),
    supabase.from('campus_locations').select('id,name,category,description,building,floor,room,latitude,longitude,opening_hours,contact_info').limit(200),
    supabase.from('academic_rules').select('id,title,category,content,program_id,term,source_url').eq('is_published', true).limit(100)
  ]);

  const results = [noticesRes, eventsRes, timetableRes, examsRes, assignmentsRes, attendanceRes, subjectsRes, facultyRes, locationsRes, rulesRes];
  results.forEach((r, i) => { if (r.error) console.error('Live campus dataset failed', i, r.error); });

  const facultyById = new Map((facultyRes.data || []).map(f => [f.id, f]));
  const days = new Map();
  for (const row of (timetableRes.data || [])) {
    if (section && row.section && row.section !== section) continue;
    const day = row.day_of_week || 'Unscheduled';
    if (!days.has(day)) days.set(day, []);
    const subject = Array.isArray(row.subjects) ? row.subjects[0] : row.subjects;
    const faculty = Array.isArray(row.faculty) ? row.faculty[0] : row.faculty;
    const note = String(row.notes || '').trim();
    const isLab = /lab/i.test(note);
    const isTutorial = /tutorial|exam/i.test(note);
    const noteLabel = note.split('—')[0].trim();
    const noteFaculty = note.includes('—') ? note.split('—').slice(1).join('—').trim() : '';
    days.get(day).push({
      id: row.id,
      code: subject?.code || (isTutorial ? 'EXAM' : 'Course'),
      name: subject?.name || noteLabel || 'Class',
      type: isLab ? 'Lab' : (isTutorial ? 'Tutorial' : 'Lecture'),
      room: row.room || 'Room not assigned',
      faculty: faculty?.name || noteFaculty || 'Faculty not assigned',
      time: row.start_time && row.end_time ? row.start_time.slice(0,5) + ' - ' + row.end_time.slice(0,5) : 'Time not assigned',
      isCurrent: false
    });
  }
  const orderedDays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  campusData.timetable = [...days.entries()]
    .sort((a,b) => orderedDays.indexOf(a[0]) - orderedDays.indexOf(b[0]))
    .map(([day, classes]) => ({ day, classes: classes.sort((a,b) => a.time.localeCompare(b.time)) }));

  const now = Date.now();
  campusData.notices = (noticesRes.data || [])
    .filter(n => !n.expires_at || new Date(n.expires_at).getTime() > now)
    .map(n => ({
      id: n.id,
      title: n.title,
      category: n.category || 'Notice',
      date: n.published_at ? new Date(n.published_at).toLocaleDateString() : 'Recently published',
      summary: n.body || '',
      body: n.body || '',
      sourceUrl: n.source_url || '',
      read: false,
      badgeClass: 'bg-secondary-container text-on-secondary-container'
    }));

  campusData.events = (eventsRes.data || [])
    .filter(e => !e.display_until || new Date(e.display_until).getTime() > now)
    .map(e => {
    const start = e.starts_at ? new Date(e.starts_at) : null;
    const end = e.ends_at ? new Date(e.ends_at) : null;
    return {
      id: e.id,
      title: e.title,
      description: e.description || '',
      type: e.event_type || 'Campus Event',
      category: e.event_type || 'Campus Event',
      startsAt: e.starts_at,
      endsAt: e.ends_at,
      date: start ? start.toLocaleDateString() : 'Date not assigned',
      time: start
        ? (end ? `${start.toLocaleTimeString([], {hour:'numeric', minute:'2-digit'})} - ${end.toLocaleTimeString([], {hour:'numeric', minute:'2-digit'})}` : start.toLocaleTimeString([], {hour:'numeric', minute:'2-digit'}))
        : 'Time not assigned',
      venue: e.venue || 'Venue not assigned',
      sourceUrl: e.source_url || '',
      attendees: 0,
      tags: e.event_type ? [e.event_type] : [],
      registered: false
    };
  });

  const attendanceRows = attendanceRes.data || [];
  campusData.attendance = attendanceRows;
  const held = attendanceRows.length;
  const attended = attendanceRows.filter(r => String(r.status || '').toLowerCase() === 'present').length;
  campusData.student.attendanceOverall = held > 0 ? ((attended / held) * 100).toFixed(1) + '%' : '';

  campusData.studyModules = (subjectsRes.data || []).map(s => {
    const relatedClass = (timetableRes.data || []).find(row => row.subject_id === s.id);
    const faculty = relatedClass ? (Array.isArray(relatedClass.faculty) ? relatedClass.faculty[0] : relatedClass.faculty) : null;
    return {
      id: s.id,
      code: s.code || 'SUBJECT',
      name: s.name,
      credits: s.credits || 0,
      term: s.term || term,
      description: s.description || '',
      faculty: faculty?.name || 'Faculty not assigned',
      progress: 0,
      units: [],
      aiTools: []
    };
  });

  campusData.venues = (locationsRes.data || []).map(v => ({
    id: v.id,
    name: v.name,
    category: v.category || 'Campus Location',
    description: v.description || '',
    building: v.building || '',
    floor: v.floor || '',
    room: v.room || '',
    latitude: v.latitude,
    longitude: v.longitude,
    openingHours: v.opening_hours || '',
    contactInfo: v.contact_info || ''
  }));
  campusData.shuttles = [];

  if (!campusData.studyModules.length) campusData.studyModules = [];
  campusData.aiResponses = {};
  campusData.academicAssignments = assignmentsRes.data || [];
  campusData.exams = (examsRes.data || []).filter(e => !section || e.section === section);
  campusData.academicRules = rulesRes.data || [];
  campusData.faculty = facultyRes.data || [];
  campusData.programs = [];
  campusData.loadedAt = new Date().toISOString();
}

async function handleAuthSession(session) {
  if (!session?.user) {
    currentUser = null;
    adminAccessReady = false;
    if (authReady && !authRedirectInProgress) { authRedirectInProgress = true; window.location.replace('login.html'); }
    return false;
  }

  currentUser = session.user;

  const immediateName = currentUser.user_metadata?.name ||
    currentUser.email?.split('@')[0] || 'Student';
  const updateHeader = (name) => {
    const namePill = document.querySelector('#headerProfilePill .font-label-md');
    const emailPill = document.querySelector('#headerProfilePill .font-label-sm');
    if (namePill) namePill.textContent = name;
    if (emailPill) emailPill.textContent = currentUser.email || '';
  };
  updateHeader(immediateName);

  isOwner = currentUser.id === OWNER_USER_ID;
  isAdmin = false;
  adminAccessReady = false;

  // Authorization must be established before the app/router is released.
  // A profile row is the approved-student marker; admin_users is the admin marker.
  const [profileResult, adminResult] = await Promise.all([
    withTimeout(
      supabase
        .from('profiles')
        .select('id,name,email,roll_number,program,term,cgpa,section')
        .eq('id', currentUser.id)
        .maybeSingle(),
      5000,
      'Student profile query'
    ),
    withTimeout(
      supabase
        .from('admin_users')
        .select('user_id,role,assigned_section')
        .eq('user_id', currentUser.id)
        .maybeSingle(),
      5000,
      'Admin permission query'
    )
  ]);

  const profile = profileResult.data;
  const adminAccess = adminResult.data;

  if (profileResult.error) {
    console.error('Supabase profile authorization failed:', profileResult.error);
    await supabase.auth.signOut();
    adminAccessReady = false;
    if (!authRedirectInProgress) { authRedirectInProgress = true; window.location.replace('login.html?error=auth-check'); }
    return false;
  }

  if (adminResult.error) {
    console.warn('Supabase admin authorization query unavailable; continuing as approved student:', adminResult.error);
    // Admin access is optional for students. Do not create a login redirect loop
    // when the permission lookup is temporarily unavailable.
  }

  const adminRole = String(adminAccess?.role || '').toLowerCase();
  isOwner = isOwner || adminRole === 'owner';

  // Teacher/faculty accounts never enter the student application.
  // Their dedicated portal starts at teacher-login.html and uses the same Supabase project/data.
  isAdmin = isOwner || (adminAccess?.user_id === currentUser.id && ['admin','teacher','faculty','instructor'].includes(adminRole));

  // Never create an approval record here. Only the registration/approval flow
  // or an authorized administrator should create the student's profile.
  if (!profile && !isAdmin) {
    await supabase.auth.signOut();
    adminAccessReady = false;
    if (!authRedirectInProgress) { authRedirectInProgress = true; window.location.replace('login.html?error=not-approved'); }
    return false;
  }

  adminAccessReady = true;

  const name = profile?.name ||
    currentUser.user_metadata?.name ||
    currentUser.email?.split('@')[0] ||
    'Student';

  updateHeader(name);

  if (profile) {
    campusData.student.name = profile.name || name;
    campusData.student.email = profile.email || currentUser.email || '';
    campusData.student.rollNumber = profile.roll_number || campusData.student.rollNumber;
    campusData.student.program = profile.program || campusData.student.program;
    campusData.student.term = profile.term || campusData.student.term;
    campusData.student.section = profile.section || '';
    campusData.student.cgpa = profile.cgpa || campusData.student.cgpa;

    loadLiveCampusData(profile)
      .then(() => {
        // Live campus data loads asynchronously during authentication.
        // Re-render the current live-data page once the query completes so
        // users do not see a stale empty state from the initial render.
        const liveDataRoutes = new Set([
          '#dashboard', '#timetable', '#notices', '#events',
          '#study-assistant', '#campus-guide'
        ]);
        if (liveDataRoutes.has(window.location.hash)) {
          handleRoute();
        }
      })
      .catch((error) => {
        console.error('Live campus data load failed:', error);
      });
  } else {
    campusData.student.name = name;
    campusData.student.email = currentUser.email || '';
    campusData.student.section = '';
  }

  withTimeout(
    supabase
      .from('tasks')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false }),
    3000,
    'Student tasks query'
  ).then(({ data: userTasks, error: tasksError }) => {
    if (tasksError) {
      console.error('Supabase task load failed:', tasksError);
      campusData.tasks = [];
      return;
    }
    campusData.tasks = (userTasks || []).map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      course: task.category || 'General',
      dueDate: task.due_date || 'No due date',
      dueBadge: task.status === 'completed' ? 'Completed' : 'Pending',
      priority: task.priority || 'Medium',
      priorityClass: task.priority === 'High'
        ? 'bg-error-container text-on-error-container'
        : task.priority === 'Low'
          ? 'bg-surface-container text-on-surface-variant'
          : 'bg-secondary-container text-on-secondary-container',
      status: task.status === 'completed' ? 'completed' : 'todo'
    }));
    updateSidebarBadges();
  });

  const avatarImg = document.getElementById('headerAvatar');
  if (avatarImg && currentUser.user_metadata?.avatar_url) {
    avatarImg.src = currentUser.user_metadata.avatar_url;
  }

  document.querySelectorAll('a[data-path="admin-panel"]').forEach(link => {
    link.style.display = isAdmin ? '' : 'none';
  });

  if (window.location.hash === '#admin-panel') {
    handleRoute();
  }

  const signOutBtn = document.getElementById('signOutBtn');
  if (signOutBtn) {
    signOutBtn.onclick = async () => {
      if (confirm('Sign out of AI Campus Copilot?')) {
        await supabase.auth.signOut();
      }
    };
  }

  updateSidebarBadges();
  return true;
}

// Initialize authentication exactly once before enforcing the guard.
async function initializeAuth() {
  if (authInitPromise) return authInitPromise;

  authInitPromise = (async () => {
    const { data, error } = await withTimeout(
      supabase.auth.getSession(),
      5000,
      'Supabase session restore'
    );

    if (error) {
      console.error('Supabase session restore failed:', error);
      authReady = true;
      if (!authRedirectInProgress) { authRedirectInProgress = true; window.location.replace('login.html'); }
      return false;
    }

    const hasSession = await handleAuthSession(data.session);
    authReady = true;

    if (!hasSession) {
      if (!authRedirectInProgress) { authRedirectInProgress = true; window.location.replace('login.html'); }
      return false;
    }

    return true;
  })();

  return authInitPromise;
}

// Handle later auth changes without creating an initialization race.
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    currentUser = null;
    if (window.location.pathname.endsWith('/index.html') ||
        window.location.pathname.endsWith('/ai-campus-copilot/')) {
      if (!authRedirectInProgress) { authRedirectInProgress = true; window.location.replace('login.html'); }
    }
    return;
  }

  if (event === 'SIGNED_IN' && session?.user && authReady) {
    handleAuthSession(session);
    return;
  }

  if (event === 'TOKEN_REFRESHED' && session?.user) {
    // Keep the already-authorized application state during token refreshes.
    return;
  }
});

export async function addTaskToSupabase(task){
  if(!currentUser)return;
  const {error}=await supabase.from('tasks').insert({...task,user_id:currentUser.id});
  if(error)throw error;
}
export async function deleteTaskFromSupabase(taskId){
  if(!currentUser)return;
  const {error}=await supabase.from('tasks').delete().eq('id',taskId).eq('user_id',currentUser.id);
  if(error)throw error;
}
export async function toggleTaskInSupabase(taskId,status){
  if(!currentUser)return;
  const {error}=await supabase.from('tasks').update({status}).eq('id',taskId).eq('user_id',currentUser.id);
  if(error)throw error;
}
export function listenToTasks(callback){
  if(!currentUser)return;
  const load=async()=>{const {data,error}=await supabase.from('tasks').select('*').eq('user_id',currentUser.id).order('created_at',{ascending:false});if(!error)callback((data||[]).map(t=>({supabaseId:t.id,...t})));};
  load();
  const channel=supabase.channel('tasks-'+currentUser.id).on('postgres_changes',
    {event:'*',schema:'public',table:'tasks',filter:'user_id=eq.'+currentUser.id},load).subscribe();
  return ()=>supabase.removeChannel(channel);
}
export { currentUser };

import { renderDashboard } from './pages/dashboard.js?v=20261005-live5';
import { renderAiAssistant } from './pages/ai-assistant.js?v=20261005-live4';
import { renderTimetable } from './pages/timetable.js?v=20261003-live2';
import { renderNotices } from './pages/notices.js?v=20261003-live2';
import { renderStudyAssistant } from './pages/study.js?v=20261005-live2';
import { renderCampusGuide } from './pages/campus-guide.js?v=20261005-live2';
import { renderEvents } from './pages/events.js?v=20261005-live1';
import { renderTasks } from './pages/tasks.js?v=20261005-live2';
import { renderSettings } from './pages/settings.js?v=20261003-live1';

async function renderAdminPanelRoute(container) {
  try {
    const module = await import('./pages/admin.js?v=20261006-owner5');
    module.renderAdminPanel(container);
  } catch (error) {
    console.error('Admin Panel module failed to load:', error);
    container.innerHTML = `
      <div class="max-w-[900px] mx-auto py-10">
        <div class="rounded-2xl border border-error/30 bg-error-container p-6">
          <h1 class="text-xl font-bold text-on-error-container">Admin Panel could not load</h1>
          <p class="mt-2 text-sm text-on-error-container">The student application is still working. Please refresh this page after the latest deployment finishes.</p>
        </div>
      </div>
    `;
  }
}

const routes = {
  'dashboard': { title: 'Dashboard - AI Campus Copilot', render: renderDashboard },
  'ai-assistant': { title: 'AI Assistant - AI Campus Copilot', render: renderAiAssistant },
  'timetable': { title: 'Timetable - AI Campus Copilot', render: renderTimetable },
  'notices': { title: 'Notices - AI Campus Copilot', render: renderNotices },
  'study-assistant': { title: 'Study Assistant - AI Campus Copilot', render: renderStudyAssistant },
  'campus-guide': { title: 'Campus Guide - AI Campus Copilot', render: renderCampusGuide },
  'events': { title: 'Events - AI Campus Copilot', render: renderEvents },
  'my-tasks': { title: 'My Tasks - AI Campus Copilot', render: renderTasks },
  'settings': { title: 'Settings - AI Campus Copilot', render: renderSettings },
  'admin-panel': { title: 'Admin Panel - AI Campus Copilot', render: renderAdminPanelRoute }
};

let currentRoute = '';
let pendingAiQuery = null;

// Initialize App
async function startApp() {
  // OAuth may return access tokens in the URL fragment. Let Supabase restore
  // that session before the hash router touches window.location.hash.
  const authenticated = await initializeAuth();
  if (!authenticated) return;

  initRouter();
  initSidebar();
  initHeaderActions();
  initNotificationsDropdown();
  initReportFeature();
  updateSidebarBadges();

  const palette = initCommandPalette(
    (route) => navigateTo(route),
    (query) => {
      pendingAiQuery = query;
      navigateTo('ai-assistant');
    }
  );

  const headerSearchInput = document.getElementById('headerSearchInput');
  const headerSearchBox = document.getElementById('headerSearchBox');
  if (headerSearchInput) {
    headerSearchInput.addEventListener('focus', () => {
      headerSearchInput.blur();
      palette.openPalette();
    });
  }
  if (headerSearchBox) {
    headerSearchBox.addEventListener('click', () => {
      palette.openPalette();
    });
  }

  window.addEventListener('campus:askAi', (e) => {
    pendingAiQuery = e.detail?.query || null;
    navigateTo('ai-assistant');
  });

  window.addEventListener('campus:tasksUpdated', () => {
    updateSidebarBadges();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp, { once: true });
} else {
  startApp();
}

function initRouter() {
  window.addEventListener('hashchange', () => {
    handleRoute();
  });
  handleRoute();
}

function handleRoute() {
  let hash = window.location.hash.replace('#', '').trim();
  if (!hash || !routes[hash]) {
    hash = 'ai-assistant';
    window.location.hash = '#' + hash;
    return;
  }

  if (hash === 'admin-panel' && !adminAccessReady) {
    currentRoute = hash;
    document.title = routes[hash].title;
    updateActiveNav(hash);
    const mainContainer = document.getElementById('mainContentArea');
    if (mainContainer) {
      mainContainer.innerHTML = '<div class="max-w-[900px] mx-auto py-12 text-center"><p class="text-lg font-semibold">Checking admin permissions…</p><p class="mt-2 text-sm opacity-70">Please wait a moment.</p></div>';
    }
    return;
  }

  if (hash === 'admin-panel' && !isAdmin) {
    showToast('Admin access is restricted to authorized accounts.', 'error');
    window.location.hash = '#dashboard';
    return;
  }

  currentRoute = hash;
  document.title = routes[hash].title;
  updateActiveNav(hash);

  const mainContainer = document.getElementById('mainContentArea');
  if (!mainContainer) return;

  const query = pendingAiQuery;
  pendingAiQuery = null;

  routes[hash].render(mainContainer, query);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function navigateTo(route) {
  window.location.hash = '#' + route;
}

function updateActiveNav(activePath) {
  const activeClass = 'bg-secondary-container text-on-secondary-container font-semibold rounded-xl';
  const inactiveClass = 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors rounded-xl';

  document.querySelectorAll('nav a[data-path]').forEach(link => {
    const path = link.getAttribute('data-path');
    if (path === activePath) {
      link.className = `flex items-center justify-between px-space-md py-space-sm transition-colors ${activeClass}`;
      link.setAttribute('aria-current', 'page');
    } else {
      link.className = `flex items-center justify-between px-space-md py-space-sm font-label-lg text-label-lg ${inactiveClass}`;
      link.removeAttribute('aria-current');
    }
  });
}


function initReportFeature() {
  const reportButtons = document.querySelectorAll('[data-report-button]');
  if (!reportButtons.length) return;
  if (document.getElementById('studentReportModal')) return;

  document.body.insertAdjacentHTML('beforeend', "<div id=\"studentReportModal\" class=\"fixed inset-0 z-[80] hidden items-center justify-center p-4\"><div data-report-backdrop class=\"absolute inset-0 bg-black/45 backdrop-blur-sm\"></div><section role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"studentReportTitle\" class=\"relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-surface-container-lowest rounded-2xl border border-surface-container-high shadow-2xl\"><div class=\"p-5 border-b border-surface-container-high flex items-start justify-between gap-3\"><div><div class=\"flex items-center gap-2\"><span class=\"material-symbols-outlined text-error\">report_problem</span><h2 id=\"studentReportTitle\" class=\"text-lg font-bold text-on-surface\">Report an Issue</h2></div><p class=\"text-xs text-on-surface-variant mt-1\">Send a bug report, person-related report, or other concern to the project owner and the authorized admin for your section.</p></div><button type=\"button\" data-report-close class=\"p-2 rounded-lg text-on-surface-variant hover:bg-surface-container\"><span class=\"material-symbols-outlined text-[20px]\">close</span></button></div><form id=\"studentReportForm\" class=\"p-5 space-y-4\"><div><label class=\"block text-[11px] font-bold text-on-surface mb-1\">Report type</label><select id=\"reportCategory\" required class=\"w-full px-3 py-2.5 rounded-xl border border-surface-container-high bg-white text-xs outline-none focus:border-primary\"><option value=\"bug\">Bug / App problem</option><option value=\"person\">Report a person</option><option value=\"content\">Report content / notice / event</option><option value=\"account\">Account / login problem</option><option value=\"other\">Other concern</option></select></div><div><label class=\"block text-[11px] font-bold text-on-surface mb-1\">Subject</label><input id=\"reportSubject\" type=\"text\" maxlength=\"160\" required placeholder=\"Briefly describe the issue\" class=\"w-full px-3 py-2.5 rounded-xl border border-surface-container-high bg-white text-xs outline-none focus:border-primary\"></div><div><label class=\"block text-[11px] font-bold text-on-surface mb-1\">Details</label><textarea id=\"reportDetails\" rows=\"6\" maxlength=\"5000\" required placeholder=\"Explain what happened, what you expected, and any useful details.\" class=\"w-full px-3 py-2.5 rounded-xl border border-surface-container-high bg-white text-xs outline-none focus:border-primary\"></textarea></div><div class=\"grid grid-cols-1 sm:grid-cols-2 gap-3\"><div><label class=\"block text-[11px] font-bold text-on-surface mb-1\">Page / area</label><input id=\"reportPage\" type=\"text\" maxlength=\"120\" class=\"w-full px-3 py-2.5 rounded-xl border border-surface-container-high bg-white text-xs outline-none focus:border-primary\"></div><div><label class=\"block text-[11px] font-bold text-on-surface mb-1\">Priority</label><select id=\"reportPriority\" class=\"w-full px-3 py-2.5 rounded-xl border border-surface-container-high bg-white text-xs outline-none focus:border-primary\"><option value=\"low\">Low</option><option value=\"medium\" selected>Medium</option><option value=\"high\">High</option></select></div></div><div class=\"p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800\">Please do not include passwords, verification codes, API keys, or other private credentials in a report.</div><div class=\"flex items-center justify-end gap-2 pt-1\"><button type=\"button\" data-report-close class=\"px-4 py-2.5 rounded-xl bg-surface-container text-on-surface text-xs font-bold\">Cancel</button><button id=\"submitStudentReportBtn\" type=\"submit\" class=\"inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold\"><span class=\"material-symbols-outlined text-[17px]\">send</span>Send Report</button></div></form></section></div>");

  const modal = document.getElementById('studentReportModal');
  const form = document.getElementById('studentReportForm');
  const pageInput = document.getElementById('reportPage');
  const subjectInput = document.getElementById('reportSubject');
  const submitButton = document.getElementById('submitStudentReportBtn');

  const closeModal = () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  };

  const openModal = () => {
    if (!currentUser) {
      showToast('Please sign in before sending a report.', 'error');
      return;
    }
    pageInput.value = currentRoute ? currentRoute.replace(/-/g, ' ') : '';
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => subjectInput?.focus(), 0);
  };

  reportButtons.forEach(button => button.addEventListener('click', openModal));
  modal.querySelectorAll('[data-report-close]').forEach(button => button.addEventListener('click', closeModal));
  modal.querySelector('[data-report-backdrop]')?.addEventListener('click', closeModal);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!currentUser || submitButton.disabled) return;

    const payload = {
      reporter_id: currentUser.id,
      category: document.getElementById('reportCategory').value,
      subject: subjectInput.value.trim(),
      details: document.getElementById('reportDetails').value.trim(),
      affected_page: pageInput.value.trim() || null,
      priority: document.getElementById('reportPriority').value,
      status: 'open'
    };

    if (!payload.subject || !payload.details) {
      showToast('Please enter both a subject and details.', 'error');
      return;
    }

    submitButton.disabled = true;
    submitButton.classList.add('opacity-70');
    submitButton.innerHTML = '<span class="material-symbols-outlined text-[17px] animate-spin">progress_activity</span>Sending...';

    try {
      const { error } = await supabase.from('student_reports').insert(payload);
      if (error) throw error;
      form.reset();
      pageInput.value = currentRoute ? currentRoute.replace(/-/g, ' ') : '';
      closeModal();
      showToast('Report sent to the project owner and your authorized admin.', 'success');
    } catch (error) {
      showToast(error?.message || 'Could not send the report.', 'error');
    } finally {
      submitButton.disabled = false;
      submitButton.classList.remove('opacity-70');
      submitButton.innerHTML = '<span class="material-symbols-outlined text-[17px]">send</span>Send Report';
    }
  });
}

function updateSidebarBadges() {
  const unreadNotices = campusData.notices.filter(n => !n.read).length;
  const pendingTasks = campusData.tasks.filter(t => t.status !== 'completed').length;

  document.querySelectorAll('.sidebar-notices-badge').forEach(badge => {
    badge.textContent = unreadNotices;
    badge.style.display = unreadNotices > 0 ? 'inline-flex' : 'none';
  });

  document.querySelectorAll('.sidebar-tasks-badge').forEach(badge => {
    badge.textContent = pendingTasks;
    badge.style.display = pendingTasks > 0 ? 'inline-flex' : 'none';
  });
}

function initSidebar() {
  const mobileToggleBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileDrawerBackdrop = document.getElementById('mobileDrawerBackdrop');
  const closeMobileDrawerBtn = document.getElementById('closeMobileDrawerBtn');

  function openDrawer() {
    if (mobileDrawer) {
      mobileDrawer.classList.remove('hidden');
      mobileDrawer.classList.add('flex');
    }
  }

  function closeDrawer() {
    if (mobileDrawer) {
      mobileDrawer.classList.add('hidden');
      mobileDrawer.classList.remove('flex');
    }
  }

  if (mobileToggleBtn) mobileToggleBtn.addEventListener('click', openDrawer);
  if (closeMobileDrawerBtn) closeMobileDrawerBtn.addEventListener('click', closeDrawer);
  if (mobileDrawerBackdrop) mobileDrawerBackdrop.addEventListener('click', closeDrawer);

  document.querySelectorAll('nav a[data-path]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const path = link.getAttribute('data-path');
      closeDrawer();
      navigateTo(path);
    });
  });
}

function initHeaderActions() {
  const askAiHeaderBtn = document.getElementById('headerAskAiBtn');
  if (askAiHeaderBtn) {
    askAiHeaderBtn.addEventListener('click', () => {
      navigateTo('ai-assistant');
      setTimeout(() => {
        const input = document.getElementById('promptInput');
        if (input) input.focus();
      }, 100);
    });
  }

  const userProfileBtn = document.getElementById('headerProfilePill');
  if (userProfileBtn) {
    userProfileBtn.addEventListener('click', () => {
      navigateTo('settings');
    });
  }
}

function initNotificationsDropdown() {
  const notifBtn = document.getElementById('headerNotifBtn');
  let dropdown = document.getElementById('notifDropdown');

  if (!notifBtn) return;

  notifBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.id = 'notifDropdown';
      dropdown.className = 'absolute top-16 right-4 z-50 w-80 sm:w-96 bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container-high p-space-md space-y-3 animate-fade-in';
      dropdown.innerHTML = `
        <div class="flex items-center justify-between border-b border-surface-container pb-2">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[20px]">notifications</span>
            <span class="font-headline-md text-sm font-bold text-on-surface">Campus Notifications</span>
          </div>
          <button id="viewAllNoticesLink" class="text-xs text-primary font-bold hover:underline">View All</button>
        </div>
        <div class="space-y-2 max-h-72 overflow-y-auto custom-scrollbar" id="notifList">
          ${campusData.notices.slice(0, 3).map(n => `
            <div class="p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer notif-item" data-id="${n.id}">
              <div class="flex items-center justify-between text-[11px] mb-1">
                <span class="font-bold ${n.badgeClass} px-1.5 py-0.2 rounded">${n.category}</span>
                <span class="text-outline">${n.date}</span>
              </div>
              <h5 class="font-label-md text-xs font-bold text-on-surface line-clamp-1">${n.title}</h5>
              <p class="text-[11px] text-on-surface-variant line-clamp-1 mt-0.5">${n.summary}</p>
            </div>
          `).join('')}
        </div>
      `;
      document.body.appendChild(dropdown);

      const viewAll = document.getElementById('viewAllNoticesLink');
      if (viewAll) {
        viewAll.onclick = () => {
          dropdown.remove();
          dropdown = null;
          navigateTo('notices');
        };
      }

      dropdown.querySelectorAll('.notif-item').forEach(item => {
        item.onclick = () => {
          dropdown.remove();
          dropdown = null;
          navigateTo('notices');
        };
      });
    } else {
      dropdown.remove();
      dropdown = null;
    }
  });

  window.addEventListener('click', (e) => {
    if (dropdown && !dropdown.contains(e.target) && e.target !== notifBtn) {
      dropdown.remove();
      dropdown = null;
    }
  });
}

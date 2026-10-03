// AI Campus Copilot - Main Application Controller & Router
import { supabase } from './supabase.js';
import { campusData } from './data.js?v=20261003-live1';
import { initCommandPalette } from './components/command-palette.js';
import { showToast } from './components/toast.js';

// ─── Supabase Auth Guard ───────────────────────────────────────────────────
let currentUser = null;
let authReady = false;
let authInitPromise = null;
let isAdmin = false;
let isOwner = false;

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

  const [noticesRes, eventsRes, timetableRes, examsRes, assignmentsRes, attendanceRes, subjectsRes, facultyRes, locationsRes, rulesRes] = await Promise.all([
    supabase.from('notices').select('id,title,body,category,published_at,source_url').eq('is_published', true).order('published_at', { ascending: false }).limit(50),
    supabase.from('events').select('id,title,description,event_type,starts_at,ends_at,venue,source_url').eq('is_published', true).order('starts_at', { ascending: true }).limit(50),
    supabase.from('timetable').select('id,subject_id,faculty_id,program_id,term,section,day_of_week,start_time,end_time,room,notes,subjects(name,code),faculty(name,designation)').eq('term', term).limit(200),
    supabase.from('exams').select('id,subject_id,program_id,term,section,exam_type,exam_date,start_time,end_time,room,instructions,subjects(name,code)').eq('term', term).limit(100),
    supabase.from('academic_assignments').select('id,subject_id,program_id,term,title,description,due_date,submission_info,subjects(name,code)').eq('term', term).limit(100),
    supabase.from('attendance').select('id,subject_id,classes_held,classes_attended,updated_at,subjects(name,code)').eq('user_id', currentUser.id).limit(100),
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
    days.get(day).push({
      id: row.id,
      code: subject?.code || 'Course',
      name: subject?.name || 'Class',
      type: row.notes?.toLowerCase().includes('lab') ? 'Lab' : 'Lecture',
      room: row.room || 'Room not assigned',
      faculty: faculty?.name || 'Faculty not assigned',
      time: row.start_time && row.end_time ? row.start_time.slice(0,5) + ' - ' + row.end_time.slice(0,5) : 'Time not assigned',
      isCurrent: false
    });
  }
  const orderedDays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  campusData.timetable = [...days.entries()]
    .sort((a,b) => orderedDays.indexOf(a[0]) - orderedDays.indexOf(b[0]))
    .map(([day, classes]) => ({ day, classes: classes.sort((a,b) => a.time.localeCompare(b.time)) }));

  campusData.notices = (noticesRes.data || []).map(n => ({
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

  campusData.events = (eventsRes.data || []).map(e => ({
    id: e.id,
    title: e.title,
    description: e.description || '',
    type: e.event_type || 'Campus Event',
    startsAt: e.starts_at,
    endsAt: e.ends_at,
    date: e.starts_at ? new Date(e.starts_at).toLocaleString() : 'Date not assigned',
    venue: e.venue || 'Venue not assigned',
    sourceUrl: e.source_url || '',
    registered: false
  }));

  const attendanceRows = attendanceRes.data || [];
  campusData.attendance = attendanceRows;
  const held = attendanceRows.reduce((sum, r) => sum + Number(r.classes_held || 0), 0);
  const attended = attendanceRows.reduce((sum, r) => sum + Number(r.classes_attended || 0), 0);
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
      units: []
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
  campusData.exams = (examsRes.data || []).filter(e => !section || !e.section || e.section === section);
  campusData.academicRules = rulesRes.data || [];
  campusData.faculty = facultyRes.data || [];
  campusData.programs = [];
  campusData.loadedAt = new Date().toISOString();
}

async function handleAuthSession(session) {
  if (!session?.user) {
    currentUser = null;
    if (authReady) window.location.replace('login.html');
    return false;
  }

  currentUser = session.user;

  const { data: profile, error: profileError } = await withTimeout(
    supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .maybeSingle(),
    3000,
    'Student profile query'
  );

  if (profileError) {
    console.error('Supabase profile load failed:', profileError);
  }

  // Keep the existing UI, but hydrate the student-facing values from Supabase.
  const name = profile?.name ||
    currentUser.user_metadata?.name ||
    currentUser.email?.split('@')[0] ||
    'Student';

  // Update the header immediately; do not leave the shell showing “Loading...” while
  // unrelated campus datasets are still being fetched.
  const earlyNamePill = document.querySelector('#headerProfilePill .font-label-md');
  const earlyEmailPill = document.querySelector('#headerProfilePill .font-label-sm');
  if (earlyNamePill) earlyNamePill.textContent = name;
  if (earlyEmailPill) earlyEmailPill.textContent = currentUser.email || '';

  // Google OAuth users may not have a profile row yet. Create one after
  // authentication so personal fields do not fall back to demo data.
  if (!profile && !profileError) {
    const { error: profileCreateError } = await withTimeout(
      supabase.from('profiles').upsert({
      id: currentUser.id,
      name,
      email: currentUser.email || '',
      roll_number: currentUser.user_metadata?.roll_number || 'N/A',
      program: '',
      term: '',
      cgpa: '0.00'
      }),
      3000,
      'Student profile creation'
    );

    if (profileCreateError) {
      console.error('Supabase profile create failed:', profileCreateError);
    }
  }

  // Do not block the entire application shell on campus-data queries.
  // Profile/header hydration must complete first; the larger live-data feed loads in the background.
  loadLiveCampusData(profile || campusData.student).catch((error) => {
    console.error('Live campus data load failed:', error);
  });

  if (profile) {
    campusData.student.name = profile.name || name;
    campusData.student.email = profile.email || currentUser.email || '';
    campusData.student.rollNumber = profile.roll_number || campusData.student.rollNumber;
    campusData.student.program = profile.program || campusData.student.program;
    campusData.student.term = profile.term || campusData.student.term;
    campusData.student.section = profile.section || '';
    campusData.student.cgpa = profile.cgpa || campusData.student.cgpa;
  } else {
    campusData.student.name = name;
    campusData.student.email = currentUser.email || '';
  }

  const { data: userTasks, error: tasksError } = await withTimeout(
    supabase
      .from('tasks')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false }),
    3000,
    'Student tasks query'
  );

  // Personal task data must never fall back to the bundled demo tasks.
  if (tasksError) {
    console.error('Supabase task load failed:', tasksError);
    campusData.tasks = [];
  } else {
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
  }

  const { data: adminAccess, error: adminAccessError } = await withTimeout(
    supabase
      .from('admin_users')
      .select('user_id, role')
      .eq('user_id', currentUser.id)
      .maybeSingle(),
    3000,
    'Admin permission query'
  );

  if (adminAccessError) {
    console.error('Supabase admin permission check failed:', adminAccessError);
  }
  isAdmin = Boolean(adminAccess && adminAccess.user_id === currentUser.id);
  isOwner = Boolean(adminAccess && adminAccess.user_id === currentUser.id && adminAccess.role === 'owner');

  document.querySelectorAll('a[data-path="admin-panel"]').forEach(link => {
    link.style.display = isAdmin ? '' : 'none';
  });

  const namePill = document.querySelector('#headerProfilePill .font-label-md');
  const emailPill = document.querySelector('#headerProfilePill .font-label-sm');
  const avatarImg = document.getElementById('headerAvatar');

  if (namePill) namePill.textContent = name;
  if (emailPill) emailPill.textContent = currentUser.email || '';
  if (avatarImg && currentUser.user_metadata?.avatar_url) {
    avatarImg.src = currentUser.user_metadata.avatar_url;
  }

  campusData.student.name = name;
  campusData.student.email = currentUser.email || campusData.student.email || '';

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
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Supabase session restore failed:', error);
      authReady = true;
      window.location.replace('login.html');
      return false;
    }

    const hasSession = await handleAuthSession(data.session);
    authReady = true;

    if (!hasSession) {
      window.location.replace('login.html');
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
      window.location.replace('login.html');
    }
    return;
  }

  if (event === 'TOKEN_REFRESHED' && session?.user) {
    handleAuthSession(session);
  }
});

export async function addTaskToFirestore(task){
  if(!currentUser)return;
  const {error}=await supabase.from('tasks').insert({...task,user_id:currentUser.id});
  if(error)throw error;
}
export async function deleteTaskFromFirestore(taskId){
  if(!currentUser)return;
  const {error}=await supabase.from('tasks').delete().eq('id',taskId).eq('user_id',currentUser.id);
  if(error)throw error;
}
export async function toggleTaskInFirestore(taskId,status){
  if(!currentUser)return;
  const {error}=await supabase.from('tasks').update({status}).eq('id',taskId).eq('user_id',currentUser.id);
  if(error)throw error;
}
export function listenToTasks(callback){
  if(!currentUser)return;
  const load=async()=>{const {data,error}=await supabase.from('tasks').select('*').eq('user_id',currentUser.id).order('created_at',{ascending:false});if(!error)callback((data||[]).map(t=>({firestoreId:t.id,...t})));};
  load();
  const channel=supabase.channel('tasks-'+currentUser.id).on('postgres_changes',
    {event:'*',schema:'public',table:'tasks',filter:'user_id=eq.'+currentUser.id},load).subscribe();
  return ()=>supabase.removeChannel(channel);
}
export { currentUser };

import { renderDashboard } from './pages/dashboard.js';
import { renderAiAssistant } from './pages/ai-assistant.js';
import { renderTimetable } from './pages/timetable.js';
import { renderNotices } from './pages/notices.js';
import { renderStudyAssistant } from './pages/study.js';
import { renderCampusGuide } from './pages/campus-guide.js';
import { renderEvents } from './pages/events.js';
import { renderTasks } from './pages/tasks.js';
import { renderSettings } from './pages/settings.js';
import { renderAdminPanel } from './pages/admin.js?v=20261003-live1';

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
  'admin-panel': { title: 'Admin Panel - AI Campus Copilot', render: renderAdminPanel }
};

let currentRoute = '';
let pendingAiQuery = null;

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
  // OAuth may return access tokens in the URL fragment. Let Supabase restore
  // that session before the hash router touches window.location.hash.
  const authenticated = await initializeAuth();
  if (!authenticated) return;

  initRouter();
  initSidebar();
  initHeaderActions();
  initNotificationsDropdown();
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
});

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

  if (hash === 'admin-panel' && !isAdmin) {
    showToast('Admin access is restricted to authorized students.', 'error');
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

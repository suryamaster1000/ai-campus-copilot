// AI Campus Copilot - Main Application Controller & Router
import { campusData } from './data.js';
import { showToast } from './components/toast.js';
import { initCommandPalette } from './components/command-palette.js';
import {
  auth,
  db,
  onAuthStateChanged,
  signOut,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy
} from './firebase.js';

// ─── Firebase Auth Guard ───────────────────────────────────────────────────
// Redirect to login if not authenticated
let currentUser = null;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  currentUser = user;

  // Update header with real user name
  const namePill = document.querySelector('#headerProfilePill .font-label-md');
  const emailPill = document.querySelector('#headerProfilePill .font-label-sm');
  const avatarImg = document.getElementById('headerAvatar');
  if (namePill) namePill.textContent = user.displayName || user.email.split('@')[0];
  if (emailPill) emailPill.textContent = user.email;
  if (avatarImg && user.photoURL) avatarImg.src = user.photoURL;

  // Update campus data with Firebase user info
  campusData.student.name = user.displayName || user.email.split('@')[0];
  campusData.student.email = user.email;
  if (user.photoURL) campusData.student.avatar = user.photoURL;

  // Wire sign-out button
  const signOutBtn = document.getElementById('signOutBtn');
  if (signOutBtn) {
    signOutBtn.onclick = async () => {
      if (confirm('Sign out of AI Campus Copilot?')) {
        await signOut(auth);
        window.location.href = 'login.html';
      }
    };
  }

  updateSidebarBadges();
});

// ─── Firebase Firestore: Real-time Tasks ──────────────────────────────────
export async function addTaskToFirestore(task) {
  if (!currentUser) return;
  await addDoc(collection(db, 'students', currentUser.uid, 'tasks'), {
    ...task,
    createdAt: serverTimestamp()
  });
}

export async function deleteTaskFromFirestore(taskId) {
  if (!currentUser) return;
  await deleteDoc(doc(db, 'students', currentUser.uid, 'tasks', taskId));
}

export async function toggleTaskInFirestore(taskId, status) {
  if (!currentUser) return;
  await updateDoc(doc(db, 'students', currentUser.uid, 'tasks', taskId), { status });
}

export function listenToTasks(callback) {
  if (!currentUser) return;
  const q = query(
    collection(db, 'students', currentUser.uid, 'tasks'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    const tasks = snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
    callback(tasks);
  });
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
import { renderAdminPanel } from './pages/admin.js';

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
document.addEventListener('DOMContentLoaded', () => {
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

  // Search input in header opens command palette
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

  // Listen for global custom events
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
    // Default to dashboard or ai-assistant (Stitch prototype default was ai-assistant)
    hash = 'ai-assistant';
    window.location.hash = '#' + hash;
    return;
  }

  currentRoute = hash;
  document.title = routes[hash].title;
  updateActiveNav(hash);

  const mainContainer = document.getElementById('mainContentArea');
  if (!mainContainer) return;

  // Render the page
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
  // Mobile drawer elements
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

  if (mobileToggleBtn) {
    mobileToggleBtn.addEventListener('click', openDrawer);
  }
  if (closeMobileDrawerBtn) {
    closeMobileDrawerBtn.addEventListener('click', closeDrawer);
  }
  if (mobileDrawerBackdrop) {
    mobileDrawerBackdrop.addEventListener('click', closeDrawer);
  }

  // Attach navigation clicks to all sidebar links
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
  // Ask AI button in header
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

  // Profile click in header
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

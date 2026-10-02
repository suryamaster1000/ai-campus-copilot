// Global ⌘K Command Palette and Campus Search Modal

export function initCommandPalette(onNavigate, onAiQuery) {
  let modal = document.getElementById('command-palette-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'command-palette-modal';
    modal.className = 'fixed inset-0 z-50 hidden items-start justify-center pt-20 px-4 drawer-backdrop';
    modal.innerHTML = `
      <div class="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 w-full max-w-2xl overflow-hidden animate-fade-in" id="palette-card">
        <div class="p-3 border-b border-surface-container flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[22px]">search</span>
          <input id="palette-input" type="text" class="w-full bg-transparent border-none outline-none font-body-md text-on-surface placeholder:text-outline text-base" placeholder="Search pages, timetable, syllabus, campus venues or ask AI..."/>
          <kbd class="font-label-sm text-[11px] bg-surface-container px-2 py-1 rounded text-on-surface-variant">ESC</kbd>
        </div>
        <div class="max-h-96 overflow-y-auto p-2" id="palette-results">
          <!-- Dynamic Results -->
        </div>
        <div class="p-2.5 bg-surface-container-low border-t border-surface-container flex items-center justify-between text-[11px] text-outline">
          <div class="flex items-center gap-3">
            <span><kbd class="bg-surface-container px-1.5 py-0.5 rounded">↑↓</kbd> Navigate</span>
            <span><kbd class="bg-surface-container px-1.5 py-0.5 rounded">↵</kbd> Select</span>
          </div>
          <span>AI Campus Copilot v2.4</span>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closePalette();
    });
  }

  const items = [
    { title: "Dashboard", category: "Pages", icon: "dashboard", route: "dashboard", desc: "Overview, GPA & today's summary" },
    { title: "AI Assistant", category: "Pages", icon: "smart_toy", route: "ai-assistant", desc: "Chat with verified campus model" },
    { title: "Timetable & Classes", category: "Pages", icon: "calendar_month", route: "timetable", desc: "Weekly schedule, rooms & faculty" },
    { title: "Notices & Announcements", category: "Pages", icon: "campaign", route: "notices", desc: "Urgent exam dates & notices" },
    { title: "Study Assistant", category: "Pages", icon: "menu_book", route: "study-assistant", desc: "Syllabi, notes & AI study tools" },
    { title: "Campus Guide & Venues", category: "Pages", icon: "map", route: "campus-guide", desc: "Buildings, labs, shuttles & hours" },
    { title: "Campus Events & Hackathons", category: "Pages", icon: "event", route: "events", desc: "Upcoming workshops & fests" },
    { title: "My Tasks & Deadlines", category: "Pages", icon: "task_alt", route: "my-tasks", desc: "Assignments, submissions & todo" },
    { title: "Settings & Preferences", category: "Pages", icon: "settings", route: "settings", desc: "Profile, notifications & grounding" },
    { title: "Admin Panel", category: "Pages", icon: "admin_panel_settings", route: "admin-panel", desc: "RAG index & system telemetry" },
    // Instant queries
    { title: "Where can I submit medical leave?", category: "Quick AI Answers", icon: "help", query: "Where can I submit my medical leave certificate?", desc: "Admin Block A Room 104 policy" },
    { title: "What is my attendance in CS-204?", category: "Quick AI Answers", icon: "percent", query: "What is my attendance percentage in CS-204?", desc: "Check current lecture percentage" },
    { title: "Campus shuttle Route 4 timings", category: "Quick AI Answers", icon: "directions_bus", query: "Campus shuttle Route 4 timings", desc: "View night escort bus route" },
    { title: "When is the next midterm exam?", category: "Quick AI Answers", icon: "event_available", query: "When is the next midterm exam?", desc: "Nov 05, 2024 date sheet" }
  ];

  const input = document.getElementById('palette-input');
  const resultsContainer = document.getElementById('palette-results');

  function renderList(query = '') {
    const q = query.toLowerCase().trim();
    const filtered = items.filter(item => 
      item.title.toLowerCase().includes(q) || 
      item.category.toLowerCase().includes(q) || 
      item.desc.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
      resultsContainer.innerHTML = `
        <div class="p-6 text-center text-outline">
          <p class="font-body-md text-sm">No exact matches found for "${query}"</p>
          <button class="mt-3 px-3 py-1.5 bg-primary text-on-primary rounded-xl font-label-md text-xs hover:bg-tertiary-container transition-colors" id="ask-ai-search-btn">
            Ask Copilot: "${query}"
          </button>
        </div>
      `;
      const askBtn = document.getElementById('ask-ai-search-btn');
      if (askBtn) {
        askBtn.addEventListener('click', () => {
          closePalette();
          onAiQuery(query);
        });
      }
      return;
    }

    let html = '';
    let currentCat = '';
    filtered.forEach((item, index) => {
      if (item.category !== currentCat) {
        currentCat = item.category;
        html += `<div class="px-3 py-1.5 text-[11px] font-label-sm font-semibold uppercase text-outline tracking-wider">${currentCat}</div>`;
      }
      html += `
        <div class="palette-item p-2.5 rounded-xl hover:bg-surface-container flex items-center justify-between cursor-pointer transition-colors group" data-index="${index}">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
              <span class="material-symbols-outlined text-[18px]">${item.icon}</span>
            </div>
            <div>
              <div class="font-label-md text-on-surface font-semibold text-sm">${item.title}</div>
              <div class="font-body-sm text-xs text-on-surface-variant">${item.desc}</div>
            </div>
          </div>
          <span class="material-symbols-outlined text-outline text-[16px] group-hover:text-primary">arrow_forward</span>
        </div>
      `;
    });

    resultsContainer.innerHTML = html;

    // Attach click events
    resultsContainer.querySelectorAll('.palette-item').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.getAttribute('data-index'));
        const target = filtered[idx];
        closePalette();
        if (target.route) {
          onNavigate(target.route);
        } else if (target.query) {
          onAiQuery(target.query);
        }
      });
    });
  }

  function openPalette() {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    input.value = '';
    renderList('');
    setTimeout(() => input.focus(), 50);
  }

  function closePalette() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }

  input.addEventListener('input', (e) => {
    renderList(e.target.value);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePalette();
    } else if (e.key === 'Enter') {
      const firstItem = resultsContainer.querySelector('.palette-item');
      if (firstItem) {
        firstItem.click();
      } else if (input.value.trim()) {
        closePalette();
        onAiQuery(input.value.trim());
      }
    }
  });

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      if (modal.classList.contains('hidden')) {
        openPalette();
      } else {
        closePalette();
      }
    }
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closePalette();
    }
  });

  return { openPalette, closePalette };
}

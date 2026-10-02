// Dashboard Page - Student Academic Hub
import { campusData } from '../data.js';
import { showToast } from '../components/toast.js';

export function renderDashboard(container) {
  const currentClass = campusData.timetable[0].classes[1]; // CS-204
  const upcomingTasks = campusData.tasks.filter(t => t.status !== 'completed').slice(0, 3);
  const urgentNotices = campusData.notices.slice(0, 2);

  container.innerHTML = `
    <div class="max-w-[1720px] mx-auto py-space-sm space-y-space-md animate-fade-in">
      
      <!-- Welcome Header Banner -->
      <div class="bg-gradient-to-r from-primary via-primary-container to-tertiary-container text-on-primary rounded-2xl p-space-md lg:p-space-lg shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
        <div class="space-y-1">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md">
            <span class="material-symbols-outlined text-[15px] material-symbols-filled text-amber-300">verified</span>
            <span>Fall 2024 Academic Term Active</span>
          </div>
          <h1 class="font-headline-lg text-2xl lg:text-3xl font-extrabold tracking-tight">
            Welcome back, Sophia! 👋
          </h1>
          <p class="font-body-md text-sm text-white/90">
            You have <span class="font-semibold underline decoration-white/50">3 lectures</span> remaining today. Your next class is in <span class="font-bold">25 minutes</span> in Turing Hall.
          </p>
        </div>
        <div class="flex items-center gap-2 self-stretch sm:self-auto flex-wrap">
          <button id="dashAskAiBtn" class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-primary hover:bg-surface-container font-label-lg rounded-xl shadow-sm transition-all font-bold text-sm">
            <span class="material-symbols-outlined text-[18px]">auto_awesome</span>
            <span>Ask Copilot</span>
          </button>
          <button id="dashTimetableBtn" class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-label-lg rounded-xl transition-all font-semibold text-sm">
            <span class="material-symbols-outlined text-[18px]">calendar_month</span>
            <span>View Schedule</span>
          </button>
        </div>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <!-- Metric 1: Next Class -->
        <div class="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-surface-container-high hover:border-primary/40 transition-all flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-outline uppercase tracking-wider">Next Session</span>
            <span class="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-bold flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> Starts 10:15
            </span>
          </div>
          <div class="my-2">
            <h3 class="font-headline-md text-lg font-bold text-on-surface">${currentClass.code} - ${currentClass.name}</h3>
            <p class="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
              <span class="material-symbols-outlined text-[16px] text-outline">room</span>
              ${currentClass.room}
            </p>
          </div>
          <div class="flex items-center justify-between pt-2 border-t border-surface-container text-xs">
            <span class="text-on-surface-variant font-medium">${currentClass.faculty}</span>
            <button class="text-primary font-bold hover:underline flex items-center gap-0.5" onclick="window.location.hash='#timetable'">
              Timetable <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>

        <!-- Metric 2: Attendance -->
        <div class="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-surface-container-high hover:border-primary/40 transition-all flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-outline uppercase tracking-wider">Attendance Status</span>
            <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">Good Standing</span>
          </div>
          <div class="my-2">
            <div class="flex items-baseline gap-2">
              <span class="font-headline-lg text-3xl font-extrabold text-on-surface">${campusData.student.attendanceOverall}</span>
              <span class="text-xs text-outline font-medium">min 75% required</span>
            </div>
            <div class="w-full bg-surface-container h-2 rounded-full mt-2 overflow-hidden">
              <div class="bg-emerald-500 h-full rounded-full" style="width: 89.4%"></div>
            </div>
          </div>
          <div class="flex items-center justify-between pt-2 border-t border-surface-container text-xs text-on-surface-variant">
            <span>6 Courses Tracked</span>
            <span class="text-amber-600 font-semibold">MA-202 at 80.7%</span>
          </div>
        </div>

        <!-- Metric 3: Pending Tasks -->
        <div class="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-surface-container-high hover:border-primary/40 transition-all flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-outline uppercase tracking-wider">Pending Tasks</span>
            <span class="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[11px] font-bold">2 Urgent</span>
          </div>
          <div class="my-2">
            <div class="flex items-baseline gap-2">
              <span class="font-headline-lg text-3xl font-extrabold text-on-surface">4</span>
              <span class="text-xs text-outline font-medium">assignments &amp; duties</span>
            </div>
            <p class="text-xs text-on-surface-variant mt-2 truncate">
              Next: AVL Tree lab due in 4 days
            </p>
          </div>
          <div class="flex items-center justify-between pt-2 border-t border-surface-container text-xs">
            <span class="text-outline">Term 4</span>
            <button class="text-primary font-bold hover:underline flex items-center gap-0.5" onclick="window.location.hash='#my-tasks'">
              View Tasks <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>

        <!-- Metric 4: Academic CGPA -->
        <div class="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-surface-container-high hover:border-primary/40 transition-all flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-outline uppercase tracking-wider">Current CGPA</span>
            <span class="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[11px] font-bold">Top 5%</span>
          </div>
          <div class="my-2">
            <div class="flex items-baseline gap-2">
              <span class="font-headline-lg text-3xl font-extrabold text-on-surface">${campusData.student.cgpa}</span>
              <span class="text-xs text-outline font-medium">/ 4.0 Scale</span>
            </div>
            <p class="text-xs text-on-surface-variant mt-2">
              ${campusData.student.creditsCompleted} of ${campusData.student.totalCredits} credits completed
            </p>
          </div>
          <div class="flex items-center justify-between pt-2 border-t border-surface-container text-xs text-outline">
            <span>Dean's List Honoree</span>
            <span class="text-primary font-semibold">Fall 2024</span>
          </div>
        </div>
      </div>

      <!-- Main Two Column Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
        
        <!-- Left 2 Cols: Schedule & Quick AI & Notices -->
        <div class="lg:col-span-2 space-y-space-md">
          
          <!-- Today's Schedule Timeline Card -->
          <div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container-high">
            <div class="flex items-center justify-between mb-space-md">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[22px]">calendar_today</span>
                <h2 class="font-headline-md font-bold text-on-surface text-lg">Today's Class Schedule</h2>
                <span class="text-xs font-semibold px-2 py-0.5 rounded bg-surface-container text-outline">Monday</span>
              </div>
              <button class="text-primary text-xs font-bold hover:underline" onclick="window.location.hash='#timetable'">
                Full Timetable →
              </button>
            </div>

            <div class="space-y-3">
              ${campusData.timetable[0].classes.map((cls, idx) => `
                <div class="p-3.5 rounded-xl border ${cls.isCurrent ? 'bg-primary-fixed/20 border-primary shadow-sm ring-1 ring-primary/30' : 'bg-surface-container-low border-surface-container-high'} flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div class="flex items-start gap-3">
                    <div class="w-12 h-12 rounded-xl ${cls.isCurrent ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface'} flex flex-col items-center justify-center flex-shrink-0 font-bold">
                      <span class="text-[11px] uppercase">${cls.time.split(' ')[0]}</span>
                      <span class="text-[9px] opacity-80">${cls.type}</span>
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="px-1.5 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold">${cls.code}</span>
                        <h4 class="font-headline-md font-bold text-sm text-on-surface">${cls.name}</h4>
                        ${cls.isCurrent ? '<span class="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-bold">LIVE NOW</span>' : ''}
                      </div>
                      <p class="text-xs text-on-surface-variant mt-1 flex items-center gap-2">
                        <span>📍 ${cls.room}</span>
                        <span>•</span>
                        <span>👤 ${cls.faculty}</span>
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 self-start sm:self-center">
                    <button class="dash-route-btn px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold rounded-lg transition-colors flex items-center gap-1" data-room="${cls.room}">
                      <span class="material-symbols-outlined text-[15px] text-primary">navigation</span>
                      <span>Route</span>
                    </button>
                    <button class="dash-ask-class-btn px-3 py-1.5 bg-primary-container hover:bg-primary text-on-primary-container hover:text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1" data-query="Explain syllabus topics for ${cls.code}">
                      <span class="material-symbols-outlined text-[15px]">smart_toy</span>
                      <span>Ask AI</span>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Quick AI Grounded Query Shortcuts -->
          <div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container-high">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[22px]">bolt</span>
                <h2 class="font-headline-md font-bold text-on-surface text-lg">Instant AI Queries</h2>
              </div>
              <span class="text-xs text-outline font-medium">Grounded in Campus RAG</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button class="dash-quick-query p-3 bg-surface-container-low hover:bg-secondary-container hover:text-on-secondary-container text-left rounded-xl transition-all group flex items-start gap-3" data-query="Where can I submit my medical leave certificate?">
                <div class="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-105 transition-transform">
                  <span class="material-symbols-outlined text-[18px]">medical_services</span>
                </div>
                <div>
                  <h4 class="font-label-md font-bold text-xs text-on-surface group-hover:text-on-secondary-container">Submit Medical Leave</h4>
                  <p class="text-[11px] text-on-surface-variant group-hover:text-on-secondary-container/80 mt-0.5">Admin Block A counter &amp; 3-day rule</p>
                </div>
              </button>

              <button class="dash-quick-query p-3 bg-surface-container-low hover:bg-secondary-container hover:text-on-secondary-container text-left rounded-xl transition-all group flex items-start gap-3" data-query="What is my attendance percentage in CS-204?">
                <div class="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-emerald-600 flex-shrink-0 group-hover:scale-105 transition-transform">
                  <span class="material-symbols-outlined text-[18px]">percent</span>
                </div>
                <div>
                  <h4 class="font-label-md font-bold text-xs text-on-surface group-hover:text-on-secondary-container">Attendance Audit</h4>
                  <p class="text-[11px] text-on-surface-variant group-hover:text-on-secondary-container/80 mt-0.5">Check CS-204 safe lecture margin</p>
                </div>
              </button>

              <button class="dash-quick-query p-3 bg-surface-container-low hover:bg-secondary-container hover:text-on-secondary-container text-left rounded-xl transition-all group flex items-start gap-3" data-query="When is the next midterm exam?">
                <div class="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-error flex-shrink-0 group-hover:scale-105 transition-transform">
                  <span class="material-symbols-outlined text-[18px]">event_available</span>
                </div>
                <div>
                  <h4 class="font-label-md font-bold text-xs text-on-surface group-hover:text-on-secondary-container">Midterm Schedule</h4>
                  <p class="text-[11px] text-on-surface-variant group-hover:text-on-secondary-container/80 mt-0.5">Exams start Nov 05, 2024</p>
                </div>
              </button>

              <button class="dash-quick-query p-3 bg-surface-container-low hover:bg-secondary-container hover:text-on-secondary-container text-left rounded-xl transition-all group flex items-start gap-3" data-query="Summarize lecture notes for AVL Trees">
                <div class="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-secondary flex-shrink-0 group-hover:scale-105 transition-transform">
                  <span class="material-symbols-outlined text-[18px]">auto_stories</span>
                </div>
                <div>
                  <h4 class="font-label-md font-bold text-xs text-on-surface group-hover:text-on-secondary-container">AVL Trees Review</h4>
                  <p class="text-[11px] text-on-surface-variant group-hover:text-on-secondary-container/80 mt-0.5">Rotations &amp; balance factor formulas</p>
                </div>
              </button>
            </div>
          </div>

          <!-- Recent Notices Preview -->
          <div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container-high">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-error text-[22px]">campaign</span>
                <h2 class="font-headline-md font-bold text-on-surface text-lg">Urgent Campus Circulars</h2>
              </div>
              <button class="text-primary text-xs font-bold hover:underline" onclick="window.location.hash='#notices'">
                View All Notices →
              </button>
            </div>
            <div class="space-y-2.5">
              ${urgentNotices.map(n => `
                <div class="p-3 bg-surface-container-low rounded-xl flex items-start justify-between gap-3 hover:bg-surface-container transition-colors cursor-pointer notice-card-link" onclick="window.location.hash='#notices'">
                  <div class="space-y-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold ${n.badgeClass}">${n.category}</span>
                      <span class="text-xs text-outline font-medium">${n.date}</span>
                    </div>
                    <h4 class="font-label-md font-bold text-sm text-on-surface truncate">${n.title}</h4>
                    <p class="text-xs text-on-surface-variant line-clamp-1">${n.summary}</p>
                  </div>
                  <span class="material-symbols-outlined text-outline text-[18px] flex-shrink-0 mt-1">arrow_forward</span>
                </div>
              `).join('')}
            </div>
          </div>

        </div>

        <!-- Right 1 Col: Tasks, Milestones & Transport -->
        <div class="space-y-space-md">
          
          <!-- Upcoming Tasks Mini Card -->
          <div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container-high">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[20px]">task_alt</span>
                <h3 class="font-headline-md font-bold text-base text-on-surface">To-Do Deadlines</h3>
              </div>
              <button class="text-primary text-xs font-bold hover:underline" onclick="window.location.hash='#my-tasks'">
                View All
              </button>
            </div>
            <div class="space-y-2" id="dashTasksList">
              ${upcomingTasks.map(task => `
                <div class="p-2.5 bg-surface-container-low rounded-xl flex items-start gap-2.5">
                  <input type="checkbox" class="mt-1 rounded text-primary focus:ring-primary h-4 w-4 dash-task-chk" data-id="${task.id}" ${task.status === 'completed' ? 'checked' : ''}/>
                  <div class="min-w-0 flex-1">
                    <p class="text-xs font-semibold text-on-surface leading-tight ${task.status === 'completed' ? 'line-through text-outline' : ''}">${task.title}</p>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="text-[10px] text-outline">${task.course}</span>
                      <span class="text-[10px] font-bold px-1.5 py-0.2 rounded ${task.priorityClass}">${task.dueBadge}</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Academic Calendar Milestones -->
          <div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container-high">
            <div class="flex items-center justify-between mb-3">
              <span class="font-label-md font-bold text-sm text-on-surface uppercase tracking-wider text-outline">Upcoming Milestones</span>
              <span class="text-xs text-primary font-bold">Fall 2024</span>
            </div>
            <div class="space-y-3">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-xl bg-surface-container text-on-surface flex flex-col items-center justify-center flex-shrink-0 text-xs font-bold">
                  <span>OCT</span>
                  <span class="text-sm text-primary font-black">28</span>
                </div>
                <div>
                  <h4 class="font-label-md text-xs font-bold text-on-surface">CS-204 Lab Assignment 3</h4>
                  <span class="text-[11px] text-error font-semibold">11:59 PM • 4 days remaining</span>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-xl bg-surface-container text-on-surface flex flex-col items-center justify-center flex-shrink-0 text-xs font-bold">
                  <span>NOV</span>
                  <span class="text-sm text-primary font-black">05</span>
                </div>
                <div>
                  <h4 class="font-label-md text-xs font-bold text-on-surface">Midterm Examinations Begin</h4>
                  <span class="text-[11px] text-on-surface-variant">Hall ticket download opens Oct 30</span>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-xl bg-surface-container text-on-surface flex flex-col items-center justify-center flex-shrink-0 text-xs font-bold">
                  <span>NOV</span>
                  <span class="text-sm text-primary font-black">10</span>
                </div>
                <div>
                  <h4 class="font-label-md text-xs font-bold text-on-surface">Synapse 2024 Cultural Fest</h4>
                  <span class="text-[11px] text-on-surface-variant">Annual campus extravaganza</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Campus Shuttle Live Status -->
          <div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container-high">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-primary text-[20px]">directions_bus</span>
                <h4 class="font-label-md font-bold text-sm text-on-surface">Campus Shuttle</h4>
              </div>
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p class="text-xs text-on-surface-variant">
              Route 1 (North Ring) is arriving at <strong>Turing Hall</strong> in <strong>4 mins</strong>.
            </p>
            <button class="mt-2 text-xs font-bold text-primary hover:underline flex items-center gap-1" onclick="window.location.hash='#campus-guide'">
              Live Shuttle Map &amp; Tracker →
            </button>
          </div>

        </div>

      </div>

    </div>
  `;

  // Attach button actions
  const askAiBtn = document.getElementById('dashAskAiBtn');
  if (askAiBtn) {
    askAiBtn.onclick = () => window.location.hash = '#ai-assistant';
  }

  const timetableBtn = document.getElementById('dashTimetableBtn');
  if (timetableBtn) {
    timetableBtn.onclick = () => window.location.hash = '#timetable';
  }

  // Quick query buttons
  container.querySelectorAll('.dash-quick-query').forEach(btn => {
    btn.onclick = () => {
      const q = btn.getAttribute('data-query');
      window.location.hash = '#ai-assistant';
      // Trigger AI assistant with query
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('campus:askAi', { detail: { query: q } }));
      }, 50);
    };
  });

  // Class Ask AI buttons
  container.querySelectorAll('.dash-ask-class-btn').forEach(btn => {
    btn.onclick = () => {
      const q = btn.getAttribute('data-query');
      window.location.hash = '#ai-assistant';
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('campus:askAi', { detail: { query: q } }));
      }, 50);
    };
  });

  // Route buttons
  container.querySelectorAll('.dash-route-btn').forEach(btn => {
    btn.onclick = () => {
      const room = btn.getAttribute('data-room');
      window.location.hash = '#campus-guide';
      showToast(`Navigating to ${room}`, 'info');
    };
  });

  // Checkbox toggle
  container.querySelectorAll('.dash-task-chk').forEach(chk => {
    chk.onchange = () => {
      const id = chk.getAttribute('data-id');
      const target = campusData.tasks.find(t => t.id === id);
      if (target) {
        target.status = chk.checked ? 'completed' : 'todo';
        showToast(chk.checked ? `Task completed: ${target.title}` : `Task reopened`, 'success');
        renderDashboard(container);
      }
    };
  });
}

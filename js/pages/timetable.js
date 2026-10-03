// Timetable Page - Weekly Academic Schedule
import { campusData } from '../data.js';
import { showToast } from '../components/toast.js';

export function renderTimetable(container) {
  let selectedDay = "Monday";
  let activeFilter = "All";

  function render() {
    const dayData = campusData.timetable.find(d => d.day === selectedDay) || campusData.timetable[0] || { day: selectedDay, classes: [] };
    const filteredClasses = dayData.classes.filter(cls => {
      if (activeFilter === "All") return true;
      return cls.type.toLowerCase().includes(activeFilter.toLowerCase());
    });

    container.innerHTML = `
      <div class="max-w-[1720px] mx-auto py-space-sm space-y-space-md animate-fade-in">
        
        <!-- Top Title & Controls -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-surface-container-high">
          <div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[24px]">calendar_month</span>
              <h1 class="font-headline-md text-xl lg:text-2xl font-bold text-on-surface">Academic Timetable</h1>
              <span class="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-semibold">Live schedule</span>
            </div>
            <p class="text-xs text-on-surface-variant mt-1">
              Your program • Current term • Department
            </p>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <button id="downloadTimetableBtn" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold rounded-xl transition-colors">
              <span class="material-symbols-outlined text-[18px]">download</span>
              <span>Download iCal / PDF</span>
            </button>
            <button id="askAiTimetableBtn" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-on-primary hover:bg-tertiary-container text-xs font-semibold rounded-xl shadow-sm transition-colors">
              <span class="material-symbols-outlined text-[18px]">smart_toy</span>
              <span>Ask AI About Schedule</span>
            </button>
          </div>
        </div>

        <!-- Day Selector Tabs & Type Filter -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <!-- Day Tabs -->
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1">
            ${campusData.timetable.map(d => `
              <button class="day-tab-btn px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${d.day === selectedDay ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant'}" data-day="${d.day}">
                ${d.day}
              </button>
            `).join('')}
          </div>

          <!-- Type Filters -->
          <div class="flex items-center gap-1.5 self-start md:self-auto">
            <span class="text-xs text-outline font-medium mr-1">Filter:</span>
            ${['All', 'Lecture', 'Lab', 'Tutorial'].map(filter => `
              <button class="filter-pill-btn px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${activeFilter === filter ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant'}" data-filter="${filter}">
                ${filter}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Day Classes Schedule Cards List -->
        <div class="space-y-space-md">
          ${filteredClasses.length === 0 ? `
            <div class="bg-surface-container-lowest p-12 text-center rounded-2xl border border-surface-container-high">
              <span class="material-symbols-outlined text-outline text-[40px]">event_busy</span>
              <p class="font-body-md text-sm text-outline mt-2">No ${activeFilter.toLowerCase()} sessions scheduled for ${selectedDay}.</p>
            </div>
          ` : filteredClasses.map((cls, idx) => `
            <div class="bg-surface-container-lowest rounded-2xl p-space-md lg:p-space-lg shadow-sm border ${cls.isCurrent ? 'border-primary ring-2 ring-primary/20 bg-primary-fixed/10' : 'border-surface-container-high'} transition-all flex flex-col md:flex-row md:items-center justify-between gap-space-md">
              <div class="flex items-start gap-space-md">
                <!-- Time Block -->
                <div class="w-16 h-16 rounded-2xl ${cls.isCurrent ? 'bg-primary text-on-primary' : 'bg-secondary-fixed text-on-secondary-fixed'} flex flex-col items-center justify-center flex-shrink-0 shadow-sm">
                  <span class="text-xs font-black uppercase tracking-wider">${cls.time.split(' ')[0]}</span>
                  <span class="text-[10px] font-bold opacity-80">${cls.time.split(' ')[2] || ''}</span>
                </div>
                
                <!-- Class Info -->
                <div class="space-y-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed text-xs font-bold">${cls.code}</span>
                    <span class="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant text-[11px] font-semibold">${cls.type}</span>
                    ${cls.isCurrent ? `
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                        Current Ongoing Session
                      </span>
                    ` : ''}
                  </div>
                  <h3 class="font-headline-md text-lg lg:text-xl font-bold text-on-surface">${cls.name}</h3>
                  <div class="flex items-center gap-4 text-xs text-on-surface-variant flex-wrap pt-0.5">
                    <span class="flex items-center gap-1 font-medium">
                      <span class="material-symbols-outlined text-[16px] text-outline">room</span>
                      ${cls.room}
                    </span>
                    <span class="flex items-center gap-1 font-medium">
                      <span class="material-symbols-outlined text-[16px] text-outline">person</span>
                      ${cls.faculty}
                    </span>
                    <span class="flex items-center gap-1 text-outline">
                      <span class="material-symbols-outlined text-[16px]">schedule</span>
                      ${cls.time}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center gap-2 self-start md:self-center">
                <button class="timetable-route-btn px-3.5 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5" data-room="${cls.room}">
                  <span class="material-symbols-outlined text-[16px] text-primary">navigation</span>
                  <span>View Route</span>
                </button>
                <button class="timetable-ask-btn px-3.5 py-2 bg-primary-container hover:bg-primary text-on-primary-container hover:text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5" data-course="${cls.code}" data-name="${cls.name}">
                  <span class="material-symbols-outlined text-[16px]">auto_awesome</span>
                  <span>Syllabus &amp; Notes</span>
                </button>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Weekly Summary Card -->
        <div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container-high flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center flex-shrink-0">
              <span class="material-symbols-outlined text-[20px]">info</span>
            </div>
            <div>
              <h4 class="font-label-md text-sm font-bold text-on-surface">Official Academic Rules</h4>
              <p class="text-xs text-on-surface-variant">
                ${campusData.academicRules?.length ? `${campusData.academicRules[0].title}: ${campusData.academicRules[0].content}` : 'No academic rule has been published for your current term.'}
              </p>
            </div>
          </div>
          <button class="text-xs font-bold text-primary hover:underline whitespace-nowrap" onclick="window.location.hash='#ai-assistant'; window.dispatchEvent(new CustomEvent('campus:askAi', { detail: { query: 'Where can I submit my medical leave certificate?' } }));">
            Medical Leave Guidelines →
          </button>
        </div>

      </div>
    `;

    // Event attachments
    container.querySelectorAll('.day-tab-btn').forEach(btn => {
      btn.onclick = () => {
        selectedDay = btn.getAttribute('data-day');
        render();
      };
    });

    container.querySelectorAll('.filter-pill-btn').forEach(btn => {
      btn.onclick = () => {
        activeFilter = btn.getAttribute('data-filter');
        render();
      };
    });

    container.querySelectorAll('.timetable-route-btn').forEach(btn => {
      btn.onclick = () => {
        const room = btn.getAttribute('data-room');
        window.location.hash = '#campus-guide';
        showToast(`Route mapped to: ${room}`, 'info');
      };
    });

    container.querySelectorAll('.timetable-ask-btn').forEach(btn => {
      btn.onclick = () => {
        const code = btn.getAttribute('data-course');
        const name = btn.getAttribute('data-name');
        window.location.hash = '#ai-assistant';
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('campus:askAi', { detail: { query: `What topics are covered in ${code} (${name})?` } }));
        }, 50);
      };
    });

    const dlBtn = document.getElementById('downloadTimetableBtn');
    if (dlBtn) {
      dlBtn.onclick = () => {
        const rows = campusData.timetable.flatMap(day => day.classes.map(cls =>
          [day.day, cls.code, cls.name, cls.time, cls.room, cls.faculty]
            .map(v => String(v || '').replaceAll(',', ' '))
            .join(',')
        ));
        if (!rows.length) {
          showToast('No timetable data is available to export.', 'info');
          return;
        }
        const csv = ['Day,Code,Subject,Time,Room,Faculty', ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'campus-timetable.csv';
        a.click();
        URL.revokeObjectURL(url);
        showToast('Timetable exported as CSV.', 'success');
      };
    }

    const askAiBtn = document.getElementById('askAiTimetableBtn');
    if (askAiBtn) {
      askAiBtn.onclick = () => {
        window.location.hash = '#ai-assistant';
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('campus:askAi', { detail: { query: "What is my next class and what topics are being covered according to the syllabus?" } }));
        }, 50);
      };
    }
  }

  render();
}

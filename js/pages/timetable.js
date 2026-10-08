// Timetable Page - Date + Day based academic schedule
import { campusData } from '../data.js';
import { showToast } from '../components/toast.js';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEKDAY_NAMES = DAY_NAMES.slice(1);

function getLocalDateInputValue(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function getDayFromDate(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);
  return Number.isNaN(date.getTime()) ? DAY_NAMES[new Date().getDay()] : DAY_NAMES[date.getDay()];
}

function getDateForDay(day) {
  const today = new Date();
  const dayIndex = DAY_NAMES.indexOf(day);
  const target = new Date(today);
  const diff = dayIndex - today.getDay();
  target.setDate(today.getDate() + diff);
  return getLocalDateInputValue(target);
}

function parseTimeToMinutes(value) {
  const match = String(value || '').trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const modifier = match[3]?.toUpperCase();
  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  return (hours * 60) + minutes;
}

function getClassStatus(cls, selectedDate, selectedDay) {
  const todayValue = getLocalDateInputValue();
  if (selectedDate !== todayValue || selectedDay !== DAY_NAMES[new Date().getDay()]) {
    return 'upcoming';
  }

  const range = String(cls.time || '').split(/\s+-\s+/);
  const start = parseTimeToMinutes(range[0]);
  const end = parseTimeToMinutes(range[1]);
  if (start === null || end === null) return 'upcoming';

  const now = new Date();
  const currentMinutes = (now.getHours() * 60) + now.getMinutes();
  if (currentMinutes >= start && currentMinutes < end) return 'current';
  if (currentMinutes >= end) return 'completed';
  return 'upcoming';
}

export function renderTimetable(container) {
  const today = new Date();
  let selectedDate = getLocalDateInputValue(today);
  let selectedDay = DAY_NAMES[today.getDay()];
  let activeFilter = 'All';

  function getSelectedClasses() {
    const dayData = campusData.timetable.find(d => String(d.day).toLowerCase() === selectedDay.toLowerCase());
    return dayData?.classes || [];
  }

  function render() {
    const allClasses = getSelectedClasses();
    const classesWithStatus = allClasses.map(cls => ({
      ...cls,
      displayStatus: getClassStatus(cls, selectedDate, selectedDay)
    }));
    const filteredClasses = classesWithStatus.filter(cls => {
      if (activeFilter === 'All') return true;
      return String(cls.type || '').toLowerCase().includes(activeFilter.toLowerCase());
    });

    const todayDay = DAY_NAMES[new Date().getDay()];
    const todayDate = getLocalDateInputValue();
    const isToday = selectedDate === todayDate;
    const currentClass = isToday
      ? classesWithStatus.find(cls => cls.displayStatus === 'current')
      : null;
    const nextClass = isToday
      ? classesWithStatus.find(cls => cls.displayStatus === 'upcoming')
      : null;

    const totalWeekClasses = campusData.timetable.reduce((sum, day) => sum + (day.classes?.length || 0), 0);

    container.innerHTML = `
      <div class="max-w-[1720px] mx-auto py-space-sm space-y-space-md animate-fade-in">

        <!-- Header -->
        <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md bg-surface-container-lowest p-space-md lg:p-space-lg rounded-2xl shadow-sm border border-surface-container-high">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="material-symbols-outlined text-primary text-[28px]">calendar_month</span>
              <div>
                <h1 class="font-headline-md text-xl lg:text-2xl font-bold text-on-surface">Timetable</h1>
                <p class="text-xs text-on-surface-variant mt-0.5">View your class schedule for any day. Select a date or day to switch.</p>
              </div>
              <span class="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-semibold">Live schedule</span>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <button id="downloadTimetableBtn" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold rounded-xl transition-colors">
              <span class="material-symbols-outlined text-[18px]">download</span>
              <span>Export</span>
            </button>
            <button id="askAiTimetableBtn" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-on-primary hover:bg-tertiary-container text-xs font-semibold rounded-xl shadow-sm transition-colors">
              <span class="material-symbols-outlined text-[18px]">smart_toy</span>
              <span>Ask AI</span>
            </button>
          </div>
        </div>

        <!-- Controls -->
        <div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container-high">
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_1.15fr_auto] gap-3 items-end">
            <label class="block">
              <span class="flex items-center gap-1.5 text-xs font-bold text-on-surface mb-1.5">
                <span class="material-symbols-outlined text-[18px] text-primary">event</span>
                Select Date
              </span>
              <div class="relative">
                <input id="timetableDatePicker"
                  type="date"
                  value="${selectedDate}"
                  class="w-full h-11 px-3 pr-10 bg-surface-container-low border border-surface-container-high rounded-xl text-sm font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"/>
              </div>
            </label>

            <label class="block">
              <span class="flex items-center gap-1.5 text-xs font-bold text-on-surface mb-1.5">
                <span class="material-symbols-outlined text-[18px] text-primary">today</span>
                Select Day
              </span>
              <div class="relative">
                <select id="timetableDaySelect"
                  class="w-full h-11 px-3 pr-10 bg-surface-container-low border border-surface-container-high rounded-xl text-sm font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none">
                  ${WEEKDAY_NAMES.map(day => `<option value="${day}" ${day === selectedDay ? 'selected' : ''}>${day}${day === todayDay ? ' • Today' : ''}</option>`).join('')}
                </select>
                <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-outline pointer-events-none">expand_more</span>
              </div>
            </label>

            <button id="todayTimetableBtn"
              class="h-11 inline-flex items-center justify-center gap-1.5 px-4 bg-secondary-container text-on-secondary-container hover:bg-primary hover:text-on-primary text-xs font-bold rounded-xl transition-colors whitespace-nowrap">
              <span class="material-symbols-outlined text-[18px]">today</span>
              Today
            </button>
          </div>

          <div class="mt-3 flex items-center gap-2 flex-wrap">
            <span class="text-xs text-outline font-medium mr-1">Filter:</span>
            ${['All', 'Lecture', 'Lab', 'Tutorial'].map(filter => `
              <button class="filter-pill-btn px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${activeFilter === filter ? 'bg-primary text-on-primary' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'}" data-filter="${filter}">
                ${filter}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Main timetable + side panel -->
        <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-space-md">

          <!-- Selected day schedule -->
          <section class="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container-high overflow-hidden">
            <div class="p-space-md lg:p-space-lg bg-gradient-to-r from-primary-fixed/40 via-surface-container-lowest to-secondary-fixed/30 border-b border-surface-container-high">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-sm">
                    <span class="material-symbols-outlined text-[24px]">calendar_month</span>
                  </div>
                  <div>
                    <div class="flex items-center gap-2 flex-wrap">
                      <h2 class="text-lg lg:text-xl font-bold text-on-surface">${selectedDay}, ${formatDisplayDate(selectedDate)}</h2>
                      ${isToday ? '<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">Today</span>' : ''}
                    </div>
                    <p class="text-xs text-on-surface-variant mt-0.5">Class Schedule</p>
                  </div>
                </div>
                <span class="px-3 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-bold">${filteredClasses.length} ${filteredClasses.length === 1 ? 'Class' : 'Classes'}</span>
              </div>
            </div>

            ${filteredClasses.length === 0 ? `
              <div class="p-12 text-center">
                <span class="material-symbols-outlined text-outline text-[44px]">event_busy</span>
                <p class="font-body-md text-sm text-on-surface font-semibold mt-3">No classes scheduled</p>
                <p class="text-xs text-on-surface-variant mt-1">There is no ${activeFilter.toLowerCase() !== 'all' ? activeFilter.toLowerCase() + ' ' : ''}timetable available for ${selectedDay}, ${formatDisplayDate(selectedDate)}.</p>
              </div>
            ` : `
              <div class="overflow-x-auto">
                <div class="min-w-[720px]">
                  <div class="grid grid-cols-[150px_minmax(0,1fr)_115px_130px] gap-0 px-space-md lg:px-space-lg py-3 bg-surface-container-low border-b border-surface-container-high text-[11px] font-bold uppercase tracking-wide text-outline">
                    <div>Time</div>
                    <div>Subject</div>
                    <div>Room</div>
                    <div>Status</div>
                  </div>
                  ${filteredClasses.map(cls => `
                    <div class="grid grid-cols-[150px_minmax(0,1fr)_115px_130px] items-center px-space-md lg:px-space-lg py-4 border-b last:border-b-0 border-surface-container-high ${cls.displayStatus === 'current' ? 'bg-primary-fixed/30' : ''}">
                      <div>
                        <div class="text-sm font-bold text-on-surface">${cls.time}</div>
                        <div class="text-[11px] text-on-surface-variant mt-0.5">${cls.displayStatus === 'current' ? 'Happening now' : cls.displayStatus === 'completed' ? 'Completed' : 'Upcoming'}</div>
                      </div>

                      <div class="flex items-center gap-3 pr-3">
                        <div class="w-9 h-9 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center text-[11px] font-black flex-shrink-0">
                          ${cls.code || '—'}
                        </div>
                        <div class="min-w-0">
                          <div class="text-sm font-bold text-on-surface truncate">${cls.name}</div>
                          <div class="flex items-center gap-2 flex-wrap mt-0.5 text-[11px] text-on-surface-variant">
                            <span>${cls.type || 'Lecture'}</span>
                            <span>•</span>
                            <span>${cls.faculty || 'Faculty not assigned'}</span>
                          </div>
                        </div>
                      </div>

                      <div class="text-xs font-semibold text-on-surface-variant">${cls.room || 'Room not assigned'}</div>

                      <div>
                        ${cls.displayStatus === 'current'
                          ? '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold"><span class="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>Current</span>'
                          : cls.displayStatus === 'completed'
                            ? '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-bold"><span class="material-symbols-outlined text-[14px]">check_circle</span>Completed</span>'
                            : '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold"><span class="material-symbols-outlined text-[14px]">schedule</span>Upcoming</span>'}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `}
          </section>

          <!-- Right side -->
          <aside class="space-y-space-md">
            <section class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-primary/20">
              <div class="flex items-center gap-2 mb-3">
                <span class="material-symbols-outlined text-primary text-[22px]">calendar_today</span>
                <h3 class="text-base font-bold text-on-surface">${isToday ? 'Today at a Glance' : 'Selected Day'}</h3>
              </div>

              <div class="rounded-xl bg-surface-container-low p-3 mb-3">
                <div class="text-[11px] text-outline font-semibold uppercase tracking-wide">${isToday ? 'Today' : 'Viewing'}</div>
                <div class="text-sm font-bold text-on-surface mt-1">${selectedDay}, ${formatDisplayDate(selectedDate)}</div>
                <div class="text-xs text-on-surface-variant mt-1">${allClasses.length} scheduled ${allClasses.length === 1 ? 'class' : 'classes'}</div>
              </div>

              <div class="space-y-2.5">
                ${currentClass ? `
                  <div>
                    <div class="flex items-center gap-2 text-xs font-bold text-on-surface mb-1.5">
                      <span class="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                      Current Class
                    </div>
                    <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div class="text-sm font-bold text-on-surface">${currentClass.name}</div>
                      <div class="text-xs text-on-surface-variant mt-1">${currentClass.time}</div>
                      <div class="text-[11px] text-on-surface-variant mt-1">${currentClass.room}</div>
                    </div>
                  </div>
                ` : ''}

                ${nextClass ? `
                  <div>
                    <div class="flex items-center gap-2 text-xs font-bold text-on-surface mb-1.5">
                      <span class="w-2 h-2 rounded-full bg-blue-600"></span>
                      Next Class
                    </div>
                    <div class="p-3 rounded-xl bg-blue-50 border border-blue-200">
                      <div class="text-sm font-bold text-on-surface">${nextClass.name}</div>
                      <div class="text-xs text-on-surface-variant mt-1">${nextClass.time}</div>
                      <div class="text-[11px] text-on-surface-variant mt-1">${nextClass.room}</div>
                    </div>
                  </div>
                ` : isToday ? `
                  <div class="p-3 rounded-xl bg-surface-container-low text-center">
                    <span class="material-symbols-outlined text-outline text-[22px]">event_available</span>
                    <p class="text-xs font-semibold text-on-surface mt-1">No more classes today</p>
                  </div>
                ` : ''}
              </div>
            </section>

            <section class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container-high">
              <div class="flex items-center gap-2 mb-3">
                <span class="material-symbols-outlined text-primary text-[22px]">bolt</span>
                <h3 class="text-base font-bold text-on-surface">Quick Actions</h3>
              </div>
              <div class="space-y-2">
                <button id="todayTimetableSideBtn" class="w-full inline-flex items-center justify-between gap-2 px-3 py-2.5 border border-surface-container-high rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-colors">
                  <span class="inline-flex items-center gap-2"><span class="material-symbols-outlined text-[18px] text-primary">today</span>View Today</span>
                  <span class="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
                </button>
                <button id="refreshTimetableBtn" class="w-full inline-flex items-center justify-between gap-2 px-3 py-2.5 border border-surface-container-high rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-colors">
                  <span class="inline-flex items-center gap-2"><span class="material-symbols-outlined text-[18px] text-primary">refresh</span>Refresh</span>
                  <span class="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
                </button>
              </div>
            </section>

            <section class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container-high">
              <div class="flex items-center gap-2 mb-2">
                <span class="material-symbols-outlined text-primary text-[20px]">info</span>
                <h3 class="text-sm font-bold text-on-surface">Schedule Summary</h3>
              </div>
              <p class="text-xs text-on-surface-variant leading-5">
                ${totalWeekClasses} timetable ${totalWeekClasses === 1 ? 'entry is' : 'entries are'} available this week. Your selected day updates automatically when you choose a new date.
              </p>
            </section>
          </aside>
        </div>

        <!-- Official Rules -->
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

    // Date picker -> automatically update day dropdown and timetable.
    const datePicker = container.querySelector('#timetableDatePicker');
    if (datePicker) {
      datePicker.onchange = () => {
        selectedDate = datePicker.value || getLocalDateInputValue();
        selectedDay = getDayFromDate(selectedDate);
        render();
      };
    }

    // Day dropdown -> move the date to this week's selected day and refresh.
    const daySelect = container.querySelector('#timetableDaySelect');
    if (daySelect) {
      daySelect.onchange = () => {
        selectedDay = daySelect.value;
        selectedDate = getDateForDay(selectedDay);
        render();
      };
    }

    const todayBtn = container.querySelector('#todayTimetableBtn');
    if (todayBtn) {
      todayBtn.onclick = () => {
        selectedDate = getLocalDateInputValue();
        selectedDay = DAY_NAMES[new Date().getDay()];
        activeFilter = 'All';
        render();
      };
    }

    const todaySideBtn = container.querySelector('#todayTimetableSideBtn');
    if (todaySideBtn) {
      todaySideBtn.onclick = () => {
        selectedDate = getLocalDateInputValue();
        selectedDay = DAY_NAMES[new Date().getDay()];
        render();
      };
    }

    const refreshBtn = container.querySelector('#refreshTimetableBtn');
    if (refreshBtn) {
      refreshBtn.onclick = () => {
        render();
        showToast('Timetable refreshed.', 'success');
      };
    }

    container.querySelectorAll('.filter-pill-btn').forEach(btn => {
      btn.onclick = () => {
        activeFilter = btn.getAttribute('data-filter') || 'All';
        render();
      };
    });

    const dlBtn = container.querySelector('#downloadTimetableBtn');
    if (dlBtn) {
      dlBtn.onclick = () => {
        const rows = campusData.timetable.flatMap(day => (day.classes || []).map(cls =>
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

    const askAiBtn = container.querySelector('#askAiTimetableBtn');
    if (askAiBtn) {
      askAiBtn.onclick = () => {
        window.location.hash = '#ai-assistant';
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('campus:askAi', { detail: { query: `What are my classes on ${selectedDay}, ${formatDisplayDate(selectedDate)}?` } }));
        }, 50);
      };
    }

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
  }

  render();
}

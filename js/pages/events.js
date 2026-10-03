// Events Page - Campus Happenings, Hackathons & Tech Talks
import { campusData } from '../data.js';
import { showToast } from '../components/toast.js';

export function renderEvents(container) {
  let activeFilter = "All";
  // Track registered events in session
  if (!window._registeredEvents) {
    window._registeredEvents = new Set(["E-1"]); // Default registered to HackCampus
  }

  function render() {
    const filteredEvents = campusData.events.filter(e => {
      if (activeFilter === "All") return true;
      if (activeFilter === "Registered") return window._registeredEvents.has(e.id);
      return (e.category || e.type || 'Campus Event').toLowerCase() === activeFilter.toLowerCase();
    });

    container.innerHTML = `
      <div class="max-w-[1720px] mx-auto py-space-sm space-y-space-md animate-fade-in">
        
        <!-- Header Strip -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-surface-container-high">
          <div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[24px]">event</span>
              <h1 class="font-headline-md text-xl lg:text-2xl font-bold text-on-surface">Campus Events &amp; Opportunities</h1>
              <span class="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-semibold">Live academic calendar</span>
            </div>
            <p class="text-xs text-on-surface-variant mt-1">
              Hackathons, research keynotes, cultural festivals, and career recruitment drives.
            </p>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <button id="submitEventBtn" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold rounded-xl transition-colors">
              <span class="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Propose Club Event</span>
            </button>
          </div>
        </div>

        <!-- Filter Pills -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1">
          ${['All', 'Registered', 'Hackathon', 'Tech Talk', 'Cultural', 'Career'].map(f => `
            <button class="event-filter-btn px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeFilter === f ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant'}" data-filter="${f}">
              ${f === 'Registered' ? '⭐ My Registrations' : f}
            </button>
          `).join('')}
        </div>

        <!-- Events Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          ${filteredEvents.length === 0 ? `
            <div class="col-span-full bg-surface-container-lowest p-12 text-center rounded-2xl border border-surface-container-high">
              <span class="material-symbols-outlined text-outline text-[40px]">event_busy</span>
              <p class="font-body-md text-sm text-outline mt-2">No events found in this category.</p>
            </div>
          ` : filteredEvents.map(event => {
            const isReg = window._registeredEvents.has(event.id);
            return `
              <div class="bg-surface-container-lowest rounded-2xl p-space-md lg:p-space-lg shadow-sm border border-surface-container-high flex flex-col justify-between gap-space-md hover:shadow-md transition-all">
                <div class="space-y-3">
                  <div class="flex items-center justify-between gap-2 flex-wrap">
                    <span class="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold">${event.category || event.type || 'Campus Event'}</span>
                    <span class="text-xs text-outline font-semibold flex items-center gap-1">
                      <span class="material-symbols-outlined text-[16px]">group</span>
                      ${Number(event.attendees || 0) + (isReg ? 1 : 0)} Attending
                    </span>
                  </div>

                  <div>
                    <h3 class="font-headline-md text-lg font-bold text-on-surface leading-snug">${event.title}</h3>
                    <p class="text-xs text-on-surface-variant mt-2 leading-relaxed">
                      ${event.description}
                    </p>
                  </div>

                  <div class="p-3 bg-surface-container-low rounded-xl space-y-1.5 text-xs">
                    <div class="flex items-center gap-2 text-on-surface font-semibold">
                      <span class="material-symbols-outlined text-[16px] text-primary">calendar_today</span>
                      <span>${event.date || 'Date not assigned'} • ${event.time || 'Time not assigned'}</span>
                    </div>
                    <div class="flex items-center gap-2 text-on-surface-variant">
                      <span class="material-symbols-outlined text-[16px] text-outline">location_on</span>
                      <span>${event.venue}</span>
                    </div>
                  </div>

                  <div class="flex flex-wrap gap-1.5 pt-1">
                    ${(event.tags || []).map(t => `
                      <span class="text-[10px] font-semibold bg-surface-container px-2 py-0.5 rounded-md text-outline">#${t}</span>
                    `).join('')}
                  </div>
                </div>

                <div class="flex items-center justify-between pt-3 border-t border-surface-container">
                  <button class="event-cal-btn text-xs font-semibold text-outline hover:text-on-surface flex items-center gap-1" data-id="${event.id}">
                    <span class="material-symbols-outlined text-[16px]">event_repeat</span>
                    <span>Sync to Calendar</span>
                  </button>
                  <button class="event-reg-btn px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${isReg ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-primary text-on-primary hover:bg-tertiary-container'}" data-id="${event.id}">
                    <span class="material-symbols-outlined text-[16px]">${isReg ? 'check_circle' : 'how_to_reg'}</span>
                    <span>${isReg ? 'Registered' : 'Register Now'}</span>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

      </div>
    `;

    // Filter button clicks
    container.querySelectorAll('.event-filter-btn').forEach(btn => {
      btn.onclick = () => {
        activeFilter = btn.getAttribute('data-filter');
        render();
      };
    });

    // Register button clicks
    container.querySelectorAll('.event-reg-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const ev = campusData.events.find(e => e.id === id);
        if (window._registeredEvents.has(id)) {
          window._registeredEvents.delete(id);
          showToast(`Canceled registration for: ${ev.title}`, 'info');
        } else {
          window._registeredEvents.add(id);
          showToast(`🎉 Successfully registered for: ${ev.title}! Pass added to SIS.`, 'success');
        }
        render();
      };
    });

    // Calendar sync
    container.querySelectorAll('.event-cal-btn').forEach(btn => {
      btn.onclick = () => {
        showToast("Event exported to campus Google Calendar!", "success");
      };
    });

    const submitEventBtn = document.getElementById('submitEventBtn');
    if (submitEventBtn) {
      submitEventBtn.onclick = () => {
        showToast("Student Club event proposal form opened.", "info");
      };
    }
  }

  render();
}

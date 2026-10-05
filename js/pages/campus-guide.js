// Campus Guide & Venues Directory Page
import { campusData } from '../data.js';
import { showToast } from '../components/toast.js';

export function renderCampusGuide(container) {
  let activeTab = 'Venues';
  let searchQuery = '';

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));

  function venueText(v) {
    return [
      v.name,
      v.category,
      v.description,
      v.building,
      v.floor,
      v.room,
      v.openingHours,
      v.contactInfo
    ].filter(Boolean).join(' ').toLowerCase();
  }

  function render() {
    const venues = Array.isArray(campusData.venues) ? campusData.venues : [];
    const shuttles = Array.isArray(campusData.shuttles) ? campusData.shuttles : [];
    const q = searchQuery.trim().toLowerCase();
    const filteredVenues = q ? venues.filter(v => venueText(v).includes(q)) : venues;

    container.innerHTML = `
      <div class="max-w-[1720px] mx-auto py-space-sm space-y-space-md animate-fade-in">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-surface-container-high">
          <div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[24px]">map</span>
              <h1 class="font-headline-md text-xl lg:text-2xl font-bold text-on-surface">Campus Guide &amp; Venues</h1>
              <span class="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-semibold">Live Supabase data</span>
            </div>
            <p class="text-xs text-on-surface-variant mt-1">
              Find campus locations using the official records connected to your account.
            </p>
          </div>
          <button id="askAiGuideBtn" type="button" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-on-primary text-xs font-semibold rounded-xl shadow-sm">
            <span class="material-symbols-outlined text-[18px]">smart_toy</span>
            <span>Ask AI For Directions</span>
          </button>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <button class="guide-tab-btn px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'Venues' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'}" data-tab="Venues">
              Campus Locations
            </button>
            <button class="guide-tab-btn px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'Shuttle' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'}" data-tab="Shuttle">
              Shuttle
            </button>
          </div>

          ${activeTab === 'Venues' ? `
            <div class="relative min-w-[240px]">
              <span class="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">search</span>
              <input id="venueSearchInput" class="w-full pl-9 pr-4 py-2 bg-surface-container-lowest border border-surface-container-high rounded-xl text-xs text-on-surface outline-none focus:border-primary" placeholder="Search buildings, labs, rooms..." value="${esc(searchQuery)}" type="text"/>
            </div>
          ` : ''}
        </div>

        ${activeTab === 'Venues' ? `
          ${filteredVenues.length ? `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
              ${filteredVenues.map(v => `
                <article class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container-high flex flex-col justify-between gap-3">
                  <div class="space-y-2">
                    <div class="flex items-center justify-between gap-2">
                      <span class="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold">${esc(v.category || 'Campus Location')}</span>
                      ${v.building || v.room ? '<span class="text-[10px] font-semibold text-outline">' + esc([v.building, v.room].filter(Boolean).join(' • ')) + '</span>' : ''}
                    </div>
                    <h3 class="font-headline-md text-base font-bold text-on-surface">${esc(v.name || 'Campus Location')}</h3>
                    <p class="text-xs text-on-surface-variant">${esc(v.description || 'Official campus location record.')}</p>
                    ${(v.floor || v.room) ? `
                      <div class="p-2.5 bg-surface-container-low rounded-xl text-xs">
                        ${v.floor ? '<div><span class="font-semibold">Floor:</span> ' + esc(v.floor) + '</div>' : ''}
                        ${v.room ? '<div class="mt-1"><span class="font-semibold">Room:</span> ' + esc(v.room) + '</div>' : ''}
                      </div>
                    ` : ''}
                    ${v.openingHours ? '<div class="text-[11px] text-on-surface-variant"><span class="font-semibold">Hours:</span> ' + esc(v.openingHours) + '</div>' : ''}
                    ${v.contactInfo ? '<div class="text-[11px] text-on-surface-variant"><span class="font-semibold">Contact:</span> ' + esc(v.contactInfo) + '</div>' : ''}
                  </div>
                  <div class="pt-2 border-t border-surface-container flex items-center justify-between gap-2">
                    <button class="venue-route-btn px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold rounded-lg flex items-center gap-1" data-venue="${esc(v.name)}">
                      <span class="material-symbols-outlined text-[15px] text-primary">navigation</span>
                      <span>Show Route</span>
                    </button>
                    <button class="venue-ask-ai-btn text-primary font-bold text-xs hover:underline" data-venue="${esc(v.name)}">Ask AI</button>
                  </div>
                </article>
              `).join('')}
            </div>
          ` : `
            <div class="bg-surface-container-lowest p-12 text-center rounded-2xl border border-surface-container-high">
              <span class="material-symbols-outlined text-outline text-[40px]">travel_explore</span>
              <p class="font-body-md text-sm text-outline mt-2">${q ? 'No campus locations match your search.' : 'No campus locations are connected yet.'}</p>
              <p class="text-xs text-on-surface-variant mt-1">Add official records to <code>campus_locations</code> in Supabase.</p>
            </div>
          `}
        ` : `
          <div class="bg-surface-container-lowest rounded-2xl p-space-md lg:p-space-lg shadow-sm border border-surface-container-high">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[22px]">directions_bus</span>
              <h3 class="font-headline-md text-lg font-bold text-on-surface">Campus Shuttle Schedule</h3>
            </div>
            <p class="text-xs text-on-surface-variant mt-2">This section only displays shuttle records when they are connected to the live campus data source.</p>
            ${shuttles.length ? `
              <div class="overflow-x-auto mt-4">
                <table class="w-full text-left text-xs">
                  <thead><tr class="border-b border-surface-container-high text-outline uppercase text-[11px]">
                    <th class="py-3 px-3">Route</th><th class="py-3 px-3">Path</th><th class="py-3 px-3">Frequency</th><th class="py-3 px-3">Status</th>
                  </tr></thead>
                  <tbody class="divide-y divide-surface-container">
                    ${shuttles.map(s => '<tr><td class="py-3 px-3 font-bold">' + esc(s.route) + '</td><td class="py-3 px-3">' + esc(s.path) + '</td><td class="py-3 px-3">' + esc(s.interval) + '</td><td class="py-3 px-3">' + esc(s.status) + '</td></tr>').join('')}
                  </tbody>
                </table>
              </div>
            ` : `
              <div class="mt-4 p-4 rounded-xl bg-surface-container-low border border-surface-container-high text-sm text-on-surface-variant">
                No shuttle schedule is connected yet. The app will not show invented routes, GPS positions, or ETAs.
              </div>
            `}
          </div>
        `}
      </div>
    `;

    container.querySelectorAll('.guide-tab-btn').forEach(btn => {
      btn.onclick = () => { activeTab = btn.getAttribute('data-tab') || 'Venues'; render(); };
    });

    const searchInput = document.getElementById('venueSearchInput');
    if (searchInput) {
      searchInput.oninput = (e) => {
        searchQuery = e.target.value || '';
        render();
        const next = document.getElementById('venueSearchInput');
        next?.focus();
        next?.setSelectionRange(searchQuery.length, searchQuery.length);
      };
    }

    container.querySelectorAll('.venue-route-btn').forEach(btn => {
      btn.onclick = () => {
        const venue = btn.getAttribute('data-venue') || 'campus location';
        showToast('Navigation requested for ' + venue + '. Connect map routing data to show a real route.', 'info');
      };
    });

    container.querySelectorAll('.venue-ask-ai-btn').forEach(btn => {
      btn.onclick = () => {
        const venue = btn.getAttribute('data-venue') || 'campus location';
        window.location.hash = '#ai-assistant';
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('campus:askAi', {
            detail: { query: 'Where is ' + venue + ' located? Use only connected campus location data.' }
          }));
        }, 50);
      };
    });

    document.getElementById('askAiGuideBtn')?.addEventListener('click', () => {
      window.location.hash = '#ai-assistant';
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('campus:askAi', {
          detail: { query: 'What campus locations are available in my connected campus data? Do not invent locations.' }
        }));
      }, 50);
    });
  }

  render();
}

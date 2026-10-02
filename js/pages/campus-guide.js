// Campus Guide & Venues Directory Page
import { campusData } from '../data.js';
import { showToast } from '../components/toast.js';

export function renderCampusGuide(container) {
  let activeTab = "Venues"; // "Venues" or "Shuttle"
  let searchQuery = "";

  function render() {
    const filteredVenues = campusData.venues.filter(v => 
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.facilities.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    container.innerHTML = `
      <div class="max-w-[1720px] mx-auto py-space-sm space-y-space-md animate-fade-in">
        
        <!-- Header Strip -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-surface-container-high">
          <div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[24px]">map</span>
              <h1 class="font-headline-md text-xl lg:text-2xl font-bold text-on-surface">Campus Guide &amp; Venues</h1>
              <span class="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-semibold">Live Navigation</span>
            </div>
            <p class="text-xs text-on-surface-variant mt-1">
              Find academic buildings, silent study pods, cafeteria menus, and real-time shuttle departures.
            </p>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <button id="askAiGuideBtn" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-on-primary hover:bg-tertiary-container text-xs font-semibold rounded-xl shadow-sm transition-colors">
              <span class="material-symbols-outlined text-[18px]">smart_toy</span>
              <span>Ask AI For Directions</span>
            </button>
          </div>
        </div>

        <!-- Section Switcher & Search Bar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <button class="guide-tab-btn px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'Venues' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'}" data-tab="Venues">
              Campus Buildings &amp; Facilities
            </button>
            <button class="guide-tab-btn px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'Shuttle' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'}" data-tab="Shuttle">
              🚌 Live Shuttle Schedule
            </button>
          </div>

          ${activeTab === 'Venues' ? `
            <div class="relative min-w-[240px]">
              <span class="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">search</span>
              <input id="venueSearchInput" class="w-full pl-9 pr-4 py-2 bg-surface-container-lowest border border-surface-container-high rounded-xl text-xs font-body-sm text-on-surface placeholder:text-outline outline-none focus:border-primary" placeholder="Search buildings, labs, desks..." value="${searchQuery}" type="text"/>
            </div>
          ` : ''}
        </div>

        <!-- Tab 1: Venues Directory -->
        ${activeTab === 'Venues' ? `
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
            ${filteredVenues.length === 0 ? `
              <div class="col-span-full bg-surface-container-lowest p-12 text-center rounded-2xl border border-surface-container-high">
                <span class="material-symbols-outlined text-outline text-[40px]">travel_explore</span>
                <p class="font-body-md text-sm text-outline mt-2">No venues match your search.</p>
              </div>
            ` : filteredVenues.map(venue => `
              <div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container-high flex flex-col justify-between gap-3 hover:shadow-md transition-all">
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed text-[11px] font-bold">${venue.type}</span>
                    <span class="text-[11px] font-semibold text-outline flex items-center gap-1">
                      <span class="w-1.5 h-1.5 rounded-full ${venue.occupancy.includes('High') ? 'bg-error' : venue.occupancy.includes('Moderate') ? 'bg-amber-500' : 'bg-emerald-500'}"></span>
                      ${venue.occupancy}
                    </span>
                  </div>

                  <h3 class="font-headline-md text-base font-bold text-on-surface">${venue.name}</h3>
                  <p class="text-xs text-on-surface-variant flex items-center gap-1">
                    <span class="material-symbols-outlined text-[15px] text-outline">place</span>
                    ${venue.location}
                  </p>

                  <div class="p-2.5 bg-surface-container-low rounded-xl text-xs space-y-1">
                    <div class="flex items-center gap-1.5 text-on-surface font-semibold">
                      <span class="material-symbols-outlined text-[15px] text-primary">schedule</span>
                      <span>${venue.hours}</span>
                    </div>
                    <div class="text-[11px] text-outline">
                      Contact: ${venue.contact}
                    </div>
                  </div>

                  <div>
                    <span class="text-[10px] uppercase font-bold text-outline tracking-wider block mb-1">Key Facilities</span>
                    <div class="flex flex-wrap gap-1">
                      ${venue.facilities.map(f => `
                        <span class="text-[10px] bg-surface-container px-2 py-0.5 rounded-md text-on-surface-variant font-medium">${f}</span>
                      `).join('')}
                    </div>
                  </div>
                </div>

                <div class="pt-2 border-t border-surface-container flex items-center justify-between">
                  <button class="venue-route-btn px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold rounded-lg transition-colors flex items-center gap-1" data-venue="${venue.name}">
                    <span class="material-symbols-outlined text-[15px] text-primary">navigation</span>
                    <span>Show Route</span>
                  </button>
                  <button class="venue-ask-ai-btn text-primary font-bold text-xs hover:underline flex items-center gap-0.5" data-venue="${venue.name}">
                    <span>Ask Hours</span>
                    <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <!-- Tab 2: Shuttle Live Schedule -->
          <div class="space-y-space-md">
            <div class="bg-surface-container-lowest rounded-2xl p-space-md lg:p-space-lg shadow-sm border border-surface-container-high">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary text-[22px]">directions_bus</span>
                  <h3 class="font-headline-md text-lg font-bold text-on-surface">Campus Inter-Zone Shuttle Transit</h3>
                </div>
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span> GPS Live Tracking
                </span>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr class="border-b border-surface-container-high text-outline uppercase font-semibold text-[11px]">
                      <th class="py-3 px-3">Route Name</th>
                      <th class="py-3 px-3">Stops &amp; Path</th>
                      <th class="py-3 px-3">Frequency</th>
                      <th class="py-3 px-3">Status</th>
                      <th class="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-surface-container">
                    ${campusData.shuttles.map(s => `
                      <tr class="hover:bg-surface-container-low transition-colors">
                        <td class="py-3 px-3 font-bold text-on-surface">${s.route}</td>
                        <td class="py-3 px-3 text-on-surface-variant font-medium">${s.path}</td>
                        <td class="py-3 px-3 text-outline font-semibold">${s.interval}</td>
                        <td class="py-3 px-3">
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${s.status.includes('Active') ? 'bg-emerald-100 text-emerald-800' : 'bg-surface-container text-outline'}">
                            ${s.status}
                          </span>
                        </td>
                        <td class="py-3 px-3 text-right">
                          <button class="shuttle-track-btn px-2.5 py-1 bg-surface-container hover:bg-primary hover:text-white rounded-lg font-semibold transition-colors" data-route="${s.route}">
                            Track Bus
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        `}

      </div>
    `;

    // Tab buttons
    container.querySelectorAll('.guide-tab-btn').forEach(btn => {
      btn.onclick = () => {
        activeTab = btn.getAttribute('data-tab');
        render();
      };
    });

    // Search input
    const searchInput = document.getElementById('venueSearchInput');
    if (searchInput) {
      searchInput.oninput = (e) => {
        searchQuery = e.target.value;
        render();
        const newSearch = document.getElementById('venueSearchInput');
        if (newSearch) {
          newSearch.focus();
          newSearch.setSelectionRange(searchQuery.length, searchQuery.length);
        }
      };
    }

    // Route button
    container.querySelectorAll('.venue-route-btn').forEach(btn => {
      btn.onclick = () => {
        const venue = btn.getAttribute('data-venue');
        showToast(`Navigation mode active for: ${venue}`, 'success');
      };
    });

    // Ask AI buttons
    container.querySelectorAll('.venue-ask-ai-btn').forEach(btn => {
      btn.onclick = () => {
        const venue = btn.getAttribute('data-venue');
        window.location.hash = '#ai-assistant';
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('campus:askAi', { detail: { query: `Where is ${venue} located and what are its operating hours?` } }));
        }, 50);
      };
    });

    // Shuttle track button
    container.querySelectorAll('.shuttle-track-btn').forEach(btn => {
      btn.onclick = () => {
        const route = btn.getAttribute('data-route');
        showToast(`Tracking ${route}: Next bus 350m away, ETA 3 minutes.`, 'info');
      };
    });

    const askAiGuideBtn = document.getElementById('askAiGuideBtn');
    if (askAiGuideBtn) {
      askAiGuideBtn.onclick = () => {
        window.location.hash = '#ai-assistant';
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('campus:askAi', { detail: { query: "Where is the nearest open computer lab right now?" } }));
        }, 50);
      };
    }
  }

  render();
}

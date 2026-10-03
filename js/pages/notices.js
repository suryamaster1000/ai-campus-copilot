// Notices Page - Official Campus Bulletins & Circulars
import { campusData } from '../data.js';
import { showToast } from '../components/toast.js';

export function renderNotices(container) {
  let activeCategory = "All";
  let searchQuery = "";

  function render() {
    const filteredNotices = campusData.notices.filter(n => {
      const matchCat = activeCategory === "All" || n.category.toLowerCase() === activeCategory.toLowerCase();
      const matchSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.summary.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (n.author || 'Office of Academic Affairs').toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    const unreadCount = campusData.notices.filter(n => !n.read).length;

    container.innerHTML = `
      <div class="max-w-[1720px] mx-auto py-space-sm space-y-space-md animate-fade-in">
        
        <!-- Header & Action Strip -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-surface-container-high">
          <div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[24px]">campaign</span>
              <h1 class="font-headline-md text-xl lg:text-2xl font-bold text-on-surface">Campus Notices &amp; Bulletins</h1>
              ${unreadCount > 0 ? `<span class="px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container text-xs font-bold">${unreadCount} Unread</span>` : ''}
            </div>
            <p class="text-xs text-on-surface-variant mt-1">
              Authoritative university announcements verified by the Office of Academic Affairs.
            </p>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <button id="markAllReadBtn" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold rounded-xl transition-colors">
              <span class="material-symbols-outlined text-[18px]">done_all</span>
              <span>Mark All Read</span>
            </button>
            <button id="askCopilotNoticesBtn" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-on-primary hover:bg-tertiary-container text-xs font-semibold rounded-xl shadow-sm transition-colors">
              <span class="material-symbols-outlined text-[18px]">auto_awesome</span>
              <span>Ask AI About Notices</span>
            </button>
          </div>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <!-- Category Pills -->
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1">
            ${['All', 'Examinations', 'Academic', 'Facilities', 'Placements'].map(cat => `
              <button class="notice-cat-pill px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant'}" data-cat="${cat}">
                ${cat}
              </button>
            `).join('')}
          </div>

          <!-- Search Input -->
          <div class="relative min-w-[240px]">
            <span class="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">search</span>
            <input id="noticeSearchInput" class="w-full pl-9 pr-4 py-2 bg-surface-container-lowest border border-surface-container-high rounded-xl text-xs font-body-sm text-on-surface placeholder:text-outline outline-none focus:border-primary" placeholder="Search notices, circulars..." value="${searchQuery}" type="text"/>
          </div>
        </div>

        <!-- Notices Cards List -->
        <div class="space-y-space-md">
          ${filteredNotices.length === 0 ? `
            <div class="bg-surface-container-lowest p-12 text-center rounded-2xl border border-surface-container-high">
              <span class="material-symbols-outlined text-outline text-[40px]">inbox</span>
              <p class="font-body-md text-sm text-outline mt-2">No circulars found matching your filter.</p>
            </div>
          ` : filteredNotices.map((n, idx) => `
            <div class="bg-surface-container-lowest rounded-2xl p-space-md lg:p-space-lg shadow-sm border ${n.urgent ? 'border-l-4 border-l-error border-surface-container-high' : 'border-surface-container-high'} transition-all hover:shadow-md flex flex-col justify-between gap-space-md">
              <div class="space-y-2">
                <div class="flex items-center justify-between gap-2 flex-wrap">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded text-[11px] font-bold ${n.badgeClass}">${n.category}</span>
                    ${n.urgent ? '<span class="px-2 py-0.5 rounded bg-error text-white text-[10px] font-extrabold uppercase tracking-wide">URGENT</span>' : ''}
                    ${!n.read ? '<span class="w-2 h-2 rounded-full bg-primary" title="Unread Notice"></span>' : ''}
                  </div>
                  <span class="text-xs text-outline font-medium">${n.date}</span>
                </div>

                <div>
                  <h3 class="font-headline-md text-base lg:text-lg font-bold text-on-surface">${n.title}</h3>
                  <p class="text-xs text-outline font-medium mt-0.5 flex items-center gap-1">
                    <span class="material-symbols-outlined text-[15px]">corporate_fare</span>
                    ${n.author || 'Office of Academic Affairs'}
                  </p>
                </div>

                <p class="font-body-md text-sm text-on-surface-variant leading-relaxed">
                  ${n.summary}
                </p>

                ${n.attachment ? `
                  <div class="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-surface-container-low rounded-xl">
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-lg bg-error-container text-on-error-container flex items-center justify-center flex-shrink-0">
                        <span class="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                      </div>
                      <div>
                        <span class="font-label-sm text-xs font-bold text-on-surface block">${n.attachment}</span>
                        <span class="text-[10px] text-outline">Official PDF document • ${n.fileSize}</span>
                      </div>
                    </div>
                    <button class="download-doc-btn px-3 py-1.5 bg-surface-container-high hover:bg-secondary-container text-on-secondary-container text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 self-start sm:self-center" data-file="${n.attachment}">
                      <span class="material-symbols-outlined text-[16px]">download</span>
                      <span>Download</span>
                    </button>
                  </div>
                ` : ''}
              </div>

              <!-- Bottom Action Bar -->
              <div class="flex items-center justify-between pt-2 border-t border-surface-container text-xs">
                <span class="text-outline">Notice Ref: ${n.id}</span>
                <div class="flex items-center gap-2">
                  <button class="notice-query-ai-btn text-primary font-bold hover:underline flex items-center gap-1" data-query="Explain notice: ${n.title}">
                    <span class="material-symbols-outlined text-[14px]">auto_awesome</span>
                    Ask Copilot to explain
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

      </div>
    `;

    // Category button events
    container.querySelectorAll('.notice-cat-pill').forEach(btn => {
      btn.onclick = () => {
        activeCategory = btn.getAttribute('data-cat');
        render();
      };
    });

    // Search input
    const searchInput = document.getElementById('noticeSearchInput');
    if (searchInput) {
      searchInput.oninput = (e) => {
        searchQuery = e.target.value;
        render();
        // maintain focus
        const newSearch = document.getElementById('noticeSearchInput');
        if (newSearch) {
          newSearch.focus();
          newSearch.setSelectionRange(searchQuery.length, searchQuery.length);
        }
      };
    }

    // Mark all read
    const markAllBtn = document.getElementById('markAllReadBtn');
    if (markAllBtn) {
      markAllBtn.onclick = () => {
        campusData.notices.forEach(n => n.read = true);
        showToast("All notices marked as read", "success");
        render();
      };
    }

    // Ask copilot notices
    const askCopilotBtn = document.getElementById('askCopilotNoticesBtn');
    if (askCopilotBtn) {
      askCopilotBtn.onclick = () => {
        window.location.hash = '#ai-assistant';
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('campus:askAi', { detail: { query: "When is the next midterm exam?" } }));
        }, 50);
      };
    }

    // Download document buttons
    container.querySelectorAll('.download-doc-btn').forEach(btn => {
      btn.onclick = () => {
        const file = btn.getAttribute('data-file');
        showToast(`Downloading: ${file}`, 'success');
      };
    });

    // Query AI for notice
    container.querySelectorAll('.notice-query-ai-btn').forEach(btn => {
      btn.onclick = () => {
        const q = btn.getAttribute('data-query');
        window.location.hash = '#ai-assistant';
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('campus:askAi', { detail: { query: q } }));
        }, 50);
      };
    });
  }

  render();
}

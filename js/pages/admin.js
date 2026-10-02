// Admin Panel Page - RAG Index Management & Campus System Telemetry
import { campusData } from '../data.js';
import { showToast } from '../components/toast.js';

export function renderAdminPanel(container) {
  let isIndexing = false;

  function render() {
    container.innerHTML = `
      <div class="max-w-[1720px] mx-auto py-space-sm space-y-space-md animate-fade-in">
        
        <!-- Header Strip -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-surface-container-high">
          <div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[24px]">admin_panel_settings</span>
              <h1 class="font-headline-md text-xl lg:text-2xl font-bold text-on-surface">Campus Administration &amp; Copilot RAG</h1>
              <span class="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-semibold">Registrar &amp; IT Ops</span>
            </div>
            <p class="text-xs text-on-surface-variant mt-1">
              Verify vector index status, monitor student query volume, and publish official academic bulletins.
            </p>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <button id="triggerSyncRagBtn" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-on-primary hover:bg-tertiary-container text-xs font-semibold rounded-xl shadow-sm transition-colors ${isIndexing ? 'opacity-70 cursor-not-allowed' : ''}">
              <span class="material-symbols-outlined text-[18px] ${isIndexing ? 'animate-spin' : ''}">sync</span>
              <span>${isIndexing ? 'Syncing Embeddings...' : 'Sync Vector Database'}</span>
            </button>
          </div>
        </div>

        <!-- System Telemetry Row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          <div class="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-surface-container-high">
            <span class="text-xs font-bold text-outline uppercase tracking-wider block">Daily Queries Handled</span>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="font-headline-lg text-3xl font-extrabold text-on-surface">1,420</span>
              <span class="text-xs text-emerald-600 font-bold">+18% this week</span>
            </div>
            <span class="text-[11px] text-on-surface-variant mt-1 block">Peak traffic: 09:30 AM – 11:00 AM</span>
          </div>

          <div class="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-surface-container-high">
            <span class="text-xs font-bold text-outline uppercase tracking-wider block">Grounding Accuracy</span>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="font-headline-lg text-3xl font-extrabold text-emerald-600">99.4%</span>
              <span class="text-xs text-outline font-semibold">SIS Verified</span>
            </div>
            <span class="text-[11px] text-on-surface-variant mt-1 block">Zero unauthorized hallucinations</span>
          </div>

          <div class="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-surface-container-high">
            <span class="text-xs font-bold text-outline uppercase tracking-wider block">Average Query Latency</span>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="font-headline-lg text-3xl font-extrabold text-on-surface">320ms</span>
              <span class="text-xs text-outline font-medium">p95: 580ms</span>
            </div>
            <span class="text-[11px] text-on-surface-variant mt-1 block">Internal campus edge cluster</span>
          </div>

          <div class="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-surface-container-high">
            <span class="text-xs font-bold text-outline uppercase tracking-wider block">Active RAG Documents</span>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="font-headline-lg text-3xl font-extrabold text-primary">148</span>
              <span class="text-xs text-outline font-medium">8,410 chunks</span>
            </div>
            <span class="text-[11px] text-on-surface-variant mt-1 block">768-dim embeddings synchronized</span>
          </div>
        </div>

        <!-- Main Admin Workspace Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
          
          <!-- Left 2 Cols: Vector Knowledge Base Table -->
          <div class="lg:col-span-2 bg-surface-container-lowest rounded-2xl p-space-md lg:p-space-lg shadow-sm border border-surface-container-high space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-headline-md text-base font-bold text-on-surface">Authoritative Campus Knowledge Base</h3>
                <p class="text-xs text-on-surface-variant">Documents indexed in PostgreSQL pgvector / semantic search layer.</p>
              </div>
              <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Index Healthy
              </span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="border-b border-surface-container-high text-outline uppercase font-semibold text-[11px]">
                    <th class="py-2.5 px-3">Document Title</th>
                    <th class="py-2.5 px-3">Authority / Dept</th>
                    <th class="py-2.5 px-3">Chunks</th>
                    <th class="py-2.5 px-3">Last Synced</th>
                    <th class="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-surface-container">
                  <tr class="hover:bg-surface-container-low transition-colors">
                    <td class="py-3 px-3 font-semibold text-on-surface flex items-center gap-2">
                      <span class="material-symbols-outlined text-[18px] text-error">picture_as_pdf</span>
                      CS204_Syllabus_Fall2024.pdf
                    </td>
                    <td class="py-3 px-3 text-on-surface-variant">Dept. of Computer Science</td>
                    <td class="py-3 px-3 text-outline">142 chunks</td>
                    <td class="py-3 px-3 text-outline">Today, 04:12 AM</td>
                    <td class="py-3 px-3 text-right">
                      <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">100% Synced</span>
                    </td>
                  </tr>

                  <tr class="hover:bg-surface-container-low transition-colors">
                    <td class="py-3 px-3 font-semibold text-on-surface flex items-center gap-2">
                      <span class="material-symbols-outlined text-[18px] text-error">picture_as_pdf</span>
                      Student_Handbook_2024-25.pdf
                    </td>
                    <td class="py-3 px-3 text-on-surface-variant">Dean of Academic Affairs</td>
                    <td class="py-3 px-3 text-outline">518 chunks</td>
                    <td class="py-3 px-3 text-outline">Yesterday</td>
                    <td class="py-3 px-3 text-right">
                      <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">100% Synced</span>
                    </td>
                  </tr>

                  <tr class="hover:bg-surface-container-low transition-colors">
                    <td class="py-3 px-3 font-semibold text-on-surface flex items-center gap-2">
                      <span class="material-symbols-outlined text-[18px] text-error">picture_as_pdf</span>
                      Midterm_DateSheet_Fall2024.pdf
                    </td>
                    <td class="py-3 px-3 text-on-surface-variant">Controller of Examinations</td>
                    <td class="py-3 px-3 text-outline">88 chunks</td>
                    <td class="py-3 px-3 text-outline">2 days ago</td>
                    <td class="py-3 px-3 text-right">
                      <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">100% Synced</span>
                    </td>
                  </tr>

                  <tr class="hover:bg-surface-container-low transition-colors">
                    <td class="py-3 px-3 font-semibold text-on-surface flex items-center gap-2">
                      <span class="material-symbols-outlined text-[18px] text-error">picture_as_pdf</span>
                      Hostel_Rules_ByLaws.pdf
                    </td>
                    <td class="py-3 px-3 text-on-surface-variant">Chief Warden Office</td>
                    <td class="py-3 px-3 text-outline">64 chunks</td>
                    <td class="py-3 px-3 text-outline">Sep 28, 2024</td>
                    <td class="py-3 px-3 text-right">
                      <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">100% Synced</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Right 1 Col: Quick Notice Broadcaster -->
          <div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container-high space-y-3">
            <h3 class="font-headline-md font-bold text-sm text-on-surface uppercase tracking-wider text-outline">Broadcast Notice Circular</h3>
            <p class="text-xs text-on-surface-variant">
              Post an official announcement instantly to student dashboards and Copilot reasoning index.
            </p>

            <form id="broadcastNoticeForm" class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-on-surface mb-1">Circular Title</label>
                <input id="bcTitle" required class="w-full px-3 py-2 bg-surface-container-low rounded-xl text-xs text-on-surface outline-none border border-surface-container-high focus:border-primary" placeholder="e.g. Schedule for Lab Makeup Exam" type="text"/>
              </div>
              <div>
                <label class="block text-xs font-semibold text-on-surface mb-1">Target Department</label>
                <select id="bcDept" class="w-full px-3 py-2 bg-surface-container-low rounded-xl text-xs text-on-surface outline-none border border-surface-container-high focus:border-primary">
                  <option value="All Students">All Enrolled Students</option>
                  <option value="Computer Science" selected>B.Tech Computer Science</option>
                  <option value="Hostel Residents">Hostel Residents</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-on-surface mb-1">Announcement Body</label>
                <textarea id="bcBody" required rows="3" class="w-full px-3 py-2 bg-surface-container-low rounded-xl text-xs text-on-surface outline-none border border-surface-container-high focus:border-primary resize-none" placeholder="Enter verified university circular notice text..."></textarea>
              </div>
              <button type="submit" class="w-full py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-tertiary-container transition-colors shadow-sm">
                Publish &amp; Broadcast Notice
              </button>
            </form>
          </div>

        </div>

      </div>
    `;

    // Sync button
    const syncBtn = document.getElementById('triggerSyncRagBtn');
    if (syncBtn) {
      syncBtn.onclick = () => {
        if (isIndexing) return;
        isIndexing = true;
        render();
        setTimeout(() => {
          isIndexing = false;
          showToast("✅ Vector index refreshed! 8,410 chunks synced with registrar databases.", "success");
          render();
        }, 1500);
      };
    }

    // Broadcast notice form
    const bcForm = document.getElementById('broadcastNoticeForm');
    if (bcForm) {
      bcForm.onsubmit = (e) => {
        e.preventDefault();
        const title = document.getElementById('bcTitle').value;
        const body = document.getElementById('bcBody').value;
        campusData.notices.unshift({
          id: 'N-' + Date.now(),
          title,
          category: 'Academic',
          badgeClass: 'bg-primary-fixed text-on-primary-fixed',
          date: 'Just Now',
          author: 'Office of Academic Affairs',
          urgent: false,
          summary: body,
          attachment: null,
          read: false
        });
        showToast("📢 Notice broadcast published successfully!", "success");
        bcForm.reset();
      };
    }
  }

  render();
}

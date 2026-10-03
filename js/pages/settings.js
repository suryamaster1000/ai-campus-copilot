// Settings Page - Student Profile & AI Copilot Preferences
import { campusData } from '../data.js';
import { showToast } from '../components/toast.js';

export function renderSettings(container) {
  container.innerHTML = `
    <div class="max-w-[1720px] mx-auto py-space-sm space-y-space-md animate-fade-in">
      
      <!-- Header Strip -->
      <div class="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-surface-container-high">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[24px]">settings</span>
          <h1 class="font-headline-md text-xl lg:text-2xl font-bold text-on-surface">Settings &amp; Preferences</h1>
        </div>
        <p class="text-xs text-on-surface-variant mt-1">
          Manage your student profile, RAG grounding options, and academic notification alerts.
        </p>
      </div>

      <!-- Settings Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
        
        <!-- Left 2 Cols: Profile & AI Settings -->
        <div class="lg:col-span-2 space-y-space-md">
          
          <!-- Profile Card -->
          <div class="bg-surface-container-lowest rounded-2xl p-space-md lg:p-space-lg shadow-sm border border-surface-container-high space-y-4">
            <div class="flex items-center gap-3 border-b border-surface-container pb-3">
              <img src="assets/avatars/student.svg" alt="Sophia Chen" class="w-16 h-16 rounded-full object-cover ring-2 ring-primary"/>
              <div>
                <h2 class="font-headline-md text-lg font-bold text-on-surface">${campusData.student.name}</h2>
                <p class="text-xs text-on-surface-variant">${campusData.student.program} • ${campusData.student.id}</p>
                <span class="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-0.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Enrolled &amp; Active (Fall 2024)
                </span>
              </div>
            </div>

            <form id="profileForm" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-on-surface mb-1">Full Name</label>
                <input id="profNameInput" class="w-full px-3 py-2 bg-surface-container-low rounded-xl text-xs text-on-surface outline-none border border-surface-container-high focus:border-primary" value="${campusData.student.name}" type="text"/>
              </div>
              <div>
                <label class="block text-xs font-semibold text-on-surface mb-1">Student ID #</label>
                <input class="w-full px-3 py-2 bg-surface-container rounded-xl text-xs text-outline outline-none cursor-not-allowed" value="${campusData.student.id}" disabled type="text"/>
              </div>
              <div>
                <label class="block text-xs font-semibold text-on-surface mb-1">Campus Email</label>
                <input class="w-full px-3 py-2 bg-surface-container rounded-xl text-xs text-outline outline-none cursor-not-allowed" value="${campusData.student.email}" disabled type="text"/>
              </div>
              <div>
                <label class="block text-xs font-semibold text-on-surface mb-1">Hostel Room</label>
                <input id="profHostelInput" class="w-full px-3 py-2 bg-surface-container-low rounded-xl text-xs text-on-surface outline-none border border-surface-container-high focus:border-primary" value="${campusData.student.hostel}" type="text"/>
              </div>
              <div>
                <label class="block text-xs font-semibold text-on-surface mb-1">Academic Advisor</label>
                <input class="w-full px-3 py-2 bg-surface-container rounded-xl text-xs text-outline outline-none cursor-not-allowed" value="${campusData.student.academicAdvisor}" disabled type="text"/>
              </div>
              <div>
                <label class="block text-xs font-semibold text-on-surface mb-1">Current Term</label>
                <input class="w-full px-3 py-2 bg-surface-container rounded-xl text-xs text-outline outline-none cursor-not-allowed" value="${campusData.student.term}" disabled type="text"/>
              </div>
              <div>
                <label class="block text-xs font-semibold text-on-surface mb-1">Section</label>
                <input class="w-full px-3 py-2 bg-surface-container rounded-xl text-xs text-outline outline-none cursor-not-allowed" value="${campusData.student.section || "Not assigned"}" disabled type="text"/>
              </div>

              <div class="sm:col-span-2 pt-2">
                <button type="submit" class="px-4 py-2 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-tertiary-container transition-colors shadow-sm">
                  Save Profile Details
                </button>
              </div>
            </form>
          </div>

          <!-- AI Copilot RAG Grounding Preferences -->
          <div class="bg-surface-container-lowest rounded-2xl p-space-md lg:p-space-lg shadow-sm border border-surface-container-high space-y-3">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[22px]">tune</span>
              <h3 class="font-headline-md text-base font-bold text-on-surface">AI Copilot Reasoning &amp; Grounding Sources</h3>
            </div>
            <p class="text-xs text-on-surface-variant">
              Select which official campus data repositories the AI is authorized to search during your queries:
            </p>

            <div class="space-y-2 pt-1">
              <label class="flex items-center justify-between p-3 bg-surface-container-low rounded-xl cursor-pointer hover:bg-surface-container transition-colors">
                <div class="space-y-0.5">
                  <span class="text-xs font-bold text-on-surface block">Fall 2024 Course Syllabi &amp; Lecture Slidedecks</span>
                  <span class="text-[11px] text-outline">Enables deep topic breakdown &amp; Big-O exam hints</span>
                </div>
                <input type="checkbox" checked class="h-4 w-4 rounded text-primary focus:ring-primary"/>
              </label>

              <label class="flex items-center justify-between p-3 bg-surface-container-low rounded-xl cursor-pointer hover:bg-surface-container transition-colors">
                <div class="space-y-0.5">
                  <span class="text-xs font-bold text-on-surface block">Registrar Attendance &amp; SIS Live Feeds</span>
                  <span class="text-[11px] text-outline">Real-time attendance ratio audits and hall ticket status</span>
                </div>
                <input type="checkbox" checked class="h-4 w-4 rounded text-primary focus:ring-primary"/>
              </label>

              <label class="flex items-center justify-between p-3 bg-surface-container-low rounded-xl cursor-pointer hover:bg-surface-container transition-colors">
                <div class="space-y-0.5">
                  <span class="text-xs font-bold text-on-surface block">Undergraduate Student Handbook &amp; Leave By-Laws</span>
                  <span class="text-[11px] text-outline">Medical certificate 3-day rule, hostel curfew &amp; grading rubric</span>
                </div>
                <input type="checkbox" checked class="h-4 w-4 rounded text-primary focus:ring-primary"/>
              </label>
            </div>
          </div>

        </div>

        <!-- Right 1 Col: Alerts & System Info -->
        <div class="space-y-space-md">
          
          <!-- Notifications Configuration -->
          <div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container-high space-y-3">
            <h3 class="font-headline-md font-bold text-sm text-on-surface uppercase tracking-wider text-outline">Alerts &amp; Notifications</h3>
            
            <div class="space-y-2.5">
              <label class="flex items-center justify-between text-xs cursor-pointer">
                <span class="font-semibold text-on-surface">Class Reminders (15m before)</span>
                <input type="checkbox" checked class="h-4 w-4 rounded text-primary focus:ring-primary"/>
              </label>

              <label class="flex items-center justify-between text-xs cursor-pointer">
                <span class="font-semibold text-on-surface">Attendance Warning (&lt; 75%)</span>
                <input type="checkbox" checked class="h-4 w-4 rounded text-primary focus:ring-primary"/>
              </label>

              <label class="flex items-center justify-between text-xs cursor-pointer">
                <span class="font-semibold text-on-surface">Urgent Exam Circular Alerts</span>
                <input type="checkbox" checked class="h-4 w-4 rounded text-primary focus:ring-primary"/>
              </label>

              <label class="flex items-center justify-between text-xs cursor-pointer">
                <span class="font-semibold text-on-surface">Shuttle Bus Arrival Pings</span>
                <input type="checkbox" class="h-4 w-4 rounded text-primary focus:ring-primary"/>
              </label>
            </div>
          </div>

          <!-- Privacy & Cache -->
          <div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container-high space-y-3">
            <h3 class="font-headline-md font-bold text-sm text-on-surface uppercase tracking-wider text-outline">Session Management</h3>
            <p class="text-xs text-on-surface-variant">
              Campus Copilot keeps all conversation history encrypted locally in your browser memory.
            </p>
            <button id="clearChatCacheBtn" class="w-full py-2 bg-surface-container hover:bg-error-container hover:text-on-error-container text-on-surface text-xs font-bold rounded-xl transition-colors">
              Clear Conversation History
            </button>
          </div>

          <!-- Build Info -->
          <div class="p-3 bg-surface-container-low rounded-2xl text-xs space-y-1 text-on-surface-variant">
            <div class="font-bold text-on-surface">AI Campus Copilot v2.4 (Frontend Prototype)</div>
            <div>Built for University Engineering &amp; Academic Systems</div>
            <div class="text-[11px] text-outline">Client SHA: #ac34-fall2024</div>
          </div>

        </div>

      </div>

    </div>
  `;

  // Profile save
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.onsubmit = (e) => {
      e.preventDefault();
      const newName = document.getElementById('profNameInput').value;
      const newHostel = document.getElementById('profHostelInput').value;
      campusData.student.name = newName;
      campusData.student.hostel = newHostel;
      showToast("Profile settings updated successfully!", "success");
    };
  }

  // Clear chat cache
  const clearBtn = document.getElementById('clearChatCacheBtn');
  if (clearBtn) {
    clearBtn.onclick = () => {
      if (confirm("Are you sure you want to clear your local query cache?")) {
        showToast("Conversation memory cleared.", "info");
      }
    };
  }
}

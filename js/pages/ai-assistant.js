// AI Assistant Page - Matches Stitch UI 100% with Full Interactivity
import { campusData } from '../data.js';
import { showToast } from '../components/toast.js';

export function renderAiAssistant(container, initialQuery = null) {
  container.innerHTML = `
    <div class="flex flex-col w-full h-[calc(100vh-4rem)] max-w-[1720px] mx-auto overflow-hidden">
      <div class="flex flex-1 w-full h-full min-h-0 gap-space-md py-space-sm">
        
        <!-- LEFT CHAT HISTORY & CONVERSATION SIDEBAR -->
        <aside class="hidden md:flex flex-col w-72 lg:w-80 flex-shrink-0 bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden select-none">
          <!-- Top Action Bar -->
          <div class="p-space-md pb-space-sm flex flex-col gap-space-sm">
            <button class="w-full flex items-center justify-between px-space-md py-space-sm h-11 bg-primary text-on-primary rounded-xl font-label-lg text-label-lg shadow-sm hover:bg-tertiary-container transition-all group" id="newChatBtn" type="button">
              <div class="flex items-center gap-space-sm">
                <span class="material-symbols-outlined text-[20px] transition-transform group-hover:rotate-90 duration-300">add</span>
                <span>New Query / Chat</span>
              </div>
              <span class="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-white/20 text-on-primary text-[10px]">⌘N</span>
            </button>
            <!-- Dynamic Context Filter / Search -->
            <div class="relative w-full">
              <span class="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">search</span>
              <input id="historySearchInput" class="w-full pl-9 pr-space-md py-1.5 bg-surface-container-low text-on-surface rounded-lg font-body-sm text-body-sm placeholder:text-outline outline-none" placeholder="Search conversations..." type="text"/>
            </div>
          </div>
          
          <!-- Scrollable History List -->
          <div class="flex-1 overflow-y-auto px-space-sm space-y-space-md text-on-surface-variant custom-scrollbar" id="conversationHistoryList">
            <!-- Pinned / Starred Threads -->
            <div>
              <div class="flex items-center justify-between px-space-sm py-1">
                <div class="flex items-center gap-1.5 text-on-secondary-container font-label-sm text-label-sm uppercase tracking-wider">
                  <span class="material-symbols-outlined text-[15px] text-tertiary">keep</span>
                  <span>Pinned Queries</span>
                </div>
                <span class="text-[11px] font-label-sm text-outline">2</span>
              </div>
              <div class="space-y-0.5 mt-1">
                <button class="history-thread-btn w-full flex items-center gap-2.5 px-space-sm py-2 rounded-lg hover:bg-surface-container text-left transition-colors group" data-topic="discrete-math" type="button">
                  <span class="material-symbols-outlined text-[18px] text-primary group-hover:scale-110 transition-transform">functions</span>
                  <span class="font-body-sm text-body-sm text-on-surface truncate flex-1 font-medium">Exam prep - Discrete Math</span>
                  <span class="material-symbols-outlined text-[16px] text-outline opacity-0 group-hover:opacity-100 transition-opacity">more_horiz</span>
                </button>
                <button class="history-thread-btn w-full flex items-center gap-2.5 px-space-sm py-2 rounded-lg hover:bg-surface-container text-left transition-colors group" data-topic="wifi" type="button">
                  <span class="material-symbols-outlined text-[18px] text-secondary group-hover:scale-110 transition-transform">wifi</span>
                  <span class="font-body-sm text-body-sm text-on-surface truncate flex-1 font-medium">Hostel Wi-Fi setup inquiry</span>
                  <span class="material-symbols-outlined text-[16px] text-outline opacity-0 group-hover:opacity-100 transition-opacity">more_horiz</span>
                </button>
              </div>
            </div>

            <!-- Group: Today -->
            <div>
              <span class="block px-space-sm text-outline font-label-sm text-label-sm uppercase tracking-wider mb-1">Today</span>
              <div class="space-y-0.5">
                <button class="history-thread-btn w-full flex items-center gap-2.5 px-space-sm py-2 rounded-lg bg-surface-container text-left cursor-pointer" data-topic="current-session" type="button">
                  <span class="material-symbols-outlined text-[18px] text-primary">chat_bubble</span>
                  <span class="font-body-sm text-body-sm text-on-surface truncate flex-1 font-semibold">Today's classes schedule</span>
                  <span class="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                </button>
                <button class="history-thread-btn w-full flex items-center gap-2.5 px-space-sm py-2 rounded-lg hover:bg-surface-container text-left transition-colors text-on-surface-variant hover:text-on-surface" data-topic="btree" type="button">
                  <span class="material-symbols-outlined text-[18px] text-outline">description</span>
                  <span class="font-body-sm text-body-sm truncate flex-1">Explanation of B-Tree indexing</span>
                </button>
              </div>
            </div>

            <!-- Group: Yesterday -->
            <div>
              <span class="block px-space-sm text-outline font-label-sm text-label-sm uppercase tracking-wider mb-1">Yesterday</span>
              <div class="space-y-0.5">
                <button class="history-thread-btn w-full flex items-center gap-2.5 px-space-sm py-2 rounded-lg hover:bg-surface-container text-left transition-colors text-on-surface-variant hover:text-on-surface" data-topic="library" type="button">
                  <span class="material-symbols-outlined text-[18px] text-outline">local_library</span>
                  <span class="font-body-sm text-body-sm truncate flex-1">Library overdue book policy</span>
                </button>
                <button class="history-thread-btn w-full flex items-center gap-2.5 px-space-sm py-2 rounded-lg hover:bg-surface-container text-left transition-colors text-on-surface-variant hover:text-on-surface" data-topic="tuition" type="button">
                  <span class="material-symbols-outlined text-[18px] text-outline">account_balance_wallet</span>
                  <span class="font-body-sm text-body-sm truncate flex-1">Semester 5 tuition receipt download</span>
                </button>
              </div>
            </div>

            <!-- Group: Previous 7 Days -->
            <div>
              <span class="block px-space-sm text-outline font-label-sm text-label-sm uppercase tracking-wider mb-1">Previous 7 Days</span>
              <div class="space-y-0.5">
                <button class="history-thread-btn w-full flex items-center gap-2.5 px-space-sm py-2 rounded-lg hover:bg-surface-container text-left transition-colors text-on-surface-variant hover:text-on-surface" data-topic="midterm" type="button">
                  <span class="material-symbols-outlined text-[18px] text-outline">schedule</span>
                  <span class="font-body-sm text-body-sm truncate flex-1">Midterm timetable CS dept</span>
                </button>
                <button class="history-thread-btn w-full flex items-center gap-2.5 px-space-sm py-2 rounded-lg hover:bg-surface-container text-left transition-colors text-on-surface-variant hover:text-on-surface" data-topic="badminton" type="button">
                  <span class="material-symbols-outlined text-[18px] text-outline">sports_tennis</span>
                  <span class="font-body-sm text-body-sm truncate flex-1">Badminton court booking rules</span>
                </button>
                <button class="history-thread-btn w-full flex items-center gap-2.5 px-space-sm py-2 rounded-lg hover:bg-surface-container text-left transition-colors text-on-surface-variant hover:text-on-surface" data-topic="shuttle" type="button">
                  <span class="material-symbols-outlined text-[18px] text-outline">directions_bus</span>
                  <span class="font-body-sm text-body-sm truncate flex-1">Campus shuttle Route 4 timings</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Grounding & Sync Indicator Footprint -->
          <div class="p-space-sm m-space-sm bg-surface-container-low rounded-xl">
            <div class="flex items-start gap-space-sm">
              <span class="material-symbols-outlined text-primary text-[20px] mt-0.5">sync_saved_locally</span>
              <div class="flex flex-col min-w-0">
                <span class="font-label-md text-label-md font-semibold text-on-surface flex items-center gap-1">
                  Live Campus Context
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </span>
                <span class="font-body-sm text-[11px] leading-tight text-on-surface-variant mt-0.5">
                  Synced with Fall 2024 Syllabus, SIS Feed &amp; Student Handbook
                </span>
                <div class="mt-2 flex items-center justify-between text-[11px] text-outline font-label-sm">
                  <span>Sync status: 100%</span>
                  <span class="text-primary font-medium hover:underline cursor-pointer" id="inspectRagBtn">Inspect RAG</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- CENTRAL CHAT & PROMPT WORKSPACE -->
        <section class="flex flex-1 flex-col h-full min-w-0 bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
          <!-- Copilot Workspace Header -->
          <div class="px-space-md lg:px-space-lg py-space-sm flex items-center justify-between bg-surface-container-low shadow-sm z-10">
            <div class="flex items-center gap-space-sm min-w-0">
              <div class="w-9 h-9 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0 shadow-sm">
                <span class="material-symbols-outlined text-[22px]">smart_toy</span>
              </div>
              <div class="flex flex-col min-w-0">
                <div class="flex items-center gap-space-xs flex-wrap">
                  <h1 class="font-headline-md text-headline-md font-bold text-on-surface truncate">AI Campus Copilot</h1>
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-[11px] font-semibold">
                    <span class="material-symbols-outlined text-[13px] text-primary material-symbols-filled">verified</span>
                    Official Campus Model v2.4
                  </span>
                </div>
                <span class="font-body-sm text-body-sm text-on-surface-variant text-[12px] truncate">
                  Grounded in Verified College Documents &amp; Academic Registrar APIs
                </span>
              </div>
            </div>
            <!-- Workspace Actions -->
            <div class="flex items-center gap-space-xs">
              <button id="exportNotesBtn" class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high font-label-md text-label-md text-on-surface transition-colors" title="Export this study session" type="button">
                <span class="material-symbols-outlined text-[18px]">ios_share</span>
                <span>Export Notes</span>
              </button>
              <button id="copilotSettingsBtn" class="p-2 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors" title="Copilot settings" type="button">
                <span class="material-symbols-outlined text-[20px]">tune</span>
              </button>
            </div>
          </div>

          <!-- Conversation Stream -->
          <div class="flex-1 overflow-y-auto px-space-md lg:px-space-xl py-space-lg space-y-space-lg scroll-smooth custom-scrollbar" id="chatStream">
            <!-- Academic Advisory Banner / Session Anchor -->
            <div class="max-w-3xl mx-auto flex items-center justify-center">
              <div class="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-low rounded-full text-on-surface-variant font-label-sm text-label-sm shadow-sm">
                <span class="material-symbols-outlined text-[16px] text-tertiary">history_edu</span>
                <span>Academic Session: CS Semester 4 • Fall 2024 • Timetable &amp; Syllabus Active</span>
              </div>
            </div>

            <!-- Student Message 1 -->
            <div class="flex items-start justify-end gap-space-sm max-w-3xl mx-auto">
              <div class="flex flex-col items-end max-w-[85%] sm:max-w-[75%]">
                <div class="bg-primary text-on-primary px-space-md py-space-sm rounded-2xl rounded-tr-none shadow-sm">
                  <p class="font-body-md text-body-md leading-relaxed">
                    What is my next class and what topics are being covered according to the syllabus?
                  </p>
                </div>
                <span class="font-label-sm text-[11px] text-outline mt-1 pr-1">09:42 AM • Sophia Chen</span>
              </div>
              <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-0.5 ring-2 ring-primary-container shadow-sm">
                <img class="w-full h-full object-cover" alt="Sophia Chen" src="assets/avatars/student.svg"/>
              </div>
            </div>

            <!-- AI Response 1 -->
            <div class="flex items-start gap-space-sm max-w-3xl mx-auto">
              <div class="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <span class="material-symbols-outlined text-[18px]">auto_awesome</span>
              </div>
              <div class="flex flex-col flex-1 min-w-0">
                <div class="bg-surface-container-low text-on-surface rounded-2xl rounded-tl-none p-space-md space-y-space-md shadow-sm">
                  <!-- Primary Schedule Snapshot Block -->
                  <div class="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                    <div class="flex items-start gap-space-sm">
                      <div class="w-12 h-12 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex flex-col items-center justify-center flex-shrink-0">
                        <span class="font-label-sm text-[11px] uppercase tracking-wide font-bold">10:15</span>
                        <span class="font-label-sm text-[10px] text-on-secondary-fixed-variant">AM</span>
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                          <span class="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-label-sm text-[11px] font-bold">CS-204</span>
                          <span class="font-headline-md text-headline-md font-bold text-on-surface">Data Structures &amp; Algorithms</span>
                        </div>
                        <p class="font-body-sm text-body-sm text-on-surface-variant mt-1 flex items-center gap-2 flex-wrap">
                          <span class="inline-flex items-center gap-1">
                            <span class="material-symbols-outlined text-[16px] text-outline">room</span> Room 302, Turing Hall
                          </span>
                          <span class="inline-flex items-center gap-1">
                            <span class="material-symbols-outlined text-[16px] text-outline">person</span> Prof. Dr. Alan Vance
                          </span>
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center gap-2 self-start md:self-center">
                      <button class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-lg font-label-md text-label-md transition-colors route-btn" data-room="Room 302, Turing Hall" type="button">
                        <span class="material-symbols-outlined text-[16px] text-primary">navigation</span>
                        <span>Route</span>
                      </button>
                    </div>
                  </div>

                  <!-- Syllabus Breakdown -->
                  <div class="space-y-1.5">
                    <span class="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-secondary flex items-center gap-1">
                      <span class="material-symbols-outlined text-[16px]">menu_book</span>
                      Syllabus Context (Week 7 Module)
                    </span>
                    <p class="font-body-md text-body-md leading-relaxed text-on-surface">
                      According to your Week 7 course schedule, today's lecture begins the advanced balanced search tree module. You will be covering:
                    </p>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      <div class="p-2.5 rounded-lg bg-surface-container-lowest">
                        <div class="font-label-sm text-[11px] text-outline font-semibold">TOPIC 01</div>
                        <div class="font-label-md text-label-md font-semibold text-on-surface mt-0.5">AVL Tree Rotations</div>
                        <div class="text-[12px] text-on-surface-variant font-body-sm mt-0.5">Single (LL, RR) &amp; Double (LR, RL) balance mechanics</div>
                      </div>
                      <div class="p-2.5 rounded-lg bg-surface-container-lowest">
                        <div class="font-label-sm text-[11px] text-outline font-semibold">TOPIC 02</div>
                        <div class="font-label-md text-label-md font-semibold text-on-surface mt-0.5">Balance Factor Calcs</div>
                        <div class="text-[12px] text-on-surface-variant font-body-sm mt-0.5">Height recalculation criteria: {-1, 0, +1} invariant</div>
                      </div>
                      <div class="p-2.5 rounded-lg bg-surface-container-lowest">
                        <div class="font-label-sm text-[11px] text-outline font-semibold">TOPIC 03</div>
                        <div class="font-label-md text-label-md font-semibold text-on-surface mt-0.5">Insertion Complexity</div>
                        <div class="text-[12px] text-on-surface-variant font-body-sm mt-0.5">Logarithmic bounds verification &amp; memory footprint</div>
                      </div>
                    </div>
                  </div>

                  <!-- Source Citation Card -->
                  <div class="pt-2">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-surface-container-lowest rounded-xl shadow-sm">
                      <div class="flex items-center gap-2 min-w-0">
                        <div class="w-7 h-7 rounded bg-error-container text-on-error-container flex items-center justify-center flex-shrink-0">
                          <span class="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                        </div>
                        <div class="flex flex-col min-w-0">
                          <span class="font-label-sm text-label-sm font-semibold text-on-surface truncate">CS204_Syllabus_Fall2024.pdf</span>
                          <span class="text-[11px] text-on-surface-variant">Page 4, Section 3.2 • Registrar Schedule Feed API #2411</span>
                        </div>
                      </div>
                      <button class="inspect-doc-btn inline-flex items-center gap-1 px-2.5 py-1 bg-surface-container-high hover:bg-secondary-container text-on-secondary-container rounded-md font-label-sm text-label-sm transition-colors self-start sm:self-center" data-doc="CS204_Syllabus_Fall2024.pdf" type="button">
                        <span class="material-symbols-outlined text-[15px]">visibility</span>
                        <span>Inspect Document</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Reaction & Timestamp -->
                <div class="flex items-center justify-between mt-1 px-1">
                  <span class="font-label-sm text-[11px] text-outline">09:42 AM • AI Copilot</span>
                  <div class="flex items-center gap-1 text-outline">
                    <button class="copy-btn p-1 hover:text-on-surface rounded hover:bg-surface-container transition-colors" title="Copy text" type="button">
                      <span class="material-symbols-outlined text-[16px]">content_copy</span>
                    </button>
                    <button class="feedback-btn p-1 hover:text-on-surface rounded hover:bg-surface-container transition-colors" title="Helpful response" type="button">
                      <span class="material-symbols-outlined text-[16px]">thumb_up</span>
                    </button>
                    <button class="feedback-btn p-1 hover:text-on-surface rounded hover:bg-surface-container transition-colors" title="Not helpful" type="button">
                      <span class="material-symbols-outlined text-[16px]">thumb_down</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Student Message 2 -->
            <div class="flex items-start justify-end gap-space-sm max-w-3xl mx-auto">
              <div class="flex flex-col items-end max-w-[85%] sm:max-w-[75%]">
                <div class="bg-primary text-on-primary px-space-md py-space-sm rounded-2xl rounded-tr-none shadow-sm">
                  <p class="font-body-md text-body-md leading-relaxed">
                    Where can I submit my medical leave certificate?
                  </p>
                </div>
                <span class="font-label-sm text-[11px] text-outline mt-1 pr-1">09:45 AM • Sophia Chen</span>
              </div>
              <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-0.5 ring-2 ring-primary-container shadow-sm">
                <img class="w-full h-full object-cover" alt="Sophia Chen" src="assets/avatars/student.svg"/>
              </div>
            </div>

            <!-- AI Response 2 -->
            <div class="flex items-start gap-space-sm max-w-3xl mx-auto">
              <div class="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <span class="material-symbols-outlined text-[18px]">auto_awesome</span>
              </div>
              <div class="flex flex-col flex-1 min-w-0">
                <div class="bg-surface-container-low text-on-surface rounded-2xl rounded-tl-none p-space-md space-y-space-md shadow-sm">
                  <div class="space-y-2">
                    <p class="font-body-md text-body-md leading-relaxed text-on-surface">
                      Medical certificates must be submitted through one of two official university channels within <span class="font-bold text-on-surface underline decoration-primary decoration-2 underline-offset-2">3 working days</span> of returning to campus:
                    </p>
                    
                    <!-- Dual Submission Pathways -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <!-- Option A: Digital -->
                      <div class="p-3 bg-surface-container-lowest rounded-xl flex flex-col justify-between">
                        <div>
                          <div class="flex items-center gap-1.5 text-primary font-label-md text-label-md font-bold">
                            <span class="material-symbols-outlined text-[18px]">language</span>
                            Option 1: Digital Upload (Recommended)
                          </div>
                          <p class="font-body-sm text-body-sm text-on-surface-variant mt-1.5 leading-normal">
                            Submit via the <strong>Student Affairs Portal</strong>. Upload scanned hospital doctor stamp and admission slip in PDF format (&lt;10MB).
                          </p>
                        </div>
                        <div class="pt-3">
                          <button class="portal-link-btn inline-flex items-center gap-1 font-label-sm text-label-sm text-primary font-bold hover:underline" type="button">
                            <span>Open Student Portal</span>
                            <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
                          </button>
                        </div>
                      </div>
                      
                      <!-- Option B: Physical -->
                      <div class="p-3 bg-surface-container-lowest rounded-xl flex flex-col justify-between">
                        <div>
                          <div class="flex items-center gap-1.5 text-secondary font-label-md text-label-md font-bold">
                            <span class="material-symbols-outlined text-[18px]">apartment</span>
                            Option 2: Physical Submission
                          </div>
                          <p class="font-body-sm text-body-sm text-on-surface-variant mt-1.5 leading-normal">
                            <strong>Admin Block A, Room 104</strong> (Counter 3)<br/>
                            Operating Hours: Monday – Friday<br/>
                            <strong>10:00 AM – 4:00 PM</strong>
                          </p>
                        </div>
                        <div class="pt-3">
                          <span class="inline-flex items-center gap-1 text-[11px] font-label-sm text-outline">
                            <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Counter currently open
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Source Citation Card 2 -->
                  <div class="pt-1">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-surface-container-lowest rounded-xl shadow-sm">
                      <div class="flex items-center gap-2 min-w-0">
                        <div class="w-7 h-7 rounded bg-primary-fixed text-on-primary-fixed flex items-center justify-center flex-shrink-0">
                          <span class="material-symbols-outlined text-[16px]">menu_book</span>
                        </div>
                        <div class="flex flex-col min-w-0">
                          <span class="font-label-sm text-label-sm font-semibold text-on-surface truncate">Student Handbook 2024–25</span>
                          <span class="text-[11px] text-on-surface-variant">Section 8.4: Attendance Regulations &amp; Medical Leaves</span>
                        </div>
                      </div>
                      <button class="inspect-doc-btn inline-flex items-center gap-1 px-2.5 py-1 bg-surface-container-high hover:bg-secondary-container text-on-secondary-container rounded-md font-label-sm text-label-sm transition-colors self-start sm:self-center" data-doc="Student Handbook 2024–25" type="button">
                        <span class="material-symbols-outlined text-[15px]">open_in_new</span>
                        <span>Read Policy</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Reaction & Timestamp -->
                <div class="flex items-center justify-between mt-1 px-1">
                  <span class="font-label-sm text-[11px] text-outline">09:45 AM • AI Copilot</span>
                  <div class="flex items-center gap-1 text-outline">
                    <button class="copy-btn p-1 hover:text-on-surface rounded hover:bg-surface-container transition-colors" title="Copy text" type="button">
                      <span class="material-symbols-outlined text-[16px]">content_copy</span>
                    </button>
                    <button class="feedback-btn p-1 hover:text-on-surface rounded hover:bg-surface-container transition-colors" title="Helpful" type="button">
                      <span class="material-symbols-outlined text-[16px]">thumb_up</span>
                    </button>
                    <button class="feedback-btn p-1 hover:text-on-surface rounded hover:bg-surface-container transition-colors" title="Not helpful" type="button">
                      <span class="material-symbols-outlined text-[16px]">thumb_down</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Contextual Follow-up Chips -->
            <div class="max-w-3xl mx-auto pt-space-xs" id="quickChipsContainer">
              <div class="flex items-center gap-1.5 mb-2 text-outline font-label-sm text-label-sm">
                <span class="material-symbols-outlined text-[16px] text-primary">assistant_navigation</span>
                <span>Suggested follow-up queries</span>
              </div>
              <div class="flex flex-wrap gap-2">
                <button class="query-chip px-3 py-1.5 rounded-full bg-surface-container hover:bg-secondary-container hover:text-on-secondary-container text-on-surface-variant font-label-md text-label-md transition-all flex items-center gap-1.5 text-left" data-query="What is my attendance percentage in CS-204?" type="button">
                  <span>What is my attendance percentage in CS-204?</span>
                  <span class="material-symbols-outlined text-[14px]">arrow_outward</span>
                </button>
                <button class="query-chip px-3 py-1.5 rounded-full bg-surface-container hover:bg-secondary-container hover:text-on-secondary-container text-on-surface-variant font-label-md text-label-md transition-all flex items-center gap-1.5 text-left" data-query="When is the next midterm exam?" type="button">
                  <span>When is the next midterm exam?</span>
                  <span class="material-symbols-outlined text-[14px]">arrow_outward</span>
                </button>
                <button class="query-chip px-3 py-1.5 rounded-full bg-surface-container hover:bg-secondary-container hover:text-on-secondary-container text-on-surface-variant font-label-md text-label-md transition-all flex items-center gap-1.5 text-left" data-query="Where is the nearest open computer lab right now?" type="button">
                  <span>Where is the nearest open computer lab right now?</span>
                  <span class="material-symbols-outlined text-[14px]">arrow_outward</span>
                </button>
                <button class="query-chip px-3 py-1.5 rounded-full bg-surface-container hover:bg-secondary-container hover:text-on-secondary-container text-on-surface-variant font-label-md text-label-md transition-all flex items-center gap-1.5 text-left" data-query="Summarize lecture notes for AVL Trees" type="button">
                  <span>Summarize lecture notes for AVL Trees</span>
                  <span class="material-symbols-outlined text-[14px]">arrow_outward</span>
                </button>
              </div>
            </div>
          </div>

          <!-- BOTTOM COMPOSER & GROUNDING FOOTER -->
          <div class="px-space-md lg:px-space-xl pb-space-sm pt-space-xs bg-surface-container-lowest">
            <div class="max-w-3xl mx-auto">
              <!-- Attachment Preview Strip -->
              <div class="hidden items-center gap-2 mb-2 p-2 bg-surface-container-low rounded-lg" id="attachmentStrip">
                <span class="material-symbols-outlined text-primary text-[18px]">attachment</span>
                <span class="font-label-sm text-label-sm text-on-surface truncate flex-1" id="attachmentName">Lecture_Slide_Week7.pdf</span>
                <button id="clearAttachBtn" class="text-outline hover:text-error" type="button">
                  <span class="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>

              <!-- Prompt Pill Container -->
              <form class="relative flex items-center bg-surface-container-low rounded-2xl p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:bg-surface-container-lowest transition-all" id="chatForm">
                <!-- Attachment action -->
                <label class="cursor-pointer p-2 rounded-xl text-outline hover:text-primary hover:bg-surface-container transition-colors flex items-center justify-center" title="Upload lecture notes or assignment for AI explanation">
                  <span class="material-symbols-outlined text-[22px]">attach_file</span>
                  <input id="fileInput" class="hidden" type="file"/>
                </label>
                <!-- Text Query Field -->
                <input autocomplete="off" class="w-full bg-transparent px-space-sm py-2 font-body-md text-body-md text-on-surface placeholder:text-outline outline-none" id="promptInput" placeholder="Ask anything about your timetable, notices, syllabus, or campus venues..." type="text"/>
                <!-- Voice query toggle -->
                <button class="p-2 rounded-xl text-outline hover:text-primary hover:bg-surface-container transition-colors" id="micButton" title="Voice query" type="button">
                  <span class="material-symbols-outlined text-[22px]">mic</span>
                </button>
                <!-- Send button -->
                <button class="w-10 h-10 rounded-xl bg-primary hover:bg-tertiary-container text-on-primary flex items-center justify-center transition-all ml-1 shadow-sm flex-shrink-0 group" id="sendButton" title="Send query (Enter)" type="submit">
                  <span class="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-0.5">arrow_upward</span>
                </button>
              </form>

              <!-- Grounding Disclaimer & Keyboard shortcut metadata -->
              <div class="flex flex-col sm:flex-row items-center justify-between gap-1 mt-2 px-space-xs text-center sm:text-left">
                <span class="font-body-sm text-[11px] text-outline leading-tight">
                  AI Campus Copilot answers are verified against official campus publications. For academic disputes, consult the Dean of Academics.
                </span>
                <div class="hidden sm:flex items-center gap-1 font-label-sm text-[11px] text-outline flex-shrink-0">
                  <span>Use</span>
                  <kbd class="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface font-semibold text-[10px]">Enter ↵</kbd>
                  <span>to send</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- RIGHT CONTEXT / ATTACHED SYLLABUS DOCK -->
        <aside class="hidden xl:flex flex-col w-72 flex-shrink-0 bg-surface-container-lowest rounded-xl shadow-sm p-space-md space-y-space-md overflow-y-auto custom-scrollbar">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="font-label-md text-label-md font-bold text-on-surface flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[18px] text-primary">auto_stories</span>
                Quick Resources
              </span>
              <span class="font-label-sm text-label-sm text-outline">Fall 2024</span>
            </div>
            <p class="font-body-sm text-body-sm text-on-surface-variant text-[12px]">
              Direct authoritative files currently referenced in this conversation.
            </p>
          </div>

          <!-- Quick Resource Tiles -->
          <div class="space-y-2">
            <div class="resource-tile p-2.5 bg-surface-container-low rounded-xl flex items-center justify-between group hover:bg-surface-container transition-colors cursor-pointer" data-doc="Full Term Timetable">
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="material-symbols-outlined text-primary text-[20px]">calendar_today</span>
                <div class="flex flex-col min-w-0">
                  <span class="font-label-sm text-label-sm font-semibold text-on-surface truncate">Full Term Timetable</span>
                  <span class="font-body-sm text-[11px] text-outline">Updated 2 days ago</span>
                </div>
              </div>
              <span class="material-symbols-outlined text-[18px] text-outline group-hover:text-primary transition-colors">download</span>
            </div>

            <div class="resource-tile p-2.5 bg-surface-container-low rounded-xl flex items-center justify-between group hover:bg-surface-container transition-colors cursor-pointer" data-doc="CS-204 Syllabus PDF">
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="material-symbols-outlined text-error text-[20px]">menu_book</span>
                <div class="flex flex-col min-w-0">
                  <span class="font-label-sm text-label-sm font-semibold text-on-surface truncate">CS-204 Syllabus PDF</span>
                  <span class="font-body-sm text-[11px] text-outline">Prof. Alan Vance</span>
                </div>
              </div>
              <span class="material-symbols-outlined text-[18px] text-outline group-hover:text-primary transition-colors">open_in_new</span>
            </div>

            <div class="resource-tile p-2.5 bg-surface-container-low rounded-xl flex items-center justify-between group hover:bg-surface-container transition-colors cursor-pointer" data-doc="Handbook & Leave Rules">
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="material-symbols-outlined text-secondary text-[20px]">policy</span>
                <div class="flex flex-col min-w-0">
                  <span class="font-label-sm text-label-sm font-semibold text-on-surface truncate">Handbook &amp; Leave Rules</span>
                  <span class="font-body-sm text-[11px] text-outline">Dean Office Official</span>
                </div>
              </div>
              <span class="material-symbols-outlined text-[18px] text-outline group-hover:text-primary transition-colors">download</span>
            </div>
          </div>

          <!-- Live Academic Calendar Snippet -->
          <div class="pt-2">
            <span class="font-label-sm text-label-sm uppercase tracking-wider text-outline block mb-2 font-semibold">Upcoming Milestones</span>
            <div class="space-y-2.5">
              <div class="flex items-start gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-surface-container text-on-surface flex flex-col items-center justify-center flex-shrink-0 text-[11px] font-bold">
                  <span>OCT</span>
                  <span class="text-[12px] text-primary">28</span>
                </div>
                <div>
                  <span class="font-label-sm text-label-sm font-semibold text-on-surface block">CS-204 Lab Assignment 3</span>
                  <span class="text-[11px] text-on-surface-variant font-body-sm">Due at 11:59 PM • 4 days left</span>
                </div>
              </div>
              <div class="flex items-start gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-surface-container text-on-surface flex flex-col items-center justify-center flex-shrink-0 text-[11px] font-bold">
                  <span>NOV</span>
                  <span class="text-[12px] text-primary">05</span>
                </div>
                <div>
                  <span class="font-label-sm text-label-sm font-semibold text-on-surface block">Midterm Examinations</span>
                  <span class="text-[11px] text-on-surface-variant font-body-sm">Hall tickets released in SIS</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Campus Copilot Telemetry Badge -->
          <div class="mt-auto p-3 bg-surface-container-low rounded-xl">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-emerald-600 text-[18px]">verified_user</span>
              <span class="font-label-sm text-label-sm font-bold text-on-surface">Data Privacy Assured</span>
            </div>
            <p class="font-body-sm text-[11px] text-on-surface-variant mt-1 leading-normal">
              Queries are isolated within university network firewalls. No student personal records are shared with third-party public models.
            </p>
          </div>
        </aside>

      </div>
    </div>
  `;

  // Attach interactive behaviors
  initAiAssistantEvents(initialQuery);
}

function initAiAssistantEvents(initialQuery) {
  const form = document.getElementById('chatForm');
  const input = document.getElementById('promptInput');
  const chatStream = document.getElementById('chatStream');
  const newChatBtn = document.getElementById('newChatBtn');
  const micButton = document.getElementById('micButton');
  const fileInput = document.getElementById('fileInput');
  const attachmentStrip = document.getElementById('attachmentStrip');
  const attachmentName = document.getElementById('attachmentName');
  const clearAttachBtn = document.getElementById('clearAttachBtn');

  // File upload
  if (fileInput) {
    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files[0]) {
        attachmentName.textContent = fileInput.files[0].name;
        attachmentStrip.classList.remove('hidden');
        attachmentStrip.classList.add('flex');
        showToast(`Attached file: ${fileInput.files[0].name}`, 'info');
      }
    });
  }

  if (clearAttachBtn) {
    clearAttachBtn.addEventListener('click', () => {
      fileInput.value = '';
      attachmentStrip.classList.add('hidden');
      attachmentStrip.classList.remove('flex');
    });
  }

  // Mic Toggle
  let isRecording = false;
  if (micButton) {
    micButton.addEventListener('click', () => {
      isRecording = !isRecording;
      if (isRecording) {
        micButton.classList.add('text-error', 'animate-pulse');
        micButton.title = "Listening... Speak now";
        showToast("Voice mode active. Speak your campus query...", "info");
        setTimeout(() => {
          if (isRecording) {
            input.value = "What is my next class and what topics are being covered according to the syllabus?";
            micButton.classList.remove('text-error', 'animate-pulse');
            isRecording = false;
            showToast("Transcribed voice query successfully.", "success");
            input.focus();
          }
        }, 2200);
      } else {
        micButton.classList.remove('text-error', 'animate-pulse');
        micButton.title = "Voice query";
      }
    });
  }

  // Suggestion Chips
  document.querySelectorAll('.query-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-query');
      if (q) {
        input.value = q;
        submitChatQuery(q);
      }
    });
  });

  // New Chat Button
  if (newChatBtn) {
    newChatBtn.addEventListener('click', () => {
      const confirmReset = confirm("Start a new AI Copilot conversation? Current query history will be saved.");
      if (confirmReset) {
        // Keep header and clear messages
        const initialHtml = `
          <div class="max-w-3xl mx-auto flex items-center justify-center">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-low rounded-full text-on-surface-variant font-label-sm text-label-sm shadow-sm">
              <span class="material-symbols-outlined text-[16px] text-tertiary">history_edu</span>
              <span>New Academic Session Started • Fall 2024 • Timetable &amp; Syllabus Active</span>
            </div>
          </div>
          <div class="flex items-start gap-space-sm max-w-3xl mx-auto animate-fade-in">
            <div class="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
              <span class="material-symbols-outlined text-[18px]">auto_awesome</span>
            </div>
            <div class="flex flex-col flex-1 min-w-0">
              <div class="bg-surface-container-low text-on-surface rounded-2xl rounded-tl-none p-space-md space-y-space-sm shadow-sm">
                <p class="font-body-md text-body-md leading-relaxed">
                  Hello Sophia! I am your <strong>AI Campus Copilot</strong>. How can I assist you with your classes, timetable, notices, or academic policies today?
                </p>
              </div>
              <span class="font-label-sm text-[11px] text-outline mt-1 px-1">Just now • AI Copilot</span>
            </div>
          </div>
        `;
        chatStream.innerHTML = initialHtml;
        showToast("New conversation started", "success");
        input.value = '';
        input.focus();
      }
    });
  }

  // History Switcher buttons
  document.querySelectorAll('.history-thread-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.history-thread-btn').forEach(b => {
        b.classList.remove('bg-surface-container', 'font-semibold');
      });
      btn.classList.add('bg-surface-container', 'font-semibold');
      const topicText = btn.querySelector('.truncate')?.textContent || 'Thread';
      showToast(`Loaded conversation: "${topicText}"`, 'info');
    });
  });

  // Action Buttons: Copy, Feedback, Inspect RAG, Route, Export
  setupDelegatedButtons(chatStream);

  const exportBtn = document.getElementById('exportNotesBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      showToast("Notes exported to Markdown file: Campus_Notes_CS204.md", "success");
    });
  }

  const ragBtn = document.getElementById('inspectRagBtn');
  if (ragBtn) {
    ragBtn.addEventListener('click', () => {
      window.location.hash = '#admin-panel';
    });
  }

  const copilotSettingsBtn = document.getElementById('copilotSettingsBtn');
  if (copilotSettingsBtn) {
    copilotSettingsBtn.addEventListener('click', () => {
      window.location.hash = '#settings';
    });
  }

  // Handle Form Submit
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = input.value.trim();
      if (!query) return;
      submitChatQuery(query);
    });
  }

  function submitChatQuery(query) {
    input.value = '';
    // Append student bubble
    const userWrapper = document.createElement('div');
    userWrapper.className = 'flex items-start justify-end gap-space-sm max-w-3xl mx-auto animate-fade-in';
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    userWrapper.innerHTML = `
      <div class="flex flex-col items-end max-w-[85%] sm:max-w-[75%]">
        <div class="bg-primary text-on-primary px-space-md py-space-sm rounded-2xl rounded-tr-none shadow-sm">
          <p class="font-body-md text-body-md leading-relaxed">${escapeHtml(query)}</p>
        </div>
        <span class="font-label-sm text-[11px] text-outline mt-1 pr-1">${now} • Sophia Chen</span>
      </div>
      <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-0.5 ring-2 ring-primary-container shadow-sm">
        <img src="assets/avatars/student.svg" alt="Sophia Chen" class="w-full h-full object-cover">
      </div>
    `;
    chatStream.appendChild(userWrapper);
    chatStream.scrollTop = chatStream.scrollHeight;

    // Show temporary thinking state
    const thinkingId = 'thinking-' + Date.now();
    const thinkingWrapper = document.createElement('div');
    thinkingWrapper.id = thinkingId;
    thinkingWrapper.className = 'flex items-start gap-space-sm max-w-3xl mx-auto animate-fade-in';
    thinkingWrapper.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
        <span class="material-symbols-outlined text-[18px]">auto_awesome</span>
      </div>
      <div class="flex flex-col flex-1 min-w-0">
        <div class="bg-surface-container-low text-on-surface rounded-2xl rounded-tl-none p-space-md space-y-space-sm shadow-sm">
          <p class="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[20px] animate-spin">progress_activity</span>
            <span>Grounding response in university knowledge base &amp; registrar feeds...</span>
          </p>
        </div>
      </div>
    `;
    chatStream.appendChild(thinkingWrapper);
    chatStream.scrollTop = chatStream.scrollHeight;

    // Simulate smart AI response
    setTimeout(() => {
      const thinkingEl = document.getElementById(thinkingId);
      if (thinkingEl) thinkingEl.remove();

      const aiResponse = generateAiResponse(query);
      const aiWrapper = document.createElement('div');
      aiWrapper.className = 'flex items-start gap-space-sm max-w-3xl mx-auto animate-fade-in';
      aiWrapper.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
          <span class="material-symbols-outlined text-[18px]">auto_awesome</span>
        </div>
        <div class="flex flex-col flex-1 min-w-0">
          <div class="bg-surface-container-low text-on-surface rounded-2xl rounded-tl-none p-space-md space-y-space-md shadow-sm">
            ${aiResponse}
          </div>
          <div class="flex items-center justify-between mt-1 px-1">
            <span class="font-label-sm text-[11px] text-outline">${now} • AI Copilot</span>
            <div class="flex items-center gap-1 text-outline">
              <button class="copy-btn p-1 hover:text-on-surface rounded hover:bg-surface-container transition-colors" title="Copy text" type="button">
                <span class="material-symbols-outlined text-[16px]">content_copy</span>
              </button>
              <button class="feedback-btn p-1 hover:text-on-surface rounded hover:bg-surface-container transition-colors" title="Helpful" type="button">
                <span class="material-symbols-outlined text-[16px]">thumb_up</span>
              </button>
              <button class="feedback-btn p-1 hover:text-on-surface rounded hover:bg-surface-container transition-colors" title="Not helpful" type="button">
                <span class="material-symbols-outlined text-[16px]">thumb_down</span>
              </button>
            </div>
          </div>
        </div>
      `;
      chatStream.appendChild(aiWrapper);
      setupDelegatedButtons(aiWrapper);
      chatStream.scrollTop = chatStream.scrollHeight;
    }, 700);
  }

  // If initialQuery passed (e.g. from command palette or dashboard)
  if (initialQuery) {
    submitChatQuery(initialQuery);
  }
}

function generateAiResponse(query) {
  const qLower = query.toLowerCase();

  // Match known answers
  for (const [key, resp] of Object.entries(campusData.aiResponses)) {
    if (qLower.includes(key.toLowerCase()) || key.toLowerCase().includes(qLower)) {
      return renderStructuredAiResponse(resp);
    }
  }

  // Keyword-based matches
  if (qLower.includes('attendance')) {
    return renderStructuredAiResponse(campusData.aiResponses["What is my attendance percentage in CS-204?"]);
  }
  if (qLower.includes('exam') || qLower.includes('midterm') || qLower.includes('hall ticket')) {
    return renderStructuredAiResponse(campusData.aiResponses["When is the next midterm exam?"]);
  }
  if (qLower.includes('leave') || qLower.includes('medical') || qLower.includes('sick')) {
    return renderStructuredAiResponse(campusData.aiResponses["Where can I submit my medical leave certificate?"]);
  }
  if (qLower.includes('lab') || qLower.includes('computer')) {
    return renderStructuredAiResponse(campusData.aiResponses["Where is the nearest open computer lab right now?"]);
  }
  if (qLower.includes('avl') || qLower.includes('tree') || qLower.includes('summary')) {
    return renderStructuredAiResponse(campusData.aiResponses["Summarize lecture notes for AVL Trees"]);
  }
  if (qLower.includes('shuttle') || qLower.includes('bus')) {
    return `
      <div>
        <p class="font-body-md text-body-md text-on-surface">
          <strong>Campus Shuttle Service Timetable:</strong>
        </p>
        <div class="space-y-2 mt-2">
          ${campusData.shuttles.map(s => `
            <div class="p-2.5 bg-surface-container-lowest rounded-xl">
              <div class="flex items-center justify-between font-label-md font-semibold text-primary">
                <span>${s.route}</span>
                <span class="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">${s.status}</span>
              </div>
              <p class="font-body-sm text-xs text-on-surface-variant mt-1">${s.path}</p>
              <span class="text-[11px] text-outline font-semibold">Frequency: ${s.interval}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="pt-2">
        <div class="flex items-center gap-2 p-2.5 bg-surface-container-lowest rounded-xl">
          <span class="material-symbols-outlined text-[18px] text-primary">verified</span>
          <span class="font-label-sm text-xs text-on-surface">Source: Campus Transport Management Board Telemetry</span>
        </div>
      </div>
    `;
  }

  // Default grounded response
  return `
    <div class="space-y-2">
      <p class="font-body-md text-body-md leading-relaxed text-on-surface">
        I checked the official campus knowledge base and academic records regarding: "<strong>${escapeHtml(query)}</strong>".
      </p>
      <div class="p-3 bg-surface-container-lowest rounded-xl space-y-1.5">
        <div class="font-label-md text-sm font-semibold text-primary flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[18px]">info</span>
          Campus Index Summary
        </div>
        <p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
          The requested topic is documented in the <strong>2024–2025 Undergraduate Student Academic Handbook</strong> and the Department of Computer Science guidelines. Please verify the relevant section or contact the Dean of Academics office if you require formal administrative verification.
        </p>
      </div>
      <div class="pt-1">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-surface-container-lowest rounded-xl shadow-sm">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px] text-secondary">menu_book</span>
            <span class="font-label-sm text-xs font-semibold text-on-surface">University Academic Regulations • Section 4</span>
          </div>
          <button class="inspect-doc-btn px-2.5 py-1 bg-surface-container-high hover:bg-secondary-container text-on-secondary-container rounded-md font-label-sm text-xs transition-colors" data-doc="University Regulations" type="button">
            Inspect Document
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderStructuredAiResponse(data) {
  if (data.type === 'stats') {
    return `
      <div class="space-y-2">
        <p class="font-body-md text-body-md text-on-surface">${data.content}</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          ${data.stats.map(s => `
            <div class="p-3 bg-surface-container-lowest rounded-xl">
              <span class="font-label-sm text-xs text-outline font-semibold block">${s.label}</span>
              <span class="font-headline-md text-lg font-bold ${s.highlight ? 'text-emerald-600' : 'text-on-surface'}">${s.value}</span>
            </div>
          `).join('')}
        </div>
        <div class="pt-2">
          <div class="flex items-center gap-2 p-2.5 bg-surface-container-lowest rounded-xl">
            <span class="material-symbols-outlined text-[16px] text-primary">verified</span>
            <span class="font-label-sm text-xs text-on-surface">${data.citation.doc} • ${data.citation.meta}</span>
          </div>
        </div>
      </div>
    `;
  }

  if (data.type === 'exam') {
    return `
      <div class="space-y-2">
        <p class="font-body-md text-body-md text-on-surface">${data.content}</p>
        <div class="p-3 bg-surface-container-lowest rounded-xl border border-primary-fixed">
          <div class="flex items-center justify-between">
            <span class="px-2 py-0.5 rounded bg-primary text-on-primary font-label-sm text-xs font-bold">${data.exam.code}</span>
            <span class="font-label-sm text-xs text-error font-bold">First Examination</span>
          </div>
          <h4 class="font-headline-md font-bold text-on-surface mt-1">${data.exam.title}</h4>
          <div class="text-xs text-on-surface-variant space-y-1 mt-1">
            <p><strong>Date &amp; Time:</strong> ${data.exam.date}</p>
            <p><strong>Examination Venue:</strong> ${data.exam.venue}</p>
            <p class="text-primary font-medium">${data.exam.hallTicketNotice}</p>
          </div>
        </div>
        <div class="pt-2">
          <div class="flex items-center gap-2 p-2.5 bg-surface-container-lowest rounded-xl">
            <span class="material-symbols-outlined text-[16px] text-primary">picture_as_pdf</span>
            <span class="font-label-sm text-xs text-on-surface">${data.citation.doc} • ${data.citation.meta}</span>
          </div>
        </div>
      </div>
    `;
  }

  if (data.type === 'lab') {
    return `
      <div class="space-y-2">
        <p class="font-body-md text-body-md text-on-surface">${data.content}</p>
        <div class="space-y-2 pt-1">
          ${data.labs.map(lab => `
            <div class="p-3 bg-surface-container-lowest rounded-xl flex items-center justify-between">
              <div>
                <h5 class="font-label-md font-bold text-on-surface">${lab.name}</h5>
                <span class="font-body-sm text-xs text-on-surface-variant">Open until ${lab.openUntil} • ${lab.status}</span>
              </div>
              <span class="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">${lab.freeSeats}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  if (data.type === 'summary') {
    return `
      <div class="space-y-2">
        <div class="p-3 bg-surface-container-lowest rounded-xl text-on-surface font-body-sm space-y-2 leading-relaxed">
          ${data.content.replace(/\n\n/g, '<br><br>').replace(/- /g, '• ')}
        </div>
        <div class="pt-2">
          <div class="flex items-center gap-2 p-2.5 bg-surface-container-lowest rounded-xl">
            <span class="material-symbols-outlined text-[16px] text-primary">picture_as_pdf</span>
            <span class="font-label-sm text-xs text-on-surface">${data.citation.doc} • ${data.citation.meta}</span>
          </div>
        </div>
      </div>
    `;
  }

  return `<p class="font-body-md text-body-md text-on-surface">${data.content}</p>`;
}

function setupDelegatedButtons(container) {
  // Copy button
  container.querySelectorAll('.copy-btn').forEach(btn => {
    btn.onclick = () => {
      showToast("Copied response to clipboard", "success");
    };
  });

  // Feedback buttons
  container.querySelectorAll('.feedback-btn').forEach(btn => {
    btn.onclick = () => {
      showToast("Thank you for your feedback!", "info");
    };
  });

  // Route buttons
  container.querySelectorAll('.route-btn').forEach(btn => {
    btn.onclick = () => {
      const room = btn.getAttribute('data-room') || 'Turing Hall';
      window.location.hash = '#campus-guide';
      showToast(`Showing route to: ${room}`, 'info');
    };
  });

  // Inspect doc buttons
  container.querySelectorAll('.inspect-doc-btn').forEach(btn => {
    btn.onclick = () => {
      const doc = btn.getAttribute('data-doc') || 'Document';
      showToast(`Opening document preview: ${doc}`, 'info');
    };
  });

  // Resource tiles in right dock
  document.querySelectorAll('.resource-tile').forEach(tile => {
    tile.onclick = () => {
      const doc = tile.getAttribute('data-doc');
      showToast(`Downloading campus document: ${doc}`, 'success');
    };
  });
}

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

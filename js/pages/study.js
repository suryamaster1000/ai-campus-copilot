// Study Assistant Page - Syllabi, Cheat Sheets & AI Quiz Generation
import { campusData } from '../data.js';
import { showToast } from '../components/toast.js';

export function renderStudyAssistant(container) {
  let selectedCourseCode = "CS-204";

  function render() {
    const course = campusData.studyModules.find(c => c.code === selectedCourseCode) || campusData.studyModules[0] || null;
    if (!course) {
      container.innerHTML = '<div class="max-w-[1720px] mx-auto py-space-md"><div class="bg-surface-container-lowest rounded-2xl p-8 text-center border border-surface-container-high"><span class="material-symbols-outlined text-outline text-[44px]">menu_book</span><h1 class="font-headline-md text-xl font-bold text-on-surface mt-3">No course data yet</h1><p class="text-sm text-on-surface-variant mt-2">Course and syllabus information will appear after the live student data is connected.</p></div></div>';
      return;
    }

    container.innerHTML = `
      <div class="max-w-[1720px] mx-auto py-space-sm space-y-space-md animate-fade-in">
        
        <!-- Header Strip -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-surface-container-high">
          <div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[24px]">menu_book</span>
              <h1 class="font-headline-md text-xl lg:text-2xl font-bold text-on-surface">Study Assistant &amp; Course Hub</h1>
              <span class="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-semibold">Current term</span>
            </div>
            <p class="text-xs text-on-surface-variant mt-1">
              Course modules, verified lecture slides, AI flashcards, and concept visualizers.
            </p>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <button id="studyQuizBtn" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-on-primary hover:bg-tertiary-container text-xs font-semibold rounded-xl shadow-sm transition-colors">
              <span class="material-symbols-outlined text-[18px]">quiz</span>
              <span>AI Practice Quiz</span>
            </button>
            <button id="uploadNotesBtn" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold rounded-xl transition-colors">
              <span class="material-symbols-outlined text-[18px]">upload_file</span>
              <span>Upload Notes / PDF</span>
            </button>
          </div>
        </div>

        <!-- Course Tabs -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1">
          ${campusData.studyModules.map(m => `
            <button class="course-tab-btn px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${m.code === selectedCourseCode ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant'}" data-code="${m.code}">
              <span>${m.code}</span>
              <span class="text-[11px] font-normal opacity-90">${m.name}</span>
            </button>
          `).join('')}
        </div>

        <!-- Main Content Area -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
          
          <!-- Left 2 Cols: Syllabus & Units -->
          <div class="lg:col-span-2 space-y-space-md">
            
            <!-- Active Course Details Card -->
            <div class="bg-surface-container-lowest rounded-2xl p-space-md lg:p-space-lg shadow-sm border border-surface-container-high">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-space-md pb-space-sm border-b border-surface-container">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed text-xs font-bold">${course.code}</span>
                    <h2 class="font-headline-md text-lg font-bold text-on-surface">${course.name}</h2>
                  </div>
                  <p class="text-xs text-on-surface-variant mt-1">Instructor: ${course.faculty} • 4 Credits</p>
                </div>
                <div class="flex items-center gap-3">
                  <div class="text-right">
                    <span class="text-xs text-outline font-semibold">Syllabus Progress</span>
                    <span class="font-headline-md text-sm font-bold text-primary block">${course.progress}% Completed</span>
                  </div>
                  <div class="w-16 bg-surface-container h-2 rounded-full overflow-hidden">
                    <div class="bg-primary h-full rounded-full" style="width: ${course.progress}%"></div>
                  </div>
                </div>
              </div>

              <!-- Units List -->
              <div class="space-y-3">
                <h3 class="font-label-md text-xs font-bold text-outline uppercase tracking-wider">Curriculum Modules &amp; Learning Objectives</h3>
                <div class="space-y-2">
                  ${course.units.map((unit, idx) => `
                    <div class="p-3.5 rounded-xl border ${unit.status.includes('Current') ? 'bg-primary-fixed/15 border-primary shadow-sm' : 'bg-surface-container-low border-surface-container-high'} flex items-center justify-between gap-3">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg ${unit.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : unit.status.includes('Current') ? 'bg-primary text-white' : 'bg-surface-container text-outline'} flex items-center justify-center text-xs font-bold flex-shrink-0">
                          ${unit.status === 'Completed' ? '<span class="material-symbols-outlined text-[18px]">check</span>' : idx + 1}
                        </div>
                        <div>
                          <h4 class="font-label-md text-sm font-semibold text-on-surface">${unit.title}</h4>
                          <span class="text-xs ${unit.status.includes('Current') ? 'text-primary font-bold' : 'text-outline'}">${unit.status}</span>
                        </div>
                      </div>
                      <button class="study-explain-unit-btn px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold rounded-lg transition-colors flex items-center gap-1" data-unit="${unit.title}">
                        <span class="material-symbols-outlined text-[15px] text-primary">auto_awesome</span>
                        <span>Explain</span>
                      </button>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- AI Concept Visualizer Card -->
            <div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container-high">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[20px]">psychology</span>
                <h3 class="font-headline-md text-base font-bold text-on-surface">Interactive Concept Visualizer</h3>
              </div>
              <p class="text-xs text-on-surface-variant mt-2">Course topics will appear here after real course data is connected.</p>
            </div>

          <!-- Right 1 Col: AI Study Tools & Quick Cheatsheets -->
          <div class="space-y-space-md">
            
            <!-- AI Study Generators -->
            <div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container-high">
              <div class="flex items-center gap-2 mb-3">
                <span class="material-symbols-outlined text-primary text-[20px]">smart_toy</span>
                <h3 class="font-headline-md font-bold text-base text-on-surface">AI Study Utilities</h3>
              </div>
              <div class="space-y-2">
                ${course.aiTools.map(tool => `
                  <button class="ai-tool-action-btn w-full p-3 bg-surface-container-low hover:bg-secondary-container hover:text-on-secondary-container rounded-xl text-left transition-all flex items-center justify-between group" data-tool="${tool}">
                    <span class="text-xs font-semibold text-on-surface group-hover:text-on-secondary-container">${tool}</span>
                    <span class="material-symbols-outlined text-primary group-hover:text-on-secondary-container text-[18px]">arrow_forward</span>
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Quick Downloadable Cheat Sheets -->
            <div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container-high">
              <div class="flex items-center justify-between mb-3">
                <span class="font-label-md font-bold text-sm text-outline uppercase tracking-wider">Course Reference PDFs</span>
                <span class="text-xs text-primary font-bold">Verified</span>
              </div>
              <div class="space-y-2.5">
                <div class="p-2.5 bg-surface-container-low rounded-xl flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-error text-[20px]">picture_as_pdf</span>
                    <div>
                      <span class="text-xs font-bold text-on-surface block">${course.code}_Syllabus.pdf</span>
                      <span class="text-[10px] text-outline">Official syllabus version</span>
                    </div>
                  </div>
                  <button class="study-dl-pdf-btn p-1.5 text-outline hover:text-primary transition-colors" data-name="${course.code}_Syllabus.pdf">
                    <span class="material-symbols-outlined text-[18px]">download</span>
                  </button>
                </div>

                <div class="p-2.5 bg-surface-container-low rounded-xl flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-error text-[20px]">picture_as_pdf</span>
                    <div>
                      <span class="text-xs font-bold text-on-surface block">${course.code}_Formula_CheatSheet.pdf</span>
                      <span class="text-[10px] text-outline">Big-O &amp; Complexity Tables</span>
                    </div>
                  </div>
                  <button class="study-dl-pdf-btn p-1.5 text-outline hover:text-primary transition-colors" data-name="${course.code}_Formula_CheatSheet.pdf">
                    <span class="material-symbols-outlined text-[18px]">download</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      <!-- Quick Quiz Modal Container (Hidden by default) -->
      <div id="quizModal" class="fixed inset-0 z-50 hidden items-center justify-center p-4 drawer-backdrop">
        <div class="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 w-full max-w-xl p-space-md lg:p-space-lg space-y-4 animate-fade-in">
          <div class="flex items-center justify-between border-b border-surface-container pb-3">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[24px]">quiz</span>
              <h3 class="font-headline-md font-bold text-lg text-on-surface">CS-204 DSA Mini-Quiz</h3>
            </div>
            <button id="closeQuizBtn" class="text-outline hover:text-on-surface">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <div class="space-y-3" id="quizBody">
            <p class="font-body-md text-sm font-semibold text-on-surface">
              Q1: What is the maximum allowed balance factor for any node in an AVL tree?
            </p>
            <div class="space-y-2">
              <label class="flex items-center gap-2.5 p-2.5 bg-surface-container-low rounded-xl cursor-pointer hover:bg-surface-container">
                <input type="radio" name="quizQ1" value="0" class="text-primary"/>
                <span class="text-xs font-medium text-on-surface">0 only</span>
              </label>
              <label class="flex items-center gap-2.5 p-2.5 bg-surface-container-low rounded-xl cursor-pointer hover:bg-surface-container">
                <input type="radio" name="quizQ1" value="1" class="text-primary"/>
                <span class="text-xs font-medium text-on-surface">-1, 0, or +1 (Correct)</span>
              </label>
              <label class="flex items-center gap-2.5 p-2.5 bg-surface-container-low rounded-xl cursor-pointer hover:bg-surface-container">
                <input type="radio" name="quizQ1" value="2" class="text-primary"/>
                <span class="text-xs font-medium text-on-surface">Any positive integer</span>
              </label>
            </div>
            <button id="submitQuizBtn" class="w-full py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs hover:bg-tertiary-container transition-colors">
              Submit Answer
            </button>
            <div id="quizResult" class="hidden p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold"></div>
          </div>
        </div>
      </div>
    `;

    // Tab buttons
    container.querySelectorAll('.course-tab-btn').forEach(btn => {
      btn.onclick = () => {
        selectedCourseCode = btn.getAttribute('data-code');
        render();
      };
    });

    // Explain unit button
    container.querySelectorAll('.study-explain-unit-btn').forEach(btn => {
      btn.onclick = () => {
        const unit = btn.getAttribute('data-unit');
        window.location.hash = '#ai-assistant';
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('campus:askAi', { detail: { query: `Explain ${unit} from ${selectedCourseCode} with practical examples.` } }));
        }, 50);
      };
    });

    // AI Tool buttons
    container.querySelectorAll('.ai-tool-action-btn').forEach(btn => {
      btn.onclick = () => {
        const tool = btn.getAttribute('data-tool');
        window.location.hash = '#ai-assistant';
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('campus:askAi', { detail: { query: `${tool} for ${selectedCourseCode}` } }));
        }, 50);
      };
    });

    // Deep dive button
    container.querySelectorAll('.study-ask-ai-deep-btn').forEach(btn => {
      btn.onclick = () => {
        const topic = btn.getAttribute('data-topic');
        window.location.hash = '#ai-assistant';
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('campus:askAi', { detail: { query: `Summarize lecture notes for ${topic}` } }));
        }, 50);
      };
    });

    // PDF download
    container.querySelectorAll('.study-dl-pdf-btn').forEach(btn => {
      btn.onclick = () => {
        const name = btn.getAttribute('data-name');
        showToast(`Downloaded: ${name}`, 'success');
      };
    });

    // Upload notes button
    const uploadNotesBtn = document.getElementById('uploadNotesBtn');
    if (uploadNotesBtn) {
      uploadNotesBtn.onclick = () => {
        showToast("Select a PDF or image file to upload for AI summarization.", "info");
      };
    }

    // Quiz modal interactions
    const quizBtn = document.getElementById('studyQuizBtn');
    const quizModal = document.getElementById('quizModal');
    const closeQuizBtn = document.getElementById('closeQuizBtn');
    const submitQuizBtn = document.getElementById('submitQuizBtn');
    const quizResult = document.getElementById('quizResult');

    if (quizBtn && quizModal) {
      quizBtn.onclick = () => {
        quizModal.classList.remove('hidden');
        quizModal.classList.add('flex');
        quizResult.classList.add('hidden');
      };
    }

    if (closeQuizBtn && quizModal) {
      closeQuizBtn.onclick = () => {
        quizModal.classList.add('hidden');
        quizModal.classList.remove('flex');
      };
    }

    if (submitQuizBtn && quizResult) {
      submitQuizBtn.onclick = () => {
        const selected = document.querySelector('input[name="quizQ1"]:checked');
        if (!selected) {
          showToast("Please choose an answer option.", "warning");
          return;
        }
        quizResult.classList.remove('hidden');
        if (selected.value === "1") {
          quizResult.className = "p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold";
          quizResult.textContent = "🎉 Correct! In an AVL tree, the balance factor (Height(Left) - Height(Right)) of every node must be -1, 0, or +1.";
          showToast("100% Correct! Keep it up!", "success");
        } else {
          quizResult.className = "p-3 bg-amber-50 text-amber-800 rounded-xl text-xs font-semibold";
          quizResult.textContent = "Incorrect. The invariant for AVL trees requires Balance Factor in {-1, 0, +1}.";
        }
      };
    }
  }

  render();
}

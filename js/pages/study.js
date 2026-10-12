// Study Assistant Page - Syllabi, Cheat Sheets & AI Quiz Generation
import { campusData } from '../data.js';
import { showToast } from '../components/toast.js';
import { supabase } from '../supabase.js';

export function renderStudyAssistant(container) {
  const studyModules = Array.isArray(campusData.studyModules) ? campusData.studyModules : [];
  let selectedCourseCode = studyModules[0]?.code || '';
  let syllabusDocumentId = null;

  function render() {
    const liveModules = Array.isArray(campusData.studyModules) ? campusData.studyModules : [];
    const course = liveModules.find(c => c.code === selectedCourseCode) || liveModules[0] || null;
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

        <!-- Course Selector -->
        <div class="max-w-xl">
          <label class="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1.5">Select Course</label>
          <select id="courseSelect" class="w-full h-11 px-3 rounded-xl border border-surface-container-high bg-surface-container-lowest text-sm font-bold text-on-surface outline-none focus:border-primary">
            ${liveModules.map(m => `<option value="${m.code}" ${m.code === selectedCourseCode ? 'selected' : ''}>${m.code} — ${m.name}</option>`).join('')}
          </select>
        </div>

        <!-- User-configurable study-set builder -->
        <section class="bg-surface-container-lowest rounded-2xl p-space-md lg:p-space-lg shadow-sm border border-primary/20" id="studySetBuilder">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[22px]">tune</span>
                <h2 class="font-headline-md text-lg font-bold text-on-surface">Build Your Practice Set</h2>
              </div>
              <p class="text-xs text-on-surface-variant mt-1">Choose the question count, difficulty, question type, and syllabus unit.</p>
            </div>
            <span class="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-bold">Syllabus-based</span>
          </div>
          <form id="studySetForm" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <label class="block text-xs font-semibold text-on-surface-variant">
              Question type
              <select id="studySetType" class="mt-1.5 w-full h-11 px-3 rounded-xl border border-surface-container-high bg-surface text-sm text-on-surface">
                <option value="practice">Multiple choice (MCQ)</option>
                <option value="theory">Theory questions with answers</option>
                <option value="short">Short-answer Q&amp;A</option>
                <option value="code">Python coding exercises</option>
              </select>
            </label>
            <label class="block text-xs font-semibold text-on-surface-variant">
              Number of questions
              <input id="studyQuestionCount" type="number" min="1" max="15" step="1" value="5" required class="mt-1.5 w-full h-11 px-3 rounded-xl border border-surface-container-high bg-surface text-sm text-on-surface"/>
              <span class="block text-[10px] font-normal mt-1">Choose 1–15 questions</span>
            </label>
            <label class="block text-xs font-semibold text-on-surface-variant">
              Difficulty
              <select id="studySetDifficulty" class="mt-1.5 w-full h-11 px-3 rounded-xl border border-surface-container-high bg-surface text-sm text-on-surface">
                <option value="mixed">Mixed difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>
            <label class="block text-xs font-semibold text-on-surface-variant">
              Syllabus unit
              <select id="studySetUnit" class="mt-1.5 w-full h-11 px-3 rounded-xl border border-surface-container-high bg-surface text-sm text-on-surface">
                <option value="all">All units in this subject</option>
              </select>
            </label>
            <div class="sm:col-span-2 xl:col-span-4 flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
              <button id="generateStudySetBtn" type="submit" class="inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary text-on-primary hover:bg-tertiary-container rounded-xl text-sm font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                <span class="material-symbols-outlined text-[18px]">auto_awesome</span>
                Generate Practice Set
              </button>
              <p id="studySetStatus" role="status" aria-live="polite" class="text-xs text-on-surface-variant">Your selections will be used to generate questions from the published syllabus.</p>
            </div>
          </form>
          <div id="studySetResults" class="mt-4 space-y-3"></div>
        </section>

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
                  ${(Array.isArray(course.units) && course.units.length ? course.units : [{ title: 'Syllabus details not connected yet', status: 'Live syllabus data pending' }]).map((unit, idx) => `
                    <div class="p-3.5 rounded-xl border ${String(unit.status || '').includes('Current') ? 'bg-primary-fixed/15 border-primary shadow-sm' : 'bg-surface-container-low border-surface-container-high'} flex items-center justify-between gap-3">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg ${String(unit.status || '') === 'Completed' ? 'bg-emerald-100 text-emerald-800' : String(unit.status || '').includes('Current') ? 'bg-primary text-white' : 'bg-surface-container text-outline'} flex items-center justify-center text-xs font-bold flex-shrink-0">
                          ${String(unit.status || '') === 'Completed' ? '<span class="material-symbols-outlined text-[18px]">check</span>' : idx + 1}
                        </div>
                        <div>
                          <h4 class="font-label-md text-sm font-semibold text-on-surface">${unit.title}</h4>
                          <span class="text-xs ${String(unit.status || '').includes('Current') ? 'text-primary font-bold' : 'text-outline'}">${unit.status}</span>
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
                ${(Array.isArray(course.aiTools) && course.aiTools.length ? course.aiTools : ['Ask AI about this course', 'Generate practice quiz']).map(tool => `
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

    // Course selector
    container.querySelector('#courseSelect')?.addEventListener('change', (event) => { selectedCourseCode = event.target.value; render(); });

    // Populate unit choices from the selected course's published syllabus headings.
    const unitSelect = container.querySelector('#studySetUnit');
    if (unitSelect) {
      const unitTitles = Array.isArray(course.units) ? course.units : [];
      unitTitles.forEach((unit) => {
        const roman = String(unit.title || '').match(/^Unit\s+(IV|III|II|I)\b/i)?.[1]?.toUpperCase();
        if (!roman) return;
        const option = document.createElement('option');
        option.value = roman;
        option.textContent = unit.title;
        unitSelect.appendChild(option);
      });
    }

    // Bring the configurable builder into view instead of launching a fixed generic quiz.
    container.querySelector('#studyQuizBtn')?.addEventListener('click', () => {
      container.querySelector('#studySetBuilder')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      container.querySelector('#studySetType')?.focus({ preventScroll: true });
    });

    // Generate through the authenticated Supabase Edge Function.
    const studySetForm = container.querySelector('#studySetForm');
    studySetForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const status = container.querySelector('#studySetStatus');
      const button = container.querySelector('#generateStudySetBtn');
      const resultHost = container.querySelector('#studySetResults');
      const mode = container.querySelector('#studySetType')?.value || 'practice';
      const count = Number(container.querySelector('#studyQuestionCount')?.value || 5);
      const difficulty = container.querySelector('#studySetDifficulty')?.value || 'mixed';
      const unit = container.querySelector('#studySetUnit')?.value || 'all';

      if (!Number.isInteger(count) || count < 1 || count > 15) {
        status.textContent = 'Enter a whole number from 1 to 15.';
        showToast('Choose between 1 and 15 questions.', 'warning');
        return;
      }
      if (!syllabusDocumentId) {
        status.textContent = 'The published syllabus is still loading. Please wait a moment and try again.';
        showToast('Syllabus is not ready yet. Please try again.', 'warning');
        return;
      }

      button.disabled = true;
      button.innerHTML = '<span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Generating…';
      status.textContent = 'Generating your questions from the published syllabus…';
      resultHost.replaceChildren();

      try {
        const subjectMatch = String(course.code || '').match(/SUB-(\d+)/i);
        const { data, error } = await supabase.functions.invoke('generate-study-set', {
          body: {
            documentId: syllabusDocumentId,
            subjectNumber: subjectMatch ? Number(subjectMatch[1]) : null,
            subjectName: course.name,
            unit,
            mode,
            count,
            difficulty
          }
        });
        if (error || data?.error) throw new Error(data?.error || error?.message || 'The study set could not be generated.');
        renderGeneratedStudySet(resultHost, data, mode);
        const generatedCount = mode === 'code'
          ? (Array.isArray(data.exercises) ? data.exercises.length : 0)
          : (Array.isArray(data.questions) ? data.questions.length : 0);
        status.textContent = 'Generated ' + generatedCount + ' item(s) for ' + course.name + '.';
      } catch (error) {
        console.error('Study set generation failed:', error);
        status.textContent = error?.message || 'The study set could not be generated. Please try again.';
        showToast(status.textContent, 'error');
      } finally {
        button.disabled = false;
        button.innerHTML = '<span class="material-symbols-outlined text-[18px]">auto_awesome</span> Generate Practice Set';
      }
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

    if (quizBtn) quizBtn.onclick = () => container.querySelector('#studySetBuilder')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

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
  loadSyllabusModules().catch((error) => {
    console.error('Syllabus modules failed:', error);
  });
  loadSubjectNotes().catch((error) => console.error('Subject notes failed:', error));

  function renderGeneratedStudySet(host, payload, mode) {
    host.replaceChildren();
    const el = (tag, className, text) => {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text !== undefined && text !== null) node.textContent = String(text);
      return node;
    };
    const heading = el('div', 'rounded-xl bg-surface-container-low p-4');
    heading.appendChild(el('h3', 'font-headline-md text-base font-bold text-on-surface', payload.title || 'Your practice set'));
    if (payload.summary) heading.appendChild(el('p', 'text-xs text-on-surface-variant mt-1', payload.summary));
    host.appendChild(heading);

    if (mode === 'code') {
      const exercises = Array.isArray(payload.exercises) ? payload.exercises : (payload.prompt ? [payload] : []);
      if (!exercises.length) throw new Error('The generated response did not contain coding exercises. Please retry.');
      exercises.forEach((exercise, index) => {
        const card = el('article', 'rounded-xl border border-surface-container-high p-4 space-y-3');
        card.appendChild(el('h4', 'font-semibold text-sm text-on-surface', (index + 1) + '. ' + (exercise.title || exercise.topic || 'Python exercise')));
        card.appendChild(el('p', 'text-sm text-on-surface-variant whitespace-pre-wrap', exercise.prompt || exercise.question || ''));
        if (exercise.starterCode) {
          card.appendChild(el('div', 'text-xs font-bold text-on-surface-variant', 'Starter code'));
          card.appendChild(el('pre', 'overflow-x-auto whitespace-pre rounded-lg bg-surface-container-low p-3 text-xs text-on-surface', exercise.starterCode));
        }
        if (Array.isArray(exercise.tests) && exercise.tests.length) {
          card.appendChild(el('p', 'text-xs text-on-surface-variant', 'Practice checks: ' + exercise.tests.length + ' test cases are supplied with this exercise.'));
        }
        if (Array.isArray(exercise.hints) && exercise.hints.length) {
          const hints = el('div', 'hidden rounded-lg bg-surface-container-low p-3 text-xs whitespace-pre-wrap');
          hints.textContent = exercise.hints.map((hint, i) => (i + 1) + '. ' + hint).join('\n');
          const hintBtn = el('button', 'px-3 py-2 rounded-lg bg-surface-container text-xs font-semibold', 'Show hints');
          hintBtn.type = 'button';
          hintBtn.addEventListener('click', () => { hints.classList.toggle('hidden'); hintBtn.textContent = hints.classList.contains('hidden') ? 'Show hints' : 'Hide hints'; });
          card.append(hintBtn, hints);
        }
        if (exercise.solution) {
          const solution = el('pre', 'hidden overflow-x-auto whitespace-pre rounded-lg bg-surface-container-low p-3 text-xs text-on-surface', exercise.solution);
          const solutionBtn = el('button', 'px-3 py-2 rounded-lg bg-primary-fixed text-on-primary-fixed text-xs font-semibold', 'Reveal solution');
          solutionBtn.type = 'button';
          solutionBtn.addEventListener('click', () => { solution.classList.toggle('hidden'); solutionBtn.textContent = solution.classList.contains('hidden') ? 'Reveal solution' : 'Hide solution'; });
          card.append(solutionBtn, solution);
        }
        host.appendChild(card);
      });
      return;
    }

    const questions = Array.isArray(payload.questions) ? payload.questions : [];
    if (!questions.length) throw new Error('The generated response did not contain questions. Please retry.');
    const cards = [];
    questions.forEach((question, index) => {
      const card = el('article', 'rounded-xl border border-surface-container-high p-4 space-y-3');
      card.dataset.questionIndex = String(index);
      card.appendChild(el('div', 'flex items-center justify-between gap-2', 'Question ' + (index + 1)));
      if (question.topic) card.appendChild(el('p', 'text-[11px] font-semibold text-primary', question.topic));
      card.appendChild(el('p', 'text-sm font-semibold text-on-surface whitespace-pre-wrap', question.question || ''));
      if (mode === 'practice' && Array.isArray(question.options)) {
        const options = el('div', 'space-y-2');
        question.options.forEach((option, optionIndex) => {
          const label = el('label', 'flex items-start gap-2 p-3 rounded-lg bg-surface-container-low text-sm cursor-pointer');
          const input = document.createElement('input');
          input.type = 'radio';
          input.name = 'study-answer-' + index;
          input.value = String(optionIndex);
          input.className = 'mt-1 accent-current';
          label.append(input, el('span', 'text-on-surface', option));
          options.appendChild(label);
        });
        card.dataset.correctIndex = String(Number(question.answerIndex));
        card.appendChild(options);
        card.appendChild(el('div', 'hidden rounded-lg p-3 text-xs study-question-feedback'));
      } else {
        const answerInput = document.createElement('textarea');
        answerInput.rows = 2;
        answerInput.placeholder = 'Try writing your answer here (optional)…';
        answerInput.className = 'w-full rounded-lg border border-surface-container-high bg-surface p-3 text-sm';
        card.appendChild(answerInput);
        const reveal = el('button', 'px-3 py-2 rounded-lg bg-primary-fixed text-on-primary-fixed text-xs font-semibold', 'Show suggested answer');
        reveal.type = 'button';
        const answerBox = el('div', 'hidden rounded-lg bg-surface-container-low p-3 space-y-2');
        answerBox.appendChild(el('p', 'text-sm whitespace-pre-wrap', 'Answer: ' + (question.answer || 'No answer supplied.')));
        if (question.explanation) answerBox.appendChild(el('p', 'text-xs text-on-surface-variant whitespace-pre-wrap', 'Explanation: ' + question.explanation));
        reveal.addEventListener('click', () => { answerBox.classList.toggle('hidden'); reveal.textContent = answerBox.classList.contains('hidden') ? 'Show suggested answer' : 'Hide suggested answer'; });
        card.append(reveal, answerBox);
      }
      cards.push(card);
      host.appendChild(card);
    });

    if (mode === 'practice') {
      const score = el('p', 'text-sm font-semibold text-on-surface', '');
      const checkBtn = el('button', 'px-4 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold', 'Check answers');
      checkBtn.type = 'button';
      checkBtn.addEventListener('click', () => {
        let answered = 0;
        let correct = 0;
        cards.forEach((card, index) => {
          const selected = card.querySelector('input[type="radio"]:checked');
          const feedback = card.querySelector('.study-question-feedback');
          feedback.classList.remove('hidden');
          if (!selected) {
            feedback.className = 'rounded-lg p-3 text-xs study-question-feedback bg-amber-50 text-amber-900';
            feedback.textContent = 'Choose an answer to check this question.';
            return;
          }
          answered++;
          const isCorrect = Number(selected.value) === Number(card.dataset.correctIndex);
          if (isCorrect) correct++;
          const question = questions[index];
          feedback.className = 'rounded-lg p-3 text-xs study-question-feedback ' + (isCorrect ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900');
          const answerText = Array.isArray(question.options) ? question.options[Number(question.answerIndex)] : '';
          feedback.textContent = (isCorrect ? 'Correct. ' : 'Not quite. Correct answer: ' + answerText + '. ') + (question.explanation || '');
        });
        score.textContent = 'Score: ' + correct + ' / ' + questions.length + ' (' + answered + ' answered)';
      });
      host.append(checkBtn, score);
    }
  }

  async function loadSyllabusModules() {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    const user = authData?.user;
    if (!user) return;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('section')
      .eq('id', user.id)
      .maybeSingle();
    if (profileError) throw profileError;

    const section = String(profile?.section || '').trim().toUpperCase();
    if (!section) return;

    const { data: documents, error: documentError } = await supabase
      .from('knowledge_documents')
      .select('id,title,section,created_at')
      .eq('section', section)
      .eq('published', true)
      .ilike('title', '%SYLLABUS%')
      .order('created_at', { ascending: false })
      .limit(1);
    if (documentError) throw documentError;

    const document = Array.isArray(documents) ? documents[0] : null;
    if (!document) return;
    syllabusDocumentId = document.id;

    const { data: chunks, error: chunksError } = await supabase
      .from('knowledge_chunks')
      .select('content,chunk_index')
      .eq('document_id', document.id)
      .order('chunk_index', { ascending: true });
    if (chunksError) throw chunksError;

    const syllabus = (Array.isArray(chunks) ? chunks : [])
      .map((chunk) => String(chunk.content || ''))
      .join('\n');
    if (!syllabus.trim()) return;

    const subjectBlocks = syllabus.split(/(?=Subject\s+\d+\s*:)/i).filter((block) => /^Subject\s+\d+\s*:/i.test(block.trim()));
    const parsedModules = subjectBlocks.map((block) => {
      const heading = block.match(/^Subject\s+(\d+)\s*:\s*([^\n]+)/i);
      if (!heading) return null;
      const number = Number(heading[1]);
      const name = heading[2].replace(/\s*[-–—]\s*$/, '').trim();
      const units = [];
      const unitPattern = /UNIT\s+(I{1,3}|IV)\s*:\s*([\s\S]*?)(?=UNIT\s+(?:I{1,3}|IV)\s*:|$)/gi;
      let match;
      while ((match = unitPattern.exec(block)) !== null) {
        const roman = match[1].toUpperCase();
        const raw = match[2].trim();
        const title = raw.split(/\s+-\s+|\n/)[0].replace(/\s+/g, ' ').trim().replace(/[–—-]+$/, '');
        if (title) units.push({ title: `Unit ${roman}: ${title}`, status: 'From published syllabus' });
      }
      return {
        code: `SUB-${String(number).padStart(2, '0')}`,
        name,
        faculty: 'Not assigned in syllabus',
        progress: 0,
        units,
        aiTools: ['Explain a syllabus topic', 'Generate practice quiz', 'Create theory questions']
      };
    });
    // The uploaded DOCX extraction contains a repeated fragment; merge by subject number
    // and de-duplicate units so students see each syllabus subject only once.
    const moduleMap = new Map();
    for (const module of parsedModules.filter((item) => item && item.name && item.units.length)) {
      const existing = moduleMap.get(module.code);
      if (!existing) {
        moduleMap.set(module.code, module);
        continue;
      }
      for (const unit of module.units) {
        if (!existing.units.some((item) => item.title === unit.title)) existing.units.push(unit);
      }
    }
    const modules = Array.from(moduleMap.values());

    if (!modules.length) {
      console.warn('Published syllabus was found but no subject/unit headings could be parsed.');
      return;
    }

    campusData.studyModules = modules;
    if (!selectedCourseCode || !modules.some((module) => module.code === selectedCourseCode)) {
      selectedCourseCode = modules[0].code;
    }
    render();
  }

  async function loadSubjectNotes() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from('profiles').select('section').eq('id', user.id).maybeSingle();
    const section = String(profile?.section || '').trim();
    if (!section) return;

    const { data: notes, error } = await supabase
      .from('subject_notes')
      .select('id,title,content,section,subject_id,source_url,published_at,subjects:subject_id(id,name,code)')
      .eq('section', section)
      .order('published_at', { ascending: false });

    const existing = container.querySelector('#subjectNotesStudentCard');
    if (existing) existing.remove();

    const card = document.createElement('section');
    card.id = 'subjectNotesStudentCard';
    card.className = 'bg-surface-container-lowest rounded-2xl p-space-md lg:p-space-lg shadow-sm border border-primary/20';
    if (error) {
      card.innerHTML = '<div class="flex items-center gap-2"><span class="material-symbols-outlined text-error">error</span><h2 class="font-headline-md text-base font-bold">Subject Notes</h2></div><p class="text-xs text-error mt-2">Notes could not be loaded right now.</p>';
    } else {
      const rows = Array.isArray(notes) ? notes : [];
      const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
      card.innerHTML = '<div class="flex items-center justify-between gap-3"><div><div class="flex items-center gap-2"><span class="material-symbols-outlined text-primary">menu_book</span><h2 class="font-headline-md text-base font-bold">Subject Notes</h2></div><p class="text-xs text-on-surface-variant mt-1">Notes posted by faculty for Section '+esc(section)+'.</p></div><span class="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">'+rows.length+'</span></div>' +
        (rows.length ? '<div class="mt-4 grid gap-3 md:grid-cols-2">' + rows.map(n => {
          const subjectRow = Array.isArray(n.subjects) ? n.subjects[0] : n.subjects;
          const subject = subjectRow?.code ? subjectRow.code+' — '+subjectRow.name : (subjectRow?.name || 'Subject');
          const body = String(n.content || '');
          return '<article class="p-4 rounded-xl border border-surface-container-high bg-surface-container-low"><div class="flex items-start justify-between gap-2"><div><span class="text-[10px] font-bold text-primary">'+esc(subject)+'</span><h3 class="text-sm font-bold mt-1">'+esc(n.title)+'</h3></div></div><p class="text-xs text-on-surface-variant mt-2 whitespace-pre-wrap">'+esc(body)+'</p>' + (n.source_url ? '<a target="_blank" rel="noopener noreferrer" href="'+esc(n.source_url)+'" class="inline-flex items-center gap-1 mt-3 text-xs font-bold text-primary hover:underline">Open resource <span class="material-symbols-outlined text-[15px]">open_in_new</span></a>' : '') + '</article>';
        }).join('') + '</div>' : '<div class="mt-4 p-4 rounded-xl bg-surface-container-low text-xs text-on-surface-variant">No faculty notes have been posted for your section yet.</div>');
    }
    const target = container.querySelector('.max-w-\\[1720px\\]');
    if (target) target.appendChild(card);
  }
}

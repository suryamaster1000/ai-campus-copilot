// AI Assistant Page - Matches Stitch UI 100% with Full Interactivity
import { campusData } from '../data.js';
import { showToast } from '../components/toast.js';
import { supabase } from '../supabase.js';

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
            <!-- Live session history -->
            <div class="p-3 bg-surface-container-low rounded-xl">
              <div class="flex items-center gap-2 text-on-surface">
                <span class="material-symbols-outlined text-primary text-[18px]">history</span>
                <span class="font-label-md text-label-md font-semibold">Current session</span>
              </div>
              <p class="font-body-sm text-[11px] text-on-surface-variant mt-1">
                New conversations appear here while this page is open.
              </p>
            </div>            <!-- Conversation history is intentionally session-only; no demo conversations are shown. -->
          </div>

          <div class="p-space-sm m-space-sm bg-surface-container-low rounded-xl">
            <div class="flex items-start gap-space-sm">
              <span class="material-symbols-outlined text-primary text-[20px] mt-0.5">database</span>
              <div class="flex flex-col min-w-0">
                <span class="font-label-md text-label-md font-semibold text-on-surface">Live Campus Context</span>
                <span class="font-body-sm text-[11px] leading-tight text-on-surface-variant mt-0.5">
                  Answers use connected campus records only.
                </span>
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
                    Live Campus AI
                  </span>
                </div>
                <span class="font-body-sm text-body-sm text-on-surface-variant text-[12px] truncate">
                  Grounded in connected Supabase campus data and Gemini
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
            <div class="max-w-3xl mx-auto flex items-center justify-center">
              <div class="inline-flex items-center gap-2 px-3 py-2 bg-surface-container-low rounded-full text-on-surface-variant font-label-sm text-label-sm shadow-sm">
                <span class="material-symbols-outlined text-[16px] text-primary">auto_awesome</span>
                <span>No conversation data yet. Ask the Copilot about your connected campus data.</span>
              </div>
            </div>

            <div class="max-w-3xl mx-auto pt-space-xs" id="quickChipsContainer">
              <div class="flex items-center gap-1.5 mb-2 text-outline font-label-sm text-label-sm">
                <span class="material-symbols-outlined text-[16px] text-primary">assistant_navigation</span>
                <span>Suggested queries</span>
              </div>
              <div class="flex flex-wrap gap-2">
                <button class="query-chip px-3 py-1.5 rounded-full bg-surface-container hover:bg-secondary-container text-on-surface-variant font-label-md text-label-md transition-all" data-query="Show my connected academic information" type="button">Show my academic information</button>
                <button class="query-chip px-3 py-1.5 rounded-full bg-surface-container hover:bg-secondary-container text-on-surface-variant font-label-md text-label-md transition-all" data-query="What is my timetable?" type="button">What is my timetable?</button>
                <button class="query-chip px-3 py-1.5 rounded-full bg-surface-container hover:bg-secondary-container text-on-surface-variant font-label-md text-label-md transition-all" data-query="Show my attendance" type="button">Show my attendance</button>
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
                <label class="cursor-pointer p-2 rounded-xl text-outline hover:text-primary hover:bg-surface-container transition-colors flex items-center justify-center" title="Attach a TXT or Markdown note for AI context">
                  <span class="material-symbols-outlined text-[22px]">attach_file</span>
                  <input id="fileInput" class="hidden" type="file" accept=".txt,.md,text/plain,text/markdown"/>
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
                  Answers are grounded in the campus records available to the signed-in account. Verify important academic decisions with college staff.
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
              <span class="font-label-sm text-label-sm text-outline">Live academic data</span>
            </div>
            <p class="font-body-sm text-body-sm text-on-surface-variant text-[12px]">
              Direct authoritative files currently referenced in this conversation.
            </p>
          </div>          <div class="p-3 bg-surface-container-low rounded-xl">
            <div class="flex items-center gap-2 mb-1">
              <span class="material-symbols-outlined text-primary text-[18px]">database</span>
              <span class="font-label-md text-label-md font-semibold text-on-surface">Connected Data</span>
            </div>
            <p class="font-body-sm text-[11px] text-on-surface-variant leading-normal">
              The Copilot currently answers from the live campus records connected to Supabase. Empty records are not replaced with demo content.
            </p>
          </div>

          <!-- Campus Copilot Telemetry Badge -->
          <div class="mt-auto p-3 bg-surface-container-low rounded-xl">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-emerald-600 text-[18px]">verified_user</span>
              <span class="font-label-sm text-label-sm font-bold text-on-surface">Data Handling</span>
            </div>
            <p class="font-body-sm text-[11px] text-on-surface-variant mt-1 leading-normal">
              Only the data required for the requested Copilot response is sent to the configured Gemini AI service.
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
  let attachedText = '';

  // Text-note attachment
  if (fileInput) {
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files?.[0];
      if (!file) return;

      if (!/^(text\/plain|text\/markdown)$/i.test(file.type) &&
          !/\.(txt|md)$/i.test(file.name)) {
        fileInput.value = '';
        showToast('Attach a TXT or Markdown note. PDF upload is not connected to the Copilot yet.', 'error');
        return;
      }

      try {
        const text = await file.text();
        attachedText = text.slice(0, 16000).trim();

        if (!attachedText) {
          fileInput.value = '';
          showToast('The attached note is empty.', 'error');
          return;
        }

        attachmentName.textContent = file.name;
        attachmentStrip.classList.remove('hidden');
        attachmentStrip.classList.add('flex');
        showToast('Attached note ready for the next Copilot query.', 'success');
      } catch (error) {
        console.error('Attachment read failed:', error);
        fileInput.value = '';
        attachedText = '';
        showToast('Could not read that note.', 'error');
      }
    });
  }

  if (clearAttachBtn) {
    clearAttachBtn.addEventListener('click', () => {
      fileInput.value = '';
      attachedText = '';
      attachmentStrip.classList.add('hidden');
      attachmentStrip.classList.remove('flex');
    });
  }

  // Browser speech recognition
  let isRecording = false;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;

  if (micButton) {
    micButton.addEventListener('click', () => {
      if (!SpeechRecognition) {
        showToast('Voice input is not supported by this browser. You can type your query instead.', 'error');
        return;
      }

      if (isRecording) {
        recognition?.stop();
        return;
      }

      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = navigator.language || 'en-IN';

      recognition.onstart = () => {
        isRecording = true;
        micButton.classList.add('text-error', 'animate-pulse');
        micButton.title = 'Listening... Speak now';
        showToast('Listening… speak your campus query.', 'info');
      };

      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript?.trim() || '';
        if (transcript) {
          input.value = transcript;
          input.focus();
          showToast('Voice query captured.', 'success');
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition failed:', event.error);
        showToast('Voice input failed. Please try again or type your query.', 'error');
      };

      recognition.onend = () => {
        isRecording = false;
        micButton.classList.remove('text-error', 'animate-pulse');
        micButton.title = 'Voice query';
        recognition = null;
      };

      recognition.start();
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
      const confirmReset = confirm("Start a new AI Copilot conversation? This page will clear the current conversation.");
      if (confirmReset) {
        // Keep header and clear messages
        const initialHtml = `
          <div class="max-w-3xl mx-auto flex items-center justify-center">
            <div class="inline-flex items-center gap-2 px-3 py-2 bg-surface-container-low rounded-full text-on-surface-variant font-label-sm text-label-sm shadow-sm">
              <span class="material-symbols-outlined text-[16px] text-primary">auto_awesome</span>
              <span>New conversation started. Ask about your connected campus data.</span>
            </div>
          </div>
        `
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
      showToast("Export is not available until a conversation has been created.", "info");
    });
  }

  const ragBtn = document.getElementById('inspectRagBtn');
  if (ragBtn) {
    ragBtn.addEventListener('click', () => {
      showToast("RAG inspection is available to authorized administrators only.", "info");
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

  async function submitChatQuery(query) {
    const cleanQuery = String(query || '').trim();
    const attachedContext = attachedText.trim();
    if (!cleanQuery) return;

    const requestQuestion = attachedContext
      ? cleanQuery + '\n\nAttached note context:\n' + attachedContext
      : cleanQuery;

    input.value = '';
    attachedText = '';
    if (fileInput) fileInput.value = '';
    if (attachmentStrip) {
      attachmentStrip.classList.add('hidden');
      attachmentStrip.classList.remove('flex');
    }
    // Append student bubble
    const userWrapper = document.createElement('div');
    userWrapper.className = 'flex items-start justify-end gap-space-sm max-w-3xl mx-auto animate-fade-in';
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    userWrapper.innerHTML = `
      <div class="flex flex-col items-end max-w-[85%] sm:max-w-[75%]">
        <div class="bg-primary text-on-primary px-space-md py-space-sm rounded-2xl rounded-tr-none shadow-sm">
          <p class="font-body-md text-body-md leading-relaxed">${escapeHtml(cleanQuery)}</p>
        </div>
        <span class="font-label-sm text-[11px] text-outline mt-1 pr-1">${now} • Student</span>
      </div>
      <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-0.5 ring-2 ring-primary-container shadow-sm">
        <img src="assets/avatars/student.svg" alt="Student" class="w-full h-full object-cover">
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

    // Real Supabase Edge Function + Gemini response
    try {
      const { data, error } = await supabase.functions.invoke('ai-campus-copilot', {
        body: { question: requestQuestion }
      });

      const thinkingEl = document.getElementById(thinkingId);
      if (thinkingEl) thinkingEl.remove();

      if (error) throw error;
      if (!data?.answer) throw new Error(data?.error || 'AI service returned no answer.');

      const aiWrapper = document.createElement('div');
      aiWrapper.className = 'flex items-start gap-space-sm max-w-3xl mx-auto animate-fade-in';
      const sourceHtml = Array.isArray(data.sources) && data.sources.length
        ? `
          <div class="pt-2">
            <div class="p-2.5 bg-surface-container-lowest rounded-xl">
              <div class="flex items-center gap-2 mb-1">
                <span class="material-symbols-outlined text-[16px] text-primary">verified</span>
                <span class="font-label-sm text-xs font-semibold text-on-surface">Retrieved campus sources</span>
              </div>
              <div class="space-y-1">
                ${data.sources.slice(0, 3).map(source => `
                  <div class="text-[11px] text-on-surface-variant truncate">
                    ${escapeHtml(source.title || 'Campus document')}
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `
        : '';

      aiWrapper.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
          <span class="material-symbols-outlined text-[18px]">auto_awesome</span>
        </div>
        <div class="flex flex-col flex-1 min-w-0">
          <div class="bg-surface-container-low text-on-surface rounded-2xl rounded-tl-none p-space-md space-y-space-md shadow-sm">
            <p class="font-body-md text-body-md leading-relaxed whitespace-pre-wrap">${escapeHtml(data.answer)}</p>
            ${sourceHtml}
          </div>
          <div class="flex items-center justify-between mt-1 px-1">
            <span class="font-label-sm text-[11px] text-outline">${now} • AI Copilot • Grounded</span>
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
    } catch (error) {
      const thinkingEl = document.getElementById(thinkingId);
      if (thinkingEl) thinkingEl.remove();

      const status = Number(error?.status || error?.context?.status || 0);
      const message = (status === 429 || status === 503)
        ? 'The AI service is temporarily busy. Please wait a moment and try again.'
        : error?.message || 'Unable to reach the AI Campus Copilot.';
      const aiWrapper = document.createElement('div');
      aiWrapper.className = 'flex items-start gap-space-sm max-w-3xl mx-auto animate-fade-in';
      aiWrapper.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-error-container text-on-error-container flex items-center justify-center flex-shrink-0 mt-0.5">
          <span class="material-symbols-outlined text-[18px]">error</span>
        </div>
        <div class="flex flex-col flex-1 min-w-0">
          <div class="bg-error-container text-on-error-container rounded-2xl rounded-tl-none p-space-md">
            <p class="font-body-md text-body-md leading-relaxed">${escapeHtml(message)}</p>
          </div>
          <span class="font-label-sm text-[11px] text-outline mt-1 px-1">AI Copilot</span>
        </div>
      `;
      chatStream.appendChild(aiWrapper);
      chatStream.scrollTop = chatStream.scrollHeight;
      showToast(message, 'error');
    }
  }

  // If initialQuery passed (e.g. from command palette or dashboard)
  if (initialQuery) {
    submitChatQuery(initialQuery);
  }
}

function setupDelegatedButtons(container) {
  // Copy button
  container.querySelectorAll('.copy-btn').forEach(btn => {
    btn.onclick = async () => {
      const message = btn.closest('.flex.flex-col')?.querySelector('.bg-surface-container-low p')?.textContent || '';
      if (!message) return;
      try {
        await navigator.clipboard.writeText(message);
        showToast("Copied response to clipboard", "success");
      } catch {
        showToast("Could not copy the response.", "error");
      }
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
      const room = btn.getAttribute('data-room') || 'Assigned location';
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

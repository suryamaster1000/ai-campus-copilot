// Tasks & Deadlines Page
import { campusData } from '../data.js';
import { showToast } from '../components/toast.js';

export function renderTasks(container) {
  let activeTab = "All"; // "All", "todo", "in-progress", "completed"

  function render() {
    const filteredTasks = campusData.tasks.filter(t => {
      if (activeTab === "All") return true;
      return t.status === activeTab;
    });

    const pendingCount = campusData.tasks.filter(t => t.status !== 'completed').length;

    container.innerHTML = `
      <div class="max-w-[1720px] mx-auto py-space-sm space-y-space-md animate-fade-in">
        
        <!-- Header Strip -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-surface-container-high">
          <div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[24px]">task_alt</span>
              <h1 class="font-headline-md text-xl lg:text-2xl font-bold text-on-surface">My Tasks &amp; Submissions</h1>
              <span class="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-semibold">${pendingCount} Pending</span>
            </div>
            <p class="text-xs text-on-surface-variant mt-1">
              Course assignments, lab submissions, exam registrations, and administrative deadlines.
            </p>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <button id="addNewTaskBtn" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-on-primary hover:bg-tertiary-container text-xs font-semibold rounded-xl shadow-sm transition-colors">
              <span class="material-symbols-outlined text-[18px]">add</span>
              <span>Create New Task</span>
            </button>
          </div>
        </div>

        <!-- Status Filter Tabs -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1">
          ${[
            { id: 'All', label: 'All Tasks' },
            { id: 'todo', label: 'To Do' },
            { id: 'in-progress', label: 'In Progress' },
            { id: 'completed', label: 'Completed' }
          ].map(tab => `
            <button class="task-status-btn px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant'}" data-status="${tab.id}">
              ${tab.label}
            </button>
          `).join('')}
        </div>

        <!-- Task List Cards -->
        <div class="space-y-2.5">
          ${filteredTasks.length === 0 ? `
            <div class="bg-surface-container-lowest p-12 text-center rounded-2xl border border-surface-container-high">
              <span class="material-symbols-outlined text-outline text-[40px]">check_circle</span>
              <p class="font-body-md text-sm text-outline mt-2">No tasks found in this view.</p>
            </div>
          ` : filteredTasks.map(task => {
            const isCompleted = task.status === 'completed';
            return `
              <div class="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container-high flex items-center justify-between gap-space-md hover:border-primary/40 transition-all ${isCompleted ? 'opacity-70 bg-surface-container-low/40' : ''}">
                <div class="flex items-start gap-3 min-w-0">
                  <input type="checkbox" class="task-chk-toggle mt-1 h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer" data-id="${task.id}" ${isCompleted ? 'checked' : ''}/>
                  <div class="space-y-1 min-w-0">
                    <h3 class="font-headline-md text-sm font-semibold text-on-surface truncate ${isCompleted ? 'line-through text-outline' : ''}">${task.title}</h3>
                    <div class="flex items-center gap-3 text-xs text-on-surface-variant flex-wrap">
                      <span class="font-medium px-2 py-0.5 rounded bg-surface-container text-[11px]">${task.course}</span>
                      <span class="flex items-center gap-1 text-outline">
                        <span class="material-symbols-outlined text-[14px]">event</span>
                        Due ${task.dueDate}
                      </span>
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold ${task.priorityClass}">${task.priority} Priority</span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2 flex-shrink-0">
                  <button class="task-ai-assist-btn p-2 text-outline hover:text-primary hover:bg-surface-container rounded-lg transition-colors" title="Ask AI for help on this task" data-title="${task.title}">
                    <span class="material-symbols-outlined text-[18px]">auto_awesome</span>
                  </button>
                  <button class="task-delete-btn p-2 text-outline hover:text-error hover:bg-surface-container rounded-lg transition-colors" title="Delete task" data-id="${task.id}">
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

      </div>

      <!-- Add New Task Modal -->
      <div id="newTaskModal" class="fixed inset-0 z-50 hidden items-center justify-center p-4 drawer-backdrop">
        <div class="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 w-full max-w-md p-space-md space-y-4 animate-fade-in">
          <div class="flex items-center justify-between border-b border-surface-container pb-2">
            <h3 class="font-headline-md font-bold text-base text-on-surface">Add New Academic Task</h3>
            <button id="closeTaskModalBtn" class="text-outline hover:text-on-surface">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <form id="newTaskForm" class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-on-surface mb-1">Task Description</label>
              <input id="taskTitleInput" required class="w-full px-3 py-2 bg-surface-container-low rounded-xl text-xs text-on-surface outline-none border border-surface-container-high focus:border-primary" placeholder="e.g. Write BFS traversal algorithm" type="text"/>
            </div>
            <div>
              <label class="block text-xs font-semibold text-on-surface mb-1">Course / Tag</label>
              <input id="taskCourseInput" required class="w-full px-3 py-2 bg-surface-container-low rounded-xl text-xs text-on-surface outline-none border border-surface-container-high focus:border-primary" placeholder="e.g. CS-204 DSA" type="text"/>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-xs font-semibold text-on-surface mb-1">Due Date</label>
                <input id="taskDateInput" required class="w-full px-3 py-2 bg-surface-container-low rounded-xl text-xs text-on-surface outline-none border border-surface-container-high focus:border-primary" type="date"/>
              </div>
              <div>
                <label class="block text-xs font-semibold text-on-surface mb-1">Priority</label>
                <select id="taskPrioritySelect" class="w-full px-3 py-2 bg-surface-container-low rounded-xl text-xs text-on-surface outline-none border border-surface-container-high focus:border-primary">
                  <option value="High">High</option>
                  <option value="Medium" selected>Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
            <button type="submit" class="w-full py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-tertiary-container transition-colors mt-2">
              Save Task
            </button>
          </form>
        </div>
      </div>
    `;

    // Tab buttons
    container.querySelectorAll('.task-status-btn').forEach(btn => {
      btn.onclick = () => {
        activeTab = btn.getAttribute('data-status');
        render();
      };
    });

    // Checkbox toggle
    container.querySelectorAll('.task-chk-toggle').forEach(chk => {
      chk.onchange = () => {
        const id = chk.getAttribute('data-id');
        const target = campusData.tasks.find(t => t.id === id);
        if (target) {
          target.status = chk.checked ? 'completed' : 'todo';
          showToast(chk.checked ? `Task marked completed!` : `Task reopened`, 'success');
          // Dispatch event to update sidebar badge
          window.dispatchEvent(new CustomEvent('campus:tasksUpdated'));
          render();
        }
      };
    });

    // Delete task
    container.querySelectorAll('.task-delete-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const idx = campusData.tasks.findIndex(t => t.id === id);
        if (idx !== -1) {
          campusData.tasks.splice(idx, 1);
          showToast("Task deleted", "info");
          window.dispatchEvent(new CustomEvent('campus:tasksUpdated'));
          render();
        }
      };
    });

    // AI assist button
    container.querySelectorAll('.task-ai-assist-btn').forEach(btn => {
      btn.onclick = () => {
        const title = btn.getAttribute('data-title');
        window.location.hash = '#ai-assistant';
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('campus:askAi', { detail: { query: `How do I complete this task: "${title}"?` } }));
        }, 50);
      };
    });

    // Modal logic
    const modal = document.getElementById('newTaskModal');
    const addBtn = document.getElementById('addNewTaskBtn');
    const closeBtn = document.getElementById('closeTaskModalBtn');
    const form = document.getElementById('newTaskForm');

    if (addBtn && modal) {
      addBtn.onclick = () => {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      };
    }

    if (closeBtn && modal) {
      closeBtn.onclick = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      };
    }

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const title = document.getElementById('taskTitleInput').value;
        const course = document.getElementById('taskCourseInput').value;
        const date = document.getElementById('taskDateInput').value;
        const priority = document.getElementById('taskPrioritySelect').value;

        campusData.tasks.unshift({
          id: 'T-' + Date.now(),
          title,
          course,
          dueDate: date || 'Soon',
          dueBadge: 'Pending',
          priority,
          priorityClass: priority === 'High' ? 'bg-error-container text-on-error-container' : 'bg-secondary-container text-on-secondary-container',
          status: 'todo'
        });

        showToast("New task created!", "success");
        window.dispatchEvent(new CustomEvent('campus:tasksUpdated'));
        render();
      };
    }
  }

  render();
}

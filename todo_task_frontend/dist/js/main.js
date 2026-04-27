/**
 * Todo App — main.js
 * Architecture: Config → API → State → UI helpers → Render → Modal → Actions → Listeners → Init
 */

'use strict';

// ─── Config ──────────────────────────────────────────────────────────────────
const CONFIG = Object.freeze({
    API_BASE:    'http://localhost:3000/tasks',
    FILTER_MAP:  { all: () => true, active: t => !t.completed, completed: t => t.completed },
    STATUS_LABEL: {
        pending:     'Pending',
        in_progress: 'In progress',
        completed:   'Done',
    },
});

// ─── State ───────────────────────────────────────────────────────────────────
const state = {
    tasks:         [],
    currentFilter: 'all',
    editingId:     null,
};

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const DOM = {
    taskList:    document.getElementById('taskList'),
    emptyState:  document.getElementById('emptyState'),
    statsCount:  document.getElementById('statsCount'),
    filterBtns:  document.querySelectorAll('.filters__btn[data-filter]'),
    clearBtn:    document.getElementById('clearCompleted'),
    addBtn:      document.getElementById('addBtn'),
    // Modal
    modal:       document.getElementById('taskModal'),
    overlay:     document.getElementById('modalOverlay'),
    closeBtn:    document.getElementById('closeModal'),
    cancelBtn:   document.getElementById('cancelBtn'),
    saveBtn:     document.getElementById('saveTaskBtn'),
    titleInput:  document.getElementById('modalTitle'),
    descInput:   document.getElementById('modalDesc'),
    statusSelect:document.getElementById('modalStatus'),
};

// ═══════════════════════════════════════════════════════════════════════════════
// API LAYER
// ═══════════════════════════════════════════════════════════════════════════════
const api = {
    async _request(url, options = {}) {
        const res = await fetch(url, {
            headers: { 'Content-Type': 'application/json' },
            ...options,
        });
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.message || `HTTP ${res.status}`);
        }
        return res.json();
    },

    getAll()          { return this._request(CONFIG.API_BASE); },
    create(payload)   { return this._request(CONFIG.API_BASE, { method: 'POST', body: JSON.stringify(payload) }); },
    update(id, data)  { return this._request(`${CONFIG.API_BASE}/${id}`, { method: 'PUT',  body: JSON.stringify(data) }); },
    remove(id)        { return this._request(`${CONFIG.API_BASE}/${id}`, { method: 'DELETE' }); },
};

// ═══════════════════════════════════════════════════════════════════════════════
// NORMALIZE  MongoDB doc → internal shape
// ═══════════════════════════════════════════════════════════════════════════════
function normalize(doc) {
    return {
        id:          doc._id,
        title:       doc.title       || '',
        description: doc.description || '',
        completed:   doc.status === 'completed',
        status:      doc.status      || 'pending',
        createdAt:   doc.created_at  || doc.createdAt || null,
        raw:         doc,
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
function sanitize(str) {
    const el = document.createElement('div');
    el.textContent = str;
    return el.innerHTML;
}

function formatDate(raw) {
    if (!raw) return '';
    try {
        return new Date(raw).toLocaleDateString('uk-UA', { day: '2-digit', month: 'short' });
    } catch {
        return '';
    }
}

function setLoading(on) {
    DOM.addBtn.disabled  = on;
    DOM.saveBtn.disabled = on;
    DOM.addBtn.style.opacity  = on ? '0.5' : '';
    DOM.saveBtn.style.opacity = on ? '0.5' : '';
}

let _toastTimer = null;
function showToast(msg, type = 'error') {
    clearTimeout(_toastTimer);
    let toast = document.getElementById('_toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = '_toast';
        toast.style.cssText = [
            'position:fixed', 'bottom:24px', 'left:50%', 'transform:translateX(-50%)',
            'padding:10px 20px', 'border-radius:8px', 'font-size:0.8rem',
            'z-index:9999', 'transition:opacity 0.3s ease', 'font-family:"DM Mono",monospace',
            'white-space:nowrap', 'pointer-events:none',
        ].join(';');
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.background = type === 'error' ? '#ff4d6d' : '#c8f135';
    toast.style.color       = type === 'error' ? '#fff'    : '#0e0e10';
    toast.style.opacity     = '1';
    _toastTimer = setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}

// ═══════════════════════════════════════════════════════════════════════════════
// RENDER
// ═══════════════════════════════════════════════════════════════════════════════
function getVisible() {
    return state.tasks.filter(CONFIG.FILTER_MAP[state.currentFilter]);
}

function updateStats() {
    DOM.statsCount.textContent = state.tasks.filter(t => !t.completed).length;
}

function createTaskEl(task) {
    const li = document.createElement('li');
    li.className = [
        'task',
        `task--status-${task.status}`,
        task.completed ? 'task--completed' : '',
    ].filter(Boolean).join(' ');
    li.dataset.id = task.id;

    li.innerHTML = `
    <div class="task__content">
      <span class="task__title">${sanitize(task.title)}</span>
      ${task.description
        ? `<span class="task__description">${sanitize(task.description)}</span>`
        : ''}
      <div class="task__meta">
        <span class="task__status">${CONFIG.STATUS_LABEL[task.status] ?? task.status}</span>
        ${task.createdAt ? `<span class="task__date">${formatDate(task.createdAt)}</span>` : ''}
      </div>
    </div>
    <button class="task__delete" aria-label="Delete task" title="Delete">
      <span class="task__delete-icon" aria-hidden="true">×</span>
    </button>
  `;

    // Click on content → open edit modal
    li.querySelector('.task__content').addEventListener('click', () => openModal(task));

    // Delete button
    li.querySelector('.task__delete').addEventListener('click', e => {
        e.stopPropagation();
        deleteTask(task.id, li);
    });

    return li;
}

function render() {
    const visible = getVisible();
    DOM.taskList.innerHTML = '';

    const fragment = document.createDocumentFragment();
    visible.forEach(task => fragment.appendChild(createTaskEl(task)));
    DOM.taskList.appendChild(fragment);

    DOM.emptyState.classList.toggle('is-visible', visible.length === 0);
    updateStats();
}

// Show skeleton placeholders while loading
function renderSkeletons(count = 3) {
    DOM.taskList.innerHTML = Array.from({ length: count }, () => `
    <li class="task task--skeleton">
      <div class="task__content">
        <span class="task__title">loading…</span>
        <span class="task__description">fetching from server…</span>
        <div class="task__meta">
          <span class="task__status">pending</span>
        </div>
      </div>
    </li>
  `).join('');
    DOM.emptyState.classList.remove('is-visible');
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function openModal(task = null) {
    if (task) {
        state.editingId       = task.id;
        DOM.titleInput.value  = task.title;
        DOM.descInput.value   = task.description;
        DOM.statusSelect.value = task.status;
        document.getElementById('modalHeading').textContent = 'Edit Task';
    } else {
        state.editingId       = null;
        DOM.titleInput.value  = '';
        DOM.descInput.value   = '';
        DOM.statusSelect.value = 'pending';
        document.getElementById('modalHeading').textContent = 'New Task';
    }

    DOM.modal.classList.add('modal--open');
    // Trap focus
    requestAnimationFrame(() => DOM.titleInput.focus());
}

function closeModal() {
    DOM.modal.classList.remove('modal--open');
    state.editingId = null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/** Load all tasks from server */
async function loadTasks() {
    renderSkeletons();
    try {
        const data = await api.getAll();
        state.tasks = data.map(normalize);
        render();
    } catch (err) {
        showToast('Failed to load tasks — is the server running?');
        DOM.taskList.innerHTML = '';
        DOM.emptyState.classList.add('is-visible');
    }
}

/** Save (create or update) from modal */
async function saveTask() {
    const title = DOM.titleInput.value.trim();
    if (!title) {
        DOM.titleInput.focus();
        showToast('Title is required', 'error');
        return;
    }

    const payload = {
        title,
        description: DOM.descInput.value.trim(),
        status:      DOM.statusSelect.value,
    };

    setLoading(true);
    try {
        if (state.editingId) {
            // ── UPDATE
            const updated = await api.update(state.editingId, payload);
            const idx = state.tasks.findIndex(t => t.id === state.editingId);
            if (idx !== -1) state.tasks[idx] = normalize(updated);
        } else {
            // ── CREATE
            const created = await api.create(payload);
            state.tasks.unshift(normalize(created));
        }
        closeModal();
        render();
        showToast('Saved', 'success');
    } catch (err) {
        showToast(`Save failed: ${err.message}`);
    } finally {
        setLoading(false);
    }
}

/** Delete single task with animation */
function deleteTask(id, el) {
    el.classList.add('task--removing');
    el.addEventListener('animationend', async () => {
        try {
            await api.remove(id);
            state.tasks = state.tasks.filter(t => t.id !== id);
            render();
        } catch (err) {
            el.classList.remove('task--removing');
            showToast(`Delete failed: ${err.message}`);
            render();
        }
    }, { once: true });
}

/** Delete all completed tasks in parallel */
async function clearCompleted() {
    const completed = state.tasks.filter(t => t.completed);
    if (!completed.length) return;

    const els = [...DOM.taskList.querySelectorAll('.task--completed')];
    els.forEach(el => el.classList.add('task--removing'));

    if (!els[0]) return;
    els[0].addEventListener('animationend', async () => {
        setLoading(true);
        try {
            await Promise.all(completed.map(t => api.remove(t.id)));
            state.tasks = state.tasks.filter(t => !t.completed);
            render();
            showToast(`Cleared ${completed.length} tasks`, 'success');
        } catch (err) {
            showToast('Some tasks could not be deleted');
            await loadTasks();
        } finally {
            setLoading(false);
        }
    }, { once: true });
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════════════════════════════════
DOM.addBtn.addEventListener('click', () => openModal());
DOM.saveBtn.addEventListener('click', saveTask);
DOM.closeBtn.addEventListener('click', closeModal);
DOM.cancelBtn.addEventListener('click', closeModal);
DOM.clearBtn.addEventListener('click', clearCompleted);

// Click on overlay → close
DOM.overlay.addEventListener('click', closeModal);

// Escape key → close
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && DOM.modal.classList.contains('modal--open')) {
        closeModal();
    }
});

// Ctrl/Cmd + Enter → save from modal
DOM.modal.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') saveTask();
});

// Filter buttons
DOM.filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        DOM.filterBtns.forEach(b => b.classList.remove('filters__btn--active'));
        btn.classList.add('filters__btn--active');
        state.currentFilter = btn.dataset.filter;
        render();
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════════════════════
loadTasks();
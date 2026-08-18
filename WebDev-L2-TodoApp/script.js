const STORAGE_KEY = 'oibsip-todo-tasks';

const addForm = document.querySelector('[data-add-form]');
const taskInput = document.querySelector('[data-task-input]');
const pendingList = document.querySelector('[data-pending-list]');
const doneList = document.querySelector('[data-done-list]');
const pendingCountEl = document.querySelector('[data-pending-count]');
const doneCountEl = document.querySelector('[data-done-count]');
const pendingEmptyEl = document.querySelector('[data-pending-empty]');
const doneEmptyEl = document.querySelector('[data-done-empty]');
const taskTemplate = document.querySelector('[data-task-template]');

let tasks = loadTasks();
let editingId = null;

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function formatTimestamp(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' à ' +
    date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function createId() {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function addTask(text) {
  tasks.unshift({
    id: createId(),
    text,
    done: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
  });
  saveTasks();
  render();
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.done = !task.done;
  task.completedAt = task.done ? new Date().toISOString() : null;
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  if (editingId === id) editingId = null;
  saveTasks();
  render();
}

function updateTaskText(id, newText) {
  const trimmed = newText.trim();
  if (!trimmed) return;
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.text = trimmed;
  saveTasks();
}

function buildTaskElement(task) {
  const node = taskTemplate.content.cloneNode(true);
  const li = node.querySelector('.task');
  const checkBtn = node.querySelector('[data-action="toggle"]');
  const textEl = node.querySelector('[data-task-text]');
  const editInput = node.querySelector('[data-task-edit-input]');
  const timestampEl = node.querySelector('[data-task-timestamp]');
  const editBtn = node.querySelector('[data-action="edit"]');
  const deleteBtn = node.querySelector('[data-action="delete"]');

  li.dataset.id = task.id;
  li.classList.toggle('task--done', task.done);
  checkBtn.classList.toggle('is-checked', task.done);
  checkBtn.setAttribute('aria-pressed', String(task.done));

  textEl.textContent = task.text;
  editInput.value = task.text;

  timestampEl.textContent = task.done && task.completedAt
    ? `Terminée le ${formatTimestamp(task.completedAt)}`
    : `Ajoutée le ${formatTimestamp(task.createdAt)}`;

  const isEditing = editingId === task.id;
  textEl.hidden = isEditing;
  editInput.hidden = !isEditing;
  editBtn.textContent = isEditing ? 'Enregistrer' : 'Modifier';

  checkBtn.addEventListener('click', () => toggleTask(task.id));

  editBtn.addEventListener('click', () => {
    if (editingId === task.id) {
      updateTaskText(task.id, editInput.value);
      editingId = null;
      render();
    } else {
      editingId = task.id;
      render();
      const input = document.querySelector(`[data-id="${task.id}"] [data-task-edit-input]`);
      if (input) {
        input.focus();
        input.select();
      }
    }
  });

  editInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      updateTaskText(task.id, editInput.value);
      editingId = null;
      render();
    } else if (event.key === 'Escape') {
      editingId = null;
      render();
    }
  });

  deleteBtn.addEventListener('click', () => deleteTask(task.id));

  return li;
}

function render() {
  const pending = tasks.filter(t => !t.done);
  const done = tasks.filter(t => t.done);

  pendingList.innerHTML = '';
  doneList.innerHTML = '';

  pending.forEach(task => pendingList.appendChild(buildTaskElement(task)));
  done.forEach(task => doneList.appendChild(buildTaskElement(task)));

  pendingCountEl.textContent = pending.length;
  doneCountEl.textContent = done.length;

  pendingEmptyEl.hidden = pending.length !== 0;
  doneEmptyEl.hidden = done.length !== 0;
}

addForm.addEventListener('submit', event => {
  event.preventDefault();
  const value = taskInput.value.trim();
  if (!value) return;
  addTask(value);
  taskInput.value = '';
  taskInput.focus();
});

render();

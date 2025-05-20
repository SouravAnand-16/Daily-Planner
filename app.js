import { saveTasks, loadTasks } from './storage.js';

const taskInput = document.getElementById('task-input');
const taskDesc = document.getElementById('task-desc');
const dueDateInput = document.getElementById('due-date');
const addTaskBtn = document.getElementById('add-task');
const clearTaskBtn = document.getElementById('clear-task');
const searchInput = document.getElementById('search-input');
const backToTopBtn = document.getElementById('back-to-top');

const pendingList = document.getElementById('task-list-pending');
const completedList = document.getElementById('task-list-completed');
const deletedList = document.getElementById('task-list-deleted');

const themeToggleBtn = document.getElementById('toggle-theme');

themeToggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');

  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('theme', 'dark');
    themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
  } else {
    localStorage.setItem('theme', 'light');
    themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
  }
});


let currentTab = 'pending';
let tasks = loadTasks();

addTaskBtn.addEventListener('click', () => {
  const text = taskInput.value.trim();
  const description = taskDesc.value.trim();
  let dueDate = dueDateInput?.value;

  if (!text) return;

  if (!dueDate) {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    dueDate = date.toISOString();
  }

  tasks.push({ text, description, completed: false, deleted: false, dueDate });
  taskInput.value = '';
  taskDesc.value = '';
  if (dueDateInput) dueDateInput.value = '';
  renderTasks();
});

clearTaskBtn.addEventListener('click', () => {
  tasks = [];
  saveTasks(tasks);
  renderTasks();
});

searchInput.addEventListener('input', debounce((e) => {
  renderTasks(e.target.value);
}, 300));

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('scroll', throttle(() => {
  backToTopBtn.classList.toggle('hidden', window.scrollY < 300);
}, 200));

function renderTasks(filter = '') {
  pendingList.innerHTML = '';
  completedList.innerHTML = '';
  deletedList.innerHTML = '';

  const visibleTasks = tasks.filter(task =>
    task.text.toLowerCase().includes(filter.toLowerCase())
  );

  if (visibleTasks.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No tasks available';
    li.className = 'task-item';
    getListByTab(currentTab).appendChild(li);
    return;
  }

  visibleTasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.innerHTML = `
      <span class="${task.completed ? 'completed' : ''}">${task.text}</span>
      <p class="task-desc">${task.description}</p>
      ${task.dueDate ? `<div class="due-date">Expires at<br><i>${formatDueDate(task.dueDate)}</i></div>` : ''}
      <div>
        ${!task.deleted ? `
          <input type="checkbox" ${task.completed ? 'checked' : ''} data-index="${index}" class="toggle-complete"/>
          <button data-index="${index}" class="delete-task" title="Delete Task"><i class="fas fa-trash"></i></button>
        ` : `
          <button data-index="${index}" class="recover-task" title="Recover Task"><i class="fas fa-undo"></i></button>
          <button data-index="${index}" class="permanent-delete-task" title="Delete Permanently"><i class="fas fa-trash-alt"></i></button>
        `}
      </div>
    `;

    if (task.deleted) {
      deletedList.appendChild(li);
    } else if (task.completed) {
      completedList.appendChild(li);
    } else {
      pendingList.appendChild(li);
    }
  });

  attachTaskEvents();
  saveTasks(tasks);
  updateTabCounts();
  showTab(currentTab);
}

function attachTaskEvents() {
  document.querySelectorAll('.toggle-complete').forEach(el => {
    el.addEventListener('change', (e) => {
      const index = e.target.dataset.index;
      tasks[index].completed = e.target.checked;
      renderTasks(searchInput.value);
    });
  });

  document.querySelectorAll('.delete-task').forEach(el => {
    el.addEventListener('click', (e) => {
      const index = e.target.closest('button').dataset.index;
      tasks[index].deleted = true;
      tasks[index].completed = false;
      renderTasks(searchInput.value);
    });
  });

  document.querySelectorAll('.recover-task').forEach(el => {
    el.addEventListener('click', (e) => {
      const index = e.target.closest('button').dataset.index;
      tasks[index].deleted = false;
      renderTasks(searchInput.value);
    });
  });

  document.querySelectorAll('.permanent-delete-task').forEach(el => {
    el.addEventListener('click', (e) => {
      const index = e.target.closest('button').dataset.index;
      tasks.splice(index, 1);
      renderTasks(searchInput.value);
    });
  });
}

  
window.showTab = function showTab(tabName) {
  currentTab = tabName;
  document.getElementById('task-list-pending').style.display = tabName === 'pending' ? 'block' : 'none';
  document.getElementById('task-list-completed').style.display = tabName === 'completed' ? 'block' : 'none';
  document.getElementById('task-list-deleted').style.display = tabName === 'deleted' ? 'block' : 'none';

  document.querySelectorAll('.tabs button').forEach(btn => {
    btn.classList.remove('active-pending', 'active-completed', 'active-deleted');
  });
  document.querySelector(`.tabs button[onclick*="${tabName}"]`).classList.add(`active-${tabName}`);
}

function getListByTab(tab) {
  if (tab === 'completed') return completedList;
  if (tab === 'deleted') return deletedList;
  return pendingList;
}
function updateTabCounts() {
    const pendingCount = tasks.filter(task => !task.completed && !task.deleted).length;
    const completedCount = tasks.filter(task => task.completed && !task.deleted).length;
    const deletedCount = tasks.filter(task => task.deleted).length;
  
    document.getElementById('pending-count').textContent = pendingCount;
    document.getElementById('completed-count').textContent = completedCount;
    document.getElementById('deleted-count').textContent = deletedCount;
  }
  

function formatDueDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString();
}

function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
      themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    } else {
      themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
    }
  });
  

renderTasks();

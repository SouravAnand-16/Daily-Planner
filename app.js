import { saveTasks, loadTasks } from './storage.js';

const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task');
const clearTaskBtn = document.getElementById('clear-task');
const searchInput = document.getElementById('search-input');

const pendingList = document.getElementById('task-list-pending');
const completedList = document.getElementById('task-list-completed');
const deletedList = document.getElementById('task-list-deleted');
const taskDesc = document.getElementById('task-desc');

let tasks = loadTasks();

clearTaskBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to clear all tasks?")) {
      tasks = [];
      localStorage.removeItem('tasks');
      renderTasks();
    }
  });

addTaskBtn.addEventListener('click', () => {
  let desc = taskDesc.value.trim();
  const words = desc.split(/\s+/).slice(0, 5);
  desc = words.join(' ');

  const taskNumber = tasks.length + 1;
  const text = taskInput.value.trim() || `plan-${taskNumber}`;
  tasks.push({ text, description: desc, completed: false, deleted: false });
  taskInput.value = '';
  taskDesc.value = '';
  saveTasks(tasks);
  renderTasks();
});

searchInput.addEventListener('input', (e) => {
  const filter = e.target.value.trim();
  renderTasks(filter);
});

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('toggle-complete')) {
    const index = e.target.dataset.index;
    tasks[index].completed = !tasks[index].completed;
    renderTasks(searchInput.value.trim());
  }

  if (e.target.classList.contains('delete-task')) {
    const index = e.target.dataset.index;
    tasks[index].deleted = true;
    renderTasks(searchInput.value.trim());
  }

  if (e.target.classList.contains('recover-task')) {
    const index = e.target.dataset.index;
    tasks[index].deleted = false;
    renderTasks(searchInput.value.trim());
  }

  if (e.target.closest('.permanent-delete-task')) {
    const index = e.target.closest('.permanent-delete-task').dataset.index;
    tasks.splice(index, 1);
    saveTasks(tasks);
    renderTasks(searchInput.value.trim());
  }
  
  
});

function renderTasks(filter = "") {
    pendingList.innerHTML = '';
    completedList.innerHTML = '';
    deletedList.innerHTML = '';
  
    tasks
      .filter(task => task.text.toLowerCase().includes(filter.toLowerCase()))
      .forEach((task, index) => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = `
          <span class="${task.completed ? 'completed' : ''}">${task.text}</span>
            <p class="task-desc">${task.description}</p>
          <div>
            ${!task.deleted
              ? `
                <input type="checkbox" ${task.completed ? 'checked' : ''} data-index="${index}" class="toggle-complete"/>
                <button data-index="${index}" class="delete-task" title="Delete Task">
                <i class="fas fa-trash"></i>
                </button>
              `
              : `
                <button data-index="${index}" class="recover-task" title="Recover Task">
                <i class="fas fa-undo"></i>
                </button>
                <button data-index="${index}" class="permanent-delete-task" title="Delete Permanently">
                <i class="fas fa-trash-alt"></i>
                </button>
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
  
    saveTasks(tasks);
  }
  

window.showTab = function(tab) {
    document.querySelectorAll('.task-list-section').forEach(section => {
      section.style.display = 'none';
    });
    document.getElementById(`task-list-${tab}`).style.display = 'block';
  
    document.querySelectorAll('.tabs button').forEach(btn => {
      btn.classList.remove('active-pending', 'active-completed', 'active-deleted');
    });
  
    const activeBtn = document.querySelector(`.tabs button[onclick="showTab('${tab}')"]`);
    activeBtn.classList.add(`active-${tab}`);
  };
  

document.addEventListener('DOMContentLoaded', () => {
  renderTasks();
  showTab('pending'); 
});

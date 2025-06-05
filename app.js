class TaskManager {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.taskIdCounter = 1;
        this.initializeElements();
        this.attachEventListeners();
        this.loadDemoTasks();
        this.updateDisplay();
    }

    initializeElements() {
        this.taskInput = document.getElementById('taskInput');
        this.addBtn = document.getElementById('addBtn');
        this.taskList = document.getElementById('taskList');
        this.emptyState = document.getElementById('emptyState');
        this.totalTasks = document.getElementById('totalTasks');
        this.pendingTasks = document.getElementById('pendingTasks');
        this.completedTasks = document.getElementById('completedTasks');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.completeAllBtn = document.getElementById('completeAllBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.charCounter = document.getElementById('charCounter');
        this.errorMessage = document.getElementById('errorMessage');
        this.filterBtns = document.querySelectorAll('.filter-btn');
    }

    attachEventListeners() {
        this.addBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        this.taskInput.addEventListener('input', () => this.updateCharCounter());
        this.completeAllBtn.addEventListener('click', () => this.completeAllTasks());
        this.clearBtn.addEventListener('click', () => this.clearCompletedTasks());
        
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });
    }

    loadDemoTasks() {
        const demoTasks = [
            { text: "Review project proposal and provide feedback", completed: false },
            { text: "Schedule team meeting for next week", completed: true },
            { text: "Update website content and fix broken links", completed: false },
            { text: "Prepare presentation for client meeting", completed: false },
            { text: "Complete quarterly budget analysis", completed: true }
        ];

        demoTasks.forEach(task => {
            this.tasks.push({
                id: this.taskIdCounter++,
                text: task.text,
                completed: task.completed,
                createdAt: new Date()
            });
        });
    }

    updateCharCounter() {
        const length = this.taskInput.value.length;
        const maxLength = 150;
        this.charCounter.textContent = `${length}/${maxLength}`;
        
        this.charCounter.className = 'char-counter';
        if (length > maxLength * 0.8) {
            this.charCounter.classList.add('warning');
        }
        if (length > maxLength * 0.95) {
            this.charCounter.classList.add('danger');
        }

        this.addBtn.disabled = length === 0;
    }

    addTask() {
        const text = this.taskInput.value.trim();
        
        if (!text) {
            this.showError('Please enter a task description');
            return;
        }

        if (text.length > 150) {
            this.showError('Task description is too long (max 150 characters)');
            return;
        }

        const task = {
            id: this.taskIdCounter++,
            text: text,
            completed: false,
            createdAt: new Date()
        };

        this.tasks.unshift(task);
        this.taskInput.value = '';
        this.updateCharCounter();
        this.hideError();
        this.updateDisplay();
        
 
        setTimeout(() => {
            const newTaskElement = this.taskList.querySelector('.task-item');
            if (newTaskElement) {
                newTaskElement.classList.add('adding');
            }
        }, 10);
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.add('show');
        this.taskInput.classList.add('error');
        
        setTimeout(() => {
            this.hideError();
        }, 3000);
    }

    hideError() {
        this.errorMessage.classList.remove('show');
        this.taskInput.classList.remove('error');
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.updateDisplay();
        }
    }

    deleteTask(id) {
        const taskElement = document.querySelector(`[data-task-id="${id}"]`);
        if (taskElement) {
            taskElement.classList.add('removing');
            setTimeout(() => {
                this.tasks = this.tasks.filter(t => t.id !== id);
                this.updateDisplay();
            }, 300);
        }
    }

    completeAllTasks() {
        this.tasks.forEach(task => {
            if (!task.completed) {
                task.completed = true;
            }
        });
        this.updateDisplay();
    }

    clearCompletedTasks() {
        this.tasks = this.tasks.filter(task => !task.completed);
        this.updateDisplay();
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.updateDisplay();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        this.totalTasks.textContent = total;
        this.pendingTasks.textContent = pending;
        this.completedTasks.textContent = completed;
        this.progressFill.style.width = `${progress}%`;
        this.progressText.textContent = `${progress}% Complete`;

        // Update button states
        this.completeAllBtn.disabled = pending === 0;
        this.clearBtn.disabled = completed === 0;
    }

    renderTasks() {
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            this.taskList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🎯</div>
                    <h3>${this.currentFilter === 'all' ? 'Ready to get productive?' : `No ${this.currentFilter} tasks`}</h3>
                    <p>${this.currentFilter === 'all' ? 'Add your first task above and start organizing your day with purpose and clarity.' : `You have no ${this.currentFilter} tasks at the moment.`}</p>
                </div>
            `;
            return;
        }

        this.taskList.innerHTML = filteredTasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : 'pending'}" data-task-id="${task.id}">
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    ${task.completed ? 'checked' : ''}
                    onchange="taskManager.toggleTask(${task.id})"
                >
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <span class="task-status ${task.completed ? 'completed' : 'pending'}">
                    ${task.completed ? 'Done' : 'Pending'}
                </span>
                <button class="delete-btn" onclick="taskManager.deleteTask(${task.id})">
                    Delete
                </button>
            </div>
        `).join('');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    updateDisplay() {
        this.updateStats();
        this.renderTasks();
    }
}


let taskManager;
document.addEventListener('DOMContentLoaded', () => {
    taskManager = new TaskManager();
});

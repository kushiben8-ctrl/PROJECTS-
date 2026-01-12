class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.initElements();
        this.bindEvents();
        this.render();
    }

    initElements() {
        this.elements = {
            form: document.getElementById('todoForm'),
            taskInput: document.getElementById('taskInput'),
            taskList: document.getElementById('taskList'),
            searchInput: document.getElementById('searchInput'),
            filterBtns: document.querySelectorAll('.tab-btn'),
            clearDone: document.getElementById('clearDone'),
            exportBtn: document.getElementById('exportBtn'),
            liveCount: document.getElementById('liveCount'),
            totalTasks: document.getElementById('totalTasks'),
            pendingTasks: document.getElementById('pendingTasks'),
            overdueTasks: document.getElementById('overdueTasks'),
            emptyState: document.getElementById('emptyState'),
            quickBtns: document.querySelectorAll('.quick-btn')
        };
    }

    bindEvents() {
        this.elements.form.addEventListener('submit', (e) => this.addTask(e));
        this.elements.searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.render();
        });
        this.elements.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });
        this.elements.clearDone.addEventListener('click', () => this.clearCompleted());
        this.elements.exportBtn.addEventListener('click', () => this.exportTasks());
        this.elements.quickBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.quickAdd(e.target.dataset.priority));
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.metaKey && e.key === 'Enter') this.elements.form.requestSubmit();
            if (e.metaKey && e.key === 'k') this.elements.searchInput.focus();
            if (e.key === 'Delete') this.deleteSelected();
        });

        // Drag & drop
        this.elements.taskList.addEventListener('dragover', (e) => e.preventDefault());
        this.elements.taskList.addEventListener('drop', (e) => this.handleDrop(e));
    }

    getToday() {
        return new Date().toISOString().split('T')[0];
    }

    isOverdue(task) {
        return !task.completed && task.dueDate < this.getToday();
    }

    getFilteredTasks() {
        let filtered = this.tasks.filter(task => 
            task.text.toLowerCase().includes(this.searchTerm)
        );

        switch(this.currentFilter) {
            case 'today':
                filtered = filtered.filter(t => t.dueDate === this.getToday());
                break;
            case 'pending':
                filtered = filtered.filter(t => !t.completed);
                break;
            case 'completed':
                filtered = filtered.filter(t => t.completed);
                break;
            case 'overdue':
                filtered = filtered.filter(t => this.isOverdue(t));
                break;
        }

        return filtered.sort((a, b) => {
            if (a.priority !== b.priority) return b.priority.localeCompare(a.priority);
            if (a.completed !== b.completed) return b.completed - a.completed ? 1 : -1;
            return new Date(b.created) - new Date(a.created);
        });
    }

    addTask(e) {
        e.preventDefault();
        const text = this.elements.taskInput.value.trim();
        if (!text) return;

        const task = {
            id: Date.now(),
            text,
            priority: 'medium',
            category: 'personal',
            completed: false,
            created: new Date().toISOString(),
            dueDate: this.getToday()
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.elements.taskInput.value = '';
        this.render();
        this.elements.taskInput.focus();
    }

    quickAdd(priority) {
        this.elements.taskInput.value = `${priority === 'high' ? 'URGENT: ' : ''}Quick task`;
        this.elements.priority = priority;
        setTimeout(() => this.elements.form.requestSubmit(), 50);
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    deleteTask(id) {
        if (confirm('Delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveTasks();
            this.render();
        }
    }

    clearCompleted() {
        if (this.tasks.some(t => t.completed) && confirm('Clear all completed tasks?')) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveTasks();
            this.render();
        }
    }

    exportTasks() {
        const dataStr = JSON.stringify(this.tasks, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `tasks-${new Date().toISOString().split('T')[0]}.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    setFilter(filter) {
        this.currentFilter = filter;
        document.querySelector('.tab-btn.active')?.classList.remove('active');
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        this.render();
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    updateStats() {
        const total = this.tasks.length;
        const pending = this.tasks.filter(t => !t.completed).length;
        const overdue = this.tasks.filter(t => this.isOverdue(t)).length;

        this.elements.totalTasks.textContent = total;
        this.elements.pendingTasks.textContent = pending;
        this.elements.overdueTasks.textContent = overdue;
        this.elements.liveCount.textContent = `${total} tasks`;
    }

    render() {
        const tasks = this.getFilteredTasks();
        this.elements.taskList.innerHTML = tasks.length === 0 
            ? '<div class="empty-state" id="emptyState"><div class="empty-icon">✨</div><h3>No tasks match your filter</h3><p>Try adjusting search or filters</p></div>'
            : tasks.map(task => this.createTaskHTML(task)).join('');

        this.updateStats();
        this.makeDraggable();
    }

    createTaskHTML(task) {
        const isOverdue = this.isOverdue(task);
        const priorityIcon = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢';
        
        return `
            <div class="task priority-${task.priority} ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}"
                 draggable="true" data-id="${task.id}" ondblclick="app.editTask(${task.id})">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="app.toggleTask(${task.id})">
                <div class="task-content">
                    <div class="task-text" contenteditable="${!task.completed}" 
                         onblur="app.updateTaskText(${task.id}, this.textContent.trim())">${task.text}</div>
                    <div class="task-meta">
                        <span class="task-priority">${priorityIcon} ${task.priority}</span>
                        <span class="task-category category-${task.category}">${task.category}</span>
                        <span class="task-date">${task.dueDate}</span>
                        ${isOverdue ? '<span class="overdue-badge">⚠️ Overdue</span>' : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="action-icon edit-icon" onclick="app.editTask(${task.id})" ${task.completed ? 'disabled' : ''}>✏️</button>
                    <button class="action-icon delete-icon" onclick="app.deleteTask(${task.id})">🗑️</button>
                </div>
            </div>
        `;
    }

    makeDraggable() {
        const tasks = document.querySelectorAll('.task');
        tasks.forEach(task => {
            task.addEventListener('dragstart', (e) => {
                e.target.classList.add('dragging');
                e.dataTransfer.setData('text/plain', task.dataset.id);
            });
            task.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
            });
        });
    }

    handleDrop(e) {
        e.preventDefault();
        const draggedId = parseInt(e.dataTransfer.getData('text/plain'));
        const draggedTask = this.tasks.find(t => t.id === draggedId);
        const afterElement = this.getDragAfterElement(e.clientY);
        const newIndex = afterElement ? 
            this.tasks.findIndex(t => t.id === parseInt(afterElement.dataset.id)) : 
            this.tasks.length;

        this.tasks.splice(this.tasks.indexOf(draggedTask), 1);
        this.tasks.splice(newIndex, 0, draggedTask);
        this.saveTasks();
        this.render();
    }

    getDragAfterElement(y) {
        const draggableElements = [...document.querySelectorAll('.task:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            }
            return closest;
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    updateTaskText(id, text) {
        const task = this.tasks.find(t => t.id === id);
        if (task && text) task.text = text;
        this.saveTasks();
        this.render();
    }
}

// Global app instance
const app = new TodoApp();

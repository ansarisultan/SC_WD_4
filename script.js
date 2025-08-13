document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const taskInput = document.getElementById('task-input');
    const taskDatetime = document.getElementById('task-datetime');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    
    // Initialize the app
    function init() {
        renderTasks();
        addTaskBtn.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTask();
        });
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                renderTasks();
            });
        });
    }
    
    // Add a new task
    function addTask() {
        const taskText = taskInput.value.trim();
        const taskDue = taskDatetime.value;
        
        if (!taskText) return;
        
        const newTask = {
            id: Date.now(),
            text: taskText,
            due: taskDue,
            completed: false
        };
        
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        
        // Reset input
        taskInput.value = '';
        taskDatetime.value = '';
    }
    
    // Render tasks based on filter
    function renderTasks() {
        taskList.innerHTML = '';
        
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'all') return true;
            if (currentFilter === 'pending') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
        });
        
        if (filteredTasks.length === 0) {
            taskList.innerHTML = `<p class="no-tasks">No tasks found.</p>`;
            return;
        }
        
        filteredTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = 'task-item';
            taskItem.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                <span class="task-due">${formatDueDate(task.due)}</span>
                <div class="task-actions">
                    <button class="edit-btn">✏️</button>
                    <button class="delete-btn">🗑️</button>
                </div>
            `;
            
            const checkbox = taskItem.querySelector('.task-checkbox');
            const editBtn = taskItem.querySelector('.edit-btn');
            const deleteBtn = taskItem.querySelector('.delete-btn');
            
            checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));
            editBtn.addEventListener('click', () => openEditModal(task.id));
            deleteBtn.addEventListener('click', () => deleteTask(task.id));
            
            taskList.appendChild(taskItem);
        });
    }
    
    // Toggle task completion
    function toggleTaskCompletion(id) {
        tasks = tasks.map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        saveTasks();
        renderTasks();
    }
    
    // Delete a task
    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    }
    
    // Open edit modal
    function openEditModal(id) {
        const task = tasks.find(task => task.id === id);
        if (!task) return;
        
        const modal = document.createElement('div');
        modal.className = 'edit-modal';
        modal.innerHTML = `
            <div class="edit-modal-content">
                <h2>Edit Task</h2>
                <input type="text" id="edit-task-text" value="${task.text}">
                <input type="datetime-local" id="edit-task-datetime" value="${task.due}">
                <div class="edit-modal-actions">
                    <button id="save-edit-btn">Save</button>
                    <button id="cancel-edit-btn">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'flex';
        
        const saveBtn = document.getElementById('save-edit-btn');
        const cancelBtn = document.getElementById('cancel-edit-btn');
        
        saveBtn.addEventListener('click', () => {
            const newText = document.getElementById('edit-task-text').value.trim();
            const newDue = document.getElementById('edit-task-datetime').value;
            
            if (newText) {
                tasks = tasks.map(t => 
                    t.id === id ? { ...t, text: newText, due: newDue } : t
                );
                saveTasks();
                renderTasks();
            }
            
            document.body.removeChild(modal);
        });
        
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }
    
    // Format due date
    function formatDueDate(due) {
        if (!due) return '';
        const date = new Date(due);
        return date.toLocaleString();
    }
    
    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Initialize the app
    init();
});
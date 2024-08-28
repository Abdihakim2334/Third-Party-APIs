// Initialize task list
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];

// Function to generate a unique task id
function generateTaskId() {
  return `task-${Date.now()}`;
}

// Function to create a task card
function createTaskCard(task) {
  const card = $(`<div class="task-card card mb-3" data-task-id="${task.id}" draggable="true">`);
  
  card.append(`<div class="card-body">`);
  card.append(`<h5 class="card-title">${task.title}</h5>`);
  card.append(`<p class="card-text">${task.description}</p>`);
  
  // Format due date using day.js
  const formattedDate = task.dueDate ? dayjs(task.dueDate).format('YYYY-MM-DD') : '';
  const dueDateField = $(`<input type="date" name="due-date" value="${formattedDate}" readonly>`);
  card.append(dueDateField);
  
  // Add color coding based on due date
  const dueDate = dayjs(task.dueDate);
  if (dueDate.isBefore(dayjs(), 'day')) {
    card.addClass('bg-danger text-white');
  } else if (dueDate.isBefore(dayjs().add(3, 'day'), 'day')) {
    card.addClass('bg-warning text-dark');
  }
  
  // Add delete button
  const deleteButton = $('<button class="btn btn-danger btn-sm mt-2">Delete</button>');
  deleteButton.on('click', () => handleDeleteTask(task.id));
  card.append(deleteButton);
  
  return card;
}

// Function to render the task list
function renderTaskList() {
  console.log('Rendering task list...');
  const lanes = {
    'To Do': $('#task-list-container'),
    'In Progress': $('#in-progress-cards'),
    'Done': $('#done-cards')
  };
  
  // Clear existing tasks
  Object.values(lanes).forEach(container => container.empty());
  
  taskList.forEach(task => {
    const card = createTaskCard(task);
    const container = lanes[task.status];
    if (container) {
      container.append(card);
    }
  });
  
  // Make lanes droppable
  $('.lane').droppable({
    accept: '.task-card',
    drop: handleDrop
  });
  
  // Initialize draggable functionality
  $('.task-card').draggable({
    revert: 'invalid',
    start: function(event, ui) {
      $(this).addClass('dragging');
    },
    stop: function(event, ui) {
      $(this).removeClass('dragging');
    }
  });
}

// Function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();
  
  const title = $('#taskTitle').val();
  const dueDate = $('#due-date-input').val();
  const description = $('#task-description-input').val();
  
  // Validate and format date with day.js
  const formattedDate = dayjs(dueDate).isValid() ? dayjs(dueDate).format('YYYY-MM-DD') : null;
  
  const newTask = {
    id: generateTaskId(),
    title,
    description,
    dueDate: formattedDate,
    status: 'To Do' 
  };
  
  taskList.push(newTask);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  
  renderTaskList();
  
  // Clear input fields and close the modal
  $('#taskTitle').val('');
  $('#task-description-input').val('');
  $('#due-date-input').val('');
  $('#taskModal').modal('hide');
}

// Function to handle deleting a task
function handleDeleteTask(taskId) {
  taskList = taskList.filter(task => task.id !== taskId);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const draggedCard = ui.draggable;
  const lane = $(event.target).closest('.lane');
  const laneName = lane.find('.card-header h2').text();
  
  const taskId = draggedCard.data('task-id');
  const draggedTask = taskList.find(task => task.id === taskId);
  
  if (draggedTask) {
    draggedTask.status = laneName;
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
  }
}

// When the page loads, render the task list and add event listeners
$(document).ready(function () {
  console.log('Document ready');
  renderTaskList();
  
  // Add event listeners for form submission
  $('#add-task-form').on('submit', handleAddTask);
});

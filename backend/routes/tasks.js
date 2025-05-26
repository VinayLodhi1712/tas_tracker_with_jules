const express = require('express');
const router = express.Router();

// In-memory storage (replace with MongoDB in production)
let tasks = [
  {
    id: 1,
    title: 'Welcome to TaskMaster!',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ["getting started", "tutorial"],
    dueDate: null,
    reminderDate: null
  },
  {
    id: 2,
    title: 'Click the circle to mark tasks as complete',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ["ui", "tutorial"],
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Due in 3 days
    reminderDate: null
  },
  {
    id: 3,
    title: 'Delete tasks you no longer need',
    completed: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ["core feature"],
    dueDate: null,
    reminderDate: null
  }
];

// Utility function to find task by ID (expects id to be a number)
const findTaskById = (id) => {
  return tasks.find(task => task.id === id);
};

// Get all tasks
router.get('/', (req, res) => {
  try {
    // Optional query parameters for filtering, searching, sorting, and pagination
    const { completed, limit, sort, tag, search } = req.query;
    
    let filteredTasks = [...tasks]; // Start with a copy of all tasks
    
    // 1. Filter by completion status
    if (completed !== undefined) {
      const isCompleted = completed === 'true';
      filteredTasks = filteredTasks.filter(task => task.completed === isCompleted);
    }

    // 2. Filter by tag
    if (tag && tag.trim() !== '') {
      const tagName = tag.trim();
      filteredTasks = filteredTasks.filter(task => task.tags && task.tags.includes(tagName));
    }

    // 3. Filter by search term (applies to title, description, and tags)
    if (search && search.trim() !== '') {
      const searchTerm = search.trim().toLowerCase();
      filteredTasks = filteredTasks.filter(task => {
        const titleMatch = task.title.toLowerCase().includes(searchTerm);
        // Ensure description exists before trying to search it
        const descriptionMatch = task.description && task.description.toLowerCase().includes(searchTerm);
        // Ensure tags exist and is an array before trying to search
        const tagsMatch = Array.isArray(task.tags) && task.tags.some(t => String(t).toLowerCase().includes(searchTerm));
        return titleMatch || descriptionMatch || tagsMatch;
      });
    }
    
    // 4. Sort tasks
    if (sort) {
      switch (sort) {
        case 'newest':
          filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'oldest':
          filteredTasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          break;
        case 'alphabetical':
          filteredTasks.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'dueDateAsc':
          filteredTasks.sort((a, b) => {
            if (!a.dueDate) return 1; // Tasks without due dates go last
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
          });
          break;
        case 'dueDateDesc':
          filteredTasks.sort((a, b) => {
            if (!a.dueDate) return 1; // Tasks without due dates go last
            if (!b.dueDate) return -1;
            return new Date(b.dueDate) - new Date(a.dueDate);
          });
          break;
        default:
          // Optional: handle unknown sort parameters, or just ignore
          break;
      }
    }
    
    // 5. Limit results
    if (limit && !isNaN(parseInt(limit)) && parseInt(limit) > 0) {
      filteredTasks = filteredTasks.slice(0, parseInt(limit));
    }
    
    res.json(filteredTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific task by ID
router.get('/:id', (req, res) => {
  try {
    const numericId = parseInt(req.params.id);
    if (isNaN(numericId)) {
      return res.status(400).json({ error: 'Task ID must be a valid number' });
    }

    const task = findTaskById(numericId); // Use the parsed numericId

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    console.error(`Error fetching task with id ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new task
router.post('/', (req, res) => {
  try {
    const { title, description, tags, dueDate, reminderDate } = req.body;
    
    // Validation
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    if (title.length > 200) {
      return res.status(400).json({ error: 'Title must be less than 200 characters' });
    }
    
    // Create new task
    const newTask = {
      id: Date.now(), // In production, use UUID or MongoDB ObjectId
      title: title.trim(),
      description: description ? description.trim() : '',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: Array.isArray(tags) ? tags.map(t => String(t).trim()) : [],
      dueDate: dueDate || null,
      reminderDate: reminderDate || null
    };
    
    tasks.push(newTask);
    
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a task
router.put('/:id', (req, res) => {
  try {
    const numericId = parseInt(req.params.id);
    if (isNaN(numericId)) {
      return res.status(400).json({ error: 'Task ID must be a valid number' });
    }

    const task = findTaskById(numericId); // Use the parsed numericId
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const { title, description, completed, tags, dueDate, reminderDate } = req.body;
    
    // Validation
    if (title !== undefined) {
      if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'Title cannot be empty' });
      }
      if (title.length > 200) {
        return res.status(400).json({ error: 'Title must be less than 200 characters' });
      }
      task.title = title.trim();
    }
    
    if (description !== undefined) {
      task.description = description ? description.trim() : '';
    }
    
    if (completed !== undefined) {
      task.completed = Boolean(completed);
    }

    if (tags !== undefined) {
      if (!Array.isArray(tags)) {
        return res.status(400).json({ error: 'Tags must be an array of strings' });
      }
      task.tags = tags.map(t => String(t).trim());
    }

    if (dueDate !== undefined) { // Allow setting dueDate to null
      task.dueDate = dueDate;
    }

    if (reminderDate !== undefined) { // Allow setting reminderDate to null
      task.reminderDate = reminderDate;
    }
    
    task.updatedAt = new Date().toISOString();
    
    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle task completion status
router.patch('/:id/toggle', (req, res) => {
  try {
    const numericId = parseInt(req.params.id);
    if (isNaN(numericId)) {
      return res.status(400).json({ error: 'Task ID must be a valid number' });
    }

    const task = findTaskById(numericId); // Use the parsed numericId
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    task.completed = !task.completed;
    task.updatedAt = new Date().toISOString();
    
    res.json(task);
  } catch (error) {
    console.error('Error toggling task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete all completed tasks (MUST come before /:id route)
router.delete('/completed/all', (req, res) => {
  try {
    const completedTasks = tasks.filter(task => task.completed);
    tasks = tasks.filter(task => !task.completed);
    
    res.json({ 
      message: `${completedTasks.length} completed tasks deleted successfully`,
      deletedCount: completedTasks.length 
    });
  } catch (error) {
    console.error('Error deleting completed tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a task
router.delete('/:id', (req, res) => {
  try {
    const numericId = parseInt(req.params.id);
    if (isNaN(numericId)) {
      return res.status(400).json({ error: 'Task ID must be a valid number' });
    }

    const taskIndex = tasks.findIndex(task => task.id === numericId); // Use numericId here
    
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const deletedTask = tasks.splice(taskIndex, 1)[0];
    
    res.json({ 
      message: 'Task deleted successfully',
      deletedTask 
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();

// In-memory storage (replace with MongoDB in production)
let tasks = [
  {
    id: 1,
    title: 'Welcome to TaskMaster!',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Click the circle to mark tasks as complete',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Delete tasks you no longer need',
    completed: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Utility function to find task by ID
const findTaskById = (id) => {
  return tasks.find(task => task.id === parseInt(id));
};

// Get all tasks
router.get('/', (req, res) => {
  try {
    // Optional query parameters for filtering
    const { completed, limit, sort } = req.query;
    
    let filteredTasks = [...tasks];
    
    // Filter by completion status
    if (completed !== undefined) {
      const isCompleted = completed === 'true';
      filteredTasks = filteredTasks.filter(task => task.completed === isCompleted);
    }
    
    // Sort tasks
    if (sort === 'newest') {
      filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === 'oldest') {
      filteredTasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sort === 'alphabetical') {
      filteredTasks.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    // Limit results
    if (limit && !isNaN(limit)) {
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

    const task = findTaskById(req.params.id); // findTaskById does its own parseInt

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
    const { title, description } = req.body;
    
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
      updatedAt: new Date().toISOString()
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

    const task = findTaskById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const { title, description, completed } = req.body;
    
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

    const task = findTaskById(req.params.id);
    
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
// backend/tests/tasks.test.js
const request = require('supertest');
// Assuming your express app is configured in app.js and tasks router is used there.
// If tasks.js is your main app file, you might need to modify it to export the app
// without starting the server, e.g., module.exports = app;
// For this example, let's assume an app.js that sets up Express and uses the tasks router.
// You would need to create a minimal app.js for testing if tasks.js is only a router.

// --- Create a minimal app.js for testing if you don't have one ---
// Example app.js (save as backend/app.js or similar)
/*
const express = require('express');
const tasksRouter = require('./routes/tasks'); // Adjust path if needed
const app = express();
app.use(express.json());
app.use('/api/tasks', tasksRouter);
module.exports = app;
*/
// --- End of example app.js ---

// Require the app (assuming backend/app.js exists as described above)
const app = require('../app'); // Adjust path to your Express app file

describe('Tasks API', () => {
  let initialTasksCount;
  let testTask; // To store a task created during tests

  beforeAll(async () => {
    // Get initial tasks to compare counts later
    const res = await request(app).get('/api/tasks');
    initialTasksCount = res.body.length;
  });

  describe('POST /api/tasks (Create Task)', () => {
    it('should create a new task without tags or due date', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task 1' });
      expect(res.statusCode).toEqual(201);
      expect(res.body.title).toBe('Test Task 1');
      expect(res.body.tags).toEqual([]);
      expect(res.body.dueDate).toBeNull();
      testTask = res.body; // Save for later tests
    });

    it('should create a new task with tags and due date', async () => {
      const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 3 days from now
      const res = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test Task 2 with Details',
          tags: ['testing', 'api'],
          dueDate: dueDate,
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body.title).toBe('Test Task 2 with Details');
      expect(res.body.tags).toEqual(['testing', 'api']);
      expect(res.body.dueDate).toBe(dueDate);
    });

    it('should return 400 for missing title', async () => {
      const res = await request(app).post('/api/tasks').send({ tags: ['fail'] });
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBe('Title is required');
    });
  });

  describe('GET /api/tasks (Read Tasks)', () => {
    it('should return all tasks', async () => {
      const res = await request(app).get('/api/tasks');
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBeGreaterThanOrEqual(initialTasksCount + 1); // +1 for testTask at least
    });

    it('should filter tasks by tag', async () => {
      // First, create a task with a unique tag
      await request(app).post('/api/tasks').send({ title: 'Tag Filter Test Task', tags: ['uniqueTag123'] });
      const res = await request(app).get('/api/tasks?tag=uniqueTag123');
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      res.body.forEach(task => {
        expect(task.tags).toContain('uniqueTag123');
      });
    });

    it('should sort tasks by dueDateAsc', async () => {
      const date1 = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const date2 = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      await request(app).post('/api/tasks').send({ title: 'Due Date Sort 2', dueDate: date2 });
      await request(app).post('/api/tasks').send({ title: 'Due Date Sort 1', dueDate: date1 });

      const res = await request(app).get('/api/tasks?sort=dueDateAsc');
      expect(res.statusCode).toEqual(200);
      const tasksWithDueDates = res.body.filter(t => t.dueDate);
      // Check order only for tasks that have due dates
      for (let i = 0; i < tasksWithDueDates.length - 1; i++) {
        expect(new Date(tasksWithDueDates[i].dueDate) <= new Date(tasksWithDueDates[i+1].dueDate)).toBe(true);
      }
    });
    
    it('should sort tasks by dueDateDesc', async () => {
      const date1 = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const date2 = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      await request(app).post('/api/tasks').send({ title: 'Due Date Sort Desc 1', dueDate: date1 });
      await request(app).post('/api/tasks').send({ title: 'Due Date Sort Desc 2', dueDate: date2 });

      const res = await request(app).get('/api/tasks?sort=dueDateDesc');
      expect(res.statusCode).toEqual(200);
      const tasksWithDueDates = res.body.filter(t => t.dueDate);
      for (let i = 0; i < tasksWithDueDates.length - 1; i++) {
        expect(new Date(tasksWithDueDates[i].dueDate) >= new Date(tasksWithDueDates[i+1].dueDate)).toBe(true);
      }
    });

    it('should search tasks by title', async () => {
      await request(app).post('/api/tasks').send({ title: 'Searchable Unique Title XYZ' });
      const res = await request(app).get('/api/tasks?search=Unique Title XYZ');
      expect(res.statusCode).toEqual(200);
      expect(res.body.some(task => task.title === 'Searchable Unique Title XYZ')).toBe(true);
    });

    it('should search tasks by tag', async () => {
      await request(app).post('/api/tasks').send({ title: 'Task with Searchable Tag', tags: ['searchTagXYZ'] });
      const res = await request(app).get('/api/tasks?search=searchTagXYZ');
      expect(res.statusCode).toEqual(200);
      expect(res.body.some(task => task.tags.includes('searchTagXYZ'))).toBe(true);
    });
    
    it('should return empty array for search with no results', async () => {
        const res = await request(app).get('/api/tasks?search=NonExistentTerm12345');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual([]);
    });
  });

  describe('PUT /api/tasks/:id (Update Task)', () => {
    it('should update a task title, tags, and due date', async () => {
      // Ensure testTask was created
      if (!testTask) {
        const postRes = await request(app).post('/api/tasks').send({ title: 'Task to Update' });
        testTask = postRes.body;
      }
      const newDueDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const res = await request(app)
        .put(`/api/tasks/${testTask.id}`)
        .send({
          title: 'Updated Test Task 1',
          tags: ['updated'],
          dueDate: newDueDate,
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.title).toBe('Updated Test Task 1');
      expect(res.body.tags).toEqual(['updated']);
      expect(res.body.dueDate).toBe(newDueDate);
    });

    it('should return 404 for updating non-existent task', async () => {
      const res = await request(app)
        .put('/api/tasks/999999')
        .send({ title: 'Ghost Task' });
      expect(res.statusCode).toEqual(404);
    });
    
    it('should return 400 for invalid ID format', async () => {
        const res = await request(app)
          .put('/api/tasks/invalidID')
          .send({ title: 'Invalid ID Task' });
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toBe('Task ID must be a valid number');
    });
  });
  
  describe('GET /api/tasks/:id (Get Specific Task)', () => {
    it('should get a specific task by ID', async () => {
        if (!testTask) {
            const postRes = await request(app).post('/api/tasks').send({ title: 'Specific Task Fetch' });
            testTask = postRes.body;
        }
        const res = await request(app).get(`/api/tasks/${testTask.id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.id).toEqual(testTask.id);
        expect(res.body.title).toEqual(testTask.title); // Or updated title if previous test ran
    });

    it('should return 404 for non-existent task ID', async () => {
        const res = await request(app).get('/api/tasks/999998');
        expect(res.statusCode).toEqual(404);
    });

    it('should return 400 for invalid task ID format', async () => {
        const res = await request(app).get('/api/tasks/invalidFormatID');
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toBe('Task ID must be a valid number');
    });
});


  describe('DELETE /api/tasks/:id (Delete Task)', () => {
    it('should delete a task', async () => {
      // Create a task to delete
      const taskToDeleteRes = await request(app).post('/api/tasks').send({ title: 'Task to be Deleted' });
      const taskToDeleteId = taskToDeleteRes.body.id;

      const res = await request(app).delete(`/api/tasks/${taskToDeleteId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe('Task deleted successfully');

      // Verify it's actually deleted
      const getRes = await request(app).get(`/api/tasks/${taskToDeleteId}`);
      expect(getRes.statusCode).toEqual(404);
    });

    it('should return 404 for deleting non-existent task', async () => {
      const res = await request(app).delete('/api/tasks/999997');
      expect(res.statusCode).toEqual(404);
    });
  });
});

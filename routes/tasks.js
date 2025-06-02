const express = require('express');
const prisma = require('../lib/prisma');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Create Task
router.post('/', protect, upload.array('documents', 3), async (req, res) => {
  const { title, description, status, priority, dueDate, assignedTo } = req.body;

  try {
    const files = Array.isArray(req.files) ? req.files : [];

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        dueDate: new Date(dueDate),
        assignedTo: assignedTo ? parseInt(assignedTo) : null,
        documents: {
          create: files.map((file) => ({
            name: file.originalname,
            path: file.path,
          }))
        }
      },
      include: { documents: true }
    });

    res.status(201).json(task);
  } catch (err) {
    console.error('Task creation error:', err);
    res.status(500).json({ message: 'Task creation failed', error: err.message });
  }
});

// Get Tasks (with filter, sort)
router.get('/', protect, async (req, res) => {
  const { status, priority, dueDate, sortBy = 'dueDate', order = 'asc' } = req.query;

  try {
    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (dueDate) filters.dueDate = new Date(dueDate);

    const where = req.user.role === 'admin'
      ? filters
      : { ...filters, assignedTo: req.user.id };

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { [sortBy]: order },
      include: { documents: true }
    });

    res.json(tasks);
  } catch (err) {
    console.error('Fetch tasks error:', err);
    res.status(500).json({ message: 'Failed to fetch tasks', error: err.message });
  }
});

// Get One Task
router.get('/:id', protect, async (req, res) => {
  const taskId = parseInt(req.params.id);

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { documents: true }
    });

    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (req.user.role !== 'admin' && task.assignedTo !== req.user.id)
      return res.status(403).json({ message: 'Access denied' });

    res.json(task);
  } catch (err) {
    console.error('Get task error:', err);
    res.status(500).json({ message: 'Failed to get task', error: err.message });
  }
});

// Update Task
router.put('/:id', protect, upload.array('documents', 3), async (req, res) => {
  const taskId = parseInt(req.params.id);
  const { title, description, status, priority, dueDate, assignedTo } = req.body;

  try {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role !== 'admin' && task.assignedTo !== req.user.id)
      return res.status(403).json({ message: 'Access denied' });

    const files = Array.isArray(req.files) ? req.files : [];

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        description,
        status,
        priority,
        dueDate: new Date(dueDate),
        assignedTo: assignedTo ? parseInt(assignedTo) : null,
        documents: {
          create: files.map((file) => ({
            name: file.originalname,
            path: file.path,
          }))
        }
      },
      include: { documents: true }
    });

    res.json(updatedTask);
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
});

// Delete Task
router.delete('/:id', protect, async (req, res) => {
  const taskId = parseInt(req.params.id);

  try {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role !== 'admin' && task.assignedTo !== req.user.id)
      return res.status(403).json({ message: 'Access denied' });

    await prisma.document.deleteMany({ where: { taskId } });
    await prisma.task.delete({ where: { id: taskId } });

    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
});

module.exports = router;

const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/users — List with pagination
router.get('/', protect, adminOnly, async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const skip = (page - 1) * limit;

  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          email: { contains: search, mode: 'insensitive' },
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        select: { id: true, email: true, role: true },
      }),
      prisma.user.count({
        where: {
          email: { contains: search, mode: 'insensitive' },
        },
      }),
    ]);

    res.json({
      total,
      page: parseInt(page),
      users,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
});

// POST /api/users — Create a user (admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || 'user',
      },
    });

    res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'User creation failed', error: err.message });
  }
});

// PUT /api/users/:id — Update a user (admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  const userId = parseInt(req.params.id);
  const { email, password, role } = req.body;

  try {
    const data = { email, role };
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, role: true },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'User update failed', error: err.message });
  }
});

// DELETE /api/users/:id — Delete a user (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    await prisma.user.delete({ where: { id: userId } });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'User delete failed', error: err.message });
  }
});

module.exports = router;

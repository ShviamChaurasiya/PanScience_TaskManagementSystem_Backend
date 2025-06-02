const express = require('express');
const path = require('path');
const prisma = require('../lib/prisma');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/documents/:id/download
router.get('/:id/download', protect, async (req, res) => {
  const docId = parseInt(req.params.id);

  try {
    const doc = await prisma.document.findUnique({
      where: { id: docId },
      include: { task: true },
    });

    if (!doc) return res.status(404).json({ message: 'Document not found' });

    // Only admin or assigned user can access the file
    if (req.user.role !== 'admin' && doc.task.assignedTo !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const filePath = path.resolve(doc.path);
    res.download(filePath, doc.name);
  } catch (err) {
    res.status(500).json({ message: 'Download failed', error: err.message });
  }
});

module.exports = router;


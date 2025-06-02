const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

const app = express();

// ✅ CORS middleware must come BEFORE all routes
app.use(cors({
  origin: 'http://localhost:5173', // Allow frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// ✅ Built-in middleware to parse JSON
app.use(express.json());

// ✅ Serve uploaded PDF files from /uploads
app.use('/uploads', express.static('uploads'));

// ✅ Routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');
const documentRoutes = require('./routes/documents');

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

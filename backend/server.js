require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const fileUpload = require('express-fileupload');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projectRoutes'); // Updated path
const taskRoutes = require('./routes/tasks');
const teamRoutes = require('./routes/teamRoutes');
const userRoutes = require('./routes/users');
const testRoutes = require('./routes/testRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Configure CORS with specific options
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5176'], // Allow all frontend ports
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Increase request size limit to 10MB for JSON and URL-encoded data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Enable file uploads with increased limit
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
}));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const profileUploadsDir = path.join(uploadsDir, 'profile');

[uploadsDir, profileUploadsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

app.get('/', (req, res) => {
  res.send('ProjectHub API is running!');
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes); // This will use our updated project routes
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/teams', teamRoutes);
app.use('/api/v1/users', userRoutes);

// Test routes (can be disabled in production if needed)
app.use('/api/v1/test', testRoutes);

// Error handling middleware (should be after all other middleware and routes)
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
const MAX_PORT_ATTEMPTS = 10;

console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);

// Function to start the server
const startServer = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    
    console.log('MongoDB connection successful');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);

    let currentPort = PORT;
    let attempts = 0;
    let server;

    const tryStartServer = () => {
      server = app.listen(currentPort, () => {
        console.log(`Server running on port ${currentPort}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      });

      server.on('error', (error) => {
        if (error.code === 'EADDRINUSE' && attempts < MAX_PORT_ATTEMPTS) {
          attempts++;
          currentPort++;
          console.log(`Port ${currentPort - 1} is in use, trying port ${currentPort}...`);
          tryStartServer();
        } else {
          console.error('Server error:', error);
          process.exit(1);
        }
      });
    };

    // Handle MongoDB connection events
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to DB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected from DB');
    });

    // Start the server
    tryStartServer();
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    if (err.name === 'MongoNetworkError') {
      console.error('Please check your internet connection and MongoDB server status');
    } else if (err.name === 'MongooseServerSelectionError') {
      console.error('Could not connect to MongoDB. Please check your connection string and ensure MongoDB is running');
    }
    process.exit(1);
  }
};

startServer();


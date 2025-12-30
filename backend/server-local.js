// Local development server without MongoDB dependency
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

// Configure CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// In-memory data storage for testing
let users = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'manager'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'member'
  },
  {
    id: '3',
    name: 'Demo User',
    email: 'demo@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'manager'
  }
];

let projects = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete overhaul of company website',
    status: 'on-track',
    progress: 75,
    dueDate: '2024-06-15',
    team: 5,
    tasks: { total: 12, completed: 9 }
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'Native iOS and Android application',
    status: 'at-risk',
    progress: 45,
    dueDate: '2024-07-30',
    team: 8,
    tasks: { total: 20, completed: 9 }
  }
];

let tasks = [
  {
    id: '1',
    title: 'Design System Implementation',
    description: 'Create comprehensive design system',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2024-05-20',
    assignee: 'John Doe',
    project: 'Website Redesign',
    tags: ['Design', 'Frontend']
  }
];

const JWT_SECRET = 'your-secret-key-for-testing';

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'ProjectHub Local API is running!' });
});

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role = 'member' } = req.body;
    
    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      role
    };
    
    users.push(newUser);

    // Generate JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      data: {
        token,
        user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Projects routes
app.get('/api/projects', authMiddleware, (req, res) => {
  res.json(projects);
});

app.post('/api/projects', authMiddleware, (req, res) => {
  const newProject = {
    id: Date.now().toString(),
    ...req.body
  };
  projects.push(newProject);
  res.status(201).json(newProject);
});

app.put('/api/projects/:id', authMiddleware, (req, res) => {
  const projectIndex = projects.findIndex(p => p.id === req.params.id);
  if (projectIndex === -1) {
    return res.status(404).json({ message: 'Project not found' });
  }
  
  projects[projectIndex] = { ...projects[projectIndex], ...req.body };
  res.json(projects[projectIndex]);
});

app.delete('/api/projects/:id', authMiddleware, (req, res) => {
  const projectIndex = projects.findIndex(p => p.id === req.params.id);
  if (projectIndex === -1) {
    return res.status(404).json({ message: 'Project not found' });
  }
  
  projects.splice(projectIndex, 1);
  res.json({ message: 'Project deleted' });
});

// Users routes
app.get('/api/users/members', authMiddleware, (req, res) => {
  const members = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role
  }));
  res.json(members);
});

// Tasks routes
app.get('/api/tasks', authMiddleware, (req, res) => {
  res.json(tasks);
});

app.post('/api/tasks', authMiddleware, (req, res) => {
  const newTask = {
    id: Date.now().toString(),
    ...req.body
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Local ProjectHub API running on port ${PORT}`);
  console.log(`📡 CORS enabled for frontend development`);
  console.log(`💾 Using in-memory storage (no MongoDB required)`);
  console.log(`🔑 Test credentials: john@example.com / password`);
});

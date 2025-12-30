import React, { useEffect, useState } from 'react';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import {
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Load data with fallback demo data
    const savedProjects = JSON.parse(localStorage.getItem('projects')) || [];
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // If no data exists, create demo data for charts
    if (savedProjects.length === 0) {
      const demoProjects = [
        { id: 1, name: 'Website Redesign', progress: 75, status: 'on-track' },
        { id: 2, name: 'Mobile App', progress: 45, status: 'at-risk' },
        { id: 3, name: 'API Integration', progress: 90, status: 'on-track' },
        { id: 4, name: 'Database Migration', progress: 30, status: 'delayed' }
      ];
      setProjects(demoProjects);
    } else {
      setProjects(savedProjects);
    }

    if (savedTasks.length === 0) {
      const demoTasks = [
        { id: 1, assignee: 'John Doe', status: 'done', priority: 'high', dueDate: '2024-05-15' },
        { id: 2, assignee: 'Jane Smith', status: 'done', priority: 'medium', dueDate: '2024-05-20' },
        { id: 3, assignee: 'Mike Johnson', status: 'in-progress', priority: 'high', dueDate: '2024-05-25' },
        { id: 4, assignee: 'Sarah Wilson', status: 'todo', priority: 'low', dueDate: '2024-05-30' },
        { id: 5, assignee: 'John Doe', status: 'done', priority: 'medium', dueDate: '2024-05-18' }
      ];
      setTasks(demoTasks);
    } else {
      setTasks(savedTasks);
    }
  }, []);

  // Project Progress Pie Chart
  const projectProgressData = {
    labels: projects.map(p => p.name),
    datasets: [
      {
        label: 'Progress %',
        data: projects.map(p => p.progress),
        backgroundColor: [
          '#2563eb', '#dc2626', '#16a34a', '#f59e42', '#a21caf', '#0ea5e9', '#fbbf24', '#e11d48', '#10b981', '#f472b6'
        ],
      },
    ],
  };

  // Team Performance Bar Chart (tasks completed per assignee)
  const assignees = Array.from(new Set(tasks.map(t => t.assignee).filter(Boolean)));
  const tasksPerAssignee = assignees.map(a => tasks.filter(t => t.assignee === a && t.status === 'done').length);
  const teamPerformanceData = {
    labels: assignees,
    datasets: [
      {
        label: 'Tasks Completed',
        data: tasksPerAssignee,
        backgroundColor: '#2563eb',
      },
    ],
  };

  // Overdue Tasks Line Chart (overdue count by due date)
  const overdueTasks = tasks.filter(t => t.status !== 'done' && new Date(t.dueDate) < new Date());
  const overdueByDate = {};
  overdueTasks.forEach(t => {
    if (t.dueDate) {
      overdueByDate[t.dueDate] = (overdueByDate[t.dueDate] || 0) + 1;
    }
  });
  const overdueDates = Object.keys(overdueByDate).sort();
  const overdueCounts = overdueDates.map(date => overdueByDate[date]);
  const overdueTasksData = {
    labels: overdueDates,
    datasets: [
      {
        label: 'Overdue Tasks',
        data: overdueCounts,
        fill: false,
        borderColor: '#dc2626',
        backgroundColor: '#dc2626',
        tension: 0.2,
      },
    ],
  };

  // Task Status Distribution
  const taskStatusData = {
    labels: ['Completed', 'In Progress', 'To Do'],
    datasets: [{
      data: [
        tasks.filter(t => t.status === 'done').length,
        tasks.filter(t => t.status === 'in-progress').length,
        tasks.filter(t => t.status === 'todo').length
      ],
      backgroundColor: ['#10b981', '#f59e0b', '#6b7280'],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  // Priority Distribution
  const priorityData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [{
      data: [
        tasks.filter(t => t.priority === 'high').length,
        tasks.filter(t => t.priority === 'medium').length,
        tasks.filter(t => t.priority === 'low').length
      ],
      backgroundColor: ['#ef4444', '#f59e0b', '#22c55e'],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const avgProjectProgress = projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-700 to-red-600 bg-clip-text text-transparent drop-shadow-2xl">
          Reports & Analytics
        </h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Activity className="w-4 h-4" />
          <span>Real-time data</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Progress</p>
              <p className="text-2xl font-bold text-gray-900">{avgProjectProgress}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Project Progress Pie Chart */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <PieChart className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Project Progress</h2>
          </div>
          <div className="h-80">
            <Pie
              data={projectProgressData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return context.label + ': ' + context.parsed + '%';
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Task Status Distribution */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Task Status</h2>
          </div>
          <div className="h-80">
            <Doughnut
              data={taskStatusData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Team Performance */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <Users className="w-5 h-5 text-purple-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Team Performance</h2>
          </div>
          <div className="h-80">
            <Bar
              data={teamPerformanceData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Task Priority</h2>
          </div>
          <div className="h-80">
            <Doughnut
              data={priorityData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Overdue Tasks Line Chart */}
      {overdueDates.length > 0 && (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <Clock className="w-5 h-5 text-red-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Overdue Tasks Trend</h2>
          </div>
          <div className="h-80">
            <Line
              data={overdueTasksData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports; 
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationProvider } from './contexts/NotificationContext';
import { ActivityLogProvider } from './contexts/ActivityLogContext';
import { SessionProvider } from './contexts/SessionContext';
import { PrivateNotesProvider } from './contexts/PrivateNotesContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TemplateProvider } from './contexts/TemplateContext';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import Projects from './components/projects/Projects';
import Tasks from './components/tasks/Tasks';
import KanbanBoard from './components/tasks/KanbanBoard';
import GanttChart from './components/tasks/GanttChart';
import Settings from './components/settings/Settings';
import MyDay from './components/dashboard/MyDay';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './components/Landing';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import { UserProvider } from './contexts/UserContext';
import Reports from './components/reports/Reports';
import TeamCollaboration from './components/team/TeamCollaboration';
import Profile from './pages/Profile';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <NotificationProvider>
          <ActivityLogProvider>
            <SessionProvider>
              <PrivateNotesProvider>
                <ThemeProvider>
                  <TemplateProvider>
                    <Router
                      future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true
                      }}
                    >
                      <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/signin" element={<SignIn />} />
                        <Route path="/signup" element={<SignUp />} />
                        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/myday" element={<MyDay />} />
                          <Route path="/projects" element={<Projects />} />
                          <Route path="/tasks" element={<Tasks />} />
                          <Route path="/kanban" element={<KanbanBoard />} />
                          <Route path="/gantt" element={<GanttChart />} />
                          <Route path="/reports" element={<Reports />} />
                          <Route path="/team" element={<TeamCollaboration />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/profile" element={<Profile />} />
                        </Route>
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                      </Routes>
                    </Router>
                  </TemplateProvider>
                </ThemeProvider>
              </PrivateNotesProvider>
            </SessionProvider>
          </ActivityLogProvider>
        </NotificationProvider>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;

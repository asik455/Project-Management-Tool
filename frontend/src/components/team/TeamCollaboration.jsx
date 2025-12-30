import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  MessageCircle,
  Video,
  Share2,
  Settings,
  Crown,
  Shield,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Copy,
  QrCode
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useNotifications } from '../../contexts/NotificationContext';

const TeamCollaboration = () => {
  const { user } = useUser();
  const { addNotification } = useNotifications();
  const [teamMembers, setTeamMembers] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'member', message: '' });
  const [teamCode, setTeamCode] = useState('');
  const [showTeamCode, setShowTeamCode] = useState(false);
  const [activeTab, setActiveTab] = useState('members');

  useEffect(() => {
    // Load team members from localStorage or set demo data
    const savedMembers = localStorage.getItem('teamMembers');
    if (savedMembers) {
      setTeamMembers(JSON.parse(savedMembers));
    } else {
      const demoMembers = [
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role: 'admin',
          status: 'online',
          avatar: null,
          joinedDate: '2024-01-15',
          lastActive: new Date().toISOString(),
          tasksCompleted: 24,
          projectsLead: 3
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'manager',
          status: 'online',
          avatar: null,
          joinedDate: '2024-02-01',
          lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          tasksCompleted: 18,
          projectsLead: 2
        },
        {
          id: 3,
          name: 'Mike Johnson',
          email: 'mike@example.com',
          role: 'member',
          status: 'away',
          avatar: null,
          joinedDate: '2024-02-15',
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          tasksCompleted: 12,
          projectsLead: 0
        },
        {
          id: 4,
          name: 'Sarah Wilson',
          email: 'sarah@example.com',
          role: 'member',
          status: 'offline',
          avatar: null,
          joinedDate: '2024-03-01',
          lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          tasksCompleted: 15,
          projectsLead: 1
        }
      ];
      setTeamMembers(demoMembers);
      localStorage.setItem('teamMembers', JSON.stringify(demoMembers));
    }

    // Generate team code
    const savedTeamCode = localStorage.getItem('teamCode');
    if (savedTeamCode) {
      setTeamCode(savedTeamCode);
    } else {
      const newTeamCode = 'TEAM-' + Math.random().toString(36).substr(2, 8).toUpperCase();
      setTeamCode(newTeamCode);
      localStorage.setItem('teamCode', newTeamCode);
    }
  }, []);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'manager': return <Shield className="w-4 h-4 text-blue-500" />;
      default: return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const handleInviteMember = (e) => {
    e.preventDefault();
    const newMember = {
      id: Date.now(),
      name: inviteForm.email.split('@')[0],
      email: inviteForm.email,
      role: inviteForm.role,
      status: 'offline',
      avatar: null,
      joinedDate: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString(),
      tasksCompleted: 0,
      projectsLead: 0
    };

    const updatedMembers = [...teamMembers, newMember];
    setTeamMembers(updatedMembers);
    localStorage.setItem('teamMembers', JSON.stringify(updatedMembers));

    addNotification({
      type: 'team_invite',
      message: `Invitation sent to ${inviteForm.email}`,
    });

    setShowInviteModal(false);
    setInviteForm({ email: '', role: 'member', message: '' });
  };

  const copyTeamCode = () => {
    navigator.clipboard.writeText(teamCode);
    addNotification({
      type: 'success',
      message: 'Team code copied to clipboard!',
    });
  };

  const formatLastActive = (lastActive) => {
    const now = new Date();
    const lastActiveDate = new Date(lastActive);
    const diffInMinutes = Math.floor((now - lastActiveDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-700 to-red-600 bg-clip-text text-transparent drop-shadow-2xl">
          Team Collaboration
        </h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowTeamCode(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <QrCode className="w-4 h-4 mr-2" />
            Team Code
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-xl shadow hover:bg-blue-700 transition-all"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Invite Member
          </button>
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <div className="flex items-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Online Now</p>
              <p className="text-2xl font-bold text-gray-900">
                {teamMembers.filter(m => m.status === 'online').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {teamMembers.reduce((sum, m) => sum + m.tasksCompleted, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <div className="flex items-center">
            <Crown className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Projects Led</p>
              <p className="text-2xl font-bold text-gray-900">
                {teamMembers.reduce((sum, m) => sum + m.projectsLead, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-white rounded-xl shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {teamMembers.map((member) => (
            <div key={member.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {member.name.charAt(0)}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(member.status)} rounded-full border-2 border-white`}></div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                      {getRoleIcon(member.role)}
                    </div>
                    <p className="text-sm text-gray-600">{member.email}</p>
                    <p className="text-xs text-gray-500">Last active: {formatLastActive(member.lastActive)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">{member.tasksCompleted}</p>
                    <p className="text-xs text-gray-600">Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">{member.projectsLead}</p>
                    <p className="text-xs text-gray-600">Projects</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                      <MessageCircle className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50">
                      <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-50">
                      <Mail className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowInviteModal(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-semibold mb-6">Invite Team Member</h2>
            <form onSubmit={handleInviteMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="colleague@company.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="member">Member</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Personal Message (Optional)</label>
                <textarea
                  value={inviteForm.message}
                  onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Welcome to our team!"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team Code Modal */}
      {showTeamCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowTeamCode(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-semibold mb-6">Team Join Code</h2>
            <div className="text-center space-y-4">
              <div className="bg-gray-100 rounded-lg p-6">
                <p className="text-3xl font-mono font-bold text-gray-900 tracking-wider">{teamCode}</p>
              </div>
              <p className="text-sm text-gray-600">
                Share this code with team members to let them join your workspace
              </p>
              <button
                onClick={copyTeamCode}
                className="flex items-center justify-center w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamCollaboration;

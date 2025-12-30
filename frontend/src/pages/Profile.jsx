import { useState, useEffect, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import { auth } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Camera, Mail, Check, X as XIcon, Edit2, Lock, Save } from 'lucide-react';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, login } = useUser();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    bio: '',
    company: '',
    location: '',
    profilePicture: ''
  });
  const [preview, setPreview] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Available positions for the dropdown
  const positions = [
    'Project Manager',
    'Developer',
    'Designer',
    'QA Engineer',
    'Product Owner',
    'Scrum Master',
    'Business Analyst',
    'Other'
  ];

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      const userData = {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        position: user.position || '',
        bio: user.bio || '',
        company: user.company || '',
        location: user.location || '',
        profilePicture: user.profilePicture || ''
      };
      setFormData(userData);
      setPreview(user.profilePicture || '');
    }
  }, [user]);

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      const response = await auth.getProfile();
      const userData = response.data.data;
      setFormData(userData);
      setPreview(userData.profilePicture || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Function to compress an image
  const compressImage = (file, maxWidth = 400, maxHeight = 400, quality = 0.8) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw image on canvas with new dimensions
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert canvas to base64 with specified quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
      };
      
      reader.readAsDataURL(file);
    });
  };

  // Handle profile picture upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPEG, JPG, PNG, GIF)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setIsLoading(true);
      
      // Compress the image before uploading
      const compressedImage = await compressImage(file);
      
      // Update form data with the compressed base64 string
      const updatedData = {
        ...formData,
        profilePicture: compressedImage
      };
      
      // Save the updated profile
      const response = await auth.updateProfile(updatedData);
      
      // Update the preview and form data with the response
      setPreview(compressedImage);
      setFormData(prev => ({
        ...prev,
        profilePicture: response.data.data.profilePicture || compressedImage
      }));
      
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      // Clear the file input
      e.target.value = '';
    }
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    try {
      setIsLoading(true);
      await auth.updatePassword(passwordData.currentPassword, passwordData.newPassword);
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setShowPasswordForm(false);
      toast.success('Password updated successfully!');
    } catch (error) {
      console.error('Error updating password:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update password';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit profile changes
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await auth.updateProfile(formData);
      const updatedUser = response.data.data;
      
      // Update user context
      login(updatedUser);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Cancel editing
  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        position: user.position || '',
        bio: user.bio || '',
        company: user.company || '',
        location: user.location || '',
        profilePicture: user.profilePicture || ''
      });
      setPreview(user.profilePicture || '');
    }
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 p-6 text-white">
          <div className="flex flex-col md:flex-row items-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-2xl font-bold overflow-hidden">
                {preview ? (
                  <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{getInitials(formData.name)}</span>
                )}
              </div>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-0 right-0 bg-blue-700 rounded-full p-2"
                  disabled={isLoading}
                >
                  <Camera className="w-5 h-5" />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </button>
              )}
            </div>
            <div className="md:ml-8 mt-4 md:mt-0 text-center md:text-left">
              <h2 className="text-2xl font-bold">{formData.name || 'User'}</h2>
              <p className="flex items-center justify-center md:justify-start mt-1">
                <Mail className="w-4 h-4 mr-1" /> {formData.email}
              </p>
              {formData.position && (
                <div className="mt-2">
                  <span className="inline-block bg-blue-700 text-white text-xs px-2 py-1 rounded">
                    {formData.position}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Tabs */}
          <div className="mt-6 flex border-b border-blue-500/30">
            <button
              onClick={() => setShowPasswordForm(false)}
              className={`px-4 py-2 text-sm font-medium ${!showPasswordForm ? 'text-white border-b-2 border-white' : 'text-blue-100 hover:text-white'}`}
            >
              Profile
            </button>
            <button
              onClick={() => setShowPasswordForm(true)}
              className={`px-4 py-2 text-sm font-medium ${showPasswordForm ? 'text-white border-b-2 border-white' : 'text-blue-100 hover:text-white'}`}
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {showPasswordForm ? (
            // Password Change Form
            <form onSubmit={handlePasswordSubmit} className="max-w-md mx-auto">
              <h3 className="text-lg font-medium mb-6">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                      minLength={6}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                      minLength={6}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(false)}
                    className="px-4 py-2 border rounded-md"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    disabled={isLoading || !passwordData.currentPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
                  >
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            // Profile Form
            <form onSubmit={handleProfileSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                    disabled={!isEditing || isLoading}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md bg-gray-100"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                    disabled={!isEditing || isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Position</label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                    disabled={!isEditing || isLoading}
                  >
                    <option value="">Select position</option>
                    {positions.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md"
                    disabled={!isEditing || isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                    disabled={!isEditing || isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                    disabled={!isEditing || isLoading}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 border rounded-md"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;


import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../types';
import { BackIcon, HomeIcon, KeyIcon } from '../components/Icons';

interface ChangePasswordPageProps {
  user: User;
  onChangePassword: (userId: string, oldPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
}

const ChangePasswordPage: React.FC<ChangePasswordPageProps> = ({ user, onChangePassword }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    setIsSubmitting(true);
    const result = await onChangePassword(user.id, currentPassword, newPassword);
    setIsSubmitting(false);

    if (result.success) {
      setSuccess('Password changed successfully! You will be logged out shortly.');
      setTimeout(() => {
         navigate('/login', { state: { message: 'Password changed. Please log in again.' } });
      }, 2000);
    } else {
      setError(result.message || 'Failed to change password.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors"
        >
          <BackIcon className="w-5 h-5" />
          Back
        </button>
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          title="Go to Home/Dashboard"
        >
          <HomeIcon className="w-5 h-5" />
          <span>Home</span>
        </Link>
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <KeyIcon className="w-10 h-10 text-sky-600" />
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Change Password</h1>
            <p className="text-slate-600 mt-1">Update your password for your account: <span className="font-semibold">{user.username}</span></p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</p>}
        {success && <p className="bg-emerald-100 text-emerald-700 p-3 rounded-lg">{success}</p>}
        
        <div>
          <label className="block text-sm font-bold text-slate-800" htmlFor="current-password">
            Current Password
          </label>
          <input
            className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-800" htmlFor="new-password">
            New Password
          </label>
          <input
            className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-800" htmlFor="confirm-password">
            Confirm New Password
          </label>
          <input
            className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
        <div className="pt-2 flex justify-end">
          <button
            className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-transform hover:scale-105 disabled:bg-slate-400"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordPage;

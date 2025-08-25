import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BackIcon, CheckIcon, HomeIcon } from '../components/Icons';

interface ChangePasswordPageProps {
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
}

const ChangePasswordPage: React.FC<ChangePasswordPageProps> = ({ onChangePassword }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    
    setLoading(true);
    const result = await onChangePassword(currentPassword, newPassword);
    setLoading(false);

    if (result.success) {
      // App.tsx handles navigation after successful password change and logout
    } else {
      setError(result.message || 'An unknown error occurred.');
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
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Change Password</h1>
      <p className="text-slate-700 mb-8">
        For your security, you will be logged out after successfully changing your password.
      </p>

      {error && (
        <p className="bg-red-100 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-r-lg relative mb-6 shadow-sm" role="alert">
          {error}
        </p>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset disabled={loading}>
            <div>
            <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="current-password">
                Current Password
            </label>
            <input
                className="shadow-sm appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                id="current-password"
                type="password"
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
            />
            </div>

            <div>
            <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="new-password">
                New Password
            </label>
            <input
                className="shadow-sm appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                id="new-password"
                type="password"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
            />
            </div>

            <div>
            <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="confirm-password">
                Confirm New Password
            </label>
            <input
                className="shadow-sm appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                id="confirm-password"
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
            />
            </div>

            <div className="flex justify-end gap-3 pt-4">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition"
            >
                Cancel
            </button>
            <button
                type="submit"
                className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition flex items-center gap-2 hover:-translate-y-0.5 disabled:bg-slate-400"
                disabled={loading}
            >
                <CheckIcon className="w-5 h-5" />
                {loading ? 'Updating...' : 'Update Password'}
            </button>
            </div>
        </fieldset>
      </form>
    </div>
  );
};

export default ChangePasswordPage;

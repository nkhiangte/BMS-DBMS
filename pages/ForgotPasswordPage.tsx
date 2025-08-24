
import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../types';
import { BackIcon, CheckIcon } from '../components/Icons';

interface ForgotPasswordPageProps {
  users: User[];
  onResetPassword: (username: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ users, onResetPassword }) => {
  const [username, setUsername] = useState('');
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleFindAccount = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user) {
      setFoundUser(user);
    } else {
      setError('No account found with that username.');
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (!foundUser) {
        setError('An unexpected error occurred. Please try again.');
        return;
    }
    
    setIsSubmitting(true);
    const result = await onResetPassword(foundUser.username, newPassword);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/login', { state: { message: 'Password has been reset successfully. You can now log in with your new password.' } });
    } else {
      setError(result.message || 'Failed to reset password.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 to-indigo-200 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-xl rounded-2xl px-8 pt-8 pb-8">
          {!foundUser ? (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-slate-800">Find Your Account</h1>
                <p className="text-slate-600 mt-2">Enter your username to reset your password.</p>
              </div>
              {error && (
                <p className="bg-red-100 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-r-lg relative mb-4" role="alert">
                  {error}
                </p>
              )}
              <form onSubmit={handleFindAccount}>
                <div className="mb-4">
                  <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="username">
                    Username
                  </label>
                  <input
                    className="shadow-sm appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-800 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500"
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center justify-center mt-6">
                  <button
                    className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-transform hover:scale-105"
                    type="submit"
                  >
                    Find Account
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-slate-800">Reset Password</h1>
                <p className="text-slate-600 mt-2">Create a new password for <span className="font-bold">{foundUser.name} ({foundUser.username})</span>.</p>
              </div>
               {error && (
                <p className="bg-red-100 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-r-lg relative mb-4" role="alert">
                  {error}
                </p>
              )}
              <form onSubmit={handleResetPassword}>
                <div className="mb-4">
                  <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="new-password">
                    New Password
                  </label>
                  <input
                    className="shadow-sm appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-800 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500"
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="confirm-password">
                    Confirm New Password
                  </label>
                  <input
                    className="shadow-sm appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-800 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500"
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center justify-center">
                  <button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-transform hover:scale-105"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              </form>
            </>
          )}
          <div className="text-center mt-6">
            <Link to="/login" className="font-bold text-sm text-sky-600 hover:text-sky-800 transition-colors flex items-center justify-center gap-2">
                <BackIcon className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

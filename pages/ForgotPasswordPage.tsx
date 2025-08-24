
import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BackIcon } from '../components/Icons';

interface ForgotPasswordPageProps {
  onResetPassword: (username: string) => Promise<{ success: boolean; message?: string }>;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onResetPassword }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    setIsSubmitting(true);
    const result = await onResetPassword(username);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage(result.message || 'Password reset email sent successfully.');
    } else {
      setError(result.message || 'Failed to send password reset email.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 to-indigo-200 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-xl rounded-2xl px-8 pt-8 pb-8">
            <>
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-slate-800">Reset Your Password</h1>
                <p className="text-slate-600 mt-2">Enter your username and we will send you a link to reset your password.</p>
              </div>
              {error && (
                <p className="bg-red-100 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-r-lg relative mb-4" role="alert">
                  {error}
                </p>
              )}
              {successMessage && (
                <p className="bg-emerald-100 border-l-4 border-emerald-400 text-emerald-700 px-4 py-3 rounded-r-lg relative mb-4" role="alert">
                  {successMessage}
                </p>
              )}
              <form onSubmit={handleSubmit}>
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
                    className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-transform hover:scale-105 disabled:bg-slate-400"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            </>
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

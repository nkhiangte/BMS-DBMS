import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface ForgotPasswordPageProps {
  onForgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    const result = await onForgotPassword(email);
    if (result.success) {
      setSuccess(result.message || 'Password reset email sent! Please check your inbox.');
    } else {
      setError(result.message || 'An unknown error occurred.');
      setTimeout(() => setError(''), 4000);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 to-indigo-200 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-xl rounded-2xl px-8 pt-8 pb-8">
          <div className="mb-8 text-center">
             <img src="https://i.postimg.cc/qt00dty5/logo.png" alt="Bethel Mission School Logo" className="mx-auto h-24 w-24 mb-4" />
            <h1 className="text-3xl font-bold text-slate-800">Forgot Password</h1>
            <p className="text-slate-600 mt-2">Enter your email to receive a password reset link.</p>
          </div>
          {error && (
            <p className="bg-red-100 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-r-lg relative mb-4 shadow-sm" role="alert">
              {error}
            </p>
          )}
           {success && (
            <p className="bg-emerald-50 border-l-4 border-emerald-400 text-emerald-800 px-4 py-3 rounded-r-lg relative mb-4 shadow-sm" role="alert">
              {success}
            </p>
          )}
          <form onSubmit={handleSubmit}>
            <fieldset disabled={loading}>
              <div className="mb-4">
                <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="email">
                  Email Address
                </label>
                <input
                  className="shadow-sm appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  id="email"
                  type="email"
                  placeholder="admin@bms.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center justify-between mt-6">
                <button
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 transform hover:scale-105 shadow-md disabled:bg-slate-400"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </fieldset>
          </form>
           <div className="text-center mt-6">
                <Link to="/login" className="font-bold text-sm text-sky-600 hover:text-sky-800 transition-colors">
                    &larr; Back to Login
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

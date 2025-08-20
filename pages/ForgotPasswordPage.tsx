import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

interface ForgotPasswordPageProps {
  onForgotPassword: (username: string) => { success: boolean; message?: string };
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onForgotPassword }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = onForgotPassword(username);
    if (result.success) {
      navigate('/reset-password');
    } else {
      setError(result.message || 'An unknown error occurred.');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 to-indigo-200 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-xl rounded-2xl px-8 pt-8 pb-8">
          <div className="mb-8 text-center">
             <img src="https://i.postimg.cc/qt00dty5/logo.png" alt="Bethel Mission School Logo" className="mx-auto h-24 w-24 mb-4" />
            <h1 className="text-3xl font-bold text-slate-800">Forgot Password</h1>
            <p className="text-slate-600 mt-2">Enter your username to reset your password.</p>
          </div>
          {error && (
            <p className="bg-red-100 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-r-lg relative mb-4 shadow-sm" role="alert">
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="username">
                Username
              </label>
              <input
                className="shadow-sm appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                id="username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-between mt-6">
              <button
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 transform hover:scale-105 shadow-md"
                type="submit"
              >
                Continue
              </button>
            </div>
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

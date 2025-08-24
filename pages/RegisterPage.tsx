
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface RegisterPageProps {
  onRegister: (name: string, username: string, password: string) => Promise<{ success: boolean; message?: string }>;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    const result = await onRegister(name, username, password);
    setIsSubmitting(false);
    if (result.success) {
      navigate('/login', { state: { message: result.message } });
    } else {
      setError(result.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 to-indigo-200 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-xl rounded-2xl px-8 pt-8 pb-8">
            <div className="mb-8 text-center">
                <img src="https://i.postimg.cc/qt00dty5/logo.png" alt="Bethel Mission School Logo" className="mx-auto h-24 w-24 mb-4" />
                <h1 className="text-3xl font-bold text-slate-800">Admin Account Setup</h1>
                <p className="text-slate-600">Create the primary administrator account. Additional users can be added later from the admin dashboard.</p>
            </div>
            {error && (
              <p className="bg-red-100 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-r-lg relative mb-4 shadow-sm" role="alert">
                {error}
              </p>
            )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="name">
                Full Name
              </label>
              <input
                className="shadow-sm appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-800 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                id="name"
                type="text"
                placeholder="e.g., John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="username">
                Username
              </label>
              <input
                className="shadow-sm appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-800 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                id="username"
                type="text"
                placeholder="Username"
                value={username}
                autoComplete="username"
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
                <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="password">
                    Password
                </label>
              <input
                className="shadow-sm appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-800 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                id="password"
                type="password"
                placeholder="Password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
                <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="confirm-password">
                    Confirm Password
                </label>
              <input
                className="shadow-sm appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-800 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                id="confirm-password"
                type="password"
                placeholder="Confirm Password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="pt-2">
              <button
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 transform hover:scale-105 shadow-md disabled:bg-slate-400 disabled:scale-100"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Admin Account'}
              </button>
            </div>
          </form>
           <div className="text-center mt-6">
                <Link to="/login" className="font-bold text-sm text-sky-600 hover:text-sky-800 transition-colors">
                    Already have an account? Login
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

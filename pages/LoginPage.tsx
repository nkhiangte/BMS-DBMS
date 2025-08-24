
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LoginPageProps {
  onLogin: (username: string, password: string) => void;
  error: string;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [notification, setNotification] = useState('');
  const location = useLocation();

  useEffect(() => {
    const locationState = location.state as { message?: string };
    if (locationState?.message) {
        setNotification(locationState.message);
        const timer = setTimeout(() => setNotification(''), 5000);
        // Clear location state to prevent message from re-appearing on refresh
        window.history.replaceState({}, document.title)
        return () => clearTimeout(timer);
    }
  }, [location.state]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 to-indigo-200 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-xl rounded-2xl px-8 pt-8 pb-8">
            <div className="mb-8 text-center">
                <img src="https://i.postimg.cc/qt00dty5/logo.png" alt="Bethel Mission School Logo" className="mx-auto h-24 w-24 mb-4" />
                <h1 className="text-3xl font-bold text-slate-800">Bethel Mission School</h1>
                <p className="text-slate-600">Admin Login</p>
            </div>
            {notification && (
              <p className="bg-emerald-50 border-l-4 border-emerald-400 text-emerald-800 px-4 py-3 rounded-r-lg relative mb-4 shadow-sm" role="alert">
                {notification}
              </p>
            )}
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
            <div className="mb-6">
                <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="password">
                    Password
                </label>
              <input
                className="shadow-sm appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-800 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                id="password"
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
           
            <div className="flex items-center justify-center">
              <button
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 transform hover:scale-105 shadow-md"
                type="submit"
              >
                Sign In
              </button>
            </div>
             <div className="text-sm mt-6 flex justify-between items-center">
                <Link to="/forgot-password" className="font-bold text-slate-600 hover:text-sky-800 transition-colors">
                    Forgot Password?
                </Link>
                <span className="text-slate-600 text-right">
                    Contact an admin to create an account.
                </span>
            </div>
          </form>
        </div>
        <p className="text-center text-slate-700 text-xs mt-6">
          &copy;{new Date().getFullYear()} Bethel Mission School. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

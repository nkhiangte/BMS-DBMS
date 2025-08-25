import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface LoginPageProps {
  onLogin: (email: string, password: string, rememberMe: boolean) => void;
  error: string;
  notification?: string;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, error, notification }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [localNotification, setLocalNotification] = useState('');

  useEffect(() => {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        const { email: savedEmail, password: savedPassword } = JSON.parse(rememberedUser);
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (notification) {
        setLocalNotification(notification);
        const timer = setTimeout(() => setLocalNotification(''), 5000);
        return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password, rememberMe);
  };

  const isConfigError = error.includes('Firebase is not configured');

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 to-indigo-200 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-xl rounded-2xl px-8 pt-8 pb-8">
            <div className="mb-8 text-center">
                <img src="https://i.postimg.cc/qt00dty5/logo.png" alt="Bethel Mission School Logo" className="mx-auto h-24 w-24 mb-4" />
                <h1 className="text-3xl font-bold text-slate-800">Bethel Mission School</h1>
                <p className="text-slate-600">Admin Login</p>
            </div>
            {localNotification && (
              <p className="bg-emerald-50 border-l-4 border-emerald-400 text-emerald-800 px-4 py-3 rounded-r-lg relative mb-4 shadow-sm" role="alert">
                {localNotification}
              </p>
            )}
             {error && (
               <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-r-lg mb-4 shadow-sm" role="alert">
                <p className="font-bold">{isConfigError ? 'Action Required: Configuration Needed' : 'Authentication Error'}</p>
                <p className="text-sm">{error}</p>
                {isConfigError && (
                    <div className="mt-3 pt-3 border-t border-red-200 text-sm">
                        <p>Please open the <code className="bg-red-200 px-1 rounded font-mono">firebaseConfig.ts</code> file and replace the placeholder values with your project's configuration from the Firebase Console.</p>
                    </div>
                )}
              </div>
            )}
          <form onSubmit={handleSubmit}>
            <fieldset disabled={isConfigError} className="space-y-4">
              <div>
                <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  className="shadow-sm appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-800 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  id="email"
                  type="email"
                  placeholder="admin@bms.edu"
                  value={email}
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                  <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="password">
                      Password
                  </label>
                <input
                  className="shadow-sm appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-800 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  id="password"
                  type="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                  <label className="flex items-center text-sm cursor-pointer group">
                      <input
                          type="checkbox"
                          className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 disabled:cursor-not-allowed"
                          checked={rememberMe}
                          onChange={e => setRememberMe(e.target.checked)}
                      />
                      <span className="ml-2 text-slate-700 group-hover:text-slate-900 font-semibold">Remember Me</span>
                  </label>
                  <Link to="/forgot-password" className="inline-block align-baseline font-bold text-sm text-sky-600 hover:text-sky-800 transition-colors">
                      Forgot Password?
                  </Link>
              </div>
            </fieldset>
           
            <div className="mt-6 flex items-center justify-between">
              <button
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 transform hover:scale-105 shadow-md disabled:bg-slate-400 disabled:cursor-not-allowed disabled:transform-none"
                type="submit"
                disabled={isConfigError}
              >
                Sign In
              </button>
            </div>
          </form>
           <div className="text-center mt-6">
                <p className="text-sm text-slate-700">
                    Don't have an account?{' '}
                    <Link to="/signup" className="font-bold text-sky-600 hover:text-sky-800 transition-colors">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
        <p className="text-center text-slate-700 text-xs mt-6">
          &copy;{new Date().getFullYear()} Bethel Mission School. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
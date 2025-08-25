import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface SignUpPageProps {
  onSignUp: (name: string, email: string, password: string) => Promise<{ success: boolean, message?: string }>;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onSignUp }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await onSignUp(name, email, password);
    if (!result.success) {
        setError(result.message || 'An unknown error occurred.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 to-indigo-200 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-xl rounded-2xl px-8 pt-8 pb-8">
            <div className="mb-8 text-center">
                <img src="https://i.postimg.cc/qt00dty5/logo.png" alt="Bethel Mission School Logo" className="mx-auto h-24 w-24 mb-4" />
                <h1 className="text-3xl font-bold text-slate-800">Create Admin Account</h1>
                <p className="text-slate-600">Bethel Mission School</p>
            </div>
             {error && (
              <p className="bg-red-100 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-r-lg relative mb-4 shadow-sm" role="alert">
                {error}
              </p>
            )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="name">
                Full Name
              </label>
              <input
                className="shadow-sm appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-800 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                autoComplete="name"
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                className="shadow-sm appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-800 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                id="email"
                type="email"
                placeholder="admin@bms.edu"
                value={email}
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
           
            <div className="flex items-center justify-between">
              <button
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 transform hover:scale-105 shadow-md"
                type="submit"
              >
                Sign Up
              </button>
            </div>
          </form>
           <div className="text-center mt-6">
                <p className="text-sm text-slate-700">
                    Already have an account?{' '}
                    <Link to="/login" className="font-bold text-sky-600 hover:text-sky-800 transition-colors">
                        Sign In
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

export default SignUpPage;

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface LoginPageProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  error: string;
  notification: string;
}

const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  error: authError,
  notification,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormError(authError);
    if (authError) {
      const timer = setTimeout(() => setFormError(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (err: any) {
      setFormError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 to-indigo-200 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-xl rounded-2xl px-8 pt-8 pb-8">
          <div className="mb-8 text-center">
            <img
              src="https://i.postimg.cc/qt00dty5/logo.png"
              alt="Bethel Mission School Logo"
              className="mx-auto h-24 w-24 mb-4"
            />
            <h1 className="text-3xl font-bold text-slate-800">Admin Login</h1>
            <p className="text-slate-600">Bethel Mission School</p>
          </div>

          {formError && (
            <p
              className="bg-red-100 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-r-lg relative mb-4 shadow-sm"
              role="alert"
            >
              {formError}
            </p>
          )}
          {notification && !formError && (
            <p
              className="bg-emerald-50 border-l-4 border-emerald-400 text-emerald-800 px-4 py-3 rounded-r-lg relative mb-4 shadow-sm"
              role="alert"
            >
              {notification}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <fieldset disabled={loading}>
              <div className="mb-4">
                <label
                  className="block text-slate-700 text-sm font-bold mb-2"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  className="shadow-sm appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-800 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  id="email"
                  type="email"
                  placeholder="admin@bms.edu"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-6">
                <label
                  className="block text-slate-700 text-sm font-bold mb-2"
                  htmlFor="password"
                >
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
                <div className="text-right mt-2">
                  <Link
                    to="/forgot-password"
                    className="inline-block align-baseline font-bold text-sm text-sky-600 hover:text-sky-800 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <button
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 transform hover:scale-105 shadow-md disabled:bg-slate-400"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </div>
            </fieldset>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-slate-700">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="font-bold text-sky-600 hover:text-sky-800 transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
        <p className="text-center text-slate-700 text-xs mt-6">
          &copy;{new Date().getFullYear()} Bethel Mission School. All rights
          reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

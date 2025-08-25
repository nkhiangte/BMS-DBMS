import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';
import { ChevronDownIcon, LogoutIcon, KeyIcon } from './Icons';

interface HeaderProps {
    user: User;
    onLogout: () => void;
    className?: string;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, className }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className={`bg-white sticky top-0 z-30 shadow-sm border-b border-slate-200 ${className || ''}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        <Link to="/" title="Go to Dashboard" className="flex items-center gap-3">
            <img src="https://i.postimg.cc/qt00dty5/logo.png" alt="Bethel Mission School Logo" className="h-10 w-10 sm:h-12 sm:w-12" />
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-slate-800">
                Bethel Mission School
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">Student Database Management</p>
            </div>
        </Link>

        <div className="relative">
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                aria-haspopup="true"
                aria-expanded={isMenuOpen}
            >
                <img className="w-8 h-8 rounded-full" src={user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`} alt="User avatar" />
                <span className="font-semibold text-slate-800 hidden sm:inline">Welcome, {user.displayName || user.email}</span>
                <ChevronDownIcon className={`w-5 h-5 text-slate-600 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {isMenuOpen && (
                <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20 animate-fade-in"
                    onMouseLeave={() => setIsMenuOpen(false)}
                >
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        <Link
                            to="/change-password"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                            role="menuitem"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <KeyIcon className="w-5 h-5"/>
                            Change Password
                        </Link>
                        <button
                            onClick={() => { onLogout(); setIsMenuOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                            role="menuitem"
                        >
                            <LogoutIcon className="w-5 h-5"/>
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;


import React from 'react';
import { User } from '../types';
import { BackIcon, HomeIcon } from '../components/Icons';
import { Link, useNavigate } from 'react-router-dom';

interface UserManagementPageProps {
  allUsers: User[];
}

export const UserManagementPage: React.FC<UserManagementPageProps> = ({ allUsers }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
                    <BackIcon className="w-5 h-5" /> Back
                </button>
                <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800" title="Go to Home/Dashboard">
                    <HomeIcon className="w-5 h-5" />
                    <span>Home</span>
                </Link>
            </div>
            
            <h1 className="text-3xl font-bold text-slate-800 mb-2">User Management</h1>
            <p className="text-slate-700 mb-8">This application now runs in a single-user admin mode.</p>

            <div className="space-y-8">
                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Current User</h2>
                     <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Role</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {allUsers.map(user => (
                                     <tr key={user.uid}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{user.displayName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                                            <span className='px-2 inline-flex text-xs leading-5 rounded-full bg-sky-100 text-sky-800'>
                                                {user.role}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
                 <section>
                     <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-lg">
                        <p className="text-slate-700 font-semibold">User registration and management are disabled.</p>
                        <p className="text-slate-600 mt-1 text-sm">The application is configured to run with a default admin user.</p>
                    </div>
                </section>
            </div>
        </div>
    );
};

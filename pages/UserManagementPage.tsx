import React from 'react';
import { User } from '../types';
import { BackIcon, HomeIcon, CheckIcon } from '../components/Icons';
import { Link, useNavigate } from 'react-router-dom';

interface UserManagementPageProps {
  allUsers: User[];
  currentUser: User;
  onUpdateUserRole: (uid: string, newRole: 'admin' | 'user' | 'pending') => void;
}

export const UserManagementPage: React.FC<UserManagementPageProps> = ({ allUsers, currentUser, onUpdateUserRole }) => {
    const navigate = useNavigate();

    const handleRoleChange = (uid: string, newRole: string) => {
        if (['admin', 'user', 'pending'].includes(newRole)) {
            onUpdateUserRole(uid, newRole as 'admin' | 'user' | 'pending');
        }
    };

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
            <p className="text-slate-700 mb-8">Approve new user registrations and manage existing user roles.</p>

            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Role / Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {allUsers.map(user => (
                                <tr key={user.uid}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{user.displayName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                                    {user.uid === currentUser.uid ? (
                                        <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-sky-100 text-sky-800'>
                                            {user.role} (You)
                                        </span>
                                    ) : user.role === 'pending' ? (
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                                                Pending Approval
                                            </span>
                                            <button
                                                onClick={() => onUpdateUserRole(user.uid, 'user')}
                                                className="flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full hover:bg-emerald-700 transition"
                                            >
                                                <CheckIcon className="w-4 h-4" />
                                                Approve
                                            </button>
                                        </div>
                                    ) : (
                                        <select 
                                            value={user.role} 
                                            onChange={(e) => handleRoleChange(user.uid, e.target.value)}
                                            className="form-select rounded-md border-slate-300 shadow-sm focus:border-sky-300 focus:ring focus:ring-sky-200 focus:ring-opacity-50"
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {allUsers.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-slate-600">No other users found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

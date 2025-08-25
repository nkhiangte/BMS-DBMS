import React from 'react';
import { User } from '../types';
import { BackIcon, HomeIcon, CheckIcon, XIcon } from '../components/Icons';
import { Link, useNavigate } from 'react-router-dom';

interface UserManagementPageProps {
  allUsers: User[];
  onApprove: (user: User) => void;
  onDeny: (user: User) => void;
}

const UserRow: React.FC<{ user: User, onApprove?: (user: User) => void, onDeny?: (user: User) => void, isPending?: boolean }> = ({ user, onApprove, onDeny, isPending }) => (
    <tr className="hover:bg-slate-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{user.displayName}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{user.email}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
            <span className={`px-2 inline-flex text-xs leading-5 rounded-full ${
                isPending ? 'bg-amber-100 text-amber-800' : 
                user.role === 'admin' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
                {user.role}
            </span>
        </td>
        {isPending && onApprove && onDeny && (
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-4">
                    <button onClick={() => onApprove(user)} className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-800 transition-colors" title="Approve">
                        <CheckIcon className="w-5 h-5" /> Approve
                    </button>
                    <button onClick={() => onDeny(user)} className="flex items-center gap-1.5 text-red-600 hover:text-red-800 transition-colors" title="Deny">
                        <XIcon className="w-5 h-5" /> Deny
                    </button>
                </div>
            </td>
        )}
    </tr>
);

const UserManagementPage: React.FC<UserManagementPageProps> = ({ allUsers, onApprove, onDeny }) => {
    const navigate = useNavigate();
    const pendingUsers = allUsers.filter(u => u.role === 'pending').sort((a,b) => (a.displayName || '').localeCompare(b.displayName || ''));
    const activeUsers = allUsers.filter(u => u.role === 'user' || u.role === 'admin').sort((a,b) => (a.displayName || '').localeCompare(b.displayName || ''));

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
            <p className="text-slate-700 mb-8">Approve new user registrations and view active users.</p>

            <div className="space-y-8">
                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Pending Approval ({pendingUsers.length})</h2>
                    {pendingUsers.length === 0 ? (
                        <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-lg">
                            <p className="text-slate-700 font-semibold">No pending user registrations.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Status</th>
                                        <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {pendingUsers.map(user => <UserRow key={user.uid} user={user} onApprove={onApprove} onDeny={onDeny} isPending />)}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Active Users ({activeUsers.length})</h2>
                    {activeUsers.length === 0 ? (
                        <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-lg">
                            <p className="text-slate-700 font-semibold">No active users found.</p>
                        </div>
                    ) : (
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
                                    {activeUsers.map(user => <UserRow key={user.uid} user={user} />)}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default UserManagementPage;

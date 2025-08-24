
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../types';
import { BackIcon, HomeIcon, PlusIcon, EditIcon, TrashIcon } from '../components/Icons';

interface ManageUsersPageProps {
  users: User[];
  onAdd: () => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

const ManageUsersPage: React.FC<ManageUsersPageProps> = ({ users, onAdd, onEdit, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
          <BackIcon className="w-5 h-5" /> Back
        </button>
        <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800" title="Go to Home/Dashboard">
          <HomeIcon className="w-5 h-5" /> <span>Home</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Manage Users</h1>
          <p className="text-slate-600 mt-1">Add, edit, or remove user accounts.</p>
        </div>
        <button onClick={onAdd} className="btn btn-primary">
          <PlusIcon className="w-5 h-5" /> Add New User
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Full Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Username</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Role</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'Admin' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-800'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-4">
                    <button onClick={() => onEdit(user)} className="text-sky-600 hover:text-sky-800 transition-colors" title="Edit User">
                      <EditIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => onDelete(user)} className="text-red-600 hover:text-red-800 transition-colors" title="Delete User">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsersPage;

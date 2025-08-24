

import React, { useState, useEffect, FormEvent } from 'react';
import { User, Role } from '../types';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: Omit<User, 'id' | 'role' | 'password_plaintext'> & { password_plaintext?: string }, role: Role) => void;
  user: User | null;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSubmit, user }) => {
  const getInitialState = () => ({
    name: '',
    username: '',
    password_plaintext: '',
    role: Role.TEACHER,
  });

  const [formData, setFormData] = useState(getInitialState());

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        username: user.username,
        password_plaintext: '', // Leave password blank for editing
        role: user.role,
      });
    } else {
      setFormData(getInitialState());
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!user && !formData.password_plaintext) {
      alert('Password is required for new users.');
      return;
    }
    onSubmit({
      name: formData.name,
      username: formData.username,
      ...(formData.password_plaintext && { password_plaintext: formData.password_plaintext })
    }, formData.role);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-slate-800">{user ? 'Edit User' : 'Add New User'}</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-slate-800">Full Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-bold text-slate-800">Username</label>
              <input type="text" name="username" id="username" value={formData.username} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
            </div>
            { !user && (
                 <div>
                    <label htmlFor="password_plaintext" className="block text-sm font-bold text-slate-800">Password</label>
                    <input type="password" name="password_plaintext" id="password_plaintext" value={formData.password_plaintext} placeholder="Password required for new user" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required={!user} />
                </div>
            )}
            <div>
              <label htmlFor="role" className="block text-sm font-bold text-slate-800">Role</label>
              <select name="role" id="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                <option value={Role.ADMIN}>Admin</option>
                <option value={Role.TEACHER}>Teacher</option>
              </select>
            </div>
          </div>
          <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-xl border-t">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">{user ? 'Save Changes' : 'Add User'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { InventoryItem, User } from '../types';
import { PlusIcon, SearchIcon, HomeIcon, BackIcon, ArchiveBoxIcon } from '../components/Icons';
import InventoryTable from '../components/InventoryTable';
import { INVENTORY_CATEGORY_LIST, INVENTORY_STATUS_LIST } from '../constants';

interface InventoryPageProps {
  inventory: InventoryItem[];
  onAdd: () => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  user: User;
}

const InventoryPage: React.FC<InventoryPageProps> = ({ inventory, onAdd, onEdit, onDelete, user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  const filteredInventory = useMemo(() => {
    return inventory
      .filter(item => {
        const term = searchTerm.toLowerCase();
        return item.name.toLowerCase().includes(term) || item.location.toLowerCase().includes(term);
      })
      .filter(item => (categoryFilter ? item.category === categoryFilter : true))
      .filter(item => (statusFilter ? item.status === statusFilter : true));
  }, [inventory, searchTerm, categoryFilter, statusFilter]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors"
        >
          <BackIcon className="w-5 h-5" />
          Back
        </button>
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          title="Go to Home/Dashboard"
        >
          <HomeIcon className="w-5 h-5" />
          <span>Home</span>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <ArchiveBoxIcon className="w-12 h-12 text-violet-600 hidden md:block" />
        <div>
            <h2 className="text-2xl font-bold text-slate-800">
            Inventory Management
            </h2>
            <p className="text-slate-600">Track and manage all school assets.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto ml-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-slate-600" />
            </div>
            <input
              type="text"
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition placeholder:text-slate-600"
              aria-label="Search inventory items"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
            aria-label="Filter items by category"
          >
            <option value="">All Categories</option>
            {INVENTORY_CATEGORY_LIST.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
            aria-label="Filter items by status"
          >
            <option value="">All Statuses</option>
            {INVENTORY_STATUS_LIST.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          {/* Add Item Button */}
          {user.role === 'admin' && (
            <button
              onClick={onAdd}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition"
            >
              <PlusIcon className="h-5 w-5" />
              Add Item
            </button>
          )}
        </div>
      </div>
      <InventoryTable
        items={filteredInventory}
        onEdit={onEdit}
        onDelete={onDelete}
        user={user}
      />
    </div>
  );
};

export default InventoryPage;

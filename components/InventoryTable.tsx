import React from 'react';
import { InventoryItem, InventoryStatus } from '../types';
import { EditIcon, TrashIcon } from './Icons';

interface InventoryTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ items, onEdit, onDelete }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
        <p className="text-slate-700 text-lg font-semibold">No inventory items found.</p>
        <p className="text-slate-600 mt-2">Try adjusting your search filters or add a new item.</p>
      </div>
    );
  }

  const getStatusColor = (status: InventoryStatus): string => {
    switch (status) {
      case InventoryStatus.GOOD:
        return 'bg-emerald-100 text-emerald-800';
      case InventoryStatus.NEEDS_REPAIR:
        return 'bg-amber-100 text-amber-800';
      case InventoryStatus.NEEDS_REPLACEMENT:
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Item Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Category</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Quantity</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Location</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Purchase Date</th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {items.map(item => (
            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{item.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                {item.category}
                {item.subCategory && <span className="block text-xs text-slate-500">{item.subCategory}</span>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-semibold">{item.quantity}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{item.location}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{item.purchaseDate}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-4">
                  <button onClick={() => onEdit(item)} className="text-sky-600 hover:text-sky-800 transition-colors" title="Edit">
                    <EditIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => onDelete(item)} className="text-red-600 hover:text-red-800 transition-colors" title="Delete">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;

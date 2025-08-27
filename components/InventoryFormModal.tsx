import React, { useState, useEffect, FormEvent } from 'react';
import { InventoryItem, InventoryCategory, InventoryStatus } from '../types';
import { INVENTORY_CATEGORY_LIST, INVENTORY_STATUS_LIST } from '../constants';
import { formatDateForDisplay, formatDateForStorage } from '../utils';

interface InventoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<InventoryItem, 'id'>) => void;
  item: InventoryItem | null;
}

const InventoryFormModal: React.FC<InventoryFormModalProps> = ({ isOpen, onClose, onSubmit, item }) => {
  const getInitialFormData = (): Omit<InventoryItem, 'id'> => ({
    name: '',
    category: INVENTORY_CATEGORY_LIST[0],
    subCategory: '',
    quantity: 1,
    status: InventoryStatus.GOOD,
    location: '',
    purchaseDate: formatDateForDisplay(new Date().toISOString().split('T')[0]),
    lastMaintenanceDate: '',
    notes: '',
  });

  const [formData, setFormData] = useState(getInitialFormData());

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFormData({
            ...getInitialFormData(),
            ...item,
            quantity: item.quantity || 1,
            purchaseDate: formatDateForDisplay(item.purchaseDate),
            lastMaintenanceDate: item.lastMaintenanceDate ? formatDateForDisplay(item.lastMaintenanceDate) : '',
        });
      } else {
        setFormData(getInitialFormData());
      }
    }
  }, [item, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let finalValue = value;
    if (type === 'number') {
        finalValue = value === '' ? '0' : value;
    }
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const submissionData = {
        ...formData,
        quantity: parseInt(String(formData.quantity), 10) || 0,
        category: formData.category as InventoryCategory,
        status: formData.status as InventoryStatus,
        purchaseDate: formatDateForStorage(formData.purchaseDate),
        lastMaintenanceDate: formData.lastMaintenanceDate ? formatDateForStorage(formData.lastMaintenanceDate) : undefined,
    };
    onSubmit(submissionData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
         <div className="p-6 border-b">
             <h2 className="text-2xl font-bold text-slate-800">{item ? 'Edit Inventory Item' : 'Add New Item to Inventory'}</h2>
         </div>
          <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label htmlFor="name" className="block text-sm font-bold text-slate-800">Item Name</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" required />
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-bold text-slate-800">Category</label>
                    <select name="category" id="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" required>
                    {INVENTORY_CATEGORY_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="subCategory" className="block text-sm font-bold text-slate-800">Sub-Category (Optional)</label>
                    <input type="text" name="subCategory" id="subCategory" value={formData.subCategory} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" placeholder="e.g., Science Lab, Computer Lab"/>
                </div>
                <div>
                    <label htmlFor="quantity" className="block text-sm font-bold text-slate-800">Quantity</label>
                    <input type="number" name="quantity" id="quantity" value={formData.quantity} onChange={handleChange} min="0" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" required />
                </div>
                <div>
                    <label htmlFor="status" className="block text-sm font-bold text-slate-800">Status</label>
                    <select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" required>
                    {INVENTORY_STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="location" className="block text-sm font-bold text-slate-800">Location</label>
                    <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" placeholder="e.g., Class V, Library, Staff Room" required />
                </div>
                <div>
                    <label htmlFor="purchaseDate" className="block text-sm font-bold text-slate-800">Purchase Date</label>
                    <input type="text" name="purchaseDate" id="purchaseDate" placeholder="DD/MM/YYYY" pattern="\\d{2}/\\d{2}/\\d{4}" value={formData.purchaseDate} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" required />
                </div>
                <div>
                    <label htmlFor="lastMaintenanceDate" className="block text-sm font-bold text-slate-800">Last Maintenance (Optional)</label>
                    <input type="text" name="lastMaintenanceDate" id="lastMaintenanceDate" placeholder="DD/MM/YYYY" pattern="\\d{2}/\\d{2}/\\d{4}" value={formData.lastMaintenanceDate} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="notes" className="block text-sm font-bold text-slate-800">Notes (Optional)</label>
                    <textarea name="notes" id="notes" value={formData.notes} onChange={handleChange} rows={3} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                </div>
            </div>
          </div>
          <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-xl border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition">
              {item ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryFormModal;
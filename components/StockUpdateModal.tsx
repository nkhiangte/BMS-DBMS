import React, { useState, useEffect, FormEvent } from 'react';
import { HostelInventoryItem } from '../types';

interface StockUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateStock: (quantity: number, notes: string) => void;
  item: HostelInventoryItem | null;
  updateType: 'add' | 'issue';
}

const StockUpdateModal: React.FC<StockUpdateModalProps> = ({ isOpen, onClose, onUpdateStock, item, updateType }) => {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setNotes('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (quantity <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }

    if (updateType === 'issue' && item && quantity > item.currentStock) {
      setError(`Cannot issue more than available stock (${item.currentStock}).`);
      return;
    }

    onUpdateStock(quantity, notes);
    onClose();
  };

  if (!isOpen || !item) return null;

  const isAdding = updateType === 'add';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h3 className={`text-xl leading-6 font-bold ${isAdding ? 'text-emerald-700' : 'text-amber-700'}`}>
              {isAdding ? 'Add Stock' : 'Issue Stock'}
            </h3>
            <p className="mt-2 text-md font-semibold text-slate-800">
              Item: <span className="text-sky-700">{item.name}</span>
            </p>
            <p className="text-sm text-slate-600">
              Current Stock: {item.currentStock}
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="quantity" className="block text-sm font-bold text-slate-800">
                  Quantity to {isAdding ? 'Add' : 'Issue'}
                </label>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                  min="1"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-bold text-slate-800">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                  placeholder={isAdding ? 'e.g., New purchase from vendor' : 'e.g., Issued to Block A kitchen'}
                />
              </div>
              {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}
            </div>
          </div>
          <div className="bg-slate-50 px-6 py-4 flex flex-row-reverse gap-3 rounded-b-xl">
            <button
              type="submit"
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:w-auto sm:text-sm ${isAdding ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500' : 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500'}`}
            >
              Confirm
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 sm:mt-0 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockUpdateModal;

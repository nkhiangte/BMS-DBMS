import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BackIcon, HomeIcon, ArchiveBoxIcon, InboxArrowDownIcon, ArrowUpOnSquareIcon, ExclamationTriangleIcon } from '../components/Icons';
import { HostelInventoryItem, StockLog, StockLogType } from '../types';
import StockUpdateModal from '../components/StockUpdateModal';

interface HostelInventoryPageProps {
    inventory: HostelInventoryItem[];
    stockLogs: StockLog[];
    onUpdateStock: (itemId: number, change: number, notes: string) => void;
}

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string; }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4 border-l-4" style={{ borderLeftColor: color }}>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}1A`, color }}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);

const HostelInventoryPage: React.FC<HostelInventoryPageProps> = ({ inventory, stockLogs, onUpdateStock }) => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<HostelInventoryItem | null>(null);
    const [updateType, setUpdateType] = useState<'add' | 'issue'>('add');

    const stats = useMemo(() => {
        const lowStockItems = inventory.filter(item => item.currentStock > 0 && item.currentStock <= item.reorderLevel).length;
        const outOfStockItems = inventory.filter(item => item.currentStock === 0).length;
        return {
            totalTypes: inventory.length,
            lowStock: lowStockItems,
            outOfStock: outOfStockItems,
        };
    }, [inventory]);

    const handleOpenModal = (item: HostelInventoryItem, type: 'add' | 'issue') => {
        setSelectedItem(item);
        setUpdateType(type);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };
    
    const handleStockUpdate = (quantity: number, notes: string) => {
        if (selectedItem) {
            const change = updateType === 'add' ? quantity : -quantity;
            onUpdateStock(selectedItem.id, change, notes);
        }
    };
    
    const getStockLevelColor = (current: number, reorder: number) => {
        if (current === 0) return 'bg-rose-500';
        if (current <= reorder) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
                <div className="mb-6 flex justify-between items-center">
                    <button onClick={() => navigate('/hostel')} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
                        <BackIcon className="w-5 h-5" /> Back to Hostel Dashboard
                    </button>
                    <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors" title="Go to Home">
                        <HomeIcon className="w-5 h-5" /> Home
                    </Link>
                </div>
                
                <div className="mb-8 flex items-center gap-4">
                    <div className="p-3 bg-violet-100 text-violet-600 rounded-lg">
                        <ArchiveBoxIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Hostel Inventory & Asset Management</h1>
                        <p className="text-slate-600 mt-1">Track furniture, bedding, cleaning, and kitchen supplies.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <StatCard title="Total Item Types" value={stats.totalTypes} icon={<ArchiveBoxIcon className="w-6 h-6" />} color="var(--primary)" />
                    <StatCard title="Low Stock Items" value={stats.lowStock} icon={<ExclamationTriangleIcon className="w-6 h-6" />} color="var(--warning)" />
                    <StatCard title="Out of Stock" value={stats.outOfStock} icon={<ExclamationTriangleIcon className="w-6 h-6" />} color="var(--danger)" />
                </div>

                {/* Inventory Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 border">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Item Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Category</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Current Stock</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Reorder Level</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-slate-800 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {inventory.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{item.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{item.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-lg w-10">{item.currentStock}</span>
                                            <div className="w-full bg-slate-200 rounded-full h-2.5">
                                                <div 
                                                    className={`h-2.5 rounded-full ${getStockLevelColor(item.currentStock, item.reorderLevel)}`} 
                                                    style={{ width: `${Math.min((item.currentStock / (item.reorderLevel * 2)) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-semibold">{item.reorderLevel}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => handleOpenModal(item, 'add')} className="p-2 bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200 transition" title="Add Stock">
                                                <InboxArrowDownIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleOpenModal(item, 'issue')} className="p-2 bg-amber-100 text-amber-700 rounded-full hover:bg-amber-200 transition" title="Issue Stock">
                                                <ArrowUpOnSquareIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                 {/* Recent Activity Log */}
                <div className="mt-10">
                     <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b-2 border-slate-200 pb-2">Recent Activity</h2>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 border">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Item Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Type</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Quantity</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {stockLogs.slice(0, 10).map(log => (
                                    <tr key={log.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{new Date(log.date).toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{log.itemName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.type === StockLogType.IN ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                                {log.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">{log.quantity}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{log.notes || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
            <StockUpdateModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                item={selectedItem}
                updateType={updateType}
                onUpdateStock={handleStockUpdate}
            />
        </>
    );
};

export default HostelInventoryPage;

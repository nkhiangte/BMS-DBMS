
import React, { useMemo, useState } from 'react';
import { Student, StudentStatus, TcRecord } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { HomeIcon, BackIcon, DocumentPlusIcon, SearchIcon, PrinterIcon, DocumentReportIcon } from '../components/Icons';
import PrintTcSearchModal from '../components/PrintTcSearchModal';

interface TransferManagementPageProps {
  students: Student[];
  tcRecords: TcRecord[];
}

const TransferManagementPage: React.FC<TransferManagementPageProps> = ({ students, tcRecords }) => {
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const transferredStudents = useMemo(() => students.filter(s => s.status === StudentStatus.TRANSFERRED).sort((a,b) => (b.transferDate || '').localeCompare(a.transferDate || '')), [students]);
  const navigate = useNavigate();

  return (
    <div>
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
        <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Transfer Certificate Actions</h2>
                <p className="text-slate-700 mb-6">
                    Use these actions to manage Transfer Certificates. Generating a new TC for a student will automatically mark them as transferred.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link
                        to="/transfers/register"
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition"
                    >
                        <DocumentPlusIcon className="w-5 h-5" />
                        <span>Registration - TC</span>
                    </Link>
                    <Link
                        to="/transfers/update"
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg shadow-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition"
                    >
                        <SearchIcon className="w-5 h-5" />
                        <span>Search/Update TC</span>
                    </Link>
                    <button
                        onClick={() => setIsPrintModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition"
                    >
                        <PrinterIcon className="w-5 h-5" />
                        <span>Print TC</span>
                    </button>
                    <Link
                        to="/transfers/records"
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                    >
                        <DocumentReportIcon className="w-5 h-5" />
                        <span>All Records TC</span>
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Transferred Students Record</h2>
                 {transferredStudents.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-lg">
                        <p className="text-slate-700 text-lg font-semibold">No students have been transferred yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Grade at Transfer</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Date of Transfer</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {transferredStudents.map(student => (
                                    <tr key={student.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <Link to={`/student/${student.id}`} className="text-sky-700 hover:underline">{student.name}</Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{student.grade}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{student.transferDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
        <PrintTcSearchModal 
            isOpen={isPrintModalOpen}
            onClose={() => setIsPrintModalOpen(false)}
            tcRecords={tcRecords}
        />
    </div>
  );
};

export default TransferManagementPage;
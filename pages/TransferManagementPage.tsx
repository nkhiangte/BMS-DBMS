

import React, { useMemo, useState } from 'react';
import { Student, StudentStatus, TcRecord } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { HomeIcon, BackIcon, DocumentPlusIcon, SearchIcon, PrinterIcon, DocumentReportIcon } from '../components/Icons';
import PrintTcSearchModal from '../components/PrintTcSearchModal';
import { formatStudentId } from '../utils';

interface TransferManagementPageProps {
  students: Student[];
  tcRecords: TcRecord[];
  academicYear: string;
}

const TransferManagementPage: React.FC<TransferManagementPageProps> = ({ students, tcRecords, academicYear }) => {
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [studentIdInput, setStudentIdInput] = useState('');
  const [searchError, setSearchError] = useState('');
  const transferredStudents = useMemo(() => students.filter(s => s.status === StudentStatus.TRANSFERRED).sort((a,b) => (b.transferDate || '').localeCompare(a.transferDate || '')), [students]);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    if (!studentIdInput) {
        setSearchError('Please enter a Student ID.');
        return;
    }

    const studentToSearch = students.find(s => formatStudentId(s, academicYear).toLowerCase() === studentIdInput.toLowerCase());

    if (studentToSearch) {
        const tcRecord = tcRecords.find(r => r.studentDetails.studentNumericId === studentToSearch.id);
        if (tcRecord) {
            // Found existing TC, navigate to update page
            navigate('/transfers/update', { state: { studentIdInput } });
        } else {
            // No TC found, navigate to registration page
            navigate('/transfers/register', { state: { studentIdInput } });
        }
    } else {
        setSearchError('No active student found with this ID.');
    }
  };

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
                    Search for a student to generate a new TC or update an existing one. Generating a new TC for a student will automatically mark them as transferred.
                </p>
                
                <form onSubmit={handleSearch} className="max-w-xl mb-6">
                    <label htmlFor="student-id-input" className="block text-sm font-bold text-slate-800 mb-2">Generate or Update TC</label>
                    <div className="flex gap-2 items-start">
                        <div className="flex-grow">
                            <input
                                id="student-id-input"
                                type="text"
                                placeholder="Enter Student ID (e.g., BMS250101)"
                                value={studentIdInput}
                                onChange={e => setStudentIdInput(e.target.value.toUpperCase())}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                            />
                            {searchError && <p className="text-red-500 text-sm mt-1">{searchError}</p>}
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 h-[42px] flex items-center justify-center gap-2"
                        >
                            <SearchIcon className="w-5 h-5" /> Find
                        </button>
                    </div>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 border-t pt-6">
                    <button
                        onClick={() => setIsPrintModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition"
                    >
                        <PrinterIcon className="w-5 h-5" />
                        <span>Print Existing TC</span>
                    </button>
                    <Link
                        to="/transfers/records"
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                    >
                        <DocumentReportIcon className="w-5 h-5" />
                        <span>View All TC Records</span>
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

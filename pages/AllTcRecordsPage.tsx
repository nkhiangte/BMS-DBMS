

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TcRecord } from '../types';
import { BackIcon, HomeIcon, PrinterIcon } from '../components/Icons';

interface AllTcRecordsPageProps {
  tcRecords: TcRecord[];
}

const AllTcRecordsPage: React.FC<AllTcRecordsPageProps> = ({ tcRecords }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate('/transfers')}
          className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors"
        >
          <BackIcon className="w-5 h-5" />
          Back to Transfers
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

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">All Transfer Certificate Records</h1>
        <p className="text-slate-700 mt-1">A list of all TCs that have been generated and saved.</p>
      </div>

      {tcRecords.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
          <p className="text-slate-700 text-lg font-semibold">No TC records found.</p>
          <p className="text-slate-600 mt-2">Generate a new TC from the Transfer Management page.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Ref. No</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Student ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Student Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Date of Issue</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {tcRecords.map(record => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-700">{record.tcData.refNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{record.studentDetails.studentIdFormatted}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link to={`/student/${record.studentDetails.studentId}`} className="hover:underline text-sky-700 font-semibold">
                        {record.studentDetails.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{record.tcData.issueDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/transfers/print/${record.id}`}
                      className="flex items-center justify-end gap-2 text-sky-600 hover:text-sky-800 transition-colors"
                      title="Print TC"
                    >
                      <PrinterIcon className="w-5 h-5" />
                      <span>Print</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllTcRecordsPage;
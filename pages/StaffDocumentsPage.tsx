

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ServiceCertificateRecord } from '../types';
import { BackIcon, HomeIcon, PrinterIcon, DocumentPlusIcon } from '../components/Icons';

interface StaffDocumentsPageProps {
  serviceCertificateRecords: ServiceCertificateRecord[];
}

const StaffDocumentsPage: React.FC<StaffDocumentsPageProps> = ({ serviceCertificateRecords }) => {
  const navigate = useNavigate();
  const records = [...serviceCertificateRecords].sort((a,b) => b.certData.issueDate.localeCompare(a.certData.issueDate));

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate('/staff')}
          className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors"
        >
          <BackIcon className="w-5 h-5" />
          Back to Staff Management
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

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Service Certificate Records</h1>
            <p className="text-slate-700 mt-1">A list of all service certificates that have been generated.</p>
        </div>
         <Link
            to="/staff/certificates/generate"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition"
        >
            <DocumentPlusIcon className="w-5 h-5" />
            <span>Generate New Certificate</span>
        </Link>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
          <p className="text-slate-700 text-lg font-semibold">No Service Certificate records found.</p>
          <p className="text-slate-600 mt-2">Click the button above to generate a new certificate.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Ref. No</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Staff ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Staff Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Date of Issue</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {records.map(record => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-700">{record.certData.refNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{record.staffDetails.staffId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link to={`/staff/${record.staffDetails.staffNumericId}`} className="hover:underline text-sky-700 font-semibold">
                        {record.staffDetails.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{record.certData.issueDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/staff/certificates/print/${record.id}`}
                      className="flex items-center justify-end gap-2 text-sky-600 hover:text-sky-800 transition-colors"
                      title="Print Certificate"
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

export default StaffDocumentsPage;
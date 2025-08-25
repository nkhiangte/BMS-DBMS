

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TcRecord } from '../types';
import { SearchIcon } from './Icons';

interface PrintTcSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  tcRecords: TcRecord[];
}

const PrintTcSearchModal: React.FC<PrintTcSearchModalProps> = ({ isOpen, onClose, tcRecords }) => {
  const [studentIdInput, setStudentIdInput] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!studentIdInput) {
      setError('Please enter a Student ID.');
      return;
    }

    const record = tcRecords.find(r => r.studentDetails.studentId.toLowerCase() === studentIdInput.toLowerCase());

    if (record) {
      navigate(`/transfers/print/${record.id}`);
      onClose();
    } else {
      setError('No TC record found for this Student ID.');
    }
  };

  const handleClose = () => {
    setStudentIdInput('');
    setError('');
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={handleClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSearch}>
            <div className="p-6">
                <h3 className="text-lg leading-6 font-bold text-slate-900 mb-2">Print Transfer Certificate</h3>
                <p className="text-sm text-slate-600 mb-4">
                    Enter the Student ID (e.g., BMS250501) of the student whose TC you wish to print.
                </p>
                <div>
                    <label htmlFor="search-student-id" className="sr-only">Student ID</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            id="search-student-id"
                            value={studentIdInput}
                            onChange={e => setStudentIdInput(e.target.value.toUpperCase())}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                            placeholder="Enter Student ID"
                            autoFocus
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex flex-row-reverse gap-3 rounded-b-xl">
            <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-sky-600 text-base font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 sm:w-auto sm:text-sm"
            >
                Find & Print
            </button>
            <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                onClick={handleClose}
            >
                Cancel
            </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default PrintTcSearchModal;
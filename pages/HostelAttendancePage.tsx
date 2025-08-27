import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BackIcon, HomeIcon, ClipboardDocumentCheckIcon } from '../components/Icons';

const HostelAttendancePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
                    <BackIcon className="w-5 h-5" /> Back
                </button>
                <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors" title="Go to Home">
                    <HomeIcon className="w-5 h-5" /> Home
                </Link>
            </div>
            <div className="text-center py-16">
                <div className="inline-block p-4 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-full shadow-lg mb-4">
                    <ClipboardDocumentCheckIcon className="w-12 h-12" />
                </div>
                <h1 className="text-3xl font-bold text-slate-800 mt-4">Hostel Attendance Tracking</h1>
                <p className="text-slate-600 mt-2 text-lg">This feature is currently under development.</p>
                <p className="text-slate-500 mt-1">You will be able to manage daily attendance and leave requests here.</p>
            </div>
        </div>
    );
};

export default HostelAttendancePage;
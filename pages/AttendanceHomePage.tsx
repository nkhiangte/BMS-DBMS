
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Role, Grade } from '../types';
import { GRADES_LIST } from '../constants';
import { BackIcon, HomeIcon, ClipboardDocumentCheckIcon } from '../components/Icons';

interface AttendanceHomePageProps {
  user: User;
  teacherAssignedGrade: Grade | null;
}

const AttendanceHomePage: React.FC<AttendanceHomePageProps> = ({ user, teacherAssignedGrade }) => {
    const navigate = useNavigate();
    const [selectedGrade, setSelectedGrade] = useState<Grade | ''>('');
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (user.role === Role.TEACHER && teacherAssignedGrade) {
            setSelectedGrade(teacherAssignedGrade);
        }
    }, [user, teacherAssignedGrade]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedGrade && selectedDate) {
            navigate(`/attendance/take/${encodeURIComponent(selectedGrade)}/${selectedDate}`);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
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

            <div className="text-center">
                <ClipboardDocumentCheckIcon className="w-16 h-16 mx-auto text-teal-600 bg-teal-100 p-3 rounded-full" />
                <h1 className="text-3xl font-bold text-slate-800 mt-4">Attendance Management</h1>
                <p className="text-slate-600 mt-2">Select a class and a date to take or view attendance.</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div>
                    <label htmlFor="grade-select" className="block text-sm font-bold text-slate-800 mb-2">Select Class</label>
                    <select
                        id="grade-select"
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value as Grade)}
                        required
                        disabled={user.role === Role.TEACHER && !!teacherAssignedGrade}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition disabled:bg-slate-100"
                    >
                        {user.role === Role.TEACHER && teacherAssignedGrade ? (
                             <option value={teacherAssignedGrade}>{teacherAssignedGrade}</option>
                        ) : (
                            <>
                                <option value="" disabled>-- Select a class --</option>
                                {GRADES_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                            </>
                        )}
                    </select>
                </div>
                <div>
                    <label htmlFor="date-select" className="block text-sm font-bold text-slate-800 mb-2">Select Date</label>
                    <input
                        type="date"
                        id="date-select"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                    />
                </div>
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={!selectedGrade || !selectedDate}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition disabled:bg-slate-400"
                    >
                        Take Attendance
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AttendanceHomePage;

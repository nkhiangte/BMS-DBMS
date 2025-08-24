import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Student } from '../types';
import { BackIcon, HomeIcon, DocumentReportIcon, EditIcon } from '../components/Icons';
import { formatStudentId } from '../utils';
import { TERMINAL_EXAMS } from '../constants';

interface ProgressReportPageProps {
  students: Student[];
  academicYear: string;
}

const ProgressReportPage: React.FC<ProgressReportPageProps> = ({ students, academicYear }) => {
    const { studentId } = useParams<{ studentId: string }>();
    const navigate = useNavigate();

    const student = useMemo(() => students.find(s => s.id === studentId), [students, studentId]);
    
    if (!student) {
        return (
            <div className="text-center bg-white p-10 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-red-600">Student Not Found</h2>
                <button onClick={() => navigate(-1)} className="mt-6 flex items-center mx-auto justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition">
                    <BackIcon className="w-5 h-5" />
                    Return
                </button>
            </div>
        );
    }
    
    return (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex justify-between items-center">
                <button
                    onClick={() => navigate(`/student/${student.id}`)}
                    className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors"
                >
                    <BackIcon className="w-5 h-5" />
                    Back to Profile
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

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Progress Reports</h1>
                <p className="text-slate-700 text-lg mt-1">{student.name} ({formatStudentId(student, academicYear)})</p>
            </div>
            
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800">Available Reports</h2>
                <p className="text-slate-700">Select a term to view, print, or edit the report card marks.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                    {TERMINAL_EXAMS.map(exam => (
                         <div key={exam.id} className="bg-slate-50 rounded-lg p-6 flex flex-col items-start hover:bg-sky-50 hover:shadow-md transition-all">
                            <div className="flex-grow">
                                <DocumentReportIcon className="w-10 h-10 text-sky-500 mb-3" />
                                <h3 className="text-lg font-bold text-slate-800">{exam.name}</h3>
                            </div>
                            <div className="mt-4 w-full flex flex-col sm:flex-row gap-2">
                                <Link 
                                    to={`/report-card/${student.id}/${exam.id}`}
                                    className="flex-grow text-center block px-3 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition"
                                >
                                    View & Print Report
                                </Link>
                                <Link
                                    to={`/student/${student.id}/academics`}
                                    className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                                >
                                    <EditIcon className="w-4 h-4" />
                                    <span>Edit Marks</span>
                                </Link>
                            </div>
                         </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProgressReportPage;
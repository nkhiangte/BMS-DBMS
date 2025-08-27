
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Student, Grade, DailyStudentAttendance, StudentAttendanceRecord, StudentAttendanceStatus, User, StudentStatus } from '../types';
import { BackIcon, HomeIcon, CheckIcon, SpinnerIcon, CheckCircleIcon } from '../components/Icons';

interface StudentAttendancePageProps {
  students: Student[];
  allAttendance: DailyStudentAttendance | null;
  onUpdateAttendance: (grade: Grade, records: StudentAttendanceRecord) => Promise<void>;
  user: User;
}

const Toast: React.FC<{ message: string; onDismiss: () => void; }> = ({ message, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 3000);
        return () => clearTimeout(timer);
    }, [onDismiss]);
    return (
        <div className="fixed top-20 right-5 bg-emerald-500 text-white shadow-lg rounded-lg p-4 flex items-center gap-3 z-50 animate-fade-in">
            <CheckCircleIcon className="w-6 h-6" />
            <p className="text-sm font-semibold">{message}</p>
        </div>
    );
};

const StudentAttendancePage: React.FC<StudentAttendancePageProps> = ({ students, allAttendance, onUpdateAttendance, user }) => {
    const { grade: encodedGrade } = useParams<{ grade: string }>();
    const navigate = useNavigate();
    const grade = useMemo(() => encodedGrade ? decodeURIComponent(encodedGrade) as Grade : undefined, [encodedGrade]);

    const classStudents = useMemo(() => {
        if (!grade) return [];
        return students
            .filter(s => s.grade === grade && s.status === StudentStatus.ACTIVE)
            .sort((a, b) => a.rollNo - b.rollNo);
    }, [students, grade]);

    const [records, setRecords] = useState<StudentAttendanceRecord>({});
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    useEffect(() => {
        const initialRecords = allAttendance?.[grade as string] || {};
        const fullRecords: StudentAttendanceRecord = {};
        classStudents.forEach(student => {
            fullRecords[student.id] = initialRecords[student.id] || StudentAttendanceStatus.PRESENT;
        });
        setRecords(fullRecords);
    }, [allAttendance, grade, classStudents]);

    const handleStatusChange = (studentId: string, status: StudentAttendanceStatus) => {
        setRecords(prev => ({ ...prev, [studentId]: status }));
    };

    const handleMarkAll = (status: StudentAttendanceStatus) => {
        const newRecords: StudentAttendanceRecord = {};
        classStudents.forEach(student => {
            newRecords[student.id] = status;
        });
        setRecords(newRecords);
    };

    const handleSave = async () => {
        if (!grade) return;
        setIsSaving(true);
        await onUpdateAttendance(grade, records);
        setIsSaving(false);
        setShowSuccessToast(true);
    };

    const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const StatusButton: React.FC<{ studentId: string, status: StudentAttendanceStatus, label: string }> = ({ studentId, status, label }) => {
        const currentStatus = records[studentId];
        const isActive = currentStatus === status;
        
        const colors = {
            [StudentAttendanceStatus.PRESENT]: 'bg-emerald-100 text-emerald-800 border-emerald-300',
            [StudentAttendanceStatus.ABSENT]: 'bg-rose-100 text-rose-800 border-rose-300',
            [StudentAttendanceStatus.LEAVE]: 'bg-amber-100 text-amber-800 border-amber-300',
        };
        const activeColors = {
            [StudentAttendanceStatus.PRESENT]: 'bg-emerald-500 text-white',
            [StudentAttendanceStatus.ABSENT]: 'bg-rose-500 text-white',
            [StudentAttendanceStatus.LEAVE]: 'bg-amber-500 text-white',
        }

        return (
            <button
                onClick={() => handleStatusChange(studentId, status)}
                className={`px-3 py-1.5 text-sm font-bold rounded-full border transition-colors ${isActive ? activeColors[status] : `hover:bg-slate-200 ${colors[status]}`}`}
            >
                {label}
            </button>
        );
    };

    if (!grade) {
        return <div>Invalid class specified.</div>;
    }

    return (
        <>
            {showSuccessToast && <Toast message="Attendance saved successfully!" onDismiss={() => setShowSuccessToast(false)} />}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
                <div className="mb-6 flex justify-between items-center">
                    <button onClick={() => navigate(`/classes/${encodedGrade}`)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800">
                        <BackIcon className="w-5 h-5" /> Back to Class
                    </button>
                    <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800" title="Go to Home">
                        <HomeIcon className="w-5 h-5" /> <span>Home</span>
                    </Link>
                </div>

                <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Daily Attendance - {grade}</h1>
                        <p className="text-slate-600 mt-1">{today}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                         <button onClick={() => handleMarkAll(StudentAttendanceStatus.PRESENT)} className="text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full px-3 py-1 hover:bg-emerald-200">Mark All Present</button>
                         <button onClick={() => handleMarkAll(StudentAttendanceStatus.ABSENT)} className="text-xs font-semibold text-rose-700 bg-rose-100 rounded-full px-3 py-1 hover:bg-rose-200">Mark All Absent</button>
                    </div>
                </div>

                <div className="overflow-x-auto border rounded-lg">
                     <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase w-16">Roll No</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Student Name</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-800 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {classStudents.map(student => (
                                <tr key={student.id}>
                                    <td className="px-6 py-3 text-sm font-semibold text-slate-800">{student.rollNo}</td>
                                    <td className="px-6 py-3 text-sm font-medium text-slate-900">{student.name}</td>
                                    <td className="px-6 py-3">
                                        <div className="flex items-center justify-center gap-2">
                                            <StatusButton studentId={student.id} status={StudentAttendanceStatus.PRESENT} label="Present"/>
                                            <StatusButton studentId={student.id} status={StudentAttendanceStatus.ABSENT} label="Absent"/>
                                            <StatusButton studentId={student.id} status={StudentAttendanceStatus.LEAVE} label="Leave"/>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                     </table>
                     {classStudents.length === 0 && (
                        <p className="text-center py-8 text-slate-600">No active students found in this class.</p>
                     )}
                </div>
                 <div className="mt-6 flex justify-end">
                    <button onClick={handleSave} disabled={isSaving} className="btn btn-primary text-base px-6 py-3 disabled:bg-slate-400">
                        {isSaving ? <SpinnerIcon className="w-5 h-5"/> : <CheckIcon className="w-5 h-5" />}
                        <span>{isSaving ? 'Saving...' : 'Save Attendance'}</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default StudentAttendancePage;



import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Student, Grade, AttendanceRecord, AttendanceStatus, StudentStatus } from '../types';
import { BackIcon, HomeIcon, CheckIcon } from '../components/Icons';
import { ATTENDANCE_STATUS_LIST } from '../constants';

interface TakeAttendancePageProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  onSave: (records: Map<string, { studentId: string; grade: Grade; status: AttendanceStatus; notes?: string }>, date: string, grade: Grade) => Promise<{ success: boolean; message?: string }>;
}

const TakeAttendancePage: React.FC<TakeAttendancePageProps> = ({ students, attendanceRecords, onSave }) => {
    const { grade: encodedGrade, date } = useParams<{ grade: string, date: string }>();
    const navigate = useNavigate();

    const grade = useMemo(() => encodedGrade ? decodeURIComponent(encodedGrade) as Grade : undefined, [encodedGrade]);
    
    const [attendanceData, setAttendanceData] = useState<Map<string, { status: AttendanceStatus; notes?: string }>>(new Map());
    const [isSaved, setIsSaved] = useState(false);

    const classStudents = useMemo(() => {
        if (!grade) return [];
        return students
            .filter(s => s.grade === grade && s.status === StudentStatus.ACTIVE)
            .sort((a, b) => a.rollNo - b.rollNo);
    }, [students, grade]);

    useEffect(() => {
        const initialData = new Map<string, { status: AttendanceStatus; notes?: string }>();
        const todaysRecords = attendanceRecords.filter(r => r.date === date && r.grade === grade);

        classStudents.forEach(student => {
            const record = todaysRecords.find(r => r.studentId === student.id);
            initialData.set(student.id, {
                status: record ? record.status : AttendanceStatus.PRESENT,
                notes: record ? record.notes : '',
            });
        });
        setAttendanceData(initialData);
    }, [classStudents, attendanceRecords, date, grade]);

    const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
        setIsSaved(false);
        setAttendanceData(prev => new Map(prev).set(studentId, { ...prev.get(studentId)!, status }));
    };

    const handleNotesChange = (studentId: string, notes: string) => {
        setIsSaved(false);
        setAttendanceData(prev => new Map(prev).set(studentId, { ...prev.get(studentId)!, notes }));
    };

    const handleMarkAllPresent = () => {
        setIsSaved(false);
        const newData = new Map(attendanceData);
        classStudents.forEach(student => {
            newData.set(student.id, { ...newData.get(student.id)!, status: AttendanceStatus.PRESENT });
        });
        setAttendanceData(newData);
    };

    const handleSave = async () => {
        if (!grade || !date) return;
        
        const recordsToSave = new Map<string, { studentId: string; grade: Grade; status: AttendanceStatus; notes?: string }>();
        attendanceData.forEach((data, studentId) => {
            recordsToSave.set(studentId, { studentId, grade, ...data });
        });

        const result = await onSave(recordsToSave, date, grade);
        if (result.success) {
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        }
    };
    
    const getStatusColor = (status: AttendanceStatus) => {
        switch (status) {
            case AttendanceStatus.PRESENT: return 'bg-emerald-500 hover:bg-emerald-600';
            case AttendanceStatus.ABSENT: return 'bg-rose-500 hover:bg-rose-600';
            case AttendanceStatus.LATE: return 'bg-amber-500 hover:bg-amber-600';
            case AttendanceStatus.EXCUSED: return 'bg-sky-500 hover:bg-sky-600';
            default: return 'bg-slate-500 hover:bg-slate-600';
        }
    };
    
    if (!grade || !date) {
        return <div>Error: Missing class or date.</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex justify-between items-center">
                <button
                    onClick={() => navigate('/attendance')}
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

            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Take Attendance</h1>
                    <p className="text-slate-600 mt-1 text-lg">
                        Class: <span className="font-semibold text-sky-700">{grade}</span> | 
                        Date: <span className="font-semibold text-sky-700">{date}</span>
                    </p>
                </div>
                <button onClick={handleMarkAllPresent} className="btn btn-secondary">
                    Mark All Present
                </button>
            </div>

            <div className="space-y-3">
                {classStudents.map(student => {
                    const studentAttendance = attendanceData.get(student.id);
                    return (
                        <div key={student.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-3 bg-slate-50 rounded-lg">
                            <div className="font-semibold text-slate-800">
                                <span className="text-slate-500 mr-2">{student.rollNo}.</span>
                                {student.name}
                            </div>
                            <div className="flex items-center gap-2">
                                {ATTENDANCE_STATUS_LIST.map(status => (
                                    <button
                                        key={status}
                                        onClick={() => handleStatusChange(student.id, status)}
                                        className={`px-3 py-1 text-xs font-semibold text-white rounded-full transition-transform hover:scale-105 ${getStatusColor(status)} ${studentAttendance?.status === status ? 'ring-2 ring-offset-2 ring-sky-500' : ''}`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                            <input
                                type="text"
                                placeholder="Add notes (optional)..."
                                value={studentAttendance?.notes || ''}
                                onChange={e => handleNotesChange(student.id, e.target.value)}
                                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
                            />
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 flex justify-end">
                <button 
                    onClick={handleSave}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-lg shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 w-48"
                >
                    {isSaved ? (
                        <>
                            <CheckIcon className="w-5 h-5" />
                            Saved!
                        </>
                    ) : (
                        'Save Attendance'
                    )}
                </button>
            </div>
        </div>
    );
};

export default TakeAttendancePage;
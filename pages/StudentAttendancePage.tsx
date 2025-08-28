import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Student, Grade, DailyStudentAttendance, StudentAttendanceRecord, StudentAttendanceStatus, User, StudentStatus } from '../types';
import { BackIcon, HomeIcon, CheckIcon, SpinnerIcon, CheckCircleIcon, InboxArrowDownIcon, ChevronDownIcon, ChevronUpIcon } from '../components/Icons';
import { exportAttendanceToCsv } from '../utils';

interface StudentAttendancePageProps {
  students: Student[];
  allAttendance: DailyStudentAttendance | null;
  onUpdateAttendance: (grade: Grade, records: StudentAttendanceRecord) => Promise<void>;
  user: User;
  fetchStudentAttendanceForMonth: (grade: Grade, year: number, month: number) => Promise<{ [date: string]: StudentAttendanceRecord }>;
  academicYear: string;
  assignedGrade: Grade | null;
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

const AbsenteesList: React.FC<{ students: Student[], records: StudentAttendanceRecord }> = ({ students, records }) => {
    const absentees = useMemo(() => {
        return students.filter(student => records[student.id] === StudentAttendanceStatus.ABSENT);
    }, [students, records]);

    if (absentees.length === 0) {
        return (
            <div className="text-center p-4 bg-emerald-50 text-emerald-700 rounded-md mt-6">
                <p>No students were absent on this day.</p>
            </div>
        );
    }

    return (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-lg mt-6">
            <h3 className="font-bold text-rose-800 mb-2">Absent Students ({absentees.length})</h3>
            <ul className="list-decimal list-inside text-slate-800 columns-2">
                {absentees.map(student => (
                    <li key={student.id}>{student.name} (Roll No: {student.rollNo})</li>
                ))}
            </ul>
        </div>
    );
};


const StudentAttendancePage: React.FC<StudentAttendancePageProps> = ({ students, allAttendance, onUpdateAttendance, user, fetchStudentAttendanceForMonth, academicYear, assignedGrade }) => {
    const { grade: encodedGrade } = useParams<{ grade: string }>();
    const navigate = useNavigate();
    const grade = useMemo(() => encodedGrade ? decodeURIComponent(encodedGrade) as Grade : undefined, [encodedGrade]);
    
    const isClassTeacher = user.role === 'admin' || grade === assignedGrade;

    const classStudents = useMemo(() => {
        if (!grade) return [];
        return students
            .filter(s => s.grade === grade && s.status === StudentStatus.ACTIVE)
            .sort((a, b) => a.rollNo - b.rollNo);
    }, [students, grade]);

    const toYYYYMMDD = (date: Date) => date.toISOString().split('T')[0];
    const todayStr = useMemo(() => toYYYYMMDD(new Date()), []);
    
    const [selectedDate, setSelectedDate] = useState<string>(todayStr);
    const [records, setRecords] = useState<StudentAttendanceRecord>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [exportMonth, setExportMonth] = useState(new Date().toISOString().slice(0, 7));
    const [isExporting, setIsExporting] = useState(false);

    // State for recent absentees
    const [isRecentAbsenteesVisible, setIsRecentAbsenteesVisible] = useState(false);
    const [recentAbsentees, setRecentAbsentees] = useState<Record<string, { date: Date, absentees: Student[] }>>({});
    const [isLoadingRecent, setIsLoadingRecent] = useState(true);

    const isToday = selectedDate === todayStr;

    useEffect(() => {
        const fetchDataForDate = async (dateStr: string) => {
            if (!grade) return;
            setIsLoading(true);

            let attendanceData: StudentAttendanceRecord = {};
            const isFetchingToday = dateStr === todayStr;

            if (isFetchingToday) {
                attendanceData = allAttendance?.[grade] || {};
            } else {
                const [year, month] = dateStr.split('-').map(Number);
                try {
                    const monthlyData = await fetchStudentAttendanceForMonth(grade, year, month);
                    attendanceData = monthlyData[dateStr] || {};
                } catch (e) {
                    console.error("Error fetching historical attendance", e);
                }
            }
            
            const fullRecords: StudentAttendanceRecord = {};
            classStudents.forEach(student => {
                const status = attendanceData[student.id];
                if (status) {
                    fullRecords[student.id] = status;
                } else if (isFetchingToday) {
                    fullRecords[student.id] = StudentAttendanceStatus.PRESENT;
                }
            });
            
            setRecords(fullRecords);
            setIsLoading(false);
        };

        fetchDataForDate(selectedDate);
    }, [selectedDate, allAttendance, classStudents, grade, fetchStudentAttendanceForMonth, todayStr]);

    useEffect(() => {
        const getPreviousWorkingDays = (count: number): Date[] => {
            const dates: Date[] = [];
            let currentDate = new Date();
            
            while (dates.length < count) {
                currentDate.setDate(currentDate.getDate() - 1);
                const dayOfWeek = currentDate.getDay();
                if (dayOfWeek !== 0) { // 0 is Sunday
                    dates.push(new Date(currentDate));
                }
            }
            return dates;
        };

        const fetchRecentAbsentees = async () => {
            if (!grade || classStudents.length === 0) {
                setIsLoadingRecent(false);
                return;
            }

            setIsLoadingRecent(true);
            const prev5WorkingDaysDates = getPreviousWorkingDays(5);
            const prev5WorkingDaysStrings = prev5WorkingDaysDates.map(toYYYYMMDD);
            
            const monthsToFetch = [...new Set(prev5WorkingDaysStrings.map(d => d.substring(0, 7)))];
            
            const allMonthlyData: { [date: string]: StudentAttendanceRecord } = {};

            for (const monthStr of monthsToFetch) {
                const [year, month] = monthStr.split('-').map(Number);
                try {
                    const monthlyData = await fetchStudentAttendanceForMonth(grade, year, month);
                    Object.assign(allMonthlyData, monthlyData);
                } catch (error) {
                    console.error(`Failed to fetch attendance for ${monthStr}`, error);
                }
            }

            const absenteesByDate: Record<string, { date: Date, absentees: Student[] }> = {};
            const studentMap = new Map(classStudents.map(s => [s.id, s]));

            prev5WorkingDaysDates.forEach(dateObj => {
                const dateStr = toYYYYMMDD(dateObj);
                const dailyRecord = allMonthlyData[dateStr];
                
                if (dailyRecord) {
                    const absentStudentIds = Object.keys(dailyRecord).filter(
                        studentId => dailyRecord[studentId] === StudentAttendanceStatus.ABSENT
                    );
                    absenteesByDate[dateStr] = {
                        date: dateObj,
                        absentees: absentStudentIds
                            .map(id => studentMap.get(id))
                            .filter((s): s is Student => !!s)
                            .sort((a,b) => a.rollNo - b.rollNo)
                    };
                } else {
                     absenteesByDate[dateStr] = { date: dateObj, absentees: [] };
                }
            });
            
            setRecentAbsentees(absenteesByDate);
            setIsLoadingRecent(false);
        };

        fetchRecentAbsentees();
    }, [grade, classStudents, fetchStudentAttendanceForMonth]);


    const handleStatusChange = (studentId: string, status: StudentAttendanceStatus) => {
        if (!isToday) return;
        setRecords(prev => ({ ...prev, [studentId]: status }));
    };

    const handleMarkAll = (status: StudentAttendanceStatus) => {
        if (!isToday) return;
        const newRecords: StudentAttendanceRecord = {};
        classStudents.forEach(student => {
            newRecords[student.id] = status;
        });
        setRecords(newRecords);
    };

    const handleSave = async () => {
        if (!grade || !isToday) return;
        setIsSaving(true);
        await onUpdateAttendance(grade, records);
        setIsSaving(false);
        setShowSuccessToast(true);
    };

    const handleExport = async () => {
        if (!exportMonth || !grade) {
            alert("Please select a month to export.");
            return;
        }
        setIsExporting(true);
        try {
            const [year, month] = exportMonth.split('-').map(Number);
            const attendanceData = await fetchStudentAttendanceForMonth(grade, year, month);
            exportAttendanceToCsv({
                people: classStudents,
                attendanceData,
                month: exportMonth,
                entityName: grade,
                entityType: 'Student',
                academicYear,
            });
        } catch (error) {
            console.error("Failed to export student attendance:", error);
            alert("An error occurred while exporting data. Please check the console.");
        } finally {
            setIsExporting(false);
        }
    };
    
    const formattedSelectedDate = new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

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
                disabled={!isClassTeacher || !isToday}
                className={`px-3 py-1.5 text-sm font-bold rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${isActive ? activeColors[status] : `hover:bg-slate-200 ${colors[status]}`}`}
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
                        <h1 className="text-3xl font-bold text-slate-800">Student Attendance - {grade}</h1>
                        <p className="text-slate-600 mt-1">{formattedSelectedDate}</p>
                    </div>
                </div>

                <div className="my-6 p-4 bg-slate-50 border rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-bold text-slate-800">View & Export Records</h3>
                        <div className="flex items-center gap-3 mt-2">
                           <input 
                                type="date" 
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                max={todayStr}
                                className="form-input px-3 py-2 border-slate-300 rounded-md shadow-sm"
                            />
                            {!isToday && <button onClick={() => setSelectedDate(todayStr)} className="btn btn-secondary">Go to Today</button>}
                        </div>
                    </div>
                     <div className="flex items-center gap-3">
                        <input 
                            type="month" 
                            value={exportMonth}
                            onChange={(e) => setExportMonth(e.target.value)}
                            className="form-input px-3 py-2 border-slate-300 rounded-md shadow-sm"
                        />
                        <button 
                            onClick={handleExport}
                            disabled={isExporting}
                            className="btn btn-secondary disabled:opacity-70 disabled:cursor-wait"
                        >
                            {isExporting ? <SpinnerIcon className="w-5 h-5" /> : <InboxArrowDownIcon className="w-5 h-5" />}
                            <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
                        </button>
                    </div>
                </div>

                {isClassTeacher && isToday && (
                     <div className="flex flex-wrap gap-2 mb-4">
                        <button onClick={() => handleMarkAll(StudentAttendanceStatus.PRESENT)} className="text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full px-3 py-1 hover:bg-emerald-200">Mark All Present</button>
                        <button onClick={() => handleMarkAll(StudentAttendanceStatus.ABSENT)} className="text-xs font-semibold text-rose-700 bg-rose-100 rounded-full px-3 py-1 hover:bg-rose-200">Mark All Absent</button>
                    </div>
                )}
                
                {isLoading ? (
                    <div className="text-center py-20 flex items-center justify-center gap-3">
                        <SpinnerIcon className="w-8 h-8 text-sky-600"/>
                        <span className="text-slate-600 font-semibold">Loading Attendance...</span>
                    </div>
                ) : (
                    <>
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
                                                    {!isToday && !records[student.id] ? (
                                                        <span className="px-3 py-1.5 text-sm font-bold rounded-full border bg-slate-100 text-slate-500">Not Marked</span>
                                                    ) : (
                                                        <>
                                                            <StatusButton studentId={student.id} status={StudentAttendanceStatus.PRESENT} label="Present"/>
                                                            <StatusButton studentId={student.id} status={StudentAttendanceStatus.ABSENT} label="Absent"/>
                                                            <StatusButton studentId={student.id} status={StudentAttendanceStatus.LEAVE} label="Leave"/>
                                                        </>
                                                    )}
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
                        
                        <AbsenteesList students={classStudents} records={records} />

                        <div className="mt-6">
                            <button
                                onClick={() => setIsRecentAbsenteesVisible(prev => !prev)}
                                className="w-full flex justify-between items-center p-3 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-slate-800 transition-colors"
                            >
                                <span>Absentees From Previous 5 Working Days</span>
                                {isRecentAbsenteesVisible ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                            </button>
                            {isRecentAbsenteesVisible && (
                                <div className="mt-2 p-4 border rounded-b-lg animate-fade-in">
                                    {isLoadingRecent ? (
                                        <p className="text-slate-600">Loading recent absentee data...</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {Object.values(recentAbsentees).sort((a,b) => b.date.getTime() - a.date.getTime()).map(({ date, absentees }) => (
                                                <div key={date.toISOString()}>
                                                    <h4 className="font-semibold text-slate-700">{date.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h4>
                                                    {absentees.length > 0 ? (
                                                        <ul className="list-disc list-inside text-slate-600 pl-4 columns-1 sm:columns-2 md:columns-3">
                                                            {absentees.map(s => <li key={s.id}>{s.name} (Roll {s.rollNo})</li>)}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-sm text-emerald-700 pl-4 italic">All students were present.</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>


                         {isClassTeacher && isToday && (
                            <div className="mt-6 flex justify-end">
                                <button onClick={handleSave} disabled={isSaving} className="btn btn-primary text-base px-6 py-3 disabled:bg-slate-400">
                                    {isSaving ? <SpinnerIcon className="w-5 h-5"/> : <CheckIcon className="w-5 h-5" />}
                                    <span>{isSaving ? 'Saving...' : 'Save Today\'s Attendance'}</span>
                                </button>
                            </div>
                         )}
                    </>
                )}
            </div>
        </>
    );
};

export default StudentAttendancePage;
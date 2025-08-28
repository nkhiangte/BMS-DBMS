import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Student, Grade, GradeDefinition, StudentStatus, StudentAttendanceRecord, StudentAttendanceStatus, Exam, SubjectMark } from '../types';
import { BackIcon, HomeIcon, DocumentReportIcon, EditIcon, SpinnerIcon } from '../components/Icons';
import { formatStudentId, calculateStudentResult, calculateRanks, getMonthsForTerm, getPerformanceGrade, getRemarks, isSubjectNumeric } from '../utils';
import { TERMINAL_EXAMS, GRADES_WITH_NO_ACTIVITIES } from '../constants';

interface ProgressReportPageProps {
  students: Student[];
  academicYear: string;
  gradeDefinitions: Record<Grade, GradeDefinition>;
  fetchStudentAttendanceForMonth: (grade: Grade, year: number, month: number) => Promise<{ [date: string]: StudentAttendanceRecord }>;
}

interface TermSummaryData {
    percentage: string;
    attendance: string;
    rank: number | 'NA' | null;
    result: string;
    grade: string;
    remarks: string;
}

const SummaryItem: React.FC<{ label: string; value: string | number | null; }> = ({ label, value }) => (
    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
        <div className="text-sm text-slate-600 font-semibold">{label}</div>
        <div className={`text-2xl font-bold text-slate-900 mt-1`}>{value ?? '--'}</div>
    </div>
);


const ProgressReportPage: React.FC<ProgressReportPageProps> = ({ students, academicYear, gradeDefinitions, fetchStudentAttendanceForMonth }) => {
    const { studentId } = useParams<{ studentId: string }>();
    const navigate = useNavigate();

    const student = useMemo(() => students.find(s => s.id === studentId), [students, studentId]);

    const [termSummaries, setTermSummaries] = useState<Record<string, TermSummaryData | null>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const calculateAllSummaries = async () => {
            if (!student || !academicYear) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);

            const summaries: Record<string, TermSummaryData | null> = {};
            const gradeDef = gradeDefinitions[student.grade];
            if (!gradeDef) {
                setIsLoading(false);
                return;
            }

            const classmates = students.filter(s => s.grade === student.grade && s.status === StudentStatus.ACTIVE);
            const [startYearStr] = academicYear.split('-');
            const startYear = parseInt(startYearStr, 10);
            const hasActivities = !GRADES_WITH_NO_ACTIVITIES.includes(student.grade);

            for (const exam of TERMINAL_EXAMS) {
                const examData = student.academicPerformance?.find(e => e.id === exam.id);
                const termResults = examData?.results || [];

                if (termResults.length === 0) {
                    summaries[exam.id] = null;
                    continue;
                }

                // --- Calculate Rank ---
                const studentScores = classmates.map(s => {
                    const sExam = s.academicPerformance?.find(e => e.id === exam.id);
                    const sResults = sExam?.results || [];
                    const sGradeDef = gradeDefinitions[s.grade];
                    let totalMarks = 0;
                    if (sGradeDef) {
                        sGradeDef.subjects.filter(sub => isSubjectNumeric(sub, s.grade)).forEach(sub => {
                            const res = sResults.find(r => r.subject === sub.name);
                            totalMarks += (res?.marks ?? (res?.examMarks ?? 0) + (res?.activityMarks ?? 0));
                        });
                    }
                    const { finalResult } = calculateStudentResult(sResults, sGradeDef, s.grade);
                    return { studentId: s.id, totalMarks, result: finalResult };
                });
                const classRanks = calculateRanks(studentScores);
                const studentRank = classRanks.get(student.id) ?? null;

                // --- Calculate Attendance ---
                let present = 0;
                let absent = 0;
                const termMonths = getMonthsForTerm(exam.id);
                for (const { month, yearOffset } of termMonths) {
                    const year = startYear + yearOffset;
                    try {
                        const monthlyData = await fetchStudentAttendanceForMonth(student.grade, year, month + 1);
                        Object.values(monthlyData).forEach(dailyRecord => {
                            const status = dailyRecord[student.id];
                            if (status === StudentAttendanceStatus.PRESENT) present++;
                            else if (status === StudentAttendanceStatus.ABSENT) absent++;
                        });
                    } catch (error) {
                        console.error(`Could not fetch attendance for ${exam.name}:`, error);
                    }
                }
                const totalDays = present + absent;
                const termAttendance = totalDays > 0 ? `${((present / totalDays) * 100).toFixed(2)}%` : 'N/A';

                // --- Academic Summary ---
                let grandTotal = 0;
                let maxGrandTotal = 0;
                gradeDef.subjects.filter(sub => isSubjectNumeric(sub, student.grade)).forEach(sub => {
                    const res = termResults.find(r => r.subject === sub.name);
                    grandTotal += (res?.marks ?? (res?.examMarks ?? 0) + (res?.activityMarks ?? 0));
                    maxGrandTotal += sub.examFullMarks + (hasActivities && sub.activityFullMarks > 0 ? sub.activityFullMarks : 0);
                });

                const percentage = maxGrandTotal > 0 ? (grandTotal / maxGrandTotal) * 100 : 0;
                const { finalResult } = calculateStudentResult(termResults, gradeDef, student.grade);
                
                summaries[exam.id] = {
                    percentage: `${percentage.toFixed(2)}%`,
                    attendance: termAttendance,
                    rank: studentRank,
                    result: finalResult,
                    grade: getPerformanceGrade(percentage, finalResult, student.grade),
                    remarks: getRemarks(percentage, finalResult),
                };
            }
            setTermSummaries(summaries);
            setIsLoading(false);
        };
        calculateAllSummaries();
    }, [student, students, academicYear, gradeDefinitions, fetchStudentAttendanceForMonth]);
    
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

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Progress Reports</h1>
                <p className="text-slate-700 text-lg mt-1">{student.name} ({formatStudentId(student, academicYear)})</p>
            </div>

            {isLoading ? (
                <div className="text-center p-8 flex items-center justify-center gap-3">
                    <SpinnerIcon className="w-8 h-8 text-sky-600"/>
                    <span className="text-slate-600 font-semibold">Calculating Term Summaries...</span>
                </div>
            ) : (
                <div className="space-y-8">
                    {TERMINAL_EXAMS.map(exam => {
                        const summary = termSummaries[exam.id];
                        const isHighSchool = student.grade === Grade.IX || student.grade === Grade.X;
                        return (
                            <div key={exam.id}>
                                <h2 className="text-xl font-bold text-slate-800 mb-4">{exam.name} Summary</h2>
                                {summary ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                        <SummaryItem label="%" value={summary.percentage} />
                                        <SummaryItem label="Attendance" value={summary.attendance} />
                                        <SummaryItem label="Rank" value={summary.rank} />
                                        <SummaryItem label="Result" value={summary.result} />
                                        <SummaryItem label={isHighSchool ? "Division" : "Grade"} value={summary.grade} />
                                        <SummaryItem label="Remarks" value={summary.remarks} />
                                    </div>
                                ) : (
                                    <div className="p-4 bg-slate-50 text-slate-600 rounded-lg border text-center">
                                        Marks for this term have not been entered yet.
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
            
            <div className="mt-12 pt-8 border-t">
                <h2 className="text-xl font-bold text-slate-800">Printable Report Cards</h2>
                <p className="text-slate-700">Select a term to view, print, or edit the detailed report card.</p>
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

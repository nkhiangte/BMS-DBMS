import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Student, Grade, GradeDefinition, StudentStatus, StudentAttendanceRecord, StudentAttendanceStatus, SubjectMark, SubjectDefinition } from '../types';
import { BackIcon, UserIcon, HomeIcon, PrinterIcon, SpinnerIcon } from '../components/Icons';
import { formatStudentId, formatDateForDisplay, calculateStudentResult, calculateRanks, getPerformanceGrade, getRemarks, getMonthsForTerm, isSubjectNumeric } from '../utils';
import { GRADES_WITH_NO_ACTIVITIES, TERMINAL_EXAMS } from '../constants';

// --- Reusable Components (also used in single PrintableReportCardPage) ---
const PhotoWithFallback: React.FC<{src?: string, alt: string}> = ({ src, alt }) => {
    // Component implementation is the same...
    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.style.display = 'none';
        const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon');
        if(fallback) (fallback as HTMLElement).style.display = 'flex';
    };
    return (
        <div className="relative w-full h-full bg-slate-200 flex items-center justify-center border">
            {src && <img src={src} alt={alt} className="h-full w-full object-cover" onError={handleError} />}
            <div className={`fallback-icon absolute inset-0 items-center justify-center text-slate-400 ${src ? 'hidden' : 'flex'}`}>
                <UserIcon className="w-2/3 h-2/3" />
            </div>
        </div>
    )
};
const SummaryItem: React.FC<{ label: string; value: string | number | null; color?: string; }> = ({ label, value, color = 'text-slate-800' }) => (
    <div className="bg-slate-50 p-3 rounded-lg text-center">
        <div className="text-sm text-slate-500 font-semibold">{label}</div>
        <div className={`text-xl font-bold ${color}`}>{value ?? '--'}</div>
    </div>
);
const DetailItem: React.FC<{label: string, value?: string | number}> = ({ label, value }) => (
    <div><span className="font-semibold text-slate-800">{label}:</span> <span className="text-slate-800">{value || 'N/A'}</span></div>
);
// --- End of Reusable Components ---

interface ReportCardContentProps {
    student: Student;
    examDetails: { id: string; name: string };
    gradeDef: GradeDefinition;
    academicYear: string;
    termResults: SubjectMark[];
    summaryData: {
        percentage: string;
        result: string;
        performanceGrade: string;
        remarks: string;
    } | null;
    rank: number | 'NA' | null;
    termAttendance: string | null;
}

const ReportCardContent: React.FC<ReportCardContentProps> = ({ student, examDetails, gradeDef, academicYear, termResults, summaryData, rank, termAttendance }) => {
    const isHighSchool = student?.grade === Grade.IX || student?.grade === Grade.X;
    const hasActivitiesForThisGrade = !GRADES_WITH_NO_ACTIVITIES.includes(student.grade);
    
    return (
        <div className="bg-white p-8 print:shadow-none print:rounded-none" id={`report-card-${student.id}`}>
            <header className="text-center border-b-4 border-sky-700 pb-4 mb-6">
                <h1 className="text-4xl font-bold text-sky-800">Bethel Mission School</h1>
                <p className="text-lg font-semibold text-slate-600">Champhai, Mizoram</p>
                <p className="text-sm text-slate-500">DISE Code 15040100705</p>
                <h2 className="text-2xl font-semibold text-slate-600 mt-4">Progress Report - {examDetails?.name}</h2>
                <p className="text-lg text-slate-500">Academic Year: {academicYear}</p>
            </header>

            <section className="mb-6 p-4 border border-slate-300 rounded-lg">
                <h3 className="text-xl font-bold text-slate-700 mb-4">Student Information</h3>
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <div className="w-32 h-40 flex-shrink-0">
                        <PhotoWithFallback src={student.photographUrl} alt={`${student.name}'s photograph`} />
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-md flex-grow">
                       <DetailItem label="Name" value={student.name} />
                       <DetailItem label="Student ID" value={formatStudentId(student, academicYear)} />
                       <DetailItem label="Grade" value={student.grade} />
                       <DetailItem label="Roll No." value={String(student.rollNo)} />
                       <DetailItem label="Date of Birth" value={formatDateForDisplay(student.dateOfBirth)} />
                       <DetailItem label="Father's Name" value={student.fatherName} />
                    </div>
                </div>
            </section>
            
            <section className="mb-6">
                 <h3 className="text-xl font-bold text-slate-700 mb-2 text-center">Academic Performance</h3>
                 <table className="min-w-full border-collapse border border-slate-400 text-sm">
                    <thead className="bg-slate-100 font-semibold text-slate-800">
                        <tr>
                            <th className="border border-slate-300 px-2 py-1 text-left">Subject</th>
                            {hasActivitiesForThisGrade && <th className="border border-slate-300 px-2 py-1 text-center">Exam</th>}
                            {hasActivitiesForThisGrade && <th className="border border-slate-300 px-2 py-1 text-center">Activity</th>}
                            <th className="border border-slate-300 px-2 py-1 text-center">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {gradeDef.subjects.map((subjectDef) => {
                            const result = termResults.find(r => r.subject === subjectDef.name);
                            const isGradeBased = subjectDef.gradingSystem === 'OABC' || (subjectDef.examFullMarks === 0 && subjectDef.activityFullMarks === 0);
                            const examMarks = result?.examMarks ?? '-';
                            const activityMarks = result?.activityMarks ?? '-';
// FIX: Added parentheses to clarify the order of operations between '??' and '||' to resolve a TypeScript parsing error.
                            const total = (result?.marks ?? ((result?.examMarks ?? 0) + (result?.activityMarks ?? 0))) || '-';
                            
                            return (
                                <tr key={subjectDef.name}>
                                    <td className="border border-slate-300 px-2 py-1 text-left text-slate-800">{subjectDef.name}</td>
                                    {hasActivitiesForThisGrade && <td className="border border-slate-300 px-2 py-1 text-center">{isGradeBased ? '' : examMarks}</td>}
                                    {hasActivitiesForThisGrade && <td className="border border-slate-300 px-2 py-1 text-center">{isGradeBased ? '' : activityMarks}</td>}
                                    <td className="border border-slate-300 px-2 py-1 text-center font-bold">{isGradeBased ? result?.grade : total}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </section>

             {summaryData && (
                 <section>
                    <h3 className="text-xl font-bold text-slate-700 mb-4 text-center">{examDetails.name} Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <SummaryItem label="%" value={summaryData.percentage} />
                        <SummaryItem label="Attendance" value={termAttendance} />
                        <SummaryItem label="Rank" value={rank} />
                        <SummaryItem 
                            label="Result" 
                            value={summaryData.result} 
                            color={summaryData.result === 'FAIL' ? 'text-red-600' : 'text-emerald-600'}
                        />
                        <SummaryItem label={isHighSchool ? 'Division' : 'Grade'} value={summaryData.performanceGrade} />
                        <SummaryItem label="Remarks" value={summaryData.remarks} />
                    </div>
                </section>
             )}

            <footer className="mt-12 pt-6 border-t-2 border-slate-300 text-center text-sm text-slate-500">
                <div className="flex justify-around items-end" style={{minHeight: '60px'}}>
                    <div className="w-1/3 pt-8 border-t border-slate-400">Class Teacher's Signature</div>
                    <div className="w-1/3 pt-8 border-t border-slate-400">Principal's Signature</div>
                </div>
                <p className="mt-8">&copy;{new Date().getFullYear()} Bethel Mission School. All rights reserved.</p>
            </footer>
        </div>
    );
};


interface PrintableBulkReportCardPageProps {
  students: Student[];
  gradeDefinitions: Record<Grade, GradeDefinition>;
  academicYear: string;
  fetchStudentAttendanceForMonth: (grade: Grade, year: number, month: number) => Promise<{ [date: string]: StudentAttendanceRecord }>;
}

const PrintableBulkReportCardPage: React.FC<PrintableBulkReportCardPageProps> = ({ students, gradeDefinitions, academicYear, fetchStudentAttendanceForMonth }) => {
    const { grade: encodedGrade, examId } = useParams<{ grade: string; examId: string }>();
    const navigate = useNavigate();

    const [classData, setClassData] = useState<ReportCardContentProps[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const grade = useMemo(() => encodedGrade ? decodeURIComponent(encodedGrade) as Grade : null, [encodedGrade]);
    const examDetails = useMemo(() => TERMINAL_EXAMS.find(e => e.id === examId), [examId]);
    
    useEffect(() => {
        const calculateAllData = async () => {
            if (!grade || !examId || !academicYear) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);

            const gradeDef = gradeDefinitions[grade];
            const classStudents = students.filter(s => s.grade === grade && s.status === StudentStatus.ACTIVE).sort((a,b) => a.rollNo - b.rollNo);

            if (!gradeDef || classStudents.length === 0) {
                setIsLoading(false);
                return;
            }

            // 1. Calculate Ranks for the whole class
            const studentScores = classStudents.map(s => {
                const sExam = s.academicPerformance?.find(e => e.id === examId);
                const sResults = sExam?.results || [];
                let totalMarks = 0;
                gradeDef.subjects.filter(sub => isSubjectNumeric(sub, s.grade)).forEach(sub => {
                    const res = sResults.find(r => r.subject === sub.name);
                    totalMarks += (res?.marks ?? (res?.examMarks ?? 0) + (res?.activityMarks ?? 0));
                });
                const { finalResult } = calculateStudentResult(sResults, gradeDef, s.grade);
                return { studentId: s.id, totalMarks, result: finalResult };
            });
            const classRanks = calculateRanks(studentScores);

            // 2. Fetch Attendance for the whole class
            const studentAttendanceMap: Record<string, { present: number; absent: number }> = {};
            classStudents.forEach(s => { studentAttendanceMap[s.id] = { present: 0, absent: 0 }; });

            const [startYearStr] = academicYear.split('-');
            const startYear = parseInt(startYearStr, 10);
            const termMonths = getMonthsForTerm(examId);

            for (const { month, yearOffset } of termMonths) {
                const year = startYear + yearOffset;
                try {
                    const monthlyData = await fetchStudentAttendanceForMonth(grade, year, month + 1);
                    Object.values(monthlyData).forEach(dailyRecord => {
                        classStudents.forEach(student => {
                            const status = dailyRecord[student.id];
                            if (status === StudentAttendanceStatus.PRESENT) studentAttendanceMap[student.id].present++;
                            else if (status === StudentAttendanceStatus.ABSENT) studentAttendanceMap[student.id].absent++;
                        });
                    });
                } catch (error) { console.error(`Could not fetch attendance for bulk print:`, error); }
            }

            // 3. Process each student
            const allReportData = classStudents.map(student => {
                const termResults = student.academicPerformance?.find(e => e.id === examId)?.results || [];
                const hasActivities = !GRADES_WITH_NO_ACTIVITIES.includes(student.grade);
                
                let grandTotal = 0;
                let maxGrandTotal = 0;
                gradeDef.subjects.filter(sub => isSubjectNumeric(sub, student.grade)).forEach(sub => {
                    const res = termResults.find(r => r.subject === sub.name);
                    grandTotal += (res?.marks ?? (res?.examMarks ?? 0) + (res?.activityMarks ?? 0));
                    maxGrandTotal += sub.examFullMarks + (hasActivities ? sub.activityFullMarks : 0);
                });
                
                const percentage = maxGrandTotal > 0 ? (grandTotal / maxGrandTotal) * 100 : 0;
                const { finalResult } = calculateStudentResult(termResults, gradeDef, student.grade);

                const summaryData = {
                    percentage: `${percentage.toFixed(2)}%`,
                    result: finalResult,
                    performanceGrade: getPerformanceGrade(percentage, finalResult, student.grade),
                    remarks: getRemarks(percentage, finalResult),
                };

                const { present, absent } = studentAttendanceMap[student.id];
                const totalDays = present + absent;
                const termAttendance = totalDays > 0 ? `${((present / totalDays) * 100).toFixed(2)}%` : 'N/A';
                
                return {
                    student,
                    examDetails: examDetails!,
                    gradeDef,
                    academicYear,
                    termResults,
                    summaryData,
                    rank: classRanks.get(student.id) ?? null,
                    termAttendance,
                };
            });
            
            setClassData(allReportData);
            setIsLoading(false);
        };
        calculateAllData();
    }, [grade, examId, students, gradeDefinitions, academicYear, fetchStudentAttendanceForMonth, examDetails]);
    
    return (
        <div className="printable-area">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 print:hidden">
                <div className="mb-6 flex justify-between items-center">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800">
                        <BackIcon className="w-5 h-5" /> Back
                    </button>
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800" title="Go to Home">
                            <HomeIcon className="w-5 h-5" /> <span>Home</span>
                        </Link>
                        <button onClick={() => window.print()} disabled={isLoading} className="btn btn-primary">
                            <PrinterIcon className="w-5 h-5" /><span className="ml-2">Print All Reports</span>
                        </button>
                    </div>
                </div>
                {isLoading ? (
                     <div className="text-center py-20 flex items-center justify-center gap-3">
                        <SpinnerIcon className="w-8 h-8 text-sky-600"/>
                        <span className="text-slate-600 font-semibold">Generating all report cards for {grade}...</span>
                    </div>
                ) : (
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-slate-800">Bulk Print Preview</h1>
                        <p className="text-slate-600 mt-1">{classData.length} report cards for {grade} are ready to print for the {examDetails?.name}.</p>
                    </div>
                )}
            </div>

            <div className="print-content">
                 <style>{`
                    @media print {
                        .report-card-container {
                            page-break-after: always;
                        }
                        .report-card-container:last-child {
                            page-break-after: auto;
                        }
                    }
                `}</style>
                {classData.map(data => (
                    <div key={data.student.id} className="report-card-container">
                        <ReportCardContent {...data} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PrintableBulkReportCardPage;

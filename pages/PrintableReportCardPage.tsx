import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Student, Grade, SubjectMark, GradeDefinition, SubjectDefinition, User, StudentStatus, StudentAttendanceRecord, StudentAttendanceStatus } from '../types';
import { BackIcon, UserIcon, HomeIcon, PrinterIcon, SpinnerIcon } from '../components/Icons';
import { formatStudentId, formatDateForDisplay, calculateStudentResult, calculateRanks, getPerformanceGrade, getRemarks, getMonthsForTerm, isSubjectNumeric } from '../utils';
import { GRADES_WITH_NO_ACTIVITIES, TERMINAL_EXAMS } from '../constants';

const PhotoWithFallback: React.FC<{src?: string, alt: string}> = ({ src, alt }) => {
    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.onerror = null; // Prevent infinite loop
        e.currentTarget.style.display = 'none';
        const parent = e.currentTarget.parentElement;
        if(parent) {
            const fallback = parent.querySelector('.fallback-icon');
            if(fallback) {
                (fallback as HTMLElement).style.display = 'flex';
            }
        }
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


interface PrintableReportCardPageProps {
  students: Student[];
  gradeDefinitions: Record<Grade, GradeDefinition>;
  academicYear: string;
  user: User;
  assignedGrade: Grade | null;
  fetchStudentAttendanceForMonth: (grade: Grade, year: number, month: number) => Promise<{ [date: string]: StudentAttendanceRecord }>;
}

const PrintableReportCardPage: React.FC<PrintableReportCardPageProps> = ({ students, gradeDefinitions, academicYear, user, assignedGrade, fetchStudentAttendanceForMonth }) => {
    const { studentId, examId } = useParams<{ studentId: string; examId: string }>();
    const navigate = useNavigate();
    
    const [termAttendance, setTermAttendance] = useState<string | null>(null);
    const [rank, setRank] = useState<number | 'NA' | null>(null);
    const [isLoadingExtraData, setIsLoadingExtraData] = useState(true);

    const student = useMemo(() => students.find(s => s.id === studentId), [students, studentId]);
    const isHighSchool = student?.grade === Grade.IX || student?.grade === Grade.X;
    const examDetails = useMemo(() => TERMINAL_EXAMS.find(e => e.id === examId), [examId]);
    
    const hasActivitiesForThisGrade = useMemo(() => {
        if (!student) return false;
        return !GRADES_WITH_NO_ACTIVITIES.includes(student.grade);
    }, [student]);

    const gradeDef = useMemo(() => student ? gradeDefinitions[student.grade] : undefined, [student, gradeDefinitions]);
    
    const termResults = useMemo(() => {
        if (!student || !examId) return [];
        const exam = student.academicPerformance?.find(e => e.id === examId);
        return exam?.results.filter(r => r.marks != null || r.examMarks != null || r.activityMarks != null || r.grade != null) || [];
    }, [student, examId]);


    useEffect(() => {
        const calculateExtraData = async () => {
            if (!student || !academicYear || !examId || !gradeDef) {
                setIsLoadingExtraData(false);
                return;
            }
            setIsLoadingExtraData(true);

            // --- 1. Calculate Rank ---
            const classmates = students.filter(s => s.grade === student.grade && s.status === StudentStatus.ACTIVE);
            
            const studentScores = classmates.map(s => {
                const sExam = s.academicPerformance?.find(e => e.id === examId);
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
            setRank(classRanks.get(student.id) ?? null);

            // --- 2. Calculate Attendance ---
            let present = 0;
            let absent = 0;
            const [startYearStr] = academicYear.split('-');
            const startYear = parseInt(startYearStr, 10);
            const termMonths = getMonthsForTerm(examId);

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
                    console.error(`Could not fetch attendance for term ${examId}:`, error);
                }
            }
            
            const totalDays = present + absent;
            setTermAttendance(totalDays > 0 ? `${((present / totalDays) * 100).toFixed(2)}%` : 'N/A');

            setIsLoadingExtraData(false);
        };

        calculateExtraData();
    }, [student, students, academicYear, gradeDefinitions, examId, gradeDef, fetchStudentAttendanceForMonth]);


    const summaryData = useMemo(() => {
        if (!student || !gradeDef || termResults.length === 0) return null;

        let grandTotal = 0;
        let maxGrandTotal = 0;
        
        gradeDef.subjects
          .filter(subjectDef => isSubjectNumeric(subjectDef, student.grade))
          .forEach(subjectDef => {
            const result = termResults.find(r => r.subject === subjectDef.name);
            const hasSubjectActivities = subjectDef.activityFullMarks > 0;
    
            const marks = result?.marks ?? (result?.examMarks ?? 0) + (hasSubjectActivities ? (result?.activityMarks ?? 0) : 0);
            grandTotal += marks;
            
            maxGrandTotal += subjectDef.examFullMarks + (hasSubjectActivities ? subjectDef.activityFullMarks : 0);
        });
        
        const percentage = maxGrandTotal > 0 ? (grandTotal / maxGrandTotal) * 100 : 0;
        const { finalResult } = calculateStudentResult(termResults, gradeDef, student.grade);
        
        return {
            percentage: `${percentage.toFixed(2)}%`,
            result: finalResult,
            performanceGrade: getPerformanceGrade(percentage, finalResult, student.grade),
            remarks: getRemarks(percentage, finalResult),
        };
    }, [student, gradeDef, termResults]);


    if (!student) {
        return (
            <div className="text-center bg-white p-10 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-red-600">Student Not Found</h2>
                <p className="text-slate-500 mt-2">The requested student could not be found in the database.</p>
                <button onClick={() => navigate('/')} className="mt-6 btn btn-primary"><BackIcon className="w-5 h-5" /> Return</button>
            </div>
        );
    }
    
    const isAllowed = user.role === 'admin' || (student && student.grade === assignedGrade);

    if (!isAllowed) {
        return (
            <div className="text-center bg-white p-10 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
                <p className="text-slate-500 mt-2">You do not have permission to view this student's report card.</p>
                 <button onClick={() => navigate('/')} className="mt-6 btn btn-primary"><BackIcon className="w-5 h-5" />Return</button>
            </div>
        );
    }
    
    if (!gradeDef || !examDetails) {
        return (
            <div className="text-center bg-white p-10 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-red-600">Report Card Data Not Found</h2>
                 <p className="text-slate-500 mt-2">The requested student or exam data is incomplete.</p>
                <button onClick={() => navigate('/')} className="mt-6 btn btn-primary"><BackIcon className="w-5 h-5" />Return</button>
            </div>
        );
    }
    
    const SummaryItem: React.FC<{ label: string; value: string | number | null; color?: string; }> = ({ label, value, color = 'text-slate-800' }) => (
        <div className="bg-slate-50 p-3 rounded-lg text-center">
            <div className="text-sm text-slate-500 font-semibold">{label}</div>
            <div className={`text-xl font-bold ${color}`}>{value ?? '--'}</div>
        </div>
    );
    
    return (
      <div className="printable-area">
        <div className="mb-6 flex justify-between items-center print:hidden">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800">
                <BackIcon className="w-5 h-5" /> Back
            </button>
            <div className="flex items-center gap-4">
                 <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800" title="Go to Home">
                    <HomeIcon className="w-5 h-5" /> <span>Home</span>
                </Link>
                <button onClick={() => window.print()} className="btn btn-primary">
                    <PrinterIcon className="w-5 h-5" /><span className="ml-2">Print This Report</span>
                </button>
            </div>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-lg print:shadow-none print:rounded-none" id="report-card">
            <style>{`
              @page { size: A4; margin: 1.5cm; }
            `}</style>
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
                       <div><span className="font-semibold text-slate-800">Name:</span> <span className="text-slate-800">{student.name}</span></div>
                       <div><span className="font-semibold text-slate-800">Student ID:</span> <span className="text-slate-800">{formatStudentId(student, academicYear)}</span></div>
                       <div><span className="font-semibold text-slate-800">Grade:</span> <span className="text-slate-800">{student.grade}</span></div>
                       <div><span className="font-semibold text-slate-800">Roll No.:</span> <span className="text-slate-800">{String(student.rollNo)}</span></div>
                       <div><span className="font-semibold text-slate-800">Date of Birth:</span> <span className="text-slate-800">{formatDateForDisplay(student.dateOfBirth)}</span></div>
                       <div><span className="font-semibold text-slate-800">Father's Name:</span> <span className="text-slate-800">{student.fatherName}</span></div>
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
                        {gradeDef.subjects.map(subjectDef => {
                            const result = termResults.find(r => r.subject === subjectDef.name);
                            const isGradeBased = subjectDef.gradingSystem === 'OABC' || (subjectDef.examFullMarks === 0 && subjectDef.activityFullMarks === 0);
                            const examMarks = result?.examMarks ?? '-';
                            const activityMarks = result?.activityMarks ?? '-';
                            
                            const hasSubjectActivities = subjectDef.activityFullMarks > 0;
                            const calculatedTotal = result?.marks ?? (result?.examMarks ?? 0) + (hasSubjectActivities ? (result?.activityMarks ?? 0) : 0);
                            
                            const wasAnyMarkEntered = result && (result.marks != null || result.examMarks != null || result.activityMarks != null);
                            const total = wasAnyMarkEntered ? calculatedTotal : '-';
                            
                            return (
                                <tr key={subjectDef.name}>
                                    <td className="border border-slate-300 px-2 py-1 text-left text-slate-800">{subjectDef.name}</td>
                                    {hasActivitiesForThisGrade && <td className="border border-slate-300 px-2 py-1 text-center">{isGradeBased ? '' : examMarks}</td>}
                                    {hasActivitiesForThisGrade && <td className="border border-slate-300 px-2 py-1 text-center">{isGradeBased ? '' : activityMarks}</td>}
                                    <td className="border border-slate-300 px-2 py-1 text-center font-bold">{isGradeBased ? result?.grade : total}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </section>

             {summaryData && (
                 <section>
                    <h3 className="text-xl font-bold text-slate-700 mb-4 text-center">{examDetails.name} Summary</h3>
                    {isLoadingExtraData ? (
                        <div className="flex justify-center items-center gap-2 text-slate-600"><SpinnerIcon className="w-5 h-5"/> <span>Loading summary...</span></div>
                    ) : (
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
                    )}
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
      </div>
    );
};

export default PrintableReportCardPage;

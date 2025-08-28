import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Student, Grade, SubjectMark, GradeDefinition, SubjectDefinition, User, StudentStatus, StudentAttendanceRecord, StudentAttendanceStatus } from '../types';
import { BackIcon, UserIcon, HomeIcon, PrinterIcon } from '../components/Icons';
import { formatStudentId, formatDateForDisplay, calculateStudentResult, calculateRanks } from '../utils';
import { GRADES_WITH_NO_ACTIVITIES } from '../constants';

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
    const { studentId } = useParams<{ studentId: string; examId: string }>();
    const navigate = useNavigate();
    
    const [annualAttendance, setAnnualAttendance] = useState<number | null>(null);
    const [rank, setRank] = useState<number | 'NA' | null>(null);
    const [isLoadingExtraData, setIsLoadingExtraData] = useState(true);

    const student = useMemo(() => students.find(s => s.id === studentId), [students, studentId]);

    const hasActivitiesForThisGrade = useMemo(() => {
        if (!student) return false;
        return !GRADES_WITH_NO_ACTIVITIES.includes(student.grade);
    }, [student]);

    useEffect(() => {
        const calculateExtraData = async () => {
            if (!student || !academicYear) {
                setIsLoadingExtraData(false);
                return;
            }
            setIsLoadingExtraData(true);

            // --- 1. Calculate Rank ---
            const classmates = students.filter(s => s.grade === student.grade && s.status === StudentStatus.ACTIVE);
            const finalExamId = 'terminal3';
            
            const studentScores = classmates.map(s => {
                const finalExam = s.academicPerformance?.find(e => e.id === finalExamId);
                const results = finalExam?.results || [];
                const studentGradeDef = gradeDefinitions[s.grade];
                
                let totalMarks = 0;
                if (studentGradeDef) {
                    const hasActivities = !GRADES_WITH_NO_ACTIVITIES.includes(s.grade);
                    studentGradeDef.subjects.forEach(subject => {
                        const result = results.find(r => r.subject === subject.name);
                        const useSplitMarks = hasActivities && subject.activityFullMarks > 0;
                        const obtainedMarks = useSplitMarks
                            ? (result?.examMarks ?? 0) + (result?.activityMarks ?? 0)
                            : (result?.marks ?? (result?.examMarks ?? 0) + (result?.activityMarks ?? 0));
                        totalMarks += obtainedMarks;
                    });
                }
                const { finalResult } = calculateStudentResult(results, studentGradeDef, s.grade);
                return { studentId: s.id, totalMarks, result: finalResult };
            });

            const classRanks = calculateRanks(studentScores);
            setRank(classRanks.get(student.id) ?? null);

            // --- 2. Calculate Attendance ---
            let present = 0;
            let absent = 0;
            const [startYearStr] = academicYear.split('-');
            const startYear = parseInt(startYearStr, 10);
            const academicMonths = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];
            const monthMap: { [key: string]: number } = { April: 3, May: 4, June: 5, July: 6, August: 7, September: 8, October: 9, November: 10, December: 11, January: 0, February: 1, March: 2 };

            for (const monthName of academicMonths) {
                const monthIndex = monthMap[monthName];
                const year = monthIndex >= 3 ? startYear : startYear + 1;
                try {
                    const monthlyData = await fetchStudentAttendanceForMonth(student.grade, year, monthIndex + 1);
                    Object.values(monthlyData).forEach(dailyRecord => {
                        const status = dailyRecord[student.id];
                        if (status === StudentAttendanceStatus.PRESENT) present++;
                        else if (status === StudentAttendanceStatus.ABSENT) absent++;
                    });
                } catch (error) {
                    console.error(`Could not fetch attendance for ${monthName} ${year}:`, error);
                }
            }
            
            const totalDays = present + absent;
            setAnnualAttendance(totalDays > 0 ? (present / totalDays) * 100 : null);

            setIsLoadingExtraData(false);
        };

        calculateExtraData();
    }, [student, students, academicYear, gradeDefinitions, fetchStudentAttendanceForMonth]);

    const getSplitMarks = (subjectName: string, results: SubjectMark[], subjectDef: SubjectDefinition) => {
        const result = results.find(r => r.subject === subjectName);
        const useSplitMarks = hasActivitiesForThisGrade && subjectDef.activityFullMarks > 0;
        
        const fullExam = subjectDef.examFullMarks;
        const fullActivity = useSplitMarks ? subjectDef.activityFullMarks : 0;
        const fullTotal = fullExam + fullActivity;

        if (!result) return { exam: null, activity: null, total: null, fullExam, fullActivity, fullTotal };

        if (useSplitMarks) {
            const examMarks = result.examMarks ?? null;
            const activityMarks = result.activityMarks ?? null;
            let total: number | null = null;
            if (examMarks !== null || activityMarks !== null) {
                total = (examMarks || 0) + (activityMarks || 0);
            }
            return { exam: examMarks, activity: activityMarks, total, fullExam, fullActivity, fullTotal };
        } else {
            const totalFromMarks = result.marks ?? (result.examMarks ?? 0) + (result.activityMarks ?? 0);
            return { exam: null, activity: null, total: totalFromMarks || null, fullExam: subjectDef.examFullMarks, fullActivity: 0, fullTotal: subjectDef.examFullMarks };
        }
    };

    if (!student) {
        return (
            <div className="text-center bg-white p-10 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-red-600">Student Not Found</h2>
                <p className="text-slate-500 mt-2">The requested student could not be found in the database.</p>
                <button onClick={() => navigate('/')} className="mt-6 flex items-center mx-auto justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition">
                    <BackIcon className="w-5 h-5" />
                    Return to Dashboard
                </button>
            </div>
        );
    }
    
    const isAllowed = user.role === 'admin' || (student && student.grade === assignedGrade);

    if (!isAllowed) {
        return (
            <div className="text-center bg-white p-10 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
                <p className="text-slate-500 mt-2">You do not have permission to view this student's report card.</p>
                 <button onClick={() => navigate('/')} className="mt-6 flex items-center mx-auto justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition">
                    <BackIcon className="w-5 h-5" />
                    Return to Dashboard
                </button>
            </div>
        );
    }

    const gradeDef = useMemo(() => student ? gradeDefinitions[student.grade] : undefined, [student, gradeDefinitions]);

    const allExamsData = useMemo(() => {
        if (!student) return null;
        const studentPerformance = student.academicPerformance || [];
        
        const getResultsForTerm = (termId: string): SubjectMark[] => {
            const exam = studentPerformance.find(e => e.id === termId);
            return exam?.results.filter(r => r.marks != null || r.examMarks != null || r.activityMarks != null) || [];
        };

        return {
            term1: getResultsForTerm('terminal1'),
            term2: getResultsForTerm('terminal2'),
            term3: getResultsForTerm('terminal3'),
        };
    }, [student]);

    const hasActivityMarks = useMemo(() => {
        if (!gradeDef) return false;
        return hasActivitiesForThisGrade && gradeDef.subjects.some(s => s.activityFullMarks > 0);
    }, [gradeDef, hasActivitiesForThisGrade]);


    const summaryData = useMemo(() => {
        if (!student || !allExamsData || !gradeDef) return null;

        let grandTotal = 0;
        let maxGrandTotal = 0;
        
        const finalTermResults = allExamsData.term3;

        gradeDef.subjects.forEach(subjectDef => {
            const finalTermMarks = getSplitMarks(subjectDef.name, finalTermResults, subjectDef);
            grandTotal += finalTermMarks.total ?? 0;
            maxGrandTotal += finalTermMarks.fullTotal ?? 0;
        });
        
        const percentage = maxGrandTotal > 0 ? (grandTotal / maxGrandTotal) * 100 : 0;
        
        const { finalResult } = calculateStudentResult(finalTermResults, gradeDef, student.grade);
        
        const getRemarks = (p: number, res: string) => {
            if (res === 'FAIL') return 'Requires serious attention';
            if (p >= 90) return 'Outstanding'; if (p >= 80) return 'Excellent'; if (p >= 70) return 'Very Good';
            if (p >= 60) return 'Good'; if (p >= 50) return 'Satisfactory';
            return 'Needs Improvement';
        };
        
        return {
            grandTotal,
            maxGrandTotal,
            percentage: percentage.toFixed(2),
            result: finalResult,
            remarks: getRemarks(percentage, finalResult),
        };
    }, [student, allExamsData, gradeDef, getSplitMarks]);

    const termTotals = useMemo(() => {
        if (!gradeDef || !allExamsData) return { t1: 0, t2: 0, t3: 0, max: 0 };
        let t1 = 0, t2 = 0, t3 = 0, max = 0;
        gradeDef.subjects.forEach(subjectDef => {
            const term1Marks = getSplitMarks(subjectDef.name, allExamsData.term1, subjectDef);
            const term2Marks = getSplitMarks(subjectDef.name, allExamsData.term2, subjectDef);
            const term3Marks = getSplitMarks(subjectDef.name, allExamsData.term3, subjectDef);
            t1 += term1Marks.total ?? 0;
            t2 += term2Marks.total ?? 0;
            t3 += term3Marks.total ?? 0;
            max += term1Marks.fullTotal; // fullTotal is same for all terms
        });
        return { t1, t2, t3, max };
    }, [gradeDef, allExamsData, getSplitMarks]);

    if (!gradeDef || !summaryData) {
        return (
            <div className="text-center bg-white p-10 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-red-600">Report Card Data Not Found</h2>
                <p className="text-slate-500 mt-2">The requested student or exam data is incomplete.</p>
                <button onClick={() => navigate('/')} className="mt-6 flex items-center mx-auto justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition">
                    <BackIcon className="w-5 h-5" />
                    Return to Dashboard
                </button>
            </div>
        );
    }
    
    const DetailItem: React.FC<{label: string, value?: string | number}> = ({ label, value }) => (
        <div><span className="font-semibold text-slate-800">{label}:</span> <span className="text-slate-800">{value || 'N/A'}</span></div>
    );
     const SummaryItem: React.FC<{ label: string; value: string | number; color?: string; }> = ({ label, value, color = 'text-slate-800' }) => (
        <div className="bg-slate-50 p-3 rounded-lg">
            <div className="text-sm text-slate-500">{label}</div>
            <div className={`text-lg font-bold ${color}`}>{value}</div>
        </div>
    );
    
    return (
      <div className="printable-area">
        <div className="mb-6 flex justify-between items-center print:hidden">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
                <BackIcon className="w-5 h-5" /> Back
            </button>
            <div className="flex items-center gap-4">
                 <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors" title="Go to Home/Dashboard">
                    <HomeIcon className="w-5 h-5" /> <span>Home</span>
                </Link>
                <button onClick={() => window.print()} className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 flex items-center">
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
                <h2 className="text-2xl font-semibold text-slate-600 mt-4">Annual Progress Report Card</h2>
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
                            <th rowSpan={hasActivityMarks ? 2 : 1} className="border border-slate-300 px-2 py-1 text-left align-bottom">Subject</th>
                            <th colSpan={hasActivityMarks ? 3 : 1} className="border border-slate-300 px-2 py-1 text-center">I Term</th>
                            <th colSpan={hasActivityMarks ? 3 : 1} className="border border-slate-300 px-2 py-1 text-center">II Term</th>
                            <th colSpan={hasActivityMarks ? 3 : 1} className="border border-slate-300 px-2 py-1 text-center">Final Term</th>
                        </tr>
                        {hasActivityMarks && (
                            <tr>
                                <th className="border border-slate-300 px-2 py-1 font-normal text-slate-800">Exam</th>
                                <th className="border border-slate-300 px-2 py-1 font-normal text-slate-800">Act.</th>
                                <th className="border border-slate-300 px-2 py-1 text-slate-800">Total</th>
                                <th className="border border-slate-300 px-2 py-1 font-normal text-slate-800">Exam</th>
                                <th className="border border-slate-300 px-2 py-1 font-normal text-slate-800">Act.</th>
                                <th className="border border-slate-300 px-2 py-1 text-slate-800">Total</th>
                                <th className="border border-slate-300 px-2 py-1 font-normal text-slate-800">Exam</th>
                                <th className="border border-slate-300 px-2 py-1 font-normal text-slate-800">Act.</th>
                                <th className="border border-slate-300 px-2 py-1 text-slate-800">Total</th>
                            </tr>
                        )}
                    </thead>
                    <tbody>
                        {gradeDef.subjects.map((subjectDef) => {
                            const term1 = getSplitMarks(subjectDef.name, allExamsData.term1, subjectDef);
                            const term2 = getSplitMarks(subjectDef.name, allExamsData.term2, subjectDef);
                            const term3 = getSplitMarks(subjectDef.name, allExamsData.term3, subjectDef);

                            return (
                                <tr key={subjectDef.name}>
                                    <td className="border border-slate-300 px-2 py-1 text-left text-slate-800">{subjectDef.name}</td>
                                    {/* Term 1 */}
                                    {hasActivityMarks ? (
                                        <>
                                            <td className="border border-slate-300 px-2 py-1 text-center text-slate-800">{term1.exam ?? '-'}</td>
                                            <td className="border border-slate-300 px-2 py-1 text-center text-slate-800">{term1.activity ?? '-'}</td>
                                            <td className="border border-slate-300 px-2 py-1 text-center text-slate-800 font-semibold">{term1.total ?? '-'}</td>
                                        </>
                                    ) : (
                                        <td className="border border-slate-300 px-2 py-1 text-center text-slate-800">{term1.total ?? '-'}</td>
                                    )}
                                    {/* Term 2 */}
                                     {hasActivityMarks ? (
                                        <>
                                            <td className="border border-slate-300 px-2 py-1 text-center text-slate-800">{term2.exam ?? '-'}</td>
                                            <td className="border border-slate-300 px-2 py-1 text-center text-slate-800">{term2.activity ?? '-'}</td>
                                            <td className="border border-slate-300 px-2 py-1 text-center text-slate-800 font-semibold">{term2.total ?? '-'}</td>
                                        </>
                                    ) : (
                                        <td className="border border-slate-300 px-2 py-1 text-center text-slate-800">{term2.total ?? '-'}</td>
                                    )}
                                    {/* Term 3 */}
                                     {hasActivityMarks ? (
                                        <>
                                            <td className="border border-slate-300 px-2 py-1 text-center text-slate-800">{term3.exam ?? '-'}</td>
                                            <td className="border border-slate-300 px-2 py-1 text-center text-slate-800">{term3.activity ?? '-'}</td>
                                            <td className="border border-slate-300 px-2 py-1 text-center text-slate-800 font-semibold">{term3.total ?? '-'}</td>
                                        </>
                                    ) : (
                                        <td className="border border-slate-300 px-2 py-1 text-center text-slate-800">{term3.total ?? '-'}</td>
                                    )}
                                </tr>
                            )
                        })}
                    </tbody>
                    <tfoot className="bg-slate-100 font-bold">
                        <tr>
                            <td className="border border-slate-300 px-2 py-1 text-left text-slate-900">Total</td>
                             <td colSpan={hasActivityMarks ? 3 : 1} className="border border-slate-300 px-2 py-1 text-center text-slate-900">{termTotals.t1} / {termTotals.max}</td>
                             <td colSpan={hasActivityMarks ? 3 : 1} className="border border-slate-300 px-2 py-1 text-center text-slate-900">{termTotals.t2} / {termTotals.max}</td>
                             <td colSpan={hasActivityMarks ? 3 : 1} className="border border-slate-300 px-2 py-1 text-center text-slate-900">{termTotals.t3} / {termTotals.max}</td>
                        </tr>
                    </tfoot>
                </table>
            </section>

             <section>
                <h3 className="text-xl font-bold text-slate-700 mb-4 text-center">Annual Result Summary (Based on Final Term)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <SummaryItem label="Final Term Total" value={`${summaryData.grandTotal} / ${summaryData.maxGrandTotal}`} />
                    <SummaryItem label="Final Term Percentage" value={`${summaryData.percentage}%`} />
                    <SummaryItem 
                        label="Final Result" 
                        value={summaryData.result} 
                        color={summaryData.result === 'FAIL' ? 'text-red-600' : 'text-emerald-600'}
                    />
                    <SummaryItem label="Annual Rank" value={isLoadingExtraData ? '...' : (rank ?? '--')} />
                    <SummaryItem label="Annual Attendance" value={isLoadingExtraData ? '...' : (annualAttendance !== null ? `${annualAttendance.toFixed(2)}%` : '--')} />
                    <div className="col-span-full md:col-span-3">
                         <SummaryItem label="Remarks" value={summaryData.remarks} />
                    </div>
                </div>
            </section>

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
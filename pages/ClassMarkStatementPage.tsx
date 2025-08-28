import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Student, Grade, GradeDefinition, StudentStatus, Exam, SubjectMark, User, StudentAttendanceRecord, StudentAttendanceStatus } from '../types';
import { BackIcon, HomeIcon, PrinterIcon, EditIcon, InboxArrowDownIcon, SpinnerIcon } from '../components/Icons';
import { TERMINAL_EXAMS, GRADES_WITH_NO_ACTIVITIES } from '../constants';
import { formatStudentId, calculateStudentResult, calculateRanks } from '../utils';
import * as XLSX from 'xlsx';
import ConfirmationModal from '../components/ConfirmationModal';
import MarksEntryModal from '../components/MarksEntryModal';


// Helper functions for result calculation
const getGradeLetter = (p: number, res: string) => {
    if (res === 'FAIL') return 'D';
    if (p >= 90) return 'A+'; if (p >= 80) return 'A'; if (p >= 70) return 'B+';
    if (p >= 60) return 'B'; if (p >= 50) return 'C+';
    return 'C';
};

const getDivision = (p: number, res: string) => {
    if (res === 'FAIL') return 'Fail';
    if (p >= 60) return 'First';
    if (p >= 45) return 'Second';
    return 'Third';
};

interface ClassMarkStatementPageProps {
    students: Student[];
    gradeDefinitions: Record<Grade, GradeDefinition>;
    academicYear: string;
    onUpdateClassMarks: (updates: Array<{ studentId: string; performance: Exam[] }>) => Promise<void>;
    user: User;
    assignedGrade: Grade | null;
    fetchStudentAttendanceForMonth: (grade: Grade, year: number, month: number) => Promise<{ [date: string]: StudentAttendanceRecord }>;
}

const ClassMarkStatementPage: React.FC<ClassMarkStatementPageProps> = ({ students, gradeDefinitions, academicYear, onUpdateClassMarks, user, assignedGrade, fetchStudentAttendanceForMonth }) => {
    const { grade: encodedGrade, examId } = useParams<{ grade: string; examId: string }>();
    const navigate = useNavigate();

    const [isProcessingFile, setIsProcessingFile] = useState(false);
    const [isSavingImport, setIsSavingImport] = useState(false);
    const [importData, setImportData] = useState<{ updates: Array<{ studentId: string; performance: Exam[] }>; errors: string[] } | null>(null);
    const [isMarksEntryModalOpen, setIsMarksEntryModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [attendanceData, setAttendanceData] = useState<Map<string, number | null>>(new Map());
    const [ranks, setRanks] = useState<Map<string, number | 'NA' | null>>(new Map());
    const [isLoadingExtraData, setIsLoadingExtraData] = useState(true);

    const grade = useMemo(() => encodedGrade ? decodeURIComponent(encodedGrade) as Grade : null, [encodedGrade]);
    const examDetails = useMemo(() => TERMINAL_EXAMS.find(e => e.id === examId), [examId]);
    const gradeDef = useMemo(() => grade ? gradeDefinitions[grade] : null, [grade, gradeDefinitions]);
    
    const isAllowed = user.role === 'admin' || grade === assignedGrade;
    const hasActivitiesForThisGrade = useMemo(() => grade ? !GRADES_WITH_NO_ACTIVITIES.includes(grade) : false, [grade]);
    
    const classStudents = useMemo(() => {
        if (!grade) return [];
        return students
            .filter(s => s.grade === grade && s.status === StudentStatus.ACTIVE)
            .sort((a, b) => a.rollNo - b.rollNo);
    }, [students, grade]);

    useEffect(() => {
        const calculateExtraData = async () => {
            if (!grade || !academicYear || classStudents.length === 0 || !examId) {
                setIsLoadingExtraData(false);
                return;
            }
            setIsLoadingExtraData(true);

            // --- 1. Calculate Ranks based on the current examId ---
            const studentScores = classStudents.map(student => {
                const exam = student.academicPerformance?.find(e => e.id === examId);
                const results = exam?.results || [];
                const studentGradeDef = gradeDefinitions[student.grade];
                
                let totalMarks = 0;
                if (studentGradeDef) {
                     const hasActivities = !GRADES_WITH_NO_ACTIVITIES.includes(student.grade);
                     studentGradeDef.subjects.forEach(subject => {
                        const result = results.find(r => r.subject === subject.name);
                        const useSplitMarks = hasActivities && subject.activityFullMarks > 0;
                        const obtainedMarks = useSplitMarks
                            ? (result?.examMarks ?? 0) + (result?.activityMarks ?? 0) 
                            : (result?.marks ?? (result?.examMarks ?? 0) + (result?.activityMarks ?? 0));
                        totalMarks += obtainedMarks;
                    });
                }

                const { finalResult } = calculateStudentResult(results, studentGradeDef, student.grade);
                return { studentId: student.id, totalMarks, result: finalResult };
            });
            setRanks(calculateRanks(studentScores));

            // --- 2. Calculate Attendance ---
            const attendanceMap = new Map<string, { present: number, absent: number }>();
            classStudents.forEach(s => attendanceMap.set(s.id, { present: 0, absent: 0 }));

            const [startYearStr] = academicYear.split('-');
            const startYear = parseInt(startYearStr, 10);
            const academicMonths = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];
            const monthMap: { [key: string]: number } = { April: 3, May: 4, June: 5, July: 6, August: 7, September: 8, October: 9, November: 10, December: 11, January: 0, February: 1, March: 2 };
            
            for (const monthName of academicMonths) {
                const monthIndex = monthMap[monthName];
                const year = monthIndex >= 3 ? startYear : startYear + 1;
                try {
                    const monthlyData = await fetchStudentAttendanceForMonth(grade, year, monthIndex + 1);
                    Object.values(monthlyData).forEach(dailyRecord => {
                        classStudents.forEach(student => {
                            const status = dailyRecord[student.id];
                            if (status === StudentAttendanceStatus.PRESENT) {
                                attendanceMap.get(student.id)!.present++;
                            } else if (status === StudentAttendanceStatus.ABSENT) {
                                attendanceMap.get(student.id)!.absent++;
                            }
                        });
                    });
                } catch (error) {
                    console.error(`Could not fetch attendance for ${monthName} ${year}:`, error);
                }
            }
            
            const finalAttendanceData = new Map<string, number | null>();
            attendanceMap.forEach((data, studentId) => {
                const total = data.present + data.absent;
                finalAttendanceData.set(studentId, total > 0 ? (data.present / total) * 100 : null);
            });
            setAttendanceData(finalAttendanceData);

            setIsLoadingExtraData(false);
        };

        calculateExtraData();
    }, [classStudents, grade, academicYear, gradeDefinitions, fetchStudentAttendanceForMonth, examId]);

    const statementData = useMemo(() => {
        if (!gradeDef || !grade) return [];
        return classStudents.map(student => {
            const exam = student.academicPerformance?.find(e => e.id === examId);
            const results = exam?.results || [];
            
            let totalMarks = 0;
            let totalMaxMarks = 0;

            gradeDef.subjects.forEach(subject => {
                const result = results.find(r => r.subject === subject.name);
                const useSplitMarks = hasActivitiesForThisGrade && subject.activityFullMarks > 0;
                
                const obtainedMarks = useSplitMarks
                    ? (result?.examMarks ?? 0) + (result?.activityMarks ?? 0) 
                    : (result?.marks ?? (result?.examMarks ?? 0) + (result?.activityMarks ?? 0));
                
                totalMarks += obtainedMarks;
                totalMaxMarks += subject.examFullMarks + (useSplitMarks ? subject.activityFullMarks : 0);
            });
            
            const percentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;
            const { finalResult, failedSubjects } = calculateStudentResult(results, gradeDef, student.grade);

            return {
                student,
                results,
                totalMarks,
                totalMaxMarks,
                percentage,
                result: finalResult,
                division: getDivision(percentage, finalResult),
                grade: getGradeLetter(percentage, finalResult),
                failedSubjects
            };
        });
    }, [classStudents, examId, gradeDef, grade, hasActivitiesForThisGrade]);

    const handleDownloadTemplate = () => {
        if (!gradeDef || !examDetails) return;

        const headers = ['Roll No', 'Student Name'];
        const useSplitMarks = hasActivitiesForThisGrade && gradeDef.subjects.some(s => s.activityFullMarks > 0);

        gradeDef.subjects.forEach(subject => {
            if (useSplitMarks && subject.activityFullMarks > 0) {
                headers.push(`${subject.name} (Exam)`);
                headers.push(`${subject.name} (Activity)`);
            } else {
                headers.push(subject.name);
            }
        });

        const rows = classStudents.map(student => [student.rollNo, student.name]);

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Marks Template');
        XLSX.writeFile(workbook, `Marks_Template_${grade}_${examDetails.id}.xlsx`);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !gradeDef || !examDetails) return;

        setIsProcessingFile(true);
        setImportData(null);

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

            const updates: Array<{ studentId: string; performance: Exam[] }> = [];
            const errors: string[] = [];
            const studentMap = new Map(classStudents.map(s => [s.rollNo, s]));

            jsonData.forEach((row, index) => {
                const rollNo = row['Roll No'];
                if (rollNo === undefined) return;

                const student = studentMap.get(Number(rollNo));

                if (!student) {
                    errors.push(`Row ${index + 2}: Student with Roll No "${rollNo}" not found.`);
                    return;
                }

                const newPerformance: Exam[] = JSON.parse(JSON.stringify(student.academicPerformance || []));
                let exam = newPerformance.find(e => e.id === examId);
                if (!exam) {
                    exam = { id: examId, name: examDetails.name, results: [] };
                    newPerformance.push(exam);
                }

                const newResults: SubjectMark[] = [];
                gradeDef.subjects.forEach(subjectDef => {
                    const newResult: SubjectMark = { subject: subjectDef.name };
                    const useSplitMarks = hasActivitiesForThisGrade && subjectDef.activityFullMarks > 0;
                    
                    if (useSplitMarks) {
                        const examMark = row[`${subjectDef.name} (Exam)`];
                        const activityMark = row[`${subjectDef.name} (Activity)`];
                        if (examMark !== undefined) newResult.examMarks = Number(examMark);
                        if (activityMark !== undefined) newResult.activityMarks = Number(activityMark);
                    } else {
                        const mark = row[subjectDef.name];
                        if (mark !== undefined) newResult.marks = Number(mark);
                    }

                    if(Object.keys(newResult).length > 1) { // has more than just subject name
                        newResults.push(newResult);
                    }
                });
                exam.results = newResults;
                updates.push({ studentId: student.id, performance: newPerformance });
            });
            setImportData({ updates, errors });
        } catch (error) {
            console.error("Error processing Excel file:", error);
            setImportData({ updates: [], errors: ["Failed to process the file."] });
        } finally {
            setIsProcessingFile(false);
        }
    };
    
    const handleConfirmImport = async () => {
        if (!importData || importData.updates.length === 0) return;
        setIsSavingImport(true);
        await onUpdateClassMarks(importData.updates);
        setIsSavingImport(false);
        setImportData(null);
    };

    if (!grade || !examDetails || !gradeDef) {
        return <div>Loading or invalid parameters...</div>;
    }
    
    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
                <div className="mb-6 flex justify-between items-center print:hidden">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800">
                        <BackIcon className="w-5 h-5" /> Back
                    </button>
                    <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800" title="Go to Home">
                        <HomeIcon className="w-5 h-5" /> <span>Home</span>
                    </Link>
                </div>

                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-slate-800">Statement of Marks</h1>
                    <p className="text-xl font-semibold text-slate-600">{examDetails.name} - {grade}</p>
                    <p className="text-slate-500">{academicYear}</p>
                </div>
                
                {isAllowed && (
                    <div className="my-6 p-4 bg-slate-50 border rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
                        <div>
                            <h3 className="font-bold text-slate-800">Marks Entry Options</h3>
                            <p className="text-sm text-slate-600">Enter or update marks individually, in bulk, or by importing a file.</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button onClick={() => setIsMarksEntryModalOpen(true)} className="btn btn-secondary"><EditIcon className="w-5 h-5"/> Quick Entry</button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx, .xls" className="hidden"/>
                            <button onClick={() => fileInputRef.current?.click()} disabled={isProcessingFile} className="btn btn-secondary disabled:opacity-70">
                                {isProcessingFile ? <SpinnerIcon className="w-5 h-5"/> : <InboxArrowDownIcon className="w-5 h-5"/>}
                                {isProcessingFile ? 'Processing...' : 'Import from Excel'}
                            </button>
                            <button onClick={handleDownloadTemplate} className="text-xs font-semibold text-sky-700 hover:underline px-2">Download Template</button>
                        </div>
                    </div>
                )}


                <div className="overflow-x-auto" id="mark-statement-table">
                    <table className="min-w-full divide-y-2 divide-slate-300 border-2 border-slate-300">
                        <thead className="bg-slate-100">
                            <tr>
                                <th rowSpan={2} className="px-2 py-2 text-center text-xs font-bold text-slate-800 uppercase border">Roll No</th>
                                <th rowSpan={2} className="px-2 py-2 text-left text-xs font-bold text-slate-800 uppercase border">Student Name</th>
                                {gradeDef.subjects.map(subject => (
                                    <th key={subject.name} className="px-2 py-2 text-center text-xs font-bold text-slate-800 uppercase border">{subject.name}</th>
                                ))}
                                <th rowSpan={2} className="px-2 py-2 text-center text-xs font-bold text-slate-800 uppercase border">Total</th>
                                <th rowSpan={2} className="px-2 py-2 text-center text-xs font-bold text-slate-800 uppercase border">Max</th>
                                <th rowSpan={2} className="px-2 py-2 text-center text-xs font-bold text-slate-800 uppercase border">%</th>
                                <th rowSpan={2} className="px-2 py-2 text-center text-xs font-bold text-slate-800 uppercase border">Div</th>
                                <th rowSpan={2} className="px-2 py-2 text-center text-xs font-bold text-slate-800 uppercase border">Grade</th>
                                <th rowSpan={2} className="px-2 py-2 text-center text-xs font-bold text-slate-800 uppercase border">Result</th>
                                <th rowSpan={2} className="px-2 py-2 text-center text-xs font-bold text-slate-800 uppercase border">Rank</th>
                            </tr>
                            <tr>
                               {gradeDef.subjects.map(subject => {
                                    const useSplitMarks = hasActivitiesForThisGrade && subject.activityFullMarks > 0;
                                    const maxMarks = subject.examFullMarks + (useSplitMarks ? subject.activityFullMarks : 0);
                                    return <th key={subject.name} className="px-2 py-1 text-center text-xs font-semibold text-slate-700 border">({maxMarks})</th>;
                               })}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {statementData.map(({ student, results, totalMarks, totalMaxMarks, percentage, result, division, grade: gradeLetter, failedSubjects }, index) => {
                                const studentRank = ranks.get(student.id);
                                return (
                                    <tr key={student.id} className="hover:bg-slate-50">
                                        <td className="px-2 py-2 whitespace-nowrap text-center text-sm font-semibold text-slate-800 border">{student.rollNo}</td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-slate-800 text-left border">
                                            <Link to={`/student/${student.id}`} className="hover:underline text-sky-700">{student.name}</Link>
                                        </td>
                                        {gradeDef.subjects.map(subject => {
                                            const studentResult = results.find(r => r.subject === subject.name);
                                            const useSplitMarks = hasActivitiesForThisGrade && subject.activityFullMarks > 0;
                                            const obtainedMarks = useSplitMarks
                                                ? ((studentResult?.examMarks ?? 0) + (studentResult?.activityMarks ?? 0))
                                                : (studentResult?.marks ?? (studentResult?.examMarks ?? 0) + (studentResult?.activityMarks ?? 0));
                                            const isFailed = failedSubjects.includes(subject.name);
                                            
                                            return (
                                                <td key={subject.name} className={`px-2 py-2 text-center text-sm font-semibold border ${isFailed ? 'text-red-600' : 'text-slate-800'}`}>
                                                    {obtainedMarks}
                                                </td>
                                            );
                                        })}
                                        <td className="px-2 py-2 text-center text-sm font-bold text-slate-800 border">{totalMarks}</td>
                                        <td className="px-2 py-2 text-center text-sm font-semibold text-slate-800 border">{totalMaxMarks}</td>
                                        <td className="px-2 py-2 text-center text-sm font-semibold text-slate-800 border">{percentage.toFixed(2)}%</td>
                                        <td className="px-2 py-2 text-center text-sm font-bold text-slate-800 border">{division}</td>
                                        <td className="px-2 py-2 text-center text-sm font-bold text-slate-800 border">{gradeLetter}</td>
                                        <td className={`px-2 py-2 text-center text-sm font-bold border ${result === 'FAIL' ? 'text-red-600' : 'text-emerald-600'}`}>{result}</td>
                                        <td className="px-2 py-2 text-center text-sm font-bold text-slate-800 border">{isLoadingExtraData ? '...' : studentRank}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                 <div className="mt-6 flex justify-end print:hidden">
                    <button onClick={() => window.print()} className="btn btn-primary">
                        <PrinterIcon className="w-5 h-5" />
                        Print Statement
                    </button>
                </div>
            </div>
            
             <ConfirmationModal
                isOpen={!!importData}
                onClose={() => setImportData(null)}
                onConfirm={handleConfirmImport}
                title="Confirm Marks Import"
                confirmDisabled={isSavingImport || (importData && importData.updates.length === 0)}
            >
                {importData && (
                    <div>
                        <p>Found <span className="font-bold">{importData.updates.length}</span> students with new marks to update.</p>
                        {importData.errors.length > 0 && (
                            <div className="mt-4 bg-red-50 p-3 rounded-lg">
                                <p className="font-bold text-red-800">{importData.errors.length} errors found:</p>
                                <ul className="list-disc list-inside text-sm text-red-700 max-h-32 overflow-y-auto">
                                    {importData.errors.map((err, i) => <li key={i}>{err}</li>)}
                                </ul>
                            </div>
                        )}
                        <p className="mt-4">Are you sure you want to proceed and save these changes?</p>
                    </div>
                )}
            </ConfirmationModal>
            
            <MarksEntryModal 
                isOpen={isMarksEntryModalOpen}
                onClose={() => setIsMarksEntryModalOpen(false)}
                onSave={onUpdateClassMarks}
                students={classStudents}
                gradeDef={gradeDef}
                examId={examId}
                examName={examDetails.name}
                grade={grade}
            />
        </>
    );
};

export default ClassMarkStatementPage;
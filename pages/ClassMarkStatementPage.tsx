import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Student, Grade, GradeDefinition, StudentStatus, Exam, SubjectMark, User, StudentAttendanceRecord, StudentAttendanceStatus } from '../types';
import { BackIcon, HomeIcon, PrinterIcon, EditIcon, InboxArrowDownIcon, SpinnerIcon } from '../components/Icons';
import { TERMINAL_EXAMS, GRADES_WITH_NO_ACTIVITIES, OABC_GRADES } from '../constants';
import { formatStudentId, calculateStudentResult, calculateRanks, getMonthsForTerm, getPerformanceGrade, getRemarks, isSubjectNumeric } from '../utils';
import * as XLSX from 'xlsx';
import ConfirmationModal from '../components/ConfirmationModal';
import MarksEntryModal from '../components/MarksEntryModal';

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
    
    const [ranks, setRanks] = useState<Map<string, number | 'NA' | null>>(new Map());
    const [attendanceData, setAttendanceData] = useState<Record<string, { present: number; total: number }>>({});
    const [isLoadingExtraData, setIsLoadingExtraData] = useState(true);

    const grade = useMemo(() => encodedGrade ? decodeURIComponent(encodedGrade) as Grade : null, [encodedGrade]);
    const examDetails = useMemo(() => TERMINAL_EXAMS.find(e => e.id === examId), [examId]);
    const isAllowed = user.role === 'admin' || grade === assignedGrade;
    const isHighSchool = grade === Grade.IX || grade === Grade.X;

    const classStudents = useMemo(() => {
        if (!grade) return [];
        return students
            .filter(s => s.grade === grade && s.status === StudentStatus.ACTIVE)
            .sort((a, b) => a.rollNo - b.rollNo);
    }, [students, grade]);

     // Combine gradeDef and max marks calculation
    const { gradeDef, hasActivitiesForThisGrade, totalMaxExamMarks, totalMaxActivityMarks, totalMaxMarks } = useMemo(() => {
        if (!grade) return { gradeDef: null, hasActivitiesForThisGrade: false, totalMaxExamMarks: 0, totalMaxActivityMarks: 0, totalMaxMarks: 0 };
        
        const def = gradeDefinitions[grade];
        if (!def) return { gradeDef: null, hasActivitiesForThisGrade: false, totalMaxExamMarks: 0, totalMaxActivityMarks: 0, totalMaxMarks: 0 };
        
        const hasActivities = !GRADES_WITH_NO_ACTIVITIES.includes(grade);
        
        let maxExam = 0;
        let maxActivity = 0;
        def.subjects
          .filter(s => isSubjectNumeric(s, grade))
          .forEach(subject => {
            maxExam += subject.examFullMarks;
            if (hasActivities && subject.activityFullMarks > 0) {
                maxActivity += subject.activityFullMarks;
            }
        });
        
        return { 
            gradeDef: def, 
            hasActivitiesForThisGrade: hasActivities, 
            totalMaxExamMarks: maxExam, 
            totalMaxActivityMarks: maxActivity, 
            totalMaxMarks: maxExam + maxActivity 
        };
    }, [grade, gradeDefinitions]);

    const statementData = useMemo(() => {
        if (!gradeDef || !grade) return [];
        return classStudents.map(student => {
            const exam = student.academicPerformance?.find(e => e.id === examId);
            const results = exam?.results || [];
            
            let totalExamMarks = 0;
            let totalActivityMarks = 0;

            gradeDef.subjects
              .filter(s => isSubjectNumeric(s, student.grade))
              .forEach(subject => {
                const result = results.find(r => r.subject === subject.name);
                if (hasActivitiesForThisGrade && subject.activityFullMarks > 0) {
                    totalExamMarks += Number(result?.examMarks) || 0;
                    totalActivityMarks += Number(result?.activityMarks) || 0;
                } else {
                    const marks = result?.marks ?? ((result?.examMarks ?? 0) + (result?.activityMarks ?? 0));
                    totalExamMarks += Number(marks) || 0;
                }
            });
            
            const totalMarks = totalExamMarks + totalActivityMarks;
            const percentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;
            const { finalResult, failedSubjects } = calculateStudentResult(results, gradeDef, student.grade);

            return {
                student,
                results,
                totalExamMarks,
                totalActivityMarks,
                totalMarks,
                percentage,
                result: finalResult,
                performanceGrade: getPerformanceGrade(percentage, finalResult, student.grade),
                remarks: getRemarks(percentage, finalResult),
                failedSubjects
            };
        });
    }, [classStudents, examId, gradeDef, grade, hasActivitiesForThisGrade, totalMaxMarks]);

    useEffect(() => {
        const calculateExtraData = async () => {
            setIsLoadingExtraData(true);
            if (!statementData || statementData.length === 0 || !grade || !examId) {
                setRanks(new Map());
                setAttendanceData({});
                setIsLoadingExtraData(false);
                return;
            }
            
            // Calculate Ranks
            const studentScores = statementData.map(data => ({
                studentId: data.student.id,
                totalMarks: data.totalMarks,
                result: data.result,
            }));
            setRanks(calculateRanks(studentScores));

            // Fetch Attendance
            const termMonths = getMonthsForTerm(examId);
            const [startYearStr] = academicYear.split('-');
            const startYear = parseInt(startYearStr, 10);
            const studentAttendanceMap: Record<string, { present: number; absent: number }> = {};
            classStudents.forEach(s => { studentAttendanceMap[s.id] = { present: 0, absent: 0 }; });

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
                } catch (error) { console.error(`Could not fetch attendance for ${month + 1}/${year}:`, error); }
            }
            const finalAttendanceData: Record<string, { present: number; total: number }> = {};
            Object.keys(studentAttendanceMap).forEach(studentId => {
                const { present, absent } = studentAttendanceMap[studentId];
                finalAttendanceData[studentId] = { present, total: present + absent };
            });
            setAttendanceData(finalAttendanceData);

            setIsLoadingExtraData(false);
        };
        calculateExtraData();
    }, [statementData, grade, examId, classStudents, academicYear, fetchStudentAttendanceForMonth]);


    const handleDownloadTemplate = () => {
        if (!gradeDef || !examDetails) return;

        const headers = ['Roll No', 'Student Name'];
        const useSplitMarks = hasActivitiesForThisGrade && gradeDef.subjects.some(s => s.activityFullMarks > 0);

        gradeDef.subjects.forEach(subject => {
            if (subject.gradingSystem === 'OABC') {
                 headers.push(`${subject.name} (Grade)`);
            } else if (useSplitMarks && subject.activityFullMarks > 0) {
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
                    
                    if (subjectDef.gradingSystem === 'OABC') {
                        let gradeVal = row[`${subjectDef.name} (Grade)`];
                        if (gradeVal === undefined) {
                            gradeVal = row[subjectDef.name];
                        }

                        if (gradeVal !== undefined && gradeVal !== null && String(gradeVal).trim() !== '') {
                            const upperGradeVal = String(gradeVal).toUpperCase().trim();
                            if (OABC_GRADES.includes(upperGradeVal as any)) {
                                newResult.grade = upperGradeVal as 'O' | 'A' | 'B' | 'C';
                            } else {
                                errors.push(`Row ${index + 2}, Student ${student.name}: Invalid grade "${gradeVal}" for ${subjectDef.name}. Must be O, A, B, or C.`);
                            }
                        }
                    } else if (useSplitMarks) {
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
            <div className="printable-area bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
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
                    <table className="min-w-full divide-y-2 divide-slate-300 border-2 border-slate-300 text-sm">
                        <thead className="bg-slate-100">
                            <tr>
                                <th rowSpan={2} className="border px-2 py-1 text-center font-bold text-slate-800 uppercase align-bottom">Roll</th>
                                <th rowSpan={2} className="border px-2 py-1 text-left font-bold text-slate-800 uppercase align-bottom">Student Name</th>
                                {gradeDef.subjects.map(subject => (
                                    <th key={subject.name} colSpan={hasActivitiesForThisGrade && subject.activityFullMarks > 0 ? 2 : 1} className="border px-2 py-1 text-center font-bold text-slate-800 uppercase">{subject.name}</th>
                                ))}
                                <th colSpan={hasActivitiesForThisGrade ? 3 : 1} className="border px-2 py-1 text-center font-bold text-slate-800 uppercase">Totals</th>
                                <th rowSpan={2} className="border px-2 py-1 text-center font-bold text-slate-800 uppercase align-bottom">%</th>
                                <th rowSpan={2} className="border px-2 py-1 text-center font-bold text-slate-800 uppercase align-bottom">{isHighSchool ? 'Division' : 'Grade'}</th>
                                <th rowSpan={2} className="border px-2 py-1 text-center font-bold text-slate-800 uppercase align-bottom">Result</th>
                                <th rowSpan={2} className="border px-2 py-1 text-center font-bold text-slate-800 uppercase align-bottom">Rank</th>
                                <th rowSpan={2} className="border px-2 py-1 text-center font-bold text-slate-800 uppercase align-bottom">Attendance %</th>
                                <th rowSpan={2} className="border px-2 py-1 text-center font-bold text-slate-800 uppercase align-bottom">Remarks</th>
                            </tr>
                            <tr>
                                {gradeDef.subjects.flatMap(subject => {
                                    const isGradeBasedSubject = (grade === Grade.I || grade === Grade.II) && (subject.name === 'Cursive' || subject.name === 'Drawing');
                                    if (subject.gradingSystem === 'OABC' || isGradeBasedSubject) {
                                         return [<th key={`${subject.name}-grade`} className="border px-1 py-1 font-semibold text-slate-700 text-xs">Grade</th>];
                                    } else if (hasActivitiesForThisGrade && subject.activityFullMarks > 0) {
                                        return [
                                            <th key={`${subject.name}-exam`} className="border px-1 py-1 font-semibold text-slate-700 text-xs">E({subject.examFullMarks})</th>,
                                            <th key={`${subject.name}-activity`} className="border px-1 py-1 font-semibold text-slate-700 text-xs">A({subject.activityFullMarks})</th>
                                        ];
                                    }
                                    return [<th key={`${subject.name}-marks`} className="border px-1 py-1 font-semibold text-slate-700 text-xs">Marks({subject.examFullMarks})</th>]
                                })}
                                {hasActivitiesForThisGrade ? (
                                <>
                                    <th className="border px-1 py-1 font-semibold text-slate-700 text-xs">Exam ({totalMaxExamMarks})</th>
                                    <th className="border px-1 py-1 font-semibold text-slate-700 text-xs">Activity ({totalMaxActivityMarks})</th>
                                    <th className="border px-1 py-1 font-semibold text-slate-700 text-xs">Grand ({totalMaxMarks})</th>
                                </>
                                ) : (
                                    <th className="border px-1 py-1 font-semibold text-slate-700 text-xs">Total ({totalMaxMarks})</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {statementData.map(({ student, results, totalExamMarks, totalActivityMarks, totalMarks, percentage, result, performanceGrade, remarks, failedSubjects }) => {
                                const studentRank = ranks.get(student.id);
                                const attendance = attendanceData[student.id];
                                const attPercentage = attendance && attendance.total > 0 ? ((attendance.present / attendance.total) * 100).toFixed(1) : '-';
                                return (
                                    <tr key={student.id} className="hover:bg-slate-50">
                                        <td className="border px-2 py-1 text-center font-semibold">{student.rollNo}</td>
                                        <td className="border px-2 py-1 text-left font-medium">
                                            <Link to={`/student/${student.id}`} className="hover:underline text-sky-700">{student.name}</Link>
                                        </td>
                                        {gradeDef.subjects.flatMap(subject => {
                                            const studentResult = results.find(r => r.subject === subject.name);
                                            const isFailed = failedSubjects.includes(subject.name);
                                            const isGradeBasedSubject = (grade === Grade.I || grade === Grade.II) && (subject.name === 'Cursive' || subject.name === 'Drawing');

                                            if (subject.gradingSystem === 'OABC' || isGradeBasedSubject) {
                                                return [<td key={subject.name} className="border px-2 py-1 text-center font-bold text-lg">{studentResult?.grade ?? '-'}</td>];
                                            } else if (hasActivitiesForThisGrade && subject.activityFullMarks > 0) {
                                                const examMarks = studentResult?.examMarks ?? '-';
                                                const activityMarks = studentResult?.activityMarks ?? '-';
                                                return [
                                                    <td key={`${subject.name}-exam`} className={`border px-2 py-1 text-center font-semibold ${isFailed ? 'text-red-600' : 'text-slate-800'}`}>{examMarks}</td>,
                                                    <td key={`${subject.name}-activity`} className={`border px-2 py-1 text-center font-semibold ${isFailed ? 'text-red-600' : 'text-slate-800'}`}>{activityMarks}</td>
                                                ];
                                            }
                                            
                                            let marks: number | string | undefined = studentResult?.marks;
                                            if (marks === undefined) {
                                                const examMarks = studentResult?.examMarks;
                                                const activityMarks = studentResult?.activityMarks;
                                                if (examMarks !== undefined || activityMarks !== undefined) {
                                                    marks = (examMarks ?? 0) + (activityMarks ?? 0);
                                                }
                                            }
                                            
                                            return [<td key={subject.name} className={`border px-2 py-1 text-center font-semibold ${isFailed ? 'text-red-600' : 'text-slate-800'}`}>{marks ?? '-'}</td>]
                                        })}

                                        {hasActivitiesForThisGrade ? (
                                        <>
                                            <td className="border px-2 py-1 text-center font-bold">{totalExamMarks}</td>
                                            <td className="border px-2 py-1 text-center font-bold">{totalActivityMarks}</td>
                                            <td className="border px-2 py-1 text-center font-bold text-slate-900">{totalMarks}</td>
                                        </>
                                        ) : (
                                            <td className="border px-2 py-1 text-center font-bold text-slate-900">{totalMarks}</td>
                                        )}
                                        <td className="border px-2 py-1 text-center font-semibold">{percentage.toFixed(2)}%</td>
                                        <td className="border px-2 py-1 text-center font-bold">{performanceGrade}</td>
                                        <td className={`border px-2 py-1 text-center font-bold ${result === 'FAIL' ? 'text-red-600' : 'text-emerald-600'}`}>{result}</td>
                                        <td className="border px-2 py-1 text-center font-bold">{isLoadingExtraData ? '...' : studentRank}</td>
                                        <td className="border px-2 py-1 text-center font-semibold">{isLoadingExtraData ? '...' : `${attPercentage}%`}</td>
                                        <td className="border px-2 py-1 text-center text-xs">{remarks}</td>
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



import React, { useMemo, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Student, Grade, GradeDefinition, StudentStatus, Exam, SubjectMark, User } from '../types';
import { BackIcon, HomeIcon, PrinterIcon, EditIcon, InboxArrowDownIcon, SpinnerIcon } from '../components/Icons';
import { TERMINAL_EXAMS } from '../constants';
import { formatStudentId, calculateStudentResult } from '../utils';
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
}

const ClassMarkStatementPage: React.FC<ClassMarkStatementPageProps> = ({ students, gradeDefinitions, academicYear, onUpdateClassMarks, user, assignedGrade }) => {
    const { grade: encodedGrade, examId } = useParams<{ grade: string; examId: string }>();
    const navigate = useNavigate();

    const [isProcessingFile, setIsProcessingFile] = useState(false);
    const [isSavingImport, setIsSavingImport] = useState(false);
    const [importData, setImportData] = useState<{ updates: Array<{ studentId: string; performance: Exam[] }>; errors: string[] } | null>(null);
    const [isMarksEntryModalOpen, setIsMarksEntryModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const grade = useMemo(() => encodedGrade ? decodeURIComponent(encodedGrade) as Grade : null, [encodedGrade]);
    const examDetails = useMemo(() => TERMINAL_EXAMS.find(e => e.id === examId), [examId]);
    const gradeDef = useMemo(() => grade ? gradeDefinitions[grade] : null, [grade, gradeDefinitions]);
    
    const isAllowed = user.role === 'admin' || grade === assignedGrade;
    
    const classStudents = useMemo(() => {
        if (!grade) return [];
        return students
            .filter(s => s.grade === grade && s.status === StudentStatus.ACTIVE)
            .sort((a, b) => a.rollNo - b.rollNo);
    }, [students, grade]);

    const statementData = useMemo(() => {
        if (!gradeDef) return [];
        return classStudents.map(student => {
            const exam = student.academicPerformance?.find(e => e.id === examId);
            const results = exam?.results || [];
            
            let totalMarks = 0;
            let totalMaxMarks = 0;

            gradeDef.subjects.forEach(subject => {
                const result = results.find(r => r.subject === subject.name);
                const hasActivity = subject.activityFullMarks > 0;
                const obtainedMarks = hasActivity 
                    ? (result?.examMarks ?? 0) + (result?.activityMarks ?? 0) 
                    : (result?.marks ?? 0);
                
                totalMarks += obtainedMarks;
                totalMaxMarks += subject.examFullMarks + subject.activityFullMarks;
            });
            
            const percentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;
            const { finalResult } = calculateStudentResult(results, gradeDef, student.grade);

            return {
                student,
                results,
                totalMarks,
                totalMaxMarks,
                percentage,
                result: finalResult,
                division: getDivision(percentage, finalResult),
                grade: getGradeLetter(percentage, finalResult)
            };
        });
    }, [classStudents, examId, gradeDef]);

    const handleDownloadTemplate = () => {
        if (!gradeDef || !examDetails) return;

        const headers = ['Roll No', 'Student Name'];
        const hasSplitMarksSystem = gradeDef.subjects.some(s => s.activityFullMarks > 0);

        gradeDef.subjects.forEach(subject => {
            if (hasSplitMarksSystem && subject.activityFullMarks > 0) {
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
                let examData = newPerformance.find(e => e.id === examId);

                if (!examData) {
                    examData = { id: examId!, name: examDetails.name, results: [] };
                    newPerformance.push(examData);
                }
                
                let hasUpdate = false;
                gradeDef.subjects.forEach(subject => {
                    const hasActivity = subject.activityFullMarks > 0;
                    const examHeader = hasActivity ? `${subject.name} (Exam)` : subject.name;
                    const activityHeader = hasActivity ? `${subject.name} (Activity)` : null;
                    
                    const examValue = row[examHeader];
                    const activityValue = activityHeader ? row[activityHeader] : undefined;

                    if (examValue !== undefined || activityValue !== undefined) {
                        let subjectResult = examData!.results.find(r => r.subject === subject.name);
                        if (!subjectResult) {
                            subjectResult = { subject: subject.name };
                            examData!.results.push(subjectResult);
                        }

                        const processMark = (value: any, max: number, type: string) => {
                            if (value === undefined || value === null || String(value).trim() === '') return undefined;
                            const mark = Number(value);
                            if (!isNaN(mark) && mark >= 0 && mark <= max) {
                                hasUpdate = true;
                                return mark;
                            } else {
                                errors.push(`Row ${index + 2} (${student.name}): Invalid ${type} mark for ${subject.name}.`);
                                return undefined;
                            }
                        };
                        
                        if (hasActivity) {
                            const newExamMark = processMark(examValue, subject.examFullMarks, 'Exam');
                            const newActivityMark = processMark(activityValue, subject.activityFullMarks, 'Activity');
                            if(newExamMark !== undefined) subjectResult.examMarks = newExamMark;
                            if(newActivityMark !== undefined) subjectResult.activityMarks = newActivityMark;
                        } else {
                            const newMark = processMark(examValue, subject.examFullMarks, 'Total');
                            if(newMark !== undefined) subjectResult.marks = newMark;
                        }
                    }
                });

                if (hasUpdate) {
                    updates.push({ studentId: student.id, performance: newPerformance });
                }
            });

            setImportData({ updates, errors });

        } catch (err) {
            setImportData({ updates: [], errors: ['Failed to read the file. Please ensure it is a valid XLSX or CSV file and matches the template.'] });
            console.error(err);
        } finally {
            setIsProcessingFile(false);
            if (e.target) e.target.value = '';
        }
    };

    const handleConfirmImport = async () => {
        if (importData && importData.updates.length > 0) {
            setIsSavingImport(true);
            await onUpdateClassMarks(importData.updates);
            setIsSavingImport(false);
        }
        setImportData(null);
    };


    if (!grade || !examDetails || !gradeDef) {
        return (
            <div className="text-center bg-white p-10 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-red-600">Data Not Found</h2>
                <p className="text-slate-500 mt-2">Could not load mark statement. The grade or exam ID is invalid.</p>
            </div>
        );
    }

    if (!isAllowed) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
                <p className="text-slate-700 mt-2">You do not have permission to view the mark statement for this class.</p>
                <button onClick={() => navigate('/')} className="mt-6 flex items-center mx-auto justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition">
                    Return to Dashboard
                </button>
            </div>
        );
    }

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
                     {isAllowed && (
                        <div className="flex items-center gap-2">
                             <button onClick={() => setIsMarksEntryModalOpen(true)} className="btn btn-secondary" disabled={isProcessingFile}>
                                <EditIcon className="w-5 h-5" />
                                <span>Main Marks Entry</span>
                            </button>
                            <button onClick={() => fileInputRef.current?.click()} className="btn btn-secondary" disabled={isProcessingFile}>
                                {isProcessingFile ? <SpinnerIcon className="w-5 h-5"/> : <InboxArrowDownIcon className="w-5 h-5" />}
                                <span>{isProcessingFile ? 'Processing...' : 'Import Marks'}</span>
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
                            <button onClick={handleDownloadTemplate} className="btn btn-secondary">
                                Download Template
                            </button>
                        </div>
                    )}
                    <button onClick={() => window.print()} className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 flex items-center">
                        <PrinterIcon className="w-5 h-5" /><span className="ml-2">Print</span>
                    </button>
                </div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg print:shadow-none print:rounded-none" id="mark-statement">
                 <style>{`
                    @page { 
                        size: A4 landscape; 
                        margin: 1.5cm;
                    }
                    @media print {
                        #mark-statement {
                            font-size: 10pt;
                        }
                    }
                `}</style>
                <header className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-slate-800">Bethel Mission School</h1>
                    <h2 className="text-xl font-semibold text-slate-700">Statement of Marks - {examDetails.name}</h2>
                    <p className="text-lg text-slate-600">Class: {grade} | Academic Year: {academicYear}</p>
                </header>

                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse border border-slate-400 text-xs">
                        <thead className="bg-slate-100 font-semibold text-slate-800">
                            <tr>
                                <th rowSpan={2} className="border border-slate-300 p-1 align-bottom">Roll</th>
                                <th rowSpan={2} className="border border-slate-300 p-1 align-bottom text-left">Student Name</th>
                                {gradeDef.subjects.map(subject => (
                                    <th key={subject.name} colSpan={subject.activityFullMarks > 0 ? 3 : 1} className="border border-slate-300 p-1">
                                        {subject.name}
                                    </th>
                                ))}
                                <th colSpan={4} className="border border-slate-300 p-1">Grand Total</th>
                                {isAllowed && <th rowSpan={2} className="border border-slate-300 p-1 align-middle text-center print:hidden">Actions</th>}
                            </tr>
                            <tr>
                                {gradeDef.subjects.map(subject => (
                                    subject.activityFullMarks > 0 ? (
                                        <React.Fragment key={subject.name}>
                                            <th className="border border-slate-300 p-1 font-normal">Exam ({subject.examFullMarks})</th>
                                            <th className="border border-slate-300 p-1 font-normal">Act ({subject.activityFullMarks})</th>
                                            <th className="border border-slate-300 p-1 font-semibold">Total ({subject.examFullMarks + subject.activityFullMarks})</th>
                                        </React.Fragment>
                                    ) : (
                                        <th key={subject.name} className="border border-slate-300 p-1 font-semibold">Marks ({subject.examFullMarks})</th>
                                    )
                                ))}
                                <th className="border border-slate-300 p-1 font-semibold">Total Marks</th>
                                <th className="border border-slate-300 p-1 font-semibold">%</th>
                                <th className="border border-slate-300 p-1 font-semibold">Result</th>
                                <th className="border border-slate-300 p-1 font-semibold">Division</th>
                            </tr>
                        </thead>
                        <tbody>
                            {statementData.map(({ student, results, totalMarks, totalMaxMarks, percentage, result, division }) => (
                                <tr key={student.id}>
                                    <td className="border border-slate-300 p-1 text-center font-semibold">{student.rollNo}</td>
                                    <td className="border border-slate-300 p-1 text-left font-medium">{student.name}</td>
                                    {gradeDef.subjects.map(subject => {
                                        const mark = results.find(r => r.subject === subject.name);
                                        const hasActivity = subject.activityFullMarks > 0;
                                        return hasActivity ? (
                                            <React.Fragment key={subject.name}>
                                                <td className="border border-slate-300 p-1 text-center">{mark?.examMarks ?? '-'}</td>
                                                <td className="border border-slate-300 p-1 text-center">{mark?.activityMarks ?? '-'}</td>
                                                <td className="border border-slate-300 p-1 text-center font-semibold bg-slate-50">{(mark?.examMarks ?? 0) + (mark?.activityMarks ?? 0)}</td>
                                            </React.Fragment>
                                        ) : (
                                            <td key={subject.name} className="border border-slate-300 p-1 text-center font-semibold bg-slate-50">{mark?.marks ?? '-'}</td>
                                        );
                                    })}
                                    <td className="border border-slate-300 p-1 text-center font-bold">{totalMarks} / {totalMaxMarks}</td>
                                    <td className="border border-slate-300 p-1 text-center font-bold">{percentage.toFixed(2)}%</td>
                                    <td className={`border border-slate-300 p-1 text-center font-bold ${result === 'FAIL' ? 'text-red-600' : 'text-emerald-600'}`}>{result}</td>
                                    <td className="border border-slate-300 p-1 text-center font-bold">{division}</td>
                                    {isAllowed && (
                                        <td className="border border-slate-300 p-1 text-center print:hidden">
                                            <Link
                                                to={`/student/${student.id}/academics`}
                                                className="inline-block p-1.5 text-sky-600 hover:bg-sky-100 rounded-full transition-colors"
                                                title={`Enter/Edit marks for ${student.name}`}
                                            >
                                                <EditIcon className="w-5 h-5" />
                                            </Link>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
             <ConfirmationModal
                isOpen={!!importData}
                onClose={() => setImportData(null)}
                onConfirm={handleConfirmImport}
                title="Confirm Mark Import"
                confirmDisabled={isSavingImport}
            >
                {importData && (
                    <div>
                        <p className="mb-2">Found <span className="font-bold text-emerald-600">{importData.updates.length} students</span> with valid marks to update.</p>
                        {importData.errors.length > 0 && (
                            <div className="mt-4">
                                <p className="font-bold text-red-600">{importData.errors.length} errors found:</p>
                                <ul className="list-disc list-inside text-sm text-red-700 max-h-40 overflow-y-auto bg-red-50 p-2 rounded">
                                    {importData.errors.map((err, i) => <li key={i}>{err}</li>)}
                                </ul>
                            </div>
                        )}
                        <p className="mt-4 font-semibold">Do you want to proceed with importing the valid records?</p>
                        {isSavingImport && <div className="mt-2 flex items-center gap-2 text-sky-600 font-semibold"><SpinnerIcon className="w-5 h-5" /><span>Saving... Please wait.</span></div>}
                    </div>
                )}
            </ConfirmationModal>
             <MarksEntryModal
                isOpen={isMarksEntryModalOpen}
                onClose={() => setIsMarksEntryModalOpen(false)}
                onSave={onUpdateClassMarks}
                students={classStudents}
                gradeDef={gradeDef}
                examId={examId!}
                examName={examDetails.name}
                grade={grade}
            />
        </div>
    );
};

export default ClassMarkStatementPage;
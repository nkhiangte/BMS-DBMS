

import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Student, Grade, GradeDefinition, StudentStatus, SubjectMark, User } from '../types';
import { BackIcon, HomeIcon, PrinterIcon, EditIcon } from '../components/Icons';
import { TERMINAL_EXAMS } from '../constants';
import { formatStudentId, calculateStudentResult } from '../utils';

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
    onUpdateClassMarks: () => void;
    user: User;
    assignedGrade: Grade | null;
}

const ClassMarkStatementPage: React.FC<ClassMarkStatementPageProps> = ({ students, gradeDefinitions, academicYear, onUpdateClassMarks, user, assignedGrade }) => {
    const { grade: encodedGrade, examId } = useParams<{ grade: string; examId: string }>();
    const navigate = useNavigate();

    const grade = useMemo(() => encodedGrade ? decodeURIComponent(encodedGrade) as Grade : undefined, [encodedGrade]);
    const examDetails = useMemo(() => TERMINAL_EXAMS.find(e => e.id === examId), [examId]);
    const gradeDef = useMemo(() => grade ? gradeDefinitions[grade] : undefined, [grade, gradeDefinitions]);
    
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
        </div>
    );
};

export default ClassMarkStatementPage;

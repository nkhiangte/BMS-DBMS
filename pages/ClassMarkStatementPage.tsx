import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Student, Grade, GradeDefinition, StudentStatus, SubjectMark } from '../types';
import { BackIcon, HomeIcon, PrinterIcon, EditIcon, CheckIcon, XIcon } from '../components/Icons';
import { TERMINAL_EXAMS } from '../constants';
import { formatStudentId } from '../utils';

// Helper functions for result calculation
const getGrade = (p: number, res: string) => {
    if (res === 'FAIL') return 'D';
    if (p >= 90) return 'A+'; if (p >= 80) return 'A'; if (p >= 70) return 'B+';
    if (p >= 60) return 'B'; if (p >= 50) return 'C+';
    return 'C';
};

const getDivision = (p: number, res: string) => {
    if (res === 'FAIL') return 'Fail';
    if (p >= 60) return 'First Division'; if (p >= 45) return 'Second Division';
    if (p >= 33) return 'Third Division';
    return 'Fail';
};

interface ClassMarkStatementPageProps {
  students: Student[];
  gradeDefinitions: Record<Grade, GradeDefinition>;
  academicYear: string;
  onUpdateClassMarks: (marksByStudentId: Map<string, SubjectMark[]>, examId: string) => void;
}

const ClassMarkStatementPage: React.FC<ClassMarkStatementPageProps> = ({ students, gradeDefinitions, academicYear, onUpdateClassMarks }) => {
    const { grade: encodedGrade, examId } = useParams<{ grade: string, examId: string }>();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [editedMarks, setEditedMarks] = useState<Map<string, SubjectMark[]>>(new Map());

    const grade = useMemo(() => encodedGrade ? decodeURIComponent(encodedGrade) as Grade : undefined, [encodedGrade]);
    const exam = useMemo(() => TERMINAL_EXAMS.find(e => e.id === examId), [examId]);
    const gradeDef = useMemo(() => grade ? gradeDefinitions[grade] : undefined, [grade, gradeDefinitions]);

    const classStudents = useMemo(() => {
        if (!grade) return [];
        return students
            .filter(s => s.grade === grade && s.status === StudentStatus.ACTIVE)
            .sort((a, b) => a.rollNo - b.rollNo);
    }, [students, grade]);

    const hasActivityMarks = useMemo(() => {
        return gradeDef?.subjects.some(s => s.activityFullMarks > 0) ?? false;
    }, [gradeDef]);

    const initialMarksMap = useMemo(() => {
        const markMap = new Map<string, SubjectMark[]>();
        if (!gradeDef) return markMap;

        classStudents.forEach(student => {
            const studentExamData = student.academicPerformance?.find(p => p.id === examId);
            const marks = gradeDef.subjects.map(subjectDef => {
                const existingResult = studentExamData?.results.find(r => r.subject === subjectDef.name);
                return {
                    subject: subjectDef.name,
                    marks: existingResult?.marks,
                    examMarks: existingResult?.examMarks,
                    activityMarks: existingResult?.activityMarks,
                };
            });
            markMap.set(student.id, marks);
        });
        return markMap;
    }, [classStudents, examId, gradeDef]);

    const studentResults = useMemo(() => {
        if (!gradeDef) return [];
        const marksSource = isEditing ? editedMarks : initialMarksMap;
        
        const dataWithTotals = classStudents.map(student => {
            const marks = marksSource.get(student.id) || [];
            let grandTotal = 0;
            let maxTotal = 0;
            const failedSubjects: string[] = [];
            const gradeCategory = [Grade.IX, Grade.X].includes(student.grade) ? 'IX-X'
                : [Grade.NURSERY, Grade.KINDERGARTEN, Grade.I, Grade.II].includes(student.grade) ? 'NUR-II'
                : 'III-VIII';

            gradeDef.subjects.forEach(subject => {
                const result = marks.find(r => r.subject === subject.name);
                const examMarks = result?.examMarks || 0;
                const activityMarks = result?.activityMarks || 0;
                const singleMark = result?.marks || 0;
                const obtained = hasActivityMarks ? (examMarks + activityMarks) : singleMark;
                const full = subject.examFullMarks + (hasActivityMarks ? subject.activityFullMarks : 0);
                
                grandTotal += obtained;
                maxTotal += full;

                if (full > 0) {
                     if (gradeCategory === 'III-VIII') {
                        if (examMarks < 20) {
                            failedSubjects.push(subject.name);
                        }
                    } else { // NUR-II and IX-X check total subject marks
                        if (obtained < 33) {
                            failedSubjects.push(subject.name);
                        }
                    }
                }
            });

            const percentage = maxTotal > 0 ? (grandTotal / maxTotal) * 100 : 0;
            let finalResult = "PASS";
            if (failedSubjects.length > 1) finalResult = "FAIL";
            else if (failedSubjects.length === 1) finalResult = "SIMPLE PASS";

            const academicGrade = getGrade(percentage, finalResult);
            const division = getDivision(percentage, finalResult);
            
            let remarks = '';
            if (finalResult === 'FAIL') {
                remarks = `Needs attention in ${failedSubjects.join(', ')}.`;
            } else if (finalResult === 'SIMPLE PASS') {
                remarks = `Needs to improve in ${failedSubjects[0]}.`;
            } else {
                if (percentage >= 90) remarks = 'Outstanding';
                else if (percentage >= 80) remarks = 'Excellent';
                else if (percentage >= 70) remarks = 'Very Good';
                else if (percentage >= 60) remarks = 'Good';
                else if (percentage >= 50) remarks = 'Satisfactory';
                else remarks = 'Needs Improvement';
            }

            const gradeOrDivision = (gradeCategory === 'IX-X') ? division : academicGrade;

            return { student, marks, grandTotal, maxTotal, percentage, finalResult, gradeOrDivision, remarks };
        });

        const sortedByTotal = [...dataWithTotals].sort((a, b) => b.grandTotal - a.grandTotal);
        const ranks = new Map<string, number>();
        let currentRank = 1;
        for (let i = 0; i < sortedByTotal.length; i++) {
            if (sortedByTotal[i].grandTotal > 0) {
                if (i > 0 && sortedByTotal[i].grandTotal < sortedByTotal[i-1].grandTotal) {
                    currentRank = i + 1;
                }
                ranks.set(sortedByTotal[i].student.id, currentRank);
            } else {
                ranks.set(sortedByTotal[i].student.id, 0);
            }
        }
        
        return dataWithTotals.map(d => ({...d, rank: ranks.get(d.student.id) || 0 }));

    }, [classStudents, gradeDef, examId, hasActivityMarks, isEditing, editedMarks, initialMarksMap]);

    useEffect(() => {
        setEditedMarks(initialMarksMap);
    }, [initialMarksMap]);

    const handleMarkChange = (studentId: string, subjectName: string, markType: 'marks' | 'examMarks' | 'activityMarks', value: string) => {
        const numValue = value === '' ? undefined : parseInt(value, 10);
        
        setEditedMarks(prevMap => {
            const newMap = new Map(prevMap);
            const studentMarks = newMap.get(studentId);
            if (!studentMarks) return newMap;

            const newStudentMarks = studentMarks.map((mark: SubjectMark) => {
                if (mark.subject === subjectName) {
                    const subjectDef = gradeDef?.subjects.find(s => s.name === subjectName);
                    if (subjectDef) {
                        let max = subjectDef.examFullMarks;
                        if (markType === 'activityMarks') {
                            max = subjectDef.activityFullMarks;
                        }
                        return { ...mark, [markType]: numValue !== undefined ? Math.max(0, Math.min(numValue, max)) : undefined };
                    }
                    return { ...mark, [markType]: numValue };
                }
                return mark;
            });

            newMap.set(studentId, newStudentMarks);
            return newMap;
        });
    };
    
    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, studentIndex: number, subjectIndex: number, markType: 'marks' | 'exam' | 'activity') => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const nextStudentIndex = studentIndex + 1;
            
            if (nextStudentIndex < studentResults.length) {
                const nextInputId = `input-${nextStudentIndex}-${subjectIndex}-${markType}`;
                const nextInput = document.getElementById(nextInputId);
                if (nextInput) {
                    nextInput.focus();
                    (nextInput as HTMLInputElement).select();
                }
            }
        }
    };


    const handleSave = () => {
        onUpdateClassMarks(editedMarks, examId!);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedMarks(initialMarksMap);
    };

    if (!grade || !exam || !gradeDef) { return <div>Loading...</div>; }

    return (
      <div className="printable-area">
        <div className="mb-6 flex justify-between items-center print:hidden">
            <button onClick={() => navigate('/reports/search')} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
                <BackIcon className="w-5 h-5" /> Back to Search
            </button>
            <div className="flex items-center gap-4">
                 <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors" title="Go to Home/Dashboard">
                    <HomeIcon className="w-5 h-5" /> <span>Home</span>
                </Link>
                {isEditing ? (
                    <>
                        <button onClick={handleCancel} className="px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-lg shadow-sm hover:bg-red-200 flex items-center gap-2">
                           <XIcon className="w-5 h-5" /> Cancel
                        </button>
                        <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 flex items-center gap-2">
                           <CheckIcon className="w-5 h-5" /> Save Changes
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 flex items-center gap-2">
                           <EditIcon className="w-5 h-5" /> Edit Marks
                        </button>
                        <button onClick={() => window.print()} className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 flex items-center gap-2">
                            <PrinterIcon className="w-5 h-5" /> Print
                        </button>
                    </>
                )}
            </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-lg print:shadow-none print:p-0" id="mark-statement">
            <style>{`
                @page { size: A4 landscape; margin: 1cm; }
                @media print { 
                    #mark-statement { font-size: 7.5pt; }
                    #mark-statement table th, #mark-statement table td { padding: 3px 4px; }
                    #mark-statement .subject-header {
                        writing-mode: vertical-rl; text-orientation: mixed; transform: rotate(180deg);
                        white-space: nowrap; padding-bottom: 6px;
                    }
                }
            `}</style>
            <header className="text-center pb-4 mb-4">
                <h1 className="text-2xl font-bold text-sky-800">Bethel Mission School</h1>
                <h2 className="text-xl font-semibold text-slate-700">Statement of Marks</h2>
                <div className="flex justify-around text-base mt-2">
                    <p><strong>Class:</strong> {grade}</p>
                    <p><strong>Exam:</strong> {exam.name}</p>
                    <p><strong>Academic Year:</strong> {academicYear}</p>
                </div>
            </header>

            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-slate-400 text-center">
                    <thead className="bg-slate-100 font-semibold text-slate-800">
                        <tr>
                            <th rowSpan={2} className="border border-slate-300 p-1">Student ID</th>
                            <th rowSpan={2} className="border border-slate-300 p-1 text-left min-w-[140px]">Name of Student</th>
                            <th rowSpan={2} className="border border-slate-300 p-1">Roll No</th>
                            <th rowSpan={2} className="border border-slate-300 p-1 text-left min-w-[140px]">Father's Name</th>
                            <th rowSpan={2} className="border border-slate-300 p-1 min-w-[70px]">Date of Birth</th>
                            {gradeDef.subjects.map(subject => (
                                <th key={subject.name} colSpan={hasActivityMarks ? 3 : 1} className="border border-slate-300 p-1 font-bold subject-header">
                                    {subject.name}
                                </th>
                            ))}
                            <th colSpan={7} className="border border-slate-300 p-1">Final Summary</th>
                        </tr>
                        <tr>
                            {gradeDef.subjects.map(subject => {
                                const fullMarks = subject.examFullMarks + subject.activityFullMarks;
                                return hasActivityMarks ? (
                                    <React.Fragment key={`${subject.name}-marks`}>
                                        <th className="border border-slate-300 p-1 font-normal">E({subject.examFullMarks})</th>
                                        <th className="border border-slate-300 p-1 font-normal">A({subject.activityFullMarks})</th>
                                        <th className="border border-slate-300 p-1 font-semibold">T({fullMarks})</th>
                                    </React.Fragment>
                                ) : (
                                    <th key={`${subject.name}-marks`} className="border border-slate-300 p-1 font-semibold">M({fullMarks})</th>
                                )
                            })}
                            <th className="border border-slate-300 p-1">Total</th>
                            <th className="border border-slate-300 p-1">Grade/Div</th>
                            <th className="border border-slate-300 p-1">Rank</th>
                            <th className="border border-slate-300 p-1">Percentage</th>
                            <th className="border border-slate-300 p-1">Result</th>
                            <th className="border border-slate-300 p-1">Attendance %</th>
                            <th className="border border-slate-300 p-1">Remarks</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {studentResults.map(({ student, marks, grandTotal, maxTotal, percentage, finalResult, gradeOrDivision, remarks, rank }, studentIndex) => (
                            <tr key={student.id} className="text-slate-900">
                                <td className="border border-slate-300 p-1">{formatStudentId(student, academicYear)}</td>
                                <td className="border border-slate-300 p-1 text-left font-semibold">
                                    <Link to={`/student/${student.id}`} className="hover:underline text-sky-700 print:text-black print:no-underline">
                                        {student.name}
                                    </Link>
                                </td>
                                <td className="border border-slate-300 p-1">{student.rollNo}</td>
                                <td className="border border-slate-300 p-1 text-left">{student.fatherName}</td>
                                <td className="border border-slate-300 p-1">{student.dateOfBirth}</td>
                                {gradeDef.subjects.map((subject, subjectIndex) => {
                                    const result = marks.find(r => r.subject === subject.name);
                                    return hasActivityMarks ? (
                                        <React.Fragment key={`${student.id}-${subject.name}`}>
                                            <td className="border border-slate-300 p-0">{isEditing ? <input type="number" id={`input-${studentIndex}-${subjectIndex}-exam`} onKeyDown={e => handleInputKeyDown(e, studentIndex, subjectIndex, 'exam')} value={result?.examMarks ?? ''} onChange={e => handleMarkChange(student.id, subject.name, 'examMarks', e.target.value)} className="w-full h-full p-1 text-center bg-sky-50 text-slate-900 outline-sky-300"/> : result?.examMarks ?? '-'}</td>
                                            <td className="border border-slate-300 p-0">{isEditing ? <input type="number" id={`input-${studentIndex}-${subjectIndex}-activity`} onKeyDown={e => handleInputKeyDown(e, studentIndex, subjectIndex, 'activity')} value={result?.activityMarks ?? ''} onChange={e => handleMarkChange(student.id, subject.name, 'activityMarks', e.target.value)} className="w-full h-full p-1 text-center bg-sky-50 text-slate-900 outline-sky-300"/> : result?.activityMarks ?? '-'}</td>
                                            <td className="border border-slate-300 p-1 font-semibold">{(result?.examMarks || 0) + (result?.activityMarks || 0) || '-'}</td>
                                        </React.Fragment>
                                    ) : (
                                        <td key={`${student.id}-${subject.name}`} className="border border-slate-300 p-0 font-semibold">{isEditing ? <input type="number" id={`input-${studentIndex}-${subjectIndex}-marks`} onKeyDown={e => handleInputKeyDown(e, studentIndex, subjectIndex, 'marks')} value={result?.marks ?? ''} onChange={e => handleMarkChange(student.id, subject.name, 'marks', e.target.value)} className="w-full h-full p-1 text-center bg-sky-50 text-slate-900 outline-sky-300"/> : result?.marks ?? '-'}</td>
                                    )
                                })}
                                <td className="border border-slate-300 p-1 font-bold">{grandTotal}/{maxTotal}</td>
                                <td className="border border-slate-300 p-1 font-bold">{gradeOrDivision}</td>
                                <td className="border border-slate-300 p-1 font-bold">{rank === 0 ? '--' : rank}</td>
                                <td className="border border-slate-300 p-1 font-bold">{percentage.toFixed(2)}%</td>
                                <td className={`border border-slate-300 p-1 font-bold ${finalResult === 'FAIL' ? 'text-red-600' : 'text-emerald-600'}`}>{finalResult}</td>
                                <td className="border border-slate-300 p-1">N/A</td>
                                <td className="border border-slate-300 p-1 text-left min-w-[120px]">{remarks}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {studentResults.length === 0 && (
                    <div className="text-center py-10">No students found in this class.</div>
                )}
            </div>
        </div>
      </div>
    );
};

export default ClassMarkStatementPage;
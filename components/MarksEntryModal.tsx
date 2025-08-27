
import React, { useState, useEffect } from 'react';
import { Student, GradeDefinition, Exam, SubjectMark, Grade } from '../types';
import { SpinnerIcon, CheckIcon, XIcon } from './Icons';

interface MarksEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (updates: Array<{ studentId: string; performance: Exam[] }>) => Promise<void>;
    students: Student[];
    gradeDef: GradeDefinition;
    examId: string;
    examName: string;
    grade: Grade;
}

type MarksState = {
    [studentId: string]: {
        [subjectName: string]: {
            marks?: number | string;
            examMarks?: number | string;
            activityMarks?: number | string;
        }
    }
};

const MarksEntryModal: React.FC<MarksEntryModalProps> = ({ isOpen, onClose, onSave, students, gradeDef, examId, examName, grade }) => {
    const [marksData, setMarksData] = useState<MarksState>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const initialMarks: MarksState = {};
            students.forEach(student => {
                initialMarks[student.id] = {};
                const exam = student.academicPerformance?.find(e => e.id === examId);
                gradeDef.subjects.forEach(subjectDef => {
                    const result = exam?.results.find(r => r.subject === subjectDef.name);
                    initialMarks[student.id][subjectDef.name] = {
                        marks: result?.marks ?? '',
                        examMarks: result?.examMarks ?? '',
                        activityMarks: result?.activityMarks ?? '',
                    };
                });
            });
            setMarksData(initialMarks);
        }
    }, [isOpen, students, gradeDef, examId]);

    const handleMarkChange = (studentId: string, subjectName: string, field: 'marks' | 'examMarks' | 'activityMarks', value: string, max: number) => {
        const numericValue = value === '' ? '' : Math.max(0, Math.min(parseInt(value, 10), max));
        if (value !== '' && isNaN(Number(numericValue))) return;

        setMarksData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [subjectName]: {
                    ...prev[studentId]?.[subjectName],
                    [field]: numericValue,
                }
            }
        }));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, studentIndex: number, subjectIndex: number, markTypeIndex: number) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const nextStudentIndex = studentIndex + 1;
            if (nextStudentIndex < students.length) {
                const nextInputId = `marks-input-${nextStudentIndex}-${subjectIndex}-${markTypeIndex}`;
                const nextInput = document.getElementById(nextInputId);
                if (nextInput) {
                    nextInput.focus();
                    (nextInput as HTMLInputElement).select();
                }
            }
        }
    };

    const handleSaveClick = async () => {
        setIsSaving(true);
        const updates: Array<{ studentId: string; performance: Exam[] }> = [];

        students.forEach(student => {
            const studentMarks = marksData[student.id];
            if (!studentMarks) return;

            const originalPerformance: Exam[] = JSON.parse(JSON.stringify(student.academicPerformance || []));
            let originalExam = originalPerformance.find(e => e.id === examId);

            if (!originalExam) {
                originalExam = { id: examId, name: examName, results: [] };
                originalPerformance.push(originalExam);
            }

            const newResults: SubjectMark[] = [];
            gradeDef.subjects.forEach(subjectDef => {
                const subjectMarks = studentMarks[subjectDef.name];
                const newResult: SubjectMark = { subject: subjectDef.name };

                const processMark = (val: any) => val === '' || val === null || val === undefined ? undefined : Number(val);

                if (subjectDef.activityFullMarks > 0) {
                    newResult.examMarks = processMark(subjectMarks.examMarks);
                    newResult.activityMarks = processMark(subjectMarks.activityMarks);
                } else {
                    newResult.marks = processMark(subjectMarks.marks);
                }

                if (newResult.marks !== undefined || newResult.examMarks !== undefined || newResult.activityMarks !== undefined) {
                    newResults.push(newResult);
                }
            });
            
            const sortResults = (r: SubjectMark[]) => r.sort((a,b) => a.subject.localeCompare(b.subject));

            if (JSON.stringify(sortResults(originalExam.results)) !== JSON.stringify(sortResults(newResults))) {
                originalExam.results = newResults;
                updates.push({ studentId: student.id, performance: originalPerformance });
            }
        });

        if (updates.length > 0) {
            await onSave(updates);
        }
        
        setIsSaving(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl flex flex-col h-full max-h-[95vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">Main Marks Entry: {grade} - {examName}</h2>
                    <button onClick={onClose} className="p-2 text-slate-600 hover:bg-slate-100 rounded-full"><XIcon className="w-5 h-5"/></button>
                </div>

                <div className="flex-grow overflow-auto p-4">
                    <table className="min-w-full border-collapse text-sm">
                        <thead className="bg-slate-100 sticky top-0 z-10">
                            <tr>
                                <th className="border p-2 text-left font-bold text-slate-800">Roll</th>
                                <th className="border p-2 text-left font-bold text-slate-800">Student Name</th>
                                {gradeDef.subjects.map(subject => (
                                    <th key={subject.name} colSpan={subject.activityFullMarks > 0 ? 2 : 1} className="border p-2 text-center font-bold text-slate-800">
                                        {subject.name}
                                    </th>
                                ))}
                            </tr>
                            <tr>
                                <th className="border p-2"></th>
                                <th className="border p-2"></th>
                                {gradeDef.subjects.flatMap(subject => 
                                    subject.activityFullMarks > 0 ? [
                                        <th key={`${subject.name}-exam`} className="border p-2 font-semibold text-slate-700">Exam ({subject.examFullMarks})</th>,
                                        <th key={`${subject.name}-activity`} className="border p-2 font-semibold text-slate-700">Act ({subject.activityFullMarks})</th>
                                    ] : [
                                        <th key={subject.name} className="border p-2 font-semibold text-slate-700">Marks ({subject.examFullMarks})</th>
                                    ]
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, studentIndex) => (
                                <tr key={student.id} className="hover:bg-slate-50">
                                    <td className="border p-2 text-center font-semibold">{student.rollNo}</td>
                                    <td className="border p-2 font-medium">{student.name}</td>
                                    {gradeDef.subjects.flatMap((subject, subjectIndex) => {
                                        const marks = marksData[student.id]?.[subject.name] || {};
                                        if (subject.activityFullMarks > 0) {
                                            return [
                                                <td key={`${subject.name}-exam`} className="border p-1">
                                                    <input
                                                        id={`marks-input-${studentIndex}-${subjectIndex}-0`}
                                                        type="number"
                                                        value={marks.examMarks ?? ''}
                                                        onChange={e => handleMarkChange(student.id, subject.name, 'examMarks', e.target.value, subject.examFullMarks)}
                                                        onKeyDown={e => handleKeyDown(e, studentIndex, subjectIndex, 0)}
                                                        className="w-full text-center p-1 rounded-md border-slate-300"
                                                        max={subject.examFullMarks}
                                                    />
                                                </td>,
                                                <td key={`${subject.name}-activity`} className="border p-1">
                                                    <input
                                                        id={`marks-input-${studentIndex}-${subjectIndex}-1`}
                                                        type="number"
                                                        value={marks.activityMarks ?? ''}
                                                        onChange={e => handleMarkChange(student.id, subject.name, 'activityMarks', e.target.value, subject.activityFullMarks)}
                                                        onKeyDown={e => handleKeyDown(e, studentIndex, subjectIndex, 1)}
                                                        className="w-full text-center p-1 rounded-md border-slate-300"
                                                        max={subject.activityFullMarks}
                                                    />
                                                </td>
                                            ];
                                        } else {
                                            return [
                                                <td key={subject.name} className="border p-1">
                                                    <input
                                                        id={`marks-input-${studentIndex}-${subjectIndex}-0`}
                                                        type="number"
                                                        value={marks.marks ?? ''}
                                                        onChange={e => handleMarkChange(student.id, subject.name, 'marks', e.target.value, subject.examFullMarks)}
                                                        onKeyDown={e => handleKeyDown(e, studentIndex, subjectIndex, 0)}
                                                        className="w-full text-center p-1 rounded-md border-slate-300"
                                                        max={subject.examFullMarks}
                                                    />
                                                </td>
                                            ];
                                        }
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-slate-50 px-6 py-3 flex justify-end gap-3 rounded-b-xl border-t">
                    <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSaving}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSaveClick}
                        className="btn btn-primary"
                        disabled={isSaving}
                    >
                        {isSaving ? <SpinnerIcon className="w-5 h-5"/> : <CheckIcon className="w-5 h-5"/>}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MarksEntryModal;

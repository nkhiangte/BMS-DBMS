
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Staff, Student, Grade, GradeDefinition, SubjectAssignment, StudentStatus, Exam, ActivityLog, ActivityComponentLog, Assessment } from '../types';
import { BackIcon, HomeIcon, AcademicCapIcon, BookOpenIcon, CheckIcon, SpinnerIcon } from '../components/Icons';
import { TERMINAL_EXAMS } from '../constants';

interface ActivityMarksPageProps {
  user: User | null;
  staffProfile: Staff | null;
  students: Student[];
  gradeDefinitions: Record<Grade, GradeDefinition>;
  onUpdateClassMarks: (updates: Array<{ studentId: string; performance: Exam[] }>) => Promise<void>;
}

type MarksData = {
    [studentId: string]: {
        [examId: string]: ActivityLog
    }
};

const ACTIVITY_COMPONENTS: { key: keyof ActivityLog, label: string, weightage: number }[] = [
    { key: 'classTest', label: 'Class Tests', weightage: 20 },
    { key: 'homework', label: 'Homework', weightage: 10 },
    { key: 'quiz', label: 'Quizzes', weightage: 5 },
    { key: 'project', label: 'Projects', weightage: 5 },
];

const ActivityMarksPage: React.FC<ActivityMarksPageProps> = ({ user, staffProfile, students, gradeDefinitions, onUpdateClassMarks }) => {
    const navigate = useNavigate();
    const [selectedAssignment, setSelectedAssignment] = useState<SubjectAssignment | null>(null);
    const [marksData, setMarksData] = useState<MarksData>({});
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const assignmentsByGrade = useMemo(() => {
        if (!staffProfile?.assignedSubjects) return {};
        return staffProfile.assignedSubjects.reduce((acc, asgn) => {
            if (!acc[asgn.grade]) acc[asgn.grade] = [];
            acc[asgn.grade].push(asgn);
            return acc;
        }, {} as Record<Grade, SubjectAssignment[]>);
    }, [staffProfile]);
    
    const selectedClassStudents = useMemo(() => {
        if (!selectedAssignment) return [];
        return students
            .filter(s => s.grade === selectedAssignment.grade && s.status === StudentStatus.ACTIVE)
            .sort((a,b) => a.rollNo - b.rollNo);
    }, [students, selectedAssignment]);

    const createDefaultActivityLog = (): ActivityLog => {
        const log: Partial<ActivityLog> = {};
        ACTIVITY_COMPONENTS.forEach(({ key, weightage }) => {
            log[key] = { assessments: [{ marksObtained: null, maxMarks: null }], weightage, scaledMarks: 0 };
        });
        return log as ActivityLog;
    };

    useEffect(() => {
        if (selectedAssignment) {
            const initialMarks: MarksData = {};
            selectedClassStudents.forEach(student => {
                initialMarks[student.id] = {};
                TERMINAL_EXAMS.forEach(exam => {
                    const examData = student.academicPerformance?.find(e => e.id === exam.id);
                    const subjectResult = examData?.results.find(r => r.subject === selectedAssignment.subject);
                    initialMarks[student.id][exam.id] = subjectResult?.activityLog || createDefaultActivityLog();
                });
            });
            setMarksData(initialMarks);
        } else {
            setMarksData({});
        }
    }, [selectedAssignment, selectedClassStudents]);

    const handleLogChange = (studentId: string, examId: string, componentKey: keyof ActivityLog, assessmentIndex: number, field: keyof Assessment, value: string) => {
        setMarksData(prev => {
            const newLog = { ...prev[studentId][examId] };
            const component = { ...newLog[componentKey] };
            const newAssessments = [...component.assessments];
            const numValue = value === '' ? null : parseInt(value, 10);
            newAssessments[assessmentIndex] = { ...newAssessments[assessmentIndex], [field]: isNaN(numValue!) ? null : numValue };

            // Recalculate scaled marks
            const totalObtained = newAssessments.reduce((sum, a) => sum + (a.marksObtained || 0), 0);
            const totalMax = newAssessments.reduce((sum, a) => sum + (a.maxMarks || 0), 0);
            const newScaledMarks = totalMax > 0 ? (totalObtained / totalMax) * component.weightage : 0;
            
            component.assessments = newAssessments;
            component.scaledMarks = newScaledMarks;
            newLog[componentKey] = component;

            return {
                ...prev,
                [studentId]: {
                    ...prev[studentId],
                    [examId]: newLog
                }
            };
        });
    };

    const handleSave = async () => {
        if (!selectedAssignment) return;
        setIsSaving(true);
        const updates: Array<{ studentId: string; performance: Exam[] }> = [];

        selectedClassStudents.forEach(student => {
            const studentUpdates = marksData[student.id];
            if (!studentUpdates) return;

            const newPerformance: Exam[] = JSON.parse(JSON.stringify(student.academicPerformance || []));
            
            Object.keys(studentUpdates).forEach(examId => {
                const updatedLog = studentUpdates[examId];
                let exam = newPerformance.find(e => e.id === examId);
                const examDetails = TERMINAL_EXAMS.find(e => e.id === examId)!;
                if (!exam) {
                    exam = { id: examId, name: examDetails.name, results: [] };
                    newPerformance.push(exam);
                }

                let subjectResult = exam.results.find(r => r.subject === selectedAssignment.subject);
                if (!subjectResult) {
                    subjectResult = { subject: selectedAssignment.subject };
                    exam.results.push(subjectResult);
                }

                const totalActivityMarks = Object.values(updatedLog).reduce((sum, comp) => sum + comp.scaledMarks, 0);
                subjectResult.activityLog = updatedLog;
                subjectResult.activityMarks = Math.round(totalActivityMarks);
            });
            
            updates.push({ studentId: student.id, performance: newPerformance });
        });
        
        if(updates.length > 0) {
            await onUpdateClassMarks(updates);
        }
        setIsSaving(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };


    if (!staffProfile || (staffProfile.assignedSubjects || []).length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <AcademicCapIcon className="w-16 h-16 mx-auto text-slate-400" />
                <h1 className="text-2xl font-bold text-slate-800 mt-4">No Subjects Assigned</h1>
                <p className="text-slate-600 mt-2">You do not have any subjects assigned to you. Please contact an administrator.</p>
                <button onClick={() => navigate('/')} className="mt-6 btn btn-primary">Go to Dashboard</button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800">
                    <BackIcon className="w-5 h-5" /> Back
                </button>
                <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800" title="Go to Home">
                    <HomeIcon className="w-5 h-5" /> <span>Home</span>
                </Link>
            </div>
            
            <h1 className="text-3xl font-bold text-slate-800 mb-2">My Activity Marks Dashboard</h1>
            <p className="text-slate-700 mb-6">Select one of your assigned subjects to begin entering activity marks.</p>

            {!selectedAssignment ? (
                <div className="space-y-6">
                    {/* FIX: Refactored to use Object.keys to iterate over the assignmentsByGrade object. This resolves a TypeScript error where the 'assignments' array was incorrectly inferred as 'unknown' when using Object.entries. */}
                    {Object.keys(assignmentsByGrade).map(grade => (
                        <div key={grade}>
                            <h2 className="text-xl font-bold text-slate-800 border-b-2 border-slate-200 pb-2 mb-3">{grade}</h2>
                            {/* FIX: Corrected typo in Tailwind CSS class from 'sm-grid-cols-3' to 'sm:grid-cols-3'. */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {assignmentsByGrade[grade as Grade].map(asgn => (
                                    <button
                                        key={`${asgn.grade}-${asgn.subject}`}
                                        onClick={() => setSelectedAssignment(asgn)}
                                        className="group block p-4 bg-slate-50 rounded-lg text-center text-slate-800 hover:bg-white hover:text-sky-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 border border-transparent hover:border-sky-300"
                                    >
                                        <BookOpenIcon className="w-10 h-10 mx-auto text-sky-500 group-hover:text-sky-600 transition-colors" />
                                        <span className="text-lg mt-2 block font-bold">{asgn.subject}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                        <div>
                            <button onClick={() => setSelectedAssignment(null)} className="text-sm font-semibold text-sky-700 hover:underline mb-2">&larr; Back to Subject Selection</button>
                            <h2 className="text-2xl font-bold text-slate-800">
                                Entering Marks for: <span className="text-sky-600">{selectedAssignment.grade} - {selectedAssignment.subject}</span>
                            </h2>
                        </div>
                         <button onClick={handleSave} disabled={isSaving} className="btn btn-primary px-6 py-3">
                            {isSaving ? <SpinnerIcon className="w-5 h-5"/> : (showSuccess ? <CheckIcon className="w-5 h-5"/> : <CheckIcon className="w-5 h-5" />)}
                            <span>{isSaving ? 'Saving...' : (showSuccess ? 'Saved!' : 'Save All Changes')}</span>
                        </button>
                    </div>
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full divide-y divide-slate-200 text-xs">
                            <thead className="bg-slate-50 sticky top-0 z-10">
                                <tr>
                                    <th rowSpan={2} className="p-2 border text-left font-bold text-slate-800 sticky left-0 bg-slate-100 z-10 w-44">Student Name</th>
                                    {TERMINAL_EXAMS.map(exam => (
                                        <th key={exam.id} colSpan={4} className="p-2 border text-center font-bold text-slate-800">{exam.name}</th>
                                    ))}
                                </tr>
                                <tr>
                                    {TERMINAL_EXAMS.flatMap(exam =>
                                        ACTIVITY_COMPONENTS.map(comp => (
                                            <th key={`${exam.id}-${comp.key}`} className="p-2 border font-semibold text-slate-700 bg-slate-100">
                                                {comp.label} ({comp.weightage})
                                            </th>
                                        ))
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {selectedClassStudents.map(student => (
                                    <tr key={student.id} className="hover:bg-slate-50">
                                        <td className="p-2 border font-medium sticky left-0 bg-white hover:bg-slate-50">{student.name}</td>
                                        {TERMINAL_EXAMS.flatMap(exam =>
                                            ACTIVITY_COMPONENTS.map(comp => {
                                                const log = marksData[student.id]?.[exam.id];
                                                const assessment = log?.[comp.key]?.assessments[0]; // Assuming one assessment for simplicity
                                                return (
                                                    <td key={`${exam.id}-${comp.key}`} className="p-1 border">
                                                        <div className="flex gap-1">
                                                            <input
                                                                type="number"
                                                                value={assessment?.marksObtained ?? ''}
                                                                onChange={e => handleLogChange(student.id, exam.id, comp.key, 0, 'marksObtained', e.target.value)}
                                                                className="w-1/2 text-center p-1 rounded border-slate-300"
                                                                placeholder="Got"
                                                            />
                                                            <input
                                                                type="number"
                                                                value={assessment?.maxMarks ?? ''}
                                                                onChange={e => handleLogChange(student.id, exam.id, comp.key, 0, 'maxMarks', e.target.value)}
                                                                className="w-1/2 text-center p-1 rounded border-slate-300"
                                                                placeholder="Max"
                                                            />
                                                        </div>
                                                    </td>
                                                );
                                            })
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActivityMarksPage;

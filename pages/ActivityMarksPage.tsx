
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Staff, Student, Grade, GradeDefinition, SubjectAssignment, StudentStatus, Exam, ActivityLog } from '../types';
import { BackIcon, HomeIcon, AcademicCapIcon, BookOpenIcon, CheckIcon, SpinnerIcon, EditIcon } from '../components/Icons';
import { TERMINAL_EXAMS } from '../constants';
import ActivityLogModal from '../components/ActivityLogModal';

interface ActivityMarksPageProps {
  user: User | null;
  staffProfile: Staff | null;
  students: Student[];
  gradeDefinitions: Record<Grade, GradeDefinition>;
  onUpdateClassMarks: (updates: Array<{ studentId: string; performance: Exam[] }>) => Promise<void>;
}

// Toast component for save feedback
const SuccessToast: React.FC<{ message: string; onDismiss: () => void }> = ({ message, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 3000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div className="fixed top-24 right-5 bg-emerald-500 text-white shadow-lg rounded-lg p-4 flex items-center gap-3 z-50 animate-fade-in">
            <CheckIcon className="w-6 h-6" />
            <p className="font-semibold">{message}</p>
        </div>
    );
};

const ActivityMarksPage: React.FC<ActivityMarksPageProps> = ({ user, staffProfile, students, gradeDefinitions, onUpdateClassMarks }) => {
    const navigate = useNavigate();
    const [selectedAssignment, setSelectedAssignment] = useState<SubjectAssignment | null>(null);
    const [activityLogTarget, setActivityLogTarget] = useState<{ student: Student, examId: string } | null>(null);
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

    const calculateTotalActivityMarks = (log?: ActivityLog): number => {
        if (!log) return 0;
        return Object.values(log).reduce((sum, component) => sum + (component.scaledMarks || 0), 0);
    };

    const handleOpenModal = (student: Student, examId: string) => {
        setActivityLogTarget({ student, examId });
    };

    const handleSaveFromModal = async (log: ActivityLog) => {
        if (!activityLogTarget || !selectedAssignment) return;
        
        setIsSaving(true);
        const { student, examId } = activityLogTarget;
        
        const totalActivityMarks = calculateTotalActivityMarks(log);

        const newPerformance: Exam[] = JSON.parse(JSON.stringify(student.academicPerformance || []));
        
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

        subjectResult.activityLog = log;
        subjectResult.activityMarks = Math.round(totalActivityMarks);

        await onUpdateClassMarks([{ studentId: student.id, performance: newPerformance }]);
        
        setActivityLogTarget(null); // Close modal
        setIsSaving(false);
        setShowSuccess(true);
    };

    const initialLogForModal = useMemo(() => {
        if (!activityLogTarget || !selectedAssignment) return undefined;
        const { student, examId } = activityLogTarget;
        const exam = student.academicPerformance?.find(e => e.id === examId);
        return exam?.results.find(r => r.subject === selectedAssignment.subject)?.activityLog;
    }, [activityLogTarget, selectedAssignment]);

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
        <>
        {showSuccess && <SuccessToast message="Marks saved successfully!" onDismiss={() => setShowSuccess(false)} />}
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
                    {Object.keys(assignmentsByGrade).map(grade => (
                        <div key={grade}>
                            <h2 className="text-xl font-bold text-slate-800 border-b-2 border-slate-200 pb-2 mb-3">{grade}</h2>
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
                    </div>
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-800 uppercase w-16">Roll</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-800 uppercase">Student Name</th>
                                    {TERMINAL_EXAMS.map(exam => (
                                        <th key={exam.id} className="px-4 py-3 text-center text-xs font-bold text-slate-800 uppercase">{exam.name}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {selectedClassStudents.map(student => (
                                    <tr key={student.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-2 font-semibold text-center">{student.rollNo}</td>
                                        <td className="px-4 py-2 font-medium">{student.name}</td>
                                        {TERMINAL_EXAMS.map(exam => {
                                            const examData = student.academicPerformance?.find(e => e.id === exam.id);
                                            const subjectResult = examData?.results.find(r => r.subject === selectedAssignment.subject);
                                            const total = subjectResult?.activityMarks;

                                            return (
                                                <td key={exam.id} className="px-4 py-2 text-center">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <span className="font-bold text-lg w-24 text-right">
                                                            {total != null ? `${total.toFixed(1)} / 40` : '-'}
                                                        </span>
                                                        <button 
                                                            onClick={() => handleOpenModal(student, exam.id)}
                                                            className="p-2 text-sky-600 hover:bg-sky-100 rounded-full"
                                                            title={`Log marks for ${exam.name}`}
                                                        >
                                                            <EditIcon className="w-5 h-5"/>
                                                        </button>
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {selectedClassStudents.length === 0 && (
                            <p className="text-center p-8 text-slate-600">No students in this class.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
        
        {activityLogTarget && selectedAssignment && (
            <ActivityLogModal
                isOpen={!!activityLogTarget}
                onClose={() => setActivityLogTarget(null)}
                onSave={handleSaveFromModal}
                studentName={activityLogTarget.student.name}
                examName={TERMINAL_EXAMS.find(e => e.id === activityLogTarget!.examId)!.name}
                subjectName={selectedAssignment.subject}
                initialLog={initialLogForModal}
            />
        )}
        </>
    );
};

export default ActivityMarksPage;

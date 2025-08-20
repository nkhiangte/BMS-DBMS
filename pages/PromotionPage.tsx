
import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Student, Grade, GradeDefinition, StudentStatus, SubjectMark } from '../types';
import { GRADES_LIST } from '../constants';
import { calculateStudentResult } from '../utils';
import { BackIcon, HomeIcon, CheckIcon, AcademicCapIcon } from '../components/Icons';
import ConfirmationModal from '../components/ConfirmationModal';

interface PromotionPageProps {
  students: Student[];
  gradeDefinitions: Record<Grade, GradeDefinition>;
  academicYear: string;
  onPromoteStudents: () => void;
}

const PromotionPage: React.FC<PromotionPageProps> = ({ students, gradeDefinitions, academicYear, onPromoteStudents }) => {
    const navigate = useNavigate();
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const promotionSummary = useMemo(() => {
        const finalExamId = 'terminal3';
        return GRADES_LIST.map(grade => {
            const classStudents = students.filter(s => s.status === StudentStatus.ACTIVE && s.grade === grade);
            let toPromote = 0;
            let toDetain = 0;
            let toGraduate = 0;

            classStudents.forEach(student => {
                const gradeDef = gradeDefinitions[student.grade];
                const finalExam = student.academicPerformance?.find(e => e.id === finalExamId);
                
                // If no final exam data or no grade def, detain by default
                if (!finalExam || !gradeDef || finalExam.results.length === 0) {
                    toDetain++;
                    return;
                }

                const { finalResult } = calculateStudentResult(finalExam.results, gradeDef, student.grade);

                if (finalResult === 'FAIL') {
                    toDetain++;
                } else { // PASS or SIMPLE PASS
                    if (student.grade === Grade.X) {
                        toGraduate++;
                    } else {
                        toPromote++;
                    }
                }
            });

            return { grade, total: classStudents.length, toPromote, toDetain, toGraduate };
        });
    }, [students, gradeDefinitions]);

    const handleConfirmPromotion = () => {
        onPromoteStudents();
        setIsConfirmModalOpen(false);
        navigate('/login', { state: { message: `Session ${academicYear} concluded. Please log in and set the new academic year.` }});
    };
    
    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
                <div className="mb-6 flex justify-between items-center">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
                        <BackIcon className="w-5 h-5" /> Back
                    </button>
                    <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors" title="Go to Home/Dashboard">
                        <HomeIcon className="w-5 h-5" /> <span>Home</span>
                    </Link>
                </div>

                <div className="text-center">
                    <AcademicCapIcon className="w-16 h-16 mx-auto text-sky-600 bg-sky-100 p-3 rounded-full" />
                    <h1 className="text-3xl font-bold text-slate-800 mt-4">Promote Students & Start New Session</h1>
                    <p className="text-slate-600 mt-2">
                        This action will finalize results for the <span className="font-bold">{academicYear}</span> session based on Final Term marks.
                    </p>
                </div>
                
                <div className="bg-amber-50 border-l-4 border-amber-400 text-amber-800 p-4 my-8 rounded-r-lg">
                    <h3 className="font-bold">Important Notice</h3>
                    <p>This is a critical, one-way action. Once confirmed, student grades will be updated, academic and fee records will be reset for the new session, and the current session will end. This action cannot be undone.</p>
                </div>

                <h2 className="text-xl font-bold text-slate-800 mb-4">Promotion Summary</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 border">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Class</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-800 uppercase">Total Students</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-emerald-700 uppercase">To Be Promoted</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-red-700 uppercase">To Be Detained</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-indigo-700 uppercase">To Graduate</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {promotionSummary.filter(s => s.total > 0).map(summary => (
                                <tr key={summary.grade}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{summary.grade}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-slate-800">{summary.total}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-emerald-600">{summary.toPromote}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-red-600">{summary.toDetain}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-indigo-600">{summary.toGraduate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-8 flex justify-end">
                    <button 
                        onClick={() => setIsConfirmModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-transform hover:scale-105"
                    >
                        <CheckIcon className="w-6 h-6" />
                        Confirm & Finalize Session {academicYear}
                    </button>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmPromotion}
                title="Finalize Academic Session?"
            >
                <p>Are you sure you want to proceed? This will promote, detain, and graduate students based on the summary shown. <span className="font-bold">This action cannot be reversed.</span></p>
            </ConfirmationModal>
        </>
    );
};

export default PromotionPage;

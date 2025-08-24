
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Grade, GradeDefinition } from '../types';
import { GRADES_LIST } from '../constants';
import { BackIcon, HomeIcon, EditIcon, BookOpenIcon } from '../components/Icons';
import EditSubjectsModal from '../components/EditSubjectsModal';

interface ManageSubjectsPageProps {
  gradeDefinitions: Record<Grade, GradeDefinition>;
  onUpdateGradeDefinition: (grade: Grade, newDefinition: GradeDefinition) => void;
}

const ManageSubjectsPage: React.FC<ManageSubjectsPageProps> = ({ gradeDefinitions, onUpdateGradeDefinition }) => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGrade, setEditingGrade] = useState<Grade | null>(null);

    const handleEditClick = (grade: Grade) => {
        setEditingGrade(grade);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingGrade(null);
    };

    const handleSaveChanges = (newDefinition: GradeDefinition) => {
        if (editingGrade) {
            onUpdateGradeDefinition(editingGrade, newDefinition);
        }
        handleCloseModal();
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
                <div className="mb-6 flex justify-between items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors"
                    >
                        <BackIcon className="w-5 h-5" />
                        Back
                    </button>
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
                        title="Go to Home/Dashboard"
                    >
                        <HomeIcon className="w-5 h-5" />
                        <span>Home</span>
                    </Link>
                </div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Manage Subjects by Grade</h1>
                <p className="text-slate-700 mb-8">
                    View and edit the official list of subjects and their mark structure for each grade level.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {GRADES_LIST.map(grade => {
                        const gradeDef = gradeDefinitions[grade];
                        
                        return (
                            <div key={grade} className="bg-slate-50 rounded-lg p-4 flex flex-col border">
                                <div className="flex justify-between items-start mb-3">
                                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <BookOpenIcon className="w-6 h-6 text-sky-600" />
                                        {grade}
                                    </h2>
                                    <button
                                        onClick={() => handleEditClick(grade)}
                                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 text-xs bg-white border border-slate-300 text-slate-700 font-semibold rounded-md shadow-sm hover:bg-slate-100"
                                        title={`Edit curriculum for ${grade}`}
                                    >
                                        <EditIcon className="w-4 h-4" />
                                        Edit
                                    </button>
                                </div>
                                <ul className="text-slate-700 space-y-1 text-sm flex-grow">
                                    {(gradeDef.subjects || []).length > 0 ? (
                                        (gradeDef.subjects || []).map((subject, index) => (
                                            <li key={index} className="flex justify-between items-center bg-white p-1.5 rounded">
                                                <span className="font-semibold">{subject.name}</span>
                                                <span className="text-xs text-slate-700 font-mono">
                                                    {subject.activityFullMarks > 0 
                                                     ? `Exam:${subject.examFullMarks}, Act:${subject.activityFullMarks}`
                                                     : `Marks:${subject.examFullMarks}`
                                                    }
                                                </span>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="list-none italic text-center text-slate-600 font-semibold p-4">
                                            No subjects defined.
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )
                    })}
                </div>
            </div>
            {editingGrade && (
                <EditSubjectsModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveChanges}
                    grade={editingGrade}
                    initialGradeDefinition={gradeDefinitions[editingGrade]}
                />
            )}
        </>
    );
};

export default ManageSubjectsPage;

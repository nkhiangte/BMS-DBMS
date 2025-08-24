
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GRADES_LIST } from '../constants';
import { BookOpenIcon, HomeIcon, BackIcon, CogIcon, ArrowUpOnSquareIcon } from '../components/Icons';
import { Grade, GradeDefinition, Staff, User, Role } from '../types';

interface ClassListPageProps {
    gradeDefinitions: Record<Grade, GradeDefinition>;
    staff: Staff[];
    onOpenImportModal: (grade: Grade | null) => void;
    user: User;
    teacherAssignedGrade: Grade | null;
}

const ClassListPage: React.FC<ClassListPageProps> = ({ gradeDefinitions, staff, onOpenImportModal, user, teacherAssignedGrade }) => {
    const navigate = useNavigate();

    const gradesToDisplay = user.role === Role.TEACHER && teacherAssignedGrade
        ? [teacherAssignedGrade]
        : GRADES_LIST;

    return (
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
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Manage Classes</h1>
                    <p className="text-slate-600 mt-1">Select a class to view all students enrolled in it.</p>
                </div>
                 <div className="flex items-center gap-3">
                     <button
                        onClick={() => onOpenImportModal(null)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition hover:-translate-y-0.5"
                    >
                        <ArrowUpOnSquareIcon className="w-5 h-5" />
                        Import Students
                    </button>
                    <Link
                        to="/subjects"
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition hover:-translate-y-0.5"
                    >
                        <CogIcon className="w-5 h-5" />
                        Manage Subjects
                    </Link>
                </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {gradesToDisplay.map(grade => {
                    const gradeDef = gradeDefinitions[grade];
                    const teacher = staff.find(t => t.id === gradeDef?.classTeacherId);
                    const teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}` : 'N/A';

                    return (
                        <Link
                            key={grade}
                            to={`/classes/${encodeURIComponent(grade)}`}
                            className="group block p-4 bg-slate-50 rounded-lg text-center text-slate-800 hover:bg-white hover:text-sky-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 border border-transparent hover:border-sky-300"
                        >
                            <BookOpenIcon className="w-12 h-12 mx-auto text-sky-500 group-hover:text-sky-600 transition-colors" />
                            <span className="text-xl mt-2 block font-bold">{grade}</span>
                            <div className="mt-2 text-xs text-slate-600 font-medium">
                                Teacher: <span className="font-semibold block">{teacherName}</span>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    );
};

export default ClassListPage;

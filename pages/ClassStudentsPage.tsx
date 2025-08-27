import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Student, Grade, GradeDefinition, Staff, EmploymentStatus, User } from '../types';
import { BackIcon, HomeIcon, EditIcon, CheckIcon, XIcon, CheckCircleIcon, XCircleIcon, ArrowUpOnSquareIcon, TransferIcon, TrashIcon, ClipboardDocumentCheckIcon } from '../components/Icons';
import { formatStudentId, calculateDues } from '../utils';
import EditSubjectsModal from '../components/EditSubjectsModal';

interface ClassStudentsPageProps {
  students: Student[];
  staff: Staff[];
  gradeDefinitions: Record<Grade, GradeDefinition>;
  onUpdateGradeDefinition: (grade: Grade, newDefinition: GradeDefinition) => void;
  academicYear: string;
  onOpenImportModal: (grade: Grade | null) => void;
  onOpenTransferModal: (student: Student) => void;
  onDelete: (student: Student) => void;
  user: User;
}

const ClassStudentsPage: React.FC<ClassStudentsPageProps> = ({ students, staff, gradeDefinitions, onUpdateGradeDefinition, academicYear, onOpenImportModal, onOpenTransferModal, onDelete, user }) => {
  const { grade } = useParams<{ grade: string }>();
  const navigate = useNavigate();
  const decodedGrade = grade ? decodeURIComponent(grade) as Grade : '' as Grade;
  const gradeDef = gradeDefinitions[decodedGrade];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingTeacher, setIsEditingTeacher] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  
  const currentTeacher = useMemo(() => {
      return staff.find(t => t.id === gradeDef?.classTeacherId);
  }, [staff, gradeDef]);
  const currentTeacherName = currentTeacher ? `${currentTeacher.firstName} ${currentTeacher.lastName}` : 'Not Assigned';

  const teacherOptions = useMemo(() => {
    const activeTeachingStaff = staff.filter(t => t.staffType === 'Teaching' && t.status === EmploymentStatus.ACTIVE);
    
    // If the current teacher is assigned and not active, add them to the list so they can be seen.
    if (currentTeacher && currentTeacher.status !== EmploymentStatus.ACTIVE) {
        activeTeachingStaff.push(currentTeacher);
    }
    return activeTeachingStaff.sort((a,b) => a.firstName.localeCompare(b.firstName));
  }, [staff, gradeDef, currentTeacher]);

  useEffect(() => {
      if (gradeDef) {
          setSelectedTeacherId(gradeDef.classTeacherId || '');
      }
  }, [gradeDef]);

  const classStudents = useMemo(() => {
    return students.filter(student => student.grade === decodedGrade && student.status === 'Active').sort((a,b) => a.rollNo - b.rollNo);
  }, [students, decodedGrade]);

  const handleSaveSubjects = (newDefinition: GradeDefinition) => {
    onUpdateGradeDefinition(decodedGrade, newDefinition);
    setIsModalOpen(false);
  };
  
  const handleTeacherSave = () => {
    const newTeacherId = selectedTeacherId ? selectedTeacherId : undefined;
    const oldTeacherId = gradeDef.classTeacherId;

    if (newTeacherId === oldTeacherId) {
        setIsEditingTeacher(false);
        return;
    }

    // Update the current grade with the new teacher ID.
    onUpdateGradeDefinition(decodedGrade, {
        ...gradeDef,
        classTeacherId: newTeacherId,
    });

    // If the newly assigned teacher was previously assigned to another class, unassign them.
    if (newTeacherId) {
        const previouslyAssignedEntry = Object.entries(gradeDefinitions).find(
            ([g, def]) => g !== decodedGrade && def.classTeacherId === newTeacherId
        );
        if (previouslyAssignedEntry) {
            const [oldGrade, oldDef] = previouslyAssignedEntry;
            onUpdateGradeDefinition(oldGrade as Grade, { ...oldDef, classTeacherId: undefined });
        }
    }
      
    setIsEditingTeacher(false);
  };

  if (!decodedGrade || !gradeDef) {
    return <div>Invalid Grade</div>;
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => navigate('/classes')}
            className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors"
          >
            <BackIcon className="w-5 h-5" />
            Back to All Classes
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

        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Students in {decodedGrade}</h1>
            <div className="flex items-center gap-2 mt-2 text-md">
                <span className="font-bold text-slate-800">Class Teacher:</span>
                {isEditingTeacher ? (
                    <div className="flex items-center gap-2">
                        <select
                            value={selectedTeacherId}
                            onChange={(e) => setSelectedTeacherId(e.target.value)}
                            className="form-select px-2 py-1 text-sm border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
                            autoFocus
                        >
                            <option value="">-- Unassigned --</option>
                            {teacherOptions.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.firstName} {teacher.lastName} {teacher.status !== EmploymentStatus.ACTIVE ? `(${teacher.status})` : ''}
                                </option>
                            ))}
                        </select>
                        <button onClick={handleTeacherSave} title="Save" className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-full transition-colors"><CheckIcon className="w-5 h-5" /></button>
                        <button onClick={() => { setIsEditingTeacher(false); setSelectedTeacherId(gradeDef.classTeacherId || ''); }} title="Cancel" className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-full transition-colors"><XIcon className="w-5 h-5" /></button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{currentTeacherName}</span>
                        {user.role === 'admin' && (
                            <button onClick={() => setIsEditingTeacher(true)} title="Change Class Teacher" className="p-1.5 text-sky-600 hover:bg-sky-100 rounded-full transition-colors"><EditIcon className="w-5 h-5" /></button>
                        )}
                    </div>
                )}
            </div>
          </div>
           <div className="flex items-center gap-3">
                <Link
                    to={`/classes/${encodeURIComponent(decodedGrade)}/attendance`}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 transition hover:-translate-y-0.5"
                >
                    <ClipboardDocumentCheckIcon className="w-5 h-5" />
                    Daily Attendance
                </Link>
                {user.role === 'admin' && (
                    <button
                        onClick={() => onOpenImportModal(decodedGrade)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 transition hover:-translate-y-0.5"
                    >
                        <ArrowUpOnSquareIcon className="w-5 h-5" />
                        Import to this Class
                    </button>
                )}
            </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Roll No</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Student ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Father's Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Dues Status</th>
                {user.role === 'admin' && <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {classStudents.map(student => {
                  const dues = calculateDues(student);
                  return (
                    <tr key={student.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{student.rollNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-mono">{formatStudentId(student, academicYear)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link to={`/student/${student.id}`} className="text-sky-700 hover:underline">{student.name}</Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{student.fatherName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {dues.length === 0 ? (
                            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold"><CheckCircleIcon className="w-5 h-5"/> Cleared</span>
                        ) : (
                            <span className="flex items-center gap-1.5 text-amber-600 font-semibold"><XCircleIcon className="w-5 h-5"/> Pending</span>
                        )}
                      </td>
                      {user.role === 'admin' && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                             <button onClick={() => onOpenTransferModal(student)} className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-full" title="Transfer Student to another class">
                                <TransferIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => onDelete(student)} className="p-2 text-red-600 hover:bg-red-100 rounded-full" title="Delete Student Record">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
              })}
            </tbody>
          </table>
          {classStudents.length === 0 && (
            <div className="text-center py-10 border-t">
                <p className="text-slate-700 font-semibold">No active students in this class.</p>
            </div>
          )}
        </div>
      </div>
      {isModalOpen && (
        <EditSubjectsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveSubjects}
          grade={decodedGrade}
          initialGradeDefinition={gradeDef}
        />
      )}
    </>
  );
};

export default ClassStudentsPage;
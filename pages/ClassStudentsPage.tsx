import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Student, Grade, GradeDefinition, Staff, EmploymentStatus } from '../types';
import { BackIcon, HomeIcon, EditIcon, CheckIcon, XIcon, CheckCircleIcon, XCircleIcon, ArrowUpOnSquareIcon, TransferIcon, TrashIcon } from '../components/Icons';
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
}

const ClassStudentsPage: React.FC<ClassStudentsPageProps> = ({ students, staff, gradeDefinitions, onUpdateGradeDefinition, academicYear, onOpenImportModal, onOpenTransferModal, onDelete }) => {
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
          setSelectedTeacherId(String(gradeDef.classTeacherId || ''));
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
    const newTeacherId = selectedTeacherId ? Number(selectedTeacherId) : undefined;
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
                        <button onClick={() => { setIsEditingTeacher(false); setSelectedTeacherId(String(gradeDef.classTeacherId || '')); }} title="Cancel" className="p-1.5 text-red-600 hover:bg-red-100 rounded-full transition-colors"><XIcon className="w-5 h-5" /></button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 group">
                        <span className="text-slate-800 font-semibold">{currentTeacherName}</span>
                         {currentTeacher?.status !== EmploymentStatus.ACTIVE && (
                             <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">{currentTeacher?.status}</span>
                         )}
                        <button onClick={() => setIsEditingTeacher(true)} title="Edit class teacher" className="p-1.5 text-slate-600 hover:text-slate-800 bg-transparent hover:bg-slate-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <EditIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
          </div>
          <div className="flex items-center gap-2">
             <button
                onClick={() => onOpenImportModal(decodedGrade)}
                className="btn btn-primary bg-emerald-600 hover:bg-emerald-700"
              >
                <ArrowUpOnSquareIcon className="w-5 h-5" />
                Import Students
              </button>
             <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-secondary"
            >
              <EditIcon className="w-5 h-5" />
              Edit Subjects
            </button>
            <div className="text-lg font-bold text-slate-800 bg-slate-100 px-4 py-2 rounded-lg">
              Total Students: <span className="text-sky-700">{classStudents.length}</span>
            </div>
          </div>
        </div>
        
        {classStudents.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
              <p className="text-slate-700 text-lg font-semibold">No active student records found for this class.</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {classStudents.map(student => {
                  const dues = calculateDues(student);
                  return (
                      <div key={student.id} className="bg-slate-50 rounded-lg p-4 shadow-sm border border-slate-200">
                          <div className="flex justify-between items-start">
                              <div>
                                  <Link to={`/student/${student.id}`} className="font-bold text-lg text-sky-700 hover:underline">
                                      {student.name}
                                  </Link>
                                  <p className="text-sm text-slate-600">Roll No: {student.rollNo}</p>
                                  <p className="text-sm font-mono text-slate-800">{formatStudentId(student, academicYear)}</p>
                              </div>
                              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                  <button onClick={() => onOpenTransferModal(student)} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 p-1 rounded hover:bg-indigo-50" title="Transfer Student">
                                      <TransferIcon className="w-4 h-4" />
                                      <span>Transfer</span>
                                  </button>
                                  <button onClick={() => onDelete(student)} className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50" title="Remove Incorrect Entry">
                                      <TrashIcon className="w-4 h-4" />
                                      <span>Remove</span>
                                  </button>
                              </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-slate-200 space-y-2 text-sm">
                              <p><span className="font-semibold text-slate-700">Father:</span> {student.fatherName}</p>
                              <div className="flex items-center gap-2">
                                  <span className="font-semibold text-slate-700">Fee Status:</span>
                                  {dues.length === 0 ? (
                                      <div className="flex items-center gap-1.5 text-emerald-600">
                                          <CheckCircleIcon className="w-5 h-5" />
                                          <span className="font-medium">Cleared</span>
                                      </div>
                                  ) : (
                                      <div className="flex items-center gap-1.5 text-amber-600">
                                          <XCircleIcon className="w-5 h-5" />
                                          <span className="font-medium">Dues Pending</span>
                                      </div>
                                  )}
                              </div>
                          </div>
                      </div>
                  )
              })}
            </div>
            
            {/* Desktop Table View */}
            <div className="overflow-x-auto hidden md:block">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Roll No</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Student ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Fee Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Father's Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {classStudents.map(student => {
                    const dues = calculateDues(student);
                    return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{student.rollNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                        <Link to={`/student/${student.id}`} className="hover:underline text-sky-700 font-semibold">
                          {student.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{formatStudentId(student, academicYear)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {dues.length === 0 ? (
                              <div className="flex items-center gap-1.5 text-emerald-600">
                                  <CheckCircleIcon className="w-5 h-5" />
                                  <span className="font-medium">Cleared</span>
                              </div>
                          ) : (
                              <div className="flex items-center gap-1.5 text-amber-600">
                                  <XCircleIcon className="w-5 h-5" />
                                  <span className="font-medium">Dues Pending</span>
                              </div>
                          )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{student.fatherName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-4">
                              <button onClick={() => onOpenTransferModal(student)} className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors" title="Transfer Student">
                                  <TransferIcon className="w-4 h-4" />
                                  <span>Transfer</span>
                              </button>
                              <button onClick={() => onDelete(student)} className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-800 transition-colors" title="Remove Incorrect Entry">
                                  <TrashIcon className="w-4 h-4" />
                                  <span>Remove</span>
                              </button>
                          </div>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      <EditSubjectsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        grade={decodedGrade}
        initialGradeDefinition={gradeDef}
        onSave={handleSaveSubjects}
      />
    </>
  );
};

export default ClassStudentsPage;
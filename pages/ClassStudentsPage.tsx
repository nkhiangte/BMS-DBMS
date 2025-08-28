import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Student, Grade, GradeDefinition, Staff, EmploymentStatus, User, FeePayments } from '../types';
import { BackIcon, HomeIcon, EditIcon, CheckIcon, XIcon, CheckCircleIcon, XCircleIcon, ArrowUpOnSquareIcon, TransferIcon, TrashIcon, ClipboardDocumentCheckIcon, PlusIcon, MessageIcon, WhatsappIcon, UserIcon, DocumentReportIcon, CurrencyDollarIcon, PrinterIcon } from '../components/Icons';
import { formatStudentId, calculateDues, formatPhoneNumberForWhatsApp } from '../utils';
import EditSubjectsModal from '../components/EditSubjectsModal';
import { TERMINAL_EXAMS } from '../constants';
import ExamFeeCollectionModal from '../components/ExamFeeCollectionModal';
import ConfirmationModal from '../components/ConfirmationModal';


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
  assignedGrade: Grade | null;
  onAddStudentToClass: (grade: Grade) => void;
  onUpdateBulkFeePayments: (updates: Array<{ studentId: string; payments: FeePayments }>) => Promise<void>;
}

const PhotoThumbnail: React.FC<{ student: Student }> = ({ student }) => {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setHasError(false);
    }, [student.photographUrl]);

    if (!student.photographUrl || hasError) {
        return (
            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-slate-500" />
            </div>
        );
    }

    return (
        <img
            src={student.photographUrl}
            alt={student.name}
            className="h-10 w-10 rounded-full object-cover"
            onError={() => setHasError(true)}
        />
    );
};

const ClassStudentsPage: React.FC<ClassStudentsPageProps> = ({ students, staff, gradeDefinitions, onUpdateGradeDefinition, academicYear, onOpenImportModal, onOpenTransferModal, onDelete, user, assignedGrade, onAddStudentToClass, onUpdateBulkFeePayments }) => {
  const { grade } = useParams<{ grade: string }>();
  const navigate = useNavigate();
  const decodedGrade = grade ? decodeURIComponent(grade) as Grade : '' as Grade;
  const gradeDef = gradeDefinitions[decodedGrade];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExamFeeModalOpen, setIsExamFeeModalOpen] = useState(false);
  const [isBulkPrintModalOpen, setIsBulkPrintModalOpen] = useState(false);
  const [isEditingTeacher, setIsEditingTeacher] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');

  const isClassTeacher = user.role === 'admin' || decodedGrade === assignedGrade;
  
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

  const BulkPrintModal: React.FC = () => {
      const [examId, setExamId] = useState<string>('');
      return (
          <ConfirmationModal isOpen={isBulkPrintModalOpen} onClose={() => setIsBulkPrintModalOpen(false)} onConfirm={() => navigate(`/reports/bulk-print/${encodeURIComponent(decodedGrade)}/${examId}`)} title="Select Exam for Bulk Printing" confirmDisabled={!examId}>
              <p>Please select the terminal exam for which you want to print all report cards.</p>
              <select value={examId} onChange={e => setExamId(e.target.value)} className="mt-4 w-full border-slate-300 rounded-md shadow-sm">
                  <option value="" disabled>-- Select Exam --</option>
                  {TERMINAL_EXAMS.map(exam => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
              </select>
          </ConfirmationModal>
      )
  };

  if (!decodedGrade || !gradeDef) {
    return <div>Invalid Grade</div>;
  }

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
           <div className="flex items-center flex-wrap gap-3">
                <Link
                    to={`/classes/${encodeURIComponent(decodedGrade)}/attendance`}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 transition hover:-translate-y-0.5"
                >
                    <ClipboardDocumentCheckIcon className="w-5 h-5" />
                    Daily Attendance
                </Link>
                 <button onClick={() => setIsBulkPrintModalOpen(true)} className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition hover:-translate-y-0.5">
                    <PrinterIcon className="w-5 h-5" />
                    Bulk Print Reports
                </button>
                {isClassTeacher && (
                   <>
                    <button
                        onClick={() => setIsExamFeeModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 text-white font-semibold rounded-lg shadow-md hover:bg-violet-700 transition hover:-translate-y-0.5"
                    >
                        <CurrencyDollarIcon className="w-5 h-5" />
                        Collect Exam Fees
                    </button>
                     <button
                        onClick={() => onAddStudentToClass(decodedGrade)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition hover:-translate-y-0.5"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Add Student to this Class
                    </button>
                    <button
                        onClick={() => onOpenImportModal(decodedGrade)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 transition hover:-translate-y-0.5"
                    >
                        <ArrowUpOnSquareIcon className="w-5 h-5" />
                        Import Students
                    </button>
                   </>
                )}
            </div>
        </div>
        
        {isClassTeacher && (
            <div className="my-6 p-4 bg-slate-50 rounded-lg border">
                <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <DocumentReportIcon className="w-5 h-5 text-indigo-600"/>
                    Class Reports
                </h3>
                <div className="flex flex-wrap gap-3">
                    {TERMINAL_EXAMS.map(exam => (
                        <Link 
                            key={exam.id} 
                            to={`/reports/class-statement/${encodeURIComponent(decodedGrade)}/${exam.id}`}
                            className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-md shadow-sm hover:bg-slate-100 transition"
                        >
                            {exam.name}
                        </Link>
                    ))}
                </div>
            </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Roll No</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Student ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase">Dues Status</th>
                {isClassTeacher && <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>}
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
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                                <PhotoThumbnail student={student} />
                            </div>
                            <Link to={`/student/${student.id}`} className="text-sky-700 hover:underline">{student.name}</Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        <div className="flex items-center justify-between">
                            <span>{student.contact}</span>
                            {student.contact && (
                                <div className="flex items-center gap-1">
                                    <a href={`https://wa.me/${formatPhoneNumberForWhatsApp(student.contact)}`} target="_blank" rel="noopener noreferrer" className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-full" title="Send WhatsApp">
                                        <WhatsappIcon className="w-5 h-5" />
                                    </a>
                                    <a href={`sms:${student.contact}`} className="p-1.5 text-sky-600 hover:bg-sky-100 rounded-full" title="Send SMS">
                                        <MessageIcon className="w-5 h-5" />
                                    </a>
                                </div>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {dues.length === 0 ? (
                            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold"><CheckCircleIcon className="w-5 h-5"/> Cleared</span>
                        ) : (
                            <span className="flex items-center gap-1.5 text-amber-600 font-semibold"><XCircleIcon className="w-5 h-5"/> Pending</span>
                        )}
                      </td>
                      {isClassTeacher && (
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
      <ExamFeeCollectionModal
        isOpen={isExamFeeModalOpen}
        onClose={() => setIsExamFeeModalOpen(false)}
        onSave={onUpdateBulkFeePayments}
        students={classStudents}
        grade={decodedGrade}
      />
      <BulkPrintModal />
    </>
  );
};

export default ClassStudentsPage;
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Student, Exam, SubjectMark, Grade, GradeDefinition, User, ActivityLog } from '../types';
import { TERMINAL_EXAMS, CONDUCT_GRADE_LIST } from '../constants';
import { BackIcon, EditIcon, CheckIcon, XIcon, HomeIcon } from '../components/Icons';
import AcademicRecordTable from '../components/AcademicRecordTable';
import { formatStudentId } from '../utils';
import ActivityLogModal from '../components/ActivityLogModal';

interface AcademicPerformancePageProps {
  students: Student[];
  onUpdateAcademic: (studentId: string, performance: Exam[]) => void;
  gradeDefinitions: Record<Grade, GradeDefinition>;
  academicYear: string;
  user: User;
  assignedGrade: Grade | null;
}

const AcademicPerformancePage: React.FC<AcademicPerformancePageProps> = ({ students, onUpdateAcademic, gradeDefinitions, academicYear, user, assignedGrade }) => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  const student = useMemo(() => students.find(s => s.id === studentId), [students, studentId]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [performanceData, setPerformanceData] = useState<Exam[]>([]);
  const [editingActivityLogFor, setEditingActivityLogFor] = useState<{ examId: string, subjectName: string } | null>(null);
  
  const canEdit = user.role === 'admin' || (student && student.grade === assignedGrade);

  const originalPerformanceData = useMemo(() => {
    if (!student) return [];
    
    const gradeDef = gradeDefinitions[student.grade];
    if (!gradeDef) return [];

    const subjectNamesForGrade = gradeDef.subjects.map(s => s.name);
    const studentPerformance = student.academicPerformance || [];

    return TERMINAL_EXAMS.map(examTemplate => {
      const existingExam = studentPerformance.find(e => e.id === examTemplate.id);
      
      const results: SubjectMark[] = subjectNamesForGrade.map(subjectName => {
        const existingResult = existingExam?.results.find(r => r.subject === subjectName);
        return {
          subject: subjectName,
          marks: existingResult?.marks,
          examMarks: existingResult?.examMarks,
          activityMarks: existingResult?.activityMarks,
          activityLog: existingResult?.activityLog,
          grade: existingResult?.grade,
        };
      });

      return {
        ...examTemplate,
        results,
        teacherRemarks: existingExam?.teacherRemarks || '',
        generalConduct: existingExam?.generalConduct,
      };
    });
  }, [student, gradeDefinitions]);

  useEffect(() => {
    setPerformanceData(originalPerformanceData);
  }, [originalPerformanceData]);

  const handleEditToggle = () => {
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    setPerformanceData(originalPerformanceData);
    setIsEditing(false);
  };
  
  const handleSave = () => {
    if(student) {
      // Filter out results that are completely empty to avoid saving blank records
      const cleanedPerformanceData = performanceData.map(exam => ({
        ...exam,
        results: exam.results.filter(r => r.marks != null || r.examMarks != null || r.activityMarks != null || r.grade != null),
        teacherRemarks: exam.teacherRemarks?.trim() || undefined,
        generalConduct: exam.generalConduct || undefined,
      }));
      onUpdateAcademic(student.id, cleanedPerformanceData);
    }
    setIsEditing(false);
  };

  const handleUpdateExamData = (examId: string, field: 'results' | 'teacherRemarks' | 'generalConduct', value: any) => {
    setPerformanceData(prev => 
      prev.map(exam => exam.id === examId ? { ...exam, [field]: value } : exam)
    );
  };

  const handleOpenActivityLog = (examId: string, subjectName: string) => {
    setEditingActivityLogFor({ examId, subjectName });
  };
  
  const handleSaveActivityLog = (log: ActivityLog) => {
      if (!editingActivityLogFor) return;
  
      const { examId, subjectName } = editingActivityLogFor;
      
      const total = Object.values(log).reduce((acc, val) => acc + (val || 0), 0);
  
      setPerformanceData(prev => 
        prev.map(exam => {
          if (exam.id === examId) {
            
            let subjectFound = false;
            const newResults = exam.results.map(result => {
              if (result.subject === subjectName) {
                subjectFound = true;
                return { ...result, activityLog: log, activityMarks: total };
              }
              return result;
            });
            
            if (!subjectFound) {
                newResults.push({ subject: subjectName, activityLog: log, activityMarks: total });
            }

            return { ...exam, results: newResults };
          }
          return exam;
        })
      );
      
      setEditingActivityLogFor(null);
  };

  const currentActivityLogData = useMemo(() => {
      if (!editingActivityLogFor) return undefined;
      const exam = performanceData.find(e => e.id === editingActivityLogFor.examId);
      const result = exam?.results.find(r => r.subject === editingActivityLogFor.subjectName);
      return result?.activityLog;
  }, [editingActivityLogFor, performanceData]);

  if (!student) {
    return (
        <div className="text-center bg-white p-10 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-red-600">Student Not Found</h2>
            <p className="text-slate-700 mt-2">The requested student profile does not exist.</p>
            <button
                onClick={() => navigate('/')}
                className="mt-6 flex items-center mx-auto justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition"
            >
                <BackIcon className="w-5 h-5" />
                Return to List
            </button>
        </div>
    );
  }
  
  const gradeDef = gradeDefinitions[student.grade];

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
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Academic Performance</h1>
                <p className="text-slate-700 text-lg mt-1">{student.name} ({formatStudentId(student, academicYear)})</p>
            </div>
            <div className="flex gap-3">
                {canEdit && (
                  isEditing ? (
                      <>
                          <button
                              onClick={handleCancel}
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition"
                          >
                              <XIcon className="h-5 h-5" />
                              Cancel
                          </button>
                          <button
                              onClick={handleSave}
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition"
                          >
                              <CheckIcon className="h-5 h-5" />
                              Save Changes
                          </button>
                      </>
                  ) : (
                      <button
                          onClick={handleEditToggle}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition"
                      >
                          <EditIcon className="h-5 h-5" />
                          Edit Records
                      </button>
                  )
                )}
            </div>
        </div>

        <div>
            {performanceData.map(exam => (
                <div key={exam.id} className="mb-8">
                    <AcademicRecordTable
                        examName={exam.name}
                        results={exam.results}
                        isEditing={isEditing && canEdit}
                        onUpdate={(newResults) => handleUpdateExamData(exam.id, 'results', newResults)}
                        subjectDefinitions={gradeDef.subjects}
                        grade={student.grade}
                        onOpenActivityLog={(subjectName) => handleOpenActivityLog(exam.id, subjectName)}
                    />
                     <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-1">Teacher's Remarks for {exam.name}</label>
                            {isEditing && canEdit ? (
                                <textarea
                                    value={exam.teacherRemarks || ''}
                                    onChange={e => handleUpdateExamData(exam.id, 'teacherRemarks', e.target.value)}
                                    rows={3}
                                    className="w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                                    placeholder="Enter feedback or comments..."
                                />
                            ) : (
                                <p className="text-slate-700 p-3 bg-slate-50 rounded-md border min-h-[4rem]">
                                    {exam.teacherRemarks || <span className="italic text-slate-500">No remarks added.</span>}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-1">General Conduct for {exam.name}</label>
                             {isEditing && canEdit ? (
                                <select
                                    value={exam.generalConduct || ''}
                                    onChange={e => handleUpdateExamData(exam.id, 'generalConduct', e.target.value)}
                                    className="w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                                >
                                    <option value="">-- Select Conduct Grade --</option>
                                    {CONDUCT_GRADE_LIST.map(gradeValue => <option key={gradeValue} value={gradeValue}>{gradeValue}</option>)}
                                </select>
                            ) : (
                                <p className="text-slate-700 p-3 bg-slate-50 rounded-md border min-h-[4rem]">
                                    {exam.generalConduct || <span className="italic text-slate-500">Not graded.</span>}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
     {editingActivityLogFor && student && (
        <ActivityLogModal
            isOpen={!!editingActivityLogFor}
            onClose={() => setEditingActivityLogFor(null)}
            onSave={handleSaveActivityLog}
            studentName={student.name}
            examName={performanceData.find(e => e.id === editingActivityLogFor.examId)?.name || ''}
            subjectName={editingActivityLogFor.subjectName}
            initialLog={currentActivityLogData}
        />
    )}
    </>
  );
};

export default AcademicPerformancePage;
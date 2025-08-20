
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Student, Exam, SubjectMark, Grade, GradeDefinition } from '../types';
import { TERMINAL_EXAMS } from '../constants';
import { BackIcon, EditIcon, CheckIcon, XIcon, HomeIcon } from '../components/Icons';
import AcademicRecordTable from '../components/AcademicRecordTable';
import { formatStudentId } from '../utils';

interface AcademicPerformancePageProps {
  students: Student[];
  onUpdateAcademic: (studentId: number, performance: Exam[]) => void;
  gradeDefinitions: Record<Grade, GradeDefinition>;
  academicYear: string;
}

const AcademicPerformancePage: React.FC<AcademicPerformancePageProps> = ({ students, onUpdateAcademic, gradeDefinitions, academicYear }) => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  const student = useMemo(() => students.find(s => s.id === Number(studentId)), [students, studentId]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [performanceData, setPerformanceData] = useState<Exam[]>([]);

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
        };
      });

      return {
        ...examTemplate,
        results,
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
        results: exam.results.filter(r => r.marks != null || r.examMarks != null || r.activityMarks != null),
      }));
      onUpdateAcademic(student.id, cleanedPerformanceData);
    }
    setIsEditing(false);
  };

  const handleUpdateExamResults = (examId: string, newResults: SubjectMark[]) => {
    setPerformanceData(prev => 
      prev.map(exam => exam.id === examId ? { ...exam, results: newResults } : exam)
    );
  };

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
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex justify-between items-center">
             <button
                onClick={() => navigate(`/student/${student.id}`)}
                className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors"
            >
                <BackIcon className="w-5 h-5" />
                Back to Profile
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
                {isEditing ? (
                    <>
                        <button
                            onClick={handleCancel}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition"
                        >
                            <XIcon className="h-5 w-5" />
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition"
                        >
                            <CheckIcon className="h-5 w-5" />
                            Save Changes
                        </button>
                    </>
                ) : (
                    <button
                        onClick={handleEditToggle}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition"
                    >
                        <EditIcon className="h-5 w-5" />
                        Edit Records
                    </button>
                )}
            </div>
        </div>

        <div>
            {performanceData.map(exam => (
                <AcademicRecordTable
                    key={exam.id}
                    examName={exam.name}
                    results={exam.results}
                    isEditing={isEditing}
                    onUpdate={(newResults) => handleUpdateExamResults(exam.id, newResults)}
                    subjectDefinitions={gradeDef.subjects}
                />
            ))}
        </div>
    </div>
  );
};

export default AcademicPerformancePage;
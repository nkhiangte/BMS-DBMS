import React from 'react';
import { SubjectMark, SubjectDefinition, Grade } from '../types';
import { GRADES_WITH_NO_ACTIVITIES, OABC_GRADES } from '../constants';

interface AcademicRecordTableProps {
  examName: string;
  results: SubjectMark[];
  isEditing: boolean;
  onUpdate: (newResults: SubjectMark[]) => void;
  subjectDefinitions: SubjectDefinition[];
  grade: Grade;
}

const AcademicRecordTable: React.FC<AcademicRecordTableProps> = ({ examName, results, isEditing, onUpdate, subjectDefinitions, grade }) => {
  
  const hasActivitiesForThisGrade = !GRADES_WITH_NO_ACTIVITIES.includes(grade);

  const handleMarksChange = (subjectName: string, field: 'examMarks' | 'activityMarks' | 'marks' | 'grade', value: string, max?: number) => {
    let subjectFound = false;
    const newResults = results.map(r => {
      if (r.subject === subjectName) {
        subjectFound = true;
        const updatedResult: SubjectMark = { ...r };
        
        if (field === 'grade') {
            updatedResult.grade = value as any;
            delete updatedResult.marks;
            delete updatedResult.examMarks;
            delete updatedResult.activityMarks;
        } else {
            const newMark = parseInt(value, 10);
            const validatedMark = isNaN(newMark) ? undefined : Math.max(0, Math.min(newMark, max || 100));
            if (field === 'marks') {
                updatedResult.marks = validatedMark;
            } else {
                (updatedResult as any)[field] = validatedMark;
            }
            delete updatedResult.grade;
        }
        return updatedResult;
      }
      return r;
    });

    if (!subjectFound) {
      const newResult: SubjectMark = { subject: subjectName };
      if (field === 'grade') {
        newResult.grade = value as any;
      } else {
        const newMark = parseInt(value, 10);
        const validatedMark = isNaN(newMark) ? undefined : Math.max(0, Math.min(newMark, max || 100));
        (newResult as any)[field] = validatedMark;
      }
      newResults.push(newResult);
    }
    
    onUpdate(newResults);
  };
  
  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-slate-800 mb-4">{examName}</h3>
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="w-1/3 px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Subject</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Exam / Grade</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Activity Marks</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {subjectDefinitions.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-slate-600">
                  No subjects defined for this grade.
                </td>
              </tr>
            ) : (
              subjectDefinitions.map((subjectDef) => {
                const result = results.find(r => r.subject === subjectDef.name) || { subject: subjectDef.name };
                const useSplitMarks = hasActivitiesForThisGrade && subjectDef.activityFullMarks > 0;
                
                const isEffectivelyGradeBased = subjectDef.examFullMarks === 0 && subjectDef.activityFullMarks === 0;
                const isGradeBased = subjectDef.gradingSystem === 'OABC' || isEffectivelyGradeBased;
                
                return (
                  <tr key={subjectDef.name}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                       {subjectDef.name}
                    </td>

                    {/* Exam / Main Marks / Grade Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                      {isEditing ? (
                        isGradeBased ? (
                            <input 
                                type="text"
                                value={result.grade ?? ''}
                                onChange={(e) => {
                                    const val = e.target.value.toUpperCase();
                                    if (/^[OABC]?$/.test(val)) {
                                        handleMarksChange(subjectDef.name, 'grade', val);
                                    }
                                }}
                                className="w-24 px-2 py-1 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-center font-bold"
                                maxLength={1}
                            />
                        ) : (
                            <input 
                                type="number"
                                value={useSplitMarks ? (result.examMarks ?? '') : (result.marks ?? (result.examMarks ?? ''))}
                                onChange={(e) => handleMarksChange(subjectDef.name, useSplitMarks ? 'examMarks' : 'marks', e.target.value, subjectDef.examFullMarks)}
                                className="w-24 px-2 py-1 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                                placeholder={`/ ${subjectDef.examFullMarks}`}
                                max={subjectDef.examFullMarks}
                            />
                        )
                      ) : (
                        isGradeBased ? <span className="font-bold text-lg">{result.grade || '-'}</span> :
                        (useSplitMarks ? (result.examMarks ?? '-') : ((result.marks ?? ((result.examMarks ?? 0) + (result.activityMarks ?? 0))) || '-'))
                      )}
                    </td>

                    {/* Activity Marks Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                      {isGradeBased ? <span className="text-slate-600 font-semibold">N/A</span> :
                        useSplitMarks ? (
                            isEditing ? (
                            <input 
                                type="number"
                                value={result.activityMarks ?? ''}
                                onChange={(e) => handleMarksChange(subjectDef.name, 'activityMarks', e.target.value, subjectDef.activityFullMarks)}
                                className="w-24 px-2 py-1 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                                placeholder={`/ ${subjectDef.activityFullMarks}`}
                                max={subjectDef.activityFullMarks}
                            />
                            ) : (
                            result.activityMarks ?? '-'
                            )
                        ) : (
                            <span className="text-slate-600 font-semibold">N/A</span>
                        )
                      }
                    </td>

                    {/* Total Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                      {isGradeBased ? <span className="font-bold text-lg">{result.grade || '-'}</span> :
                       useSplitMarks
                        ? (((result.examMarks || 0) + (result.activityMarks || 0)) || '-')
                        : ((result.marks ?? ((result.examMarks ?? 0) + (result.activityMarks ?? 0))) || '-')
                      }
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AcademicRecordTable;
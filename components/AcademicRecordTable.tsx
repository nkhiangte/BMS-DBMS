import React from 'react';
import { SubjectMark, SubjectDefinition, Grade } from '../types';
import { GRADES_WITH_NO_ACTIVITIES, OABC_GRADES } from '../constants';
import { isSubjectNumeric } from '../utils';

interface AcademicRecordTableProps {
  examName: string;
  results: SubjectMark[];
  isEditing: boolean;
  onUpdate: (newResults: SubjectMark[]) => void;
  subjectDefinitions: SubjectDefinition[];
  grade: Grade;
  onOpenActivityLog: (subjectName: string) => void;
}

const AcademicRecordTable: React.FC<AcademicRecordTableProps> = ({ examName, results, isEditing, onUpdate, subjectDefinitions, grade, onOpenActivityLog }) => {
  
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
              {hasActivitiesForThisGrade ? (
                <>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Exam Marks</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Activity Marks</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Total</th>
                </>
              ) : (
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Marks / Grade</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {subjectDefinitions.length === 0 ? (
              <tr>
                <td colSpan={hasActivitiesForThisGrade ? 4 : 2} className="px-6 py-4 text-center text-slate-600">
                  No subjects defined for this grade.
                </td>
              </tr>
            ) : (
              subjectDefinitions.map((subjectDef) => {
                const result = results.find(r => r.subject === subjectDef.name) || { subject: subjectDef.name };
                const isGradeBased = !isSubjectNumeric(subjectDef, grade);
                
                const totalMarks = (result.examMarks === undefined && result.activityMarks === undefined)
                  ? undefined
                  : (result.examMarks || 0) + (result.activityMarks || 0);

                const singleMark = result.marks ?? totalMarks;

                return (
                  <tr key={subjectDef.name}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                       {subjectDef.name}
                    </td>
                    {hasActivitiesForThisGrade ? (
                        <>
                            {/* Exam Marks Column (for grades with activities) */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                            {isEditing ? (
                                isGradeBased ? (
                                    <input type="text" value={result.grade ?? ''} onChange={(e) => { const val = e.target.value.toUpperCase(); if (/^[OABC]?$/.test(val)) { handleMarksChange(subjectDef.name, 'grade', val); }}} className="w-24 px-2 py-1 border border-slate-300 rounded-md shadow-sm text-center font-bold" maxLength={1} />
                                ) : (
                                    <input type="number" value={result.examMarks ?? ''} onChange={(e) => handleMarksChange(subjectDef.name, 'examMarks', e.target.value, subjectDef.examFullMarks)} className="w-24 px-2 py-1 border border-slate-300 rounded-md shadow-sm" placeholder={`/ ${subjectDef.examFullMarks}`} max={subjectDef.examFullMarks} />
                                )
                            ) : (
                                isGradeBased ? <span className="font-bold text-lg">{result.grade || '-'}</span> : (result.examMarks ?? '-')
                            )}
                            </td>
                            {/* Activity Marks Column */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                            {isGradeBased || subjectDef.activityFullMarks === 0 ? <span className="text-slate-600 font-semibold">N/A</span> :
                                (isEditing ? (
                                    <input type="number" value={result.activityMarks ?? ''} onChange={(e) => handleMarksChange(subjectDef.name, 'activityMarks', e.target.value, subjectDef.activityFullMarks)} className="w-24 px-2 py-1 border border-slate-300 rounded-md shadow-sm" placeholder={`/ ${subjectDef.activityFullMarks}`} max={subjectDef.activityFullMarks}/>
                                ) : (result.activityMarks ?? '-'))
                            }
                            </td>
                            {/* Total Column */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                                {isGradeBased ? <span className="font-bold text-lg">{result.grade || '-'}</span> :
                                (totalMarks ?? '-')
                                }
                            </td>
                        </>
                    ) : (
                        <>
                            {/* Single Marks/Grade Column (for grades without activities) */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                            {isEditing ? (
                                isGradeBased ? (
                                <input type="text" value={result.grade ?? ''} onChange={(e) => { const val = e.target.value.toUpperCase(); if (/^[OABC]?$/.test(val)) { handleMarksChange(subjectDef.name, 'grade', val); }}} className="w-24 px-2 py-1 border border-slate-300 rounded-md shadow-sm text-center font-bold" maxLength={1} />
                                ) : (
                                <input type="number" value={singleMark ?? ''} onChange={(e) => handleMarksChange(subjectDef.name, 'marks', e.target.value, subjectDef.examFullMarks)} className="w-24 px-2 py-1 border border-slate-300 rounded-md shadow-sm" placeholder={`/ ${subjectDef.examFullMarks}`} max={subjectDef.examFullMarks}/>
                                )
                            ) : (
                                isGradeBased ? <span className="font-bold text-lg">{result.grade || '-'}</span> : (singleMark ?? '-')
                            )}
                            </td>
                        </>
                    )}
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
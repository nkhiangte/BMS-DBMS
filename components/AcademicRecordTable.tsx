import React from 'react';
import { SubjectMark, SubjectDefinition } from '../types';

interface AcademicRecordTableProps {
  examName: string;
  results: SubjectMark[];
  isEditing: boolean;
  onUpdate: (newResults: SubjectMark[]) => void;
  subjectDefinitions: SubjectDefinition[];
}

const AcademicRecordTable: React.FC<AcademicRecordTableProps> = ({ examName, results, isEditing, onUpdate, subjectDefinitions }) => {
  
  const handleMarksChange = (subjectName: string, field: 'examMarks' | 'activityMarks' | 'marks', value: string, max: number) => {
    const newMark = parseInt(value, 10);
    const validatedMark = isNaN(newMark) ? undefined : Math.max(0, Math.min(newMark, max));

    let existingResult = results.find(r => r.subject === subjectName);
    if (!existingResult) {
      existingResult = { subject: subjectName };
    }

    const updatedResult: SubjectMark = { 
      ...existingResult, 
      [field]: validatedMark,
    };
    
    // Ensure other mark type is preserved
    if (field === 'examMarks') {
      updatedResult.activityMarks = existingResult.activityMarks;
    } else if (field === 'activityMarks') {
      updatedResult.examMarks = existingResult.examMarks;
    }

    const otherResults = results.filter(r => r.subject !== subjectName);
    onUpdate([...otherResults, updatedResult]);
  };
  
  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-slate-800 mb-4">{examName}</h3>
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="w-1/3 px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Subject</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Exam Marks</th>
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
                const useSplitMarks = subjectDef.activityFullMarks > 0;
                
                return (
                  <tr key={subjectDef.name}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                       {subjectDef.name}
                    </td>

                    {/* Exam / Main Marks Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                      {isEditing ? (
                        <input 
                          type="number"
                          value={useSplitMarks ? (result.examMarks ?? '') : (result.marks ?? '')}
                          onChange={(e) => handleMarksChange(subjectDef.name, useSplitMarks ? 'examMarks' : 'marks', e.target.value, subjectDef.examFullMarks)}
                          className="w-24 px-2 py-1 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                          placeholder={`/ ${subjectDef.examFullMarks}`}
                          max={subjectDef.examFullMarks}
                        />
                      ) : (
                        useSplitMarks ? (result.examMarks ?? '-') : (result.marks ?? '-')
                      )}
                    </td>

                    {/* Activity Marks Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                      {useSplitMarks ? (
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
                      )}
                    </td>

                    {/* Total Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                      {useSplitMarks
                        ? ((result.examMarks || 0) + (result.activityMarks || 0) || '-')
                        : (result.marks ?? '-')
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
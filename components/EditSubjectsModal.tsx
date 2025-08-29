
import React, { useState, useEffect } from 'react';
import { Grade, GradeDefinition, SubjectDefinition } from '../types';
import { PlusIcon, TrashIcon } from './Icons';

interface EditSubjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newDefinition: GradeDefinition) => void;
  grade: Grade;
  initialGradeDefinition: GradeDefinition;
}

const EditSubjectsModal: React.FC<EditSubjectsModalProps> = ({ isOpen, onClose, onSave, grade, initialGradeDefinition }) => {
  const [subjects, setSubjects] = useState<SubjectDefinition[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Deep copy to prevent modifying the original state directly
      setSubjects(JSON.parse(JSON.stringify(initialGradeDefinition.subjects || [])));
    }
  }, [isOpen, initialGradeDefinition]);

  const hasActivity = ![Grade.NURSERY, Grade.KINDERGARTEN, Grade.I, Grade.II, Grade.IX, Grade.X].includes(grade);

  const handleSubjectChange = (index: number, field: keyof SubjectDefinition, value: string) => {
    const newSubjects = [...subjects];
    const subjectToUpdate = { ...newSubjects[index] };

    if (field === 'name') {
        subjectToUpdate.name = value;
    } else if (field === 'examFullMarks' || field === 'activityFullMarks') {
        const numValue = parseInt(value, 10);
        subjectToUpdate[field] = isNaN(numValue) ? 0 : numValue;
    } else if (field === 'gradingSystem') {
        const system = value as 'numeric' | 'OABC';
        subjectToUpdate.gradingSystem = system;
        if (system === 'OABC') {
            subjectToUpdate.examFullMarks = 0;
            subjectToUpdate.activityFullMarks = 0;
        } else {
            // Restore default marks when switching back to numeric if they are 0
            if (subjectToUpdate.examFullMarks === 0 && subjectToUpdate.activityFullMarks === 0) {
                 subjectToUpdate.examFullMarks = hasActivity ? 60 : 100;
                 subjectToUpdate.activityFullMarks = hasActivity ? 40 : 0;
            }
        }
    }

    newSubjects[index] = subjectToUpdate;
    setSubjects(newSubjects);
  };

  const handleAddSubject = () => {
    // Add a new subject with default marks based on whether the grade has activities
    const newSubject: SubjectDefinition = { 
        name: '', 
        examFullMarks: hasActivity ? 60 : 100, 
        activityFullMarks: hasActivity ? 40 : 0,
        gradingSystem: 'numeric'
    };
    setSubjects(prev => [...prev, newSubject]);
  };

  const handleRemoveSubject = (index: number) => {
    setSubjects(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Filter out any empty subject names before saving
    const cleanedSubjects = subjects.filter(s => s.name.trim() !== '');
    onSave({ ...initialGradeDefinition, subjects: cleanedSubjects });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-slate-800">Edit Curriculum for {grade}</h2>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
          <div>
            <h3 className="font-bold text-slate-800 mb-2">Subject List & Mark Structure</h3>
            <p className="text-xs text-slate-700 mb-4">Define the official subjects and their mark breakdowns for this grade.</p>

            <div className="space-y-3">
              {subjects.map((subject, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                  <div className="flex-grow">
                      <label className="sr-only">Subject Name</label>
                      <input
                          type="text"
                          value={subject.name}
                          onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                          className="w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                          placeholder="Enter subject name"
                      />
                  </div>
                   <div className="flex-shrink-0 w-36">
                        <label className="sr-only">Grading System</label>
                        <select
                            value={subject.gradingSystem || 'numeric'}
                            onChange={(e) => handleSubjectChange(index, 'gradingSystem', e.target.value)}
                            className="w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                        >
                            <option value="numeric">Numeric Marks</option>
                            <option value="OABC">OABC Grading</option>
                        </select>
                    </div>
                  <div className="flex-shrink-0 w-24">
                       <label className="sr-only">Exam Marks</label>
                       <input
                          type="number"
                          value={subject.examFullMarks}
                          onChange={(e) => handleSubjectChange(index, 'examFullMarks', e.target.value)}
                          className="w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm disabled:bg-slate-200"
                          placeholder="Exam"
                          disabled={subject.gradingSystem === 'OABC'}
                      />
                  </div>
                  {hasActivity && (
                     <div className="flex-shrink-0 w-24">
                        <label className="sr-only">Activity Marks</label>
                        <input
                            type="number"
                            value={subject.activityFullMarks}
                            onChange={(e) => handleSubjectChange(index, 'activityFullMarks', e.target.value)}
                            className="w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm disabled:bg-slate-200"
                            placeholder="Activity"
                            disabled={subject.gradingSystem === 'OABC'}
                        />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(index)}
                    className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                    title="Remove subject"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddSubject}
              className="mt-3 flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-200"
            >
              <PlusIcon className="w-4 h-4" />
              Add Subject
            </button>
          </div>
        </div>
        <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-xl border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSubjectsModal;

import React, { useState, useEffect, useMemo } from 'react';
import { Student, Grade } from '../types';

interface TransferStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (studentId: number, newGrade: Grade, newRollNo: number) => void;
  student: Student;
  allStudents: Student[];
  allGrades: Grade[];
}

const TransferStudentModal: React.FC<TransferStudentModalProps> = ({ isOpen, onClose, onConfirm, student, allStudents, allGrades }) => {
  const [targetGrade, setTargetGrade] = useState<Grade | ''>('');
  const [newRollNo, setNewRollNo] = useState<string>('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTargetGrade('');
      setNewRollNo('');
      setError('');
    }
  }, [isOpen]);

  const rollNoError = useMemo(() => {
    if (!targetGrade || !newRollNo) return '';
    const rollNo = parseInt(newRollNo, 10);
    if (isNaN(rollNo) || rollNo <= 0) return 'Please enter a valid roll number.';
    
    const isTaken = allStudents.some(
      s => s.grade === targetGrade && s.rollNo === rollNo
    );
    if (isTaken) {
      return `Roll number ${rollNo} is already taken in ${targetGrade}.`;
    }
    return '';
  }, [targetGrade, newRollNo, allStudents]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rollNoError || !targetGrade || !newRollNo) {
        setError('Please fix the errors before proceeding.');
        return;
    }
    onConfirm(student.id, targetGrade as Grade, parseInt(newRollNo, 10));
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h3 className="text-xl leading-6 font-bold text-slate-900">Transfer Student</h3>
            <div className="mt-4 p-3 bg-slate-50 rounded-lg border">
                <p>Transferring: <span className="font-bold">{student.name}</span></p>
                <p>From: <span className="font-bold">{student.grade} (Roll No: {student.rollNo})</span></p>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="targetGrade" className="block text-sm font-bold text-slate-800">Transfer to Class</label>
                <select
                  id="targetGrade"
                  value={targetGrade}
                  onChange={e => setTargetGrade(e.target.value as Grade)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                  required
                  autoFocus
                >
                  <option value="" disabled>-- Select new class --</option>
                  {allGrades.filter(g => g !== student.grade).map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="newRollNo" className="block text-sm font-bold text-slate-800">New Roll Number</label>
                <input
                  type="number"
                  id="newRollNo"
                  value={newRollNo}
                  onChange={e => setNewRollNo(e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                  required
                  min="1"
                />
                {rollNoError && <p className="text-sm text-red-600 mt-1">{rollNoError}</p>}
              </div>
               {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}
            </div>
          </div>
          <div className="bg-slate-50 px-6 py-4 flex flex-row-reverse gap-3 rounded-b-xl">
            <button
              type="submit"
              disabled={!!rollNoError || !targetGrade || !newRollNo}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-sky-600 text-base font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 sm:w-auto sm:text-sm disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              Confirm Transfer
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 sm:mt-0 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferStudentModal;

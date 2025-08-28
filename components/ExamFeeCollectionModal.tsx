import React, { useState, useEffect } from 'react';
import { Student, Grade, FeePayments, FeeStructure } from '../types';
import { getFeeDetails } from '../utils';
import { TERMINAL_EXAMS } from '../constants';
import { SpinnerIcon, CheckIcon, XIcon, CurrencyDollarIcon } from './Icons';

interface ExamFeeCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (updates: Array<{ studentId: string; payments: FeePayments }>) => Promise<void>;
    students: Student[];
    grade: Grade;
    feeStructure: FeeStructure;
}

const ExamFeeCollectionModal: React.FC<ExamFeeCollectionModalProps> = ({ isOpen, onClose, onSave, students, grade, feeStructure }) => {
    const [paymentData, setPaymentData] = useState<Record<string, FeePayments>>({});
    const [isSaving, setIsSaving] = useState(false);
    // FIX: Pass the feeStructure object to the getFeeDetails utility function as the second argument.
    const feeDetails = getFeeDetails(grade, feeStructure);

    useEffect(() => {
        if (isOpen) {
            const initialData: Record<string, FeePayments> = {};
            students.forEach(student => {
                initialData[student.id] = student.feePayments || {
                    admissionFeePaid: false,
                    tuitionFeesPaid: {},
                    examFeesPaid: { terminal1: false, terminal2: false, terminal3: false },
                };
            });
            setPaymentData(initialData);
        }
    }, [isOpen, students]);

    const handleCheckboxChange = (studentId: string, examId: keyof FeePayments['examFeesPaid']) => {
        setPaymentData(prev => {
            const studentPayments = prev[studentId];
            return {
                ...prev,
                [studentId]: {
                    ...studentPayments,
                    examFeesPaid: {
                        ...studentPayments.examFeesPaid,
                        [examId]: !studentPayments.examFeesPaid[examId],
                    },
                },
            };
        });
    };

    const handleSaveClick = async () => {
        setIsSaving(true);
        const updates: Array<{ studentId: string; payments: FeePayments }> = [];
        students.forEach(student => {
            const originalPayments = student.feePayments;
            const updatedPayments = paymentData[student.id];

            // Simple object comparison to see if anything changed
            if (JSON.stringify(originalPayments?.examFeesPaid) !== JSON.stringify(updatedPayments.examFeesPaid)) {
                updates.push({ studentId: student.id, payments: updatedPayments });
            }
        });
        
        if (updates.length > 0) {
            await onSave(updates);
        }
        
        setIsSaving(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col h-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Collect Examination Fees for {grade}</h2>
                        <div className="flex items-center gap-2 text-md text-slate-700 mt-1">
                            <CurrencyDollarIcon className="w-5 h-5 text-emerald-600"/>
                            <span>Exam Fee per Term:</span>
                            <span className="font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(feeDetails.examFee)}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-600 hover:bg-slate-100 rounded-full"><XIcon className="w-5 h-5"/></button>
                </div>

                <div className="flex-grow overflow-auto p-4">
                    <table className="min-w-full divide-y divide-slate-200 border">
                        <thead className="bg-slate-50 sticky top-0">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-bold text-slate-800 uppercase">Roll No</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-slate-800 uppercase">Student Name</th>
                                {TERMINAL_EXAMS.map(exam => (
                                    <th key={exam.id} className="px-4 py-2 text-center text-xs font-bold text-slate-800 uppercase">{exam.name}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {students.map(student => (
                                <tr key={student.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-2 font-semibold">{student.rollNo}</td>
                                    <td className="px-4 py-2">{student.name}</td>
                                    {TERMINAL_EXAMS.map(exam => (
                                        <td key={exam.id} className="px-4 py-2 text-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox h-5 w-5 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                                                checked={paymentData[student.id]?.examFeesPaid[exam.id as keyof FeePayments['examFeesPaid']] || false}
                                                onChange={() => handleCheckboxChange(student.id, exam.id as keyof FeePayments['examFeesPaid'])}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-xl border-t">
                    <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSaving}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSaveClick}
                        className="btn btn-primary"
                        disabled={isSaving}
                    >
                        {isSaving ? <SpinnerIcon className="w-5 h-5"/> : <CheckIcon className="w-5 h-5"/>}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExamFeeCollectionModal;

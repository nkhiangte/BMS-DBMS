import React, { useState, useEffect, useMemo, FormEvent } from 'react';
import { ActivityLog } from '../types';
import { CheckIcon, ExclamationTriangleIcon, XIcon } from './Icons';

interface ActivityLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (log: ActivityLog) => void;
    studentName: string;
    examName: string;
    subjectName: string;
    initialLog?: ActivityLog;
}

const activityComponents = [
    { key: 'classTest', label: 'Class Test', max: 10 },
    { key: 'homeAssignment', label: 'Home Assignment', max: 5 },
    { key: 'quiz', label: 'Quiz', max: 5 },
    { key: 'projectWork', label: 'Project Work', max: 20 },
];

const ActivityLogModal: React.FC<ActivityLogModalProps> = ({ isOpen, onClose, onSave, studentName, examName, subjectName, initialLog }) => {
    const [log, setLog] = useState<ActivityLog>({});

    useEffect(() => {
        if (isOpen) {
            setLog(initialLog || {});
        }
    }, [isOpen, initialLog]);

    const total = useMemo(() => {
        return activityComponents.reduce((acc, comp) => acc + (Number(log[comp.key as keyof ActivityLog]) || 0), 0);
    }, [log]);

    const isInvalid = total > 40;

    const handleChange = (field: keyof ActivityLog, value: string, max: number) => {
        const numValue = parseInt(value, 10);
        setLog(prev => ({
            ...prev,
            [field]: isNaN(numValue) ? undefined : Math.max(0, Math.min(numValue, max)),
        }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (isInvalid) return;
        onSave(log);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Log Activity Marks</h2>
                            <p className="text-sm text-slate-600">{subjectName} - {examName}</p>
                        </div>
                        <button type="button" onClick={onClose} className="p-2 text-slate-600 hover:bg-slate-100 rounded-full"><XIcon className="w-5 h-5"/></button>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="bg-slate-50 p-3 rounded-lg border">
                            <p className="text-sm font-semibold text-slate-700">Student: <span className="font-bold text-slate-900">{studentName}</span></p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {activityComponents.map(({ key, label, max }) => (
                                <div key={key}>
                                    <label className="block text-sm font-bold text-slate-800">{label} ({max})</label>
                                    <input type="number" value={log[key as keyof ActivityLog] ?? ''} onChange={e => handleChange(key as keyof ActivityLog, e.target.value, max)} className="mt-1 w-full border-slate-300 rounded-md" min="0" max={max}/>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-slate-800">Total:</span>
                                <span className={`text-2xl font-bold ${isInvalid ? 'text-red-600' : 'text-slate-900'}`}>{total}</span>
                                <span className="text-lg font-bold text-slate-600">/ 40</span>
                            </div>
                             {isInvalid && (
                                <div className="flex items-center gap-2 text-red-600 font-semibold">
                                    <ExclamationTriangleIcon className="w-5 h-5"/>
                                    <span>Total cannot exceed 40</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-xl border-t">
                        <button type="button" onClick={onClose} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isInvalid}>
                            <CheckIcon className="w-5 h-5"/>
                            Save Log
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ActivityLogModal;
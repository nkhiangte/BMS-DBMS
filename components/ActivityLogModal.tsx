import React, { useState, useEffect, useMemo, FormEvent } from 'react';
import { ActivityLog, Assessment, ActivityComponentLog } from '../types';
import { CheckIcon, XIcon, PlusIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from './Icons';

type ActivityKey = keyof ActivityLog;

const ACTIVITY_COMPONENTS: { key: ActivityKey, label: string, weightage: number }[] = [
    { key: 'classTest', label: 'Class Tests', weightage: 10 },
    { key: 'homework', label: 'Homework', weightage: 5 },
    { key: 'quiz', label: 'Quizzes', weightage: 5 },
    { key: 'project', label: 'Projects', weightage: 20 },
];

interface ActivityComponentEditorProps {
    title: string;
    componentLog: ActivityComponentLog;
    onChange: (updatedLog: ActivityComponentLog) => void;
}

const ActivityComponentEditor: React.FC<ActivityComponentEditorProps> = ({ title, componentLog, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { assessments, weightage, scaledMarks } = componentLog;

    const handleAssessmentChange = (index: number, field: keyof Assessment, value: string) => {
        const newAssessments = [...assessments];
        const numValue = value === '' ? null : parseInt(value, 10);
        newAssessments[index] = { ...newAssessments[index], [field]: isNaN(numValue!) ? null : numValue };
        
        updateParent(newAssessments);
    };

    const addAssessment = () => {
        const newAssessments = [...assessments, { marksObtained: null, maxMarks: null }];
        updateParent(newAssessments);
    };

    const removeAssessment = (index: number) => {
        const newAssessments = assessments.filter((_, i) => i !== index);
        updateParent(newAssessments);
    };
    
    const updateParent = (newAssessments: Assessment[]) => {
        const totalObtained = newAssessments.reduce((sum, a) => sum + (a.marksObtained || 0), 0);
        const totalMax = newAssessments.reduce((sum, a) => sum + (a.maxMarks || 0), 0);
        const newScaledMarks = totalMax > 0 ? (totalObtained / totalMax) * weightage : 0;

        onChange({
            ...componentLog,
            assessments: newAssessments,
            scaledMarks: newScaledMarks,
        });
    };
    
    const totalObtained = useMemo(() => assessments.reduce((sum, a) => sum + (a.marksObtained || 0), 0), [assessments]);
    const totalMax = useMemo(() => assessments.reduce((sum, a) => sum + (a.maxMarks || 0), 0), [assessments]);

    return (
        <div className="border rounded-lg">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100"
            >
                <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-800">{title}</h3>
                    <span className="text-xs font-semibold text-slate-600">(Weightage: {weightage})</span>
                </div>
                 <div className="flex items-center gap-3">
                    <span className="font-bold text-sky-700">Scaled: {scaledMarks.toFixed(1)} / {weightage}</span>
                    {isOpen ? <ChevronUpIcon className="w-5 h-5 text-slate-700" /> : <ChevronDownIcon className="w-5 h-5 text-slate-700" />}
                </div>
            </button>
            {isOpen && (
                <div className="p-4 space-y-3">
                    {assessments.map((assessment, index) => (
                        <div key={index} className="flex items-center gap-3 bg-white p-2 rounded border">
                            <span className="font-semibold text-slate-600 text-sm w-10">#{index + 1}</span>
                            <div className="flex-grow">
                                <label className="text-xs font-medium text-slate-600">Marks Obtained</label>
                                <input type="number" value={assessment.marksObtained ?? ''} onChange={e => handleAssessmentChange(index, 'marksObtained', e.target.value)} className="w-full border-slate-300 rounded-md p-1"/>
                            </div>
                             <div className="flex-grow">
                                <label className="text-xs font-medium text-slate-600">Max Marks</label>
                                <input type="number" value={assessment.maxMarks ?? ''} onChange={e => handleAssessmentChange(index, 'maxMarks', e.target.value)} className="w-full border-slate-300 rounded-md p-1"/>
                            </div>
                            <button type="button" onClick={() => removeAssessment(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    ))}
                     <button type="button" onClick={addAssessment} className="btn btn-secondary text-sm">
                        <PlusIcon className="w-4 h-4"/> Add Entry
                    </button>
                    <div className="text-right font-semibold text-slate-700 pr-12">
                        Total Raw Score: {totalObtained} / {totalMax}
                    </div>
                </div>
            )}
        </div>
    );
};


interface ActivityLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (log: ActivityLog) => void;
    studentName: string;
    examName: string;
    subjectName: string;
    initialLog?: ActivityLog;
}

const ActivityLogModal: React.FC<ActivityLogModalProps> = ({ isOpen, onClose, onSave, studentName, examName, subjectName, initialLog }) => {
    
    const createDefaultLog = (): ActivityLog => ({
        classTest: { assessments: [{ marksObtained: null, maxMarks: null }], weightage: 10, scaledMarks: 0 },
        homework: { assessments: [{ marksObtained: null, maxMarks: null }], weightage: 5, scaledMarks: 0 },
        quiz: { assessments: [{ marksObtained: null, maxMarks: null }], weightage: 5, scaledMarks: 0 },
        project: { assessments: [{ marksObtained: null, maxMarks: null }], weightage: 20, scaledMarks: 0 },
    });

    const [log, setLog] = useState<ActivityLog>(createDefaultLog());

    useEffect(() => {
        if (isOpen) {
            setLog(initialLog || createDefaultLog());
        }
    }, [isOpen, initialLog]);

    const handleComponentChange = (key: ActivityKey, updatedComponentLog: ActivityComponentLog) => {
        setLog(prev => ({...prev, [key]: updatedComponentLog}));
    };

    const grandTotal = useMemo(() => {
        return Object.values(log).reduce((sum, component) => sum + (component.scaledMarks || 0), 0);
    }, [log]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave(log);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col h-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="p-6 border-b flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Log Continuous Assessment Marks</h2>
                            <p className="text-sm text-slate-600">{subjectName} - {examName}</p>
                            <p className="text-sm font-semibold text-slate-700 mt-1">Student: <span className="font-bold text-slate-900">{studentName}</span></p>
                        </div>
                        <button type="button" onClick={onClose} className="p-2 text-slate-600 hover:bg-slate-100 rounded-full"><XIcon className="w-5 h-5"/></button>
                    </div>
                    
                    <div className="flex-grow p-6 space-y-3 overflow-y-auto">
                        {ACTIVITY_COMPONENTS.map(({key, label}) => (
                            <ActivityComponentEditor
                                key={key}
                                title={label}
                                componentLog={log[key]}
                                onChange={(updated) => handleComponentChange(key, updated)}
                            />
                        ))}
                    </div>

                    <div className="px-6 py-4 bg-slate-100 border-t flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-800">Grand Total Activity Marks:</h3>
                        <div className="text-right">
                            <span className="text-3xl font-bold text-slate-900">{grandTotal.toFixed(1)}</span>
                            <span className="text-xl font-bold text-slate-600"> / 40</span>
                        </div>
                    </div>
                    
                    <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-xl border-t">
                        <button type="button" onClick={onClose} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
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

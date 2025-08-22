
import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Student, Grade, StudentStatus, Gender, Category } from '../types';
import { createDefaultFeePayments } from '../utils';
import { ArrowUpOnSquareIcon, XIcon, CheckCircleIcon, XCircleIcon } from './Icons';
import { GENDER_LIST, CATEGORY_LIST } from '../constants';

interface ImportStudentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (students: Omit<Student, 'id'>[]) => void;
    grade: Grade;
    existingStudentsInGrade: Student[];
}

type ParsedStudent = Omit<Student, 'id'> & { errors: string[] };

const CSV_HEADERS = [
    'Roll No', 'Name', 'Contact', 'DOB (YYYY-MM-DD)', 'Gender', 'Address', 'Aadhaar', 'PEN', 'Category', 'Religion', 'Father Name', 'Father Occupation', 'Father Aadhaar', 'Mother Name', 'Mother Occupation', 'Mother Aadhaar'
];

const ImportStudentsModal: React.FC<ImportStudentsModalProps> = ({ isOpen, onClose, onImport, grade, existingStudentsInGrade }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [file, setFile] = useState<File | null>(null);
    const [parsedStudents, setParsedStudents] = useState<ParsedStudent[]>([]);
    const [parseError, setParseError] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);

    const existingRollNos = useMemo(() => new Set(existingStudentsInGrade.map(s => s.rollNo)), [existingStudentsInGrade]);

    const resetState = useCallback(() => {
        setFile(null);
        setParsedStudents([]);
        setParseError('');
        setIsProcessing(false);
    }, []);

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleDownloadTemplate = () => {
        const csvContent = CSV_HEADERS.join(',');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.href) {
            URL.revokeObjectURL(link.href);
        }
        link.href = URL.createObjectURL(blob);
        link.download = `student_import_template_${grade}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const parseCSV = useCallback((csvText: string): void => {
        const lines = csvText.trim().split('\n');
        const headerLine = lines.shift()?.trim().split(',') || [];
        const headers = headerLine.map(h => h.trim());

        const requiredHeaders = ['Roll No', 'Name'];
        for (const reqHeader of requiredHeaders) {
            if (!headers.includes(reqHeader)) {
                setParseError(`CSV is missing required header: "${reqHeader}". Please use the template.`);
                return;
            }
        }
        
        const importedRollNos = new Set<number>();
        const students: ParsedStudent[] = [];

        lines.forEach((line, index) => {
            if (!line.trim()) return;
            const values = line.split(',');
            const row: Record<string, string> = {};
            headers.forEach((header, i) => {
                row[header] = values[i]?.trim() || '';
            });

            const errors: string[] = [];

            const rollNo = parseInt(row['Roll No'], 10);
            if (isNaN(rollNo)) errors.push('Invalid Roll No.');
            if (existingRollNos.has(rollNo)) errors.push('Roll No already exists in this class.');
            if (importedRollNos.has(rollNo)) errors.push('Duplicate Roll No in this file.');
            if (!isNaN(rollNo)) importedRollNos.add(rollNo);
            
            const name = row['Name'];
            if (!name) errors.push('Name is required.');

            const gender = (row['Gender'] || '').charAt(0).toUpperCase() + (row['Gender'] || '').slice(1).toLowerCase();
            if (row['Gender'] && !GENDER_LIST.includes(gender as Gender)) {
                errors.push(`Invalid gender: "${row['Gender']}".`);
            }
            
            const category = (row['Category'] || '').charAt(0).toUpperCase() + (row['Category'] || '').slice(1).toLowerCase();
            if (row['Category'] && !CATEGORY_LIST.includes(category as Category)) {
                 errors.push(`Invalid category: "${row['Category']}".`);
            }

            const student: ParsedStudent = {
                rollNo: rollNo || 0,
                name: name || '',
                grade,
                contact: row['Contact'] || '',
                photographUrl: '',
                dateOfBirth: row['DOB (YYYY-MM-DD)'] || '',
                gender: gender as Gender || Gender.MALE,
                address: row['Address'] || '',
                aadhaarNumber: row['Aadhaar'] || '',
                pen: row['PEN'] || '',
                category: category as Category || Category.GENERAL,
                religion: row['Religion'] || '',
                fatherName: row['Father Name'] || '',
                fatherOccupation: row['Father Occupation'] || '',
                fatherAadhaar: row['Father Aadhaar'] || '',
                motherName: row['Mother Name'] || '',
                motherOccupation: row['Mother Occupation'] || '',
                motherAadhaar: row['Mother Aadhaar'] || '',
                academicPerformance: [],
                feePayments: createDefaultFeePayments(),
                status: StudentStatus.ACTIVE,
                errors
            };
            students.push(student);
        });

        setParsedStudents(students);
    }, [grade, existingRollNos]);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        resetState();
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setIsProcessing(true);
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const text = event.target?.result as string;
                    parseCSV(text);
                } catch (err) {
                    setParseError("Failed to read or parse the file.");
                } finally {
                    setIsProcessing(false);
                }
            };
            reader.onerror = () => {
                 setParseError("Error reading the file.");
                 setIsProcessing(false);
            }
            reader.readAsText(selectedFile);
        }
    };
    
    const handleImportClick = () => {
        const validStudents = parsedStudents.filter(s => s.errors.length === 0);
        if(validStudents.length > 0) {
            onImport(validStudents);
            navigate(
                location.pathname,
                { 
                    state: { message: `${validStudents.length} students imported successfully to ${grade}!` },
                    replace: true,
                }
            );
            handleClose();
        }
    };

    const totalErrors = useMemo(() => parsedStudents.reduce((acc, s) => acc + s.errors.length, 0), [parsedStudents]);
    const validStudentCount = useMemo(() => parsedStudents.filter(s => s.errors.length === 0).length, [parsedStudents]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" onClick={handleClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col h-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800">Import Students to {grade}</h2>
                    <button onClick={handleClose} className="p-2 text-slate-600 hover:bg-slate-100 rounded-full"><XIcon className="w-5 h-5"/></button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto flex-grow">
                    <div className="bg-sky-50 p-4 rounded-lg border border-sky-200">
                        <h3 className="font-bold text-sky-800">Instructions</h3>
                        <ol className="list-decimal list-inside text-sm text-sky-700 mt-2 space-y-1">
                            <li>Download the CSV template to ensure correct formatting.</li>
                            <li>Fill in the student details. <strong>Roll No</strong> and <strong>Name</strong> are required.</li>
                            <li>Save the file as a CSV (Comma-Separated Values).</li>
                            <li>Upload the file below. The system will validate it before importing.</li>
                        </ol>
                        <button onClick={handleDownloadTemplate} className="mt-3 text-sm font-semibold text-sky-700 hover:underline">Download Template</button>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-2">Upload CSV File</label>
                        <input type="file" accept=".csv" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"/>
                    </div>
                    
                    {isProcessing && <p className="text-center font-semibold text-slate-700">Processing file...</p>}
                    {parseError && <p className="text-center font-semibold text-red-600">{parseError}</p>}
                    
                    {parsedStudents.length > 0 && (
                        <div>
                            <div className="flex justify-between items-center bg-slate-100 p-3 rounded-t-lg">
                                <h3 className="font-bold text-slate-800">Validation Preview ({parsedStudents.length} rows found)</h3>
                                <div className="flex gap-4">
                                     <span className="font-semibold text-emerald-600 flex items-center gap-1.5"><CheckCircleIcon className="w-5 h-5"/> {validStudentCount} Valid</span>
                                     <span className="font-semibold text-red-600 flex items-center gap-1.5"><XCircleIcon className="w-5 h-5"/> {parsedStudents.length - validStudentCount} Invalid</span>
                                </div>
                            </div>
                            <div className="overflow-auto max-h-[30vh] border rounded-b-lg">
                                <table className="min-w-full divide-y divide-slate-200 text-sm">
                                    <thead className="bg-slate-50 sticky top-0">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-bold text-slate-800">Roll No</th>
                                            <th className="px-3 py-2 text-left font-bold text-slate-800">Name</th>
                                            <th className="px-3 py-2 text-left font-bold text-slate-800">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {parsedStudents.map((s, i) => (
                                            <tr key={i} className={s.errors.length > 0 ? 'bg-red-50' : 'bg-emerald-50'}>
                                                <td className="px-3 py-2">{s.rollNo}</td>
                                                <td className="px-3 py-2">{s.name}</td>
                                                <td className="px-3 py-2">
                                                    {s.errors.length > 0 ? (
                                                        <span className="font-semibold text-red-700">{s.errors.join(', ')}</span>
                                                    ) : (
                                                        <span className="font-semibold text-emerald-700">Ready to import</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>
                <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-xl border-t">
                    <button type="button" onClick={handleClose} className="btn btn-secondary">
                        Cancel
                    </button>
                    <button type="button" onClick={handleImportClick} className="btn btn-primary" disabled={totalErrors > 0 || parsedStudents.length === 0 || isProcessing}>
                        <ArrowUpOnSquareIcon className="w-5 h-5"/>
                        Import {validStudentCount > 0 ? `${validStudentCount}` : ''} Students
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportStudentsModal;

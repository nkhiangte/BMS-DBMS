
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Student, Grade, StudentStatus, Gender, Category, BloodGroup } from '../types';
import { createDefaultFeePayments } from '../utils';
import { ArrowUpOnSquareIcon, XIcon, CheckCircleIcon, XCircleIcon, SpinnerIcon } from './Icons';
import { GENDER_LIST, CATEGORY_LIST, BLOOD_GROUP_LIST } from '../constants';

interface ImportStudentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (students: Omit<Student, 'id'>[], grade: Grade) => void;
    grade: Grade | null;
    allStudents: Student[];
    allGrades: Grade[];
    isImporting: boolean;
}

type ParsedStudent = Omit<Student, 'id'> & { errors: string[] };

const CSV_HEADERS = [
    'Roll No', 'Name', "Date of birth", 'Gender', 'Aadhaar No', "Father's name", "Mother's name", 
    "Father's Occupation", "Mother's Occupation", "Father's Aadhaar", "Mother's Aadhaar", 
    "Guardian's name", 'Address', 'Contact No', 'PEN', 'Category', 'Religion', 
    'CWSN (Yes/No)', 'Blood Group', 'Last School Attended', 'Health Issues', 'Achievements'
];

const ImportStudentsModal: React.FC<ImportStudentsModalProps> = ({ isOpen, onClose, onImport, grade, allStudents, allGrades, isImporting }) => {
    const [file, setFile] = useState<File | null>(null);
    const [parsedStudents, setParsedStudents] = useState<ParsedStudent[]>([]);
    const [parseError, setParseError] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedGrade, setSelectedGrade] = useState<Grade | ''>('');

    const targetGrade = useMemo(() => grade || selectedGrade, [grade, selectedGrade]);

    const resetState = useCallback(() => {
        setFile(null);
        setParsedStudents([]);
        setParseError('');
        setIsProcessing(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setSelectedGrade(grade || '');
        } else {
            resetState();
        }
    }, [isOpen, grade, resetState]);

    const existingStudentsInGrade = useMemo(() => {
        if (!targetGrade) return [];
        return allStudents.filter(s => s.grade === targetGrade);
    }, [allStudents, targetGrade]);

    const existingRollNos = useMemo(() => new Set(existingStudentsInGrade.map(s => s.rollNo)), [existingStudentsInGrade]);

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleDownloadTemplate = () => {
        if (!targetGrade) return;
        const csvContent = CSV_HEADERS.join(',');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.href) {
            URL.revokeObjectURL(link.href);
        }
        link.href = URL.createObjectURL(blob);
        link.download = `student_import_template_${targetGrade}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const parseCsvLine = (line: string): string[] => {
        const result: string[] = [];
        let currentField = '';
        let inQuotedField = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                if (inQuotedField && line[i + 1] === '"') {
                    // Handle escaped quote "" by adding a single quote to the field
                    currentField += '"';
                    i++; // Skip the next quote character
                } else {
                    inQuotedField = !inQuotedField;
                }
            } else if (char === ',' && !inQuotedField) {
                result.push(currentField.trim());
                currentField = '';
            } else {
                currentField += char;
            }
        }
        result.push(currentField.trim()); // Add the last field
        return result;
    };


    const parseCSV = useCallback((csvText: string): void => {
        if (!targetGrade) {
            setParseError('Cannot parse file: No class selected.');
            return;
        }

        const lines = csvText.trim().replace(/\r\n/g, '\n').split('\n');
        const headerLine = lines.shift()?.trim() || '';
        const headers = parseCsvLine(headerLine);

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
            
            const values = parseCsvLine(line);

            if (values.length > headers.length) {
                console.warn(`Skipping malformed CSV line #${index + 2}: more columns than headers. Expected ${headers.length}, got ${values.length}. Line: "${line}"`);
                return;
            }

            const row: Record<string, string> = {};
            headers.forEach((header, i) => {
                row[header] = values[i] || '';
            });

            const errors: string[] = [];
            const rollNo = parseInt(row['Roll No'], 10);
            if (isNaN(rollNo)) errors.push('Invalid Roll No.');
            if (existingRollNos.has(rollNo)) errors.push('Roll No already exists in this class.');
            if (importedRollNos.has(rollNo)) errors.push('Duplicate Roll No in this file.');
            if (!isNaN(rollNo)) importedRollNos.add(rollNo);
            
            const name = row['Name'];
            if (!name) errors.push('Name is required.');

            const genderInput = row['Gender'];
            let parsedGender: Gender | undefined;
            if (genderInput) {
                const formattedGender = genderInput.charAt(0).toUpperCase() + genderInput.slice(1).toLowerCase();
                if (GENDER_LIST.includes(formattedGender as Gender)) {
                    parsedGender = formattedGender as Gender;
                } else {
                    errors.push(`Invalid gender: "${genderInput}".`);
                }
            }
            
            const categoryInput = row['Category'];
            let parsedCategory: Category | undefined;
            if (categoryInput) {
                 if (CATEGORY_LIST.includes(categoryInput as Category)) {
                    parsedCategory = categoryInput as Category;
                } else {
                    errors.push(`Invalid category: "${categoryInput}".`);
                }
            }
            
            const cwsnInput = row['CWSN (Yes/No)']?.toLowerCase();
            let parsedCwsn: 'Yes' | 'No' = 'No';
            if (cwsnInput) {
                if (cwsnInput === 'yes') {
                    parsedCwsn = 'Yes';
                } else if (cwsnInput !== 'no' && cwsnInput !== '') {
                    errors.push(`Invalid CWSN value: "${row['CWSN (Yes/No)']}". Use Yes or No.`);
                }
            }

            const bloodGroupInput = row['Blood Group']?.toUpperCase();
            let parsedBloodGroup: BloodGroup | undefined;
            if (bloodGroupInput) {
                if (BLOOD_GROUP_LIST.includes(bloodGroupInput as BloodGroup)) {
                    parsedBloodGroup = bloodGroupInput as BloodGroup;
                } else {
                    errors.push(`Invalid Blood Group: "${row['Blood Group']}".`);
                }
            }

            const student: ParsedStudent = {
                rollNo: rollNo || 0,
                name: name || '',
                grade: targetGrade,
                contact: row['Contact No'] || '',
                photographUrl: '',
                dateOfBirth: row['Date of birth'] || '',
                gender: parsedGender || Gender.MALE,
                address: row['Address'] || '',
                aadhaarNumber: row['Aadhaar No'] || '',
                pen: row['PEN'] || '',
                category: parsedCategory || Category.GENERAL,
                religion: row['Religion'] || '',
                fatherName: row["Father's name"] || '',
                fatherOccupation: row["Father's Occupation"] || '',
                fatherAadhaar: row["Father's Aadhaar"] || '',
                motherName: row["Mother's name"] || '',
                motherOccupation: row["Mother's Occupation"] || '',
                motherAadhaar: row["Mother's Aadhaar"] || '',
                guardianName: row["Guardian's name"] || '',
                lastSchoolAttended: row['Last School Attended'] || '',
                healthConditions: row['Health Issues'] || '',
                achievements: row['Achievements'] || '',
                bloodGroup: parsedBloodGroup,
                cwsn: parsedCwsn,
                academicPerformance: [],
                feePayments: createDefaultFeePayments(),
                status: StudentStatus.ACTIVE,
                errors
            };
            students.push(student);
        });

        setParsedStudents(students);
    }, [targetGrade, existingRollNos]);
    
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
        if (validStudents.length > 0 && targetGrade) {
            // Strip the 'errors' property before passing to onImport
            const studentsToImport = validStudents.map(({ errors, ...studentData }) => studentData);
            onImport(studentsToImport, targetGrade as Grade);
        }
    };

    const validStudentCount = useMemo(() => parsedStudents.filter(s => s.errors.length === 0).length, [parsedStudents]);
    const invalidStudents = useMemo(() => parsedStudents.filter(s => s.errors.length > 0), [parsedStudents]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" onClick={handleClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col h-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800">Import Students {targetGrade ? `to ${targetGrade}` : ''}</h2>
                    <button onClick={handleClose} className="p-2 text-slate-600 hover:bg-slate-100 rounded-full"><XIcon className="w-5 h-5"/></button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto flex-grow">
                    {!grade && (
                        <div className="p-4 rounded-lg bg-slate-50 border">
                            <label htmlFor="grade-selector" className="block text-sm font-bold text-slate-800">1. Select Target Class</label>
                            <p className="text-xs text-slate-600 mb-2">Choose the class you want to import students into.</p>
                            <select
                                id="grade-selector"
                                value={selectedGrade}
                                onChange={e => {
                                    setSelectedGrade(e.target.value as Grade);
                                    resetState();
                                }}
                                className="w-full mt-1 block border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                            >
                                <option value="" disabled>-- Select a Class --</option>
                                {allGrades.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                    )}
                    
                    <div className={!targetGrade ? 'opacity-50 pointer-events-none' : ''}>
                        <div className="bg-sky-50 p-4 rounded-lg border border-sky-200">
                            <h3 className="font-bold text-sky-800">2. Download & Prepare File</h3>
                            <ol className="list-decimal list-inside text-sm text-sky-700 mt-2 space-y-1">
                                <li>Download the CSV template to ensure correct formatting.</li>
                                <li>Fill in the student details. <strong>Roll No</strong> and <strong>Name</strong> are required.</li>
                                <li>Save the file as a CSV (Comma-Separated Values).</li>
                                <li>Upload the file below. The system will validate it before importing.</li>
                            </ol>
                            <button onClick={handleDownloadTemplate} className="mt-3 text-sm font-semibold text-sky-700 hover:underline">Download Template for {targetGrade}</button>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-2">3. Upload CSV File</label>
                            <input type="file" accept=".csv" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"/>
                        </div>
                    </div>
                    
                    {isProcessing && <p className="text-center font-semibold text-slate-700">Processing file...</p>}
                    {parseError && <p className="text-center font-semibold text-red-600">{parseError}</p>}
                    
                    {parsedStudents.length > 0 && (
                        <div>
                            <div className="flex justify-between items-center bg-slate-100 p-3 rounded-t-lg">
                                <h3 className="font-bold text-slate-800">Validation Results ({parsedStudents.length} rows found)</h3>
                                <div className="flex gap-4">
                                     <span className="font-semibold text-emerald-600 flex items-center gap-1.5"><CheckCircleIcon className="w-5 h-5"/> {validStudentCount} Valid</span>
                                     <span className="font-semibold text-red-600 flex items-center gap-1.5"><XCircleIcon className="w-5 h-5"/> {invalidStudents.length} Invalid</span>
                                </div>
                            </div>
                            
                            {invalidStudents.length > 0 ? (
                                <>
                                    <p className="text-sm p-3 bg-red-50 text-red-800 border-x border-b rounded-b-lg">Please fix the following errors in your CSV file and re-upload.</p>
                                    <div className="overflow-auto max-h-[30vh] border rounded-lg mt-2">
                                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                                            <thead className="bg-slate-50 sticky top-0">
                                                <tr>
                                                    <th className="px-3 py-2 text-left font-bold text-slate-800">Roll No</th>
                                                    <th className="px-3 py-2 text-left font-bold text-slate-800">Name</th>
                                                    <th className="px-3 py-2 text-left font-bold text-slate-800">Errors</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-slate-200">
                                                {invalidStudents.map((s, i) => (
                                                    <tr key={i} className="bg-red-50">
                                                        <td className="px-3 py-2">{s.rollNo}</td>
                                                        <td className="px-3 py-2">{s.name}</td>
                                                        <td className="px-3 py-2">
                                                            <span className="font-semibold text-red-700">{s.errors.join(', ')}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            ) : (
                                <div className="p-6 text-center bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-b-lg">
                                    <CheckCircleIcon className="w-10 h-10 mx-auto mb-2"/>
                                    <p className="font-semibold">Validation successful!</p>
                                    <p>{validStudentCount} student records are valid and ready for import.</p>
                                </div>
                            )}
                        </div>
                    )}

                </div>
                <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-xl border-t">
                    <button type="button" onClick={handleClose} className="btn btn-secondary" disabled={isImporting}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleImportClick}
                        className="btn btn-primary"
                        disabled={validStudentCount === 0 || isProcessing || isImporting}
                    >
                        {isImporting ? (
                            <>
                                <SpinnerIcon className="w-5 h-5" />
                                Importing...
                            </>
                        ) : (
                            <>
                                <ArrowUpOnSquareIcon className="w-5 h-5"/>
                                Import {validStudentCount > 0 ? `${validStudentCount}` : ''} Students
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportStudentsModal;

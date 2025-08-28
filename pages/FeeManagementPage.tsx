
import React, { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BackIcon, HomeIcon, SearchIcon, CurrencyDollarIcon, UserIcon, CheckIcon, CheckCircleIcon, XCircleIcon } from '../components/Icons';
import { Student, Grade, StudentStatus, FeePayments, User, FeeStructure, FeeSet } from '../types';
import { calculateDues, formatStudentId, getFeeDetails } from '../utils';
import { TERMINAL_EXAMS, academicMonths, FEE_SET_GRADES } from '../constants';

interface FeeManagementPageProps {
  students: Student[];
  academicYear: string;
  onUpdateFeePayments: (studentId: string, payments: FeePayments) => void;
  user: User;
  feeStructure: FeeStructure;
  onUpdateFeeStructure: (newStructure: FeeStructure) => void;
}

const ReadonlyField: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => (
    <div>
        <label className="block text-sm font-bold text-slate-800">{label}</label>
        <div className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-md shadow-sm sm:text-sm text-slate-800 font-semibold min-h-[42px] flex items-center">
            {value || 'N/A'}
        </div>
    </div>
);

const FeeDetailItem: React.FC<{ label: string; amount: number }> = ({ label, amount }) => (
    <div className="flex justify-between items-center bg-slate-100 p-3 rounded-lg">
        <span className="font-bold text-slate-800">{label}</span>
        <span className="font-bold text-lg text-emerald-700">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount)}
        </span>
    </div>
);

const FeeManagementPage: React.FC<FeeManagementPageProps> = ({ students, academicYear, onUpdateFeePayments, user, feeStructure, onUpdateFeeStructure }) => {
  const navigate = useNavigate();
  const [studentIdInput, setStudentIdInput] = useState('');
  const [foundStudent, setFoundStudent] = useState<Student | null>(null);
  const [searchError, setSearchError] = useState('');
  const [paymentData, setPaymentData] = useState<FeePayments | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isEditingStructure, setIsEditingStructure] = useState(false);
  const [editableStructure, setEditableStructure] = useState<FeeStructure>(feeStructure);

  useEffect(() => {
    setEditableStructure(feeStructure);
  }, [feeStructure]);

  const handleStructureChange = (setKey: 'set1' | 'set2' | 'set3', feeKey: keyof FeeSet, value: string) => {
    const numericValue = parseInt(value, 10) || 0;
    setEditableStructure(prev => ({
        ...prev,
        [setKey]: {
            ...prev[setKey],
            [feeKey]: numericValue,
        }
    }));
  };

  const handleSaveStructure = () => {
    onUpdateFeeStructure(editableStructure);
    setIsEditingStructure(false);
  };

  const handleCancelEditStructure = () => {
    setEditableStructure(feeStructure);
    setIsEditingStructure(false);
  };

  const getDefaultPayments = (): FeePayments => ({
    admissionFeePaid: false,
    tuitionFeesPaid: academicMonths.reduce((acc, month) => ({ ...acc, [month]: false }), {}),
    examFeesPaid: { terminal1: false, terminal2: false, terminal3: false },
  });

  const handleStudentSearch = () => {
    setFoundStudent(null);
    setSearchError('');
    setPaymentData(null);
    setIsSaved(false);

    if (!studentIdInput) {
        setSearchError('Please enter a Student ID.');
        return;
    }

    const activeStudents = students.filter(s => s.status === StudentStatus.ACTIVE);
    const student = activeStudents.find(s => formatStudentId(s, academicYear).toLowerCase() === studentIdInput.toLowerCase());

    if (student) {
        setFoundStudent(student);
        setPaymentData(student.feePayments || getDefaultPayments());
    } else {
        setSearchError('Active student with this ID not found. Please check and try again.');
    }
  };

  const handlePaymentChange = (type: 'admission' | 'tuition' | 'exam', key: string, value: boolean) => {
    if (!paymentData) return;
    setIsSaved(false);
    
    setPaymentData(prev => {
        const newData = JSON.parse(JSON.stringify(prev!)); // Deep copy
        if (type === 'admission') {
            newData.admissionFeePaid = value;
        } else if (type === 'tuition') {
            newData.tuitionFeesPaid[key] = value;
        } else if (type === 'exam') {
            newData.examFeesPaid[key] = value;
        }
        return newData;
    });
  };

  const handleToggleAllTuition = () => {
    if(!paymentData) return;
    const allPaid = academicMonths.every(m => paymentData.tuitionFeesPaid[m]);
    const newTuitionStatus: Record<string, boolean> = {};
    academicMonths.forEach(m => newTuitionStatus[m] = !allPaid);

    setPaymentData(prev => ({ ...prev!, tuitionFeesPaid: newTuitionStatus }));
    setIsSaved(false);
  }

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (foundStudent && paymentData) {
        onUpdateFeePayments(foundStudent.id, paymentData);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    }
  };

  const feeDetails = foundStudent ? getFeeDetails(foundStudent.grade, feeStructure) : null;
  const allTuitionPaid = paymentData ? academicMonths.every(m => paymentData.tuitionFeesPaid[m]) : false;

  const tempStudentForDues: Student | null = foundStudent && paymentData ? { ...foundStudent, feePayments: paymentData } : null;
  const dues = tempStudentForDues ? calculateDues(tempStudentForDues) : [];

  const isReadOnly = user.role !== 'admin';

  return (
    <div className="space-y-8">
      {user.role === 'admin' && (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-800">Fee Structure Management</h2>
                {!isEditingStructure ? (
                    <button onClick={() => setIsEditingStructure(true)} className="btn btn-secondary">Edit Structure</button>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={handleCancelEditStructure} className="btn btn-secondary">Cancel</button>
                        <button onClick={handleSaveStructure} className="btn btn-primary">Save Structure</button>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.keys(feeStructure).map(setKey => (
                    <div key={setKey} className="bg-slate-50 p-4 rounded-lg border">
                        <h3 className="font-bold text-lg text-slate-800 capitalize">{setKey.replace('set', 'Set ')}</h3>
                        <p className="text-xs text-slate-600 mb-4 h-8">
                            Applies to: {FEE_SET_GRADES[setKey as keyof typeof FEE_SET_GRADES].join(', ')}
                        </p>
                        <div className="space-y-3">
                            {Object.keys(feeStructure[setKey as keyof FeeStructure]).map(feeKey => (
                                <div key={feeKey}>
                                    <label className="text-sm font-medium text-slate-700 capitalize">{feeKey.replace(/([A-Z])/g, ' $1')}</label>
                                    {isEditingStructure ? (
                                        <input
                                            type="number"
                                            value={editableStructure[setKey as keyof FeeStructure][feeKey as keyof FeeSet]}
                                            onChange={e => handleStructureChange(setKey as keyof FeeStructure, feeKey as keyof FeeSet, e.target.value)}
                                            className="mt-1 block w-full border-slate-300 rounded-md shadow-sm"
                                        />
                                    ) : (
                                        <p className="font-semibold text-slate-800 text-lg">
                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(feeStructure[setKey as keyof FeeStructure][feeKey as keyof FeeSet])}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex justify-between items-center">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
            <BackIcon className="w-5 h-5" /> Back
            </button>
            <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors" title="Go to Home/Dashboard">
            <HomeIcon className="w-5 h-5" /> <span>Home</span>
            </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Student Fee Payment</h1>
        <p className="text-slate-700 mb-8">Enter a student's ID to view their applicable fee structure and update payment status.</p>

        <div className="mb-8 max-w-lg">
            <label htmlFor="student-id-input" className="block text-sm font-bold text-slate-800 mb-2">Enter Student ID</label>
            <div className="flex gap-2 items-start">
                <div className="flex-grow">
                    <input id="student-id-input" type="text" placeholder="e.g., BMS250501" value={studentIdInput} onChange={e => setStudentIdInput(e.target.value.toUpperCase())} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleStudentSearch(); }}} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition" />
                    {searchError && <p className="text-red-500 text-sm mt-1">{searchError}</p>}
                </div>
                <button type="button" onClick={handleStudentSearch} className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 h-[42px] flex items-center justify-center gap-2">
                    <SearchIcon className="w-5 h-5" /> Find
                </button>
            </div>
        </div>
        
        {foundStudent && feeDetails && paymentData && (
            <form onSubmit={handleSave} className="mt-8 space-y-6 animate-fade-in">
                <fieldset className="border p-4 rounded-lg bg-slate-50">
                    <legend className="text-lg font-bold text-slate-800 px-2 flex items-center gap-2"><UserIcon className="w-5 h-5" /> Student Details</legend>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <ReadonlyField label="Name" value={foundStudent.name} />
                        <ReadonlyField label="Grade" value={foundStudent.grade} />
                        <ReadonlyField label="Student ID" value={formatStudentId(foundStudent, academicYear)} />
                    </div>
                </fieldset>

                <fieldset className="border p-4 rounded-lg">
                    <legend className="text-lg font-bold text-slate-800 px-2 flex items-center gap-2"><CurrencyDollarIcon className="w-5 h-5" /> Fee Structure Details</legend>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <FeeDetailItem label="Admission Fee" amount={feeDetails.admissionFee} />
                        <FeeDetailItem label="Monthly Tuition Fee" amount={feeDetails.tuitionFee} />
                        <FeeDetailItem label="Annual Exam Fee (per term)" amount={feeDetails.examFee} />
                    </div>
                </fieldset>

                <fieldset className="border p-4 rounded-lg">
                    <legend className="text-lg font-bold text-slate-800 px-2 flex items-center gap-2">
                        Dues Summary
                    </legend>
                    <div className="mt-2">
                        {dues.length === 0 ? (
                            <div className="bg-emerald-50 text-emerald-800 p-4 rounded-lg flex items-center gap-3">
                                <CheckCircleIcon className="w-6 h-6" />
                                <span className="font-semibold text-lg">All dues are cleared.</span>
                            </div>
                        ) : (
                            <div className="bg-amber-50 text-amber-800 p-4 rounded-lg">
                                <div className="flex items-center gap-3 mb-2">
                                    <XCircleIcon className="w-6 h-6 text-amber-600" />
                                    <span className="font-semibold text-lg">Pending Dues Found</span>
                                </div>
                                <ul className="list-disc pl-10 space-y-1 text-md">
                                    {dues.map((due, index) => <li key={index} className="font-semibold">{due}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                </fieldset>

                <fieldset disabled={isReadOnly}>
                    <div className="border p-4 rounded-lg">
                        <legend className="text-lg font-bold text-slate-800 px-2">Payment Status</legend>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6 mt-4">
                            <div className="space-y-4">
                                <h4 className="font-bold text-slate-800 border-b pb-2">One-Time & Term Fees</h4>
                                <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-50 rounded-lg hover:bg-slate-100">
                                <input type="checkbox" checked={paymentData.admissionFeePaid} onChange={e => handlePaymentChange('admission', 'admissionFeePaid', e.target.checked)} className="form-checkbox h-5 w-5 text-sky-600 border-slate-300 rounded focus:ring-sky-500" disabled={isReadOnly} />
                                <span className="text-slate-800 font-semibold">Admission Fee Paid</span>
                                </label>
                                {TERMINAL_EXAMS.map((exam, i) => (
                                    <label key={exam.id} className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-50 rounded-lg hover:bg-slate-100">
                                        <input type="checkbox" checked={paymentData.examFeesPaid[`terminal${i + 1}` as keyof typeof paymentData.examFeesPaid]} onChange={e => handlePaymentChange('exam', `terminal${i + 1}`, e.target.checked)} className="form-checkbox h-5 w-5 text-sky-600 border-slate-300 rounded focus:ring-sky-500" disabled={isReadOnly} />
                                        <span className="text-slate-800 font-semibold">{exam.name} Fee Paid</span>
                                    </label>
                                ))}
                            </div>
                            <div>
                                <div className="flex justify-between items-center border-b pb-2 mb-4">
                                    <h4 className="font-bold text-slate-800">Monthly Tuition Fees</h4>
                                    {!isReadOnly && <button type="button" onClick={handleToggleAllTuition} className="text-xs font-semibold text-sky-600 hover:underline">{allTuitionPaid ? 'Unmark All' : 'Mark All'}</button>}
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {academicMonths.map(month => (
                                        <label key={month} className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-slate-100">
                                            <input type="checkbox" checked={!!paymentData.tuitionFeesPaid[month]} onChange={e => handlePaymentChange('tuition', month, e.target.checked)} className="form-checkbox h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500" disabled={isReadOnly} />
                                            <span className="text-slate-800">{month}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </fieldset>

                {!isReadOnly && (
                    <div className="mt-8 flex justify-end items-center gap-4">
                        {isSaved && (
                            <div className="flex items-center gap-2 text-emerald-600 font-semibold animate-fade-in">
                                <CheckIcon className="w-5 h-5" />
                                <span>Saved!</span>
                            </div>
                        )}
                        <button type="submit" className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition flex items-center gap-2">
                            <CheckIcon className="w-5 h-5"/>
                            Save Payment Status
                        </button>
                    </div>
                )}
            </form>
        )}
      </div>
    </div>
  );
};

export default FeeManagementPage;

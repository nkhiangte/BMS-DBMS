
import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BackIcon, HomeIcon, SearchIcon, CurrencyDollarIcon, UserIcon, CheckIcon, CheckCircleIcon, XCircleIcon } from '../components/Icons';
import { Student, Grade, StudentStatus, FeePayments } from '../types';
import { calculateDues, formatStudentId } from '../utils';
import { FEE_STRUCTURE, TERMINAL_EXAMS } from '../constants';

interface FeeManagementPageProps {
  students: Student[];
  academicYear: string;
  onUpdateFeePayments: (studentId: string, payments: FeePayments) => void;
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

const academicMonths = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];

const FeeManagementPage: React.FC<FeeManagementPageProps> = ({ students, academicYear, onUpdateFeePayments }) => {
  const navigate = useNavigate();
  const [studentIdInput, setStudentIdInput] = useState('');
  const [foundStudent, setFoundStudent] = useState<Student | null>(null);
  const [searchError, setSearchError] = useState('');
  const [paymentData, setPaymentData] = useState<FeePayments | null>(null);
  const [isSaved, setIsSaved] = useState(false);


  const getDefaultPayments = (): FeePayments => ({
    admissionFeePaid: false,
    tuitionFeesPaid: academicMonths.reduce((acc, month) => ({ ...acc, [month]: false }), {}),
    examFeesPaid: { terminal1: false, terminal2: false, terminal3: false },
  });

  const getFeeDetails = (grade: Grade) => {
    const set1Grades: Grade[] = [Grade.NURSERY, Grade.KINDERGARTEN, Grade.I, Grade.II];
    const set2Grades: Grade[] = [Grade.III, Grade.IV, Grade.V, Grade.VI];

    if (set1Grades.includes(grade)) return FEE_STRUCTURE.set1;
    if (set2Grades.includes(grade)) return FEE_STRUCTURE.set2;
    return FEE_STRUCTURE.set3;
  };

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

  const feeDetails = foundStudent ? getFeeDetails(foundStudent.grade) : null;
  const allTuitionPaid = paymentData ? academicMonths.every(m => paymentData.tuitionFeesPaid[m]) : false;

  const tempStudentForDues: Student | null = foundStudent && paymentData ? { ...foundStudent, feePayments: paymentData } : null;
  const dues = tempStudentForDues ? calculateDues(tempStudentForDues) : [];

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex justify-between items-center">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors"
            >
                <BackIcon className="w-5 h-5" />
                Back
            </button>
            <Link
                to="/"
                className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
                title="Go to Home/Dashboard"
            >
                <HomeIcon className="w-5 h-5" />
                <span>Home</span>
            </Link>
        </div>

        <div className="flex items-center gap-4 mb-6">
            <CurrencyDollarIcon className="w-12 h-12 text-emerald-600" />
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Fee Management</h1>
                <p className="text-slate-600 mt-1">Search for a student to view and update their fee payment status.</p>
            </div>
        </div>

        {/* Student search */}
        <div className="mb-8 max-w-lg">
            <label htmlFor="student-id-input" className="block text-sm font-bold text-slate-800 mb-2">Enter Student ID to find fee records</label>
            <div className="flex gap-2 items-start">
                <div className="flex-grow">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            id="student-id-input"
                            type="text"
                            placeholder="e.g., BMS250501"
                            value={studentIdInput}
                            onChange={e => setStudentIdInput(e.target.value.toUpperCase())}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleStudentSearch(); }}}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                        />
                    </div>
                    {searchError && <p className="text-red-500 text-sm mt-1">{searchError}</p>}
                </div>
                <button
                    type="button"
                    onClick={handleStudentSearch}
                    className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 h-[42px]"
                >
                    Find
                </button>
            </div>
        </div>

        {foundStudent && paymentData && feeDetails && (
            <form onSubmit={handleSave} className="animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Student details */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <UserIcon className="w-8 h-8 text-slate-600"/>
                            <h2 className="text-2xl font-bold text-slate-800">Student Details</h2>
                        </div>
                        <ReadonlyField label="Name" value={foundStudent.name} />
                        <ReadonlyField label="Grade" value={foundStudent.grade} />
                        <ReadonlyField label="Student ID" value={formatStudentId(foundStudent, academicYear)} />
                        
                        <div className="pt-4">
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Fee Structure for {foundStudent.grade}</h3>
                            <div className="space-y-2">
                                <FeeDetailItem label="Admission Fee" amount={feeDetails.admissionFee} />
                                <FeeDetailItem label="Monthly Tuition Fee" amount={feeDetails.tuitionFee} />
                                <FeeDetailItem label="Terminal Exam Fee" amount={feeDetails.examFee} />
                            </div>
                        </div>

                        <div className="pt-4">
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Current Dues</h3>
                            {dues.length === 0 ? (
                                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-lg flex items-center gap-3 border-l-4 border-emerald-500 shadow-sm">
                                    <CheckCircleIcon className="w-6 h-6" />
                                    <span className="font-semibold text-lg">All dues cleared.</span>
                                </div>
                            ) : (
                                <div className="bg-amber-50 text-amber-800 p-4 rounded-lg border-l-4 border-amber-500 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <XCircleIcon className="w-6 h-6 text-amber-600" />
                                        <span className="font-semibold text-lg">Pending Dues Found</span>
                                    </div>
                                    <ul className="list-disc pl-10 mt-2 text-md">
                                        {dues.map((due, index) => <li key={index}>{due}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment status */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">Update Payment Status</h2>
                            <div className="space-y-2">
                                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border has-[:checked]:bg-emerald-50 has-[:checked]:border-emerald-300">
                                    <span className="font-bold text-slate-800">Admission Fee Paid</span>
                                    <input type="checkbox" checked={paymentData.admissionFeePaid} onChange={(e) => handlePaymentChange('admission', 'admissionFeePaid', e.target.checked)} className="h-6 w-6 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
                                </label>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-slate-800">Tuition Fees Paid</h3>
                                <button type="button" onClick={handleToggleAllTuition} className="text-xs font-semibold text-sky-600 hover:underline">
                                    {allTuitionPaid ? 'Mark All Unpaid' : 'Mark All Paid'}
                                </button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {academicMonths.map(month => (
                                    <label key={month} className="flex items-center gap-2 p-2 bg-slate-50 rounded-md border has-[:checked]:bg-emerald-50 has-[:checked]:border-emerald-300">
                                        <input type="checkbox" checked={paymentData.tuitionFeesPaid[month] || false} onChange={(e) => handlePaymentChange('tuition', month, e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
                                        <span className="text-sm font-semibold text-slate-800">{month}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-slate-800 mb-2">Exam Fees Paid</h3>
                            <div className="grid grid-cols-1 gap-2">
                                {TERMINAL_EXAMS.map(exam => (
                                     <label key={exam.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border has-[:checked]:bg-emerald-50 has-[:checked]:border-emerald-300">
                                        <span className="font-semibold text-slate-800">{exam.name}</span>
                                        <input type="checkbox" checked={paymentData.examFeesPaid[exam.id as keyof typeof paymentData.examFeesPaid]} onChange={(e) => handlePaymentChange('exam', exam.id, e.target.checked)} className="h-6 w-6 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
                                    </label>
                                ))}
                            </div>
                        </div>
                        
                         <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 w-48"
                            >
                                {isSaved ? (
                                    <>
                                        <CheckIcon className="w-5 h-5" />
                                        Saved!
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        )}
    </div>
  );
};

export default FeeManagementPage;


import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Student, User, Grade, FeeStructure, ConductEntry, ConductEntryType } from '../types';
import { BackIcon, EditIcon, UserIcon, AcademicCapIcon, DocumentReportIcon, HomeIcon, CurrencyDollarIcon, CheckCircleIcon, XCircleIcon, MessageIcon, WhatsappIcon, PlusIcon, SpinnerIcon, CheckIcon, TrashIcon } from '../components/Icons';
import { formatStudentId, calculateDues, formatDateForDisplay, formatPhoneNumberForWhatsApp } from '../utils';
import { MERIT_CATEGORIES, DEMERIT_CATEGORIES } from '../constants';
import ConfirmationModal from '../components/ConfirmationModal';

interface StudentDetailPageProps {
  students: Student[];
  onEdit: (student: Student) => void;
  academicYear: string;
  user: User;
  assignedGrade: Grade | null;
  feeStructure: FeeStructure;
  conductLog: ConductEntry[];
  onAddConductEntry: (entry: Omit<ConductEntry, 'id'>) => Promise<void>;
  onDeleteConductEntry: (entryId: string) => Promise<void>;
}

const PhotoWithFallback: React.FC<{src?: string, alt: string}> = ({ src, alt }) => {
    const [hasError, setHasError] = useState(!src);

    useEffect(() => {
        setHasError(!src);
    }, [src]);

    const handleError = () => {
        setHasError(true);
    };

    return (
        <div className="relative w-full h-full bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
            {hasError ? (
                <div className="flex items-center justify-center text-slate-500 w-full h-full">
                    <UserIcon className="w-2/3 h-2/3" />
                </div>
            ) : (
                <img src={src} alt={alt} className="h-full w-full object-cover" onError={handleError} />
            )}
        </div>
    )
}

const DetailItem: React.FC<{label: string, value?: string | number}> = ({ label, value }) => {
    if (!value && value !== 0) return null;
    return (
         <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <dt className="text-sm font-medium text-slate-600">{label}</dt>
            <dd className="mt-1 text-md font-semibold text-slate-900">{value}</dd>
        </div>
    )
}

const DetailSection: React.FC<{title: string, children: React.ReactNode}> = ({ title, children}) => (
    <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 border-b-2 border-slate-200 pb-2 mb-4">{title}</h2>
        <div className="sm:col-span-2 lg:col-span-3">
            {children}
        </div>
    </div>
)


const StudentDetailPage: React.FC<StudentDetailPageProps> = ({ students, onEdit, academicYear, user, assignedGrade, feeStructure, conductLog, onAddConductEntry, onDeleteConductEntry }) => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  
  const student = students.find(s => s.id === studentId);

  const [isAddingConduct, setIsAddingConduct] = useState(false);
  const [newEntryType, setNewEntryType] = useState<ConductEntryType>(ConductEntryType.MERIT);
  const [newEntryCategory, setNewEntryCategory] = useState(MERIT_CATEGORIES[0]);
  const [newEntryDescription, setNewEntryDescription] = useState('');
  const [isSavingConduct, setIsSavingConduct] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<ConductEntry | null>(null);
  
  const canEdit = user.role === 'admin' || (student && student.grade === assignedGrade);
  
  const studentConductLog = useMemo(() => {
    if (!student) return [];
    return conductLog.filter(entry => entry.studentId === student.id);
  }, [conductLog, student]);

  const merits = useMemo(() => studentConductLog.filter(e => e.type === ConductEntryType.MERIT), [studentConductLog]);
  const demerits = useMemo(() => studentConductLog.filter(e => e.type === ConductEntryType.DEMERIT), [studentConductLog]);

  const handleAddEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !newEntryCategory || !newEntryDescription) {
        alert("Please select a category and add a description.");
        return;
    }
    setIsSavingConduct(true);
    await onAddConductEntry({
        studentId: student.id,
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        type: newEntryType,
        category: newEntryCategory,
        description: newEntryDescription,
        recordedBy: user.displayName || user.email || 'Unknown',
        recordedById: user.uid,
    });
    setIsSavingConduct(false);
    setIsAddingConduct(false);
    setNewEntryDescription('');
    setNewEntryCategory(newEntryType === ConductEntryType.MERIT ? MERIT_CATEGORIES[0] : DEMERIT_CATEGORIES[0]);
  };

  const handleConfirmDeleteEntry = () => {
      if (entryToDelete) {
          onDeleteConductEntry(entryToDelete.id);
      }
      setEntryToDelete(null);
  };


  if (!student) {
    return (
        <div className="text-center bg-white p-10 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-red-600">Student Not Found</h2>
            <p className="text-slate-700 mt-2">The requested student profile does not exist.</p>
            <button
                onClick={() => navigate('/')}
                className="mt-6 flex items-center mx-auto justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition"
            >
                <BackIcon className="w-5 h-5" />
                Return to Dashboard
            </button>
        </div>
    );
  }
  
  const formattedStudentId = formatStudentId(student, academicYear);
  const dues = calculateDues(student, feeStructure);

  return (
    <>
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
      <div className="flex flex-col md:flex-row gap-8 items-start pb-6 mb-6 border-b border-slate-200">
        <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full shadow-lg border-4 border-white flex-shrink-0 mx-auto md:mx-0">
            <PhotoWithFallback src={student.photographUrl} alt={`${student.name}'s photograph`} />
        </div>
        <div className="text-center md:text-left flex-grow">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">{student.name}</h1>
          <p className="text-slate-700 text-lg mt-1">{student.grade} - ID: <span className="font-semibold">{formattedStudentId}</span></p>
           <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
             {canEdit && (
                <button
                  onClick={() => onEdit(student)}
                  className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition hover:-translate-y-0.5"
                >
                  <EditIcon className="h-5 h-5" />
                  Edit Profile
                </button>
             )}
               <Link
                to={`/progress-report/${student.id}`}
                className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition hover:-translate-y-0.5"
              >
                <DocumentReportIcon className="h-5 h-5" />
                Report Card
              </Link>
              <Link
                to={`/student/${student.id}/academics`}
                className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition hover:-translate-y-0.5"
              >
                <AcademicCapIcon className="h-5 h-5" />
                Academics
              </Link>
           </div>
        </div>
      </div>
      
      <div>
            <DetailSection title="Personal Information">
                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                    <DetailItem label="Student ID" value={formattedStudentId} />
                    <DetailItem label="Permanent Education Number (PEN)" value={student.pen} />
                    <DetailItem label="Date of Birth" value={formatDateForDisplay(student.dateOfBirth)} />
                    <DetailItem label="Gender" value={student.gender} />
                    <DetailItem label="Aadhaar Number" value={student.aadhaarNumber} />
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <dt className="text-sm font-medium text-slate-600">Contact Number</dt>
                        <dd className="mt-1 text-md font-semibold text-slate-900 flex justify-between items-center">
                            <span>{student.contact || 'N/A'}</span>
                            {student.contact && (
                                <div className="flex items-center gap-2">
                                    <a href={`https://wa.me/${formatPhoneNumberForWhatsApp(student.contact)}`} target="_blank" rel="noopener noreferrer" className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-full transition-colors" title="Send WhatsApp Message">
                                        <WhatsappIcon className="w-5 h-5"/>
                                    </a>
                                    <a href={`sms:${student.contact}`} className="p-2 text-sky-600 hover:bg-sky-100 rounded-full transition-colors" title="Send SMS">
                                        <MessageIcon className="w-5 h-5"/>
                                    </a>
                                </div>
                            )}
                        </dd>
                    </div>
                    <DetailItem label="Blood Group" value={student.bloodGroup} />
                    <DetailItem label="CWSN" value={student.cwsn} />
                    <div className="sm:col-span-2 lg:col-span-3">
                        <DetailItem label="Address" value={student.address} />
                    </div>
                </dl>
            </DetailSection>

            <DetailSection title="Parent & Guardian Information">
                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                    <DetailItem label="Father's Name" value={student.fatherName} />
                    <DetailItem label="Father's Occupation" value={student.fatherOccupation} />
                    <DetailItem label="Father's Aadhaar" value={student.fatherAadhaar} />
                    <DetailItem label="Mother's Name" value={student.motherName} />
                    <DetailItem label="Mother's Occupation" value={student.motherOccupation} />
                    <DetailItem label="Mother's Aadhaar" value={student.motherAadhaar} />
                    <DetailItem label="Guardian's Name" value={student.guardianName} />
                    <DetailItem label="Relationship with Guardian" value={student.guardianRelationship} />
                </dl>
            </DetailSection>

            <DetailSection title="Fee & Payment Status">
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
                {user.role === 'admin' && (
                    <div className="mt-4">
                        <Link to="/fees" className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 text-white font-semibold rounded-lg shadow-md hover:bg-violet-700 transition hover:-translate-y-0.5">
                            <CurrencyDollarIcon className="w-5 h-5" />
                            Go to Fee Management
                        </Link>
                    </div>
                )}
            </DetailSection>
            
            <DetailSection title="Conduct Log">
                {canEdit && (
                    <div className="mb-6 p-4 bg-slate-50 border rounded-lg">
                        {!isAddingConduct ? (
                            <button onClick={() => setIsAddingConduct(true)} className="btn btn-secondary">
                                <PlusIcon className="w-5 h-5"/> Add New Log Entry
                            </button>
                        ) : (
                            <form onSubmit={handleAddEntrySubmit} className="space-y-4 animate-fade-in">
                                <h4 className="font-bold text-lg text-slate-800">New Conduct Entry</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-800">Type</label>
                                        <select value={newEntryType} onChange={e => {
                                            const type = e.target.value as ConductEntryType;
                                            setNewEntryType(type);
                                            setNewEntryCategory(type === ConductEntryType.MERIT ? MERIT_CATEGORIES[0] : DEMERIT_CATEGORIES[0]);
                                        }} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                                            <option value={ConductEntryType.MERIT}>Merit</option>
                                            <option value={ConductEntryType.DEMERIT}>Demerit</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-800">Category</label>
                                        <select value={newEntryCategory} onChange={e => setNewEntryCategory(e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                                            {(newEntryType === ConductEntryType.MERIT ? MERIT_CATEGORIES : DEMERIT_CATEGORIES).map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-800">Description</label>
                                    <textarea value={newEntryDescription} onChange={e => setNewEntryDescription(e.target.value)} rows={2} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required placeholder="Provide specific details..."/>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button type="button" onClick={() => setIsAddingConduct(false)} className="btn btn-secondary" disabled={isSavingConduct}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={isSavingConduct}>
                                        {isSavingConduct ? <SpinnerIcon className="w-5 h-5"/> : <CheckIcon className="w-5 h-5" />}
                                        {isSavingConduct ? 'Saving...' : 'Save Entry'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-bold text-lg text-emerald-600 mb-3">Merits ({merits.length})</h4>
                        {merits.length > 0 ? (
                            <ul className="space-y-3">
                                {merits.map(entry => (
                                    <li key={entry.id} className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 group relative">
                                        <p className="font-semibold text-emerald-800">{entry.category}</p>
                                        <p className="text-sm text-slate-700">{entry.description}</p>
                                        <p className="text-xs text-slate-500 mt-2">{formatDateForDisplay(entry.date)} - by {entry.recordedBy}</p>
                                        {canEdit && (
                                            <button onClick={() => setEntryToDelete(entry)} className="absolute top-2 right-2 p-1.5 text-red-500 hover:bg-red-100 rounded-full hidden group-hover:block">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-slate-600 italic">No merits recorded.</p>}
                    </div>
                    <div>
                        <h4 className="font-bold text-lg text-rose-600 mb-3">Demerits ({demerits.length})</h4>
                        {demerits.length > 0 ? (
                            <ul className="space-y-3">
                                {demerits.map(entry => (
                                    <li key={entry.id} className="bg-rose-50 p-3 rounded-lg border border-rose-200 group relative">
                                        <p className="font-semibold text-rose-800">{entry.category}</p>
                                        <p className="text-sm text-slate-700">{entry.description}</p>
                                        <p className="text-xs text-slate-500 mt-2">{formatDateForDisplay(entry.date)} - by {entry.recordedBy}</p>
                                        {canEdit && (
                                            <button onClick={() => setEntryToDelete(entry)} className="absolute top-2 right-2 p-1.5 text-red-500 hover:bg-red-100 rounded-full hidden group-hover:block">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-slate-600 italic">No demerits recorded.</p>}
                    </div>
                </div>
            </DetailSection>

            <DetailSection title="Academic & Health">
                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                    <DetailItem label="Last School Attended" value={student.lastSchoolAttended} />
                    <div className="sm:col-span-2 lg:col-span-3">
                        <DetailItem label="Achievements" value={student.achievements} />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3">
                        <DetailItem label="Health Conditions" value={student.healthConditions} />
                    </div>
                </dl>
            </DetailSection>
      </div>
    </div>
    <ConfirmationModal
        isOpen={!!entryToDelete}
        onClose={() => setEntryToDelete(null)}
        onConfirm={handleConfirmDeleteEntry}
        title="Confirm Deletion"
    >
        <p>Are you sure you want to delete this conduct log entry? This action cannot be undone.</p>
        <div className="mt-2 p-2 bg-slate-100 rounded-md text-sm">
            <p><span className="font-semibold">{entryToDelete?.category}:</span> {entryToDelete?.description}</p>
        </div>
    </ConfirmationModal>
    </>
  );
};

export default StudentDetailPage;

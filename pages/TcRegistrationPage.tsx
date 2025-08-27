

import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Student, TcRecord, Grade, User } from '../types';
import { BackIcon, HomeIcon, DocumentPlusIcon, CheckIcon } from '../components/Icons';
import { formatStudentId, calculateDues } from '../utils';
import { GoogleGenAI } from '@google/genai';
import ConfirmationModal from '../components/ConfirmationModal';


interface TcRegistrationPageProps {
  students: Student[];
  onSave: (tcRecord: Omit<TcRecord, 'id'>) => void;
  academicYear: string;
  user: User;
}

const ReadonlyField: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => (
    <div>
        <label className="block text-sm font-bold text-slate-800">{label}</label>
        <div className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-md shadow-sm sm:text-sm text-slate-800 min-h-[42px] flex items-center">
            {value || 'N/A'}
        </div>
    </div>
);

const FormField: React.FC<{
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    type?: 'text' | 'date' | 'select' | 'textarea';
    options?: { value: string; label: string }[];
    required?: boolean;
}> = ({ label, name, value, onChange, type = 'text', options, required = true }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-bold text-slate-800">{label}</label>
        {type === 'select' ? (
            <select id={name} name={name} value={value} onChange={onChange} required={required} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm h-[42px]">
                {options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
        ) : type === 'textarea' ? (
            <textarea id={name} name={name} value={value} onChange={onChange} required={required} rows={3} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
        ) : (
            <input type={type} id={name} name={name} value={value} onChange={onChange} required={required} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
        )}
    </div>
);

const TcRegistrationPage: React.FC<TcRegistrationPageProps> = ({ students, onSave, academicYear, user }) => {
  const navigate = useNavigate();
  
  const [studentIdInput, setStudentIdInput] = useState<string>('');
  const [student, setStudent] = useState<Student | null>(null);
  const [searchError, setSearchError] = useState<string>('');
  const [isFetchingDob, setIsFetchingDob] = useState<boolean>(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSaveSuccess, setIsSaveSuccess] = useState<boolean>(false);
  const [savedStudentName, setSavedStudentName] = useState<string>('');


  const initialFormState = {
      refNo: '',
      dateOfBirthInWords: '',
      schoolDues: 'None',
      qualifiedForPromotion: 'Yes' as 'Yes' | 'No',
      lastAttendanceDate: '',
      applicationDate: new Date().toISOString().split('T')[0],
      issueDate: new Date().toISOString().split('T')[0],
      reasonForLeaving: 'Unavoidable change of residence',
      generalConduct: 'Good',
      remarks: '',
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchDobInWords = async (date: string) => {
    if (!date) return;
    setIsFetchingDob(true);
    setFormData(prev => ({...prev, dateOfBirthInWords: ''}));
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Convert the date "${date}" (YYYY-MM-DD) into words following the format "Day of Month Year". For example, for "2014-05-20", the output should be "Twentieth of May Two Thousand Fourteen". Provide only the text of the date.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        const text = response.text;
        setFormData(prev => ({ ...prev, dateOfBirthInWords: text.trim() }));
    } catch (error) {
        console.error("Error fetching DOB in words:", error);
        setFormData(prev => ({ ...prev, dateOfBirthInWords: 'Error fetching data.' }));
    } finally {
        setIsFetchingDob(false);
    }
  };
  
  const handleStudentSearch = () => {
    setStudent(null);
    setSearchError('');
    setFormData(initialFormState); // Reset form on new search

    if (!studentIdInput) {
        setSearchError('Please enter a Student ID.');
        return;
    }

    const foundStudent = students.find(s => formatStudentId(s, academicYear).toLowerCase() === studentIdInput.toLowerCase());

    if (foundStudent) {
        setStudent(foundStudent);
        fetchDobInWords(foundStudent.dateOfBirth);
        
        const duesArray = calculateDues(foundStudent);
        const calculatedDues = duesArray.length > 0 ? duesArray.join('; ') + ' due.' : 'None';

        setFormData(prev => ({
            ...prev,
            refNo: `BMS/TC/${new Date().getFullYear()}/${foundStudent.id}`,
            schoolDues: calculatedDues,
        }));
    } else {
        setSearchError('Student ID not found. Please check and try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value as any }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!student) {
        alert("Please find and select a student first.");
        return;
    }
    setIsConfirmModalOpen(true);
  };
  
  const handleConfirmSave = () => {
    if (!student) return;

    const tcRecord: Omit<TcRecord, 'id'> = {
        tcData: formData,
        studentDetails: {
            studentId: formatStudentId(student, academicYear),
            studentNumericId: student.id,
            rollNo: student.rollNo,
            name: student.name,
            gender: student.gender,
            fatherName: student.fatherName,
            motherName: student.motherName,
            currentClass: student.grade,
            dateOfBirth: student.dateOfBirth,
            category: student.category,
            religion: student.religion,
        }
    };
    onSave(tcRecord);
    
    setIsConfirmModalOpen(false);
    setSavedStudentName(student.name);
    setIsSaveSuccess(true);
  };

  const handleGenerateAnother = () => {
    setIsSaveSuccess(false);
    setSavedStudentName('');
    setStudentIdInput('');
    setStudent(null);
    setSearchError('');
    setFormData(initialFormState);
  }

  if (isSaveSuccess) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-emerald-100 text-emerald-600 rounded-full p-4 mb-4">
                <CheckIcon className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">Saved Successfully!</h1>
            <p className="text-slate-700 mt-2 text-lg">
                The Transfer Certificate for <span className="font-semibold">{savedStudentName}</span> has been generated and saved.
            </p>
            <div className="mt-8 flex gap-4">
                <button
                    onClick={handleGenerateAnother}
                    className="px-6 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition"
                >
                    Generate Another TC
                </button>
                <button
                    onClick={() => navigate('/transfers')}
                    className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition"
                >
                    Return to Transfers
                </button>
            </div>
        </div>
    );
  }

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
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Transfer Certificate Registration</h1>
      <p className="text-slate-700 mb-8">Enter a student's ID to fetch their details and generate a new TC.</p>

      {/* Student Selector */}
      <fieldset disabled={user.role !== 'admin'}>
        <div className="mb-8 max-w-lg">
          <label htmlFor="student-id-input" className="block text-sm font-bold text-slate-800 mb-2">Enter Student ID</label>
          <div className="flex gap-2 items-start">
              <div className="flex-grow">
                  <input
                      id="student-id-input"
                      type="text"
                      placeholder="e.g., BMS250501"
                      value={studentIdInput}
                      onChange={e => setStudentIdInput(e.target.value.toUpperCase())}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleStudentSearch(); }}}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                  />
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
      </fieldset>

      {student && (
        <form onSubmit={handleSubmit}>
          <fieldset disabled={user.role !== 'admin'}>
            <div className="space-y-6">
                {/* Auto-filled Section */}
                <fieldset className="border p-4 rounded-lg">
                    <legend className="text-lg font-bold text-slate-800 px-2">Student Details</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                        <ReadonlyField label="Ref. No" value={formData.refNo} />
                        <ReadonlyField label="Student ID" value={formatStudentId(student, academicYear)} />
                        <ReadonlyField label="Roll No" value={student.rollNo} />
                        <div>
                            <label className="block text-sm font-bold text-slate-800">Name of Student</label>
                            <div className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-md shadow-sm sm:text-sm text-slate-800 min-h-[42px] flex items-center">
                                <Link to={`/student/${student.id}`} className="hover:underline text-sky-700 font-semibold" target="_blank" rel="noopener noreferrer">
                                    {student.name}
                                </Link>
                            </div>
                        </div>
                        <ReadonlyField label="Father's Name" value={student.fatherName} />
                        <ReadonlyField label="Mother's Name" value={student.motherName} />
                        <ReadonlyField label="Current Class" value={student.grade} />
                        <ReadonlyField label="Date of Birth" value={student.dateOfBirth} />
                        <ReadonlyField label="Gender" value={student.gender} />
                        <ReadonlyField label="Category" value={student.category} />
                        <ReadonlyField label="Religion" value={student.religion} />
                    </div>
                </fieldset>

                {/* Editable Section */}
                 <fieldset className="border p-4 rounded-lg">
                    <legend className="text-lg font-bold text-slate-800 px-2">Certificate Information</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                        <div className="md:col-span-2">
                            <ReadonlyField label="Date of Birth in Words" value={isFetchingDob ? 'Generating...' : formData.dateOfBirthInWords} />
                        </div>
                        <ReadonlyField label="School Dues (Auto-calculated)" value={formData.schoolDues} />
                        <FormField 
                            label="Qualified for Promotion" 
                            name="qualifiedForPromotion" 
                            value={formData.qualifiedForPromotion}
                            onChange={handleChange}
                            type="select"
                            options={[{value: "Yes", label: "Yes"}, {value: "No", label: "No"}]}
                        />
                        <FormField label="Date of Last Attendance" name="lastAttendanceDate" value={formData.lastAttendanceDate} onChange={handleChange} type="date" />
                        <FormField label="Date of Application for TC" name="applicationDate" value={formData.applicationDate} onChange={handleChange} type="date" />
                        <FormField label="Date of Issue of TC" name="issueDate" value={formData.issueDate} onChange={handleChange} type="date" />
                         <div className="md:col-span-2">
                            <FormField 
                                label="Reason for Leaving" 
                                name="reasonForLeaving" 
                                value={formData.reasonForLeaving}
                                onChange={handleChange}
                                type="select"
                                options={[
                                    { value: "Unavoidable change of residence", label: "Unavoidable change of residence" },
                                    { value: "Completion of the School Course", label: "Completion of the School Course" },
                                    { value: "Ill Health", label: "Ill Health" },
                                    { value: "Minor reasons", label: "Minor reasons" }
                                ]}
                            />
                         </div>
                         <FormField 
                            label="General Conduct" 
                            name="generalConduct" 
                            value={formData.generalConduct}
                            onChange={handleChange}
                            type="select"
                            options={[
                                { value: "Good", label: "Good" },
                                { value: "Not Good", label: "Not Good" }
                            ]}
                         />
                         <div className="md:col-span-3">
                            <FormField label="Any Other Remarks" name="remarks" value={formData.remarks} onChange={handleChange} type="textarea" required={false} />
                         </div>
                    </div>
                </fieldset>
            </div>
            
            {user.role === 'admin' && (
              <div className="mt-8 flex justify-end gap-3">
                  <button
                      type="button"
                      onClick={() => navigate('/transfers')}
                      className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition"
                  >
                      Cancel
                  </button>
                  <button
                      type="submit"
                      className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition flex items-center gap-2"
                  >
                      <DocumentPlusIcon className="w-5 h-5" />
                      Generate & Save TC
                  </button>
              </div>
            )}
          </fieldset>
        </form>
      )}

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSave}
        title="Confirm TC Generation"
      >
        <p>Are you sure you want to generate and save this Transfer Certificate for <span className="font-bold">{student?.name}</span>? This action cannot be easily undone.</p>
      </ConfirmationModal>
    </div>
  );
};

export default TcRegistrationPage;
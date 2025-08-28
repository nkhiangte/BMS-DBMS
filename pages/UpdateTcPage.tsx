

import React, { useState, FormEvent, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { TcRecord, User } from '../types';
import { BackIcon, HomeIcon, SearchIcon, CheckIcon } from '../components/Icons';

// Reusing these helper components from TcRegistrationPage.tsx
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

interface UpdateTcPageProps {
  tcRecords: TcRecord[];
  onUpdate: (tcRecord: TcRecord) => void;
  user: User;
}

const UpdateTcPage: React.FC<UpdateTcPageProps> = ({ tcRecords, onUpdate, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [studentIdInput, setStudentIdInput] = useState<string>(location.state?.studentIdInput || '');
  const [foundRecord, setFoundRecord] = useState<TcRecord | null>(null);
  const [searchError, setSearchError] = useState<string>('');
  const [formData, setFormData] = useState<TcRecord['tcData'] | null>(null);

  const handleSearch = useCallback(() => {
    setFoundRecord(null);
    setFormData(null);
    setSearchError('');

    if (!studentIdInput) {
      setSearchError('Please enter a Student ID.');
      return;
    }
    
    const record = tcRecords.find(r => r.studentDetails.studentId.toLowerCase() === studentIdInput.toLowerCase());

    if (record) {
      setFoundRecord(record);
      setFormData(record.tcData);
    } else {
      setSearchError('No Transfer Certificate record found for this Student ID.');
    }
  }, [studentIdInput, tcRecords]);

  useEffect(() => {
      if (location.state?.studentIdInput) {
          handleSearch();
      }
  }, [location.state, handleSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev!, [name]: value as any }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!foundRecord || !formData) {
      alert("No record loaded to update.");
      return;
    }
    const updatedRecord: TcRecord = {
      ...foundRecord,
      tcData: formData,
    };
    onUpdate(updatedRecord);
    alert("Transfer Certificate has been successfully updated.");
    navigate('/transfers');
  };

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
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Search & Update TC</h1>
      <p className="text-slate-700 mb-8">Enter a student's ID to find their TC record and edit it.</p>

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
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); }}}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                />
                 {searchError && <p className="text-red-500 text-sm mt-1">{searchError}</p>}
            </div>
            <button
                type="button"
                onClick={handleSearch}
                className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 h-[42px] flex items-center justify-center"
            >
                <SearchIcon className="w-5 h-5" />
                <span className="sr-only">Find</span>
            </button>
        </div>
      </div>

      {foundRecord && formData && (
        <form onSubmit={handleSubmit}>
          <fieldset disabled={user.role !== 'admin'}>
            <div className="space-y-6">
                <fieldset className="border p-4 rounded-lg bg-slate-50">
                    <legend className="text-lg font-bold text-slate-800 px-2">Student Details (Read-only)</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                        <ReadonlyField label="Ref. No" value={formData.refNo} />
                        <ReadonlyField label="Student ID" value={foundRecord.studentDetails.studentId} />
                        <div>
                            <label className="block text-sm font-bold text-slate-800">Name of Student</label>
                            <div className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-md shadow-sm sm:text-sm text-slate-800 min-h-[42px] flex items-center">
                                <Link to={`/student/${foundRecord.studentDetails.studentNumericId}`} className="hover:underline text-sky-700 font-semibold" target="_blank" rel="noopener noreferrer">
                                    {foundRecord.studentDetails.name}
                                </Link>
                            </div>
                        </div>
                        <ReadonlyField label="Father's Name" value={foundRecord.studentDetails.fatherName} />
                        <ReadonlyField label="Mother's Name" value={foundRecord.studentDetails.motherName} />
                        <ReadonlyField label="Class at time of TC" value={foundRecord.studentDetails.currentClass} />
                    </div>
                </fieldset>

                 <fieldset className="border p-4 rounded-lg">
                    <legend className="text-lg font-bold text-slate-800 px-2">Certificate Information (Editable)</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                        <div className="md:col-span-2">
                             <FormField label="Date of Birth in Words" name="dateOfBirthInWords" value={formData.dateOfBirthInWords} onChange={handleChange} />
                             <p className="text-xs text-slate-600 mt-1">Regenerate the TC if the student's date of birth needs to be updated.</p>
                        </div>
                        <FormField label="School Dues (if any)" name="schoolDues" value={formData.schoolDues} onChange={handleChange} />
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
            
            <div className="mt-8 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => { setFoundRecord(null); setSearchError(''); }}
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition"
                >
                    Cancel Edit
                </button>
                <button
                    type="submit"
                    disabled={user.role !== 'admin'}
                    className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition flex items-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    <CheckIcon className="w-5 h-5" />
                    Update & Save TC
                </button>
            </div>
          </fieldset>
        </form>
      )}
    </div>
  );
};

export default UpdateTcPage;

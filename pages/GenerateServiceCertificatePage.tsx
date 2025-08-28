

import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Staff, ServiceCertificateRecord, EmploymentStatus, User } from '../types';
import { BackIcon, HomeIcon, DocumentPlusIcon, CheckIcon } from '../components/Icons';
import ConfirmationModal from '../components/ConfirmationModal';

interface GenerateServiceCertificatePageProps {
  staff: Staff[];
  onSave: (certRecord: Omit<ServiceCertificateRecord, 'id'>) => void;
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

const GenerateServiceCertificatePage: React.FC<GenerateServiceCertificatePageProps> = ({ staff, onSave, user }) => {
  const navigate = useNavigate();
  
  const [staffIdInput, setStaffIdInput] = useState<string>('');
  const [foundStaff, setFoundStaff] = useState<Staff | null>(null);
  const [searchError, setSearchError] = useState<string>('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSaveSuccess, setIsSaveSuccess] = useState<boolean>(false);
  const [savedStaffName, setSavedStaffName] = useState<string>('');

  const initialFormState = {
      refNo: '',
      lastWorkingDay: new Date().toISOString().split('T')[0],
      issueDate: new Date().toISOString().split('T')[0],
      reasonForLeaving: 'Resigned',
      generalConduct: 'Good',
      remarks: 'None',
  };

  const [formData, setFormData] = useState(initialFormState);
  
  const handleStaffSearch = () => {
    setFoundStaff(null);
    setSearchError('');
    setFormData(initialFormState);

    if (!staffIdInput) {
        setSearchError('Please enter an Employee ID.');
        return;
    }
    
    // Allow searching for any staff, not just active, as they might have just resigned.
    const staffMember = staff.find(s => s.employeeId.toLowerCase() === staffIdInput.toLowerCase());

    if (staffMember) {
        if(staffMember.status !== EmploymentStatus.ACTIVE) {
            setSearchError(`Warning: This staff member's status is already '${staffMember.status}'. You can still proceed.`);
        }
        setFoundStaff(staffMember);
        setFormData(prev => ({
            ...prev,
            refNo: `BMS/SC/${new Date().getFullYear()}/${staffMember.id}`,
        }));
    } else {
        setSearchError('Employee ID not found. Please check and try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value as any }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!foundStaff) {
        alert("Please find and select a staff member first.");
        return;
    }
    setIsConfirmModalOpen(true);
  };
  
  const handleConfirmSave = () => {
    if (!foundStaff) return;

    const certRecord: Omit<ServiceCertificateRecord, 'id'> = {
        certData: formData,
        staffDetails: {
            staffId: foundStaff.employeeId,
            staffNumericId: foundStaff.id,
            name: `${foundStaff.firstName} ${foundStaff.lastName}`,
            gender: foundStaff.gender,
            designation: foundStaff.designation,
            dateOfJoining: foundStaff.dateOfJoining,
            dateOfBirth: foundStaff.dateOfBirth,
        }
    };
    onSave(certRecord);
    
    setIsConfirmModalOpen(false);
    setSavedStaffName(`${foundStaff.firstName} ${foundStaff.lastName}`);
    setIsSaveSuccess(true);
  };

  const handleGenerateAnother = () => {
    setIsSaveSuccess(false);
    setSavedStaffName('');
    setStaffIdInput('');
    setFoundStaff(null);
    setSearchError('');
    setFormData(initialFormState);
  };

  if (isSaveSuccess) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-emerald-100 text-emerald-600 rounded-full p-4 mb-4">
                <CheckIcon className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">Saved Successfully!</h1>
            <p className="text-slate-700 mt-2 text-lg">
                The Service Certificate for <span className="font-semibold">{savedStaffName}</span> has been generated and saved.
            </p>
            <div className="mt-8 flex gap-4">
                <button
                    onClick={handleGenerateAnother}
                    className="px-6 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition"
                >
                    Generate Another
                </button>
                <button
                    onClick={() => navigate('/staff/certificates')}
                    className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition"
                >
                    Return to Records
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
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Service Certificate Registration</h1>
      <p className="text-slate-700 mb-8">Enter an employee's ID to fetch their details and generate a new certificate.</p>
      
      <div className="mb-8 max-w-lg">
        <label htmlFor="staff-id-input" className="block text-sm font-bold text-slate-800 mb-2">Enter Employee ID</label>
        <div className="flex gap-2 items-start">
            <div className="flex-grow">
                <input
                    id="staff-id-input"
                    type="text"
                    placeholder="e.g., BMS-T-001"
                    value={staffIdInput}
                    onChange={e => setStaffIdInput(e.target.value.toUpperCase())}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleStaffSearch(); }}}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                />
                {searchError && <p className={`${searchError.startsWith('Warning') ? 'text-amber-600' : 'text-red-500'} text-sm mt-1`}>{searchError}</p>}
            </div>
            <button
                type="button"
                onClick={handleStaffSearch}
                className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 h-[42px]"
            >
                Find
            </button>
        </div>
      </div>

      {foundStaff && (
        <form onSubmit={handleSubmit}>
          <fieldset disabled={user.role !== 'admin'}>
            <div className="space-y-6">
                <fieldset className="border p-4 rounded-lg">
                    <legend className="text-lg font-bold text-slate-800 px-2">Staff Details</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                        <ReadonlyField label="Ref. No" value={formData.refNo} />
                        <ReadonlyField label="Employee ID" value={foundStaff.employeeId} />
                         <div>
                            <label className="block text-sm font-bold text-slate-800">Name</label>
                            <div className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-md shadow-sm sm:text-sm text-slate-800 min-h-[42px] flex items-center">
                                <Link to={`/staff/${foundStaff.id}`} className="hover:underline text-sky-700 font-semibold" target="_blank" rel="noopener noreferrer">
                                    {foundStaff.firstName} {foundStaff.lastName}
                                </Link>
                            </div>
                        </div>
                        <ReadonlyField label="Designation" value={foundStaff.designation} />
                        <ReadonlyField label="Date of Joining" value={foundStaff.dateOfJoining} />
                        <ReadonlyField label="Date of Birth" value={foundStaff.dateOfBirth} />
                    </div>
                </fieldset>
                
                <fieldset className="border p-4 rounded-lg">
                    <legend className="text-lg font-bold text-slate-800 px-2">Certificate Information</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                        <FormField label="Last Working Day" name="lastWorkingDay" value={formData.lastWorkingDay} onChange={handleChange} type="date" />
                        <FormField label="Date of Issue" name="issueDate" value={formData.issueDate} onChange={handleChange} type="date" />
                         <FormField 
                            label="Reason for Leaving" 
                            name="reasonForLeaving" 
                            value={formData.reasonForLeaving}
                            onChange={handleChange}
                         />
                         <FormField 
                            label="General Conduct" 
                            name="generalConduct" 
                            value={formData.generalConduct}
                            onChange={handleChange}
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
                    onClick={() => navigate('/staff/certificates')}
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={user.role !== 'admin'}
                    className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 flex items-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    <DocumentPlusIcon className="w-5 h-5" />
                    Generate & Save
                </button>
            </div>
          </fieldset>
        </form>
      )}

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSave}
        title="Confirm Certificate Generation"
      >
        <p>This will generate a service certificate for <span className="font-bold">{foundStaff?.firstName} {foundStaff?.lastName}</span> and mark their status as 'Resigned'. This action cannot be easily undone. Are you sure?</p>
      </ConfirmationModal>
    </div>
  );
};

export default GenerateServiceCertificatePage;

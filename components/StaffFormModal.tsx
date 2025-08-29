import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { Staff, Grade, GradeDefinition, Gender, MaritalStatus, Department, Designation, EmployeeType, Qualification, BloodGroup, EmploymentStatus, StaffType } from '../types';
import { 
    GENDER_LIST, 
    MARITAL_STATUS_LIST, 
    DEPARTMENT_LIST, 
    DESIGNATION_LIST, 
    EMPLOYEE_TYPE_LIST, 
    QUALIFICATION_LIST, 
    BLOOD_GROUP_LIST,
    EMPLOYMENT_STATUS_LIST,
    STAFF_TYPE_LIST,
} from '../constants';
import { ChevronDownIcon, ChevronUpIcon, UserIcon } from './Icons';
import { formatDateForDisplay, formatDateForStorage } from '../utils';

const AccordionSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border rounded-lg overflow-hidden">
            <button
                type="button"
                className="w-full flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100 focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <h3 className="font-semibold text-slate-800">{title}</h3>
                {isOpen ? <ChevronUpIcon className="w-5 h-5 text-slate-700" /> : <ChevronDownIcon className="w-5 h-5 text-slate-700" />}
            </button>
            {isOpen && <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>}
        </div>
    );
};

const resizeImage = (file: File, maxWidth: number, maxHeight: number, quality: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (!e.target?.result) {
                return reject(new Error("FileReader did not return a result."));
            }
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error('Could not get canvas context'));
                }
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = (err) => reject(err);
            img.src = e.target.result as string;
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
};


interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (staffData: Omit<Staff, 'id'>, assignedGradeKey: Grade | null) => void;
  staffMember: Staff | null;
  allStaff: Staff[];
  gradeDefinitions: Record<Grade, GradeDefinition>;
}

const StaffFormModal: React.FC<StaffFormModalProps> = ({ isOpen, onClose, onSubmit, staffMember, allStaff, gradeDefinitions }) => {
    const getInitialFormData = (): Omit<Staff, 'id'> => ({
        staffType: 'Teaching',
        employeeId: '',
        firstName: '',
        lastName: '',
        gender: Gender.MALE,
        dateOfBirth: '',
        nationality: 'Indian',
        maritalStatus: MaritalStatus.SINGLE,
        photographUrl: '',
        bloodGroup: BloodGroup.O_POSITIVE,
        aadhaarNumber: '',
        contactNumber: '',
        emailAddress: '',
        permanentAddress: '',
        currentAddress: '',
        educationalQualification: Qualification.GRADUATE,
        specialization: '',
        yearsOfExperience: 0,
        previousExperience: '',
        dateOfJoining: '',
        department: Department.LANGUAGES,
        designation: Designation.TEACHER,
        employeeType: EmployeeType.FULL_TIME,
        status: EmploymentStatus.ACTIVE,
        subjectsTaught: [],
        teacherLicenseNumber: '',
        salaryGrade: '',
        basicSalary: null,
        bankAccountNumber: '',
        bankName: '',
        panNumber: '',
        emergencyContactName: '',
        emergencyContactRelationship: '',
        emergencyContactNumber: '',
        medicalConditions: '',
    });

    const [formData, setFormData] = useState(getInitialFormData());
    const [assignedGrade, setAssignedGrade] = useState<Grade | ''>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (staffMember) {
                setFormData({
                    ...getInitialFormData(),
                    ...staffMember,
                    yearsOfExperience: staffMember.yearsOfExperience ?? 0,
                    basicSalary: staffMember.basicSalary ?? null,
                    dateOfBirth: formatDateForDisplay(staffMember.dateOfBirth),
                    dateOfJoining: formatDateForDisplay(staffMember.dateOfJoining),
                });
                const assignedGradeKey = Object.keys(gradeDefinitions).find(
                    g => gradeDefinitions[g as Grade]?.classTeacherId === staffMember.id
                ) as Grade | null;
                setAssignedGrade(assignedGradeKey || '');
            } else {
                setFormData(getInitialFormData());
                setAssignedGrade('');
            }
        }
    }, [staffMember, isOpen, gradeDefinitions]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        if (name === 'subjectsTaught') {
            const subjects = value.split(',').map(s => s.trim()).filter(Boolean);
            setFormData(prev => ({ ...prev, subjectsTaught: subjects }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const compressedDataUrl = await resizeImage(file, 512, 512, 0.8);
                setFormData(prev => ({ ...prev, photographUrl: compressedDataUrl }));
            } catch (error) {
                console.error("Error compressing image:", error);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFormData(prev => ({ ...prev, photographUrl: reader.result as string }));
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleRemovePhoto = () => {
        setFormData(prev => ({ ...prev, photographUrl: '' }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        
        const dataToSave: { [key: string]: any } = {
            ...formData,
            dateOfBirth: formatDateForStorage(formData.dateOfBirth),
            dateOfJoining: formatDateForStorage(formData.dateOfJoining),
        };
        
        // Convert subjectsTaught from string to array if needed
        if (typeof dataToSave.subjectsTaught === 'string') {
            dataToSave.subjectsTaught = dataToSave.subjectsTaught.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
    
        // Firestore fails silently with `undefined` values.
        // We must clean the object of any keys that have `undefined`, `null`, or `''` as values.
        Object.keys(dataToSave).forEach(key => {
            const value = dataToSave[key];
            if (value === null || value === null || value === '') {
                // Exceptions for numeric fields that could be 0.
                if (key !== 'yearsOfExperience' && key !== 'basicSalary') {
                     delete dataToSave[key];
                }
            }
        });
    
        // Ensure numeric types are correct for fields that might have been left as strings
        if (dataToSave.yearsOfExperience) {
            dataToSave.yearsOfExperience = Number(dataToSave.yearsOfExperience);
        }
        if (dataToSave.basicSalary) {
            dataToSave.basicSalary = Number(dataToSave.basicSalary);
        }
        
        onSubmit(dataToSave as Omit<Staff, 'id'>, assignedGrade || null);
    };

    const gradeOptions = Object.keys(gradeDefinitions).map(gradeKey => {
        const gradeDef = gradeDefinitions[gradeKey as Grade];
        const assignedTeacher = gradeDef.classTeacherId ? allStaff.find(s => s.id === gradeDef.classTeacherId) : null;
        
        let label = gradeKey;
        if (assignedTeacher && (!staffMember || assignedTeacher.id !== staffMember.id)) {
            label += ` (Assigned to ${assignedTeacher.firstName})`;
        }
        
        const isDisabled = assignedTeacher && (!staffMember || assignedTeacher.id !== staffMember.id);
        
        return { value: gradeKey, label, disabled: isDisabled };
    });

    if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-slate-800">{staffMember ? 'Edit Staff Details' : 'Add New Staff Member'}</h2>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
                <AccordionSection title="Personal Details" defaultOpen={true}>
                    <div>
                        <label className="block text-sm font-bold text-slate-800">First Name</label>
                        <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-800">Last Name</label>
                        <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-800">Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                            {GENDER_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-800">Date of Birth</label>
                        <input type="text" placeholder="DD/MM/YYYY" pattern="\d{1,2}/\d{1,2}/\d{4}" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-800">Marital Status</label>
                        <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                            {MARITAL_STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-800">Blood Group</label>
                        <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                             {BLOOD_GROUP_LIST.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-800">Aadhaar Number</label>
                        <input type="text" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-800">Nationality</label>
                        <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-800">Photograph</label>
                        <div className="mt-2 flex items-center gap-4">
                            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border">
                                {formData.photographUrl ? <img src={formData.photographUrl} alt="Staff preview" className="w-full h-full object-cover" /> : <UserIcon className="w-16 h-16 text-slate-500" />}
                            </div>
                            <div className="flex flex-col gap-2">
                                <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" id="photo-upload-staff" />
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-secondary">Upload Photo</button>
                                {formData.photographUrl && <button type="button" onClick={handleRemovePhoto} className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 font-semibold rounded-lg shadow-sm hover:bg-red-100 text-sm">Remove</button>}
                            </div>
                        </div>
                    </div>
                </AccordionSection>
                <AccordionSection title="Contact Information">
                    <div>
                        <label className="block text-sm font-bold text-slate-800">Contact Number</label>
                        <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-800">Email</label>
                        <input type="email" name="emailAddress" value={formData.emailAddress} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-800">Current Address</label>
                        <textarea name="currentAddress" value={formData.currentAddress} onChange={handleChange} rows={2} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                    </div>
                     <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-800">Permanent Address</label>
                        <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} rows={2} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                    </div>
                </AccordionSection>
                 <AccordionSection title="Professional Details">
                     <div>
                        <label className="block text-sm font-bold text-slate-800">Employee ID</label>
                        <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" placeholder="e.g., BMS-T-001" required />
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-800">Date of Joining</label>
                        <input type="text" placeholder="DD/MM/YYYY" pattern="\d{1,2}/\d{1,2}/\d{4}" name="dateOfJoining" value={formData.dateOfJoining} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-800">Staff Type</label>
                        <select name="staffType" value={formData.staffType} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                            {STAFF_TYPE_LIST.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-800">Employment Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                            {EMPLOYMENT_STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-800">Department</label>
                        <select name="department" value={formData.department} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                            {DEPARTMENT_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-800">Designation</label>
                        <select name="designation" value={formData.designation} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                            {DESIGNATION_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-800">Employee Type</label>
                        <select name="employeeType" value={formData.employeeType} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                            {EMPLOYEE_TYPE_LIST.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    {formData.staffType === 'Teaching' && (
                        <div>
                            <label className="block text-sm font-bold text-slate-800">Assign as Class Teacher</label>
                            <select value={assignedGrade} onChange={e => setAssignedGrade(e.target.value as Grade)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                                <option value="">-- Not a Class Teacher --</option>
                                {gradeOptions.map(opt => (
                                    <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </AccordionSection>
                <AccordionSection title="Qualifications & Experience">
                    <div>
                        <label className="block text-sm font-bold text-slate-800">Highest Qualification</label>
                        <select name="educationalQualification" value={formData.educationalQualification} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                            {QUALIFICATION_LIST.map(q => <option key={q} value={q}>{q}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-800">Specialization/Major</label>
                        <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-800">Years of Experience</label>
                        <input type="number" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                    </div>
                    {formData.staffType === 'Teaching' && (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-slate-800">Subjects Taught</label>
                                <input type="text" name="subjectsTaught" value={Array.isArray(formData.subjectsTaught) ? formData.subjectsTaught.join(', ') : ''} onChange={handleChange} placeholder="e.g. English, Maths" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-800">Teacher License No. (Optional)</label>
                                <input type="text" name="teacherLicenseNumber" value={formData.teacherLicenseNumber || ''} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
                            </div>
                        </>
                    )}
                     <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-800">Previous Experience (Optional)</label>
                        <textarea name="previousExperience" value={formData.previousExperience} onChange={handleChange} rows={3} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
                    </div>
                </AccordionSection>
                 <AccordionSection title="Payroll Details (Optional)">
                    <div>
                        <label className="block text-sm font-bold text-slate-800">Basic Salary</label>
                        <input type="number" name="basicSalary" value={formData.basicSalary ?? ''} onChange={handleChange} placeholder="e.g. 30000" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-800">Salary Grade</label>
                        <input type="text" name="salaryGrade" value={formData.salaryGrade || ''} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-800">PAN Number</label>
                        <input type="text" name="panNumber" value={formData.panNumber || ''} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-800">Bank Name</label>
                        <input type="text" name="bankName" value={formData.bankName || ''} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
                    </div>
                     <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-800">Bank Account Number</label>
                        <input type="text" name="bankAccountNumber" value={formData.bankAccountNumber || ''} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
                    </div>
                </AccordionSection>
                <AccordionSection title="Emergency Contact">
                     <div>
                        <label className="block text-sm font-bold text-slate-800">Contact Name</label>
                        <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-800">Relationship</label>
                        <input type="text" name="emergencyContactRelationship" value={formData.emergencyContactRelationship} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-800">Contact Number</label>
                        <input type="tel" name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-800">Medical Conditions (Optional)</label>
                        <textarea name="medicalConditions" value={formData.medicalConditions || ''} onChange={handleChange} rows={2} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
                    </div>
                </AccordionSection>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-xl border-t">
                <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                {staffMember ? 'Save Changes' : 'Add Staff'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default StaffFormModal;
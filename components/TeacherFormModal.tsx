
import React, { useState, useEffect, FormEvent, useRef, useMemo } from 'react';
import { Staff, Grade, GradeDefinition, Gender, MaritalStatus, Department, Designation, EmployeeType, BloodGroup, EmploymentStatus, StaffType, Qualification } from '../types';
import { UserIcon, ChevronDownIcon, ChevronUpIcon } from './Icons';
import { GRADES_LIST, GENDER_LIST, MARITAL_STATUS_LIST, DEPARTMENT_LIST, DESIGNATION_LIST, EMPLOYEE_TYPE_LIST, BLOOD_GROUP_LIST, EMPLOYMENT_STATUS_LIST, STAFF_TYPE_LIST, QUALIFICATION_LIST } from '../constants';

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (staffData: Omit<Staff, 'id'>, assignedGradeKey: Grade | null) => void;
  staffMember: Staff | null;
  allStaff: Staff[];
  gradeDefinitions: Record<Grade, GradeDefinition>;
}

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
            {isOpen && <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>}
        </div>
    );
};

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
    bloodGroup: BloodGroup.A_POSITIVE,
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
    basicSalary: undefined,
    bankAccountNumber: '',
    bankName: '',
    panNumber: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactNumber: '',
    medicalConditions: '',
  });

  const [formData, setFormData] = useState<any>(getInitialFormData());
  const [assignedGrade, setAssignedGrade] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (staffMember) {
        setFormData({
            ...getInitialFormData(),
            ...staffMember,
        });
        const assignedGradeEntry = Object.entries(gradeDefinitions).find(
            ([, def]) => def.classTeacherId === staffMember.id
        );
        setAssignedGrade(assignedGradeEntry ? assignedGradeEntry[0] : '');
      } else {
        setFormData(getInitialFormData());
        setAssignedGrade('');
      }
    }
  }, [staffMember, isOpen, gradeDefinitions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => {
        let finalValue: any = value;
        if (type === 'number') {
            const parsed = parseInt(value, 10);
            if (isNaN(parsed)) {
                finalValue = name === 'basicSalary' ? undefined : 0;
            } else {
                finalValue = parsed;
            }
        }
        const newState = { ...prev, [name]: finalValue };
        
        if (name === 'staffType') {
            newState.designation = value === 'Teaching' ? Designation.TEACHER : Designation.CLERK;
        }
        return newState;
    });
  };

  const handleSubjectsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const subjects = e.target.value.split(',').map(s => s.trim()).filter(s => s);
      setFormData(prev => ({...prev, subjectsTaught: subjects }));
  };
  
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        try {
            const compressedDataUrl = await resizeImage(file, 512, 512, 0.8);
            setFormData(prev => ({ ...prev, photographUrl: compressedDataUrl }));
        } catch (error) {
            console.error("Error compressing image:", error);
            alert("There was an error processing the image. It will be saved without compression.");
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
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const requiredFields: { key: keyof Staff; label: string }[] = [
        { key: 'firstName', label: 'First Name' },
        { key: 'lastName', label: 'Last Name' },
        { key: 'employeeId', label: 'Employee ID' },
        { key: 'dateOfJoining', label: 'Date of Joining' },
    ];

    const missingFields = requiredFields.filter(field => {
        const value = formData[field.key];
        return !value || String(value).trim() === '';
    });

    if (missingFields.length > 0) {
        const missingFieldLabels = missingFields.map(field => field.label);
        alert(`Please fill in all required fields:\n\n- ${missingFieldLabels.join('\n- ')}`);
        return;
    }

    const finalData: Omit<Staff, 'id'> = {
        ...formData,
        yearsOfExperience: Number(formData.yearsOfExperience) || 0,
        basicSalary: formData.basicSalary ? Number(formData.basicSalary) : undefined,
    };

    if (finalData.staffType === 'Non-Teaching') {
        finalData.subjectsTaught = [];
    }
    
    onSubmit(finalData, assignedGrade ? (assignedGrade as Grade) : null);
  };
  
  const gradeOptions = useMemo(() => {
    return GRADES_LIST.map(grade => {
      const classDef = gradeDefinitions[grade];
      const assignedStaff = classDef.classTeacherId ? allStaff.find(t => t.id === classDef.classTeacherId) : null;
      const isAssignedToOther = assignedStaff && (!staffMember || assignedStaff.id !== staffMember.id);
      const assignedStaffName = assignedStaff ? `${assignedStaff.firstName} ${assignedStaff.lastName}` : '';
      return { grade, isAssignedToOther, assignedStaffName };
    });
  }, [allStaff, gradeDefinitions, staffMember]);

  if (!isOpen) return null;
  
  const teachingDesignations = [Designation.PRINCIPAL, Designation.HEAD_OF_DEPARTMENT, Designation.TEACHER, Designation.LAB_ASSISTANT];
  const nonTeachingDesignations = [Designation.CLERK, Designation.LIBRARIAN, Designation.SPORTS_TEACHER];
  const availableDesignations = formData.staffType === 'Teaching' ? teachingDesignations : nonTeachingDesignations;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
         <div className="p-6 border-b">
             <h2 className="text-2xl font-bold text-slate-800">{staffMember ? 'Edit Staff Details' : 'Add New Staff Member'}</h2>
         </div>
          <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
            
            <div className="bg-slate-100 p-4 rounded-lg">
                <label htmlFor="staffType" className="block text-sm font-bold text-slate-800 mb-2">Staff Category</label>
                <div className="flex gap-4">
                {STAFF_TYPE_LIST.map(type => (
                    <label key={type} className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                        <input type="radio" name="staffType" value={type} checked={formData.staffType === type} onChange={handleChange} className="h-4 w-4 text-sky-600 focus:ring-sky-500" />
                        {type}
                    </label>
                ))}
                </div>
            </div>

            <AccordionSection title="1. Personal Details & Contact" defaultOpen={true}>
              <div>
                <label htmlFor="firstName" className="block text-sm font-bold text-slate-800">First Name</label>
                <input type="text" name="firstName" id="firstName" value={formData.firstName} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-bold text-slate-800">Last Name</label>
                <input type="text" name="lastName" id="lastName" value={formData.lastName} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-bold text-slate-800">Gender</label>
                <select name="gender" id="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                  {GENDER_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-bold text-slate-800">Date of Birth</label>
                <input type="date" name="dateOfBirth" id="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
              </div>
              <div>
                <label htmlFor="nationality" className="block text-sm font-bold text-slate-800">Nationality</label>
                <input type="text" name="nationality" id="nationality" value={formData.nationality} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
              </div>
               <div>
                <label htmlFor="maritalStatus" className="block text-sm font-bold text-slate-800">Marital Status</label>
                <select name="maritalStatus" id="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                  {MARITAL_STATUS_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="contactNumber" className="block text-sm font-bold text-slate-800">Contact Number</label>
                <input type="tel" name="contactNumber" id="contactNumber" value={formData.contactNumber} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
              </div>
              <div>
                <label htmlFor="emailAddress" className="block text-sm font-bold text-slate-800">Email Address</label>
                <input type="email" name="emailAddress" id="emailAddress" value={formData.emailAddress} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required/>
              </div>
               <div className="lg:col-span-1 md:col-span-2">
                <label htmlFor="aadhaarNumber" className="block text-sm font-bold text-slate-800">Aadhaar Number</label>
                <input type="text" name="aadhaarNumber" id="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
              </div>
              <div className="lg:col-span-3 md:col-span-2">
                <label htmlFor="currentAddress" className="block text-sm font-bold text-slate-800">Current Address</label>
                <textarea name="currentAddress" id="currentAddress" value={formData.currentAddress} onChange={handleChange} rows={2} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
              </div>
              <div className="lg:col-span-3 md:col-span-2">
                <label htmlFor="permanentAddress" className="block text-sm font-bold text-slate-800">Permanent Address</label>
                <textarea name="permanentAddress" id="permanentAddress" value={formData.permanentAddress} onChange={handleChange} rows={2} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
              </div>
              <div className="lg:col-span-3 md:col-span-2">
                <label className="block text-sm font-bold text-slate-800">Profile Photo</label>
                 <div className="mt-2 flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border">
                        {formData.photographUrl ? <img src={formData.photographUrl} alt="Staff preview" className="w-full h-full object-cover" /> : <UserIcon className="w-16 h-16 text-slate-600" />}
                    </div>
                    <div className="flex flex-col gap-2">
                        <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" id="staff-photo-upload" />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-50 text-sm">Upload Photo</button>
                        {formData.photographUrl && <button type="button" onClick={handleRemovePhoto} className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 font-semibold rounded-lg shadow-sm hover:bg-red-100 text-sm">Remove</button>}
                    </div>
                </div>
              </div>
            </AccordionSection>

            <AccordionSection title="2. Qualifications & Experience">
                <div className="md:col-span-1">
                    <label htmlFor="educationalQualification" className="block text-sm font-bold text-slate-800">Qualification</label>
                    <select name="educationalQualification" id="educationalQualification" value={formData.educationalQualification} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                        {QUALIFICATION_LIST.map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="specialization" className="block text-sm font-bold text-slate-800">Specialization</label>
                    <input type="text" name="specialization" id="specialization" value={formData.specialization} placeholder="e.g. Algebra" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
                </div>
                <div>
                    <label htmlFor="yearsOfExperience" className="block text-sm font-bold text-slate-800">Total Years of Experience</label>
                    <input type="number" name="yearsOfExperience" id="yearsOfExperience" value={formData.yearsOfExperience ?? ''} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
                </div>
                <div className="lg:col-span-3 md:col-span-2">
                    <label htmlFor="previousExperience" className="block text-sm font-bold text-slate-800">Previous Experience Details</label>
                    <textarea name="previousExperience" id="previousExperience" value={formData.previousExperience} onChange={handleChange} rows={3} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" placeholder="e.g., 5 years at City Public School." />
                </div>
            </AccordionSection>

            <AccordionSection title="3. Professional Details">
              <div>
                <label htmlFor="employeeId" className="block text-sm font-bold text-slate-800">Employee ID</label>
                <input type="text" name="employeeId" id="employeeId" value={formData.employeeId} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
              </div>
              <div>
                <label htmlFor="dateOfJoining" className="block text-sm font-bold text-slate-800">Date of Joining</label>
                <input type="date" name="dateOfJoining" id="dateOfJoining" value={formData.dateOfJoining} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
              </div>
               <div>
                <label htmlFor="status" className="block text-sm font-bold text-slate-800">Employment Status</label>
                <select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required>
                  {EMPLOYMENT_STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
               <div>
                <label htmlFor="department" className="block text-sm font-bold text-slate-800">Department</label>
                <select name="department" id="department" value={formData.department} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                  {DEPARTMENT_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="designation" className="block text-sm font-bold text-slate-800">Designation</label>
                <select name="designation" id="designation" value={formData.designation} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required>
                  {availableDesignations.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="employeeType" className="block text-sm font-bold text-slate-800">Employee Type</label>
                <select name="employeeType" id="employeeType" value={formData.employeeType} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                  {EMPLOYEE_TYPE_LIST.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              
              {formData.staffType === 'Teaching' && (
                <>
                  <div className="md:col-span-1 lg:col-span-1">
                    <label htmlFor="assignedGrade" className="block text-sm font-bold text-slate-800">Class Teacher Assignment</label>
                    <select name="assignedGrade" id="assignedGrade" value={assignedGrade} onChange={(e) => setAssignedGrade(e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" disabled={formData.status !== EmploymentStatus.ACTIVE}>
                        <option value="">-- Unassigned --</option>
                        {gradeOptions.map(({ grade, isAssignedToOther, assignedStaffName }) => (
                            <option key={grade} value={grade} disabled={isAssignedToOther}>{grade} {isAssignedToOther ? `(${assignedStaffName})` : ''}</option>
                        ))}
                    </select>
                    {formData.status !== EmploymentStatus.ACTIVE && <p className="text-xs text-slate-700 mt-1">Status must be 'Active' to assign a class.</p>}
                  </div>
                  <div className="md:col-span-2 lg:col-span-2">
                    <label htmlFor="subjectsTaught" className="block text-sm font-bold text-slate-800">Subjects Handled</label>
                    <input type="text" name="subjectsTaught" id="subjectsTaught" value={formData.subjectsTaught.join(', ')} onChange={handleSubjectsChange} placeholder="e.g. Physics, Mathematics" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
                  </div>
                  <div className="lg:col-span-3">
                    <label htmlFor="teacherLicenseNumber" className="block text-sm font-bold text-slate-800">Teacher License Number (Optional)</label>
                    <input type="text" name="teacherLicenseNumber" id="teacherLicenseNumber" value={formData.teacherLicenseNumber} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
                  </div>
                </>
              )}
            </AccordionSection>

            <AccordionSection title="4. Payroll Details (Optional)">
              <div>
                <label htmlFor="salaryGrade" className="block text-sm font-bold text-slate-800">Salary Grade / Pay Scale</label>
                <input type="text" name="salaryGrade" id="salaryGrade" value={formData.salaryGrade} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
              </div>
               <div>
                <label htmlFor="basicSalary" className="block text-sm font-bold text-slate-800">Basic Salary (per month)</label>
                <input type="number" name="basicSalary" id="basicSalary" value={formData.basicSalary ?? ''} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
              </div>
               <div>
                <label htmlFor="panNumber" className="block text-sm font-bold text-slate-800">PAN Number</label>
                <input type="text" name="panNumber" id="panNumber" value={formData.panNumber} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
              </div>
               <div>
                <label htmlFor="bankName" className="block text-sm font-bold text-slate-800">Bank Name & Branch</label>
                <input type="text" name="bankName" id="bankName" value={formData.bankName} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="bankAccountNumber" className="block text-sm font-bold text-slate-800">Bank Account Number</label>
                <input type="text" name="bankAccountNumber" id="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
              </div>
            </AccordionSection>
            
            <AccordionSection title="5. Emergency Contact & Medical">
              <div>
                <label htmlFor="emergencyContactName" className="block text-sm font-bold text-slate-800">Emergency Contact Name</label>
                <input type="text" name="emergencyContactName" id="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
              </div>
              <div>
                <label htmlFor="emergencyContactRelationship" className="block text-sm font-bold text-slate-800">Relationship</label>
                <input type="text" name="emergencyContactRelationship" id="emergencyContactRelationship" value={formData.emergencyContactRelationship} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
              </div>
              <div>
                <label htmlFor="emergencyContactNumber" className="block text-sm font-bold text-slate-800">Emergency Contact Number</label>
                <input type="tel" name="emergencyContactNumber" id="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
              </div>
              <div>
                 <label htmlFor="bloodGroup" className="block text-sm font-bold text-slate-800">Blood Group</label>
                <select name="bloodGroup" id="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                  <option value="">-- Select --</option>
                  {BLOOD_GROUP_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="lg:col-span-2 md:col-span-2">
                <label htmlFor="medicalConditions" className="block text-sm font-bold text-slate-800">Medical Conditions (Optional)</label>
                <input type="text" name="medicalConditions" id="medicalConditions" value={formData.medicalConditions} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
              </div>
            </AccordionSection>
            
          </div>
          <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-xl border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition">
              {staffMember ? 'Save Changes' : 'Add Staff Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffFormModal;

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
        basicSalary: undefined,
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
                    basicSalary: staffMember.basicSalary ?? undefined,
                    dateOfBirth: formatDateForDisplay(staffMember.dateOfBirth),
                    dateOfJoining: formatDateForDisplay(staffMember.dateOfJoining),
                });
                const assignedGradeKey = Object.keys(gradeDefinitions).find(
                    g => gradeDefinitions[g as Grade]?.classTeacherId === staffMember.id
                ) as Grade | undefined;
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
        
        const dataWithFormattedDates = {
            ...formData,
            dateOfBirth: formatDateForStorage(formData.dateOfBirth),
            dateOfJoining: formatDateForStorage(formData.dateOfJoining),
        };

        const cleanData: { [key: string]: any } = { ...dataWithFormattedDates };
        
        const numericFields: (keyof Staff)[] = ['yearsOfExperience', 'basicSalary'];

        for(const field of numericFields) {
            const value = cleanData[field];
            if (value === '' || value === null || value === undefined || isNaN(Number(value))) {
                delete cleanData[field];
            } else {
                cleanData[field] = Number(value);
            }
        }
        
        const optionalTextFields: (keyof Staff)[] = [
            'teacherLicenseNumber', 'salaryGrade', 'bankAccountNumber', 'bankName', 'panNumber', 'medicalConditions'
        ];
        
        for (const field of optionalTextFields) {
            if (cleanData[field] === '' || cleanData[field] === null || cleanData[field] === undefined) {
                delete cleanData[field];
            }
        }

        if (cleanData.staffType === 'Non-Teaching') {
            cleanData.subjectsTaught = [];
            delete cleanData.teacherLicenseNumber;
        } else {
            if(typeof cleanData.subjectsTaught === 'string') {
                 cleanData.subjectsTaught = (cleanData.subjectsTaught as string).split(',').map(s => s.trim()).filter(Boolean);
            }
        }
        
        onSubmit(cleanData as Omit<Staff, 'id'>, assignedGrade || null);
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
                        <label className="
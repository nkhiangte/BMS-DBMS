import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { HostelStaff, Gender, HostelStaffRole, HostelBlock, PaymentStatus, Qualification, BloodGroup } from '../types';
import { UserIcon, ChevronDownIcon, ChevronUpIcon } from './Icons';
import { GENDER_LIST, HOSTEL_STAFF_ROLE_LIST, HOSTEL_BLOCK_LIST, QUALIFICATION_LIST, BLOOD_GROUP_LIST } from '../constants';
import { formatDateForDisplay, formatDateForStorage } from '../utils';

interface HostelStaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (staffData: Omit<HostelStaff, 'id'>) => void;
  staffMember: HostelStaff | null;
}

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


const HostelStaffFormModal: React.FC<HostelStaffFormModalProps> = ({ isOpen, onClose, onSubmit, staffMember }) => {
    const getInitialFormData = (): Omit<HostelStaff, 'id'> => ({
        name: '',
        gender: Gender.MALE,
        dateOfBirth: '',
        photographUrl: '',
        bloodGroup: undefined,
        aadhaarNumber: '',
        contactNumber: '',
        permanentAddress: '',
        role: HostelStaffRole.WARDEN,
        dateOfJoining: formatDateForDisplay(new Date().toISOString().split('T')[0]),
        dutyShift: '',
        assignedBlock: undefined,
        qualification: undefined,
        expertise: '',
        salary: 0,
        paymentStatus: PaymentStatus.PENDING,
        attendancePercent: 100,
        emergencyContactName: '',
        emergencyContactRelationship: '',
        emergencyContactNumber: '',
    });

    const [formData, setFormData] = useState(getInitialFormData());
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (staffMember) {
                setFormData({
                    ...getInitialFormData(),
                    ...staffMember,
                    dateOfJoining: formatDateForDisplay(staffMember.dateOfJoining),
                    dateOfBirth: formatDateForDisplay(staffMember.dateOfBirth),
                });
            } else {
                setFormData(getInitialFormData());
            }
        }
    }, [staffMember, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value, 10) || 0 : value }));
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
        const dataToSubmit = {
            ...formData,
            dateOfJoining: formatDateForStorage(formData.dateOfJoining),
            dateOfBirth: formatDateForStorage(formData.dateOfBirth),
        };
        onSubmit(dataToSubmit);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="p-6 border-b">
                        <h2 className="text-2xl font-bold text-slate-800">{staffMember ? 'Edit Hostel Staff' : 'Add Hostel Staff'}</h2>
                    </div>
                    <div className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
                        
                        <AccordionSection title="Personal & Contact Details" defaultOpen={true}>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-800">Full Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
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
                                <label className="block text-sm font-bold text-slate-800">Aadhaar No. (Optional)</label>
                                <input type="text" name="aadhaarNumber" value={formData.aadhaarNumber || ''} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
                            </div>
                             <div>
                                <label className="block text-sm font-bold text-slate-800">Blood Group (Optional)</label>
                                <select name="bloodGroup" value={formData.bloodGroup || ''} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                                    <option value="">-- Select --</option>
                                    {BLOOD_GROUP_LIST.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-800">Contact Number</label>
                                <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                            </div>
                             <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-800">Permanent Address (Optional)</label>
                                <textarea name="permanentAddress" value={formData.permanentAddress || ''} onChange={handleChange} rows={2} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-800">Profile Photo</label>
                                <div className="mt-2 flex items-center gap-4">
                                    <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border">
                                        {formData.photographUrl ? <img src={formData.photographUrl} alt="Staff preview" className="w-full h-full object-cover" /> : <UserIcon className="w-16 h-16 text-slate-600" />}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" id="hostel-staff-photo-upload" />
                                        <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-50 text-sm">Upload Photo</button>
                                        {formData.photographUrl && <button type="button" onClick={handleRemovePhoto} className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 font-semibold rounded-lg shadow-sm hover:bg-red-100 text-sm">Remove</button>}
                                    </div>
                                </div>
                            </div>
                        </AccordionSection>
                        
                        <AccordionSection title="Professional & Payroll Details">
                            <div>
                                <label className="block text-sm font-bold text-slate-800">Role</label>
                                <select name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                                    {HOSTEL_STAFF_ROLE_LIST.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-bold text-slate-800">Date of Joining</label>
                                <input type="text" placeholder="DD/MM/YYYY" pattern="\d{1,2}/\d{1,2}/\d{4}" name="dateOfJoining" value={formData.dateOfJoining} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800">Assigned Block (Optional)</label>
                                <select name="assignedBlock" value={formData.assignedBlock || ''} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                                    <option value="">-- Not Assigned --</option>
                                    {HOSTEL_BLOCK_LIST.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-bold text-slate-800">Duty Shift (Optional)</label>
                                <input type="text" name="dutyShift" value={formData.dutyShift || ''} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" placeholder="e.g., Morning (6 AM - 2 PM)" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800">Salary</label>
                                <input type="number" name="salary" value={formData.salary} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800">Payment Status</label>
                                <select name="paymentStatus" value={formData.paymentStatus} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                                    <option value={PaymentStatus.PAID}>Paid</option>
                                    <option value={PaymentStatus.PENDING}>Pending</option>
                                </select>
                            </div>
                        </AccordionSection>

                        <AccordionSection title="Qualifications & Expertise">
                            <div>
                                <label className="block text-sm font-bold text-slate-800">Highest Qualification</label>
                                <select name="qualification" value={formData.qualification || ''} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                                    <option value="">-- Not Specified --</option>
                                    {QUALIFICATION_LIST.map(q => <option key={q} value={q}>{q}</option>)}
                                </select>
                            </div>
                             <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-800">Expertise / Specialization</label>
                                <textarea name="expertise" value={formData.expertise || ''} onChange={handleChange} rows={2} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" placeholder="e.g., Plumbing, Electrical, Cooking" />
                            </div>
                        </AccordionSection>

                         <AccordionSection title="Emergency Contact">
                             <div>
                                <label className="block text-sm font-bold text-slate-800">Contact Name</label>
                                <input type="text" name="emergencyContactName" value={formData.emergencyContactName || ''} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800">Relationship</label>
                                <input type="text" name="emergencyContactRelationship" value={formData.emergencyContactRelationship || ''} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-800">Contact Number</label>
                                <input type="tel" name="emergencyContactNumber" value={formData.emergencyContactNumber || ''} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
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

export default HostelStaffFormModal;

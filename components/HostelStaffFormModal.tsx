

import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { HostelStaff, Gender, HostelStaffRole, HostelBlock, PaymentStatus } from '../types';
import { UserIcon } from './Icons';
import { GENDER_LIST, HOSTEL_STAFF_ROLE_LIST, HOSTEL_BLOCK_LIST } from '../constants';

interface HostelStaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (staffData: Omit<HostelStaff, 'id'>) => void;
  staffMember: HostelStaff | null;
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


const HostelStaffFormModal: React.FC<HostelStaffFormModalProps> = ({ isOpen, onClose, onSubmit, staffMember }) => {
    const getInitialFormData = (): Omit<HostelStaff, 'id'> => ({
        name: '',
        gender: Gender.MALE,
        role: HostelStaffRole.WARDEN,
        photographUrl: '',
        contactNumber: '',
        dateOfJoining: new Date().toISOString().split('T')[0],
        dutyShift: '',
        assignedBlock: undefined,
        salary: 0,
        // FIX: Used PaymentStatus enum member for type safety.
        paymentStatus: PaymentStatus.PENDING,
        attendancePercent: 100,
    });

    const [formData, setFormData] = useState(getInitialFormData());
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (staffMember) {
                setFormData({
                    ...getInitialFormData(),
                    ...staffMember,
                });
            } else {
                setFormData(getInitialFormData());
            }
        }
    }, [staffMember, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b">
                        <h2 className="text-2xl font-bold text-slate-800">{staffMember ? 'Edit Hostel Staff' : 'Add Hostel Staff'}</h2>
                    </div>
                    <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label htmlFor="name" className="block text-sm font-bold text-slate-800">Full Name</label>
                                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                            </div>
                            <div>
                                <label htmlFor="gender" className="block text-sm font-bold text-slate-800">Gender</label>
                                <select name="gender" id="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                                    {GENDER_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="role" className="block text-sm font-bold text-slate-800">Role</label>
                                <select name="role" id="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                                    {HOSTEL_STAFF_ROLE_LIST.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="contactNumber" className="block text-sm font-bold text-slate-800">Contact Number</label>
                                <input type="tel" name="contactNumber" id="contactNumber" value={formData.contactNumber} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                            </div>
                            <div>
                                <label htmlFor="dateOfJoining" className="block text-sm font-bold text-slate-800">Date of Joining</label>
                                <input type="text" placeholder="YYYY-MM-DD" pattern="\d{4}-\d{2}-\d{2}" name="dateOfJoining" id="dateOfJoining" value={formData.dateOfJoining} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                            </div>
                            <div>
                                <label htmlFor="dutyShift" className="block text-sm font-bold text-slate-800">Duty Shift (Optional)</label>
                                <input type="text" name="dutyShift" id="dutyShift" value={formData.dutyShift || ''} onChange={handleChange} placeholder="e.g., Morning (6 AM - 2 PM)" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
                            </div>
                            <div>
                                <label htmlFor="assignedBlock" className="block text-sm font-bold text-slate-800">Assigned Block (Optional)</label>
                                <select name="assignedBlock" id="assignedBlock" value={formData.assignedBlock || ''} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                                    <option value="">-- None --</option>
                                    {HOSTEL_BLOCK_LIST.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="salary" className="block text-sm font-bold text-slate-800">Salary (per month)</label>
                                <input type="number" name="salary" id="salary" value={formData.salary} onChange={handleChange} min="0" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
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
                        </div>
                    </div>
                    <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-xl border-t">
                        <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
                        <button type="submit" className="btn btn-primary">{staffMember ? 'Save Changes' : 'Add Staff'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HostelStaffFormModal;
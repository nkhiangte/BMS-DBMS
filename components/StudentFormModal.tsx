import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { Grade, Student, Gender, StudentStatus, Category, BloodGroup } from '../types';
import { GRADES_LIST, GENDER_LIST, CATEGORY_LIST, BLOOD_GROUP_LIST } from '../constants';
import { ChevronDownIcon, ChevronUpIcon, UserIcon } from './Icons';
import { formatDateForDisplay, formatDateForStorage } from '../utils';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (student: Omit<Student, 'id'>) => void;
  student: Student | null;
  newStudentTargetGrade?: Grade | null;
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
            {isOpen && <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>}
        </div>
    );
};

const StudentFormModal: React.FC<StudentFormModalProps> = ({ isOpen, onClose, onSubmit, student, newStudentTargetGrade }) => {
    const getInitialFormData = (): Omit<Student, 'id'> => ({
        rollNo: 0,
        name: '',
        grade: newStudentTargetGrade || GRADES_LIST[0],
        contact: '',
        photographUrl: '',
        dateOfBirth: '',
        gender: Gender.MALE,
        address: '',
        aadhaarNumber: '',
        pen: '',
        category: Category.GENERAL,
        religion: '',
        bloodGroup: undefined,
        cwsn: 'No',
        fatherName: '',
        fatherOccupation: '',
        fatherAadhaar: '',
        motherName: '',
        motherOccupation: '',
        motherAadhaar: '',
        guardianName: '',
        guardianRelationship: '',
        lastSchoolAttended: '',
        healthConditions: '',
        achievements: '',
        academicPerformance: [],
        status: StudentStatus.ACTIVE,
    });
    
    const [formData, setFormData] = useState(getInitialFormData());
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (student) {
                setFormData({
                    ...getInitialFormData(),
                    ...student,
                    dateOfBirth: formatDateForDisplay(student.dateOfBirth),
                });
            } else {
                setFormData(getInitialFormData());
            }
        }
    }, [student, isOpen, newStudentTargetGrade]);

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
            dateOfBirth: formatDateForStorage(formData.dateOfBirth),
        };
        onSubmit(dataToSubmit);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="p-6 border-b">
                        <h2 className="text-2xl font-bold text-slate-800">{student ? 'Edit Student Details' : 'Add New Student'}</h2>
                    </div>
                    <div className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
                        <AccordionSection title="Personal Details" defaultOpen={true}>
                            <div>
                                <label className="block text-sm font-bold text-slate-800">Full Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800">Date of Birth</label>
                                <input type="text" placeholder="DD/MM/YYYY" pattern="\d{1,2}/\d{1,2}/\d{4}" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800">Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                                    {GENDER_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800">Blood Group (Optional)</label>
                                <select name="bloodGroup" value={formData.bloodGroup || ''} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                                    <option value="">-- Select --</option>
                                    {BLOOD_GROUP_LIST.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-800">Photograph</label>
                                <div className="mt-2 flex items-center gap-4">
                                    <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border">
                                        {formData.photographUrl ? <img src={formData.photographUrl} alt="Student preview" className="w-full h-full object-cover" /> : <UserIcon className="w-16 h-16 text-slate-500" />}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" id="photo-upload-student" />
                                        <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-secondary">Upload Photo</button>
                                        {formData.photographUrl && <button type="button" onClick={handleRemovePhoto} className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 font-semibold rounded-lg shadow-sm hover:bg-red-100 text-sm">Remove</button>}
                                    </div>
                                </div>
                            </div>
                        </AccordionSection>
                        <AccordionSection title="Academic Details">
                            <div>
                                <label className="block text-sm font-bold text-slate-800">Grade</label>
                                <select name="grade" value={formData.grade} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm disabled:bg-slate-100" required disabled={!!newStudentTargetGrade}>
                                    {GRADES_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800">Roll Number</label>
                                <input type="number" name="rollNo" value={formData.rollNo} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                            </div>
                             <div>
                                <label className="block text-sm font-bold text-slate-800">Aadhaar Number</label>
                                <input type="text" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800">PEN (Permanent Education No.)</label>
                                <input type="text" name="pen" value={formData.pen} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800">Category</label>
                                <select name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                                    {CATEGORY_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-bold text-slate-800">Religion</label>
                                <input type="text" name="religion" value={formData.religion} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800">CWSN (Children with Special Needs)</label>
                                <select name="cwsn" value={formData.cwsn} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </div>
                        </AccordionSection>
                        <AccordionSection title="Contact & Address">
                            <div>
                                <label className="block text-sm font-bold text-slate-800">Contact Number</label>
                                <input type="tel" name="contact" value={formData.contact} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-800">Address</label>
                                <textarea name="address" value={formData.address} onChange={handleChange} rows={3} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                            </div>
                        </AccordionSection>
                         <AccordionSection title="Parent & Guardian Information">
                            <div>
                                <label className="block text-sm font-bold text-slate-800">Father's Name</label>
                                <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800">Father's Occupation</label>
                                <input type="text" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                            </div>
                             <div>
                                <label className="block text-sm font-bold text-slate-800">Father's Aadhaar</label>
                                <input type="text" name="fatherAadhaar" value={formData.fatherAadhaar} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800">Mother's Name</label>
                                <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800">Mother's Occupation</label>
                                <input type="text" name="motherOccupation" value={formData.motherOccupation} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                            </div>
                             <div>
                                <label className="block text-sm font-bold text-slate-800">Mother's Aadhaar</label>
                                <input type="text" name="motherAadhaar" value={formData.motherAadhaar} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" required />
                            </div>
                             <div>
                                <label className="block text-sm font-bold text-slate-800">Guardian's Name (Optional)</label>
                                <input type="text" name="guardianName" value={formData.guardianName} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
                            </div>
                             <div>
                                <label className="block text-sm font-bold text-slate-800">Guardian's Relationship (Optional)</label>
                                <input type="text" name="guardianRelationship" value={formData.guardianRelationship} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
                            </div>
                        </AccordionSection>
                         <AccordionSection title="Other Information (Optional)">
                             <div>
                                <label className="block text-sm font-bold text-slate-800">Last School Attended</label>
                                <input type="text" name="lastSchoolAttended" value={formData.lastSchoolAttended} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-800">Health Conditions</label>
                                <textarea name="healthConditions" value={formData.healthConditions} onChange={handleChange} rows={2} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
                            </div>
                             <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-800">Achievements</label>
                                <textarea name="achievements" value={formData.achievements} onChange={handleChange} rows={2} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
                            </div>
                        </AccordionSection>
                    </div>
                    <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-xl border-t">
                        <button type="button" onClick={onClose} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {student ? 'Save Changes' : 'Add Student'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentFormModal;

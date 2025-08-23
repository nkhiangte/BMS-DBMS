import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { Grade, Student, Gender, StudentStatus, Category, BloodGroup } from '../types';
import { GRADES_LIST, GENDER_LIST, CATEGORY_LIST, BLOOD_GROUP_LIST } from '../constants';
import { ChevronDownIcon, ChevronUpIcon, UserIcon } from './Icons';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (student: Omit<Student, 'id'>) => void;
  student: Student | null;
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


const StudentFormModal: React.FC<StudentFormModalProps> = ({ isOpen, onClose, onSubmit, student }) => {
  const getInitialFormData = (): Omit<Student, 'id'> => ({
    rollNo: 0,
    name: '',
    grade: Grade.NURSERY,
    photographUrl: '',
    contact: '',
    dateOfBirth: '',
    gender: Gender.MALE,
    address: '',
    aadhaarNumber: '',
    pen: '',
    category: Category.GENERAL,
    religion: '',
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
    status: StudentStatus.ACTIVE,
    bloodGroup: undefined,
    cwsn: 'No',
    achievements: '',
  });

  const [formData, setFormData] = useState(getInitialFormData());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (student) {
        setFormData({
            ...getInitialFormData(), // ensure all fields are present
            ...student,
            rollNo: student.rollNo || 0,
        });
      } else {
        setFormData(getInitialFormData());
      }
    }
  }, [student, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, photographUrl: reader.result as string }));
        };
        reader.readAsDataURL(file);
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
    const submissionData = {
        ...formData,
        rollNo: parseInt(String(formData.rollNo), 10) || 0,
        grade: formData.grade as Grade,
        gender: formData.gender as Gender,
        category: formData.category as Category,
        bloodGroup: formData.bloodGroup || undefined,
    };
    onSubmit(submissionData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
         <div className="p-6 border-b">
             <h2 className="text-2xl font-bold text-slate-800">{student ? 'Edit Student' : 'Add New Student'}</h2>
         </div>
          <div className="p-6 space-y-4 overflow-y-auto max-h-[90vh]">
            <AccordionSection title="Student Details" defaultOpen={true}>
              <div className="md:col-span-1">
                <label htmlFor="name" className="block text-sm font-bold text-slate-800">Full Name</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" required />
              </div>
              <div>
                <label htmlFor="rollNo" className="block text-sm font-bold text-slate-800">Roll No.</label>
                <input type="number" name="rollNo" id="rollNo" value={formData.rollNo} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" required />
              </div>
               <div>
                <label htmlFor="grade" className="block text-sm font-bold text-slate-800">Grade</label>
                <select name="grade" id="grade" value={formData.grade} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" required>
                  {GRADES_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-bold text-slate-800">Date of Birth</label>
                <input type="date" name="dateOfBirth" id="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" required />
              </div>
              <div>
                 <label htmlFor="gender" className="block text-sm font-bold text-slate-800">Gender</label>
                <select name="gender" id="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" required>
                  {GENDER_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
               <div>
                <label htmlFor="contact" className="block text-sm font-bold text-slate-800">Contact Number</label>
                <input type="tel" name="contact" id="contact" value={formData.contact} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" required />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-bold text-slate-800">Category</label>
                <select name="category" id="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" required>
                  {CATEGORY_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="religion" className="block text-sm font-bold text-slate-800">Religion</label>
                <input type="text" name="religion" id="religion" value={formData.religion} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" required />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-bold text-slate-800">Address</label>
                <textarea name="address" id="address" value={formData.address} onChange={handleChange} rows={3} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" required />
              </div>
               <div>
                <label htmlFor="aadhaarNumber" className="block text-sm font-bold text-slate-800">Aadhaar Number</label>
                <input type="text" name="aadhaarNumber" id="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" required />
              </div>
              <div>
                <label htmlFor="pen" className="block text-sm font-bold text-slate-800">Permanent Education No. (PEN)</label>
                <input type="text" name="pen" id="pen" value={formData.pen} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" required />
              </div>
               <div>
                <label htmlFor="bloodGroup" className="block text-sm font-bold text-slate-800">Blood Group</label>
                <select name="bloodGroup" id="bloodGroup" value={formData.bloodGroup || ''} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm">
                  <option value="">-- Select --</option>
                  {BLOOD_GROUP_LIST.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="cwsn" className="block text-sm font-bold text-slate-800">CWSN?</label>
                <select name="cwsn" id="cwsn" value={formData.cwsn} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm">
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-800">Student Photograph</label>
                <div className="mt-2 flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border">
                        {formData.photographUrl ? (
                            <img src={formData.photographUrl} alt="Student preview" className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="w-16 h-16 text-slate-500" />
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handlePhotoChange}
                            accept="image/png, image/jpeg, image/gif"
                            className="hidden"
                            id="photo-upload"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-50 text-sm"
                        >
                            Upload Photo
                        </button>
                        {formData.photographUrl && (
                            <button
                                type="button"
                                onClick={handleRemovePhoto}
                                className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 font-semibold rounded-lg shadow-sm hover:bg-red-100 text-sm"
                            >
                                Remove Photo
                            </button>
                        )}
                    </div>
                </div>
              </div>
            </AccordionSection>

            <AccordionSection title="Parent & Guardian Information">
                <div className="md:col-span-2 font-semibold text-slate-800">Father's Details</div>
                <div>
                    <label htmlFor="fatherName" className="block text-sm font-bold text-slate-800">Father's Name</label>
                    <input type="text" name="fatherName" id="fatherName" value={formData.fatherName} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" required />
                </div>
                <div>
                    <label htmlFor="fatherOccupation" className="block text-sm font-bold text-slate-800">Occupation</label>
                    <input type="text" name="fatherOccupation" id="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" required />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="fatherAadhaar" className="block text-sm font-bold text-slate-800">Aadhaar Number</label>
                    <input type="text" name="fatherAadhaar" id="fatherAadhaar" value={formData.fatherAadhaar} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" required />
                </div>
                
                <div className="md:col-span-2 mt-4 pt-4 border-t font-semibold text-slate-800">Mother's Details</div>
                 <div>
                    <label htmlFor="motherName" className="block text-sm font-bold text-slate-800">Mother's Name</label>
                    <input type="text" name="motherName" id="motherName" value={formData.motherName} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" required />
                </div>
                <div>
                    <label htmlFor="motherOccupation" className="block text-sm font-bold text-slate-800">Occupation</label>
                    <input type="text" name="motherOccupation" id="motherOccupation" value={formData.motherOccupation} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" required />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="motherAadhaar" className="block text-sm font-bold text-slate-800">Aadhaar Number</label>
                    <input type="text" name="motherAadhaar" id="motherAadhaar" value={formData.motherAadhaar} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" required />
                </div>

                <div className="md:col-span-2 mt-4 pt-4 border-t font-semibold text-slate-800">Guardian's Details (Optional)</div>
                 <div>
                    <label htmlFor="guardianName" className="block text-sm font-bold text-slate-800">Guardian's Name</label>
                    <input type="text" name="guardianName" id="guardianName" value={formData.guardianName} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="guardianRelationship" className="block text-sm font-bold text-slate-800">Relationship</label>
                    <input type="text" name="guardianRelationship" id="guardianRelationship" value={formData.guardianRelationship} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                </div>
            </AccordionSection>

            <AccordionSection title="Academic & Health Information">
                <div className="md:col-span-2">
                    <label htmlFor="lastSchoolAttended" className="block text-sm font-bold text-slate-800">Last School Attended (Optional)</label>
                    <input type="text" name="lastSchoolAttended" id="lastSchoolAttended" value={formData.lastSchoolAttended} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                </div>
                 <div className="md:col-span-2">
                    <label htmlFor="achievements" className="block text-sm font-bold text-slate-800">Achievements (Optional)</label>
                    <textarea name="achievements" id="achievements" value={formData.achievements} onChange={handleChange} rows={2} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                </div>
                 <div className="md:col-span-2">
                    <label htmlFor="healthConditions" className="block text-sm font-bold text-slate-800">Health Conditions (Optional)</label>
                    <textarea name="healthConditions" id="healthConditions" value={formData.healthConditions} onChange={handleChange} rows={3} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                </div>
            </AccordionSection>
          </div>
          <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-xl border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition">
              {student ? 'Save Changes' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentFormModal;
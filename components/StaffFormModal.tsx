
import React, { useState, useEffect, FormEvent } from 'react';
// FIX: Added missing type imports from '../types' to align with Staff interface.
import { Staff, Grade, GradeDefinition, Gender, MaritalStatus, Designation, Qualification, BloodGroup, Department, EmployeeType, EmploymentStatus } from '../types';

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (staffData: Omit<Staff, 'id'>, assignedGradeKey: Grade | null) => Promise<void>; // async save
  staffMember: Staff | null;
  allStaff: Staff[];
  gradeDefinitions: Record<Grade, GradeDefinition>;
}

// FIX: Copied from StudentFormModal.tsx to handle image resizing locally.
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


const StaffFormModal: React.FC<StaffFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  staffMember,
  gradeDefinitions,
}) => {
  // ---------- Initial Data ----------
  // FIX: Corrected and completed initial form data to match the 'Staff' interface from types.ts.
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

  // ---------- State ----------
  const [formData, setFormData] = useState<Omit<Staff, 'id'>>(getInitialFormData());
  const [assignedGrade, setAssignedGrade] = useState<Grade | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---------- Prefill when editing ----------
  useEffect(() => {
    if (staffMember) {
      // FIX: Ensure all fields from the Staff type are present when setting form data.
      setFormData({
        ...getInitialFormData(),
        ...staffMember,
      });
      // FIX: Property 'assignedGrade' does not exist on type 'Staff'. Look up assigned grade from gradeDefinitions.
      const assignedGradeKey = Object.keys(gradeDefinitions).find(
        (g) => gradeDefinitions[g as Grade]?.classTeacherId === staffMember.id
      ) as Grade | null;
      setAssignedGrade(assignedGradeKey || '');
    } else {
      setFormData(getInitialFormData());
      setAssignedGrade('');
    }
  }, [staffMember, gradeDefinitions]);

  if (!isOpen) return null;

  // ---------- Handlers ----------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => {
      let finalValue: any = value;

      // FIX: Handle number inputs correctly to avoid setting null on required number fields.
      if (type === 'number') {
        const parsed = parseInt(value, 10);
        if (name === 'basicSalary') {
            finalValue = isNaN(parsed) ? undefined : parsed;
        } else { // for yearsOfExperience
            finalValue = isNaN(parsed) ? 0 : parsed;
        }
      }

      const newState = { ...prev, [name]: finalValue };

      if (name === 'staffType') {
        newState.designation = value === 'Teaching' ? Designation.TEACHER : Designation.CLERK;
      }

      return newState;
    });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      try {
        const file = e.target.files[0];
        // FIX: Replaced call to non-existent 'compressAndUploadImage' with local 'resizeImage'.
        const resizedDataUrl = await resizeImage(file, 512, 512, 0.8);
        setFormData((prev) => ({ ...prev, photographUrl: resizedDataUrl }));
      } catch (error) {
        console.error('Image processing failed:', error);
        alert('Failed to process photo. Please try a different image.');
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const finalData = { ...formData };

    // Teaching/Non-Teaching cleanup
    if (finalData.staffType === 'Non-Teaching') {
      finalData.subjectsTaught = [];
    }

    setIsSubmitting(true);
    try {
      await onSubmit(finalData, assignedGrade ? (assignedGrade as Grade) : null);
      onClose(); // ✅ only close on success
    } catch (err) {
      console.error('Failed to save staff:', err);
      alert('Error saving staff. Please check inputs and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------- Render ----------
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">
            {staffMember ? 'Edit Staff Member' : 'Add New Staff'}
          </h2>
        </div>

        {/* Form */}
        <form id="staff-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* FIX: Replaced 'fullName' with 'firstName' and 'lastName' fields. */}
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
              >
                {Object.values(Gender).map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Marital Status */}
            <div>
              <label className="block text-sm font-medium mb-1">Marital Status</label>
              <select
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
              >
                {Object.values(MaritalStatus).map((ms) => (
                  <option key={ms} value={ms}>
                    {ms}
                  </option>
                ))}
              </select>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
              />
            </div>

            {/* Date of Joining */}
            <div>
              <label className="block text-sm font-medium mb-1">Date of Joining</label>
              <input
                type="date"
                name="dateOfJoining"
                value={formData.dateOfJoining}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
              />
            </div>

            {/* Nationality */}
            <div>
              <label className="block text-sm font-medium mb-1">Nationality</label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
              />
            </div>

            {/* Staff Type */}
            <div>
              <label className="block text-sm font-medium mb-1">Staff Type</label>
              <select
                name="staffType"
                value={formData.staffType}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
              >
                <option value="Teaching">Teaching</option>
                <option value="Non-Teaching">Non-Teaching</option>
              </select>
            </div>

            {/* Designation */}
            <div>
              <label className="block text-sm font-medium mb-1">Designation</label>
              <select
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
              >
                {Object.values(Designation).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Specialization */}
            <div>
              <label className="block text-sm font-medium mb-1">Specialization</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
              />
            </div>

            {/* FIX: Renamed 'qualifications' to 'educationalQualification' and made it a select dropdown. */}
            <div>
              <label className="block text-sm font-medium mb-1">Highest Qualification</label>
              <select
                name="educationalQualification"
                value={formData.educationalQualification}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
              >
                {Object.values(Qualification).map((q) => (
                    <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-sm font-medium mb-1">Contact Number</label>
              <input
                type="text"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
              />
            </div>

            {/* FIX: Renamed 'email' to 'emailAddress'. */}
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
              />
            </div>

            {/* Years of Experience */}
            <div>
              <label className="block text-sm font-medium mb-1">Years of Experience</label>
              <input
                type="number"
                name="yearsOfExperience"
                value={formData.yearsOfExperience ?? ''}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
              />
            </div>

            {/* Basic Salary */}
            <div>
              <label className="block text-sm font-medium mb-1">Basic Salary</label>
              <input
                type="number"
                name="basicSalary"
                value={formData.basicSalary ?? ''}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
              />
            </div>

            {/* FIX: Removed obsolete fields: allowances, deductions, netSalary. */}

            {/* Assigned Grade */}
            <div>
              <label className="block text-sm font-medium mb-1">Assigned Grade</label>
              <select
                value={assignedGrade}
                onChange={(e) => setAssignedGrade(e.target.value as Grade)}
                className="w-full border rounded-lg p-2"
              >
                <option value="">None</option>
                {Object.keys(gradeDefinitions).map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>

            {/* FIX: Replaced 'address' with 'currentAddress' and 'permanentAddress'. */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Current Address</label>
              <textarea
                name="currentAddress"
                value={formData.currentAddress}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Permanent Address</label>
              <textarea
                name="permanentAddress"
                value={formData.permanentAddress}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
                rows={3}
              />
            </div>

            {/* Photograph */}
            <div>
              <label className="block text-sm font-medium mb-1">Photograph</label>
              <input type="file" accept="image/*" onChange={handlePhotoChange} />
              {formData.photographUrl && (
                <img
                  src={formData.photographUrl}
                  alt="Staff"
                  className="mt-2 w-24 h-24 object-cover rounded"
                />
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border bg-gray-100 hover:bg-gray-200"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="staff-form"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffFormModal;

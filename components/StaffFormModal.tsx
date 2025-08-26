import React, { useState, useEffect, FormEvent } from 'react';
import { Staff, Grade, GradeDefinition, Gender, MaritalStatus, Designation } from '../types';
import { compressAndUploadImage } from '../utils/imageUtils';

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (staffData: Omit<Staff, 'id'>, assignedGradeKey: Grade | null) => Promise<void>; // async save
  staffMember: Staff | null;
  allStaff: Staff[];
  gradeDefinitions: Record<Grade, GradeDefinition>;
}

const StaffFormModal: React.FC<StaffFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  staffMember,
  gradeDefinitions,
}) => {
  // ---------- Initial Data ----------
  const getInitialFormData = (): Omit<Staff, 'id'> => ({
    fullName: '',
    gender: Gender.MALE,
    maritalStatus: MaritalStatus.SINGLE,
    dateOfBirth: '',
    dateOfJoining: '',
    nationality: '',
    designation: Designation.TEACHER,
    specialization: '',
    qualifications: '',
    contactNumber: '',
    email: '',
    subjectsTaught: [],
    yearsOfExperience: null,
    staffType: 'Teaching',
    photographUrl: '',
    basicSalary: null, // ✅ no undefined
    allowances: 0,
    deductions: 0,
    netSalary: 0,
    address: '',
  });

  // ---------- State ----------
  const [formData, setFormData] = useState<Omit<Staff, 'id'>>(getInitialFormData());
  const [assignedGrade, setAssignedGrade] = useState<Grade | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---------- Prefill when editing ----------
  useEffect(() => {
    if (staffMember) {
      setFormData({
        ...staffMember,
        yearsOfExperience:
          staffMember.yearsOfExperience === undefined ? null : staffMember.yearsOfExperience,
        basicSalary: staffMember.basicSalary ?? null,
      });
      setAssignedGrade(staffMember.assignedGrade || '');
    } else {
      setFormData(getInitialFormData());
      setAssignedGrade('');
    }
  }, [staffMember]);

  if (!isOpen) return null;

  // ---------- Handlers ----------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => {
      let finalValue: string | number | null = value;

      if (type === 'number') {
        finalValue = value === '' ? null : Number(value); // ✅ null instead of 0
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
        const url = await compressAndUploadImage(file);
        setFormData((prev) => ({ ...prev, photographUrl: url }));
      } catch (error) {
        console.error('Image upload failed:', error);
        alert('Failed to upload photo. Please try again.');
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
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

            {/* Qualifications */}
            <div>
              <label className="block text-sm font-medium mb-1">Qualifications</label>
              <input
                type="text"
                name="qualifications"
                value={formData.qualifications}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
              />
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

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
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

            {/* Allowances */}
            <div>
              <label className="block text-sm font-medium mb-1">Allowances</label>
              <input
                type="number"
                name="allowances"
                value={formData.allowances}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
              />
            </div>

            {/* Deductions */}
            <div>
              <label className="block text-sm font-medium mb-1">Deductions</label>
              <input
                type="number"
                name="deductions"
                value={formData.deductions}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
              />
            </div>

            {/* Net Salary */}
            <div>
              <label className="block text-sm font-medium mb-1">Net Salary</label>
              <input
                type="number"
                name="netSalary"
                value={formData.netSalary}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
              />
            </div>

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

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Address</label>
              <textarea
                name="address"
                value={formData.address}
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

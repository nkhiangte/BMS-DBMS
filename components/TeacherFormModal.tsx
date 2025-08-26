import React, { useState, useEffect, FormEvent } from "react";
import { Staff, Grade, Gender, MaritalStatus } from "../types";

interface StaffFormModalProps {
  staff: Staff | null;
  grades: Grade[];
  onClose: () => void;
  onSubmit: (
    staffData: Omit<Staff, "id">,
    assignedGrade: Grade | null
  ) => Promise<void>; // ✅ expect async function
}

const StaffFormModal: React.FC<StaffFormModalProps> = ({
  staff,
  grades,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<Omit<Staff, "id">>({
    name: "",
    gender: "Male",
    maritalStatus: "Single",
    position: "",
    basicSalary: null,
  });
  const [assignedGrade, setAssignedGrade] = useState<Grade | null>(null);

  // ✅ load existing staff into form when editing
  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name ?? "",
        gender: staff.gender ?? "Male",
        maritalStatus: staff.maritalStatus ?? "Single",
        position: staff.position ?? "",
        basicSalary: staff.basicSalary ?? null,
      });
      setAssignedGrade(staff.assignedGrade ?? null);
    }
  }, [staff]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "basicSalary"
          ? value === "" ? null : Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const submissionData: Omit<Staff, "id"> = {
      ...formData,
      basicSalary:
        formData.basicSalary == null || isNaN(Number(formData.basicSalary))
          ? null
          : Number(formData.basicSalary),
    };

    try {
      await onSubmit(submissionData, assignedGrade);
      onClose(); // ✅ only close if success
    } catch (error) {
      console.error("Failed to save staff:", error);
      alert("Failed to save staff. Please check inputs and try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col"
        onClick={(e) => e.stopPropagation()} // ✅ prevent accidental close
      >
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {staff ? "Edit Staff" : "Add Staff"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
            >
              {Object.values(Gender).map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Marital Status</label>
            <select
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
            >
              {Object.values(MaritalStatus).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Position</label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Basic Salary</label>
            <input
              type="number"
              name="basicSalary"
              value={formData.basicSalary ?? ""}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Assigned Grade</label>
            <select
              value={assignedGrade?.id || ""}
              onChange={(e) =>
                setAssignedGrade(
                  grades.find((g) => g.id === e.target.value) || null
                )
              }
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
            >
              <option value="">None</option>
              {grades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {staff ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffFormModal;

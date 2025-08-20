
import React from 'react';
import { Link } from 'react-router-dom';
import { Student } from '../types';
import { EditIcon, TrashIcon } from './Icons';
import { formatStudentId } from '../utils';

interface StudentTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  academicYear: string;
}

const StudentTable: React.FC<StudentTableProps> = ({ students, onEdit, onDelete, academicYear }) => {
  if (students.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
        <p className="text-slate-700 text-lg font-semibold">No student records found.</p>
        <p className="text-slate-600 mt-2">Try adjusting your search or filter.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Student ID</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Grade</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Parent's Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">Contact</th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {students.map(student => (
            <tr key={student.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{formatStudentId(student, academicYear)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                <Link to={`/student/${student.id}`} className="hover:underline text-sky-700 font-semibold">
                  {student.name}
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{student.grade}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{student.fatherName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{student.contact}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-4">
                  <button onClick={() => onEdit(student)} className="text-sky-600 hover:text-sky-800 transition-colors" title="Edit">
                    <EditIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => onDelete(student)} className="text-red-600 hover:text-red-800 transition-colors" title="Delete">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;
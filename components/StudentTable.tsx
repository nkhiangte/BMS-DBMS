import React from 'react';
import { Link } from 'react-router-dom';
import { Student } from '../types';
import { EditIcon } from './Icons';
import { formatStudentId } from '../utils';

interface StudentTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  academicYear: string;
}

const StudentTable: React.FC<StudentTableProps> = ({ students, onEdit, academicYear }) => {
  if (students.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
        <p className="text-slate-700 text-lg font-semibold">No student records found.</p>
        <p className="text-slate-600 mt-2">Try adjusting your search or filter.</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {students.map(student => (
          <div key={student.id} className="bg-slate-50 rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <Link to={`/student/${student.id}`} className="font-bold text-lg text-sky-700 hover:underline">
                  {student.name}
                </Link>
                <p className="text-sm text-slate-600">{student.grade}</p>
                <p className="text-sm font-mono text-slate-800">{formatStudentId(student, academicYear)}</p>
              </div>
              <button onClick={() => onEdit(student)} className="p-2 text-sky-600 hover:bg-sky-100 rounded-full flex-shrink-0" title="Edit">
                <EditIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200 space-y-1 text-sm">
              <p><span className="font-semibold text-slate-700">Parent:</span> {student.fatherName}</p>
              <p><span className="font-semibold text-slate-700">Contact:</span> {student.contact}</p>
            </div>
          </div>
        ))}
      </div>
    
      {/* Desktop Table View */}
      <div className="overflow-x-auto hidden md:block">
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default StudentTable;
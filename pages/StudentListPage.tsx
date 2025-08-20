import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Student } from '../types';
import { GRADES_LIST } from '../constants';
import StudentTable from '../components/StudentTable';
import { PlusIcon, SearchIcon, HomeIcon, BackIcon } from '../components/Icons';

interface StudentListPageProps {
  students: Student[];
  onAdd: () => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  academicYear: string;
}

const StudentListPage: React.FC<StudentListPageProps> = ({ students, onAdd, onEdit, onDelete, academicYear }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('');
  const navigate = useNavigate();

  const filteredStudents = useMemo(() => {
    return students
      .filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(student => (gradeFilter ? student.grade === gradeFilter : true));
  }, [students, searchTerm, gradeFilter]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors"
        >
          <BackIcon className="w-5 h-5" />
          Back
        </button>
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          title="Go to Home/Dashboard"
        >
          <HomeIcon className="w-5 h-5" />
          <span>Home</span>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <h2 className="text-2xl font-bold text-slate-800 md:flex-grow">
          Active Students
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition placeholder:text-slate-500"
              aria-label="Search students by name"
            />
          </div>

          {/* Grade Filter */}
          <select
            value={gradeFilter}
            onChange={e => setGradeFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition"
            aria-label="Filter students by grade"
          >
            <option value="">All Grades</option>
            {GRADES_LIST.map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>

          {/* Add Student Button */}
          <button
            onClick={onAdd}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition hover:-translate-y-0.5"
          >
            <PlusIcon className="h-5 w-5" />
            Add Student
          </button>
        </div>
      </div>
      <StudentTable
        students={filteredStudents}
        onEdit={onEdit}
        onDelete={onDelete}
        academicYear={academicYear}
      />
    </div>
  );
};

export default StudentListPage;


import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Student, User, Role, Grade } from '../types';
import { formatStudentId } from '../utils';
import { BackIcon, HomeIcon, SearchIcon } from '../components/Icons';
import { GRADES_LIST, TERMINAL_EXAMS } from '../constants';

interface ReportSearchPageProps {
  students: Student[];
  academicYear: string;
  user: User;
  teacherAssignedGrade: Grade | null;
}

const ReportSearchPage: React.FC<ReportSearchPageProps> = ({ students, academicYear, user, teacherAssignedGrade }) => {
  const [studentIdInput, setStudentIdInput] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState('');

  useEffect(() => {
    if (user.role === Role.TEACHER && teacherAssignedGrade) {
        setSelectedClass(teacherAssignedGrade);
    }
  }, [user, teacherAssignedGrade]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!studentIdInput) {
      setError('Please enter a Student ID.');
      return;
    }

    const foundStudent = students.find(s => formatStudentId(s, academicYear).toLowerCase() === studentIdInput.toLowerCase());

    if (foundStudent) {
      navigate(`/report-card/${foundStudent.id}`);
    } else {
      setError('No active student found with this ID in your assigned class. Please check and try again.');
    }
  };

  const handleViewStatement = (e: React.FormEvent) => {
    e.preventDefault();
    if(selectedClass && selectedExam) {
      navigate(`/reports/class-statement/${encodeURIComponent(selectedClass)}/${selectedExam}`);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
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

      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-800">Generate Progress Report</h1>
        <p className="text-slate-600 mt-2">Search for an individual student or generate a mark statement for an entire class.</p>
      </div>

      {/* Individual search */}
      <form onSubmit={handleSearch} className="mt-8 max-w-lg mx-auto">
        <label htmlFor="student-id-input" className="block text-sm font-bold text-slate-800 mb-2">Search Individual Student Report</label>
        <div className="flex gap-2 items-start">
            <div className="flex-grow">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        id="student-id-input"
                        type="text"
                        placeholder="Enter Student ID e.g., BMS250501"
                        value={studentIdInput}
                        onChange={e => setStudentIdInput(e.target.value.toUpperCase())}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                        autoFocus
                    />
                </div>
                 {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            <button
                type="submit"
                className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 h-[42px]"
            >
                Find Report
            </button>
        </div>
      </form>
      
      {/* Class-wise Statement */}
      <div className="mt-12 pt-8 border-t-2 border-dashed">
          <h2 className="text-2xl font-bold text-slate-800 text-center">Class-wise Statement of Marks</h2>
          <p className="text-slate-600 mt-2 text-center">View a consolidated mark sheet for an entire class and examination.</p>
          <form onSubmit={handleViewStatement} className="mt-8 max-w-xl mx-auto flex flex-col sm:flex-row gap-4 items-center">
              <select 
                  value={selectedClass} 
                  onChange={e => setSelectedClass(e.target.value)} 
                  required
                  disabled={user.role === Role.TEACHER}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:bg-slate-100"
              >
                  {user.role === Role.TEACHER && teacherAssignedGrade ? (
                    <option value={teacherAssignedGrade}>{teacherAssignedGrade}</option>
                  ) : (
                    <>
                      <option value="">Select Class</option>
                      {GRADES_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                    </>
                  )}
              </select>
              <select 
                  value={selectedExam} 
                  onChange={e => setSelectedExam(e.target.value)} 
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              >
                  <option value="">Select Exam</option>
                  {TERMINAL_EXAMS.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
              <button
                  type="submit"
                  disabled={!selectedClass || !selectedExam}
                  className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 h-[42px] disabled:bg-slate-400 disabled:cursor-not-allowed transition"
              >
                  View Statement
              </button>
          </form>
      </div>

    </div>
  );
};

export default ReportSearchPage;

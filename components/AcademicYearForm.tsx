import React, { useState } from 'react';

interface AcademicYearFormProps {
  onSetAcademicYear: (year: string) => void;
}

const AcademicYearForm: React.FC<AcademicYearFormProps> = ({ onSetAcademicYear }) => {
  const [year, setYear] = useState('');
  const [error, setError] = useState('');

  const validateYear = (input: string): boolean => {
    return /^\d{4}-\d{4}$/.test(input);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateYear(year)) {
      setError('');
      onSetAcademicYear(year);
    } else {
      setError('Please use the format YYYY-YYYY (e.g., 2024-2025).');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md p-4">
        <div className="bg-white shadow-xl rounded-2xl px-8 pt-8 pb-8">
          <div className="mb-8 text-center">
            <div className="mx-auto text-4xl p-4 mb-4 inline-block bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl font-bold shadow-lg">
              🗓️
            </div>
            <h1 className="text-3xl font-bold text-slate-800">Set Academic Year</h1>
            <p className="text-slate-500 mt-2">Please enter the current academic year to continue.</p>
          </div>
          {error && (
            <p className="bg-red-100 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-r-lg relative mb-4" role="alert">
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="academicYear">
                Academic Year
              </label>
              <input
                className="shadow-sm appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                id="academicYear"
                type="text"
                placeholder="e.g., 2024-2025"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="flex items-center justify-between mt-6">
              <button
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors"
                type="submit"
              >
                Set Year & Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AcademicYearForm;
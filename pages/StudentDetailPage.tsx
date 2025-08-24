
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Student } from '../types';
import { BackIcon, EditIcon, UserIcon, AcademicCapIcon, DocumentReportIcon, HomeIcon, CurrencyDollarIcon, CheckCircleIcon, XCircleIcon } from '../components/Icons';
import { formatStudentId, calculateDues } from '../utils';

interface StudentDetailPageProps {
  students: Student[];
  onEdit: (student: Student) => void;
  academicYear: string;
}

const PhotoWithFallback: React.FC<{src?: string, alt: string}> = ({ src, alt }) => {
    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.onerror = null; // Prevent infinite loop
        e.currentTarget.style.display = 'none'; // Hide the broken image
        const parent = e.currentTarget.parentElement;
        if(parent) {
            const fallback = parent.querySelector('.fallback-icon');
            if(fallback) {
                (fallback as HTMLElement).style.display = 'flex';
            }
        }
    };

    return (
        <div className="relative w-full h-full bg-slate-200 rounded-full flex items-center justify-center">
             {src && <img src={src} alt={alt} className="h-full w-full object-cover rounded-full" onError={handleError} />}
            <div className={`fallback-icon absolute inset-0 items-center justify-center text-slate-500 ${src ? 'hidden' : 'flex'}`}>
                <UserIcon className="w-2/3 h-2/3" />
            </div>
        </div>
    )
}

const DetailItem: React.FC<{label: string, value?: string | number}> = ({ label, value }) => {
    if (!value && value !== 0) return null;
    return (
         <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <dt className="text-sm font-medium text-slate-600">{label}</dt>
            <dd className="mt-1 text-md font-semibold text-slate-900">{value}</dd>
        </div>
    )
}

const DetailSection: React.FC<{title: string, children: React.ReactNode}> = ({ title, children}) => (
    <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 border-b-2 border-slate-200 pb-2 mb-4">{title}</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            {children}
        </dl>
    </div>
)


const StudentDetailPage: React.FC<StudentDetailPageProps> = ({ students, onEdit, academicYear }) => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  
  const student = students.find(s => s.id === studentId);

  if (!student) {
    return (
        <div className="text-center bg-white p-10 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-red-600">Student Not Found</h2>
            <p className="text-slate-700 mt-2">The requested student profile does not exist.</p>
            <button
                onClick={() => navigate('/')}
                className="mt-6 flex items-center mx-auto justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition"
            >
                <BackIcon className="w-5 h-5" />
                Return to Dashboard
            </button>
        </div>
    );
  }
  
  const formattedStudentId = formatStudentId(student, academicYear);
  const dues = calculateDues(student);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex justify-between items-center">
             <button
                onClick={() => navigate('/students')}
                className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors"
            >
                <BackIcon className="w-5 h-5" />
                Back to Student List
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
      <div className="flex flex-col md:flex-row gap-8 items-start pb-6 mb-6 border-b border-slate-200">
        <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full shadow-lg border-4 border-white flex-shrink-0 mx-auto md:mx-0">
            <PhotoWithFallback src={student.photographUrl} alt={`${student.name}'s photograph`} />
        </div>
        <div className="text-center md:text-left flex-grow">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">{student.name}</h1>
          <p className="text-slate-700 text-lg mt-1">{student.grade} - ID: <span className="font-semibold">{formattedStudentId}</span></p>
           <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
             <button
                onClick={() => onEdit(student)}
                className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition hover:-translate-y-0.5"
              >
                <EditIcon className="h-5 w-5" />
                Edit Profile
              </button>
               <Link
                to={`/report-card/${student.id}`}
                className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition hover:-translate-y-0.5"
              >
                <DocumentReportIcon className="h-5 w-5" />
                Report Card
              </Link>
              <Link
                to={`/student/${student.id}/academics`}
                className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition hover:-translate-y-0.5"
              >
                <AcademicCapIcon className="h-5 w-5" />
                Academics
              </Link>
           </div>
        </div>
      </div>
      
      <div>
          <DetailSection title="Personal Information">
              <DetailItem label="Student ID" value={formattedStudentId} />
              <DetailItem label="Permanent Education Number (PEN)" value={student.pen} />
              <DetailItem label="Date of Birth" value={student.dateOfBirth} />
              <DetailItem label="Gender" value={student.gender} />
              <DetailItem label="Aadhaar Number" value={student.aadhaarNumber} />
              <DetailItem label="Contact Number" value={student.contact} />
              <DetailItem label="Blood Group" value={student.bloodGroup} />
              <DetailItem label="CWSN" value={student.cwsn} />
              <div className="sm:col-span-2 lg:col-span-3">
                <DetailItem label="Address" value={student.address} />
              </div>
          </DetailSection>

          <DetailSection title="Parent & Guardian Information">
              <DetailItem label="Father's Name" value={student.fatherName} />
              <DetailItem label="Father's Occupation" value={student.fatherOccupation} />
              <DetailItem label="Father's Aadhaar" value={student.fatherAadhaar} />

              <DetailItem label="Mother's Name" value={student.motherName} />
              <DetailItem label="Mother's Occupation" value={student.motherOccupation} />
              <DetailItem label="Mother's Aadhaar" value={student.motherAadhaar} />

              <DetailItem label="Guardian's Name" value={student.guardianName} />
              <DetailItem label="Relationship with Guardian" value={student.guardianRelationship} />
          </DetailSection>

          <DetailSection title="Fee & Payment Status">
              <div className="sm:col-span-3">
                  {dues.length === 0 ? (
                      <div className="bg-emerald-50 text-emerald-800 p-4 rounded-lg flex items-center gap-3 border-l-4 border-emerald-500 shadow-sm">
                          <CheckCircleIcon className="w-6 h-6" />
                          <span className="font-semibold text-lg">All dues cleared.</span>
                      </div>
                  ) : (
                      <div className="bg-amber-50 text-amber-800 p-4 rounded-lg border-l-4 border-amber-500 shadow-sm">
                          <div className="flex items-center gap-3">
                              <XCircleIcon className="w-6 h-6 text-amber-600" />
                              <span className="font-semibold text-lg">Pending Dues Found</span>
                          </div>
                          <ul className="list-disc pl-10 mt-2 text-md">
                              {dues.map((due, index) => <li key={index}>{due}</li>)}
                          </ul>
                      </div>
                  )}
                  <div className="mt-4">
                      <Link to="/fees" className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 text-white font-semibold rounded-lg shadow-md hover:bg-violet-700 transition hover:-translate-y-0.5">
                          <CurrencyDollarIcon className="w-5 h-5" />
                          Go to Fee Management
                      </Link>
                  </div>
              </div>
          </DetailSection>

          <DetailSection title="Academic & Health">
              <DetailItem label="Last School Attended" value={student.lastSchoolAttended} />
              <div className="sm:col-span-2 lg:col-span-3">
                <DetailItem label="Achievements" value={student.achievements} />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <DetailItem label="Health Conditions" value={student.healthConditions} />
              </div>
          </DetailSection>
      </div>

    </div>
  );
};

export default StudentDetailPage;

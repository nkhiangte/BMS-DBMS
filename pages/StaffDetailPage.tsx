import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Staff, Grade, GradeDefinition, EmploymentStatus } from '../types';
import { BackIcon, EditIcon, UserIcon, HomeIcon, MailIcon, PhoneIcon, BriefcaseIcon, AcademicCapIcon, CurrencyDollarIcon, BookOpenIcon } from '../components/Icons';
import { formatDateForDisplay } from '../utils';

interface StaffDetailPageProps {
  staff: Staff[];
  onEdit: (staffMember: Staff) => void;
  gradeDefinitions: Record<Grade, GradeDefinition>;
}

const PhotoWithFallback: React.FC<{src?: string, alt: string}> = ({ src, alt }) => {
    const [hasError, setHasError] = useState(!src);

    useEffect(() => {
        setHasError(!src);
    }, [src]);

    const handleError = () => {
        setHasError(true);
    };

    return (
        <div className="relative w-full h-full bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
            {hasError ? (
                <div className="flex items-center justify-center text-slate-600 w-full h-full">
                    <UserIcon className="w-2/3 h-2/3" />
                </div>
            ) : (
                 <img src={src} alt={alt} className="h-full w-full object-cover" onError={handleError} />
            )}
        </div>
    )
}

const DetailItem: React.FC<{label: string, value?: string | number | null, children?: React.ReactNode}> = ({ label, value, children }) => {
    if (!value && !children) return null;
    return (
         <div className="bg-slate-50 p-3 rounded-lg">
            <dt className="text-sm font-semibold text-slate-700">{label}</dt>
            <dd className="mt-1 text-md font-bold text-slate-900">{value || children}</dd>
        </div>
    )
}

const DetailSection: React.FC<{title: string, children: React.ReactNode}> = ({ title, children}) => (
    <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">{title}</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            {children}
        </dl>
    </div>
)


const StaffDetailPage: React.FC<StaffDetailPageProps> = ({ staff, onEdit, gradeDefinitions }) => {
  const { staffId } = useParams<{ staffId: string }>();
  const navigate = useNavigate();
  
  const staffMember = staff.find(s => s.id === staffId);

  const assignedClass = useMemo(() => {
    if (!staffMember) return null;
    const entry = Object.entries(gradeDefinitions).find(([, def]) => def.classTeacherId === staffMember.id);
    return entry ? entry[0] as Grade : null;
  }, [staffMember, gradeDefinitions]);


  if (!staffMember) {
    return (
        <div className="text-center bg-white p-10 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-red-600">Staff Member Not Found</h2>
            <p className="text-slate-700 mt-2">The requested staff profile does not exist.</p>
            <button
                onClick={() => navigate('/staff')}
                className="mt-6 flex items-center mx-auto justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition"
            >
                <BackIcon className="w-5 h-5" />
                Return to Staff List
            </button>
        </div>
    );
  }
  
  const statusStyles = {
    [EmploymentStatus.ACTIVE]: 'bg-emerald-100 text-emerald-800',
    [EmploymentStatus.ON_LEAVE]: 'bg-amber-100 text-amber-800',
    [EmploymentStatus.RESIGNED]: 'bg-rose-100 text-rose-800',
    [EmploymentStatus.RETIRED]: 'bg-slate-200 text-slate-700',
  };
  const statusStyle = statusStyles[staffMember.status] || statusStyles[EmploymentStatus.RETIRED];

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
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
      <div className="flex flex-col md:flex-row gap-8 items-start pb-6 mb-6 border-b">
        <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full shadow-lg border-4 border-white flex-shrink-0 mx-auto md:mx-0">
            <PhotoWithFallback src={staffMember.photographUrl} alt={`${staffMember.firstName}'s photograph`} />
        </div>
        <div className="text-center md:text-left flex-grow">
          <h1 className="text-4xl font-bold text-slate-900">{staffMember.firstName} {staffMember.lastName}</h1>
          <p className="text-sky-700 text-xl font-semibold mt-1">{staffMember.designation}</p>
          <p className="text-slate-700 text-lg mt-1">{staffMember.department}</p>
          <div className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-md font-semibold ${statusStyle}`}>
            {staffMember.status}
          </div>
           <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
             <button
                onClick={() => onEdit(staffMember)}
                className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition"
              >
                <EditIcon className="h-5 h-5" />
                Edit Profile
              </button>
           </div>
        </div>
      </div>
      
      <div>
          <DetailSection title="Personal Details">
              <DetailItem label="Employee ID" value={staffMember.employeeId} />
              <DetailItem label="Date of Birth" value={formatDateForDisplay(staffMember.dateOfBirth)} />
              <DetailItem label="Gender" value={staffMember.gender} />
              <DetailItem label="Marital Status" value={staffMember.maritalStatus} />
              <DetailItem label="Nationality" value={staffMember.nationality} />
              <DetailItem label="Blood Group" value={staffMember.bloodGroup} />
              <DetailItem label="Aadhaar Number" value={staffMember.aadhaarNumber} />
          </DetailSection>

          <DetailSection title="Contact Information">
              <DetailItem label="Phone Number" value={staffMember.contactNumber} />
              <DetailItem label="Email Address" value={staffMember.emailAddress} />
              <div className="sm:col-span-2 lg:col-span-3"><DetailItem label="Current Address" value={staffMember.currentAddress} /></div>
              <div className="sm:col-span-2 lg:col-span-3"><DetailItem label="Permanent Address" value={staffMember.permanentAddress} /></div>
          </DetailSection>

          <DetailSection title="Qualifications & Experience">
              <DetailItem label="Qualification" value={staffMember.educationalQualification} />
              <DetailItem label="Specialization" value={staffMember.specialization} />
              <DetailItem label="Years of Experience" value={`${staffMember.yearsOfExperience} years`} />
              <div className="sm:col-span-2 lg:col-span-3"><DetailItem label="Previous Experience" value={staffMember.previousExperience} /></div>
          </DetailSection>

          <DetailSection title="Professional Details">
              <DetailItem label="Date of Joining" value={formatDateForDisplay(staffMember.dateOfJoining)} />
              <DetailItem label="Employee Type" value={staffMember.employeeType} />
              {assignedClass && <DetailItem label="Class Teacher Of" value={assignedClass} />}
              {staffMember.staffType === 'Teaching' && (
                <>
                    <DetailItem label="Teacher License No." value={staffMember.teacherLicenseNumber} />
                    <div className="sm:col-span-2 lg:col-span-3">
                        <DetailItem label="Subjects Handled">
                            {staffMember.subjectsTaught.length > 0 ? (
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {staffMember.subjectsTaught.map(sub => <span key={sub} className="bg-sky-100 text-sky-800 text-xs font-semibold px-2.5 py-1 rounded-full">{sub}</span>)}
                                </div>
                            ) : "N/A"}
                        </DetailItem>
                    </div>
                </>
              )}
          </DetailSection>

          <DetailSection title="Payroll Details">
            <DetailItem label="Salary Grade" value={staffMember.salaryGrade} />
            <DetailItem label="Basic Salary" value={staffMember.basicSalary ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(staffMember.basicSalary) : 'N/A'} />
            <DetailItem label="PAN Number" value={staffMember.panNumber} />
            <DetailItem label="Bank Name" value={staffMember.bankName} />
            <div className="sm:col-span-2"><DetailItem label="Bank Account Number" value={staffMember.bankAccountNumber} /></div>
          </DetailSection>
          
          <DetailSection title="Attendance Records">
                <div className="sm:col-span-3 bg-slate-50 text-slate-700 p-4 rounded-lg text-center">
                    Full attendance tracking feature is coming soon.
                </div>
          </DetailSection>
          
          <DetailSection title="Emergency Contact">
              <DetailItem label="Contact Name" value={staffMember.emergencyContactName} />
              <DetailItem label="Relationship" value={staffMember.emergencyContactRelationship} />
              <DetailItem label="Contact Number" value={staffMember.emergencyContactNumber} />
              <div className="sm:col-span-2 lg:col-span-3"><DetailItem label="Known Medical Conditions" value={staffMember.medicalConditions} /></div>
          </DetailSection>
      </div>

    </div>
  );
};

export default StaffDetailPage;
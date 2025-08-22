

import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Staff, EmploymentStatus, Grade, GradeDefinition, Designation } from '../types';
import { PlusIcon, SearchIcon, HomeIcon, BackIcon, EditIcon, UserIcon, BriefcaseIcon, PhoneIcon, MailIcon, TrashIcon, DocumentReportIcon } from '../components/Icons';

interface ManageStaffPageProps {
  staff: Staff[];
  gradeDefinitions: Record<Grade, GradeDefinition>;
  onAdd: () => void;
  onEdit: (staffMember: Staff) => void;
  onDelete: (staffMember: Staff) => void;
}

const StaffCard: React.FC<{ 
    staffMember: Staff;
    onEdit: (staffMember: Staff) => void; 
    onDelete: (staffMember: Staff) => void; 
}> = ({ staffMember, onEdit, onDelete }) => {
    const { status, firstName, lastName, designation, department } = staffMember;
    const isActive = status === EmploymentStatus.ACTIVE;
    
    const statusStyles = {
        [EmploymentStatus.ACTIVE]: 'bg-emerald-100 text-emerald-800',
        [EmploymentStatus.ON_LEAVE]: 'bg-amber-100 text-amber-800',
        [EmploymentStatus.RESIGNED]: 'bg-rose-100 text-rose-800',
        [EmploymentStatus.RETIRED]: 'bg-slate-200 text-slate-700',
    };

    return (
        <div className={`bg-white rounded-xl shadow-lg p-5 flex flex-col transition-all duration-300 h-full ${!isActive ? 'opacity-70 bg-slate-50' : 'hover:shadow-xl hover:scale-[1.02]'}`}>
            <div className="flex items-start gap-4 pb-4 border-b">
                <div className="w-20 h-20 rounded-full shadow-md border-2 border-white flex-shrink-0">
                    <Link to={`/staff/${staffMember.id}`} className="block w-full h-full">
                        <div className="relative w-full h-full bg-slate-200 rounded-full flex items-center justify-center">
                            {staffMember.photographUrl ? <img src={staffMember.photographUrl} alt={`${firstName} ${lastName}'s photograph`} className="h-full w-full object-cover rounded-full" onError={(e) => (e.currentTarget.style.display = 'none')} /> : null}
                            <div className={`absolute inset-0 flex items-center justify-center text-slate-600`}>
                                <UserIcon className="w-2/3 h-2/3" />
                            </div>
                        </div>
                    </Link>
                </div>
                <div className="flex-grow">
                    <Link to={`/staff/${staffMember.id}`} className="block">
                        <h3 className="text-xl font-bold text-slate-900 hover:text-sky-700">{firstName} {lastName}</h3>
                    </Link>
                    <p className="text-md text-sky-700 font-semibold">{designation}</p>
                    <p className="text-sm text-slate-700">{department}</p>
                    <div className={`mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[status] || statusStyles[EmploymentStatus.RETIRED]}`}>
                        {status}
                    </div>
                </div>
                <div className="flex flex-col items-center gap-2 z-10">
                    <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(staffMember); }} 
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-full flex-shrink-0" 
                        title="Edit Staff Details"
                    >
                        <EditIcon className="w-5 h-5"/>
                    </button>
                     <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(staffMember); }} 
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full flex-shrink-0" 
                        title="Remove Staff"
                    >
                        <TrashIcon className="w-5 h-5"/>
                    </button>
                </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-800 flex-grow">
                <div className="flex items-center gap-2">
                    <BriefcaseIcon className="w-4 h-4 text-slate-600 flex-shrink-0"/>
                    <span>{staffMember.educationalQualification} ({staffMember.yearsOfExperience} yrs exp.)</span>
                </div>
                <div className="flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4 text-slate-600 flex-shrink-0"/>
                    <span>{staffMember.contactNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                    <MailIcon className="w-4 h-4 text-slate-600 flex-shrink-0"/>
                    <a href={`mailto:${staffMember.emailAddress}`} className="hover:underline text-sky-700 truncate">{staffMember.emailAddress}</a>
                </div>
            </div>
        </div>
    );
};


const StaffGrid: React.FC<{staff: Staff[], onEdit: (staffMember: Staff) => void, onDelete: (staffMember: Staff) => void, title?: string}> = ({ staff, onEdit, onDelete, title }) => {
    if (staff.length === 0) {
        return <p className="text-slate-600 text-center py-4">{title ? `No staff found for ${title}.` : "No staff found."}</p>;
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staff.map(member => (
                <StaffCard
                    key={member.id}
                    staffMember={member}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    )
}

const ManageStaffPage: React.FC<ManageStaffPageProps> = ({ staff, gradeDefinitions, onAdd, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'teaching' | 'non-teaching'>('teaching');
  const navigate = useNavigate();

  const confinedGrades: Grade[] = [Grade.NURSERY, Grade.KINDERGARTEN, Grade.I, Grade.II];

  const filteredStaff = useMemo(() => 
    staff.filter(s => 
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    ), 
  [staff, searchTerm]);

  const teachingStaff = useMemo(() => filteredStaff.filter(s => s.staffType === 'Teaching'), [filteredStaff]);
  const nonTeachingStaff = useMemo(() => filteredStaff.filter(s => s.staffType === 'Non-Teaching'), [filteredStaff]);

  const confinedTeachers = useMemo(() => 
      teachingStaff.filter(s => {
          const assignedGradeKey = Object.keys(gradeDefinitions).find(g => gradeDefinitions[g as Grade]?.classTeacherId === s.id) as Grade | undefined;
          return assignedGradeKey && confinedGrades.includes(assignedGradeKey);
      })
  , [teachingStaff, gradeDefinitions]);
  
  const subjectTeachers = useMemo(() => 
      teachingStaff.filter(s => !confinedTeachers.some(ct => ct.id === s.id))
  , [teachingStaff, confinedTeachers]);

  const clerks = useMemo(() => nonTeachingStaff.filter(s => s.designation === Designation.CLERK), [nonTeachingStaff]);
  const librarians = useMemo(() => nonTeachingStaff.filter(s => s.designation === Designation.LIBRARIAN), [nonTeachingStaff]);
  const sportsTeachers = useMemo(() => nonTeachingStaff.filter(s => s.designation === Designation.SPORTS_TEACHER), [nonTeachingStaff]);

  return (
    <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6 flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
                    <BackIcon className="w-5 h-5" /> Back
                </button>
                <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors" title="Go to Home/Dashboard">
                    <HomeIcon className="w-5 h-5" /> <span>Home</span>
                </Link>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Manage Staff</h1>
                    <p className="text-slate-700 mt-1">Add, view, and manage staff profiles and assignments.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto ml-auto">
                    <div className="relative w-full sm:w-auto">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-slate-600" />
                        </div>
                        <input type="text" placeholder="Search by name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition placeholder:text-slate-600" aria-label="Search staff by name" />
                    </div>
                    <Link
                        to="/staff/certificates"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                    >
                        <DocumentReportIcon className="h-5 w-5" />
                        Service Certificates
                    </Link>
                    <button onClick={onAdd} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition">
                        <PlusIcon className="h-5 h-5" /> Add Staff
                    </button>
                </div>
            </div>
            
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('teaching')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'teaching' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                        Teaching Staff
                    </button>
                    <button onClick={() => setActiveTab('non-teaching')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'non-teaching' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                        Non-Teaching Staff
                    </button>
                </nav>
            </div>
        </div>

        <div className="space-y-8">
            {activeTab === 'teaching' && (
                <div className="animate-fade-in space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b pb-2">Confined Teachers (Nursery to Class II)</h2>
                        <StaffGrid staff={confinedTeachers} onEdit={onEdit} onDelete={onDelete} title="Confined Teachers" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b pb-2">Subject Wise Teachers</h2>
                        <StaffGrid staff={subjectTeachers} onEdit={onEdit} onDelete={onDelete} title="Subject Wise Teachers" />
                    </div>
                </div>
            )}
            {activeTab === 'non-teaching' && (
                <div className="animate-fade-in space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b pb-2">Clerks</h2>
                        <StaffGrid staff={clerks} onEdit={onEdit} onDelete={onDelete} title="Clerks" />
                    </div>
                     <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b pb-2">Librarians</h2>
                        <StaffGrid staff={librarians} onEdit={onEdit} onDelete={onDelete} title="Librarians" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b pb-2">Sports Teachers</h2>
                        <StaffGrid staff={sportsTeachers} onEdit={onEdit} onDelete={onDelete} title="Sports Teachers" />
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default ManageStaffPage;

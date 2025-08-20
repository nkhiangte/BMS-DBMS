

import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Staff, EmploymentStatus, Grade, GradeDefinition } from '../types';
import { PlusIcon, SearchIcon, HomeIcon, BackIcon, EditIcon, UserIcon, BriefcaseIcon, PhoneIcon, MailIcon } from '../components/Icons';
import { EMPLOYMENT_STATUS_LIST } from '../constants';

interface ManageTeachersPageProps {
  staff: Staff[];
  gradeDefinitions: Record<Grade, GradeDefinition>;
  onAdd: () => void;
  onEdit: (staffMember: Staff) => void;
  onAssignClass: (teacherId: number, newGradeKey: Grade | null) => void;
}

const PhotoWithFallback: React.FC<{src?: string, alt: string}> = ({ src, alt }) => {
    return (
        <div className="relative w-full h-full bg-slate-200 rounded-full flex items-center justify-center">
             {src ? <img src={src} alt={alt} className="h-full w-full object-cover rounded-full" onError={(e) => (e.currentTarget.style.display = 'none')} /> : null}
            <div className={`absolute inset-0 flex items-center justify-center text-slate-600`}>
                <UserIcon className="w-2/3 h-2/3" />
            </div>
        </div>
    )
}

const TeacherCard: React.FC<{ 
    staffMember: Staff;
    onEdit: (staffMember: Staff) => void; 
}> = ({ staffMember, onEdit }) => {
    const { status, firstName, lastName, designation, department } = staffMember;
    const isActive = status === EmploymentStatus.ACTIVE;
    
    const statusStyles = {
        [EmploymentStatus.ACTIVE]: 'bg-emerald-100 text-emerald-800',
        [EmploymentStatus.ON_LEAVE]: 'bg-amber-100 text-amber-800',
        [EmploymentStatus.RESIGNED]: 'bg-rose-100 text-rose-800',
        [EmploymentStatus.RETIRED]: 'bg-slate-200 text-slate-700',
    };

    return (
        <div className={`bg-white rounded-xl shadow-lg p-5 flex flex-col transition-all duration-300 ${!isActive ? 'opacity-70 bg-slate-50' : 'hover:shadow-xl hover:scale-[1.02]'}`}>
            <div className="flex items-start gap-4 pb-4 border-b">
                <div className="w-20 h-20 rounded-full shadow-md border-2 border-white flex-shrink-0">
                    <PhotoWithFallback src={staffMember.photographUrl} alt={`${firstName} ${lastName}'s photograph`} />
                </div>
                <div className="flex-grow">
                    <h3 className="text-xl font-bold text-slate-900">{firstName} {lastName}</h3>
                    <p className="text-md text-sky-700 font-semibold">{designation}</p>
                    <p className="text-sm text-slate-700">{department}</p>
                    <div className={`mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[status] || statusStyles[EmploymentStatus.RETIRED]}`}>
                        {status}
                    </div>
                </div>
                 <button onClick={() => onEdit(staffMember)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-full flex-shrink-0" title="Edit Teacher Details">
                    <EditIcon className="w-5 h-5"/>
                </button>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-800">
                <div className="flex items-center gap-2">
                    <BriefcaseIcon className="w-4 h-4 text-slate-600 flex-shrink-0"/>
                    <span>{staffMember.educationalQualification} ({staffMember.specialization})</span>
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

const ManageTeachersPage: React.FC<ManageTeachersPageProps> = ({ staff, gradeDefinitions, onAdd, onEdit, onAssignClass }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();

  const filteredTeachers = useMemo(() => {
    return staff
      .filter(staffMember =>
        `${staffMember.firstName} ${staffMember.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(staffMember => {
        if (statusFilter === 'all') return true;
        return staffMember.status.toLowerCase() === statusFilter;
      }).sort((a, b) => a.firstName.localeCompare(b.firstName));
  }, [staff, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
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
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Manage Teachers</h1>
                    <p className="text-slate-700 mt-1">Add, view, and manage teacher profiles and assignments.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto ml-auto">
                    <div className="relative w-full sm:w-auto">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-slate-600" />
                        </div>
                        <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition placeholder:text-slate-600"
                        aria-label="Search teachers by name"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                        aria-label="Filter teachers by status"
                    >
                        <option value="all">All Statuses</option>
                        {EMPLOYMENT_STATUS_LIST.map(status => (
                            <option key={status} value={status.toLowerCase()}>{status}</option>
                        ))}
                    </select>

                    <button
                        onClick={onAdd}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition"
                    >
                        <PlusIcon className="h-5 w-5" />
                        Add Teacher
                    </button>
                </div>
            </div>
        </div>

        {filteredTeachers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeachers.map(teacher => (
                    <TeacherCard
                        key={teacher.id}
                        staffMember={teacher}
                        onEdit={onEdit}
                    />
                ))}
            </div>
        ) : (
             <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg bg-white">
                <p className="text-slate-700 text-lg font-semibold">No teacher records found.</p>
                <p className="text-slate-600 mt-2">Try adjusting your search or add a new teacher.</p>
            </div>
        )}
    </div>
  );
};

export default ManageTeachersPage;





import React from 'react';
import { Link } from 'react-router-dom';
import { UsersIcon, PlusIcon, DocumentReportIcon, BookOpenIcon, TransferIcon, BriefcaseIcon, CurrencyDollarIcon, AcademicCapIcon, ArchiveBoxIcon, BuildingOfficeIcon, UserGroupIcon, CalendarDaysIcon, MegaphoneIcon } from '../components/Icons';
import AcademicYearForm from '../components/AcademicYearForm';
import { User, Grade, SubjectAssignment } from '../types';

interface DashboardPageProps {
  user: User;
  onAddStudent: () => void;
  studentCount: number;
  academicYear: string | null;
  onSetAcademicYear: (year: string) => void;
  allUsers: User[];
  assignedGrade: Grade | null;
  assignedSubjects: SubjectAssignment[];
}

const DashboardCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  action: React.ReactElement;
  count?: number;
  color?: 'sky' | 'emerald' | 'indigo' | 'amber' | 'rose' | 'violet' | 'teal';
}> = ({ title, description, icon, action, count, color = 'sky' }) => {
    const colors = {
        sky: { gradient: 'from-sky-400 to-sky-600', button: 'bg-sky-600 hover:bg-sky-700 focus:ring-sky-500 disabled:bg-sky-400', count: 'text-sky-600' },
        emerald: { gradient: 'from-emerald-400 to-emerald-600', button: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 disabled:bg-emerald-400', count: 'text-emerald-600' },
        indigo: { gradient: 'from-indigo-400 to-indigo-600', button: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-indigo-400', count: 'text-indigo-600' },
        amber: { gradient: 'from-amber-400 to-amber-600', button: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 disabled:bg-amber-400', count: 'text-amber-600' },
        rose: { gradient: 'from-rose-400 to-rose-600', button: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500 disabled:bg-rose-400', count: 'text-rose-600' },
        violet: { gradient: 'from-violet-400 to-violet-600', button: 'bg-violet-600 hover:bg-violet-700 focus:ring-violet-500 disabled:bg-violet-400', count: 'text-violet-600' },
        teal: { gradient: 'from-teal-400 to-teal-600', button: 'bg-teal-600 hover:bg-teal-700 focus:ring-teal-500 disabled:bg-teal-400', count: 'text-teal-600' },
    };
    const selectedColor = colors[color] || colors.sky;

    return (
        <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 flex flex-col group hover:-translate-y-1.5">
            <div className="flex items-start gap-4">
                <div className={`bg-gradient-to-br ${selectedColor.gradient} text-white p-3 rounded-lg shadow-lg group-hover:shadow-xl transition-shadow`}>
                    {icon}
                </div>
                <div className="flex-grow">
                    <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                    <p className="text-slate-600 text-sm mt-1">{description}</p>
                </div>
                {count !== undefined && (
                    <div className={`ml-auto text-4xl font-bold ${selectedColor.count}`}>{count}</div>
                )}
            </div>
            <div className="mt-auto pt-6">
                {React.cloneElement<any>(action, {
                    className: `w-full text-center block px-4 py-2 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition ${selectedColor.button} group-hover:-translate-y-0.5 transform-gpu disabled:cursor-not-allowed`
                })}
            </div>
        </div>
    )
};


const DashboardPage: React.FC<DashboardPageProps> = ({ user, onAddStudent, studentCount, academicYear, onSetAcademicYear, allUsers, assignedGrade, assignedSubjects }) => {
  if (!academicYear) {
    return <AcademicYearForm onSetAcademicYear={onSetAcademicYear} />;
  }

  const isAdmin = user.role === 'admin';
  const pendingUserCount = allUsers.filter(u => u.role === 'pending').length;
  
  return (
    <div>
        <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900">Welcome, {user.displayName || user.email}!</h1>
            <p className="text-slate-600 text-lg mt-1">
                Academic Year: <span className="font-semibold text-sky-600">{academicYear}</span>
                 {user.role === 'user' && assignedGrade && (
                    <span className="ml-4">Class Teacher of: <span className="font-semibold text-indigo-600">{assignedGrade}</span></span>
                )}
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Cards for All Users */}
             <DashboardCard
                title={isAdmin ? "Manage Students" : "View Students"}
                description={isAdmin ? "View, edit, or delete student records." : "Browse all active students in the school."}
                icon={<UsersIcon className="w-7 h-7" />}
                count={studentCount}
                color="sky"
                action={<Link to="/students">View Active Students</Link>}
            />
            {user.role === 'user' && assignedGrade && (
                 <DashboardCard
                    title="My Class"
                    description={`Manage students and details for ${assignedGrade}.`}
                    icon={<BookOpenIcon className="w-7 h-7" />}
                    color="indigo"
                    action={<Link to={`/classes/${encodeURIComponent(assignedGrade)}`}>Go to My Class</Link>}
                />
            )}
            {user.role === 'user' && assignedSubjects.length > 0 && (
                 <DashboardCard
                    title="Activity Marks"
                    description="Enter activity marks for your assigned subjects."
                    icon={<AcademicCapIcon className="w-7 h-7" />}
                    color="amber"
                    action={<Link to="/activity-marks">Enter Activity Marks</Link>}
                />
            )}
            {user.role === 'user' && assignedGrade && (
                 <DashboardCard
                    title="Mark Student Attendance"
                    description={`Take daily attendance for ${assignedGrade}.`}
                    icon={<CalendarDaysIcon className="w-7 h-7" />}
                    color="amber"
                    action={<Link to={`/classes/${encodeURIComponent(assignedGrade)}/attendance`}>Take Attendance</Link>}
                />
            )}

            <DashboardCard
                title="Staff Attendance"
                description="Mark and view daily staff attendance."
                icon={<CalendarDaysIcon className="w-7 h-7" />}
                color="teal"
                action={<Link to="/staff/attendance">Mark Attendance</Link>}
            />
            
            <DashboardCard
                title="Register New Student"
                description="Add a new student to the database."
                icon={<PlusIcon className="w-7 h-7" />}
                color="emerald"
                action={<button onClick={onAddStudent} disabled={!isAdmin}>Add New Student</button>}
            />
            <DashboardCard
                title="Manage Classes"
                description="Browse students by their class."
                icon={<BookOpenIcon className="w-7 h-7" />}
                color="indigo"
                action={<Link to="/classes">Browse Classes</Link>}
            />
            <DashboardCard
                title="Academic Performance"
                description="Enter and update student examination marks."
                icon={<AcademicCapIcon className="w-7 h-7" />}
                color="amber"
                action={<Link to="/reports/search">Enter/View Marks</Link>}
            />
                <DashboardCard
                title="Communication"
                description="Send bulk SMS or WhatsApp to parents."
                icon={<MegaphoneIcon className="w-7 h-7" />}
                color="teal"
                action={<Link to="/communication">{isAdmin ? 'Send Messages' : 'View Communication'}</Link>}
            />
             <DashboardCard
                title="Fee Management"
                description="Track payments and manage student fees."
                icon={<CurrencyDollarIcon className="w-7 h-7" />}
                color="violet"
                action={<Link to="/fees">{isAdmin ? 'Manage Fees' : 'View Fees'}</Link>}
            />

            <DashboardCard
                title="Inventory"
                description="Track and manage all school assets."
                icon={<ArchiveBoxIcon className="w-7 h-7" />}
                color="violet"
                action={<Link to="/inventory">{isAdmin ? 'Manage Inventory' : 'View Inventory'}</Link>}
            />

            <DashboardCard
                title="Hostel Management"
                description="Manage hostel rooms, students, and staff."
                icon={<BuildingOfficeIcon className="w-7 h-7" />}
                color="rose"
                action={<Link to="/hostel">{isAdmin ? 'Manage Hostel' : 'View Hostel'}</Link>}
            />

            <DashboardCard
                title="School Calendar"
                description="View holidays, exams, and school events."
                icon={<CalendarDaysIcon className="w-7 h-7" />}
                color="teal"
                action={<Link to="/calendar">View Calendar</Link>}
            />
        
            <DashboardCard
                title={isAdmin ? "Manage Staff" : "View Staff"}
                description={isAdmin ? "Add, view, and manage staff profiles." : "View all staff profiles."}
                icon={<BriefcaseIcon className="w-7 h-7" />}
                color="sky"
                action={<Link to="/staff">{isAdmin ? "Manage Staff" : "View Staff"}</Link>}
            />
            <DashboardCard
                title="Transfer Management"
                description="Manage student transfers and TCs."
                icon={<TransferIcon className="w-7 h-7" />}
                color="amber"
                action={<Link to="/transfers">Go to Transfers</Link>}
            />

            {/* Admin-only cards */}
            {isAdmin && (
                <>
                    <DashboardCard
                        title="User Management"
                        description="Approve new user registrations."
                        icon={<UserGroupIcon className="w-7 h-7" />}
                        count={pendingUserCount}
                        color="teal"
                        action={<Link to="/users">Manage Users</Link>}
                    />
                    <DashboardCard
                        title="Promote Students"
                        description="Finalize results and start new session."
                        icon={<AcademicCapIcon className="w-7 h-7" />}
                        color="rose"
                        action={<Link to="/promotion">Promote/Detain Students</Link>}
                    />
                </>
            )}
        </div>
    </div>
  );
};

export default DashboardPage;
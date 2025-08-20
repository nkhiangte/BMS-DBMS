import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    BackIcon, 
    HomeIcon, 
    UsersIcon, 
    BedIcon, 
    CurrencyDollarIcon,
    ClipboardDocumentCheckIcon,
    CakeIcon,
    BriefcaseIcon,
    ArchiveBoxIcon,
    ShieldCheckIcon,
    ClipboardDocumentListIcon,
    MegaphoneIcon,
    CogIcon,
    BuildingOfficeIcon
} from '../components/Icons';

interface HostelCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    link: string;
    color: 'sky' | 'emerald' | 'indigo' | 'amber' | 'rose' | 'violet' | 'teal';
}

const HostelCard: React.FC<HostelCardProps> = ({ title, description, icon, link, color }) => {
    const colors = {
        sky: { bg: 'bg-sky-100', text: 'text-sky-600', hoverBorder: 'hover:border-sky-300' },
        emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', hoverBorder: 'hover:border-emerald-300' },
        indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', hoverBorder: 'hover:border-indigo-300' },
        amber: { bg: 'bg-amber-100', text: 'text-amber-600', hoverBorder: 'hover:border-amber-300' },
        rose: { bg: 'bg-rose-100', text: 'text-rose-600', hoverBorder: 'hover:border-rose-300' },
        violet: { bg: 'bg-violet-100', text: 'text-violet-600', hoverBorder: 'hover:border-violet-300' },
        teal: { bg: 'bg-teal-100', text: 'text-teal-600', hoverBorder: 'hover:border-teal-300' },
    };
    const selectedColor = colors[color] || colors.sky;

    return (
        <Link to={link} className={`block p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 border-2 border-transparent ${selectedColor.hoverBorder}`}>
            <div className="flex items-start gap-4">
                <div className={`${selectedColor.bg} ${selectedColor.text} p-3 rounded-lg`}>
                    {icon}
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-700 transition-colors">{title}</h3>
                    <p className="text-slate-600 text-sm mt-1">{description}</p>
                </div>
            </div>
        </Link>
    );
};

const HostelDashboardPage: React.FC = () => {
    const navigate = useNavigate();

    const hostelFeatures: HostelCardProps[] = [
        { title: "Student Hostel Records", description: "Register and manage student details.", icon: <UsersIcon className="w-7 h-7" />, link: "/hostel/students", color: "sky" },
        { title: "Room & Bed Management", description: "View and allocate rooms and beds.", icon: <BedIcon className="w-7 h-7" />, link: "/hostel/rooms", color: "indigo" },
        { title: "Fee Management", description: "Track hostel fee collections and dues.", icon: <CurrencyDollarIcon className="w-7 h-7" />, link: "/hostel/fees", color: "emerald" },
        { title: "Attendance Tracking", description: "Record daily attendance and leave.", icon: <ClipboardDocumentCheckIcon className="w-7 h-7" />, link: "/hostel/attendance", color: "amber" },
        { title: "Mess & Meal Management", description: "Plan menus and track mess expenses.", icon: <CakeIcon className="w-7 h-7" />, link: "/hostel/mess", color: "rose" },
        { title: "Staff Management", description: "Manage warden, security, and other staff.", icon: <BriefcaseIcon className="w-7 h-7" />, link: "/hostel/staff", color: "sky" },
        { title: "Inventory & Assets", description: "Track all hostel-related assets.", icon: <ArchiveBoxIcon className="w-7 h-7" />, link: "/hostel/inventory", color: "violet" },
        { title: "Discipline & Incidents", description: "Log complaints and disciplinary actions.", icon: <ShieldCheckIcon className="w-7 h-7" />, link: "/hostel/discipline", color: "rose" },
        { title: "Health & Safety", description: "Manage student medical records.", icon: <ClipboardDocumentListIcon className="w-7 h-7" />, link: "/hostel/health", color: "amber" },
        { title: "Communication", description: "Send notices and alerts to residents.", icon: <MegaphoneIcon className="w-7 h-7" />, link: "/hostel/communication", color: "indigo" },
        { title: "User Roles & Security", description: "Configure access and security.", icon: <CogIcon className="w-7 h-7" />, link: "/hostel/settings", color: "teal" },
    ];
    
    return (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
                    <BackIcon className="w-5 h-5" /> Back to Dashboard
                </button>
                <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors" title="Go to Home">
                    <HomeIcon className="w-5 h-5" /> Home
                </Link>
            </div>

            <div className="text-center mb-8">
                <div className="inline-block p-4 bg-gradient-to-br from-rose-400 to-rose-600 text-white rounded-full shadow-lg mb-4">
                    <BuildingOfficeIcon className="w-12 h-12" />
                </div>
                <h1 className="text-3xl font-bold text-slate-800">Hostel Management</h1>
                <p className="text-slate-600 mt-2">A centralized dashboard for all hostel-related operations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hostelFeatures.map(feature => (
                    <HostelCard key={feature.title} {...feature} />
                ))}
            </div>
        </div>
    );
};

export default HostelDashboardPage;
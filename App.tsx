
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { User, Student, Exam, StudentStatus, TcRecord, Grade, GradeDefinition, Staff, EmploymentStatus, FeePayments, SubjectMark, InventoryItem, HostelResident, HostelRoom, HostelStaff, HostelInventoryItem, StockLog, StockLogType, ServiceCertificateRecord, PaymentStatus, StaffAttendanceRecord, AttendanceStatus, DailyStudentAttendance, StudentAttendanceRecord, CalendarEvent, CalendarEventType, FeeStructure, FeeSet } from './types';
import { GRADE_DEFINITIONS, TERMINAL_EXAMS, GRADES_LIST, MIZORAM_HOLIDAYS, DEFAULT_FEE_STRUCTURE } from './constants';
import { getNextGrade, createDefaultFeePayments, calculateStudentResult, formatStudentId } from './utils';

import { auth, db, firebaseConfig, firebase } from './firebaseConfig';

import Header from './components/Header';
import StudentFormModal from './components/StudentFormModal';
import ConfirmationModal from './components/ConfirmationModal';
import StudentListPage from './pages/StudentListPage';
import StudentDetailPage from './pages/StudentDetailPage';
import AcademicPerformancePage from './pages/AcademicPerformancePage';
import DashboardPage from './pages/DashboardPage';
import ProgressReportPage from './pages/ProgressReportPage';
import ReportSearchPage from './pages/ReportSearchPage';
import ClassListPage from './pages/ClassListPage';
import ClassStudentsPage from './pages/ClassStudentsPage';
import TransferManagementPage from './pages/TransferManagementPage';
import TcRegistrationPage from './pages/TcRegistrationPage';
import AllTcRecordsPage from './pages/AllTcRecordsPage';
import PrintTcPage from './pages/PrintTcPage';
import UpdateTcPage from './pages/UpdateTcPage';
import PrintableReportCardPage from './pages/PrintableReportCardPage';
import ManageSubjectsPage from './pages/ManageSubjectsPage';
import ManageStaffPage from './pages/ManageStaffPage';
import StaffFormModal from './components/StaffFormModal';
import StaffDetailPage from './pages/StaffDetailPage';
import FeeManagementPage from './pages/FeeManagementPage';
import ClassMarkStatementPage from './pages/ClassMarkStatementPage';
import PromotionPage from './pages/PromotionPage';
import InventoryPage from './pages/InventoryPage';
import InventoryFormModal from './components/InventoryFormModal';
import ImportStudentsModal from './components/ImportStudentsModal';
import TransferStudentModal from './components/TransferStudentModal';
import StudentAttendancePage from './pages/StudentAttendancePage';
import NotificationContainer from './components/NotificationContainer';
import PrintableBulkReportCardPage from './pages/PrintableBulkReportCardPage';

// Auth Pages
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ChangePasswordPage from './pages/ChangePasswordPage';

// Staff Certificate Pages
import StaffDocumentsPage from './pages/StaffDocumentsPage';
import GenerateServiceCertificatePage from './pages/GenerateServiceCertificatePage';
import PrintServiceCertificatePage from './pages/PrintServiceCertificatePage';
import StaffAttendancePage from './pages/StaffAttendancePage';

// Hostel Management Pages
import HostelDashboardPage from './pages/HostelDashboardPage';
import HostelStudentListPage from './pages/HostelStudentListPage';
import HostelRoomListPage from './pages/HostelRoomListPage';
import HostelFeePage from './pages/HostelFeePage';
import HostelAttendancePage from './pages/HostelAttendancePage';
import HostelMessPage from './pages/HostelMessPage';
import HostelStaffPage from './pages/HostelStaffPage';
import HostelInventoryPage from './pages/HostelInventoryPage';
import HostelDisciplinePage from './pages/HostelDisciplinePage';
import HostelHealthPage from './pages/HostelHealthPage';
import HostelCommunicationPage from './pages/HostelCommunicationPage';
import HostelSettingsPage from './pages/HostelSettingsPage';
import HostelStaffFormModal from './components/HostelStaffFormModal';
import HostelResidentFormModal from './components/HostelResidentFormModal';
import AcademicYearForm from './components/AcademicYearForm';
import { UserManagementPage } from './pages/UserManagementPage';
import CommunicationPage from './pages/CommunicationPage';
import CalendarPage from './pages/CalendarPage';
import CalendarEventFormModal from './components/CalendarEventFormModal';

const IMGBB_API_KEY: string = "YOUR_IMGBB_API_KEY";

const uploadImage = async (base64Image: string): Promise<string> => {
    if (base64Image.startsWith('http')) return base64Image;
    if (!IMGBB_API_KEY || IMGBB_API_KEY === "YOUR_IMGBB_API_KEY") {
        console.warn("imgbb API key is not set. Using a placeholder image URL.");
        return "https://i.ibb.co/688JsK1/placeholder.png";
    }

    try {
        const formData = new FormData();
        formData.append('image', base64Image.split(',')[1]);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        if (result.success) {
            return result.data.url;
        } else {
            console.error('Image upload failed:', result);
            return '';
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        return '';
    }
};

const PrivateRoute: React.FC<{ user: User | null, children: React.ReactNode }> = ({ user, children }) => {
    return user ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
    // Component State
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState<Student[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [tcRecords, setTcRecords] = useState<TcRecord[]>([]);
    const [serviceCertRecords, setServiceCertRecords] = useState<ServiceCertificateRecord[]>([]);
    const [hostelResidents, setHostelResidents] = useState<HostelResident[]>([]);
    const [hostelRooms, setHostelRooms] = useState<HostelRoom[]>([]);
    const [hostelStaff, setHostelStaff] = useState<HostelStaff[]>([]);
    const [hostelInventory, setHostelInventory] = useState<HostelInventoryItem[]>([]);
    const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
    const [gradeDefinitions, setGradeDefinitions] = useState<Record<Grade, GradeDefinition>>(GRADE_DEFINITIONS);
    const [staffAttendance, setStaffAttendance] = useState<Record<string, StaffAttendanceRecord>>({});
    const [studentAttendance, setStudentAttendance] = useState<DailyStudentAttendance>({});
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [feeStructure, setFeeStructure] = useState<FeeStructure>(DEFAULT_FEE_STRUCTURE);

    const [isStudentFormOpen, setIsStudentFormOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [newStudentTargetGrade, setNewStudentTargetGrade] = useState<Grade | null>(null);
    const [isStaffFormOpen, setIsStaffFormOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [isInventoryFormOpen, setIsInventoryFormOpen] = useState(false);
    const [editingInventoryItem, setEditingInventoryItem] = useState<InventoryItem | null>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importTargetGrade, setImportTargetGrade] = useState<Grade | null>(null);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [transferringStudent, setTransferringStudent] = useState<Student | null>(null);
    const [isHostelStaffFormOpen, setIsHostelStaffFormOpen] = useState(false);
    const [editingHostelStaff, setEditingHostelStaff] = useState<HostelStaff | null>(null);
    const [isHostelResidentFormOpen, setIsHostelResidentFormOpen] = useState(false);
    const [isCalendarEventFormOpen, setIsCalendarEventFormOpen] = useState(false);
    const [editingCalendarEvent, setEditingCalendarEvent] = useState<CalendarEvent | null>(null);

    const [academicYear, setAcademicYear] = useState<string | null>(localStorage.getItem('academicYear'));
    const [authError, setAuthError] = useState('');
    const [notification, setNotification] = useState('');
    const [notifications, setNotifications] = useState<{ id: string; message: string }[]>([]);

    // User-specific preferences
    const [calendarNotificationPrefs, setCalendarNotificationPrefs] = useState<{daysBefore: number}>({ daysBefore: 1 });

    const navigate = useNavigate();
    const location = useLocation();

    // Memoized values
    const activeStudents = useMemo(() => students.filter(s => s.status === StudentStatus.ACTIVE), [students]);
    const assignedGrade = useMemo(() => {
        if (user?.role !== 'user' || !user.uid) return null;
        const assignedStaff = staff.find(s => s.emailAddress.toLowerCase() === user.email?.toLowerCase());
        if (!assignedStaff) return null;
        const gradeEntry = Object.entries(gradeDefinitions).find(([,def]) => def.classTeacherId === assignedStaff.id);
        return gradeEntry ? gradeEntry[0] as Grade : null;
    }, [user, staff, gradeDefinitions]);

    // Handlers
    const addNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        const id = new Date().getTime().toString();
        // For simple auth notifications
        if (type === 'success') setNotification(message);
        if (type === 'error') setAuthError(message);
        // For app-wide notifications
        setNotifications(prev => [...prev, { id, message }]);
    }, []);

    // Placeholder Handlers
    const handleLogin = async (email: string, pass: string) => { /* ... */ };
    const handleLogout = () => auth.signOut();
    const handleSignUp = async (name: string, email: string, pass: string) => { return { success: true, message: "Please wait for admin approval." }; };
    const handleForgotPassword = async (email: string) => { return { success: true, message: "Password reset link sent." }; };
    const handleChangePassword = async (current: string, newPass: string) => { return { success: true, message: "Password changed." }; };
    const handleAddStudent = () => { setIsStudentFormOpen(true); };
    const handleEditStudent = (student: Student) => { setEditingStudent(student); setIsStudentFormOpen(true); };
    const handleStudentFormSubmit = async (studentData: Omit<Student, 'id'>) => { console.log('submitting student', studentData); };
    const handleUpdateAcademic = (studentId: string, performance: Exam[]) => { console.log('updating academic', studentId); };
    const handleUpdateFeePayments = (studentId: string, payments: FeePayments) => { console.log('updating fees', studentId); };
    const handleAddStaff = () => { setIsStaffFormOpen(true); };
    const handleEditStaff = (staffMember: Staff) => { setEditingStaff(staffMember); setIsStaffFormOpen(true); };
    const handleStaffFormSubmit = async (staffData: Omit<Staff, 'id'>, assignedGradeKey: Grade | null) => { console.log('submitting staff', staffData); };
    const handleUpdateGradeDefinition = async (grade: Grade, newDefinition: GradeDefinition) => { console.log('updating grade def', grade); };
    const handleUpdateFeeStructure = async (newStructure: FeeStructure) => {
        try {
            await db.collection('config').doc('feeStructure').set(newStructure);
            addNotification("Fee structure updated successfully!", "success");
        } catch (error) {
            console.error("Error updating fee structure:", error);
            addNotification("Failed to update fee structure.", "error");
        }
    };
    const handleAddInventoryItem = () => setIsInventoryFormOpen(true);
    const handleEditInventoryItem = (item: InventoryItem) => { setEditingInventoryItem(item); setIsInventoryFormOpen(true); };
    const handleDeleteInventoryItem = async (item: InventoryItem) => { console.log('Deleting inventory item', item.id); };
    const handleInventoryFormSubmit = async (itemData: Omit<InventoryItem, 'id'>) => { console.log('Submitting inventory item', itemData); setIsInventoryFormOpen(false); };
    const handleSaveTcRecord = async (tcRecord: Omit<TcRecord, 'id'>) => { console.log('Saving TC record', tcRecord); };
    const handleUpdateTcRecord = async (tcRecord: TcRecord) => { console.log('Updating TC record', tcRecord); };
    const handleSaveServiceCert = async (certRecord: Omit<ServiceCertificateRecord, 'id'>) => { console.log('Saving service cert', certRecord); };
    const handlePromoteStudents = async () => { console.log('Promoting students'); };
    const handleUpdateStaffAttendance = (staffId: string, status: AttendanceStatus) => { console.log('Updating staff attendance', staffId, status); };
    const handleUpdateStudentAttendance = async (grade: Grade, records: StudentAttendanceRecord) => { console.log('Updating student attendance', grade, records); };
    const fetchStudentAttendanceForMonth = async (grade: Grade, year: number, month: number) => { console.log('Fetching student attendance', grade, year, month); return {}; };
    const fetchStaffAttendanceForMonth = async (year: number, month: number) => { console.log('Fetching staff attendance', year, month); return {}; };
    const handleUpdateUserRole = (uid: string, newRole: 'admin' | 'user' | 'pending') => { console.log('Updating user role', uid, newRole); };
    const handleDeleteUser = (uid: string) => { console.log('Deleting user', uid); };
    const handleAddHostelResident = () => setIsHostelResidentFormOpen(true);
    const handleHostelResidentFormSubmit = async (resident: Omit<HostelResident, 'id'>) => { console.log('Submitting hostel resident', resident); setIsHostelResidentFormOpen(false); };
    const handleAddHostelStaff = () => setIsHostelStaffFormOpen(true);
    const handleEditHostelStaff = (staff: HostelStaff) => { setEditingHostelStaff(staff); setIsHostelStaffFormOpen(true); };
    const handleDeleteHostelStaff = (staff: HostelStaff) => { console.log('Deleting hostel staff', staff.id); };
    const handleHostelStaffFormSubmit = async (staffData: Omit<HostelStaff, 'id'>) => { console.log('Submitting hostel staff', staffData); setIsHostelStaffFormOpen(false); };
    const handleUpdateHostelStock = async (itemId: string, change: number, notes: string) => { console.log('Updating hostel stock', itemId, change, notes); };
    const handleAddCalendarEvent = () => { setEditingCalendarEvent(null); setIsCalendarEventFormOpen(true); };
    const handleEditCalendarEvent = (event: CalendarEvent) => { setEditingCalendarEvent(event); setIsCalendarEventFormOpen(true); };
    const handleDeleteCalendarEvent = (event: CalendarEvent) => { console.log('Deleting calendar event', event.id); };
    const handleCalendarEventFormSubmit = async (eventData: Omit<CalendarEvent, 'id'>) => { console.log('Submitting calendar event', eventData); setIsCalendarEventFormOpen(false); };
    const handleUpdateCalendarPrefs = (days: number) => { setCalendarNotificationPrefs({ daysBefore: days }); };
    const handleUpdateBulkMarks = async (updates: Array<{ studentId: string; performance: Exam[] }>) => { console.log('Updating bulk marks', updates.length); };
    const handleOpenImportModal = (grade: Grade | null) => { setImportTargetGrade(grade); setIsImportModalOpen(true); };
    const handleOpenTransferModal = (student: Student) => { setTransferringStudent(student); setIsTransferModalOpen(true); };
    const handleTransferStudent = async (studentId: string, newGrade: Grade, newRollNo: number) => { console.log(`Transferring student ${studentId} to ${newGrade}`); setIsTransferModalOpen(false); };
    const handleAddStudentToClass = (grade: Grade) => { setNewStudentTargetGrade(grade); setIsStudentFormOpen(true); };
    const handleUpdateBulkFeePayments = async (updates: Array<{ studentId: string; payments: FeePayments }>) => { console.log('Updating bulk fee payments', updates.length); };
    
    // Auth Effect
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            if (firebaseUser) {
                const userDocRef = db.collection('users').doc(firebaseUser.uid);
                const userDoc = await userDocRef.get();
                if (userDoc.exists) {
                    const userData = userDoc.data() as User;
                    setUser({
                        uid: firebaseUser.uid,
                        displayName: firebaseUser.displayName,
                        email: firebaseUser.email,
                        photoURL: firebaseUser.photoURL,
                        role: userData.role,
                    });
                } else {
                    const newUser: User = { uid: firebaseUser.uid, displayName: firebaseUser.displayName, email: firebaseUser.email, photoURL: firebaseUser.photoURL, role: 'pending' };
                    await userDocRef.set(newUser);
                    setUser(newUser);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);
    
    // Data Fetching Effects
    useEffect(() => {
        if (!user) return;
        const unsubscribers: (() => void)[] = [];
        unsubscribers.push(db.collection('students').onSnapshot(snapshot => setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[])));
        unsubscribers.push(db.collection('staff').onSnapshot(snapshot => setStaff(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Staff[])));
        unsubscribers.push(db.collection('config').doc('feeStructure').onSnapshot(doc => doc.exists ? setFeeStructure(doc.data() as FeeStructure) : db.collection('config').doc('feeStructure').set(DEFAULT_FEE_STRUCTURE)));
        // ... other data listeners for inventory, tc, etc.
        return () => unsubscribers.forEach(unsub => unsub());
    }, [user]);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(location.pathname);
    if (user && !academicYear && !isAuthPage) {
        return (
             <div className="min-h-screen flex flex-col">
                <Header user={user} onLogout={handleLogout} className="print-hidden" />
                <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
                    <AcademicYearForm onSetAcademicYear={(year) => { localStorage.setItem('academicYear', year); setAcademicYear(year); }} />
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            {user && <Header user={user} onLogout={handleLogout} className="print-hidden" />}
            <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
                <Routes>
                    {/* Auth */}
                    <Route path="/login" element={<LoginPage onLogin={handleLogin} error={authError} notification={notification} />} />
                    <Route path="/signup" element={<SignUpPage onSignUp={handleSignUp} />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage onForgotPassword={handleForgotPassword} />} />
                    <Route path="/change-password" element={<PrivateRoute user={user}><ChangePasswordPage onChangePassword={handleChangePassword} /></PrivateRoute>} />
                    <Route path="/users" element={<PrivateRoute user={user}><UserManagementPage allUsers={allUsers} currentUser={user!} onUpdateUserRole={handleUpdateUserRole} onDeleteUser={handleDeleteUser} /></PrivateRoute>} />

                    {/* Core */}
                    <Route path="/" element={<PrivateRoute user={user}><DashboardPage user={user!} onAddStudent={handleAddStudent} studentCount={activeStudents.length} academicYear={academicYear} onSetAcademicYear={(year) => { localStorage.setItem('academicYear', year); setAcademicYear(year); }} allUsers={allUsers} assignedGrade={assignedGrade} /></PrivateRoute>} />
                    <Route path="/students" element={<PrivateRoute user={user}><StudentListPage students={activeStudents} onAdd={handleAddStudent} onEdit={handleEditStudent} academicYear={academicYear!} user={user!} assignedGrade={assignedGrade} /></PrivateRoute>} />
                    <Route path="/student/:studentId" element={<PrivateRoute user={user}>{feeStructure && <StudentDetailPage students={students} onEdit={handleEditStudent} academicYear={academicYear!} user={user!} assignedGrade={assignedGrade} feeStructure={feeStructure} />}</PrivateRoute>} />
                    <Route path="/student/:studentId/academics" element={<PrivateRoute user={user}><AcademicPerformancePage students={students} onUpdateAcademic={handleUpdateAcademic} gradeDefinitions={gradeDefinitions} academicYear={academicYear!} user={user!} assignedGrade={assignedGrade}/></PrivateRoute>} />
                    <Route path="/classes" element={<PrivateRoute user={user}><ClassListPage gradeDefinitions={gradeDefinitions} staff={staff} onOpenImportModal={handleOpenImportModal} user={user!} /></PrivateRoute>} />
                    <Route path="/classes/:grade" element={<PrivateRoute user={user}>{feeStructure && <ClassStudentsPage students={students} staff={staff} gradeDefinitions={gradeDefinitions} onUpdateGradeDefinition={handleUpdateGradeDefinition} academicYear={academicYear!} onOpenImportModal={handleOpenImportModal} onOpenTransferModal={handleOpenTransferModal} onDelete={() => {}} user={user!} assignedGrade={assignedGrade} onAddStudentToClass={handleAddStudentToClass} onUpdateBulkFeePayments={handleUpdateBulkFeePayments} feeStructure={feeStructure} />}</PrivateRoute>} />
                    <Route path="/classes/:grade/attendance" element={<PrivateRoute user={user}><StudentAttendancePage students={students} allAttendance={studentAttendance} onUpdateAttendance={handleUpdateStudentAttendance} user={user!} fetchStudentAttendanceForMonth={fetchStudentAttendanceForMonth} academicYear={academicYear!} assignedGrade={assignedGrade} /></PrivateRoute>} />

                    {/* Fees */}
                    <Route path="/fees" element={<PrivateRoute user={user}>{feeStructure && <FeeManagementPage students={activeStudents} academicYear={academicYear!} onUpdateFeePayments={handleUpdateFeePayments} user={user!} feeStructure={feeStructure} onUpdateFeeStructure={handleUpdateFeeStructure} />}</PrivateRoute>} />
                    
                    {/* Staff */}
                    <Route path="/staff" element={<PrivateRoute user={user}><ManageStaffPage staff={staff} gradeDefinitions={gradeDefinitions} onAdd={handleAddStaff} onEdit={handleEditStaff} onDelete={() => {}} user={user!} /></PrivateRoute>} />
                    <Route path="/staff/:staffId" element={<PrivateRoute user={user}><StaffDetailPage staff={staff} onEdit={handleEditStaff} gradeDefinitions={gradeDefinitions} /></PrivateRoute>} />
                    <Route path="/staff/attendance" element={<PrivateRoute user={user}><StaffAttendancePage user={user!} staff={staff} attendance={staffAttendance[new Date().toISOString().split('T')[0]]} onMarkAttendance={handleUpdateStaffAttendance} fetchStaffAttendanceForMonth={fetchStaffAttendanceForMonth} academicYear={academicYear!} /></PrivateRoute>} />
                    <Route path="/staff/certificates" element={<PrivateRoute user={user}><StaffDocumentsPage serviceCertificateRecords={serviceCertRecords} user={user!} /></PrivateRoute>} />
                    <Route path="/staff/certificates/generate" element={<PrivateRoute user={user}><GenerateServiceCertificatePage staff={staff} onSave={handleSaveServiceCert} user={user!} /></PrivateRoute>} />
                    <Route path="/staff/certificates/print/:certId" element={<PrivateRoute user={user}><PrintServiceCertificatePage serviceCertificateRecords={serviceCertRecords} /></PrivateRoute>} />
                    
                    {/* Academics & Reports */}
                    <Route path="/subjects" element={<PrivateRoute user={user}><ManageSubjectsPage gradeDefinitions={gradeDefinitions} onUpdateGradeDefinition={handleUpdateGradeDefinition} user={user!} /></PrivateRoute>} />
                    <Route path="/reports/search" element={<PrivateRoute user={user}><ReportSearchPage students={activeStudents} academicYear={academicYear!} /></PrivateRoute>} />
                    <Route path="/progress-report/:studentId" element={<PrivateRoute user={user}><ProgressReportPage students={students} academicYear={academicYear!} gradeDefinitions={gradeDefinitions} fetchStudentAttendanceForMonth={fetchStudentAttendanceForMonth} /></PrivateRoute>} />
                    <Route path="/report-card/:studentId/:examId" element={<PrivateRoute user={user}><PrintableReportCardPage students={students} gradeDefinitions={gradeDefinitions} academicYear={academicYear!} user={user!} assignedGrade={assignedGrade} fetchStudentAttendanceForMonth={fetchStudentAttendanceForMonth} /></PrivateRoute>} />
                    <Route path="/reports/class-statement/:grade/:examId" element={<PrivateRoute user={user}><ClassMarkStatementPage students={students} gradeDefinitions={gradeDefinitions} academicYear={academicYear!} onUpdateClassMarks={handleUpdateBulkMarks} user={user!} assignedGrade={assignedGrade} fetchStudentAttendanceForMonth={fetchStudentAttendanceForMonth} /></PrivateRoute>} />
                    <Route path="/reports/bulk-print/:grade/:examId" element={<PrivateRoute user={user}><PrintableBulkReportCardPage students={students} gradeDefinitions={gradeDefinitions} academicYear={academicYear!} fetchStudentAttendanceForMonth={fetchStudentAttendanceForMonth} /></PrivateRoute>} />
                    <Route path="/promotion" element={<PrivateRoute user={user}><PromotionPage students={students} gradeDefinitions={gradeDefinitions} academicYear={academicYear!} onPromoteStudents={handlePromoteStudents} user={user!} /></PrivateRoute>} />

                    {/* Transfers */}
                    <Route path="/transfers" element={<PrivateRoute user={user}><TransferManagementPage students={students} tcRecords={tcRecords} academicYear={academicYear!} /></PrivateRoute>} />
                    <Route path="/transfers/register" element={<PrivateRoute user={user}>{feeStructure && <TcRegistrationPage students={students} onSave={handleSaveTcRecord} academicYear={academicYear!} user={user!} feeStructure={feeStructure} />}</PrivateRoute>} />
                    <Route path="/transfers/update" element={<PrivateRoute user={user}><UpdateTcPage tcRecords={tcRecords} onUpdate={handleUpdateTcRecord} user={user!} /></PrivateRoute>} />
                    <Route path="/transfers/records" element={<PrivateRoute user={user}><AllTcRecordsPage tcRecords={tcRecords} /></PrivateRoute>} />
                    <Route path="/transfers/print/:tcId" element={<PrivateRoute user={user}><PrintTcPage tcRecords={tcRecords} /></PrivateRoute>} />

                    {/* Other Modules */}
                    <Route path="/inventory" element={<PrivateRoute user={user}><InventoryPage inventory={inventory} onAdd={handleAddInventoryItem} onEdit={handleEditInventoryItem} onDelete={handleDeleteInventoryItem} user={user!} /></PrivateRoute>} />
                    <Route path="/communication" element={<PrivateRoute user={user}><CommunicationPage students={activeStudents} user={user!} /></PrivateRoute>} />
                    <Route path="/calendar" element={<PrivateRoute user={user}><CalendarPage events={calendarEvents} user={user!} onAdd={handleAddCalendarEvent} onEdit={handleEditCalendarEvent} onDelete={handleDeleteCalendarEvent} notificationDaysBefore={calendarNotificationPrefs.daysBefore} onUpdatePrefs={handleUpdateCalendarPrefs} /></PrivateRoute>} />

                    {/* Hostel */}
                    <Route path="/hostel" element={<PrivateRoute user={user}><HostelDashboardPage /></PrivateRoute>} />
                    <Route path="/hostel/students" element={<PrivateRoute user={user}><HostelStudentListPage residents={hostelResidents} rooms={hostelRooms} students={students} onAdd={handleAddHostelResident} user={user!} /></PrivateRoute>} />
                    <Route path="/hostel/rooms" element={<PrivateRoute user={user}><HostelRoomListPage rooms={hostelRooms} residents={hostelResidents} students={students} /></PrivateRoute>} />
                    <Route path="/hostel/fees" element={<PrivateRoute user={user}><HostelFeePage /></PrivateRoute>} />
                    <Route path="/hostel/attendance" element={<PrivateRoute user={user}><HostelAttendancePage /></PrivateRoute>} />
                    <Route path="/hostel/mess" element={<PrivateRoute user={user}><HostelMessPage /></PrivateRoute>} />
                    <Route path="/hostel/staff" element={<PrivateRoute user={user}><HostelStaffPage staff={hostelStaff} onAdd={handleAddHostelStaff} onEdit={handleEditHostelStaff} onDelete={handleDeleteHostelStaff} user={user!} /></PrivateRoute>} />
                    <Route path="/hostel/inventory" element={<PrivateRoute user={user}><HostelInventoryPage inventory={hostelInventory} stockLogs={stockLogs} onUpdateStock={handleUpdateHostelStock} user={user!} /></PrivateRoute>} />
                    <Route path="/hostel/discipline" element={<PrivateRoute user={user}><HostelDisciplinePage /></PrivateRoute>} />
                    <Route path="/hostel/health" element={<PrivateRoute user={user}><HostelHealthPage /></PrivateRoute>} />
                    <Route path="/hostel/communication" element={<PrivateRoute user={user}><HostelCommunicationPage /></PrivateRoute>} />
                    <Route path="/hostel/settings" element={<PrivateRoute user={user}><HostelSettingsPage /></PrivateRoute>} />

                    {/* Fallback Route */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </main>
        </div>
    );
};

export default App;


import React, { useState, useCallback, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Student, Exam, StudentStatus, TcRecord, Grade, GradeDefinition, Staff, EmploymentStatus, FeePayments, SubjectMark, User, Role, InventoryItem, HostelResident, HostelRoom, HostelStaff, HostelInventoryItem, StockLog, StockLogType } from './types';
import { INITIAL_STUDENTS, GRADE_DEFINITIONS, INITIAL_STAFF, TERMINAL_EXAMS, GRADES_LIST, USERS, INITIAL_INVENTORY, INITIAL_HOSTEL_RESIDENTS, INITIAL_HOSTEL_ROOMS, INITIAL_HOSTEL_STAFF, INITIAL_HOSTEL_INVENTORY, INITIAL_STOCK_LOGS } from './constants';
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
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import InventoryPage from './pages/InventoryPage';
import InventoryFormModal from './components/InventoryFormModal';
import ImportStudentsModal from './components/ImportStudentsModal';
import { calculateStudentResult, getNextGrade, createDefaultFeePayments } from './utils';

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


const App: React.FC = () => {
    // --- AUTHENTICATION STATE ---
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState('');
    const [passwordResetUser, setPasswordResetUser] = useState<User | null>(null);
    const [notification, setNotification] = useState('');


    // --- APPLICATION STATE & LOGIC ---
    const [academicYear, setAcademicYear] = useState<string | null>(null);
    const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
    const [tcRecords, setTcRecords] = useState<TcRecord[]>([]);
    const [gradeDefinitions, setGradeDefinitions] = useState<Record<Grade, GradeDefinition>>(GRADE_DEFINITIONS);

    // --- Staff Management State ---
    const [staff, setStaff] = useState<Staff[]>(INITIAL_STAFF);
    const [isStaffFormModalOpen, setIsStaffFormModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    
    // --- Inventory Management State ---
    const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
    const [isInventoryFormModalOpen, setIsInventoryFormModalOpen] = useState(false);
    const [editingInventoryItem, setEditingInventoryItem] = useState<InventoryItem | null>(null);
    const [deletingInventoryItem, setDeletingInventoryItem] = useState<InventoryItem | null>(null);

    // --- Hostel Management State ---
    const [hostelResidents, setHostelResidents] = useState<HostelResident[]>(INITIAL_HOSTEL_RESIDENTS);
    const [hostelRooms, setHostelRooms] = useState<HostelRoom[]>(INITIAL_HOSTEL_ROOMS);
    const [hostelStaff, setHostelStaff] = useState<HostelStaff[]>(INITIAL_HOSTEL_STAFF);
    const [hostelInventory, setHostelInventory] = useState<HostelInventoryItem[]>(INITIAL_HOSTEL_INVENTORY);
    const [hostelStockLogs, setHostelStockLogs] = useState<StockLog[]>(INITIAL_STOCK_LOGS);

    // --- Import Modal State ---
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importTargetGrade, setImportTargetGrade] = useState<Grade | null>(null);

    // --- AUTHENTICATION LOGIC ---
     useEffect(() => {
        const loggedInUser = sessionStorage.getItem('user');
        if (loggedInUser) {
            setUser(JSON.parse(loggedInUser));
        }
        
        const storedYear = localStorage.getItem('academicYear');
        if (storedYear) {
            setAcademicYear(storedYear);
        }
    }, []);

    const handleLogin = useCallback((username: string, password: string, rememberMe: boolean) => {
        const foundUser = USERS.find(u => u.username === username && u.password_plaintext === password);
        if (foundUser) {
            setUser(foundUser);
            sessionStorage.setItem('user', JSON.stringify(foundUser));
            if (rememberMe) {
                localStorage.setItem('rememberedUser', JSON.stringify({ username, password }));
            } else {
                localStorage.removeItem('rememberedUser');
            }
            setError('');
        } else {
            setError('Invalid username or password');
            setTimeout(() => setError(''), 3000);
        }
    }, []);

    const handleLogout = useCallback(() => {
        setUser(null);
        setAcademicYear(null);
        sessionStorage.removeItem('user');
        localStorage.removeItem('academicYear');
    }, []);

    const handleForgotPassword = useCallback((username: string) => {
        const foundUser = USERS.find(u => u.username === username);
        if (foundUser) {
            setPasswordResetUser(foundUser);
            return { success: true };
        }
        return { success: false, message: 'User not found.' };
    }, []);
    
    const handleResetPassword = useCallback((newPassword: string) => {
        if (!passwordResetUser) {
            return { success: false, message: 'No user selected for password reset.' };
        }
        // In a real app, this would update the backend. Here we just simulate it.
        const userIndex = USERS.findIndex(u => u.id === passwordResetUser.id);
        if (userIndex > -1) {
            USERS[userIndex].password_plaintext = newPassword;
            setPasswordResetUser(null);
            return { success: true, message: 'Password has been reset successfully. Please log in.' };
        }
        return { success: false, message: 'Could not update password.' };
    }, [passwordResetUser]);

     const handleChangePassword = useCallback((currentPassword: string, newPassword: string) => {
        if (!user) {
            return { success: false, message: 'You must be logged in to change your password.' };
        }
        if (user.password_plaintext !== currentPassword) {
            return { success: false, message: 'Incorrect current password.' };
        }
        const userIndex = USERS.findIndex(u => u.id === user.id);
        if (userIndex > -1) {
            USERS[userIndex].password_plaintext = newPassword;
            handleLogout(); // Force logout after password change
            return { success: true, message: 'Password changed successfully. Please log in again.' };
        }
        return { success: false, message: 'An unexpected error occurred.' };
    }, [user, handleLogout]);

    const handleSetAcademicYear = useCallback((year: string) => {
        setAcademicYear(year);
        localStorage.setItem('academicYear', year);
    }, []);

    const handleUpdateGradeDefinition = useCallback((grade: Grade, newDefinition: GradeDefinition) => {
        setGradeDefinitions(prev => ({
            ...prev,
            [grade]: newDefinition,
        }));
    }, []);

    const handleAssignClassToStaff = useCallback((staffId: number, newGradeKey: Grade | null) => {
        setGradeDefinitions(prevDefs => {
            const newDefs = JSON.parse(JSON.stringify(prevDefs));
            
            const oldGradeKey = Object.keys(newDefs).find(g => newDefs[g as Grade]?.classTeacherId === staffId) as Grade | undefined;
            if (oldGradeKey) {
                delete newDefs[oldGradeKey].classTeacherId;
            }

            if (newGradeKey) {
                const otherStaffAssigned = Object.keys(newDefs).find(g => newDefs[g as Grade]?.classTeacherId && g === newGradeKey);
                if(otherStaffAssigned) {
                    delete newDefs[otherStaffAssigned as Grade].classTeacherId;
                }
                
                newDefs[newGradeKey].classTeacherId = staffId;
            }

            return newDefs;
        });
    }, []);

    const openAddModal = useCallback(() => {
        setEditingStudent(null);
        setIsFormModalOpen(true);
    }, []);

    const openEditModal = useCallback((student: Student) => {
        setEditingStudent(student);
        setIsFormModalOpen(true);
    }, []);

    const openDeleteConfirm = useCallback((student: Student) => {
        setDeletingStudent(student);
    }, []);

    const closeModal = useCallback(() => {
        setIsFormModalOpen(false);
        setEditingStudent(null);
        setDeletingStudent(null);
        setIsStaffFormModalOpen(false);
        setEditingStaff(null);
        setIsInventoryFormModalOpen(false);
        setEditingInventoryItem(null);
        setDeletingInventoryItem(null);
        setIsImportModalOpen(false);
        setImportTargetGrade(null);
    }, []);

    const handleFormSubmit = useCallback((studentData: Omit<Student, 'id'>) => {
        if (editingStudent) {
            setStudents(prev =>
                prev.map(s =>
                    s.id === editingStudent.id ? { ...s, ...studentData, id: s.id } : s
                )
            );
        } else {
            setStudents(prev => [
                ...prev,
                { ...studentData, id: Date.now() },
            ]);
        }
        closeModal();
    }, [editingStudent, closeModal]);

    const handleBulkAddStudents = useCallback((studentsData: Omit<Student, 'id'>[]) => {
        const newStudentsWithIds = studentsData.map((s, index) => ({
            ...s,
            id: Date.now() + index,
        }));
        setStudents(prev => [...prev, ...newStudentsWithIds]);
    }, []);

    const handleDeleteConfirm = useCallback(() => {
        if (deletingStudent) {
            setStudents(prev => prev.filter(s => s.id !== deletingStudent.id));
            closeModal();
        }
    }, [deletingStudent, closeModal]);

    const handleAcademicUpdate = useCallback((studentId: number, academicPerformance: Exam[]) => {
        setStudents(prev =>
            prev.map(s =>
                s.id === studentId
                    ? { ...s, academicPerformance }
                    : s
            )
        );
    }, []);

    // --- Staff Handlers ---
    const openAddStaffModal = useCallback(() => {
        setEditingStaff(null);
        setIsStaffFormModalOpen(true);
    }, []);

    const openEditStaffModal = useCallback((staffMember: Staff) => {
        setEditingStaff(staffMember);
        setIsStaffFormModalOpen(true);
    }, []);

    const handleStaffFormSubmit = useCallback((staffData: Omit<Staff, 'id'>, assignedGradeKey: Grade | null) => {
        let updatedStaffId: number;
        const finalAssignedGradeKey = staffData.status === EmploymentStatus.ACTIVE ? assignedGradeKey : null;

        if (editingStaff) {
            updatedStaffId = editingStaff.id;
            setStaff(prev =>
                prev.map(t =>
                    t.id === editingStaff.id ? { ...t, ...staffData, id: t.id } : t
                )
            );
        } else {
            const newId = Date.now();
            updatedStaffId = newId;
            setStaff(prev => [
                ...prev,
                { ...staffData, id: newId },
            ]);
        }

        handleAssignClassToStaff(updatedStaffId, finalAssignedGradeKey);
        closeModal();
    }, [editingStaff, closeModal, handleAssignClassToStaff]);
    
    // --- Inventory Handlers ---
    const openAddInventoryModal = useCallback(() => {
        setEditingInventoryItem(null);
        setIsInventoryFormModalOpen(true);
    }, []);

    const openEditInventoryModal = useCallback((item: InventoryItem) => {
        setEditingInventoryItem(item);
        setIsInventoryFormModalOpen(true);
    }, []);

    const openDeleteInventoryConfirm = useCallback((item: InventoryItem) => {
        setDeletingInventoryItem(item);
    }, []);

    const handleInventoryFormSubmit = useCallback((itemData: Omit<InventoryItem, 'id'>) => {
        if (editingInventoryItem) {
            setInventory(prev =>
                prev.map(i =>
                    i.id === editingInventoryItem.id ? { ...i, ...itemData, id: i.id } : i
                )
            );
        } else {
            setInventory(prev => [
                ...prev,
                { ...itemData, id: Date.now() },
            ]);
        }
        closeModal();
    }, [editingInventoryItem, closeModal]);

    const handleDeleteInventoryConfirm = useCallback(() => {
        if (deletingInventoryItem) {
            setInventory(prev => prev.filter(i => i.id !== deletingInventoryItem.id));
            closeModal();
        }
    }, [deletingInventoryItem, closeModal]);

    // --- Hostel Inventory Handlers ---
    const handleUpdateHostelStock = useCallback((itemId: number, change: number, notes: string) => {
        let updatedItemName = '';
        setHostelInventory(prev => 
            prev.map(item => {
                if (item.id === itemId) {
                    updatedItemName = item.name;
                    return { ...item, currentStock: item.currentStock + change };
                }
                return item;
            })
        );

        const newLog: StockLog = {
            id: Date.now(),
            itemId: itemId,
            itemName: updatedItemName,
            type: change > 0 ? StockLogType.IN : StockLogType.OUT,
            quantity: Math.abs(change),
            date: new Date().toISOString(),
            notes: notes,
        };
        setHostelStockLogs(prev => [newLog, ...prev]);
    }, []);


    const handleSaveTc = useCallback((tcData: Omit<TcRecord, 'id'>) => {
        const newRecord: TcRecord = { ...tcData, id: Date.now() };
        setTcRecords(prev => [...prev, newRecord]);
        setStudents(prevStudents =>
            prevStudents.map(s => 
                s.id === tcData.studentDetails.studentNumericId
                ? { ...s, status: StudentStatus.TRANSFERRED, transferDate: tcData.tcData.issueDate }
                : s
            )
        );
    }, []);

    const handleUpdateTc = useCallback((updatedTc: TcRecord) => {
        setTcRecords(prev => 
            prev.map(record => record.id === updatedTc.id ? updatedTc : record)
        );
    }, []);

    const handleUpdateFeePayments = useCallback((studentId: number, feePayments: FeePayments) => {
        setStudents(prev =>
            prev.map(s =>
                s.id === studentId ? { ...s, feePayments } : s
            )
        );
    }, []);

    const handleUpdateClassMarks = useCallback((marksByStudentId: Map<number, SubjectMark[]>, examId: string) => {
        setStudents(prevStudents => {
            return prevStudents.map(student => {
                if (marksByStudentId.has(student.id)) {
                    const newMarks = marksByStudentId.get(student.id)!;
                    const updatedStudent = { ...student };
                    const performance = updatedStudent.academicPerformance ? JSON.parse(JSON.stringify(updatedStudent.academicPerformance)) : [];
                    const examIndex = performance.findIndex((e: Exam) => e.id === examId);
                    const examName = TERMINAL_EXAMS.find(e => e.id === examId)?.name || 'Unknown Exam';
                    const cleanedNewMarks = newMarks.filter(m => m.marks != null || m.examMarks != null || m.activityMarks != null);

                    if (examIndex > -1) {
                        performance[examIndex].results = cleanedNewMarks;
                    } else {
                        performance.push({ id: examId, name: examName, results: cleanedNewMarks });
                    }
                    updatedStudent.academicPerformance = performance;
                    return updatedStudent;
                }
                return student;
            });
        });
    }, []);

    const handlePromoteStudents = useCallback(() => {
        const finalExamId = 'terminal3';
        const updatedStudents = students.map(student => {
            if (student.status !== StudentStatus.ACTIVE) return student;
            const gradeDef = gradeDefinitions[student.grade];
            const finalExam = student.academicPerformance?.find(e => e.id === finalExamId);
            
            if (!finalExam || !gradeDef) {
                return { ...student, academicPerformance: [], feePayments: createDefaultFeePayments() };
            }
    
            const { finalResult } = calculateStudentResult(finalExam.results, gradeDef, student.grade);
    
            if (finalResult === 'FAIL') {
                return { ...student, academicPerformance: [], feePayments: createDefaultFeePayments() };
            } else {
                if (student.grade === Grade.X) {
                    return { ...student, status: StudentStatus.TRANSFERRED, transferDate: `Graduated in ${academicYear}`, academicPerformance: [], feePayments: createDefaultFeePayments() };
                } else {
                    const nextGrade = getNextGrade(student.grade);
                    return nextGrade ? { ...student, grade: nextGrade, rollNo: student.rollNo, academicPerformance: [], feePayments: createDefaultFeePayments() } : student;
                }
            }
        });
        setStudents(updatedStudents);
        handleLogout();
    }, [students, gradeDefinitions, academicYear, handleLogout]);

    const openImportModal = useCallback((grade: Grade) => {
        setImportTargetGrade(grade);
        setIsImportModalOpen(true);
    }, []);

    const MainAppContent = () => {
        const location = useLocation();
        const navigate = useNavigate();
        const isPrintPage = (location.pathname.startsWith('/report-card/') && location.pathname.split('/').length > 3) || location.pathname.startsWith('/transfers/print') || location.pathname.startsWith('/reports/class-statement');
        const notificationMessage = location.state?.message;

        useEffect(() => {
            if (notificationMessage) {
                navigate(location.pathname, { replace: true });
            }
        }, [notificationMessage, location.pathname, navigate]);

        return (
            <div className="min-h-screen">
                <Header user={user!} onLogout={handleLogout} className={isPrintPage ? 'print:hidden' : ''} />
                <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                    {notificationMessage && (
                        <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-4 rounded-r-lg relative mb-6 shadow-md" role="alert">
                            <span className="font-bold">Success!</span> {notificationMessage}
                        </div>
                    )}
                    <Routes>
                        <Route path="/" element={<DashboardPage user={user!} onAddStudent={openAddModal} studentCount={students.filter(s => s.status === StudentStatus.ACTIVE).length} academicYear={academicYear!} onSetAcademicYear={handleSetAcademicYear} />} />
                        <Route path="/students" element={<StudentListPage students={students.filter(s => s.status === StudentStatus.ACTIVE)} onAdd={openAddModal} onEdit={openEditModal} onDelete={openDeleteConfirm} academicYear={academicYear!} />} />
                        <Route path="/student/:studentId" element={<StudentDetailPage students={students} onEdit={openEditModal} onDelete={openDeleteConfirm} academicYear={academicYear!} />} />
                        <Route path="/reports/search" element={<ReportSearchPage students={students} academicYear={academicYear!} />} />
                        <Route path="/reports/class-statement/:grade/:examId" element={<ClassMarkStatementPage students={students} gradeDefinitions={gradeDefinitions} academicYear={academicYear!} onUpdateClassMarks={handleUpdateClassMarks} />} />
                        <Route path="/report-card/:studentId" element={<ProgressReportPage students={students} academicYear={academicYear!} />} />
                        <Route path="/report-card/:studentId/:examId" element={<PrintableReportCardPage students={students} gradeDefinitions={gradeDefinitions} academicYear={academicYear!} />} />
                        <Route path="/student/:studentId/academics" element={<AcademicPerformancePage students={students} onUpdateAcademic={handleAcademicUpdate} gradeDefinitions={gradeDefinitions} academicYear={academicYear!} />} />
                        <Route path="/classes" element={<ClassListPage gradeDefinitions={gradeDefinitions} staff={staff} />} />
                        <Route path="/classes/:grade" element={<ClassStudentsPage students={students} staff={staff} gradeDefinitions={gradeDefinitions} onUpdateGradeDefinition={handleUpdateGradeDefinition} academicYear={academicYear!} onOpenImportModal={openImportModal} />} />
                        <Route path="/staff" element={<ManageStaffPage staff={staff} gradeDefinitions={gradeDefinitions} onAdd={openAddStaffModal} onEdit={openEditStaffModal} />} />
                        <Route path="/staff/:staffId" element={<StaffDetailPage staff={staff} onEdit={openEditStaffModal} gradeDefinitions={gradeDefinitions} />} />
                        <Route path="/subjects" element={<ManageSubjectsPage gradeDefinitions={gradeDefinitions} onUpdateGradeDefinition={handleUpdateGradeDefinition} />} />
                        <Route path="/fees" element={<FeeManagementPage students={students} academicYear={academicYear!} onUpdateFeePayments={handleUpdateFeePayments} />} />
                        <Route path="/inventory" element={<InventoryPage inventory={inventory} onAdd={openAddInventoryModal} onEdit={openEditInventoryModal} onDelete={openDeleteInventoryConfirm} />} />
                        <Route path="/transfers" element={<TransferManagementPage students={students} tcRecords={tcRecords} />} />
                        <Route path="/transfers/register" element={<TcRegistrationPage students={students.filter(s => s.status === StudentStatus.ACTIVE)} onSave={handleSaveTc} academicYear={academicYear!} />} />
                        <Route path="/transfers/update" element={<UpdateTcPage tcRecords={tcRecords} onUpdate={handleUpdateTc} />} />
                        <Route path="/transfers/records" element={<AllTcRecordsPage tcRecords={tcRecords} />} />
                        <Route path="/transfers/print/:tcId" element={<PrintTcPage tcRecords={tcRecords} />} />
                        <Route path="/promotion" element={<PromotionPage students={students} gradeDefinitions={gradeDefinitions} academicYear={academicYear!} onPromoteStudents={handlePromoteStudents} />} />
                        <Route path="/change-password" element={<ChangePasswordPage onChangePassword={handleChangePassword} />} />
                        
                        {/* Hostel Routes */}
                        <Route path="/hostel" element={<HostelDashboardPage />} />
                        <Route path="/hostel/students" element={<HostelStudentListPage residents={hostelResidents} rooms={hostelRooms} students={students} />} />
                        <Route path="/hostel/rooms" element={<HostelRoomListPage rooms={hostelRooms} residents={hostelResidents} students={students} />} />
                        <Route path="/hostel/fees" element={<HostelFeePage />} />
                        <Route path="/hostel/attendance" element={<HostelAttendancePage />} />
                        <Route path="/hostel/mess" element={<HostelMessPage />} />
                        <Route path="/hostel/staff" element={<HostelStaffPage staff={hostelStaff} />} />
                        <Route path="/hostel/inventory" element={<HostelInventoryPage inventory={hostelInventory} stockLogs={hostelStockLogs} onUpdateStock={handleUpdateHostelStock} />} />
                        <Route path="/hostel/discipline" element={<HostelDisciplinePage />} />
                        <Route path="/hostel/health" element={<HostelHealthPage />} />
                        <Route path="/hostel/communication" element={<HostelCommunicationPage />} />
                        <Route path="/hostel/settings" element={<HostelSettingsPage />} />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
                <StudentFormModal isOpen={isFormModalOpen} onClose={closeModal} onSubmit={handleFormSubmit} student={editingStudent} />
                <StaffFormModal isOpen={isStaffFormModalOpen} onClose={closeModal} onSubmit={handleStaffFormSubmit} staffMember={editingStaff} allStaff={staff} gradeDefinitions={gradeDefinitions} />
                <InventoryFormModal isOpen={isInventoryFormModalOpen} onClose={closeModal} onSubmit={handleInventoryFormSubmit} item={editingInventoryItem} />
                <ImportStudentsModal 
                    isOpen={isImportModalOpen} 
                    onClose={closeModal}
                    onImport={handleBulkAddStudents}
                    grade={importTargetGrade!}
                    existingStudentsInGrade={students.filter(s => s.grade === importTargetGrade)}
                />
                <ConfirmationModal isOpen={!!deletingStudent} onClose={closeModal} onConfirm={handleDeleteConfirm} title="Delete Student"><p>Are you sure you want to delete the record for <span className="font-bold">{deletingStudent?.name}</span>? This action cannot be undone.</p></ConfirmationModal>
                <ConfirmationModal isOpen={!!deletingInventoryItem} onClose={closeModal} onConfirm={handleDeleteInventoryConfirm} title="Delete Inventory Item"><p>Are you sure you want to delete the record for <span className="font-bold">{deletingInventoryItem?.name}</span>? This action cannot be undone.</p></ConfirmationModal>
            </div>
        );
    }
    
    const SetAcademicYearContent = () => (
        <div className="min-h-screen">
           <Header user={user!} onLogout={handleLogout} />
           <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <DashboardPage user={user!} onAddStudent={() => {}} studentCount={0} academicYear={null} onSetAcademicYear={handleSetAcademicYear} />
           </main>
       </div>
   );

    const AppRoutes = () => {
        const location = useLocation();
        useEffect(() => {
            if (location.state?.message) {
                setNotification(location.state.message);
                // Clear the message from location state after a while
                const timer = setTimeout(() => setNotification(''), 5000);
                return () => clearTimeout(timer);
            }
        }, [location.state]);

        return (
            <Routes>
                <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} error={error} notification={notification} />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage onForgotPassword={handleForgotPassword} />} />
                <Route path="/reset-password" element={passwordResetUser ? <ResetPasswordPage onResetPassword={handleResetPassword} /> : <Navigate to="/login" />} />
                <Route path="/*" element={user ? (!academicYear ? <SetAcademicYearContent /> : <MainAppContent />) : <Navigate to="/login" state={{ from: location }} replace />} />
            </Routes>
        );
    };

    return (
        <Router>
            <AppRoutes />
        </Router>
    );
};

export default App;

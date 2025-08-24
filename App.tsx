

import React, { useState, useCallback, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Student, Exam, StudentStatus, TcRecord, Grade, GradeDefinition, Staff, EmploymentStatus, FeePayments, SubjectMark, User, Role, InventoryItem, HostelResident, HostelRoom, HostelStaff, HostelInventoryItem, StockLog, StockLogType, ServiceCertificateRecord, PaymentStatus } from './types';
import { GRADE_DEFINITIONS, TERMINAL_EXAMS, GRADES_LIST, INITIAL_STUDENTS, INITIAL_STAFF, INITIAL_INVENTORY, INITIAL_HOSTEL_ROOMS, INITIAL_HOSTEL_RESIDENTS, INITIAL_HOSTEL_STAFF, INITIAL_HOSTEL_INVENTORY, INITIAL_STOCK_LOGS } from './constants';
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
import StaffFormModal from './components/TeacherFormModal';
import StaffDetailPage from './pages/StaffDetailPage';
import FeeManagementPage from './pages/FeeManagementPage';
import ClassMarkStatementPage from './pages/ClassMarkStatementPage';
import PromotionPage from './pages/PromotionPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import InventoryPage from './pages/InventoryPage';
import InventoryFormModal from './components/InventoryFormModal';
import ImportStudentsModal from './components/ImportStudentsModal';
import TransferStudentModal from './components/TransferStudentModal';
import { calculateStudentResult, getNextGrade, createDefaultFeePayments, sanitizeForJson } from './utils';

// Staff Certificate Pages
import StaffDocumentsPage from './pages/StaffDocumentsPage';
import GenerateServiceCertificatePage from './pages/GenerateServiceCertificatePage';
import PrintServiceCertificatePage from './pages/PrintServiceCertificatePage';

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
import ChangePasswordPage from './pages/ChangePasswordPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// Admin Pages
import ManageUsersPage from './pages/ManageUsersPage';
import UserFormModal from './components/UserFormModal';

// Local Storage Helper Functions
const getFromLocalStorage = (key: string, initialValue: any) => {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return initialValue;
    }
};

const saveToLocalStorage = (key: string, value: any) => {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error writing to localStorage key “${key}”:`, error);
    }
};


const App: React.FC = () => {
    // --- AUTHENTICATION STATE ---
    const [user, setUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>(() => getFromLocalStorage('users', []));
    const [error, setError] = useState('');

    // --- APPLICATION STATE & LOGIC ---
    const [academicYear, setAcademicYear] = useState<string | null>(null);
    const [students, setStudents] = useState<Student[]>(() => getFromLocalStorage('students', INITIAL_STUDENTS));
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
    const [tcRecords, setTcRecords] = useState<TcRecord[]>(() => getFromLocalStorage('tcRecords', []));
    const [gradeDefinitions, setGradeDefinitions] = useState<Record<Grade, GradeDefinition>>(() => getFromLocalStorage('gradeDefinitions', GRADE_DEFINITIONS));

    // --- Staff Management State ---
    const [staff, setStaff] = useState<Staff[]>(() => getFromLocalStorage('staff', INITIAL_STAFF));
    const [isStaffFormModalOpen, setIsStaffFormModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [deletingStaff, setDeletingStaff] = useState<Staff | null>(null);
    const [serviceCertificateRecords, setServiceCertificateRecords] = useState<ServiceCertificateRecord[]>(() => getFromLocalStorage('serviceCertificateRecords', []));
    
    // --- Inventory Management State ---
    const [inventory, setInventory] = useState<InventoryItem[]>(() => getFromLocalStorage('inventory', INITIAL_INVENTORY));
    const [isInventoryFormModalOpen, setIsInventoryFormModalOpen] = useState(false);
    const [editingInventoryItem, setEditingInventoryItem] = useState<InventoryItem | null>(null);
    const [deletingInventoryItem, setDeletingInventoryItem] = useState<InventoryItem | null>(null);

    // --- Hostel Management State ---
    const [hostelResidents, setHostelResidents] = useState<HostelResident[]>(() => getFromLocalStorage('hostelResidents', INITIAL_HOSTEL_RESIDENTS));
    const [hostelRooms, setHostelRooms] = useState<HostelRoom[]>(() => getFromLocalStorage('hostelRooms', INITIAL_HOSTEL_ROOMS));
    const [hostelStaff, setHostelStaff] = useState<HostelStaff[]>(() => getFromLocalStorage('hostelStaff', INITIAL_HOSTEL_STAFF));
    const [hostelInventory, setHostelInventory] = useState<HostelInventoryItem[]>(() => getFromLocalStorage('hostelInventory', INITIAL_HOSTEL_INVENTORY));
    const [hostelStockLogs, setHostelStockLogs] = useState<StockLog[]>(() => getFromLocalStorage('hostelStockLogs', INITIAL_STOCK_LOGS));
    const [isHostelStaffFormModalOpen, setIsHostelStaffFormModalOpen] = useState(false);
    const [editingHostelStaff, setEditingHostelStaff] = useState<HostelStaff | null>(null);
    const [deletingHostelStaff, setDeletingHostelStaff] = useState<HostelStaff | null>(null);

    // --- User Management State (Admin) ---
    const [isUserFormModalOpen, setIsUserFormModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);

    // --- Import Modal State ---
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importTargetGrade, setImportTargetGrade] = useState<Grade | null>(null);

    // --- Transfer Modal State ---
    const [transferringStudent, setTransferringStudent] = useState<Student | null>(null);
    
    // --- Confirmation Modal States ---
    const [studentToConfirmEdit, setStudentToConfirmEdit] = useState<Student | null>(null);
    const [pendingImportData, setPendingImportData] = useState<{ students: Omit<Student, 'id'>[], grade: Grade } | null>(null);

    // --- ROLE-BASED ACCESS STATE ---
    const [teacherAssignedGrade, setTeacherAssignedGrade] = useState<Grade | null>(null);
    const [visibleStudents, setVisibleStudents] = useState<Student[]>([]);


    // --- DATA PERSISTENCE TO LOCALSTORAGE ---
    useEffect(() => { saveToLocalStorage('users', users); }, [users]);
    useEffect(() => { saveToLocalStorage('students', students); }, [students]);
    useEffect(() => { saveToLocalStorage('staff', staff); }, [staff]);
    useEffect(() => { saveToLocalStorage('tcRecords', tcRecords); }, [tcRecords]);
    useEffect(() => { saveToLocalStorage('gradeDefinitions', gradeDefinitions); }, [gradeDefinitions]);
    useEffect(() => { saveToLocalStorage('serviceCertificateRecords', serviceCertificateRecords); }, [serviceCertificateRecords]);
    useEffect(() => { saveToLocalStorage('inventory', inventory); }, [inventory]);
    useEffect(() => { saveToLocalStorage('hostelResidents', hostelResidents); }, [hostelResidents]);
    useEffect(() => { saveToLocalStorage('hostelRooms', hostelRooms); }, [hostelRooms]);
    useEffect(() => { saveToLocalStorage('hostelStaff', hostelStaff); }, [hostelStaff]);
    useEffect(() => { saveToLocalStorage('hostelInventory', hostelInventory); }, [hostelInventory]);
    useEffect(() => { saveToLocalStorage('hostelStockLogs', hostelStockLogs); }, [hostelStockLogs]);

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

    // --- Filter students based on user role ---
    useEffect(() => {
        if (user?.role === Role.TEACHER) {
            // Find the staff member record that corresponds to the logged-in user by matching names.
            const staffMemberForUser = staff.find(s => `${s.firstName} ${s.lastName}` === user.name);
            let assignedGrade: Grade | null = null;
            
            if (staffMemberForUser) {
                // If a staff member is found, find the grade they are assigned to as a class teacher.
                const assignedGradeEntry = Object.entries(gradeDefinitions).find(
                    ([, def]) => def.classTeacherId === staffMemberForUser.id
                );
                assignedGrade = assignedGradeEntry ? assignedGradeEntry[0] as Grade : null;
            }
            
            setTeacherAssignedGrade(assignedGrade);

            if (assignedGrade) {
                // Filter students to show only those in the assigned grade.
                setVisibleStudents(students.filter(s => s.grade === assignedGrade));
            } else {
                // If no grade is assigned, or the teacher isn't in the staff list, show no students.
                setVisibleStudents([]);
            }
        } else { // For Admins or other roles, show all students.
            setVisibleStudents(students);
            setTeacherAssignedGrade(null);
        }
    }, [user, students, gradeDefinitions, staff]);


    const handleRegister = useCallback((name: string, username: string, password: string): Promise<{ success: boolean; message?: string }> => {
        if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
            return Promise.resolve({ success: false, message: 'Username already exists.' });
        }

        // This function is now only for the first user, who becomes admin.
        const role = users.length === 0 ? Role.ADMIN : Role.TEACHER;

        const newUser: User = {
            id: String(Date.now()),
            name,
            username,
            password_plaintext: password,
            role
        };
        
        setUsers(prevUsers => [...prevUsers, newUser]);

        return Promise.resolve({ success: true, message: 'Admin account created successfully! Please log in.' });
    }, [users]);

    const handleLogin = useCallback((username: string, password: string) => {
        const foundUser = users.find(u => u.username === username && u.password_plaintext === password);
        if (foundUser) {
            setUser(foundUser);
            sessionStorage.setItem('user', JSON.stringify(foundUser));
            setError('');
        } else {
            setError('Invalid username or password');
            setTimeout(() => setError(''), 3000);
        }
    }, [users]);

    const handleLogout = useCallback(() => {
        setUser(null);
        setAcademicYear(null);
        sessionStorage.removeItem('user');
        localStorage.removeItem('academicYear');
    }, []);

    const handleSetAcademicYear = useCallback((year: string) => {
        setAcademicYear(year);
        localStorage.setItem('academicYear', year);
    }, []);
    
    const handleForgotPassword = useCallback(async (username: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
        const userExists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
        if (!userExists) {
            return { success: false, message: "Username not found." };
        }

        setUsers(prevUsers =>
            prevUsers.map(u =>
                u.username.toLowerCase() === username.toLowerCase()
                    ? { ...u, password_plaintext: newPassword }
                    : u
            )
        );
        return { success: true };
    }, [users]);

    const handleChangePassword = useCallback(async (userId: string, oldPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
        const userToUpdate = users.find(u => u.id === userId);
        if (!userToUpdate) {
            return { success: false, message: "User not found. Please log in again." };
        }
        if (userToUpdate.password_plaintext !== oldPassword) {
            return { success: false, message: "Incorrect current password." };
        }

        setUsers(prevUsers =>
            prevUsers.map(u =>
                u.id === userId
                    ? { ...u, password_plaintext: newPassword }
                    : u
            )
        );

        setTimeout(() => {
            handleLogout();
        }, 1800);

        return { success: true };
    }, [users, handleLogout]);


    const handleUpdateGradeDefinition = useCallback((grade: Grade, newDefinition: GradeDefinition) => {
        setGradeDefinitions(prev => ({
            ...prev,
            [grade]: newDefinition,
        }));
    }, []);

    const handleAssignClassToStaff = useCallback((staffId: number, newGradeKey: Grade | null) => {
        setGradeDefinitions(prevDefs => {
            const newDefs = sanitizeForJson(prevDefs);
            
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
        setEditingStudent(sanitizeForJson(student));
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
        setDeletingStaff(null);
        setIsInventoryFormModalOpen(false);
        setEditingInventoryItem(null);
        setDeletingInventoryItem(null);
        setIsImportModalOpen(false);
        setImportTargetGrade(null);
        setTransferringStudent(null);
        setIsHostelStaffFormModalOpen(false);
        setEditingHostelStaff(null);
        setDeletingHostelStaff(null);
        setIsUserFormModalOpen(false);
        setEditingUser(null);
        setDeletingUser(null);
    }, []);

    const handleFormSubmit = useCallback((studentData: Omit<Student, 'id'>) => {
        if (editingStudent) {
            setStudentToConfirmEdit({ ...studentData, id: editingStudent.id });
            setIsFormModalOpen(false);
            setEditingStudent(null);
        } else {
            setStudents(prev => [
                ...prev,
                { ...studentData, id: Date.now() },
            ]);
            closeModal();
        }
    }, [editingStudent, closeModal]);

    const handleConfirmEdit = useCallback(() => {
        if (studentToConfirmEdit) {
            setStudents(prev =>
                prev.map(s =>
                    s.id === studentToConfirmEdit.id ? studentToConfirmEdit : s
                )
            );
            setStudentToConfirmEdit(null);
        }
    }, [studentToConfirmEdit]);

    const handleDeleteConfirm = useCallback(() => {
        if (deletingStudent) {
            setStudents(prev => prev.filter(s => s.id !== deletingStudent.id));
            closeModal();
        }
    }, [deletingStudent, closeModal]);

    const handleBulkAddStudents = useCallback((studentsData: Omit<Student, 'id'>[], grade: Grade) => {
        setPendingImportData({ students: studentsData, grade });
        closeModal();
    }, [closeModal]);

    const handleConfirmImport = useCallback(() => {
        if (pendingImportData) {
            const newStudentsWithIds = pendingImportData.students.map((s, index) => ({
                ...s,
                id: Date.now() + index,
            }));
            setStudents(prev => [...prev, ...newStudentsWithIds]);
            setPendingImportData(null);
        }
    }, [pendingImportData]);


    const handleAcademicUpdate = useCallback((studentId: number, academicPerformance: Exam[]) => {
        setStudents(prev =>
            prev.map(s =>
                s.id === studentId
                    ? { ...sanitizeForJson(s), academicPerformance }
                    : s
            )
        );
    }, []);

    // --- User Management Handlers (Admin) ---
    const openAddUserModal = useCallback(() => {
        setEditingUser(null);
        setIsUserFormModalOpen(true);
    }, []);

    const openEditUserModal = useCallback((userToEdit: User) => {
        setEditingUser(userToEdit);
        setIsUserFormModalOpen(true);
    }, []);

    const openDeleteUserConfirm = useCallback((userToDelete: User) => {
        setDeletingUser(userToDelete);
    }, []);

    const handleUserFormSubmit = useCallback((
        userData: Omit<User, 'id' | 'role' | 'password_plaintext'> & { password_plaintext?: string },
        role: Role
    ) => {
        if (editingUser) {
            setUsers(prev => prev.map(u => u.id === editingUser.id ? {
                ...editingUser,
                name: userData.name,
                username: userData.username,
                role: role,
                password_plaintext: userData.password_plaintext || editingUser.password_plaintext
            } : u));
        } else {
            const newUser: User = {
                id: String(Date.now()),
                name: userData.name,
                username: userData.username,
                password_plaintext: userData.password_plaintext!,
                role: role,
            };
            setUsers(prev => [...prev, newUser]);
        }
        closeModal();
    }, [editingUser, closeModal]);
    
    const handleDeleteUserConfirm = useCallback(() => {
        if (deletingUser) {
            if (user?.id === deletingUser.id) {
                alert("You cannot delete your own account.");
                closeModal();
                return;
            }
            setUsers(prev => prev.filter(u => u.id !== deletingUser.id));
            closeModal();
        }
    }, [deletingUser, user, closeModal]);

    // --- Staff Handlers ---
    const openAddStaffModal = useCallback(() => {
        setEditingStaff(null);
        setIsStaffFormModalOpen(true);
    }, []);

    const openEditStaffModal = useCallback((staffMember: Staff) => {
        setEditingStaff(sanitizeForJson(staffMember));
        setIsStaffFormModalOpen(true);
    }, []);

    const openDeleteStaffConfirm = useCallback((staffMember: Staff) => {
        setDeletingStaff(staffMember);
    }, []);

    const handleDeleteStaffConfirm = useCallback(() => {
        if (deletingStaff) {
            setStaff(prev => prev.filter(s => s.id !== deletingStaff.id));
            
            const assignedGradeKey = Object.keys(gradeDefinitions).find(g => gradeDefinitions[g as Grade]?.classTeacherId === deletingStaff.id) as Grade | undefined;
            if (assignedGradeKey) {
                handleAssignClassToStaff(deletingStaff.id, null);
            }
            closeModal();
        }
    }, [deletingStaff, closeModal, gradeDefinitions, handleAssignClassToStaff]);

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

    const handleSaveServiceCertificate = useCallback((certData: Omit<ServiceCertificateRecord, 'id'>) => {
        const newRecord: ServiceCertificateRecord = { ...certData, id: Date.now() };
        setServiceCertificateRecords(prev => [...prev, newRecord]);
        
        setStaff(prevStaff =>
            prevStaff.map(s => 
                s.id === certData.staffDetails.staffNumericId
                ? { ...sanitizeForJson(s), status: EmploymentStatus.RESIGNED }
                : s
            )
        );
    }, []);
    
    // --- Inventory Handlers ---
    const openAddInventoryModal = useCallback(() => {
        setEditingInventoryItem(null);
        setIsInventoryFormModalOpen(true);
    }, []);

    const openEditInventoryModal = useCallback((item: InventoryItem) => {
        setEditingInventoryItem(sanitizeForJson(item));
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

    // --- Hostel Handlers ---
    const handleUpdateHostelStock = useCallback((itemId: number, change: number, notes: string) => {
        let updatedItemName = '';
        setHostelInventory(prev => 
            prev.map(item => {
                if (item.id === itemId) {
                    updatedItemName = item.name;
                    return { ...sanitizeForJson(item), currentStock: item.currentStock + change };
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
    
    const openAddHostelStaffModal = useCallback(() => {
        setEditingHostelStaff(null);
        setIsHostelStaffFormModalOpen(true);
    }, []);

    const openEditHostelStaffModal = useCallback((staffMember: HostelStaff) => {
        setEditingHostelStaff(sanitizeForJson(staffMember));
        setIsHostelStaffFormModalOpen(true);
    }, []);

    const openDeleteHostelStaffConfirm = useCallback((staffMember: HostelStaff) => {
        setDeletingHostelStaff(staffMember);
    }, []);

    const handleHostelStaffFormSubmit = useCallback((staffData: Omit<HostelStaff, 'id' | 'paymentStatus' | 'attendancePercent'>) => {
        if (editingHostelStaff) {
            setHostelStaff(prev =>
                prev.map(s =>
                    s.id === editingHostelStaff.id ? { ...s, ...staffData, id: s.id } : s
                )
            );
        } else {
            setHostelStaff(prev => [
                ...prev,
                { ...staffData, id: Date.now(), paymentStatus: PaymentStatus.PENDING, attendancePercent: 100 },
            ]);
        }
        closeModal();
    }, [editingHostelStaff, closeModal]);

    const handleDeleteHostelStaffConfirm = useCallback(() => {
        if (deletingHostelStaff) {
            setHostelStaff(prev => prev.filter(s => s.id !== deletingHostelStaff.id));
            closeModal();
        }
    }, [deletingHostelStaff, closeModal]);


    const handleSaveTc = useCallback((tcData: Omit<TcRecord, 'id'>) => {
        const newRecord: TcRecord = { ...tcData, id: Date.now() };
        setTcRecords(prev => [...prev, newRecord]);
        setStudents(prevStudents =>
            prevStudents.map(s => 
                s.id === tcData.studentDetails.studentNumericId
                ? { ...sanitizeForJson(s), status: StudentStatus.TRANSFERRED, transferDate: tcData.tcData.issueDate }
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
                s.id === studentId ? { ...sanitizeForJson(s), feePayments } : s
            )
        );
    }, []);

    const handleUpdateClassMarks = useCallback((marksByStudentId: Map<number, SubjectMark[]>, examId: string) => {
        setStudents(prevStudents => {
            return prevStudents.map(student => {
                if (marksByStudentId.has(student.id)) {
                    const newMarks = marksByStudentId.get(student.id)!;
                    const updatedStudent = sanitizeForJson(student);
                    const performance = updatedStudent.academicPerformance || [];
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

            const sanitizedStudent = sanitizeForJson(student);
            const gradeDef = gradeDefinitions[student.grade];
            const finalExam = student.academicPerformance?.find(e => e.id === finalExamId);
            
            if (!finalExam || !gradeDef) {
                return { ...sanitizedStudent, academicPerformance: [], feePayments: createDefaultFeePayments() };
            }
    
            const { finalResult } = calculateStudentResult(finalExam.results, gradeDef, student.grade);
    
            if (finalResult === 'FAIL') {
                return { ...sanitizedStudent, academicPerformance: [], feePayments: createDefaultFeePayments() };
            } else {
                if (student.grade === Grade.X) {
                    return { ...sanitizedStudent, status: StudentStatus.TRANSFERRED, transferDate: `Graduated in ${academicYear}`, academicPerformance: [], feePayments: createDefaultFeePayments() };
                } else {
                    const nextGrade = getNextGrade(student.grade);
                    return nextGrade ? { ...sanitizedStudent, grade: nextGrade, rollNo: student.rollNo, academicPerformance: [], feePayments: createDefaultFeePayments() } : student;
                }
            }
        });
        setStudents(updatedStudents);
        handleLogout();
    }, [students, gradeDefinitions, academicYear, handleLogout]);

    const openImportModal = useCallback((grade: Grade | null) => {
        setImportTargetGrade(grade);
        setIsImportModalOpen(true);
    }, []);

    const openTransferModal = useCallback((student: Student) => {
        setTransferringStudent(student);
    }, []);

    const handleTransferStudent = useCallback((studentId: number, newGrade: Grade, newRollNo: number) => {
        setStudents(prev =>
            prev.map(s =>
                s.id === studentId
                    ? { ...sanitizeForJson(s), grade: newGrade, rollNo: newRollNo }
                    : s
            )
        );
        closeModal();
    }, [closeModal]);

    const MainAppContent = () => {
        const location = useLocation();
        const navigate = useNavigate();
        const isPrintPage = (location.pathname.startsWith('/report-card/') && location.pathname.split('/').length > 3) || location.pathname.startsWith('/transfers/print') || location.pathname.startsWith('/reports/class-statement') || location.pathname.startsWith('/staff/certificates/print');
        const notificationMessage = (location.state as { message?: string })?.message;

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
                        <Route path="/" element={<DashboardPage user={user!} onAddStudent={openAddModal} studentCount={visibleStudents.filter(s => s.status === StudentStatus.ACTIVE).length} academicYear={academicYear!} onSetAcademicYear={handleSetAcademicYear} />} />
                        <Route path="/students" element={<StudentListPage students={visibleStudents.filter(s => s.status === StudentStatus.ACTIVE)} onAdd={openAddModal} onEdit={openEditModal} academicYear={academicYear!} user={user!} />} />
                        <Route path="/student/:studentId" element={<StudentDetailPage students={visibleStudents} onEdit={openEditModal} academicYear={academicYear!} />} />
                        <Route path="/reports/search" element={<ReportSearchPage students={visibleStudents} academicYear={academicYear!} user={user!} teacherAssignedGrade={teacherAssignedGrade} />} />
                        <Route path="/reports/class-statement/:grade/:examId" element={<ClassMarkStatementPage students={visibleStudents} gradeDefinitions={gradeDefinitions} academicYear={academicYear!} onUpdateClassMarks={handleUpdateClassMarks} />} />
                        <Route path="/report-card/:studentId" element={<ProgressReportPage students={visibleStudents} academicYear={academicYear!} />} />
                        <Route path="/report-card/:studentId/:examId" element={<PrintableReportCardPage students={visibleStudents} gradeDefinitions={gradeDefinitions} academicYear={academicYear!} />} />
                        <Route path="/student/:studentId/academics" element={<AcademicPerformancePage students={visibleStudents} onUpdateAcademic={handleAcademicUpdate} gradeDefinitions={gradeDefinitions} academicYear={academicYear!} />} />
                        <Route path="/classes" element={<ClassListPage gradeDefinitions={gradeDefinitions} staff={staff} onOpenImportModal={openImportModal} user={user!} teacherAssignedGrade={teacherAssignedGrade} />} />
                        <Route path="/classes/:grade" element={<ClassStudentsPage students={visibleStudents} staff={staff} gradeDefinitions={gradeDefinitions} onUpdateGradeDefinition={handleUpdateGradeDefinition} academicYear={academicYear!} onOpenImportModal={openImportModal} onOpenTransferModal={openTransferModal} onDelete={openDeleteConfirm} />} />
                        <Route path="/staff" element={<ManageStaffPage staff={staff} gradeDefinitions={gradeDefinitions} onAdd={openAddStaffModal} onEdit={openEditStaffModal} onDelete={openDeleteStaffConfirm} />} />
                        <Route path="/staff/:staffId" element={<StaffDetailPage staff={staff} onEdit={openEditStaffModal} gradeDefinitions={gradeDefinitions} />} />
                        <Route path="/staff/certificates" element={<StaffDocumentsPage serviceCertificateRecords={serviceCertificateRecords} />} />
                        <Route path="/staff/certificates/generate" element={<GenerateServiceCertificatePage staff={staff} onSave={handleSaveServiceCertificate} />} />
                        <Route path="/staff/certificates/print/:certId" element={<PrintServiceCertificatePage serviceCertificateRecords={serviceCertificateRecords} />} />
                        <Route path="/transfers" element={<TransferManagementPage students={visibleStudents} tcRecords={tcRecords} />} />
                        <Route path="/transfers/register" element={<TcRegistrationPage students={visibleStudents} onSave={handleSaveTc} academicYear={academicYear!} />} />
                        <Route path="/transfers/records" element={<AllTcRecordsPage tcRecords={tcRecords} />} />
                        <Route path="/transfers/print/:tcId" element={<PrintTcPage tcRecords={tcRecords} />} />
                        <Route path="/transfers/update" element={<UpdateTcPage tcRecords={tcRecords} onUpdate={handleUpdateTc} />} />
                        <Route path="/subjects" element={<ManageSubjectsPage gradeDefinitions={gradeDefinitions} onUpdateGradeDefinition={handleUpdateGradeDefinition} />} />
                        <Route path="/fees" element={<FeeManagementPage students={visibleStudents} academicYear={academicYear!} onUpdateFeePayments={handleUpdateFeePayments} />} />
                        <Route path="/inventory" element={<InventoryPage inventory={inventory} onAdd={openAddInventoryModal} onEdit={openEditInventoryModal} onDelete={openDeleteInventoryConfirm} />} />
                        <Route path="/change-password" element={<ChangePasswordPage user={user!} onChangePassword={handleChangePassword} />} />
                        
                        {/* Admin Routes */}
                        {user!.role === Role.ADMIN && (
                          <>
                            <Route path="/users" element={<ManageUsersPage users={users} onAdd={openAddUserModal} onEdit={openEditUserModal} onDelete={openDeleteUserConfirm} />} />
                            <Route path="/promotion" element={<PromotionPage students={students} gradeDefinitions={gradeDefinitions} academicYear={academicYear!} onPromoteStudents={handlePromoteStudents} />} />
                          </>
                        )}

                        {/* Hostel Routes */}
                        <Route path="/hostel" element={<HostelDashboardPage />} />
                        <Route path="/hostel/students" element={<HostelStudentListPage residents={hostelResidents} rooms={hostelRooms} students={students} />} />
                        <Route path="/hostel/rooms" element={<HostelRoomListPage rooms={hostelRooms} residents={hostelResidents} students={students} />} />
                        <Route path="/hostel/fees" element={<HostelFeePage />} />
                        <Route path="/hostel/attendance" element={<HostelAttendancePage />} />
                        <Route path="/hostel/mess" element={<HostelMessPage />} />
                        <Route path="/hostel/staff" element={<HostelStaffPage staff={hostelStaff} onAdd={openAddHostelStaffModal} onEdit={openEditHostelStaffModal} onDelete={openDeleteHostelStaffConfirm} />} />
                        <Route path="/hostel/inventory" element={<HostelInventoryPage inventory={hostelInventory} stockLogs={hostelStockLogs} onUpdateStock={handleUpdateHostelStock} />} />
                        <Route path="/hostel/discipline" element={<HostelDisciplinePage />} />
                        <Route path="/hostel/health" element={<HostelHealthPage />} />
                        <Route path="/hostel/communication" element={<HostelCommunicationPage />} />
                        <Route path="/hostel/settings" element={<HostelSettingsPage />} />

                    </Routes>
                </main>
            </div>
        );
    }

    const LoginRedirect = () => {
        const location = useLocation();
        return <Navigate to={(location.state as { from?: string })?.from || '/'} />;
    };

    return (
        <Router>
            <Routes>
                <Route path="/register" element={!user ? (users.length > 0 ? <Navigate to="/login" /> : <RegisterPage onRegister={handleRegister} />) : <Navigate to="/" />} />
                <Route path="/forgot-password" element={!user ? <ForgotPasswordPage users={users} onResetPassword={handleForgotPassword} /> : <Navigate to="/" />} />
                <Route path="/*" element={
                    user ? <MainAppContent /> : <Navigate to="/login" state={{ from: window.location.hash.substring(1) || '/' }} />
                }/>
                <Route path="/login" element={
                    !user ? <LoginPage onLogin={handleLogin} error={error} /> : <LoginRedirect />
                }/>
            </Routes>
            {isFormModalOpen && (
                <StudentFormModal
                    isOpen={isFormModalOpen}
                    onClose={closeModal}
                    onSubmit={handleFormSubmit}
                    student={editingStudent}
                    user={user}
                    teacherAssignedGrade={teacherAssignedGrade}
                />
            )}
             {deletingStudent && (
                <ConfirmationModal
                    isOpen={!!deletingStudent}
                    onClose={closeModal}
                    onConfirm={handleDeleteConfirm}
                    title="Remove Student Record"
                >
                    <p>Are you sure you want to remove <strong>{deletingStudent.name}</strong>? This action is for correcting incorrect entries and cannot be undone.</p>
                </ConfirmationModal>
            )}
            {studentToConfirmEdit && (
                <ConfirmationModal
                    isOpen={!!studentToConfirmEdit}
                    onClose={() => setStudentToConfirmEdit(null)}
                    onConfirm={handleConfirmEdit}
                    title="Confirm Changes"
                >
                    <p>Are you sure you want to save the changes for <strong>{studentToConfirmEdit.name}</strong>?</p>
                </ConfirmationModal>
            )}
             {isStaffFormModalOpen && (
                <StaffFormModal
                    isOpen={isStaffFormModalOpen}
                    onClose={closeModal}
                    onSubmit={handleStaffFormSubmit}
                    staffMember={editingStaff}
                    allStaff={staff}
                    gradeDefinitions={gradeDefinitions}
                />
            )}
             {deletingStaff && (
                <ConfirmationModal
                    isOpen={!!deletingStaff}
                    onClose={closeModal}
                    onConfirm={handleDeleteStaffConfirm}
                    title="Remove Staff Record"
                >
                    <p>Are you sure you want to remove <strong>{deletingStaff.firstName} {deletingStaff.lastName}</strong>? This action is permanent and cannot be undone.</p>
                </ConfirmationModal>
            )}
            {isInventoryFormModalOpen && (
                <InventoryFormModal
                    isOpen={isInventoryFormModalOpen}
                    onClose={closeModal}
                    onSubmit={handleInventoryFormSubmit}
                    item={editingInventoryItem}
                />
            )}
            {deletingInventoryItem && (
                <ConfirmationModal
                    isOpen={!!deletingInventoryItem}
                    onClose={closeModal}
                    onConfirm={handleDeleteInventoryConfirm}
                    title="Delete Inventory Item"
                >
                    <p>Are you sure you want to delete the item <strong>{deletingInventoryItem.name}</strong>? This action cannot be undone.</p>
                </ConfirmationModal>
            )}
            {isImportModalOpen && (
                <ImportStudentsModal
                    isOpen={isImportModalOpen}
                    onClose={closeModal}
                    onImport={handleBulkAddStudents}
                    grade={importTargetGrade}
                    allStudents={students}
                    allGrades={GRADES_LIST}
                />
            )}
            {pendingImportData && (
                 <ConfirmationModal
                    isOpen={!!pendingImportData}
                    onClose={() => setPendingImportData(null)}
                    onConfirm={handleConfirmImport}
                    title="Confirm Student Import"
                >
                    <p>Are you sure you want to import <strong>{pendingImportData.students.length}</strong> students into <strong>{pendingImportData.grade}</strong>? This action cannot be easily undone.</p>
                </ConfirmationModal>
            )}
            {transferringStudent && (
                <TransferStudentModal
                    isOpen={!!transferringStudent}
                    onClose={closeModal}
                    onConfirm={handleTransferStudent}
                    student={transferringStudent}
                    allStudents={students}
                    allGrades={GRADES_LIST}
                />
            )}
            {isHostelStaffFormModalOpen && (
                <HostelStaffFormModal
                    isOpen={isHostelStaffFormModalOpen}
                    onClose={closeModal}
                    onSubmit={handleHostelStaffFormSubmit}
                    staffMember={editingHostelStaff}
                />
            )}
            {deletingHostelStaff && (
                <ConfirmationModal
                    isOpen={!!deletingHostelStaff}
                    onClose={closeModal}
                    onConfirm={handleDeleteHostelStaffConfirm}
                    title="Remove Hostel Staff"
                >
                    <p>Are you sure you want to remove <strong>{deletingHostelStaff.name}</strong>? This action cannot be undone.</p>
                </ConfirmationModal>
            )}
            {isUserFormModalOpen && (
                <UserFormModal
                    isOpen={isUserFormModalOpen}
                    onClose={closeModal}
                    onSubmit={handleUserFormSubmit}
                    user={editingUser}
                />
            )}
            {deletingUser && (
                <ConfirmationModal
                    isOpen={!!deletingUser}
                    onClose={closeModal}
                    onConfirm={handleDeleteUserConfirm}
                    title="Delete User"
                >
                    <p>Are you sure you want to delete the user <strong>{deletingUser.name}</strong>? This action cannot be undone.</p>
                </ConfirmationModal>
            )}
        </Router>
    );
};

export default App;
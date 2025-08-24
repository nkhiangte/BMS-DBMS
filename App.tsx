
import React, { useState, useCallback, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Student, Exam, StudentStatus, TcRecord, Grade, GradeDefinition, Staff, EmploymentStatus, FeePayments, SubjectMark, User, Role, InventoryItem, HostelResident, HostelRoom, HostelStaff, HostelInventoryItem, StockLog, StockLogType, ServiceCertificateRecord, PaymentStatus } from './types';
import { GRADE_DEFINITIONS, TERMINAL_EXAMS, GRADES_LIST } from './constants';
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
import { db } from './firebase';
import { collection, onSnapshot, doc, addDoc } from 'firebase/firestore';


const App: React.FC = () => {
    // --- AUTHENTICATION STATE ---
    const [user, setUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState('');


    // --- APPLICATION STATE & LOGIC ---
    const [academicYear, setAcademicYear] = useState<string | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
    const [tcRecords, setTcRecords] = useState<TcRecord[]>([]);
    const [gradeDefinitions, setGradeDefinitions] = useState<Record<Grade, GradeDefinition>>(GRADE_DEFINITIONS);

    // --- Staff Management State ---
    const [staff, setStaff] = useState<Staff[]>([]);
    const [isStaffFormModalOpen, setIsStaffFormModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [deletingStaff, setDeletingStaff] = useState<Staff | null>(null);
    const [serviceCertificateRecords, setServiceCertificateRecords] = useState<ServiceCertificateRecord[]>([]);
    
    // --- Inventory Management State ---
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [isInventoryFormModalOpen, setIsInventoryFormModalOpen] = useState(false);
    const [editingInventoryItem, setEditingInventoryItem] = useState<InventoryItem | null>(null);
    const [deletingInventoryItem, setDeletingInventoryItem] = useState<InventoryItem | null>(null);

    // --- Hostel Management State ---
    const [hostelResidents, setHostelResidents] = useState<HostelResident[]>([]);
    const [hostelRooms, setHostelRooms] = useState<HostelRoom[]>([]);
    const [hostelStaff, setHostelStaff] = useState<HostelStaff[]>([]);
    const [hostelInventory, setHostelInventory] = useState<HostelInventoryItem[]>([]);
    const [hostelStockLogs, setHostelStockLogs] = useState<StockLog[]>([]);
    const [isHostelStaffFormModalOpen, setIsHostelStaffFormModalOpen] = useState(false);
    const [editingHostelStaff, setEditingHostelStaff] = useState<HostelStaff | null>(null);
    const [deletingHostelStaff, setDeletingHostelStaff] = useState<HostelStaff | null>(null);

    // --- Import Modal State ---
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importTargetGrade, setImportTargetGrade] = useState<Grade | null>(null);

    // --- Transfer Modal State ---
    const [transferringStudent, setTransferringStudent] = useState<Student | null>(null);
    
    // --- Confirmation Modal States ---
    const [studentToConfirmEdit, setStudentToConfirmEdit] = useState<Student | null>(null);
    const [pendingImportData, setPendingImportData] = useState<{ students: Omit<Student, 'id'>[], grade: Grade } | null>(null);

    
    // --- DATA FETCHING FROM FIRESTORE ---
    useEffect(() => {
        // Set up listener for users regardless of login state to allow registration
        const usersUnsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
            const fetchedUsers = snapshot.docs.map(d => ({ ...sanitizeForJson(d.data()), id: d.id }) as User);
            setUsers(fetchedUsers);
        });

        if (!user) {
            // Clear data on logout to prevent showing old data on next login
            setStudents([]);
            setStaff([]);
            setTcRecords([]);
            setGradeDefinitions(GRADE_DEFINITIONS); // Reset to default constants
            setServiceCertificateRecords([]);
            setInventory([]);
            setHostelResidents([]);
            setHostelRooms([]);
            setHostelStaff([]);
            setHostelInventory([]);
            setHostelStockLogs([]);
            return () => { usersUnsubscribe() };
        }

        // Set up real-time listeners for all our data collections
        const unsubscribes: (() => void)[] = [usersUnsubscribe];

        unsubscribes.push(onSnapshot(collection(db, "students"), (snapshot) => setStudents(snapshot.docs.map(d => sanitizeForJson(d.data()) as Student))));
        unsubscribes.push(onSnapshot(collection(db, "staff"), (snapshot) => setStaff(snapshot.docs.map(d => sanitizeForJson(d.data()) as Staff))));
        unsubscribes.push(onSnapshot(collection(db, "tcRecords"), (snapshot) => setTcRecords(snapshot.docs.map(d => sanitizeForJson(d.data()) as TcRecord))));
        unsubscribes.push(onSnapshot(collection(db, "serviceCertificateRecords"), (snapshot) => setServiceCertificateRecords(snapshot.docs.map(d => sanitizeForJson(d.data()) as ServiceCertificateRecord))));
        unsubscribes.push(onSnapshot(collection(db, "inventory"), (snapshot) => setInventory(snapshot.docs.map(d => sanitizeForJson(d.data()) as InventoryItem))));
        unsubscribes.push(onSnapshot(collection(db, "hostelResidents"), (snapshot) => setHostelResidents(snapshot.docs.map(d => sanitizeForJson(d.data()) as HostelResident))));
        unsubscribes.push(onSnapshot(collection(db, "hostelRooms"), (snapshot) => setHostelRooms(snapshot.docs.map(d => sanitizeForJson(d.data()) as HostelRoom))));
        unsubscribes.push(onSnapshot(collection(db, "hostelStaff"), (snapshot) => setHostelStaff(snapshot.docs.map(d => sanitizeForJson(d.data()) as HostelStaff))));
        unsubscribes.push(onSnapshot(collection(db, "hostelInventory"), (snapshot) => setHostelInventory(snapshot.docs.map(d => sanitizeForJson(d.data()) as HostelInventoryItem))));
        unsubscribes.push(onSnapshot(collection(db, "hostelStockLogs"), (snapshot) => setHostelStockLogs(snapshot.docs.map(d => sanitizeForJson(d.data()) as StockLog))));
        
        // Configuration is stored in a single document
        unsubscribes.push(onSnapshot(doc(db, "configuration", "gradeDefinitions"), (doc) => {
            if (doc.exists()) {
                setGradeDefinitions(sanitizeForJson(doc.data()) as Record<Grade, GradeDefinition>);
            } else {
                 console.log("NOTE: 'gradeDefinitions' document not found in Firestore. Using local defaults. You may want to seed this in your database.");
            }
        }));

        // Cleanup function to detach listeners on logout or component unmount
        return () => {
            unsubscribes.forEach(unsub => unsub());
        };
    }, [user]); // This effect runs whenever the user logs in or out


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

    const handleRegister = useCallback(async (name: string, username: string, password: string) => {
        if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
            return { success: false, message: 'Username already exists.' };
        }

        const role = users.length === 0 ? Role.ADMIN : Role.TEACHER;

        const newUser: Omit<User, 'id'> = {
            name,
            username,
            password_plaintext: password,
            role
        };

        try {
            await addDoc(collection(db, 'users'), newUser);
            return { success: true, message: 'Registration successful! Please log in.' };
        } catch (e) {
            console.error("Error adding document: ", e);
            return { success: false, message: 'Registration failed. Please try again.' };
        }
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
                        <Route path="/" element={<DashboardPage user={user!} onAddStudent={openAddModal} studentCount={students.filter(s => s.status === StudentStatus.ACTIVE).length} academicYear={academicYear!} onSetAcademicYear={handleSetAcademicYear} />} />
                        <Route path="/students" element={<StudentListPage students={students.filter(s => s.status === StudentStatus.ACTIVE)} onAdd={openAddModal} onEdit={openEditModal} academicYear={academicYear!} />} />
                        <Route path="/student/:studentId" element={<StudentDetailPage students={students} onEdit={openEditModal} academicYear={academicYear!} />} />
                        <Route path="/reports/search" element={<ReportSearchPage students={students} academicYear={academicYear!} />} />
                        <Route path="/reports/class-statement/:grade/:examId" element={<ClassMarkStatementPage students={students} gradeDefinitions={gradeDefinitions} academicYear={academicYear!} onUpdateClassMarks={handleUpdateClassMarks} />} />
                        <Route path="/report-card/:studentId" element={<ProgressReportPage students={students} academicYear={academicYear!} />} />
                        <Route path="/report-card/:studentId/:examId" element={<PrintableReportCardPage students={students} gradeDefinitions={gradeDefinitions} academicYear={academicYear!} />} />
                        <Route path="/student/:studentId/academics" element={<AcademicPerformancePage students={students} onUpdateAcademic={handleAcademicUpdate} gradeDefinitions={gradeDefinitions} academicYear={academicYear!} />} />
                        <Route path="/classes" element={<ClassListPage gradeDefinitions={gradeDefinitions} staff={staff} onOpenImportModal={openImportModal} />} />
                        <Route path="/classes/:grade" element={<ClassStudentsPage students={students} staff={staff} gradeDefinitions={gradeDefinitions} onUpdateGradeDefinition={handleUpdateGradeDefinition} academicYear={academicYear!} onOpenImportModal={openImportModal} onOpenTransferModal={openTransferModal} onDelete={openDeleteConfirm} />} />
                        <Route path="/staff" element={<ManageStaffPage staff={staff} gradeDefinitions={gradeDefinitions} onAdd={openAddStaffModal} onEdit={openEditStaffModal} onDelete={openDeleteStaffConfirm} />} />
                        <Route path="/staff/:staffId" element={<StaffDetailPage staff={staff} onEdit={openEditStaffModal} gradeDefinitions={gradeDefinitions} />} />
                        <Route path="/staff/certificates" element={<StaffDocumentsPage serviceCertificateRecords={serviceCertificateRecords} />} />
                        <Route path="/staff/certificates/generate" element={<GenerateServiceCertificatePage staff={staff} onSave={handleSaveServiceCertificate} />} />
                        <Route path="/staff/certificates/print/:certId" element={<PrintServiceCertificatePage serviceCertificateRecords={serviceCertificateRecords} />} />
                        <Route path="/transfers" element={<TransferManagementPage students={students} tcRecords={tcRecords} />} />
                        <Route path="/transfers/register" element={<TcRegistrationPage students={students} onSave={handleSaveTc} academicYear={academicYear!} />} />
                        <Route path="/transfers/records" element={<AllTcRecordsPage tcRecords={tcRecords} />} />
                        <Route path="/transfers/print/:tcId" element={<PrintTcPage tcRecords={tcRecords} />} />
                        <Route path="/transfers/update" element={<UpdateTcPage tcRecords={tcRecords} onUpdate={handleUpdateTc} />} />
                        <Route path="/subjects" element={<ManageSubjectsPage gradeDefinitions={gradeDefinitions} onUpdateGradeDefinition={handleUpdateGradeDefinition} />} />
                        <Route path="/fees" element={<FeeManagementPage students={students} academicYear={academicYear!} onUpdateFeePayments={handleUpdateFeePayments} />} />
                        <Route path="/promotion" element={<PromotionPage students={students} gradeDefinitions={gradeDefinitions} academicYear={academicYear!} onPromoteStudents={handlePromoteStudents} />} />
                        <Route path="/inventory" element={<InventoryPage inventory={inventory} onAdd={openAddInventoryModal} onEdit={openEditInventoryModal} onDelete={openDeleteInventoryConfirm} />} />
                        
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
                <Route path="/register" element={!user ? <RegisterPage onRegister={handleRegister} /> : <Navigate to="/" />} />
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
        </Router>
    );
};

export default App;

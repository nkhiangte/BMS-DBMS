
import React, { useState, useCallback, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Student, Exam, StudentStatus, TcRecord, Grade, GradeDefinition, Staff, EmploymentStatus, FeePayments, SubjectMark, User, Role, InventoryItem, HostelResident, HostelRoom, HostelStaff, HostelInventoryItem, StockLog, StockLogType, ServiceCertificateRecord, PaymentStatus, AttendanceRecord, AttendanceStatus } from './types';
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
import { calculateStudentResult, getNextGrade, createDefaultFeePayments, sanitizeForJson, withFirestoreErrorHandling } from './utils';
import FirestoreErrorModal from './components/FirestoreErrorModal';

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

// Attendance Pages
import AttendanceHomePage from './pages/AttendanceHomePage';
import TakeAttendancePage from './pages/TakeAttendancePage';


// Firebase integration
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: "bmsdb-4918a.firebaseapp.com",
    projectId: "bmsdb-4918a",
    databaseURL: "https://bmsdb-4918a.firebaseio.com",
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
try {
    db.settings({
        experimentalForceLongPolling: true,
    });
} catch(e) {
    console.error("Firebase settings could not be applied", e);
}
const auth = firebase.auth();
const collections = {
    students: db.collection('students'),
    staff: db.collection('staff'),
    users: db.collection('users'),
    tcRecords: db.collection('tcRecords'),
    serviceCertificateRecords: db.collection('serviceCertificateRecords'),
    inventory: db.collection('inventory'),
    hostelResidents: db.collection('hostelResidents'),
    hostelRooms: db.collection('hostelRooms'),
    hostelStaff: db.collection('hostelStaff'),
    hostelInventory: db.collection('hostelInventory'),
    hostelStockLogs: db.collection('hostelStockLogs'),
    settings: db.collection('settings'),
    attendance: db.collection('attendance'),
};


const App: React.FC = () => {
    // --- AUTHENTICATION STATE ---
    const [user, setUser] = useState<User | null>(null);
    const [isAppLoading, setIsAppLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFirstUserCheck, setIsFirstUserCheck] = useState(true);
    const [isFirstUser, setIsFirstUser] = useState(false);
    const [firestoreError, setFirestoreError] = useState<string | null>(null);

    // --- APPLICATION STATE & LOGIC ---
    const [academicYear, setAcademicYear] = useState<string | null>(localStorage.getItem('academicYear'));
    const [students, setStudents] = useState<Student[]>([]);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
    const [tcRecords, setTcRecords] = useState<TcRecord[]>([]);
    const [gradeDefinitions, setGradeDefinitions] = useState<Record<Grade, GradeDefinition>>(GRADE_DEFINITIONS);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

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

    // --- User Management State (Admin) ---
    const [users, setUsers] = useState<User[]>([]);
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

    const handlePermissionError = (operationDescription: string) => {
        console.error(`Firestore permission denied during: ${operationDescription}`);
        // The modal is specific about security rules, so we can provide a slightly more contextual message.
        setFirestoreError(`Operation failed: ${operationDescription}. This is likely due to Firestore Security Rules needing configuration.`);
    };

    const handleFirestoreWriteError = (error: { code: string; message: string } | undefined, operationName: string) => {
        if (!error) return;

        if (error.code === 'permission-denied' || error.code === 'unauthenticated') {
            handlePermissionError(operationName);
        } else {
            const userMessage = `An unexpected error occurred during ${operationName}: ${error.message}\n\nCheck the developer console for more details. Code: ${error.code}`;
            alert(userMessage);
        }
    };
    
    const withErrorHandlingAndUI = async <T,>(operation: () => Promise<T>, operationName: string, onSuccess?: (data: T) => void) => {
        const { success, data, error } = await withFirestoreErrorHandling(operation);
        if (success && data !== undefined) {
            onSuccess?.(data);
        } else {
            handleFirestoreWriteError(error, operationName);
        }
    };

    const handleSnapshotError = (error: firebase.firestore.FirestoreError, collectionName: string) => {
        console.error(`Snapshot listener for "${collectionName}" failed. Full error:`, error);
        
        const errorCode = error?.code || 'unknown';

        if (errorCode === 'permission-denied' || errorCode === 'unauthenticated') {
            handlePermissionError(`fetching real-time data from "${collectionName}"`);
        } else {
            const errorMessage = error?.message || 'An unknown error occurred.';
            const userMessage = `An unexpected error occurred while fetching real-time data from ${collectionName}: ${errorMessage}\n\nCheck the developer console for more details. Code: ${errorCode}`;
            alert(userMessage);
        }
    };

    // --- FIREBASE DATA LISTENERS & SEEDING ---
    useEffect(() => {
        const seedCollection = async (ref: firebase.firestore.CollectionReference, initialData: any[]) => {
            const { success, data: snapshot } = await withFirestoreErrorHandling(() => ref.limit(1).get());
            if (success && snapshot?.empty) {
                console.log(`Seeding ${ref.path}...`);
                const batch = db.batch();
                initialData.forEach(item => {
                    const { id, ...data } = item;
                    const docRef = ref.doc();
                    batch.set(docRef, data);
                });
                await withErrorHandlingAndUI(
                    () => batch.commit(),
                    `seeding ${ref.path}`
                );
            }
        };

        const setupListeners = () => {
            const unsubscribers = Object.entries(collections).map(([name, ref]) => {
                if (name === 'settings') return () => {};
                const setState = (data: any) => {
                    switch (name) {
                        case 'students': setStudents(data); break;
                        case 'staff': setStaff(data); break;
                        case 'users': setUsers(data); break;
                        case 'tcRecords': setTcRecords(data); break;
                        case 'serviceCertificateRecords': setServiceCertificateRecords(data); break;
                        case 'inventory': setInventory(data); break;
                        case 'hostelResidents': setHostelResidents(data); break;
                        case 'hostelRooms': setHostelRooms(data); break;
                        case 'hostelStaff': setHostelStaff(data); break;
                        case 'hostelInventory': setHostelInventory(data); break;
                        case 'hostelStockLogs': setHostelStockLogs(data); break;
                        case 'attendance': setAttendanceRecords(data as AttendanceRecord[]); break;
                    }
                };
                return ref.onSnapshot(
                    snapshot => {
                        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                        setState(data);
                    },
                    (error) => handleSnapshotError(error, name)
                );
            });

            // Handle settings separately (single document)
            const settingsDoc = collections.settings.doc('gradeDefinitions');
            const unsubSettings = settingsDoc.onSnapshot(
                doc => {
                    if (doc.exists) {
                        setGradeDefinitions(doc.data() as Record<Grade, GradeDefinition>);
                    } else {
                        console.log('Seeding gradeDefinitions...');
                        withErrorHandlingAndUI(
                            () => settingsDoc.set(GRADE_DEFINITIONS),
                            'seeding grade definitions'
                        );
                    }
                },
                (error) => handleSnapshotError(error, 'settings')
            );
            unsubscribers.push(unsubSettings);

            return () => unsubscribers.forEach(unsub => unsub());
        };

        const initializeData = async () => {
            await seedCollection(collections.students, INITIAL_STUDENTS);
            await seedCollection(collections.staff, INITIAL_STAFF);
            await seedCollection(collections.inventory, INITIAL_INVENTORY);
            await seedCollection(collections.hostelRooms, INITIAL_HOSTEL_ROOMS);
            await seedCollection(collections.hostelResidents, INITIAL_HOSTEL_RESIDENTS);
            await seedCollection(collections.hostelStaff, INITIAL_HOSTEL_STAFF);
            await seedCollection(collections.hostelInventory, INITIAL_HOSTEL_INVENTORY);
            await seedCollection(collections.hostelStockLogs, INITIAL_STOCK_LOGS);
        };

        if (user) {
            initializeData();
            return setupListeners();
        }
    }, [user]);

    // --- AUTHENTICATION LOGIC ---
    useEffect(() => {
        const checkFirstUser = async () => {
            const { success, data: snapshot, error: checkError } = await withFirestoreErrorHandling(() => collections.users.limit(1).get());
            if(success && snapshot) {
                setIsFirstUser(snapshot.empty);
            } else if (error) {
                handleFirestoreWriteError(checkError, 'checking for first user');
            }
            setIsFirstUserCheck(false);
        };
        checkFirstUser();

        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: firebase.User | null) => {
            if (firebaseUser) {
                const userDocRef = collections.users.doc(firebaseUser.uid);
                const { success, data: userDoc, error } = await withFirestoreErrorHandling(() => userDocRef.get());
                if (success && userDoc?.exists) {
                    setUser({ id: userDoc.id, ...userDoc.data() } as User);
                } else {
                    if(error) handleFirestoreWriteError(error, 'fetching user data');
                    await auth.signOut();
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setIsAppLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // --- Filter students based on user role ---
    useEffect(() => {
        if (user?.role === Role.TEACHER) {
            const staffMemberForUser = staff.find(s => `${s.firstName} ${s.lastName}` === user.name);
            let assignedGrade: Grade | null = null;
            if (staffMemberForUser) {
                const assignedGradeEntry = Object.entries(gradeDefinitions).find(
                    ([, def]) => def.classTeacherId === staffMemberForUser.id
                );
                assignedGrade = assignedGradeEntry ? assignedGradeEntry[0] as Grade : null;
            }
            setTeacherAssignedGrade(assignedGrade);
            setVisibleStudents(assignedGrade ? students.filter(s => s.grade === assignedGrade) : []);
        } else {
            setVisibleStudents(students);
            setTeacherAssignedGrade(null);
        }
    }, [user, students, gradeDefinitions, staff]);


    const handleRegister = useCallback(async (name: string, username: string, password: string): Promise<{ success: boolean; message?: string }> => {
        const { success: checkSuccess, data: snapshot, error: checkError } = await withFirestoreErrorHandling(() =>
            collections.users.where('username', '==', username).get()
        );

        if (!checkSuccess) {
            handleFirestoreWriteError(checkError, 'checking username existence');
            return { success: false, message: "Database error. Could not check username." };
        }
        
        if (snapshot && !snapshot.empty) {
            return { success: false, message: 'Username already exists.' };
        }
        
        try {
            const role = isFirstUser ? Role.ADMIN : Role.TEACHER;
            const userCredential = await auth.createUserWithEmailAndPassword(`${username}@bms.local`, password);
            const firebaseUser = userCredential.user;

            if (firebaseUser) {
                const newUser: Omit<User, 'id'> = { name, username, role };
                const { success: createSuccess, error: createError } = await withFirestoreErrorHandling(() =>
                    collections.users.doc(firebaseUser.uid).set(newUser)
                );

                if (createSuccess) {
                    setIsFirstUser(false);
                    return { success: true, message: 'Admin account created successfully! Please log in.' };
                } else {
                    handleFirestoreWriteError(createError, 'saving user details');
                    return { success: false, message: "User account created, but saving details failed. Contact admin." };
                }
            }
            return { success: false, message: 'Could not create user account.' };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }, [isFirstUser]);

    const handleLogin = useCallback(async (username: string, password: string) => {
        try {
            await auth.signInWithEmailAndPassword(`${username}@bms.local`, password);
            setError('');
        } catch (error: any) {
            setError('Invalid username or password');
            setTimeout(() => setError(''), 3000);
        }
    }, []);

    const handleLogout = useCallback(async () => {
        await auth.signOut();
        setUser(null);
        setAcademicYear(null);
        localStorage.removeItem('academicYear');
    }, []);

    const handleSetAcademicYear = useCallback((year: string) => {
        setAcademicYear(year);
        localStorage.setItem('academicYear', year);
    }, []);
    
    const handleForgotPassword = useCallback(async (username: string): Promise<{ success: boolean; message?: string }> => {
        try {
            await auth.sendPasswordResetEmail(`${username}@bms.local`);
            return { success: true, message: "Password reset email sent. Please check your inbox." };
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                return { success: false, message: "Username not found." };
            }
            return { success: false, message: error.message };
        }
    }, []);

    const handleChangePassword = useCallback(async (userId: string, oldPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser || !firebaseUser.email) return { success: false, message: "User not found." };
        
        try {
            const credential = firebase.auth.EmailAuthProvider.credential(firebaseUser.email, oldPassword);
            await firebaseUser.reauthenticateWithCredential(credential);
            await firebaseUser.updatePassword(newPassword);
            setTimeout(() => handleLogout(), 1800);
            return { success: true };
        } catch(error: any) {
             if (error.code === 'auth/wrong-password') {
                return { success: false, message: "Incorrect current password." };
            }
            return { success: false, message: error.message };
        }
    }, [handleLogout]);


    const handleUpdateGradeDefinition = useCallback(async (grade: Grade, newDefinition: GradeDefinition) => {
        const newDefs = { ...gradeDefinitions, [grade]: newDefinition };
        await withErrorHandlingAndUI(
            () => collections.settings.doc('gradeDefinitions').set(newDefs),
            'updating grade definitions'
        );
    }, [gradeDefinitions]);

    const handleAssignClassToStaff = useCallback(async (staffId: string, newGradeKey: Grade | null) => {
        const newDefs = sanitizeForJson(gradeDefinitions);
        const oldGradeKey = Object.keys(newDefs).find(g => newDefs[g as Grade]?.classTeacherId === staffId) as Grade | undefined;
        if (oldGradeKey) delete newDefs[oldGradeKey].classTeacherId;

        if (newGradeKey) {
            const otherStaffAssigned = Object.keys(newDefs).find(g => newDefs[g as Grade]?.classTeacherId && g === newGradeKey);
            if(otherStaffAssigned) delete newDefs[otherStaffAssigned as Grade].classTeacherId;
            newDefs[newGradeKey].classTeacherId = staffId;
        }
        await withErrorHandlingAndUI(
            () => collections.settings.doc('gradeDefinitions').set(newDefs),
            'assigning class teacher'
        );
    }, [gradeDefinitions]);

    const openAddModal = useCallback(() => { setEditingStudent(null); setIsFormModalOpen(true); }, []);
    const openEditModal = useCallback((student: Student) => { setEditingStudent(sanitizeForJson(student)); setIsFormModalOpen(true); }, []);
    const openDeleteConfirm = useCallback((student: Student) => { setDeletingStudent(student); }, []);

    const closeModal = useCallback(() => {
        setIsFormModalOpen(false); setEditingStudent(null); setDeletingStudent(null);
        setIsStaffFormModalOpen(false); setEditingStaff(null); setDeletingStaff(null);
        setIsInventoryFormModalOpen(false); setEditingInventoryItem(null); setDeletingInventoryItem(null);
        setIsImportModalOpen(false); setImportTargetGrade(null); setTransferringStudent(null);
        setIsHostelStaffFormModalOpen(false); setEditingHostelStaff(null); setDeletingHostelStaff(null);
        setIsUserFormModalOpen(false); setEditingUser(null); setDeletingUser(null);
    }, []);

    const handleFormSubmit = useCallback(async (studentData: Omit<Student, 'id'>) => {
        if (editingStudent) {
            setStudentToConfirmEdit({ ...studentData, id: editingStudent.id });
            setIsFormModalOpen(false);
            setEditingStudent(null);
        } else {
            await withErrorHandlingAndUI(
                () => collections.students.add(studentData),
                'creating a new student',
                () => closeModal()
            );
        }
    }, [editingStudent, closeModal]);

    const handleConfirmEdit = useCallback(async () => {
        if (studentToConfirmEdit) {
            const { id, ...data } = studentToConfirmEdit;
            await withErrorHandlingAndUI(
                () => collections.students.doc(id).update(data),
                'updating student details',
                () => setStudentToConfirmEdit(null)
            );
        }
    }, [studentToConfirmEdit]);

    const handleDeleteConfirm = useCallback(async () => {
        if (deletingStudent) {
            await withErrorHandlingAndUI(
                () => collections.students.doc(deletingStudent.id).delete(),
                'deleting a student',
                () => closeModal()
            );
        }
    }, [deletingStudent, closeModal]);

    const handleBulkAddStudents = useCallback(async (studentsData: Omit<Student, 'id'>[]) => {
        await withErrorHandlingAndUI(
            () => {
                const batch = db.batch();
                studentsData.forEach(student => {
                    const docRef = collections.students.doc();
                    batch.set(docRef, student);
                });
                return batch.commit();
            },
            'bulk adding students',
            () => closeModal()
        );
    }, [closeModal]);

    const handleConfirmImport = useCallback(async () => {
        if (pendingImportData) {
            await handleBulkAddStudents(pendingImportData.students);
            setPendingImportData(null);
        }
    }, [pendingImportData, handleBulkAddStudents]);


    const handleAcademicUpdate = useCallback(async (studentId: string, academicPerformance: Exam[]) => {
        await withErrorHandlingAndUI(
            () => collections.students.doc(studentId).update({ academicPerformance }),
            'updating academic records'
        );
    }, []);

    // --- User Management Handlers (Admin) ---
    const openAddUserModal = useCallback(() => { setEditingUser(null); setIsUserFormModalOpen(true); }, []);
    const openEditUserModal = useCallback((userToEdit: User) => { setEditingUser(userToEdit); setIsUserFormModalOpen(true); }, []);
    const openDeleteUserConfirm = useCallback((userToDelete: User) => { setDeletingUser(userToDelete); }, []);

    const handleUserFormSubmit = useCallback(async (userData: Omit<User, 'id' | 'role' | 'password_plaintext'> & { password?: string }, role: Role) => {
        if (editingUser) {
            await withErrorHandlingAndUI(
                () => collections.users.doc(editingUser.id).update({ name: userData.name, username: userData.username, role }),
                'updating a user',
                () => closeModal()
            );
        } else {
            alert("User creation through this form is not implemented for Firebase. Please use the registration page for the first user.");
            closeModal();
        }
    }, [editingUser, closeModal]);
    
    const handleDeleteUserConfirm = useCallback(async () => {
        if (deletingUser) {
            if (user?.id === deletingUser.id) {
                alert("You cannot delete your own account.");
                closeModal(); return;
            }
            await withErrorHandlingAndUI(
                () => collections.users.doc(deletingUser.id).delete(),
                'deleting a user',
                () => {
                    alert("User deleted from database. Auth user may still exist.");
                    closeModal();
                }
            );
        }
    }, [deletingUser, user, closeModal]);

    // --- Staff Handlers ---
    const openAddStaffModal = useCallback(() => { setEditingStaff(null); setIsStaffFormModalOpen(true); }, []);
    const openEditStaffModal = useCallback((staffMember: Staff) => { setEditingStaff(sanitizeForJson(staffMember)); setIsStaffFormModalOpen(true); }, []);
    const openDeleteStaffConfirm = useCallback((staffMember: Staff) => { setDeletingStaff(staffMember); }, []);

    const handleDeleteStaffConfirm = useCallback(async () => {
        if (deletingStaff) {
            await withErrorHandlingAndUI(async () => {
                await collections.staff.doc(deletingStaff.id).delete();
                const assignedGradeKey = Object.keys(gradeDefinitions).find(g => gradeDefinitions[g as Grade]?.classTeacherId === deletingStaff.id) as Grade | undefined;
                if (assignedGradeKey) {
                    await handleAssignClassToStaff(deletingStaff.id, null);
                }
            }, 'deleting staff record', () => closeModal());
        }
    }, [deletingStaff, closeModal, gradeDefinitions, handleAssignClassToStaff]);

    const handleStaffFormSubmit = useCallback(async (staffData: Omit<Staff, 'id'>, assignedGradeKey: Grade | null) => {
        const finalAssignedGradeKey = staffData.status === EmploymentStatus.ACTIVE ? assignedGradeKey : null;
        
        const operation = async (): Promise<void> => {
            let staffId: string;
            if (editingStaff) {
                staffId = editingStaff.id;
                await collections.staff.doc(staffId).update(staffData);
            } else {
                const newDoc = await collections.staff.add(staffData);
                staffId = newDoc.id;
            }
            await handleAssignClassToStaff(staffId, finalAssignedGradeKey);
        };
        await withErrorHandlingAndUI(operation, 'saving staff data', () => closeModal());
    }, [editingStaff, closeModal, handleAssignClassToStaff]);

    const handleSaveServiceCertificate = useCallback(async (certData: Omit<ServiceCertificateRecord, 'id'>) => {
        await withErrorHandlingAndUI(async () => {
            await collections.serviceCertificateRecords.add(certData);
            await collections.staff.doc(certData.staffDetails.staffId).update({ status: EmploymentStatus.RESIGNED });
        }, 'saving service certificate');
    }, []);
    
    // --- Inventory Handlers ---
    const openAddInventoryModal = useCallback(() => { setEditingInventoryItem(null); setIsInventoryFormModalOpen(true); }, []);
    const openEditInventoryModal = useCallback((item: InventoryItem) => { setEditingInventoryItem(sanitizeForJson(item)); setIsInventoryFormModalOpen(true); }, []);
    const openDeleteInventoryConfirm = useCallback((item: InventoryItem) => { setDeletingInventoryItem(item); }, []);

    const handleInventoryFormSubmit = useCallback(async (itemData: Omit<InventoryItem, 'id'>) => {
        const operation = async (): Promise<void> => {
            if (editingInventoryItem) {
                await collections.inventory.doc(editingInventoryItem.id).update(itemData);
            } else {
                await collections.inventory.add(itemData);
            }
        };
        await withErrorHandlingAndUI(operation, 'saving inventory item', () => closeModal());
    }, [editingInventoryItem, closeModal]);

    const handleDeleteInventoryConfirm = useCallback(async () => {
        if (deletingInventoryItem) {
            await withErrorHandlingAndUI(
                () => collections.inventory.doc(deletingInventoryItem.id).delete(),
                'deleting inventory item',
                () => closeModal()
            );
        }
    }, [deletingInventoryItem, closeModal]);

    // --- Hostel Handlers ---
    const handleUpdateHostelStock = useCallback(async (itemId: string, change: number, notes: string) => {
        await withErrorHandlingAndUI(async () => {
            const itemRef = collections.hostelInventory.doc(itemId);
            await db.runTransaction(async (transaction: firebase.firestore.Transaction) => {
                const itemDoc = await transaction.get(itemRef);
                if (!itemDoc.exists) throw new Error("Item does not exist!");
                const itemData = itemDoc.data() as HostelInventoryItem;
                const newStock = itemData.currentStock + change;
                transaction.update(itemRef, { currentStock: newStock });

                const newLog = {
                    itemId,
                    itemName: itemData.name,
                    type: change > 0 ? StockLogType.IN : StockLogType.OUT,
                    quantity: Math.abs(change),
                    date: new Date().toISOString(),
                    notes,
                };
                const logRef = collections.hostelStockLogs.doc();
                transaction.set(logRef, newLog);
            });
        }, 'updating hostel stock');
    }, []);
    
    const openAddHostelStaffModal = useCallback(() => { setEditingHostelStaff(null); setIsHostelStaffFormModalOpen(true); }, []);
    const openEditHostelStaffModal = useCallback((staffMember: HostelStaff) => { setEditingHostelStaff(sanitizeForJson(staffMember)); setIsHostelStaffFormModalOpen(true); }, []);
    const openDeleteHostelStaffConfirm = useCallback((staffMember: HostelStaff) => { setDeletingHostelStaff(staffMember); }, []);

    const handleHostelStaffFormSubmit = useCallback(async (staffData: Omit<HostelStaff, 'id' | 'paymentStatus' | 'attendancePercent'>) => {
        const operation = async (): Promise<void> => {
            if (editingHostelStaff) {
                await collections.hostelStaff.doc(editingHostelStaff.id).update(staffData);
            } else {
                const newStaff = { ...staffData, paymentStatus: PaymentStatus.PENDING, attendancePercent: 100 };
                await collections.hostelStaff.add(newStaff);
            }
        };

        await withErrorHandlingAndUI(operation, 'saving hostel staff', () => closeModal());
    }, [editingHostelStaff, closeModal]);

    const handleDeleteHostelStaffConfirm = useCallback(async () => {
        if (deletingHostelStaff) {
            await withErrorHandlingAndUI(
                () => collections.hostelStaff.doc(deletingHostelStaff.id).delete(),
                'deleting hostel staff',
                () => closeModal()
            );
        }
    }, [deletingHostelStaff, closeModal]);


    const handleSaveTc = useCallback(async (tcData: Omit<TcRecord, 'id'>) => {
        await withErrorHandlingAndUI(async () => {
            await collections.tcRecords.add(tcData);
            await collections.students.doc(tcData.studentDetails.studentId).update({ 
                status: StudentStatus.TRANSFERRED, 
                transferDate: tcData.tcData.issueDate 
            });
        }, 'saving a transfer certificate');
    }, []);

    const handleUpdateTc = useCallback(async (updatedTc: TcRecord) => {
        const { id, ...data } = updatedTc;
        await withErrorHandlingAndUI(
            () => collections.tcRecords.doc(id).update(data),
            'updating a transfer certificate'
        );
    }, []);

    const handleUpdateFeePayments = useCallback(async (studentId: string, feePayments: FeePayments) => {
        await withErrorHandlingAndUI(
            () => collections.students.doc(studentId).update({ feePayments }),
            'updating fee payments'
        );
    }, []);

    const handleUpdateClassMarks = useCallback(async (marksByStudentId: Map<string, SubjectMark[]>, examId: string) => {
        await withErrorHandlingAndUI(() => {
            const batch = db.batch();
            marksByStudentId.forEach((newMarks, studentId) => {
                const student = students.find(s => s.id === studentId);
                if (!student) return;
                
                const performance = student.academicPerformance || [];
                const examIndex = performance.findIndex((e: Exam) => e.id === examId);
                const examName = TERMINAL_EXAMS.find(e => e.id === examId)?.name || 'Unknown Exam';
                const cleanedNewMarks = newMarks.filter(m => m.marks != null || m.examMarks != null || m.activityMarks != null);

                if (examIndex > -1) {
                    performance[examIndex].results = cleanedNewMarks;
                } else {
                    performance.push({ id: examId, name: examName, results: cleanedNewMarks });
                }
                
                batch.update(collections.students.doc(studentId), { academicPerformance: performance });
            });
            return batch.commit();
        }, 'updating class marks');
    }, [students]);

    const handlePromoteStudents = useCallback(async () => {
        await withErrorHandlingAndUI(async () => {
            const finalExamId = 'terminal3';
            const batch = db.batch();

            students.forEach(student => {
                if (student.status !== StudentStatus.ACTIVE) return;

                const gradeDef = gradeDefinitions[student.grade];
                const finalExam = student.academicPerformance?.find(e => e.id === finalExamId);
                
                if (!finalExam || !gradeDef) {
                    batch.update(collections.students.doc(student.id), { academicPerformance: [], feePayments: createDefaultFeePayments() });
                    return;
                }
        
                const { finalResult } = calculateStudentResult(finalExam.results, gradeDef, student.grade);
        
                if (finalResult === 'FAIL') {
                    batch.update(collections.students.doc(student.id), { academicPerformance: [], feePayments: createDefaultFeePayments() });
                } else {
                    if (student.grade === Grade.X) {
                        batch.update(collections.students.doc(student.id), { status: StudentStatus.TRANSFERRED, transferDate: `Graduated in ${academicYear}`, academicPerformance: [], feePayments: createDefaultFeePayments() });
                    } else {
                        const nextGrade = getNextGrade(student.grade);
                        if (nextGrade) {
                            batch.update(collections.students.doc(student.id), { grade: nextGrade, academicPerformance: [], feePayments: createDefaultFeePayments() });
                        }
                    }
                }
            });

            await batch.commit();
        }, 'promoting students', () => handleLogout());
    }, [students, gradeDefinitions, academicYear, handleLogout]);

    const openImportModal = useCallback((grade: Grade | null) => { setImportTargetGrade(grade); setIsImportModalOpen(true); }, []);
    const openTransferModal = useCallback((student: Student) => { setTransferringStudent(student); }, []);

    const handleTransferStudent = useCallback(async (studentId: string, newGrade: Grade, newRollNo: number) => {
        await withErrorHandlingAndUI(
            () => collections.students.doc(studentId).update({ grade: newGrade, rollNo: newRollNo }),
            'transferring a student',
            () => closeModal()
        );
    }, [closeModal]);
    
    const handleSaveAttendance = useCallback(async (recordsToSave: Map<string, { studentId: string; grade: Grade; status: AttendanceStatus; notes?: string }>, date: string, grade: Grade): Promise<{ success: boolean; message?: string }> => {
        const operation = async () => {
            const batch = db.batch();

            const querySnapshot = await collections.attendance.where('grade', '==', grade).where('date', '==', date).get();
            querySnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            recordsToSave.forEach(recordData => {
                const docRef = collections.attendance.doc();
                batch.set(docRef, {
                    studentId: recordData.studentId,
                    grade: recordData.grade,
                    date: date,
                    status: recordData.status,
                    notes: recordData.notes || '',
                });
            });

            await batch.commit();
        };

        const { success, error } = await withFirestoreErrorHandling(operation);
        if (error) {
            handleFirestoreWriteError(error, 'saving attendance');
        }
        return { success, message: error?.message };
    }, []);

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
                        
                        {/* Attendance Routes */}
                        <Route path="/attendance" element={<AttendanceHomePage user={user!} teacherAssignedGrade={teacherAssignedGrade} />} />
                        <Route path="/attendance/take/:grade/:date" element={<TakeAttendancePage students={visibleStudents} attendanceRecords={attendanceRecords} onSave={handleSaveAttendance} />} />
                        
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

    if (isAppLoading || isFirstUserCheck) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-100">
                <div className="text-center">
                    <svg className="animate-spin h-10 w-10 text-sky-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-lg font-semibold text-slate-700">Loading Application...</p>
                </div>
            </div>
        );
    }

    return (
        <HashRouter>
            {firestoreError && <FirestoreErrorModal errorMessage={firestoreError} />}
            <Routes>
                <Route path="/register" element={!user ? (isFirstUser ? <RegisterPage onRegister={handleRegister} /> : <Navigate to="/login" />) : <Navigate to="/" />} />
                <Route path="/forgot-password" element={!user ? <ForgotPasswordPage onResetPassword={handleForgotPassword} /> : <Navigate to="/" />} />
                <Route path="/login" element={!user ? <LoginPage onLogin={handleLogin} error={error} isFirstUser={isFirstUser} /> : <Navigate to="/" />} />
                <Route path="/*" element={user ? <MainAppContent /> : <Navigate to="/login" state={{ from: window.location.hash.substring(1) || '/' }} />} />
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
                <ConfirmationModal isOpen={!!deletingStudent} onClose={closeModal} onConfirm={handleDeleteConfirm} title="Remove Student Record">
                    <p>Are you sure you want to remove <strong>{deletingStudent.name}</strong>? This action is for correcting incorrect entries and cannot be undone.</p>
                </ConfirmationModal>
            )}
            {studentToConfirmEdit && (
                <ConfirmationModal isOpen={!!studentToConfirmEdit} onClose={() => setStudentToConfirmEdit(null)} onConfirm={handleConfirmEdit} title="Confirm Changes">
                    <p>Are you sure you want to save the changes for <strong>{studentToConfirmEdit.name}</strong>?</p>
                </ConfirmationModal>
            )}
             {isStaffFormModalOpen && (
                <StaffFormModal isOpen={isStaffFormModalOpen} onClose={closeModal} onSubmit={handleStaffFormSubmit} staffMember={editingStaff} allStaff={staff} gradeDefinitions={gradeDefinitions} />
            )}
             {deletingStaff && (
                <ConfirmationModal isOpen={!!deletingStaff} onClose={closeModal} onConfirm={handleDeleteStaffConfirm} title="Remove Staff Record">
                    <p>Are you sure you want to remove <strong>{deletingStaff.firstName} {deletingStaff.lastName}</strong>? This action is permanent and cannot be undone.</p>
                </ConfirmationModal>
            )}
            {isInventoryFormModalOpen && (
                <InventoryFormModal isOpen={isInventoryFormModalOpen} onClose={closeModal} onSubmit={handleInventoryFormSubmit} item={editingInventoryItem} />
            )}
            {deletingInventoryItem && (
                <ConfirmationModal isOpen={!!deletingInventoryItem} onClose={closeModal} onConfirm={handleDeleteInventoryConfirm} title="Delete Inventory Item">
                    <p>Are you sure you want to delete the item <strong>{deletingInventoryItem.name}</strong>? This action cannot be undone.</p>
                </ConfirmationModal>
            )}
            {isImportModalOpen && (
                <ImportStudentsModal isOpen={isImportModalOpen} onClose={closeModal} onImport={(students, grade) => setPendingImportData({students, grade})} grade={importTargetGrade} allStudents={students} allGrades={GRADES_LIST} />
            )}
            {pendingImportData && (
                 <ConfirmationModal isOpen={!!pendingImportData} onClose={() => setPendingImportData(null)} onConfirm={handleConfirmImport} title="Confirm Student Import">
                    <p>Are you sure you want to import <strong>{pendingImportData.students.length}</strong> students into <strong>{pendingImportData.grade}</strong>? This action cannot be easily undone.</p>
                </ConfirmationModal>
            )}
            {transferringStudent && (
                <TransferStudentModal isOpen={!!transferringStudent} onClose={closeModal} onConfirm={handleTransferStudent} student={transferringStudent} allStudents={students} allGrades={GRADES_LIST} />
            )}
            {isHostelStaffFormModalOpen && (
                <HostelStaffFormModal isOpen={isHostelStaffFormModalOpen} onClose={closeModal} onSubmit={handleHostelStaffFormSubmit} staffMember={editingHostelStaff} />
            )}
            {deletingHostelStaff && (
                <ConfirmationModal isOpen={!!deletingHostelStaff} onClose={closeModal} onConfirm={handleDeleteHostelStaffConfirm} title="Remove Hostel Staff">
                    <p>Are you sure you want to remove <strong>{deletingHostelStaff.name}</strong>? This action cannot be undone.</p>
                </ConfirmationModal>
            )}
            {isUserFormModalOpen && (
                <UserFormModal isOpen={isUserFormModalOpen} onClose={closeModal} onSubmit={handleUserFormSubmit} user={editingUser} />
            )}
            {deletingUser && (
                <ConfirmationModal isOpen={!!deletingUser} onClose={closeModal} onConfirm={handleDeleteUserConfirm} title="Delete User">
                    <p>Are you sure you want to delete the user <strong>{deletingUser.name}</strong>? This action cannot be undone.</p>
                </ConfirmationModal>
            )}
        </HashRouter>
    );
};

export default App;

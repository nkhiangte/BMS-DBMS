import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { User, Student, Exam, StudentStatus, TcRecord, Grade, GradeDefinition, Staff, EmploymentStatus, FeePayments, SubjectMark, InventoryItem, HostelResident, HostelRoom, HostelStaff, HostelInventoryItem, StockLog, StockLogType, ServiceCertificateRecord, PaymentStatus, StaffAttendanceRecord, AttendanceStatus, DailyStudentAttendance, StudentAttendanceRecord, CalendarEvent, CalendarEventType } from './types';
import { GRADE_DEFINITIONS, TERMINAL_EXAMS, GRADES_LIST, MIZORAM_HOLIDAYS } from './constants';
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

// IMPORTANT: Replace with your own imgbb API key.
// You can get a free key from https://api.imgbb.com/
// FIX: Explicitly type IMGBB_API_KEY as string to resolve a TypeScript error.
// TypeScript infers a `const` initialized with a string literal as that literal type.
// This caused an error when comparing it to a different string literal ("YOUR_IMGBB_API_KEY")
// because the types had no overlap. Widening the type to `string` makes the comparison valid.
const IMGBB_API_KEY: string = "ceadbeb666f524f8f5705e118af9210f";

const PendingApprovalPage: React.FC<{ onLogout: () => void; email: string | null }> = ({ onLogout, email }) => (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <div className="text-center bg-white p-10 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-amber-600">Account Pending Approval</h2>
            <p className="text-slate-700 mt-2">Your account ({email}) has been created but requires administrator approval.</p>
            <p className="text-slate-600 mt-1">Please contact the school administration to activate your account.</p>
            <button
                onClick={onLogout}
                className="mt-6 flex items-center mx-auto justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition"
            >
                Logout
            </button>
        </div>
    </div>
);

// Fix: Add React.FC type to fix component type error.
const App: React.FC = () => {
    // --- AUTHENTICATION STATE ---
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [authError, setAuthError] = useState('');
    const [notification, setNotification] = useState('');
    
    // --- APPLICATION STATE (from Firestore) ---
    const [academicYear, setAcademicYear] = useState<string | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [tcRecords, setTcRecords] = useState<TcRecord[]>([]);
    const [serviceCertificateRecords, setServiceCertificateRecords] = useState<ServiceCertificateRecord[]>([]);
    const [gradeDefinitions, setGradeDefinitions] = useState<Record<Grade, GradeDefinition>>(GRADE_DEFINITIONS);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [hostelStaff, setHostelStaff] = useState<HostelStaff[]>([]);
    const [hostelInventory, setHostelInventory] = useState<HostelInventoryItem[]>([]);
    const [hostelStockLogs, setHostelStockLogs] = useState<StockLog[]>([]);
    const [hostelResidents, setHostelResidents] = useState<HostelResident[]>([]);
    const [hostelRooms, setHostelRooms] = useState<HostelRoom[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [staffAttendance, setStaffAttendance] = useState<StaffAttendanceRecord | null>(null);
    const [studentAttendance, setStudentAttendance] = useState<DailyStudentAttendance | null>(null);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);


    // --- MODAL & UI STATE ---
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
    const [newStudentTargetGrade, setNewStudentTargetGrade] = useState<Grade | null>(null);
    const [isStaffFormModalOpen, setIsStaffFormModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [deletingStaff, setDeletingStaff] = useState<Staff | null>(null);
    const [isInventoryFormModalOpen, setIsInventoryFormModalOpen] = useState(false);
    const [editingInventoryItem, setEditingInventoryItem] = useState<InventoryItem | null>(null);
    const [deletingInventoryItem, setDeletingInventoryItem] = useState<InventoryItem | null>(null);
    const [isHostelStaffFormModalOpen, setIsHostelStaffFormModalOpen] = useState(false);
    const [editingHostelStaff, setEditingHostelStaff] = useState<HostelStaff | null>(null);
    const [deletingHostelStaff, setDeletingHostelStaff] = useState<HostelStaff | null>(null);
    const [isHostelResidentFormModalOpen, setIsHostelResidentFormModalOpen] = useState(false);
    const [editingHostelResident, setEditingHostelResident] = useState<HostelResident | null>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importTargetGrade, setImportTargetGrade] = useState<Grade | null>(null);
    const [transferringStudent, setTransferringStudent] = useState<Student | null>(null);
    const [isCalendarEventFormModalOpen, setIsCalendarEventFormModalOpen] = useState(false);
    const [editingCalendarEvent, setEditingCalendarEvent] = useState<CalendarEvent | null>(null);
    const [deletingCalendarEvent, setDeletingCalendarEvent] = useState<CalendarEvent | null>(null);

    // --- NOTIFICATION STATE ---
    const [notificationDaysBefore, setNotificationDaysBefore] = useState<number>(3); // Default to 3 days
    const [activeNotifications, setActiveNotifications] = useState<{ id: string; message: string; }[]>([]);

    // --- DERIVED STATE (for Role-Based Access) ---
    const assignedGrade = useMemo(() => {
        if (user?.role !== 'user' || !staff.length || !user.email) return null;
        const currentUserStaffProfile = staff.find(s => s.emailAddress.toLowerCase() === user.email?.toLowerCase());
        if (!currentUserStaffProfile) return null;
        const gradeEntry = Object.entries(gradeDefinitions).find(([, def]) => def.classTeacherId === currentUserStaffProfile.id);
        return gradeEntry ? gradeEntry[0] as Grade : null;
    }, [user, staff, gradeDefinitions]);


    // --- FIREBASE INITIALIZATION CHECK ---
    const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";
    useEffect(() => {
        if (!isFirebaseConfigured) {
            setAuthError("Firebase is not configured. Please add your project credentials to firebaseConfig.ts.");
            setAuthLoading(false);
        }
    }, [isFirebaseConfigured]);

    // --- AUTHENTICATION LOGIC ---
    useEffect(() => {
        if (!isFirebaseConfigured) return;

        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            if (firebaseUser) {
                const userDocRef = db.collection('users').doc(firebaseUser.uid);
                const userDocSnap = await userDocRef.get();
                if (userDocSnap.exists) {
                    setUser({ ...userDocSnap.data(), uid: firebaseUser.uid } as User);
                } else {
                    const newUser: User = { uid: firebaseUser.uid, displayName: firebaseUser.displayName, email: firebaseUser.email, photoURL: firebaseUser.photoURL, role: 'pending' };
                    await userDocRef.set({ displayName: newUser.displayName, email: newUser.email, role: 'pending' });
                    setUser(newUser);
                }
            } else {
                setUser(null);
            }
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, [isFirebaseConfigured]);

    // --- DATA FETCHING FROM FIRESTORE ---
    useEffect(() => {
        if (!user || user.role === 'pending' || !isFirebaseConfigured) {
            setStudents([]); setStaff([]); setTcRecords([]); setServiceCertificateRecords([]); setGradeDefinitions(GRADE_DEFINITIONS); setInventory([]); setHostelStaff([]); setHostelInventory([]); setHostelStockLogs([]); setAllUsers([]); setAcademicYear(null); setHostelResidents([]); setHostelRooms([]); setStaffAttendance(null); setStudentAttendance(null); setCalendarEvents([]);
            return;
        };

        const collectionsToSync: [string, React.Dispatch<React.SetStateAction<any[]>>][] = [
            ['students', setStudents],
            ['staff', setStaff],
            ['tcRecords', setTcRecords],
            ['serviceCertificateRecords', setServiceCertificateRecords],
            ['inventory', setInventory],
            ['hostelStaff', setHostelStaff],
            ['hostelInventory', setHostelInventory],
            ['hostelStockLogs', setHostelStockLogs],
            ['hostelResidents', setHostelResidents],
            ['hostelRooms', setHostelRooms],
            ['calendarEvents', setCalendarEvents],
        ];
        
        const unsubscribers = collectionsToSync.map(([path, setter]) => {
            // Fix: Use firebase.firestore.Query type
            let query: firebase.firestore.Query = db.collection(path);

            // To prevent Firestore index errors, server-side sorting is applied conservatively.
            // Most sorting is handled client-side for robustness.
            if (path === 'students') {
                query = query.orderBy('name');
            } else if (path === 'staff') {
                query = query.orderBy('firstName');
            } else if (path === 'hostelStockLogs') {
                query = query.orderBy('date', 'desc').limit(200);
            } else if (path === 'calendarEvents') {
                query = query.orderBy('date');
            }

            return query.onSnapshot(snapshot => {
                setter(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }, error => {
                console.error(`[Firestore Listener Error] Failed to fetch collection '${path}':`, error);
                alert(`Could not fetch real-time data for ${path}. The list may not be up-to-date. Please check the console for details.`);
            });
        });

        unsubscribers.push(db.collection('settings').doc('academic').onSnapshot(
            doc => setAcademicYear(doc.data()?.year || null),
            error => {
                console.error(`[Firestore Listener Error] Failed to fetch settings 'academic':`, error);
                alert(`Could not fetch academic year settings.`);
            }
        ));
        unsubscribers.push(db.collection('settings').doc('gradeDefinitions').onSnapshot(
            doc => {
                const data = doc.data();
                if (data && Object.keys(data).length > 0) {
                    setGradeDefinitions(data as Record<Grade, GradeDefinition>);
                } else {
                    setGradeDefinitions(GRADE_DEFINITIONS);
                }
            },
            error => {
                console.error(`[Firestore Listener Error] Failed to fetch settings 'gradeDefinitions':`, error);
                alert(`Could not fetch grade definition settings.`);
            }
        ));
        
        const today = new Date().toISOString().split('T')[0];
        unsubscribers.push(db.collection('staffAttendance').doc(today).onSnapshot(
            doc => {
                setStaffAttendance(doc.exists ? (doc.data() as StaffAttendanceRecord) : null);
            },
            error => {
                console.error(`[Firestore Listener Error] Failed to fetch staff attendance:`, error);
                alert(`Could not fetch staff attendance data.`);
            }
        ));

        unsubscribers.push(db.collection('studentAttendance').doc(today).onSnapshot(
            doc => {
                setStudentAttendance(doc.exists ? (doc.data() as DailyStudentAttendance) : {});
            },
            error => {
                console.error(`[Firestore Listener Error] Failed to fetch student attendance:`, error);
                alert(`Could not fetch student attendance data.`);
            }
        ));


        if (user.role === 'admin') {
            unsubscribers.push(db.collection('users').onSnapshot(
                snapshot => {
                    setAllUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as User[]);
                },
                error => {
                    console.error(`[Firestore Listener Error] Failed to fetch collection 'users':`, error);
                    alert(`Could not fetch user list.`);
                }
            ));
        }

        return () => unsubscribers.forEach(unsub => unsub());
    }, [user, isFirebaseConfigured]);
    
    // --- NOTIFICATION LOGIC ---
    useEffect(() => {
        try {
            const savedPrefs = localStorage.getItem('notificationPrefs');
            if (savedPrefs) {
                const prefs = JSON.parse(savedPrefs);
                if (typeof prefs.daysBefore === 'number') {
                    setNotificationDaysBefore(prefs.daysBefore);
                }
            }
        } catch (error) {
            console.error("Failed to load notification preferences:", error);
        }
    }, []);

    useEffect(() => {
        if (!calendarEvents.length || notificationDaysBefore < 0) return; // -1 means disabled

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayStr = today.toISOString().split('T')[0];
        const shownNotificationsKey = `shownNotifications_${todayStr}`;
        let shownToday: Set<string>;
        try {
            shownToday = new Set(JSON.parse(localStorage.getItem(shownNotificationsKey) || '[]'));
        } catch (e) {
            shownToday = new Set();
            localStorage.removeItem(shownNotificationsKey);
        }

        const newNotifications: { id: string; message: string; }[] = [];

        const allPossibleEvents = [
            ...calendarEvents,
            ...MIZORAM_HOLIDAYS.map(h => ({
                id: `gov-${h.date}`,
                title: h.title,
                date: h.date,
                type: CalendarEventType.HOLIDAY
            } as CalendarEvent))
        ];

        allPossibleEvents.forEach(event => {
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);

            if (eventDate < today) return;

            const diffTime = eventDate.getTime() - today.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === notificationDaysBefore) {
                if (!shownToday.has(event.id)) {
                    newNotifications.push({
                        id: event.id,
                        message: `"${event.title}" is in ${notificationDaysBefore} day${notificationDaysBefore === 1 ? '' : 's'}.`,
                    });
                    shownToday.add(event.id);
                }
            }
        });

        if (newNotifications.length > 0) {
            setActiveNotifications(prev => {
                const existingIds = new Set(prev.map(n => n.id));
                const uniqueNew = newNotifications.filter(n => !existingIds.has(n.id));
                return [...prev, ...uniqueNew];
            });
            localStorage.setItem(shownNotificationsKey, JSON.stringify(Array.from(shownToday)));
        }
    }, [calendarEvents, notificationDaysBefore]);

    const handleUpdateNotificationPrefs = (days: number) => {
        setNotificationDaysBefore(days);
        localStorage.setItem('notificationPrefs', JSON.stringify({ daysBefore: days }));
    };

    const handleDismissNotification = (id: string) => {
        setActiveNotifications(prev => prev.filter(n => n.id !== id));
    };


    // --- UI & MODAL HANDLERS ---
    const closeModal = useCallback(() => {
        setIsFormModalOpen(false); setEditingStudent(null); setDeletingStudent(null); setNewStudentTargetGrade(null);
        setIsStaffFormModalOpen(false); setEditingStaff(null); setDeletingStaff(null);
        setIsInventoryFormModalOpen(false); setEditingInventoryItem(null); setDeletingInventoryItem(null);
        setIsHostelStaffFormModalOpen(false); setEditingHostelStaff(null); setDeletingHostelStaff(null);
        setIsHostelResidentFormModalOpen(false); setEditingHostelResident(null);
        setIsImportModalOpen(false); setImportTargetGrade(null); setTransferringStudent(null);
        setIsCalendarEventFormModalOpen(false); setEditingCalendarEvent(null); setDeletingCalendarEvent(null);
    }, []);

    const handleAddStudent = () => {
        setNewStudentTargetGrade(null);
        setEditingStudent(null);
        setIsFormModalOpen(true);
    };
    
    const handleAddStudentToClass = (grade: Grade) => {
        setNewStudentTargetGrade(grade);
        setEditingStudent(null);
        setIsFormModalOpen(true);
    };

    const uploadPhoto = async (photoDataUrl: string): Promise<string> => {
        if (!photoDataUrl || !photoDataUrl.startsWith('data:image')) {
            return photoDataUrl;
        }
    
        if (IMGBB_API_KEY === "YOUR_IMGBB_API_KEY") {
            console.warn("imgbb API key is not configured. Photo will not be uploaded. Please add your key in App.tsx.");
            alert("Image upload is not configured. Please contact the administrator.");
            return ''; 
        }
    
        try {
            const base64img = photoDataUrl.split(',')[1];
            const formData = new FormData();
            formData.append('image', base64img);
    
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                method: 'POST',
                body: formData,
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.error?.message || `HTTP error! status: ${response.status}`);
            }
    
            const result = await response.json();
    
            if (result.data && result.data.url) {
                return result.data.url;
            } else {
                throw new Error('imgbb API did not return an image URL.');
            }
        } catch (error) {
            console.error('Error uploading photo to imgbb:', error);
            alert(`There was an error uploading the photo. Please try again. Error: ${error instanceof Error ? error.message : String(error)}`);
            return '';
        }
    };

    // --- DATA MUTATION FUNCTIONS (to Firestore) ---
    const handleSetAcademicYear = async (year: string) => { await db.collection('settings').doc('academic').set({ year }); };
    const handleUpdateGradeDefinition = async (grade: Grade, newDefinition: GradeDefinition) => {
        const newGradeDefinitions = { ...gradeDefinitions, [grade]: newDefinition };
        await db.collection('settings').doc('gradeDefinitions').set(newGradeDefinitions);
    };
    
    const handleFormSubmit = useCallback(async (studentData: Omit<Student, 'id'>) => {
        try {
            const dataToSave: { [key: string]: any } = { ...studentData };
    
            if (dataToSave.photographUrl && dataToSave.photographUrl.startsWith('data:image')) {
                dataToSave.photographUrl = await uploadPhoto(dataToSave.photographUrl);
            }
    
            // If studentId is not provided (e.g., old records), generate it now
            if (!dataToSave.studentId && academicYear) {
                dataToSave.studentId = formatStudentId(studentData as Student, academicYear);
            }

            // Clean the data: Firestore cannot store 'undefined' values.
            Object.keys(dataToSave).forEach(key => {
                if (dataToSave[key] === undefined) {
                    delete dataToSave[key];
                }
            });
    
            if (editingStudent) {
                // Use update to avoid overwriting fields not in the form (e.g., academicPerformance)
                await db.collection('students').doc(editingStudent.id).update(dataToSave);
            } else {
                await db.collection('students').add(dataToSave);
            }
            closeModal();
        } catch (error) {
            console.error("Error saving student data:", error);
            alert(`Failed to save student data. Please check the console for details. Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }, [editingStudent, closeModal, academicYear]);

    const handleDeleteConfirm = useCallback(async () => {
        if (deletingStudent) {
            await db.collection('students').doc(deletingStudent.id).delete();
            closeModal();
        }
    }, [deletingStudent, closeModal]);

    const handleStaffFormSubmit = useCallback(async (staffData: Omit<Staff, 'id'>, assignedGradeKey: Grade | null) => {
        try {
            const dataToSave: { [key: string]: any } = { ...staffData };
            
            if (dataToSave.photographUrl && dataToSave.photographUrl.startsWith('data:image')) {
                dataToSave.photographUrl = await uploadPhoto(dataToSave.photographUrl);
            }
            
            // Clean the data: Firestore cannot store 'undefined' values.
            // This is a safeguard, as the form modal should also perform cleaning.
            Object.keys(dataToSave).forEach(key => {
                if (dataToSave[key] === undefined) {
                    delete dataToSave[key];
                }
            });
    
            let staffId = editingStaff?.id;
            if (editingStaff) {
                // Use update to avoid overwriting fields not in the form
                await db.collection('staff').doc(editingStaff.id).update(dataToSave);
            } else {
                const newDoc = await db.collection('staff').add(dataToSave);
                staffId = newDoc.id;
            }
    
            const newDefs = JSON.parse(JSON.stringify(gradeDefinitions));
            Object.keys(newDefs).forEach(g => {
                if (newDefs[g as Grade].classTeacherId === staffId) {
                    delete newDefs[g as Grade].classTeacherId;
                }
            });
            if (assignedGradeKey && dataToSave.status === EmploymentStatus.ACTIVE) {
                newDefs[assignedGradeKey].classTeacherId = staffId;
            }
            await db.collection('settings').doc('gradeDefinitions').set(newDefs);
    
            closeModal();
        } catch (error) {
            console.error("Error saving staff member:", error);
            alert(`Failed to save staff member. Please check the developer console for more details. Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }, [editingStaff, closeModal, gradeDefinitions]);

    const handleDeleteStaffConfirm = useCallback(async () => {
        if (deletingStaff) {
            await db.collection('staff').doc(deletingStaff.id).delete();
            const assignedGradeKey = Object.keys(gradeDefinitions).find(g => gradeDefinitions[g as Grade]?.classTeacherId === deletingStaff.id) as Grade | null;
            if (assignedGradeKey) {
                const newDefs = JSON.parse(JSON.stringify(gradeDefinitions));
                delete newDefs[assignedGradeKey].classTeacherId;
                await db.collection('settings').doc('gradeDefinitions').set(newDefs);
            }
            closeModal();
        }
    }, [deletingStaff, closeModal, gradeDefinitions]);

    const handleImportStudents = useCallback(async (newStudents: Omit<Student, 'id'>[], grade: Grade) => {
        setIsImporting(true);
        const CHUNK_SIZE = 400;
        try {
            for (let i = 0; i < newStudents.length; i += CHUNK_SIZE) {
                const chunk = newStudents.slice(i, i + CHUNK_SIZE);
                const batch = db.batch();
                chunk.forEach(studentData => {
                    const studentDocRef = db.collection('students').doc();
                    const finalStudentData = { ...studentData, grade };
                    batch.set(studentDocRef, finalStudentData);
                });
                await batch.commit();
            }
            closeModal();
        } catch (error) {
            console.error("Error importing students:", error);
            alert(`Failed to import students. Please check the console for details. Error: ${error}`);
        } finally {
            setIsImporting(false);
        }
    }, [closeModal]);

    const handleAcademicUpdate = useCallback(async (studentId: string, academicPerformance: Exam[]) => {
        await db.collection('students').doc(studentId).set({ academicPerformance }, { merge: true });
    }, []);

    const handleUpdateClassMarks = useCallback(async (updates: Array<{ studentId: string; performance: Exam[] }>) => {
        if (updates.length === 0) return;
        const batch = db.batch();
        updates.forEach(({ studentId, performance }) => {
            const studentRef = db.collection('students').doc(studentId);
            batch.set(studentRef, { academicPerformance: performance }, { merge: true });
        });
        try {
            await batch.commit();
            alert(`${updates.length} students' marks have been updated successfully!`);
        } catch (error) {
            console.error("Error updating marks in batch:", error);
            alert(`Failed to update marks. Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }, []);

    const handleUpdateFeePayments = useCallback(async (studentId: string, payments: FeePayments) => {
        await db.collection('students').doc(studentId).set({ feePayments: payments }, { merge: true });
    }, []);
    
    const handleUpdateBulkFeePayments = useCallback(async (updates: Array<{ studentId: string; payments: FeePayments }>) => {
        if (updates.length === 0) return;
        const batch = db.batch();
        updates.forEach(({ studentId, payments }) => {
            const studentRef = db.collection('students').doc(studentId);
            batch.set(studentRef, { feePayments: payments }, { merge: true });
        });
        try {
            await batch.commit();
        } catch (error) {
            console.error("Error updating fee payments in batch:", error);
            alert(`Failed to update fee payments. Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }, []);

    const handleSaveTc = async (tcData: Omit<TcRecord, 'id'>) => {
        const batch = db.batch();
        batch.set(db.collection('tcRecords').doc(), tcData);
        const studentRef = db.collection('students').doc(tcData.studentDetails.studentNumericId);
        batch.update(studentRef, { status: StudentStatus.TRANSFERRED, transferDate: tcData.tcData.issueDate });
        await batch.commit();
    };

    const handleUpdateTc = async (updatedTc: TcRecord) => {
        await db.collection('tcRecords').doc(updatedTc.id).set(updatedTc);
    };

    const handleSaveServiceCertificate = async (certData: Omit<ServiceCertificateRecord, 'id'>) => {
        const batch = db.batch();
        batch.set(db.collection('serviceCertificateRecords').doc(), certData);
        const staffRef = db.collection('staff').doc(certData.staffDetails.staffNumericId);
        batch.update(staffRef, { status: EmploymentStatus.RESIGNED });
        await batch.commit();
    };

    const handlePromoteStudents = async () => {
        const batch = db.batch();
        const finalExamId = 'terminal3';

        students.forEach(student => {
            if (student.status !== StudentStatus.ACTIVE) return;
            const gradeDef = gradeDefinitions[student.grade];
            const finalExam = student.academicPerformance?.find(e => e.id === finalExamId);
            if (!finalExam || !gradeDef || finalExam.results.length === 0) {
                 batch.update(db.collection('students').doc(student.id), { academicPerformance: [], feePayments: createDefaultFeePayments() });
                 return;
            }
            const { finalResult } = calculateStudentResult(finalExam.results, gradeDef, student.grade);
            if (finalResult === 'FAIL') {
                 batch.update(db.collection('students').doc(student.id), { academicPerformance: [], feePayments: createDefaultFeePayments() });
                 return;
            }
            if (student.grade === Grade.X) {
                batch.update(db.collection('students').doc(student.id), { status: StudentStatus.TRANSFERRED, transferDate: new Date().toISOString().split('T')[0] });
            }
            const nextGrade = getNextGrade(student.grade);
            if (nextGrade) {
                batch.update(db.collection('students').doc(student.id), { grade: nextGrade, academicPerformance: [], feePayments: createDefaultFeePayments(), rollNo: 0 });
            }
        });
        await batch.commit();
        await db.collection('settings').doc('academic').set({ year: null });
    };
    
    // --- Hostel and Inventory Handlers (wired up) ---
    const handleHostelStaffFormSubmit = useCallback(async (staffData: Omit<HostelStaff, 'id'>) => {
        try {
            const dataToSave = { ...staffData };
            if (dataToSave.photographUrl) {
                dataToSave.photographUrl = await uploadPhoto(dataToSave.photographUrl);
            }
    
            if (editingHostelStaff) {
                await db.collection('hostelStaff').doc(editingHostelStaff.id).set(dataToSave);
            } else {
                await db.collection('hostelStaff').add(dataToSave);
            }
            
            closeModal();
        } catch (error) {
            console.error("Error saving hostel staff member:", error);
            alert(`Failed to save hostel staff member. Error: ${error}`);
        }
    }, [editingHostelStaff, closeModal]);

    const handleDeleteHostelStaffConfirm = useCallback(async () => {
        if (deletingHostelStaff) {
            await db.collection('hostelStaff').doc(deletingHostelStaff.id).delete();
            closeModal();
        }
    }, [deletingHostelStaff, closeModal]);

    const handleHostelResidentFormSubmit = useCallback(async (residentData: Omit<HostelResident, 'id'>) => {
        try {
            if (editingHostelResident) {
                await db.collection('hostelResidents').doc(editingHostelResident.id).set(residentData);
            } else {
                await db.collection('hostelResidents').add(residentData);
            }
            closeModal();
        } catch (error) {
            console.error("Error saving hostel resident:", error);
            alert(`Failed to save hostel resident. Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }, [editingHostelResident, closeModal]);

    const handleInventoryFormSubmit = useCallback(async (itemData: Omit<InventoryItem, 'id'>) => {
        try {
            if (editingInventoryItem) {
                await db.collection('inventory').doc(editingInventoryItem.id).set(itemData);
            } else {
                await db.collection('inventory').add(itemData);
            }
            closeModal();
        } catch (error) {
            console.error("Error saving inventory item:", error);
            alert(`Failed to save inventory item. Error: ${error}`);
        }
    }, [editingInventoryItem, closeModal]);
    
    const handleDeleteInventoryItemConfirm = useCallback(async () => {
        if (deletingInventoryItem) {
            await db.collection('inventory').doc(deletingInventoryItem.id).delete();
            closeModal();
        }
    }, [deletingInventoryItem, closeModal]);
    
    const handleUpdateHostelStock = useCallback(async (itemId: string, change: number, notes: string) => {
        const itemRef = db.collection('hostelInventory').doc(itemId);
        const logRef = db.collection('hostelStockLogs').doc();
        
        try {
            await db.runTransaction(async (transaction) => {
                const itemDoc = await transaction.get(itemRef);
                if (!itemDoc.exists) { throw new Error("Item does not exist!"); }
                const itemData = itemDoc.data() as HostelInventoryItem;
                // Fix: Corrected arithmetic operation
                const newStock = itemData.currentStock + change;
    
                if (newStock < 0) { throw new Error("Stock cannot be negative."); }
                
                transaction.update(itemRef, { currentStock: newStock });
    
                // Fix: Completed the logEntry object creation
                const logEntry: Omit<StockLog, 'id'> = {
                    itemId: itemId,
                    itemName: itemData.name,
                    type: change > 0 ? StockLogType.IN : StockLogType.OUT,
                    quantity: Math.abs(change),
                    date: new Date().toISOString(),
                    notes,
                };
                transaction.set(logRef, logEntry);
            });
        } catch (error) {
            console.error("Error updating stock:", error);
            alert(`Failed to update stock. Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }, []);

    const handleCalendarEventFormSubmit = useCallback(async (eventData: Omit<CalendarEvent, 'id'>) => {
        try {
            if (editingCalendarEvent) {
                await db.collection('calendarEvents').doc(editingCalendarEvent.id).set(eventData);
            } else {
                await db.collection('calendarEvents').add(eventData);
            }
            closeModal();
        } catch (error) {
            console.error("Error saving calendar event:", error);
            alert(`Failed to save event. Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }, [editingCalendarEvent, closeModal]);

    const handleDeleteCalendarEventConfirm = useCallback(async () => {
        if (deletingCalendarEvent) {
            await db.collection('calendarEvents').doc(deletingCalendarEvent.id).delete();
            closeModal();
        }
    }, [deletingCalendarEvent, closeModal]);

    // Fix: Add missing handlers for authentication, routing, and other functionalities.
    const handleLogin = async (email: string, pass: string) => {
      try {
        await auth.signInWithEmailAndPassword(email, pass);
        setNotification('');
        setAuthError('');
      } catch (error: any) {
        setAuthError(error.message);
      }
    };
  
    const handleLogout = async () => {
      await auth.signOut();
      setNotification('You have been successfully logged out.');
    };
  
    const handleSignUp = async (name: string, email: string, password: string): Promise<{ success: boolean; message?: string }> => {
      try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user?.updateProfile({ displayName: name });
        return { success: true, message: 'Account created! An administrator must approve it before you can log in.' };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    };
  
    const handleForgotPassword = async (email: string): Promise<{ success: boolean; message?: string }> => {
      try {
        await auth.sendPasswordResetEmail(email);
        return { success: true, message: 'Password reset email sent! Please check your inbox.' };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    };
  
    const handleChangePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser || !firebaseUser.email) {
            return { success: false, message: 'No user is currently signed in.' };
        }
        try {
            const credential = firebase.auth.EmailAuthProvider.credential(firebaseUser.email, currentPassword);
            await firebaseUser.reauthenticateWithCredential(credential);
            await firebaseUser.updatePassword(newPassword);
            await auth.signOut(); // Force logout
            setNotification('Password changed successfully. Please log in again.');
            return { success: true };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    };

    const handleTransferStudent = async (studentId: string, newGrade: Grade, newRollNo: number) => {
        try {
            await db.collection('students').doc(studentId).update({
                grade: newGrade,
                rollNo: newRollNo,
            });
            closeModal();
        } catch (error) {
            console.error("Error transferring student:", error);
            alert(`Failed to transfer student. Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    const handleMarkStaffAttendance = async (staffId: string, status: AttendanceStatus) => {
        const today = new Date().toISOString().split('T')[0];
        await db.collection('staffAttendance').doc(today).set({ [staffId]: status }, { merge: true });
    };

    const handleUpdateStudentAttendance = async (grade: Grade, records: StudentAttendanceRecord) => {
        const today = new Date().toISOString().split('T')[0];
        await db.collection('studentAttendance').doc(today).set({ [grade]: records }, { merge: true });
    };

    const fetchStaffAttendanceForMonth = async (year: number, month: number): Promise<{ [date: string]: StaffAttendanceRecord }> => {
        const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month, 1).toISOString().split('T')[0];
        const snapshot = await db.collection('staffAttendance').where(firebase.firestore.FieldPath.documentId(), '>=', startDate).where(firebase.firestore.FieldPath.documentId(), '<', endDate).get();
        const data: { [date: string]: StaffAttendanceRecord } = {};
        snapshot.forEach(doc => { data[doc.id] = doc.data() as StaffAttendanceRecord; });
        return data;
    };

    const fetchStudentAttendanceForMonth = async (grade: Grade, year: number, month: number): Promise<{ [date: string]: StudentAttendanceRecord }> => {
        const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month, 1).toISOString().split('T')[0];
        const snapshot = await db.collection('studentAttendance').where(firebase.firestore.FieldPath.documentId(), '>=', startDate).where(firebase.firestore.FieldPath.documentId(), '<', endDate).get();
        const data: { [date: string]: StudentAttendanceRecord } = {};
        snapshot.forEach(doc => {
            const docData = doc.data();
            if (docData[grade]) { data[doc.id] = docData[grade]; }
        });
        return data;
    };
    
    const handleUpdateUserRole = async (uid: string, newRole: 'admin' | 'user' | 'pending') => {
        await db.collection('users').doc(uid).update({ role: newRole });
    };
    
    const handleDeleteUser = async (uid: string) => {
        console.warn("This only deletes the Firestore user record, not the Firebase Auth user.");
        await db.collection('users').doc(uid).delete();
    };

    // --- RENDER LOGIC ---
    if (authLoading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!isFirebaseConfigured && authError) {
        return <div className="p-4 bg-red-100 text-red-800">{authError}</div>;
    }

    // Fix: Add missing return statement with routing logic.
    return (
        <HashRouter>
            {!user ? (
                <Routes>
                    <Route path="/login" element={<LoginPage onLogin={handleLogin} error={authError} notification={notification} />} />
                    <Route path="/signup" element={<SignUpPage onSignUp={handleSignUp} />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage onForgotPassword={handleForgotPassword} />} />
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            ) : user.role === 'pending' ? (
                <PendingApprovalPage onLogout={handleLogout} email={user.email} />
            ) : !academicYear ? (
                <AcademicYearForm onSetAcademicYear={handleSetAcademicYear} />
            ) : (
                <div className="bg-slate-100 min-h-screen">
                    <Header user={user} onLogout={handleLogout} />
                    <NotificationContainer notifications={activeNotifications} onDismiss={handleDismissNotification} />
                    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                        <Routes>
                             <Route path="/" element={<DashboardPage user={user} onAddStudent={handleAddStudent} studentCount={students.length} academicYear={academicYear} onSetAcademicYear={handleSetAcademicYear} allUsers={allUsers} assignedGrade={assignedGrade} />} />
                                <Route path="/students" element={<StudentListPage students={students.filter(s => s.status === StudentStatus.ACTIVE)} onAdd={handleAddStudent} onEdit={(s: Student) => { setEditingStudent(s); setIsFormModalOpen(true); }} academicYear={academicYear} user={user} assignedGrade={assignedGrade} />} />
                                <Route path="/student/:studentId" element={<StudentDetailPage students={students} onEdit={(s: Student) => { setEditingStudent(s); setIsFormModalOpen(true); }} academicYear={academicYear} user={user} assignedGrade={assignedGrade} />} />
                                <Route path="/student/:studentId/academics" element={<AcademicPerformancePage students={students} onUpdateAcademic={handleAcademicUpdate} gradeDefinitions={gradeDefinitions} academicYear={academicYear} user={user} assignedGrade={assignedGrade} />} />
                                <Route path="/report-card/:studentId/:examId" element={<PrintableReportCardPage students={students} gradeDefinitions={gradeDefinitions} academicYear={academicYear} user={user} assignedGrade={assignedGrade} fetchStudentAttendanceForMonth={fetchStudentAttendanceForMonth} />} />
                                <Route path="/reports/search" element={<ReportSearchPage students={students} academicYear={academicYear} />} />
                                <Route path="/progress-report/:studentId" element={<ProgressReportPage students={students} academicYear={academicYear} />} />
                                <Route path="/classes" element={<ClassListPage gradeDefinitions={gradeDefinitions} staff={staff} onOpenImportModal={(g) => { setImportTargetGrade(g); setIsImportModalOpen(true); }} user={user} />} />
                                <Route path="/classes/:grade" element={<ClassStudentsPage students={students} staff={staff} gradeDefinitions={gradeDefinitions} onUpdateGradeDefinition={handleUpdateGradeDefinition} academicYear={academicYear} onOpenImportModal={(g) => { setImportTargetGrade(g); setIsImportModalOpen(true); }} onOpenTransferModal={(s) => setTransferringStudent(s)} onDelete={(s) => setDeletingStudent(s)} user={user} assignedGrade={assignedGrade} onAddStudentToClass={handleAddStudentToClass} onUpdateBulkFeePayments={handleUpdateBulkFeePayments} />} />
                                <Route path="/transfers" element={<TransferManagementPage students={students} tcRecords={tcRecords} />} />
                                <Route path="/transfers/register" element={<TcRegistrationPage students={students} onSave={handleSaveTc} academicYear={academicYear} user={user} />} />
                                <Route path="/transfers/records" element={<AllTcRecordsPage tcRecords={tcRecords} />} />
                                <Route path="/transfers/print/:tcId" element={<PrintTcPage tcRecords={tcRecords} />} />
                                <Route path="/transfers/update" element={<UpdateTcPage tcRecords={tcRecords} onUpdate={handleUpdateTc} user={user} />} />
                                <Route path="/subjects" element={<ManageSubjectsPage gradeDefinitions={gradeDefinitions} onUpdateGradeDefinition={handleUpdateGradeDefinition} user={user} />} />
                                <Route path="/staff" element={<ManageStaffPage staff={staff} gradeDefinitions={gradeDefinitions} onAdd={() => setIsStaffFormModalOpen(true)} onEdit={(s) => { setEditingStaff(s); setIsStaffFormModalOpen(true); }} onDelete={(s) => setDeletingStaff(s)} user={user} />} />
                                <Route path="/staff/:staffId" element={<StaffDetailPage staff={staff} onEdit={(s: Staff) => { setEditingStaff(s); setIsStaffFormModalOpen(true); }} gradeDefinitions={gradeDefinitions} />} />
                                <Route path="/fees" element={<FeeManagementPage students={students} academicYear={academicYear} onUpdateFeePayments={handleUpdateFeePayments} user={user} />} />
                                <Route path="/reports/class-statement/:grade/:examId" element={<ClassMarkStatementPage students={students} gradeDefinitions={gradeDefinitions} academicYear={academicYear} onUpdateClassMarks={handleUpdateClassMarks} user={user} assignedGrade={assignedGrade} fetchStudentAttendanceForMonth={fetchStudentAttendanceForMonth} />} />
                                <Route path="/promotion" element={<PromotionPage students={students} gradeDefinitions={gradeDefinitions} academicYear={academicYear} onPromoteStudents={handlePromoteStudents} user={user} />} />
                                <Route path="/inventory" element={<InventoryPage inventory={inventory} onAdd={() => setIsInventoryFormModalOpen(true)} onEdit={(i) => { setEditingInventoryItem(i); setIsInventoryFormModalOpen(true); }} onDelete={(i) => setDeletingInventoryItem(i)} user={user} />} />
                                <Route path="/change-password" element={<ChangePasswordPage onChangePassword={handleChangePassword} />} />
                                <Route path="/users" element={<UserManagementPage allUsers={allUsers} currentUser={user} onUpdateUserRole={handleUpdateUserRole} onDeleteUser={handleDeleteUser} />} />
                                <Route path="/communication" element={<CommunicationPage students={students} user={user} />} />
                                <Route path="/staff/attendance" element={<StaffAttendancePage user={user} staff={staff} attendance={staffAttendance} onMarkAttendance={handleMarkStaffAttendance} fetchStaffAttendanceForMonth={fetchStaffAttendanceForMonth} academicYear={academicYear} />} />
                                <Route path="/classes/:grade/attendance" element={<StudentAttendancePage students={students} allAttendance={studentAttendance} onUpdateAttendance={handleUpdateStudentAttendance} user={user} fetchStudentAttendanceForMonth={fetchStudentAttendanceForMonth} academicYear={academicYear} assignedGrade={assignedGrade} />} />
                                <Route path="/calendar" element={<CalendarPage events={calendarEvents} user={user} onAdd={() => { setEditingCalendarEvent(null); setIsCalendarEventFormModalOpen(true); }} onEdit={(e) => { setEditingCalendarEvent(e); setIsCalendarEventFormModalOpen(true); }} onDelete={(e) => setDeletingCalendarEvent(e)} notificationDaysBefore={notificationDaysBefore} onUpdatePrefs={handleUpdateNotificationPrefs} />} />
                                
                                {/* Staff docs */}
                                <Route path="/staff/certificates" element={<StaffDocumentsPage serviceCertificateRecords={serviceCertificateRecords} user={user}/>} />
                                <Route path="/staff/certificates/generate" element={<GenerateServiceCertificatePage staff={staff} onSave={handleSaveServiceCertificate} user={user} />} />
                                <Route path="/staff/certificates/print/:certId" element={<PrintServiceCertificatePage serviceCertificateRecords={serviceCertificateRecords} />} />

                                {/* Hostel */}
                                <Route path="/hostel" element={<HostelDashboardPage />} />
                                <Route path="/hostel/students" element={<HostelStudentListPage residents={hostelResidents} rooms={hostelRooms} students={students} onAdd={() => setIsHostelResidentFormModalOpen(true)} user={user} />} />
                                <Route path="/hostel/rooms" element={<HostelRoomListPage rooms={hostelRooms} residents={hostelResidents} students={students} />} />
                                <Route path="/hostel/fees" element={<HostelFeePage />} />
                                <Route path="/hostel/attendance" element={<HostelAttendancePage />} />
                                <Route path="/hostel/mess" element={<HostelMessPage />} />
                                <Route path="/hostel/staff" element={<HostelStaffPage staff={hostelStaff} onAdd={() => setIsHostelStaffFormModalOpen(true)} onEdit={(s) => { setEditingHostelStaff(s); setIsHostelStaffFormModalOpen(true); }} onDelete={(s) => setDeletingHostelStaff(s)} user={user} />} />
                                <Route path="/hostel/inventory" element={<HostelInventoryPage inventory={hostelInventory} stockLogs={hostelStockLogs} onUpdateStock={handleUpdateHostelStock} user={user} />} />
                                <Route path="/hostel/discipline" element={<HostelDisciplinePage />} />
                                <Route path="/hostel/health" element={<HostelHealthPage />} />
                                <Route path="/hostel/communication" element={<HostelCommunicationPage />} />
                                <Route path="/hostel/settings" element={<HostelSettingsPage />} />

                                <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </main>
                    {isFormModalOpen && <StudentFormModal isOpen={isFormModalOpen} onClose={closeModal} onSubmit={handleFormSubmit} student={editingStudent} newStudentTargetGrade={newStudentTargetGrade} academicYear={academicYear} />}
                    {deletingStudent && <ConfirmationModal isOpen={!!deletingStudent} onClose={closeModal} onConfirm={handleDeleteConfirm} title="Delete Student">Are you sure you want to delete <strong className="font-bold">{deletingStudent?.name}</strong>? This action cannot be undone.</ConfirmationModal>}
                    {isStaffFormModalOpen && <StaffFormModal isOpen={isStaffFormModalOpen} onClose={closeModal} onSubmit={handleStaffFormSubmit} staffMember={editingStaff} allStaff={staff} gradeDefinitions={gradeDefinitions} />}
                    {deletingStaff && <ConfirmationModal isOpen={!!deletingStaff} onClose={closeModal} onConfirm={handleDeleteStaffConfirm} title="Delete Staff Member">Are you sure you want to delete <strong className="font-bold">{deletingStaff?.firstName} {deletingStaff?.lastName}</strong>? This action cannot be undone.</ConfirmationModal>}
                    {isInventoryFormModalOpen && <InventoryFormModal isOpen={isInventoryFormModalOpen} onClose={closeModal} onSubmit={handleInventoryFormSubmit} item={editingInventoryItem} />}
                    {deletingInventoryItem && <ConfirmationModal isOpen={!!deletingInventoryItem} onClose={closeModal} onConfirm={handleDeleteInventoryItemConfirm} title="Delete Inventory Item">Are you sure you want to delete <strong className="font-bold">{deletingInventoryItem?.name}</strong>? This action cannot be undone.</ConfirmationModal>}
                    {isHostelStaffFormModalOpen && <HostelStaffFormModal isOpen={isHostelStaffFormModalOpen} onClose={closeModal} onSubmit={handleHostelStaffFormSubmit} staffMember={editingHostelStaff} />}
                    {deletingHostelStaff && <ConfirmationModal isOpen={!!deletingHostelStaff} onClose={closeModal} onConfirm={handleDeleteHostelStaffConfirm} title="Delete Hostel Staff">Are you sure you want to delete <strong className="font-bold">{deletingHostelStaff?.name}</strong>? This action cannot be undone.</ConfirmationModal>}
                    {isHostelResidentFormModalOpen && <HostelResidentFormModal isOpen={isHostelResidentFormModalOpen} onClose={closeModal} onSubmit={handleHostelResidentFormSubmit} resident={editingHostelResident} allStudents={students} allRooms={hostelRooms} allResidents={hostelResidents}/>}
                    {isImportModalOpen && <ImportStudentsModal isOpen={isImportModalOpen} onClose={closeModal} onImport={handleImportStudents} grade={importTargetGrade} allStudents={students} allGrades={GRADES_LIST} isImporting={isImporting} />}
                    {transferringStudent && <TransferStudentModal isOpen={!!transferringStudent} onClose={closeModal} onConfirm={handleTransferStudent} student={transferringStudent} allStudents={students} allGrades={GRADES_LIST} />}
                    {isCalendarEventFormModalOpen && <CalendarEventFormModal isOpen={isCalendarEventFormModalOpen} onClose={closeModal} onSubmit={handleCalendarEventFormSubmit} event={editingCalendarEvent} />}
                    {deletingCalendarEvent && <ConfirmationModal isOpen={!!deletingCalendarEvent} onClose={closeModal} onConfirm={handleDeleteCalendarEventConfirm} title="Delete Event">Are you sure you want to delete <strong className="font-bold">{deletingCalendarEvent.title}</strong>? This action cannot be undone.</ConfirmationModal>}
                </div>
            )}
        </HashRouter>
    );
};

export default App;
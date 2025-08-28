import { Grade, Gender, Category, GradeDefinition, Staff, MaritalStatus, Department, Designation, EmployeeType, BloodGroup, EmploymentStatus, StaffType, InventoryCategory, InventoryStatus, HostelBlock, RoomType, HostelStaffRole, HostelInventoryCategory, StockLogType, Qualification, CalendarEventType } from './types';

export const QUALIFICATION_LIST: Qualification[] = Object.values(Qualification);
export const MARITAL_STATUS_LIST: MaritalStatus[] = Object.values(MaritalStatus);
export const DEPARTMENT_LIST: Department[] = Object.values(Department);
export const DESIGNATION_LIST: Designation[] = Object.values(Designation);
export const EMPLOYEE_TYPE_LIST: EmployeeType[] = Object.values(EmployeeType);
export const BLOOD_GROUP_LIST: BloodGroup[] = Object.values(BloodGroup);
export const EMPLOYMENT_STATUS_LIST: EmploymentStatus[] = Object.values(EmploymentStatus);
export const STAFF_TYPE_LIST: StaffType[] = ['Teaching', 'Non-Teaching'];

export const GRADES_LIST: Grade[] = Object.values(Grade);
export const GENDER_LIST: Gender[] = Object.values(Gender);
export const CATEGORY_LIST: Category[] = Object.values(Category);
export const OABC_GRADES: Array<'O' | 'A' | 'B' | 'C'> = ['O', 'A', 'B', 'C'];

export const GRADES_WITH_NO_ACTIVITIES: Grade[] = [
  Grade.NURSERY,
  Grade.KINDERGARTEN,
  Grade.I,
  Grade.II,
  Grade.IX,
  Grade.X,
];

export const TERMINAL_EXAMS = [
  { id: 'terminal1', name: 'First Terminal Exam' },
  { id: 'terminal2', name: 'Second Terminal Exam' },
  { id: 'terminal3', name: 'Final Terminal Exam' },
];

export const GRADE_DEFINITIONS: Record<Grade, GradeDefinition> = {
    [Grade.NURSERY]: { classTeacherId: undefined, subjects: [{ name: 'Pre-Reading', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Pre-Writing', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Numbers', examFullMarks: 100, activityFullMarks: 0 }] },
    [Grade.KINDERGARTEN]: { classTeacherId: undefined, subjects: [{ name: 'English', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Mathematics', examFullMarks: 100, activityFullMarks: 0 }, { name: 'General Knowledge', examFullMarks: 100, activityFullMarks: 0 }] },
    [Grade.I]: { classTeacherId: undefined, subjects: [{ name: 'English', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Mathematics', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Environmental Science', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Mizo', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Drawing', examFullMarks: 0, activityFullMarks: 0, gradingSystem: 'OABC' }, { name: 'Cursive', examFullMarks: 0, activityFullMarks: 0, gradingSystem: 'OABC' }] },
    [Grade.II]: { classTeacherId: undefined, subjects: [{ name: 'English', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Mathematics', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Environmental Science', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Mizo', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Drawing', examFullMarks: 0, activityFullMarks: 0, gradingSystem: 'OABC' }, { name: 'Cursive', examFullMarks: 0, activityFullMarks: 0, gradingSystem: 'OABC' }] },
    [Grade.III]: { classTeacherId: undefined, subjects: [{ name: 'English', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Mathematics', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Science', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Social Studies', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Mizo', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Drawing', examFullMarks: 0, activityFullMarks: 0, gradingSystem: 'OABC' }, { name: 'Cursive', examFullMarks: 0, activityFullMarks: 0, gradingSystem: 'OABC' }] },
    [Grade.IV]: { classTeacherId: undefined, subjects: [{ name: 'English', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Mathematics', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Science', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Social Studies', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Mizo', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Drawing', examFullMarks: 0, activityFullMarks: 0, gradingSystem: 'OABC' }, { name: 'Cursive', examFullMarks: 0, activityFullMarks: 0, gradingSystem: 'OABC' }] },
    [Grade.V]: { classTeacherId: undefined, subjects: [{ name: 'English', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Mathematics', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Science', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Social Studies', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Mizo', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Hindi', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Drawing', examFullMarks: 0, activityFullMarks: 0, gradingSystem: 'OABC' }, { name: 'Cursive', examFullMarks: 0, activityFullMarks: 0, gradingSystem: 'OABC' }] },
    [Grade.VI]: { classTeacherId: undefined, subjects: [{ name: 'English', examFullMarks: 60, activityFullMarks: 40 }, { name: 'English - II', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Mathematics', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Science', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Social Studies', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Mizo', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Hindi', examFullMarks: 60, activityFullMarks: 40 }] },
    [Grade.VII]: { classTeacherId: undefined, subjects: [{ name: 'English', examFullMarks: 60, activityFullMarks: 40 }, { name: 'English - II', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Mathematics', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Science', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Social Studies', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Mizo', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Hindi', examFullMarks: 60, activityFullMarks: 40 }] },
    [Grade.VIII]: { classTeacherId: undefined, subjects: [{ name: 'English', examFullMarks: 60, activityFullMarks: 40 }, { name: 'English - II', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Mathematics', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Science', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Social Studies', examFullMarks: 60, activityFullMarks: 40 }, { name: 'Mizo', examFullMarks: 60, activityFullMarks: 40 }] },
    [Grade.IX]: { classTeacherId: undefined, subjects: [{ name: 'English', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Mathematics', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Science', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Social Studies', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Mizo', examFullMarks: 100, activityFullMarks: 0 }] },
    [Grade.X]: { classTeacherId: undefined, subjects: [{ name: 'English', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Mathematics', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Science', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Social Studies', examFullMarks: 100, activityFullMarks: 0 }, { name: 'Mizo', examFullMarks: 100, activityFullMarks: 0 }] },
};

export const academicMonths = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];

export const DEFAULT_FEE_STRUCTURE = {
  set1: { admissionFee: 5000, tuitionFee: 1500, examFee: 500 },
  set2: { admissionFee: 6000, tuitionFee: 2000, examFee: 600 },
  set3: { admissionFee: 7000, tuitionFee: 2500, examFee: 700 },
};

export const FEE_SET_GRADES: Record<string, Grade[]> = {
    set1: [Grade.NURSERY, Grade.KINDERGARTEN, Grade.I, Grade.II],
    set2: [Grade.III, Grade.IV, Grade.V, Grade.VI],
    set3: [Grade.VII, Grade.VIII, Grade.IX, Grade.X],
};

export const INVENTORY_CATEGORY_LIST: InventoryCategory[] = Object.values(InventoryCategory);
export const INVENTORY_STATUS_LIST: InventoryStatus[] = Object.values(InventoryStatus);
export const HOSTEL_BLOCK_LIST: HostelBlock[] = Object.values(HostelBlock);
export const HOSTEL_STAFF_ROLE_LIST: HostelStaffRole[] = Object.values(HostelStaffRole);
export const HOSTEL_INVENTORY_CATEGORY_LIST: HostelInventoryCategory[] = Object.values(HostelInventoryCategory);
export const CALENDAR_EVENT_TYPE_LIST: CalendarEventType[] = Object.values(CalendarEventType);

export const MIZORAM_HOLIDAYS: { date: string, title: string }[] = [
    // 2025 Holidays
    { date: '2025-04-10', title: 'Mahavir Jayanti' },
    { date: '2025-04-18', title: 'Good Friday' },
    { date: '2025-05-12', title: 'Buddha Purnima' },
    { date: '2025-06-07', title: "Idu'l Zuha" },
    { date: '2025-06-15', title: 'YMA Day' },
    { date: '2025-06-30', title: 'Remna Ni' },
    { date: '2025-07-06', title: 'MHIP Day' },
    { date: '2025-07-06', title: 'Muharram' },
    { date: '2025-08-15', title: 'Independence Day' },
    { date: '2025-08-16', title: 'Janmashtami' },
    { date: '2025-09-05', title: "Prophet Mohamed's Birthday (Id-e-Milad)" },
    { date: '2025-10-02', title: "Mahatma Gandhi's Birthday" },
    { date: '2025-10-02', title: 'Dussehra (Vijay Dashmi)' },
    { date: '2025-10-20', title: 'Diwali (Deepavalli)' },
    { date: '2025-11-05', title: "Guru Nanak's Birthday" },
    { date: '2025-12-25', title: 'Christmas Day' },
    { date: '2025-12-26', title: 'Christmas Holiday' },
    
    // 2026 Holidays
    { date: '2026-01-01', title: "New Year's Day" },
    { date: '2026-01-11', title: 'Missionary Day' },
    { date: '2026-01-26', title: 'Republic Day' },
    { date: '2026-02-20', title: 'State Day' },
    { date: '2026-03-06', title: 'Chapchar kut' },
];
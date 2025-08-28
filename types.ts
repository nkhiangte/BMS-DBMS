

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role: 'admin' | 'user' | 'pending';
}

export enum Grade {
  NURSERY = "Nursery",
  KINDERGARTEN = "Kindergarten",
  I = "Class I",
  II = "Class II",
  III = "Class III",
  IV = "Class IV",
  V = "Class V",
  VI = "Class VI",
  VII = "Class VII",
  VIII = "Class VIII",
  IX = "Class IX",
  X = "Class X",
}

export enum Gender {
    MALE = "Male",
    FEMALE = "Female",
    OTHER = "Other",
}

export enum StudentStatus {
    ACTIVE = "Active",
    TRANSFERRED = "Transferred",
}

export enum EmploymentStatus {
    ACTIVE = "Active",
    ON_LEAVE = "On Leave",
    RESIGNED = "Resigned",
    RETIRED = "Retired",
}

export enum Category {
    GENERAL = "General",
    SC = "SC",
    ST = "ST",
    OBC = "OBC",
}

// --- NEW Enums for Teacher ---
export enum MaritalStatus {
    SINGLE = "Single",
    MARRIED = "Married",
    DIVORCED = "Divorced",
    WIDOWED = "Widowed",
}

export enum Department {
    ADMINISTRATION = "Administration",
    SCIENCE = "Science",
    MATHEMATICS = "Mathematics",
    SOCIAL_STUDIES = "Social Studies",
    LANGUAGES = "Languages",
    COMPUTER_SCIENCE = "Computer Science",
    ARTS = "Arts",
    SPORTS = "Sports",
    SUPPORT_STAFF = "Support Staff",
}

export enum Designation {
    PRINCIPAL = "Principal",
    HEAD_OF_DEPARTMENT = "Head of Department",
    TEACHER = "Teacher",
    SPORTS_TEACHER = "Sports Teacher",
    LAB_ASSISTANT = "Lab Assistant",
    LIBRARIAN = "Librarian",
    CLERK = "Clerk",
}

export enum EmployeeType {
    FULL_TIME = "Full-time",
    PART_TIME = "Part-time",
    CONTRACT = "Contract",
}

export enum Qualification {
    SSLC = "SSLC",
    HSLC = "HSLC",
    HSSLC = "HSSLC",
    GRADUATE = "Graduate", // B.A, B.Sc, B.Com, etc.
    POST_GRADUATE = "Post-Graduate", // M.A, M.Sc, etc.
    B_ED = "B.Ed",
    M_ED = "M.Ed",
    PHD = "Ph.D.",
    DIPLOMA = "Diploma",
    OTHER = "Other",
}

export enum BloodGroup {
    A_POSITIVE = "A+",
    A_NEGATIVE = "A-",
    B_POSITIVE = "B+",
    B_NEGATIVE = "B-",
    AB_POSITIVE = "AB+",
    AB_NEGATIVE = "AB-",
    O_POSITIVE = "O+",
    O_NEGATIVE = "O-",
}

export type StaffType = 'Teaching' | 'Non-Teaching';

export interface Staff {
    id: string;
    staffType: StaffType;

    // 1. Personal Details
    employeeId: string;
    firstName: string;
    lastName: string;
    gender: Gender;
    dateOfBirth: string; // YYYY-MM-DD
    nationality: string;
    maritalStatus: MaritalStatus;
    photographUrl: string;
    bloodGroup: BloodGroup;
    aadhaarNumber: string;
    
    // 2. Contact Information
    contactNumber: string;
    emailAddress: string;
    permanentAddress: string;
    currentAddress: string;
    
    // 3. Qualifications & Experience
    educationalQualification: Qualification;
    specialization: string;
    yearsOfExperience: number;
    previousExperience: string; // textarea for details
    
    // 4. Professional Details
    dateOfJoining: string; // YYYY-MM-DD
    department: Department;
    designation: Designation;
    employeeType: EmployeeType;
    status: EmploymentStatus;
    subjectsTaught: string[]; // Specific to Teaching staff
    teacherLicenseNumber?: string; // Specific to Teaching staff

    // 5. Payroll Details
    salaryGrade?: string;
    basicSalary?: number;
    bankAccountNumber?: string;
    bankName?: string;
    panNumber?: string;

    // 6. Emergency Contact
    emergencyContactName: string;
    emergencyContactRelationship: string;
    emergencyContactNumber: string;
    medicalConditions?: string;
}


// NEW: Definition for a single subject including its marks.
export interface SubjectDefinition {
  name: string;
  examFullMarks: number;
  activityFullMarks: number;
}

// UPDATED: GradeDefinition now contains subjects and an optional class teacher ID.
export interface GradeDefinition {
  subjects: SubjectDefinition[];
  classTeacherId?: string;
}


export interface SubjectMark {
  subject: string;
  marks?: number; // For grades without split marks
  examMarks?: number; // For grades with split marks
  activityMarks?: number; // For grades with split marks
}

export interface Exam {
  id: string;
  name: string;
  results: SubjectMark[];
  teacherRemarks?: string;
}

export interface FeePayments {
  admissionFeePaid: boolean;
  tuitionFeesPaid: Record<string, boolean>; // e.g., { "April": true, "May": false }
  examFeesPaid: {
    terminal1: boolean;
    terminal2: boolean;
    terminal3: boolean;
  };
}

export interface Student {
  id: string;
  studentId?: string;
  rollNo: number;
  name: string;
  grade: Grade;
  contact: string;
  photographUrl: string;

  // New detailed biodata
  dateOfBirth: string; // YYYY-MM-DD
  gender: Gender;
  address: string;
  aadhaarNumber: string; // Student's Aadhaar
  pen: string; // Permanent Education Number
  category: Category;
  religion: string;
  bloodGroup?: BloodGroup;
  cwsn?: 'Yes' | 'No'; // Children with Special Needs


  // Parent Information
  fatherName: string;
  fatherOccupation: string;
  fatherAadhaar: string;
  motherName: string;
  motherOccupation: string;
  motherAadhaar: string;

  // Guardian Information (optional)
  guardianName?: string;
  guardianRelationship?: string;
  
  // Academic & Health (optional)
  lastSchoolAttended?: string;
  healthConditions?: string;
  achievements?: string;

  // Academic Performance
  academicPerformance?: Exam[];

  // Fee Payments
  feePayments?: FeePayments;

  // Status for Transfer Management
  status: StudentStatus;
  transferDate?: string;
}


// --- Transfer Certificate Types ---

export interface TcData {
  refNo: string;
  dateOfBirthInWords: string;
  schoolDues: string;
  qualifiedForPromotion: 'Yes' | 'No';
  lastAttendanceDate: string;
  applicationDate: string;
  issueDate: string;
  reasonForLeaving: string;
  generalConduct: string;
  remarks: string;
}

export interface TcStudentDetails {
  studentId: string; // Formatted ID: BMS...
  studentNumericId: string; // Original student numeric ID
  rollNo: number;
  name: string;
  gender: Gender;
  fatherName: string;
  motherName: string;
  currentClass: Grade;
  dateOfBirth: string;
  category: Category;
  religion: string;
}

export interface TcRecord {
  id: string; 
  tcData: TcData;
  studentDetails: TcStudentDetails;
}

// --- Service Certificate Types ---
export interface ServiceCertificateData {
  refNo: string;
  lastWorkingDay: string;
  issueDate: string;
  reasonForLeaving: string;
  generalConduct: string;
  remarks: string;
}

export interface ServiceCertificateStaffDetails {
  staffId: string; // Formatted Employee ID: BMS-T-001
  staffNumericId: string; // Original staff numeric ID
  name: string;
  gender: Gender;
  designation: Designation;
  dateOfJoining: string;
  dateOfBirth: string;
}

export interface ServiceCertificateRecord {
  id: string;
  certData: ServiceCertificateData;
  staffDetails: ServiceCertificateStaffDetails;
}


// --- NEW: Inventory Management Types ---
export enum InventoryCategory {
    CLASSROOM = "Classroom Furniture & Fixtures",
    TEACHING_MATERIALS = "Teaching & Learning Materials",
    LAB_EQUIPMENT = "Laboratory Equipment",
    LIBRARY = "Library Resources",
    SPORTS = "Sports & Physical Education",
    OFFICE = "Office & Administration",
    AV_TECH = "Audio-Visual & Technology",
    CLEANING = "Cleaning & Maintenance",
    TRANSPORT = "Transport Assets",
}

export enum InventoryStatus {
    GOOD = "In Good Condition",
    NEEDS_REPAIR = "Needs Repair",
    NEEDS_REPLACEMENT = "Needs Replacement",
}

export interface InventoryItem {
    id: string;
    name: string;
    category: InventoryCategory;
    subCategory?: string;
    quantity: number;
    status: InventoryStatus;
    location: string;
    purchaseDate: string; // YYYY-MM-DD
    lastMaintenanceDate?: string; // YYYY-MM-DD
    notes?: string;
}

// --- NEW: Hostel Management Types ---
export enum HostelBlock {
    A = "A Block",
    B = "B Block",
    C = "C Block (Girls)",
}

export enum RoomType {
    SINGLE = "Single Occupancy",
    DOUBLE = "Double Occupancy",
    DORMITORY = "Dormitory (4-person)",
}

export interface HostelRoom {
    id: string;
    block: HostelBlock;
    roomNumber: number;
    type: RoomType;
    capacity: number;
    facilities: string[]; // e.g., ["AC", "Attached Bathroom"]
}

export interface HostelResident {
    id: string; // Unique resident ID
    studentId: string; // Links to Student interface
    hostelRegistrationId: string; // e.g., BMS-H-001
    roomId: string; // Links to HostelRoom interface
    dateOfJoining: string; // YYYY-MM-DD
}

export enum HostelStaffRole {
    WARDEN = "Warden",
    MESS_MANAGER = "Mess Manager",
    MESS_COOK = "Mess Cook",
    MESS_HELPER = "Mess Helper",
    SECURITY = "Security",
    CLEANING_STAFF = "Cleaning Staff",
}

export enum PaymentStatus {
    PAID = "Paid",
    PENDING = "Pending",
}

export interface HostelStaff {
    id: string;
    // Personal Details
    name: string;
    gender: Gender;
    dateOfBirth: string; // YYYY-MM-DD
    photographUrl: string;
    bloodGroup?: BloodGroup;
    aadhaarNumber?: string;

    // Contact
    contactNumber: string;
    permanentAddress?: string;
    
    // Professional Details
    role: HostelStaffRole;
    dateOfJoining: string; // YYYY-MM-DD
    dutyShift?: string; // e.g., "Morning (6 AM - 2 PM)"
    assignedBlock?: HostelBlock;
    
    // Qualifications & Expertise
    qualification?: Qualification;
    expertise?: string;

    // Payroll
    salary: number;
    paymentStatus: PaymentStatus;
    
    // Other
    attendancePercent: number;
    emergencyContactName?: string;
    emergencyContactRelationship?: string;
    emergencyContactNumber?: string;
}

// --- NEW: Hostel Inventory ---
export enum HostelInventoryCategory {
    FURNITURE_BEDDING_ELECTRICAL = "Furniture, Bedding, & Electrical",
    CLEANING_SUPPLIES = "Cleaning Supplies",
    KITCHEN_EQUIPMENT = "Kitchen Equipment",
    GROCERIES_FOOD = "Groceries & Food Items",
}

export enum StockLogType {
    IN = "IN",
    OUT = "OUT",
}

export interface HostelInventoryItem {
    id: string;
    name: string;
    category: HostelInventoryCategory;
    currentStock: number;
    reorderLevel: number; // Alert when stock drops to this level
    notes?: string;
}

export interface StockLog {
    id: string; 
    itemId: string;
    itemName: string;
    type: StockLogType;
    quantity: number;
    date: string; // ISO string
    notes?: string;
}

// --- NEW: Staff Attendance Types ---
export enum AttendanceStatus {
    PRESENT = "Present",
    ABSENT = "Absent",
    LEAVE = "On Leave",
    LATE = "Late",
}

export interface StaffAttendanceRecord {
    [staffId: string]: AttendanceStatus;
}

// --- NEW: Student Attendance Types ---
export enum StudentAttendanceStatus {
    PRESENT = "Present",
    ABSENT = "Absent",
    LEAVE = "On Leave",
}

export interface StudentAttendanceRecord {
    [studentId: string]: StudentAttendanceStatus;
}

export interface DailyStudentAttendance {
    [grade: string]: StudentAttendanceRecord;
}

// --- NEW: Calendar Types ---
export enum CalendarEventType {
    HOLIDAY = "Holiday",
    EXAM = "Exam Schedule",
    EVENT = "School Event",
    MEETING = "Staff Meeting",
}

export interface CalendarEvent {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD (Start Date)
    endDate?: string; // YYYY-MM-DD (Optional End Date)
    type: CalendarEventType;
    description?: string;
}
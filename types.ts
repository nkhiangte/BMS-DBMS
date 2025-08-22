

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

export enum Role {
    ADMIN = "Admin",
    TEACHER = "Teacher",
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

export interface User {
  id: number;
  username: string;
  password_plaintext: string;
  name: string;
  role: Role;
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
    id: number;
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
  classTeacherId?: number;
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
  id: number;
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
  studentNumericId: number; // Original student numeric ID
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
  id: number; // Use timestamp for unique ID
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
  staffNumericId: number; // Original staff numeric ID
  name: string;
  gender: Gender;
  designation: Designation;
  dateOfJoining: string;
  dateOfBirth: string;
}

export interface ServiceCertificateRecord {
  id: number; // Use timestamp for unique ID
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
    id: number;
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
    id: number;
    block: HostelBlock;
    roomNumber: number;
    type: RoomType;
    capacity: number;
    facilities: string[]; // e.g., ["AC", "Attached Bathroom"]
}

export interface HostelResident {
    id: number; // Unique resident ID
    studentId: number; // Links to Student interface
    hostelRegistrationId: string; // e.g., BMS-H-001
    roomId: number; // Links to HostelRoom interface
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
    id: number;
    name: string;
    gender: Gender;
    role: HostelStaffRole;
    photographUrl: string;
    contactNumber: string;
    dateOfJoining: string; // YYYY-MM-DD
    dutyShift?: string; // e.g., "Morning (6 AM - 2 PM)"
    assignedBlock?: HostelBlock;
    salary: number;
    paymentStatus: PaymentStatus;
    attendancePercent: number;
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
    id: number;
    name: string;
    category: HostelInventoryCategory;
    currentStock: number;
    reorderLevel: number; // Alert when stock drops to this level
    notes?: string;
}

export interface StockLog {
    id: number; // Timestamp
    itemId: number;
    itemName: string;
    type: StockLogType;
    quantity: number;
    date: string; // ISO string
    notes?: string;
}
import { Student, Grade, FeePayments, SubjectMark, GradeDefinition } from './types';
import { FEE_STRUCTURE, academicMonths, GRADES_LIST } from './constants';

const getGradeCode = (grade: Grade): string => {
    switch (grade) {
        case Grade.NURSERY: return 'NU';
        case Grade.KINDERGARTEN: return 'KG';
        case Grade.I: return '01';
        case Grade.II: return '02';
        case Grade.III: return '03';
        case Grade.IV: return '04';
        case Grade.V: return '05';
        case Grade.VI: return '06';
        case Grade.VII: return '07';
        case Grade.VIII: return '08';
        case Grade.IX: return '09';
        case Grade.X: return '10';
        default: return 'XX'; // Fallback for any unexpected grade
    }
};

export const formatStudentId = (student: Student, academicYear: string): string => {
    // Extract the last two digits of the start year from "2025-2026" -> "25"
    const startYear = academicYear.substring(0, 4);
    const yearSuffix = startYear.slice(-2);
    
    const gradeCode = getGradeCode(student.grade);
    
    // Pad roll number to be at least two digits (e.g., 1 -> "01")
    const paddedRollNo = String(student.rollNo).padStart(2, '0');
    
    return `BMS${yearSuffix}${gradeCode}${paddedRollNo}`;
};

export const getFeeDetails = (grade: Grade) => {
    const set1Grades: Grade[] = [Grade.NURSERY, Grade.KINDERGARTEN, Grade.I, Grade.II];
    const set2Grades: Grade[] = [Grade.III, Grade.IV, Grade.V, Grade.VI];

    if (set1Grades.includes(grade)) return FEE_STRUCTURE.set1;
    if (set2Grades.includes(grade)) return FEE_STRUCTURE.set2;
    return FEE_STRUCTURE.set3;
};

export const calculateDues = (student: Student): string[] => {
    // If a student record was created before the feePayments feature, it might be undefined.
    // We create a default state assuming no fees are paid.
    const defaultPayments: FeePayments = {
        admissionFeePaid: false,
        tuitionFeesPaid: academicMonths.reduce((acc, month) => ({ ...acc, [month]: false }), {}),
        examFeesPaid: { terminal1: false, terminal2: false, terminal3: false },
    };
    const feePayments = student.feePayments || defaultPayments;

    const duesMessages: string[] = [];

    if (!feePayments.admissionFeePaid) {
        duesMessages.push('Admission Fee');
    }

    const unpaidTuitionMonths = academicMonths.filter(month => !feePayments.tuitionFeesPaid[month]);
    if (unpaidTuitionMonths.length > 0) {
        duesMessages.push(`Tuition Fee: ${unpaidTuitionMonths.length} month(s) pending`);
    }

    const unpaidExams: string[] = [];
    if (!feePayments.examFeesPaid.terminal1) unpaidExams.push('Term 1');
    if (!feePayments.examFeesPaid.terminal2) unpaidExams.push('Term 2');
    if (!feePayments.examFeesPaid.terminal3) unpaidExams.push('Term 3');
    if (unpaidExams.length > 0) {
        duesMessages.push(`Exam Fee: ${unpaidExams.join(', ')}`);
    }

    return duesMessages;
};

export const createDefaultFeePayments = (): FeePayments => ({
    admissionFeePaid: true,
    tuitionFeesPaid: academicMonths.reduce((acc, month) => ({ ...acc, [month]: false }), {}),
    examFeesPaid: { terminal1: false, terminal2: false, terminal3: false },
});

export const calculateStudentResult = (
    finalTermResults: SubjectMark[],
    gradeDef: GradeDefinition,
    grade: Grade
): { finalResult: 'PASS' | 'FAIL' | 'SIMPLE PASS', failedSubjects: string[] } => {
    if (!finalTermResults || !gradeDef) {
        return { finalResult: 'FAIL', failedSubjects: ['No data'] };
    }

    const failedSubjects: string[] = [];
    const hasActivityMarks = gradeDef.subjects.some(s => s.activityFullMarks > 0);
    const gradeCategory = [Grade.IX, Grade.X].includes(grade) ? 'IX-X'
        : [Grade.NURSERY, Grade.KINDERGARTEN, Grade.I, Grade.II].includes(grade) ? 'NUR-II'
        : 'III-VIII';

    gradeDef.subjects.forEach(subject => {
        const result = finalTermResults.find(r => r.subject === subject.name);
        const examMarks = result?.examMarks ?? 0;
        const singleMark = result?.marks ?? 0;
        const obtained = hasActivityMarks ? (examMarks + (result?.activityMarks ?? 0)) : singleMark;
        const full = subject.examFullMarks + (hasActivityMarks ? subject.activityFullMarks : 0);

        if (full > 0) {
            let failed = false;
            if (gradeCategory === 'III-VIII') {
                if (hasActivityMarks && examMarks < 20) {
                    failed = true;
                } else if (!hasActivityMarks && singleMark < 33) { // Fallback for old system
                     failed = true;
                }
            } else {
                if (obtained < 33) {
                    failed = true;
                }
            }
            if (failed) {
                 failedSubjects.push(subject.name);
            }
        }
    });

    let finalResult: 'PASS' | 'FAIL' | 'SIMPLE PASS' = 'PASS';
    if (failedSubjects.length > 1) {
        finalResult = 'FAIL';
    } else if (failedSubjects.length === 1) {
        finalResult = 'SIMPLE PASS';
    }
    
    return { finalResult, failedSubjects };
};

export const getNextGrade = (currentGrade: Grade): Grade | null => {
    const currentIndex = GRADES_LIST.indexOf(currentGrade);
    if (currentIndex === -1 || currentIndex >= GRADES_LIST.length - 1) {
        return null;
    }
    return GRADES_LIST[currentIndex + 1];
};

export const formatDateForDisplay = (isoDate?: string): string => {
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    return isoDate || '';
  }
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

export const formatDateForStorage = (displayDate?: string): string => {
  if (!displayDate) {
    return '';
  }
  // If it's already in YYYY-MM-DD, return it.
  if (/^\d{4}-\d{2}-\d{2}$/.test(displayDate)) {
    return displayDate;
  }
  // Match D(D)/M(M)/YYYY
  const match = displayDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) {
    return ''; // Return empty if format is completely wrong
  }
  const [, day, month, year] = match;
  
  // Pad with leading zeros to ensure YYYY-MM-DD format
  const paddedDay = day.padStart(2, '0');
  const paddedMonth = month.padStart(2, '0');
  
  return `${year}-${paddedMonth}-${paddedDay}`;
};
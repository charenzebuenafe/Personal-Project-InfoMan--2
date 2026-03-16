export type Visitor = {
  id: string; // School ID or Institutional Email
  name: string;
  college: string;
  office: string;
  type: 'student' | 'faculty' | 'employee';
};

export type Purpose = 'reading books' | 'research in thesis' | 'use of computer' | 'doing assignments';

export type VisitorLog = {
  id: string;
  userId: string;
  checkInDateTime: any; // Firestore Timestamp
  purposeName: string;
  visitorName: string;
  visitorCollegeOrOffice: string;
  visitorIsEmployee: boolean;
};

export const COLLEGES = [
  'College of Arts and Sciences',
  'College of Engineering',
  'College of Computer Studies',
  'College of Business Administration',
  'College of Education',
  'College of Nursing',
  'College of Criminology',
  'College of Music',
  'Graduate School',
  'University Office',
  'Other'
];

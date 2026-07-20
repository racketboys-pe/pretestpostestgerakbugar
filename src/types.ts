export interface Question {
  id: number;
  question: string;
  options: {
    key: 'A' | 'B' | 'C' | 'D';
    text: string;
  }[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}

export interface Student {
  nama: string;
  kelas: string;
  sekolah: string;
}

export interface Submission {
  id: string;
  timestamp: string;
  nama: string;
  kelas: string;
  sekolah: string;
  tipeTes: 'Pretest' | 'Posttest';
  answers: Record<number, 'A' | 'B' | 'C' | 'D'>;
  score: number; // calculated as (correctCount / totalQuestions) * 100
  correctCount: number;
  totalQuestions: number;
}

export interface AdminSettings {
  googleSheetUrl: string;
  adminId: string;
  adminPass: string;
}

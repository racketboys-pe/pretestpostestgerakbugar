import { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Settings, 
  Sparkles,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import StudentQuiz from './components/StudentQuiz';
import AdminPanel from './components/AdminPanel';
import { Submission, AdminSettings } from './types';

export default function App() {
  // Navigation: 'student' | 'admin'
  const [view, setView] = useState<'student' | 'admin'>('student');

  // Submissions State
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // Admin Config State
  const [settings, setSettings] = useState<AdminSettings>({
    googleSheetUrl: '',
    adminId: 'admin',
    adminPass: 'admin123'
  });

  // Load submissions and settings on mount
  useEffect(() => {
    const savedSubmissions = localStorage.getItem('pemahaman_konsep_submissions');
    if (savedSubmissions) {
      try {
        setSubmissions(JSON.parse(savedSubmissions));
      } catch (e) {
        console.error("Failed to parse submissions", e);
      }
    } else {
      // Seed initial dummy/simulation data to give a perfect immediate preview!
      const initialSeed: Submission[] = [
        {
          id: 'sub_seed_1',
          timestamp: '20/7/2026, 08.00.00',
          nama: 'Budi Santoso',
          kelas: 'Kelas IV A',
          sekolah: 'SDN Merdeka 01',
          tipeTes: 'Pretest',
          answers: { 1: 'C', 2: 'A', 3: 'A', 4: 'B', 5: 'B', 6: 'A', 7: 'C', 8: 'B', 9: 'A', 10: 'B' },
          score: 48,
          correctCount: 12,
          totalQuestions: 25
        },
        {
          id: 'sub_seed_2',
          timestamp: '20/7/2026, 08.15.22',
          nama: 'Budi Santoso',
          kelas: 'Kelas IV A',
          sekolah: 'SDN Merdeka 01',
          tipeTes: 'Posttest',
          answers: { 1: 'C', 2: 'B', 3: 'B', 4: 'C', 5: 'B', 6: 'B', 7: 'B', 8: 'B', 9: 'C', 10: 'B', 11: 'B', 12: 'B', 13: 'B', 14: 'B', 15: 'B', 16: 'A', 17: 'A', 18: 'A', 19: 'B', 20: 'A', 21: 'A', 22: 'B', 23: 'A', 24: 'B', 25: 'B' },
          score: 96,
          correctCount: 24,
          totalQuestions: 25
        },
        {
          id: 'sub_seed_3',
          timestamp: '20/7/2026, 09.30.15',
          nama: 'Siti Rahma',
          kelas: 'Kelas IV B',
          sekolah: 'SDN Pembangunan 02',
          tipeTes: 'Pretest',
          answers: { 1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'B', 6: 'B', 7: 'A', 8: 'D' },
          score: 52,
          correctCount: 13,
          totalQuestions: 25
        },
        {
          id: 'sub_seed_4',
          timestamp: '20/7/2026, 09.45.10',
          nama: 'Siti Rahma',
          kelas: 'Kelas IV B',
          sekolah: 'SDN Pembangunan 02',
          tipeTes: 'Posttest',
          answers: { 1: 'C', 2: 'B', 3: 'B', 4: 'C', 5: 'B', 6: 'B', 7: 'B', 8: 'B', 9: 'C', 10: 'B', 11: 'B', 12: 'B', 13: 'B', 14: 'C', 15: 'B', 16: 'A', 17: 'A', 18: 'A', 19: 'B', 20: 'A', 21: 'A', 22: 'B', 23: 'A', 24: 'B', 25: 'B' },
          score: 88,
          correctCount: 22,
          totalQuestions: 25
        },
        {
          id: 'sub_seed_5',
          timestamp: '20/7/2026, 11.02.40',
          nama: 'Rizky Pratama',
          kelas: 'Kelas IV A',
          sekolah: 'SDN Merdeka 01',
          tipeTes: 'Pretest',
          answers: { 1: 'B', 2: 'B', 3: 'A', 4: 'C', 5: 'B', 6: 'C', 7: 'B' },
          score: 40,
          correctCount: 10,
          totalQuestions: 25
        }
      ];
      setSubmissions(initialSeed);
      localStorage.setItem('pemahaman_konsep_submissions', JSON.stringify(initialSeed));
    }

    const savedSettings = localStorage.getItem('pemahaman_konsep_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  // Handle a new submission from student
  const handleNewSubmission = (newSub: Submission) => {
    const updated = [newSub, ...submissions];
    setSubmissions(updated);
    localStorage.setItem('pemahaman_konsep_submissions', JSON.stringify(updated));
  };

  // Handle saving new settings from Admin Panel
  const handleSaveSettings = (newSettings: AdminSettings) => {
    setSettings(newSettings);
    localStorage.setItem('pemahaman_konsep_settings', JSON.stringify(newSettings));
  };

  // Clear all submissions
  const handleClearSubmissions = () => {
    setSubmissions([]);
    localStorage.setItem('pemahaman_konsep_submissions', JSON.stringify([]));
  };

  // Delete single submission
  const handleDeleteSubmission = (id: string) => {
    const updated = submissions.filter(s => s.id !== id);
    setSubmissions(updated);
    localStorage.setItem('pemahaman_konsep_submissions', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-teal-500 selection:text-white" id="main-app-container">
      {/* Upper Navigation Bar */}
      <header className="bg-white border-b border-slate-150 sticky top-0 z-50 shadow-sm" id="main-header">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setView('student')} id="brand-logo">
            <div className="p-2 bg-gradient-to-tr from-teal-500 to-emerald-500 text-white rounded-xl shadow-md shadow-teal-500/10">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-slate-900 tracking-tight text-sm md:text-base uppercase flex items-center gap-1.5">
                KONSEPMOTORIC
                <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded-full lowercase">v1.0</span>
              </span>
              <p className="text-[10px] text-slate-400 font-bold -mt-0.5 uppercase tracking-wide hidden sm:block">Instrumen Tes Non-Lokomotor</p>
            </div>
          </div>

          {/* Navigation Controls */}
          <nav className="flex items-center gap-2" id="header-nav-tabs">
            {/* Student Mode Button */}
            <button
              onClick={() => setView('student')}
              id="btn-nav-student"
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                view === 'student'
                  ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-400/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Mulai Tes Siswa
            </button>

            {/* Admin Panel Button */}
            <button
              onClick={() => setView('admin')}
              id="btn-nav-admin"
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                view === 'admin'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Settings className="w-4 h-4" />
              Panel Guru / Admin
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Render Area */}
      <main className="flex-grow py-8" id="main-content-area">
        <AnimatePresence mode="wait">
          {view === 'student' ? (
            <motion.div
              key="student"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <StudentQuiz 
                webAppUrl={settings.googleSheetUrl} 
                onNewSubmission={handleNewSubmission} 
              />
            </motion.div>
          ) : (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <AdminPanel 
                settings={settings}
                submissions={submissions}
                onSaveSettings={handleSaveSettings}
                onClearSubmissions={handleClearSubmissions}
                onDeleteSubmission={handleDeleteSubmission}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Aesthetic and Informative Footer */}
      <footer className="bg-white border-t border-slate-150 py-6" id="main-footer">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span>Media Board Game "Gerak Bugarku" — Kelas IV SD</span>
          </div>
          <p className="font-normal text-slate-400">
            &copy; Gurumaskini 2026. Aplikasi Instrumen Pemahaman Konsep Gerak Dasar Non-Lokomotor.
          </p>
        </div>
      </footer>
    </div>
  );
}

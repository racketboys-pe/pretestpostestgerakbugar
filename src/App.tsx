import { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Settings, 
  Sparkles,
  Layers,
  Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import StudentQuiz from './components/StudentQuiz';
import AdminPanel from './components/AdminPanel';
import { Submission, AdminSettings, AppTheme } from './types';
import { themeMap } from './lib/theme';

export default function App() {
  // Navigation: 'student' | 'admin'
  const [view, setView] = useState<'student' | 'admin'>('student');

  // Submissions State
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // Theme State
  const [theme, setTheme] = useState<AppTheme>('mint');

  // Admin Config State
  const [settings, setSettings] = useState<AdminSettings>({
    googleSheetUrl: '',
    adminId: 'admin',
    adminPass: 'admin123'
  });

  // Load submissions, settings, and theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('pemahaman_konsep_theme') as AppTheme;
    if (savedTheme && themeMap[savedTheme]) {
      setTheme(savedTheme);
    }

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

  const currentTheme = themeMap[theme];

  return (
    <div className={`min-h-screen ${currentTheme.bg} ${currentTheme.text} font-sans flex flex-col ${currentTheme.selection}`} id="main-app-container">
      {/* Upper Navigation Bar */}
      <header className={`${currentTheme.headerBg} border-b ${currentTheme.border} sticky top-0 z-50 shadow-sm transition-colors duration-300`} id="main-header">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('student')} id="brand-logo">
            <div className={`p-2 bg-gradient-to-tr ${currentTheme.gradientButton} text-white rounded-xl shadow-md`}>
              <Layers className="w-5 h-5" />
            </div>
            <div className="hidden xs:block">
              <span className={`font-black tracking-tight text-xs sm:text-sm md:text-base uppercase flex items-center gap-1.5 ${currentTheme.darkCanvas ? 'text-white' : 'text-slate-900'}`}>
                KONSEPMOTORIC
                <span className={`text-[9px] font-bold ${currentTheme.darkCanvas ? 'bg-violet-900/50 text-violet-300' : 'bg-teal-100 text-teal-800'} px-1.5 py-0.5 rounded-full lowercase`}>v1.0</span>
              </span>
              <p className="text-[9px] text-slate-400 font-bold -mt-0.5 uppercase tracking-wide hidden md:block">Instrumen Tes Non-Lokomotor</p>
            </div>
          </div>

          {/* Theme Selector Dots */}
          <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50" id="theme-selector">
            {[
              { id: 'mint', color: 'bg-emerald-500', name: 'Emerald Mint' },
              { id: 'ocean', color: 'bg-blue-500', name: 'Ocean Wave' },
              { id: 'sunset', color: 'bg-orange-500', name: 'Sunset Glow' },
              { id: 'cosmic', color: 'bg-[#1e1b4b] border border-violet-400', name: 'Cosmic Dark' },
              { id: 'lavender', color: 'bg-purple-500', name: 'Lavender Garden' }
            ].map(t => (
              <button
                key={t.id}
                title={t.name}
                onClick={() => {
                  setTheme(t.id as AppTheme);
                  localStorage.setItem('pemahaman_konsep_theme', t.id);
                }}
                className={`w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full ${t.color} transition-all duration-200 relative flex items-center justify-center ${theme === t.id ? 'scale-110 ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-slate-900' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
              >
                {theme === t.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                )}
              </button>
            ))}
          </div>

          {/* Navigation Controls */}
          <nav className="flex items-center gap-1.5 sm:gap-2" id="header-nav-tabs">
            {/* Student Mode Button */}
            <button
              onClick={() => setView('student')}
              id="btn-nav-student"
              className={`flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
                view === 'student'
                  ? currentTheme.navStudentActive
                  : currentTheme.darkCanvas 
                    ? 'text-slate-300 hover:bg-slate-800/50' 
                    : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Mulai Tes Siswa</span>
              <span className="xs:hidden">Siswa</span>
            </button>

            {/* Admin Panel Button */}
            <button
              onClick={() => setView('admin')}
              id="btn-nav-admin"
              className={`flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
                view === 'admin'
                  ? currentTheme.darkCanvas
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                    : 'bg-slate-900 text-white'
                  : currentTheme.darkCanvas 
                    ? 'text-slate-300 hover:bg-slate-800/50' 
                    : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Panel Guru</span>
              <span className="xs:hidden">Guru</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Render Area */}
      <main className="flex-grow py-6 sm:py-8" id="main-content-area">
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
                theme={theme}
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
                theme={theme}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Aesthetic and Informative Footer */}
      <footer className={`${currentTheme.headerBg} border-t ${currentTheme.border} py-6 transition-colors duration-300`} id="main-footer">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className={`w-4 h-4 ${currentTheme.darkCanvas ? 'text-violet-400' : 'text-teal-500'}`} />
            <span>Media Board Game "Gerak Bugarku" — Kelas IV SD</span>
          </div>
          <p className="font-normal text-slate-400 text-center md:text-right">
            &copy; Gurumaskini 2026. Aplikasi Instrumen Pemahaman Konsep Gerak Dasar Non-Lokomotor.
          </p>
        </div>
      </footer>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  School, 
  GraduationCap, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle,
  RotateCcw,
  BookOpen,
  Send,
  Sparkles,
  ClipboardList,
  XCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Student, Submission, Question, AppTheme } from '../types';
import { questions } from '../questions';
import { themeMap } from '../lib/theme';

interface StudentQuizProps {
  webAppUrl: string;
  onNewSubmission: (submission: Submission) => void;
  theme?: AppTheme;
}

export default function StudentQuiz({ webAppUrl, onNewSubmission, theme = 'mint' }: StudentQuizProps) {
  const cTheme = themeMap[theme];

  // Navigation states: 'register' | 'quiz' | 'review' | 'success'
  const [step, setStep] = useState<'register' | 'quiz' | 'review' | 'success'>('register');
  
  // Student registration data
  const [student, setStudent] = useState<Student>({
    nama: '',
    kelas: 'Kelas IV A',
    sekolah: ''
  });
  const [tipeTes, setTipeTes] = useState<'Pretest' | 'Posttest'>('Pretest');
  
  // Answers state
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showDetailReview, setShowDetailReview] = useState(false);
  
  // Quiz status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastSubmission, setLastSubmission] = useState<Submission | null>(null);
  
  // Validation for registration
  const [regError, setRegError] = useState('');

  // Auto-fill student data from localStorage if they have used it before
  useEffect(() => {
    const savedStudent = localStorage.getItem('last_student_info');
    if (savedStudent) {
      try {
        setStudent(JSON.parse(savedStudent));
      } catch (e) {
        console.error("Failed to parse saved student info", e);
      }
    }
  }, []);

  const handleStartQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student.nama.trim()) {
      setRegError('Nama lengkap wajib diisi.');
      return;
    }
    if (!student.sekolah.trim()) {
      setRegError('Nama sekolah wajib diisi.');
      return;
    }
    setRegError('');
    localStorage.setItem('last_student_info', JSON.stringify(student));
    setStep('quiz');
    setCurrentQuestionIndex(0);
  };

  const handleSelectOption = (questionId: number, optionKey: 'A' | 'B' | 'C' | 'D') => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionKey
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setStep('review');
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateResults = (): { score: number; correctCount: number } => {
    let correctCount = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });
    const score = Math.round((correctCount / questions.length) * 100);
    return { score, correctCount };
  };

  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    const { score, correctCount } = calculateResults();
    
    const newSubmission: Submission = {
      id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
      nama: student.nama.trim(),
      kelas: student.kelas,
      sekolah: student.sekolah.trim(),
      tipeTes,
      answers,
      score,
      correctCount,
      totalQuestions: questions.length
    };

    // 1. Save locally to historical list in App state
    onNewSubmission(newSubmission);

    // 2. Submit to Google Sheets if configured
    let sheetSuccess = true;
    if (webAppUrl) {
      try {
        // Prepare Google Apps Script compatible flat payload
        const payload = {
          timestamp: newSubmission.timestamp,
          nama: newSubmission.nama,
          kelas: newSubmission.kelas,
          sekolah: newSubmission.sekolah,
          tipeTes: newSubmission.tipeTes,
          correctCount: newSubmission.correctCount,
          totalQuestions: newSubmission.totalQuestions,
          score: newSubmission.score,
          ...Object.fromEntries(
            questions.flatMap(q => {
              const ans = newSubmission.answers[q.id] || '';
              const isCorrect = ans === q.correctAnswer;
              return [
                [`Q${q.id}`, ans],
                [`Q${q.id}_isCorrect`, isCorrect]
              ];
            })
          )
        };

        // We use mode: 'no-cors' so that the cross-origin post works seamlessly.
        // It's the most reliable way to post to Apps Script from a client app.
        await fetch(webAppUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.error("Google Sheets Submission Error:", err);
        sheetSuccess = false;
        // We will still allow the student to complete because the data is saved locally in localStorage
      }
    }

    setLastSubmission(newSubmission);
    setIsSubmitting(false);
    setStep('success');
  };

  const handleResetQuiz = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setStep('register');
    setLastSubmission(null);
    setShowDetailReview(false);
  };

  const totalAnswered = Object.keys(answers).length;
  const currentQuestion = questions[currentQuestionIndex];
  const progressPercent = Math.round((totalAnswered / questions.length) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6" id="student-quiz-section">
      <AnimatePresence mode="wait">
        
        {/* STEP 1: REGISTER */}
        {step === 'register' && (
          <motion.div
            key="register-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className={`${cTheme.cardBg} rounded-2xl shadow-xl border ${cTheme.border} overflow-hidden`}
          >
            {/* Header Banner */}
            <div className={`bg-gradient-to-r ${cTheme.gradientHeader} p-8 text-white text-center relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>
              
              <div className="inline-flex p-3 bg-white/10 backdrop-blur-md rounded-xl mb-4 border border-white/20 shadow-inner">
                <ClipboardList className="w-8 h-8 text-white animate-pulse" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight animate-fade-in" id="main-quiz-title">
                INSTRUMEN TES PEMAHAMAN KONSEP
              </h1>
              <p className="opacity-90 font-medium mt-1 text-sm md:text-base">
                Gerak Dasar Non-Lokomotor (Pretest / Posttest)
              </p>
              <div className={`mt-4 inline-flex items-center gap-2 ${cTheme.badgeBg} backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-semibold border border-white/10`}>
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                Media Board Game "Gerak Bugarku" — Kelas IV SD
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleStartQuiz} className="p-8 space-y-6">
              <div className={`border-b ${cTheme.border} pb-4`}>
                <h2 className={`text-lg font-bold ${cTheme.darkCanvas ? 'text-white' : 'text-slate-800'} flex items-center gap-2`}>
                  <User className={`w-5 h-5 ${cTheme.textPrimary}`} />
                  Identitas Peserta Didik
                </h2>
                <p className={`${cTheme.textMuted} text-xs mt-1`}>
                  Silakan masukkan data diri dengan benar sebelum memulai pengerjaan tes.
                </p>
              </div>

              {regError && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 border border-red-100 text-sm" id="reg-error-msg">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nama */}
                <div className="space-y-2">
                  <label htmlFor="nama-input" className={`block text-xs font-bold uppercase tracking-wider ${cTheme.textMuted}`}>
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      id="nama-input"
                      type="text"
                      required
                      placeholder="Contoh: Muhammad Rafif"
                      value={student.nama}
                      onChange={e => setStudent(prev => ({ ...prev, nama: e.target.value }))}
                      className={`block w-full pl-11 pr-4 py-3 ${cTheme.inputBg} border ${cTheme.darkCanvas ? 'border-slate-800' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 ${cTheme.ringFocus} ${cTheme.borderFocus} ${cTheme.darkCanvas ? 'focus:bg-slate-900' : 'focus:bg-white'} ${cTheme.inputText} transition-colors text-sm font-medium`}
                    />
                  </div>
                </div>

                {/* Sekolah */}
                <div className="space-y-2">
                  <label htmlFor="sekolah-input" className={`block text-xs font-bold uppercase tracking-wider ${cTheme.textMuted}`}>
                    Sekolah
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <School className="w-5 h-5" />
                    </div>
                    <input
                      id="sekolah-input"
                      type="text"
                      required
                      placeholder="Contoh: SDN 1 Merdeka"
                      value={student.sekolah}
                      onChange={e => setStudent(prev => ({ ...prev, sekolah: e.target.value }))}
                      className={`block w-full pl-11 pr-4 py-3 ${cTheme.inputBg} border ${cTheme.darkCanvas ? 'border-slate-800' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 ${cTheme.ringFocus} ${cTheme.borderFocus} ${cTheme.darkCanvas ? 'focus:bg-slate-900' : 'focus:bg-white'} ${cTheme.inputText} transition-colors text-sm font-medium`}
                    />
                  </div>
                </div>

                {/* Kelas Select */}
                <div className="space-y-2">
                  <label htmlFor="kelas-select" className={`block text-xs font-bold uppercase tracking-wider ${cTheme.textMuted}`}>
                    Kelas
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <select
                      id="kelas-select"
                      value={student.kelas}
                      onChange={e => setStudent(prev => ({ ...prev, kelas: e.target.value }))}
                      className={`block w-full pl-11 pr-4 py-3 ${cTheme.inputBg} border ${cTheme.darkCanvas ? 'border-slate-800' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 ${cTheme.ringFocus} ${cTheme.borderFocus} ${cTheme.darkCanvas ? 'focus:bg-slate-900' : 'focus:bg-white'} ${cTheme.inputText} transition-colors text-sm font-medium appearance-none`}
                    >
                      <option value="Kelas IV A" className={cTheme.darkCanvas ? 'bg-slate-900 text-white' : ''}>Kelas IV A</option>
                      <option value="Kelas IV B" className={cTheme.darkCanvas ? 'bg-slate-900 text-white' : ''}>Kelas IV B</option>
                      <option value="Kelas IV C" className={cTheme.darkCanvas ? 'bg-slate-900 text-white' : ''}>Kelas IV C</option>
                      <option value="Kelas IV D" className={cTheme.darkCanvas ? 'bg-slate-900 text-white' : ''}>Kelas IV D</option>
                      <option value="Lainnya" className={cTheme.darkCanvas ? 'bg-slate-900 text-white' : ''}>Lainnya / Modifikasi</option>
                    </select>
                  </div>
                </div>

                {/* Tipe Tes (Pretest / Posttest) */}
                <div className="space-y-2">
                  <label className={`block text-xs font-bold uppercase tracking-wider ${cTheme.textMuted}`}>
                    Jenis Instrumen Tes
                  </label>
                  <div className="grid grid-cols-2 gap-3" id="test-type-selection">
                    <button
                      type="button"
                      id="btn-select-pretest"
                      onClick={() => setTipeTes('Pretest')}
                      className={`py-3 px-4 rounded-xl font-bold text-sm transition-all border flex items-center justify-center gap-2 ${
                        tipeTes === 'Pretest'
                          ? cTheme.darkCanvas
                            ? 'bg-amber-950/40 text-amber-300 border-amber-800 ring-2 ring-amber-500/20'
                            : 'bg-amber-50 text-amber-700 border-amber-300 ring-2 ring-amber-400/20'
                          : `${cTheme.inputBg} ${cTheme.darkCanvas ? 'text-slate-400 border-slate-800' : 'text-slate-600 border-slate-200'} hover:bg-opacity-80`
                      }`}
                    >
                      <BookOpen className="w-4 h-4 shrink-0" />
                      PRE-TES
                    </button>
                    <button
                      type="button"
                      id="btn-select-posttest"
                      onClick={() => setTipeTes('Posttest')}
                      className={`py-3 px-4 rounded-xl font-bold text-sm transition-all border flex items-center justify-center gap-2 ${
                        tipeTes === 'Posttest'
                          ? cTheme.darkCanvas
                            ? 'bg-indigo-950/40 text-indigo-300 border-indigo-800 ring-2 ring-indigo-500/20'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-400/20'
                          : `${cTheme.inputBg} ${cTheme.darkCanvas ? 'text-slate-400 border-slate-800' : 'text-slate-600 border-slate-200'} hover:bg-opacity-80`
                      }`}
                    >
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      POST-TES
                    </button>
                  </div>
                </div>
              </div>

              {/* Instructions and Rules */}
              <div className={`${cTheme.inputBg} border ${cTheme.border} rounded-2xl p-5 space-y-3`}>
                <h3 className={`font-bold ${cTheme.darkCanvas ? 'text-slate-200' : 'text-slate-700'} text-sm flex items-center gap-2`}>
                  <HelpCircle className="w-4 h-4 text-slate-500" />
                  Petunjuk Pengerjaan Soal:
                </h3>
                <ul className={`text-xs ${cTheme.darkCanvas ? 'text-slate-300' : 'text-slate-600'} space-y-1.5 pl-6 list-decimal leading-relaxed`}>
                  <li>Bacalah tiap soal dengan teliti dan konsentrasi tinggi.</li>
                  <li>Pilih satu jawaban yang paling tepat (A, B, C, atau D) di setiap soal.</li>
                  <li>Kerjakan secara mandiri dan jujur tanpa bantuan orang lain.</li>
                  <li>Durasi waktu ideal pengerjaan adalah <strong>30 menit</strong>.</li>
                  <li>Setelah selesai, periksa kembali semua jawaban sebelum menekan tombol kirim.</li>
                </ul>
              </div>

              {/* Start Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  id="btn-start-quiz"
                  className={`w-full bg-gradient-to-r ${cTheme.gradientButton} text-white font-extrabold py-4 px-6 rounded-xl shadow-lg shadow-indigo-600/10 transition-all duration-200 flex items-center justify-center gap-2 group transform active:scale-[0.98]`}
                >
                  Mulai Pengerjaan Tes Sekarang
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* STEP 2: QUIZ MAIN */}
        {step === 'quiz' && (
          <motion.div
            key="quiz-main"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Quick Header */}
            <div className={`${cTheme.cardBg} rounded-xl border ${cTheme.border} shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg text-xs font-bold ${
                  tipeTes === 'Pretest' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                }`}>
                  {tipeTes === 'Pretest' ? 'PRETEST' : 'POSTTEST'}
                </div>
                <div>
                  <h4 className={`font-bold ${cTheme.darkCanvas ? 'text-white' : 'text-slate-800'} text-sm`}>{student.nama}</h4>
                  <p className={`text-xs ${cTheme.textMuted}`}>{student.kelas} • {student.sekolah}</p>
                </div>
              </div>
              
              {/* Progress Text */}
              <div className="text-right">
                <div className={`text-xs font-semibold ${cTheme.textMuted}`}>Kemajuan Tes</div>
                <div className={`text-sm font-black ${cTheme.darkCanvas ? 'text-slate-200' : 'text-slate-700'}`}>
                  {totalAnswered} / {questions.length} Terjawab
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className={`w-full ${cTheme.darkCanvas ? 'bg-slate-800' : 'bg-slate-100'} rounded-full h-2.5 overflow-hidden shadow-inner`}>
              <div 
                className={`bg-gradient-to-r ${cTheme.gradientButton} h-2.5 rounded-full transition-all duration-300`}
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            {/* Question Card */}
            <div className={`${cTheme.cardBg} rounded-2xl shadow-md border ${cTheme.border} overflow-hidden`} id={`question-card-${currentQuestion.id}`}>
              {/* Question Index Badge */}
              <div className={`${cTheme.darkCanvas ? 'bg-slate-800/50' : 'bg-slate-50'} px-6 py-4 border-b ${cTheme.border} flex items-center justify-between`}>
                <span className={`text-sm font-extrabold ${cTheme.textAccent}`}>
                  PERTANYAAN {currentQuestion.id} dari {questions.length}
                </span>
                <span className={`text-xs ${cTheme.bgAccent} ${cTheme.textAccent} font-semibold px-2.5 py-1 rounded-full border ${cTheme.borderAccent}`}>
                  Gerak Non-Lokomotor
                </span>
              </div>

              {/* Question Text */}
              <div className="p-6 md:p-8 space-y-6">
                <h3 className={`text-lg font-bold ${cTheme.darkCanvas ? 'text-white' : 'text-slate-800'} leading-relaxed md:text-xl`}>
                  {currentQuestion.question}
                </h3>

                {/* Answer Options */}
                <div className="space-y-3.5" id="options-container">
                  {currentQuestion.options.map((opt) => {
                    const isSelected = answers[currentQuestion.id] === opt.key;
                    return (
                      <button
                        key={opt.key}
                        id={`option-btn-${opt.key}`}
                        type="button"
                        onClick={() => handleSelectOption(currentQuestion.id, opt.key)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 group ${
                          isSelected ? cTheme.optionActive : cTheme.optionInactive
                        }`}
                      >
                        {/* Option Circle key */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                          isSelected ? cTheme.optionCircleActive : cTheme.optionCircleInactive
                        }`}>
                          {opt.key}
                        </div>
                        
                        {/* Option text */}
                        <span className={`text-sm md:text-base font-semibold pt-0.5 leading-relaxed ${
                          isSelected 
                            ? cTheme.darkCanvas ? 'text-white' : cTheme.textAccent 
                            : cTheme.darkCanvas ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          {opt.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Stepper controls */}
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                id="btn-prev-question"
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
                className={`px-5 py-3 border ${cTheme.darkCanvas ? 'border-slate-800 text-slate-300 bg-slate-900 hover:bg-slate-800/60' : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'} font-bold rounded-xl transition-all active:scale-95 flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none`}
              >
                <ArrowLeft className="w-5 h-5" />
                Sebelumnya
              </button>

              <button
                type="button"
                id="btn-next-question"
                onClick={nextQuestion}
                className={`px-6 py-3 ${cTheme.bgPrimary} ${cTheme.bgPrimaryHover} text-white font-extrabold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2`}
              >
                {currentQuestionIndex === questions.length - 1 ? 'Tinjau Jawaban' : 'Berikutnya'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Question Navigator Grid */}
            <div className={`${cTheme.cardBg} rounded-xl border ${cTheme.border} p-5 shadow-sm space-y-3`}>
              <h5 className={`text-xs font-bold ${cTheme.textMuted} uppercase tracking-wider`}>
                Navigasi Soal
              </h5>
              <div className="flex flex-wrap gap-2" id="navigation-question-grid">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentQuestionIndex;
                  const isAnswered = answers[q.id] !== undefined;
                  
                  return (
                    <button
                      key={q.id}
                      id={`nav-q-${q.id}`}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`w-9 h-9 rounded-lg font-bold text-xs flex items-center justify-center border transition-all ${
                        isCurrent
                          ? `border-${theme === 'cosmic' ? 'violet' : 'teal'}-500 ${cTheme.bgPrimary} text-white ring-2 ring-${theme === 'cosmic' ? 'violet' : 'teal'}-500/20`
                          : isAnswered
                          ? cTheme.darkCanvas ? 'border-emerald-800 bg-emerald-950/40 text-emerald-300' : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          : cTheme.darkCanvas ? 'border-slate-800 bg-slate-800 text-slate-400 hover:bg-slate-750' : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {q.id}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: REVIEW / PRE-SUBMIT */}
        {step === 'review' && (
          <motion.div
            key="review-step"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className={`${cTheme.cardBg} rounded-2xl shadow-xl border ${cTheme.border} p-6 md:p-8 space-y-6`}
          >
            <div className="text-center space-y-2">
              <div className={`inline-flex p-3 ${cTheme.bgAccent} rounded-full ${cTheme.textAccent} border ${cTheme.borderAccent}`}>
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className={`text-2xl font-black ${cTheme.darkCanvas ? 'text-white' : 'text-slate-800'}`}>Tinjau Jawabanmu</h2>
              <p className={`${cTheme.textMuted} text-sm max-w-lg mx-auto`}>
                Pastikan seluruh pertanyaan telah dijawab dengan teliti sebelum mengirimkan jawaban akhir ke guru.
              </p>
            </div>

            {/* Answer completion progress status */}
            <div className={`p-4 rounded-xl border flex items-center gap-3.5 text-sm font-semibold ${
              totalAnswered === questions.length
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                : 'bg-amber-50 border-amber-100 text-amber-800'
            }`} id="completion-status-bar">
              {totalAnswered === questions.length ? (
                <>
                  <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
                  <span>Hebat! Kamu sudah menjawab semua <strong>{questions.length} dari {questions.length}</strong> pertanyaan.</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
                  <span>Perhatian! Ada <strong>{questions.length - totalAnswered}</strong> pertanyaan yang belum dijawab.</span>
                </>
              )}
            </div>

            {/* Table or list grid of all questions showing selected choice */}
            <div className={`border ${cTheme.border} rounded-xl overflow-hidden shadow-inner ${cTheme.darkCanvas ? 'bg-slate-950' : 'bg-slate-50'}`}>
              <div className="max-h-72 overflow-y-auto p-4 space-y-2">
                {questions.map((q) => {
                  const answeredKey = answers[q.id];
                  const hasAnswered = answeredKey !== undefined;
                  return (
                    <div 
                      key={q.id}
                      className={`${cTheme.cardBg} p-3.5 rounded-lg border ${cTheme.darkCanvas ? 'border-slate-800 hover:border-slate-700' : 'border-slate-150 hover:border-slate-300'} flex items-center justify-between text-sm transition-colors`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded ${cTheme.darkCanvas ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'} font-extrabold flex items-center justify-center shrink-0 text-xs`}>
                          {q.id}
                        </span>
                        <p className={`font-bold ${cTheme.darkCanvas ? 'text-slate-300' : 'text-slate-700'} truncate max-w-xs md:max-w-md`}>
                          {q.question}
                        </p>
                      </div>
                      
                      {hasAnswered ? (
                        <span className={`px-3 py-1 ${cTheme.bgAccent} border ${cTheme.borderAccent} ${cTheme.textAccent} rounded-lg font-black text-xs flex items-center gap-1.5`}>
                          Pilihan {answeredKey}
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-50 border border-red-100 text-red-700 rounded-lg font-bold text-xs flex items-center gap-1.5">
                          Belum Dijawab
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {submitError && (
              <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl flex items-center gap-2 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Gagal mengirim: {submitError}. Silakan coba kirim ulang.</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                id="btn-back-to-quiz"
                onClick={() => {
                  setStep('quiz');
                  setCurrentQuestionIndex(questions.length - 1);
                }}
                className={`w-full sm:w-1/2 px-5 py-3.5 border ${cTheme.darkCanvas ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-850' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'} font-bold rounded-xl transition-all flex items-center justify-center gap-2`}
              >
                <ArrowLeft className="w-5 h-5" />
                Kembali ke Soal
              </button>

              <button
                type="button"
                id="btn-final-submit"
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className={`w-full sm:w-1/2 bg-gradient-to-r ${cTheme.gradientButton} text-white font-extrabold py-3.5 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Memproses & Menyimpan...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Kirim Jawaban Akhir
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: SUCCESS / COMPLETED */}
        {step === 'success' && lastSubmission && (
          <motion.div
            key="success-step"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className={`${cTheme.cardBg} rounded-2xl shadow-xl border ${cTheme.border} p-8 space-y-6 text-center`}
          >
            {/* Celebration Icon */}
            <div className="relative inline-flex mb-2">
              <div className="absolute inset-0 bg-emerald-100 rounded-full blur-xl opacity-75 scale-125 animate-ping"></div>
              <div className="p-4 bg-emerald-500 rounded-full text-white border-4 border-white shadow-lg relative z-10">
                <Sparkles className="w-10 h-10" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className={`text-3xl font-black ${cTheme.darkCanvas ? 'text-white' : 'text-slate-800'}`}>Selamat! Tes Selesai</h1>
              <p className={`${cTheme.textMuted} text-sm max-w-md mx-auto`}>
                Jawabanmu telah berhasil dikirim dan tersimpan dengan aman ke database nilai guru.
              </p>
            </div>

            {/* Submission card details */}
            <div className={`max-w-md mx-auto ${cTheme.darkCanvas ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-150'} rounded-2xl p-6 border space-y-4`}>
              <h3 className={`font-extrabold ${cTheme.darkCanvas ? 'text-slate-200 border-slate-800' : 'text-slate-700 border-slate-200'} border-b pb-2.5 text-sm flex items-center justify-center gap-1.5`}>
                <ClipboardList className={`w-4 h-4 ${cTheme.textMuted}`} />
                Hasil Pengerjaan {lastSubmission.tipeTes === 'Pretest' ? 'Pre-tes' : 'Post-tes'}
              </h3>
              
              <div className={`grid grid-cols-2 gap-y-3.5 gap-x-2 text-xs font-semibold ${cTheme.textMuted} text-left`}>
                <div>Nama:</div>
                <div className={`text-right ${cTheme.darkCanvas ? 'text-slate-200' : 'text-slate-800'} truncate font-bold`}>{lastSubmission.nama}</div>
                
                <div>Sekolah:</div>
                <div className={`text-right ${cTheme.darkCanvas ? 'text-slate-200' : 'text-slate-800'} truncate font-bold`}>{lastSubmission.sekolah}</div>
                
                <div>Kelas:</div>
                <div className={`text-right ${cTheme.darkCanvas ? 'text-slate-200' : 'text-slate-800'} font-bold`}>{lastSubmission.kelas}</div>
                
                <div>Tanggal Submit:</div>
                <div className={`text-right ${cTheme.darkCanvas ? 'text-slate-200' : 'text-slate-800'} font-bold`}>{lastSubmission.timestamp}</div>
              </div>

              {/* Score Showcase */}
              <div className={`mt-4 pt-4 border-t ${cTheme.darkCanvas ? 'border-slate-800' : 'border-slate-200'} grid grid-cols-2 gap-4`}>
                <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 text-center">
                  <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Benar</div>
                  <div className="text-xl font-black text-emerald-700 mt-1">
                    {lastSubmission.correctCount} / {lastSubmission.totalQuestions}
                  </div>
                </div>
                
                <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100 text-center">
                  <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Nilai Anda</div>
                  <div className="text-xl font-black text-indigo-700 mt-1">
                    {lastSubmission.score}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Feedback Card based on Score */}
            <div className={`max-w-md mx-auto ${cTheme.bgAccent}/40 p-4 border ${cTheme.borderAccent} rounded-xl text-left text-xs ${cTheme.textAccent} leading-relaxed`}>
              <p className={`font-bold ${cTheme.darkCanvas ? 'text-violet-300' : 'text-teal-900'} mb-1`}>Catatan Pemahaman Konsep:</p>
              {lastSubmission.score >= 80 ? (
                "Luar biasa! Pemahamanmu mengenai gerak dasar non-lokomotor (Keseimbangan, Membungkuk, Memutar, Mendorong/Menarik, Mengayun, dan Berayun) sudah sangat matang dan siap menjadi teladan bagi teman yang lain."
              ) : lastSubmission.score >= 60 ? (
                "Bagus sekali! Pemahamanmu mengenai gerak dasar non-lokomotor sudah cukup baik. Cobalah untuk terus mempraktikkan gerakan non-lokomotor ini agar lebih mahir di lapangan."
              ) : (
                "Tetap semangat belajar! Silakan baca dan pelajari lagi materi atau panduan gerakan non-lokomotor dari media board game \"Gerak Bugarku\" agar gerakan tubuhmu makin tepat dan bugar."
              )}
            </div>

            {/* Detailed Answer Review Button & List */}
            <div className="max-w-md mx-auto space-y-3">
              <button
                type="button"
                id="btn-toggle-review-detail"
                onClick={() => setShowDetailReview(!showDetailReview)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border ${
                  cTheme.darkCanvas 
                    ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-850' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                } font-bold text-xs transition-all`}
              >
                <span className="flex items-center gap-2">
                  <ClipboardList className="w-4.5 h-4.5 text-indigo-500" />
                  Tinjau Detail Hasil Tiap Soal
                </span>
                {showDetailReview ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              <AnimatePresence>
                {showDetailReview && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className={`grid grid-cols-1 gap-2.5 max-h-[300px] overflow-y-auto pr-1 text-left ${
                      cTheme.darkCanvas ? 'bg-slate-950 p-3 rounded-xl border border-slate-850' : 'bg-slate-50 p-3 rounded-xl border border-slate-150'
                    }`}>
                      {questions.map((q) => {
                        const studentAns = lastSubmission.answers[q.id];
                        const isCorrect = studentAns === q.correctAnswer;
                        
                        return (
                          <div
                            key={q.id}
                            className={`p-3 rounded-lg border text-[11px] leading-relaxed flex flex-col gap-1.5 transition-all ${
                              isCorrect
                                ? cTheme.darkCanvas
                                  ? 'bg-emerald-950/20 border-emerald-900/60 text-emerald-300'
                                  : 'bg-emerald-50 border-emerald-200 text-slate-850'
                                : cTheme.darkCanvas
                                  ? 'bg-rose-950/20 border-rose-900/60 text-rose-300'
                                  : 'bg-red-50 border-red-200 text-slate-850'
                            }`}
                          >
                            <div className="flex items-start gap-1.5">
                              {isCorrect ? (
                                <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-500 mt-0.5" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 shrink-0 text-rose-500 mt-0.5" />
                              )}
                              <div>
                                <span className="font-bold">Soal {q.id}:</span> {q.question}
                              </div>
                            </div>

                            <div className={`flex items-center gap-4 text-[10px] font-bold pt-1.5 border-t ${
                              isCorrect 
                                ? cTheme.darkCanvas ? 'border-emerald-900/30' : 'border-emerald-100'
                                : cTheme.darkCanvas ? 'border-rose-900/30' : 'border-red-100'
                            }`}>
                              <span>
                                Jawaban Anda: <strong className={isCorrect ? 'text-emerald-600' : 'text-rose-600'}>{studentAns || 'Kosong'}</strong>
                              </span>
                              <span>
                                Kunci: <strong className="text-indigo-600">{q.correctAnswer}</strong>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action options */}
            <div className="pt-4 max-w-sm mx-auto">
              <button
                type="button"
                id="btn-retry-quiz"
                onClick={handleResetQuiz}
                className={`w-full ${cTheme.darkCanvas ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-250'} font-extrabold py-3.5 px-6 rounded-xl border transition-all flex items-center justify-center gap-2`}
              >
                <RotateCcw className={`w-5 h-5 ${cTheme.textMuted}`} />
                Mulai Tes Baru / Ganti Pengguna
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

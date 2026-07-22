import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Lock, 
  Settings, 
  Database, 
  Download, 
  Trash2, 
  Key, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Copy, 
  Users, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  RefreshCw,
  LogOut,
  HelpCircle
} from 'lucide-react';
import { Submission, AdminSettings, AppTheme } from '../types';
import { questions } from '../questions';

const GOOGLE_APPS_SCRIPT_CODE = `function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Jika ada parameter data atau nama (berarti pengiriman kuis via GET)
  if (e && (e.parameter.action === "submit" || e.parameter.nama || e.parameter.data)) {
    var data = {};
    if (e.parameter.data) {
      try {
        data = JSON.parse(e.parameter.data);
      } catch(err) {
        data = e.parameter;
      }
    } else {
      data = e.parameter;
    }
    return handleDataSubmission(sheet, data);
  }
  
  // Default: Ambil seluruh data kuis untuk sinkronisasi di aplikasi Guru (GET tanpa parameter submit)
  var rows = sheet.getDataRange().getValues();
  var dataList = [];
  
  if (rows.length > 1) {
    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      var answers = {};
      
      // Ambil jawaban Soal 1 - 25 (mulai dari kolom ke-9 / indeks 8)
      for (var s = 1; s <= 25; s++) {
        var colIndex = 8 + s - 1; 
        if (colIndex < row.length) {
          answers[s] = row[colIndex] || "";
        }
      }
      
      var submission = {
        id: "sheet_" + i + "_" + (row[0] ? new Date(row[0]).getTime() : i),
        timestamp: row[0] ? String(row[0]) : "",
        nama: row[1] ? String(row[1]) : "",
        kelas: row[2] ? String(row[2]) : "",
        sekolah: row[3] ? String(row[3]) : "",
        tipeTes: row[4] ? String(row[4]) : "Pretest",
        correctCount: Number(row[5]) || 0,
        totalQuestions: Number(row[6]) || 0,
        score: Number(row[7]) || 0,
        answers: answers
      };
      
      dataList.push(submission);
    }
  }
  
  // Urutkan data terbaru di paling atas
  dataList.reverse();
  
  return ContentService.createTextOutput(JSON.stringify(dataList))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  return handleDataSubmission(sheet, data);
}

function handleDataSubmission(sheet, data) {
  // Jika spreadsheet masih kosong, buatkan baris header otomatis
  if (sheet.getLastRow() === 0) {
    var headers = ["Timestamp", "Nama", "Kelas", "Sekolah", "Tipe Tes", "Jumlah Benar", "Total Soal", "Nilai"];
    for (var i = 1; i <= 25; i++) {
      headers.push("Soal " + i);
    }
    sheet.appendRow(headers);
    
    // Memberikan gaya visual header yang rapi
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#0D9488"); // Warna Teal yang elegan
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");
    headerRange.setVerticalAlignment("middle");
    sheet.setRowHeight(1, 28);
  }
  
  var row = [
    data.timestamp || new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
    data.nama || "",
    data.kelas || "",
    data.sekolah || "",
    data.tipeTes || "Pretest",
    Number(data.correctCount) || 0,
    Number(data.totalQuestions) || 25,
    Number(data.score) || 0
  ];
  
  // Ambil jawaban kuis Soal 1 sampai 25
  for (var i = 1; i <= 25; i++) {
    row.push(data["Q" + i] || "");
  }
  
  sheet.appendRow(row);
  
  var lastRow = sheet.getLastRow();
  sheet.setRowHeight(lastRow, 22);
  
  // Format warna otomatis kolom jawaban Soal 1 s.d 25 (Kolom 9 sampai 33)
  for (var i = 1; i <= 25; i++) {
    var colIndex = 8 + i; 
    var cell = sheet.getRange(lastRow, colIndex);
    var answer = data["Q" + i];
    var isCorrect = data["Q" + i + "_isCorrect"];
    
    if (answer !== undefined && answer !== "") {
      if (isCorrect === true || isCorrect === "true" || isCorrect === 1) {
        cell.setBackground("#D4EDDA"); // Hijau untuk jawaban benar
        cell.setFontColor("#155724");
      } else {
        cell.setBackground("#F8D7DA"); // Merah untuk jawaban salah
        cell.setFontColor("#721C24");
      }
    } else {
      cell.setBackground("#E2E8F0"); // Abu-abu jika tidak diisi
    }
    cell.setHorizontalAlignment("center");
  }
  
  // Mengatur text alignment kolom pendukung
  sheet.getRange(lastRow, 1).setHorizontalAlignment("center");
  sheet.getRange(lastRow, 3).setHorizontalAlignment("center");
  sheet.getRange(lastRow, 5).setHorizontalAlignment("center");
  sheet.getRange(lastRow, 6).setHorizontalAlignment("center");
  sheet.getRange(lastRow, 7).setHorizontalAlignment("center");
  
  // Atur warna kolom Nilai secara dinamis
  var scoreCell = sheet.getRange(lastRow, 8);
  scoreCell.setHorizontalAlignment("center");
  scoreCell.setFontWeight("bold");
  var score = Number(data.score) || 0;
  
  if (score >= 80) {
    scoreCell.setBackground("#D1E7DD");
    scoreCell.setFontColor("#0F5132");
  } else if (score >= 60) {
    scoreCell.setBackground("#FFF3CD");
    scoreCell.setFontColor("#664D03");
  } else {
    scoreCell.setBackground("#F8D7DA");
    scoreCell.setFontColor("#842029");
  }
  
  return ContentService.createTextOutput(JSON.stringify({ "status": "success", "message": "Data berhasil disimpan!" }))
    .setMimeType(ContentService.MimeType.JSON);
}`;

interface AdminPanelProps {
  settings: AdminSettings;
  submissions: Submission[];
  onSaveSettings: (newSettings: AdminSettings) => void;
  onClearSubmissions: () => void;
  onDeleteSubmission: (id: string) => void;
  theme: AppTheme;
  onRefreshSubmissions?: () => void;
  isLoadingSubmissions?: boolean;
  syncError?: string | null;
}

export default function AdminPanel({
  settings,
  submissions,
  onSaveSettings,
  onClearSubmissions,
  onDeleteSubmission,
  theme,
  onRefreshSubmissions,
  isLoadingSubmissions = false,
  syncError = null
}: AdminPanelProps) {
  // Login State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active Tab: 'dashboard' | 'submissions' | 'sheets' | 'security'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'submissions' | 'sheets' | 'security'>('dashboard');

  // Search and Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Pretest' | 'Posttest'>('all');
  const [filterClass, setFilterClass] = useState<string>('all');
  
  // Expanded Submission Row ID
  const [expandedSubmissionId, setExpandedSubmissionId] = useState<string | null>(null);

  // Settings Forms
  const [sheetUrl, setSheetUrl] = useState(settings.googleSheetUrl);
  const [newAdminId, setNewAdminId] = useState(settings.adminId);
  const [newAdminPass, setNewAdminPass] = useState(settings.adminPass);
  const [confirmAdminPass, setConfirmAdminPass] = useState('');
  
  // Notifications
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [securitySuccessMsg, setSecuritySuccessMsg] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminId === settings.adminId && adminPass === settings.adminPass) {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('ID Admin atau Kata Sandi salah!');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setAdminId('');
    setAdminPass('');
  };

  // Handle Save Sheet Settings
  const handleSaveSheet = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      googleSheetUrl: sheetUrl.trim()
    });
    setSaveSuccessMsg('URL Web App Google Sheets berhasil diperbarui!');
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Handle Save Security Credentials
  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminId.trim() || !newAdminPass.trim()) {
      setSecuritySuccessMsg('ID Admin dan Kata Sandi tidak boleh kosong.');
      return;
    }
    if (newAdminPass !== confirmAdminPass) {
      setSecuritySuccessMsg('Sandi konfirmasi tidak cocok!');
      return;
    }
    onSaveSettings({
      ...settings,
      adminId: newAdminId.trim(),
      adminPass: newAdminPass.trim()
    });
    setSecuritySuccessMsg('Kredensial admin berhasil diperbarui!');
    setConfirmAdminPass('');
    setTimeout(() => setSecuritySuccessMsg(null), 4000);
  };

  // Copy Google Apps Script to clipboard
  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  // Export Submissions to CSV format
  const handleExportCSV = () => {
    if (submissions.length === 0) return;
    
    // Header Row
    let csvContent = 'data:text/csv;charset=utf-8,';
    const headers = ["Timestamp", "Nama", "Kelas", "Sekolah", "Jenis Tes", "Jumlah Benar", "Total Soal", "Nilai"];
    for (let i = 1; i <= 25; i++) {
      headers.push(`Soal ${i}`);
    }
    csvContent += headers.join(',') + '\n';
    
    // Data Rows
    submissions.forEach(sub => {
      const row = [
        `"${sub.timestamp}"`,
        `"${sub.nama.replace(/"/g, '""')}"`,
        `"${sub.kelas}"`,
        `"${sub.sekolah.replace(/"/g, '""')}"`,
        `"${sub.tipeTes}"`,
        sub.correctCount,
        sub.totalQuestions,
        sub.score
      ];
      
      for (let i = 1; i <= 25; i++) {
        row.push(`"${sub.answers[i] || ''}"`);
      }
      
      csvContent += row.join(',') + '\n';
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Data_Nilai_Tes_Non_Lokomotor_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- ANALYTICS CALCULATIONS ---
  const stats = useMemo(() => {
    const total = submissions.length;
    const pretests = submissions.filter(s => s.tipeTes === 'Pretest');
    const posttests = submissions.filter(s => s.tipeTes === 'Posttest');
    
    const avgPretest = pretests.length > 0 
      ? Math.round(pretests.reduce((acc, curr) => acc + curr.score, 0) / pretests.length)
      : 0;

    const avgPosttest = posttests.length > 0
      ? Math.round(posttests.reduce((acc, curr) => acc + curr.score, 0) / posttests.length)
      : 0;

    // Class wise performance count and averages
    const classes = ['Kelas IV A', 'Kelas IV B', 'Kelas IV C', 'Kelas IV D'];
    const classPerformance = classes.map(cls => {
      const clsSubs = submissions.filter(s => s.kelas === cls);
      const pre = clsSubs.filter(s => s.tipeTes === 'Pretest');
      const post = clsSubs.filter(s => s.tipeTes === 'Posttest');
      
      const preAvg = pre.length > 0 ? Math.round(pre.reduce((a, c) => a + c.score, 0) / pre.length) : 0;
      const postAvg = post.length > 0 ? Math.round(post.reduce((a, c) => a + c.score, 0) / post.length) : 0;
      
      return {
        name: cls,
        count: clsSubs.length,
        preAvg,
        postAvg
      };
    });

    // Hardest questions analysis
    // For each of 25 questions, calculate how many got it right / total who answered.
    const questionStats = questions.map(q => {
      let correctCount = 0;
      let totalAnswered = 0;
      
      submissions.forEach(sub => {
        if (sub.answers[q.id]) {
          totalAnswered++;
          if (sub.answers[q.id] === q.correctAnswer) {
            correctCount++;
          }
        }
      });
      
      const percentCorrect = totalAnswered > 0 
        ? Math.round((correctCount / totalAnswered) * 100) 
        : 100; // default to 100% if no data yet

      return {
        id: q.id,
        questionText: q.question,
        percentCorrect,
        correctCount,
        totalAnswered
      };
    });

    // Sort to get top 3 hardest (lowest correct percentage)
    const hardestQuestions = [...questionStats]
      .filter(q => q.totalAnswered > 0)
      .sort((a, b) => a.percentCorrect - b.percentCorrect)
      .slice(0, 3);

    const getMasteryCounts = (subsList: Submission[]) => {
      let sangatBaik = 0; // 81-100
      let baik = 0;       // 61-80
      let cukup = 0;      // 41-60
      let kurang = 0;     // 0-40
      
      subsList.forEach(s => {
        if (s.score >= 81) sangatBaik++;
        else if (s.score >= 61) baik++;
        else if (s.score >= 41) cukup++;
        else kurang++;
      });
      
      return { sangatBaik, baik, cukup, kurang };
    };

    const preMastery = getMasteryCounts(pretests);
    const postMastery = getMasteryCounts(posttests);

    return {
      total,
      pretestCount: pretests.length,
      posttestCount: posttests.length,
      avgPretest,
      avgPosttest,
      classPerformance,
      hardestQuestions,
      preMastery,
      postMastery
    };
  }, [submissions]);

  // --- FILTERED SUBMISSIONS ---
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      const matchesSearch = sub.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            sub.sekolah.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || sub.tipeTes === filterType;
      const matchesClass = filterClass === 'all' || sub.kelas === filterClass;
      return matchesSearch && matchesType && matchesClass;
    }).sort((a, b) => b.id.localeCompare(a.id)); // Newest first
  }, [submissions, searchTerm, filterType, filterClass]);

  // --- RENDERING ---

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-16" id="admin-login-section">
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
        >
          <div className="bg-slate-900 p-6 text-center text-white space-y-1">
            <div className="inline-flex p-3 bg-white/5 rounded-xl mb-2">
              <Lock className="w-6 h-6 text-teal-400" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">Panel Kontrol Admin</h2>
            <p className="text-slate-400 text-xs">Aplikasi Pre-tes & Post-tes Non-Lokomotor</p>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            {loginError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-2 border border-red-100">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="admin-id" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID Admin</label>
              <input
                id="admin-id"
                type="text"
                required
                placeholder="Masukkan ID Admin"
                value={adminId}
                onChange={e => setAdminId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 text-sm font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="admin-pass" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kata Sandi</label>
              <input
                id="admin-pass"
                type="password"
                required
                placeholder="Masukkan Sandi Admin"
                value={adminPass}
                onChange={e => setAdminPass(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 text-sm font-semibold"
              />
            </div>

            <button
              type="submit"
              id="admin-login-submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3 px-4 rounded-xl transition-all shadow-md shadow-teal-600/10 active:scale-95 text-sm"
            >
              Masuk Panel Admin
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-6" id="admin-dashboard-container">
      {/* Admin Top Menu Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 md:p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-600/20 text-teal-400 rounded-xl border border-teal-500/20">
            <Settings className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-extrabold tracking-tight">DASBOR PENDIDIK & PANEL ADMIN</h1>
            <p className="text-slate-400 text-xs">Pantau hasil pre-test/post-test pemahaman gerak siswa.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            id="admin-btn-logout"
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            Keluar Panel
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200" id="admin-tabs-nav">
        {[
          { key: 'dashboard', label: 'Dashboard & Statistik', icon: BarChart3 },
          { key: 'submissions', label: `Daftar Nilai (${submissions.length})`, icon: Database },
          { key: 'sheets', label: 'Integrasi Google Sheet', icon: RefreshCw },
          { key: 'security', label: 'Pengaturan Akun', icon: Key }
        ].map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              id={`admin-tab-btn-${tab.key}`}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-5 py-3 font-bold text-xs md:text-sm border-b-2 transition-all shrink-0 ${
                isActive
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'
              }`}
            >
              <IconComponent className="w-4.5 h-4.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENTS */}
      <div className="min-h-[400px]">
        {/* TAB 1: DASHBOARD & STATS */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6" id="dashboard-tab-content">
            {/* Top Cards Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Submissions */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Responden</span>
                  <div className="text-3xl font-black text-slate-800 mt-1">{stats.total}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {stats.pretestCount} Pre-tes | {stats.posttestCount} Post-tes
                  </div>
                </div>
                <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              {/* Avg Pretest Score */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Rata-Rata Pre-Tes</span>
                  <div className="text-3xl font-black text-amber-600 mt-1">{stats.avgPretest}</div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-500" /> Skor dasar pemahaman
                  </div>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <BarChart3 className="w-6 h-6" />
                </div>
              </div>

              {/* Avg Posttest Score */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Rata-Rata Post-Tes</span>
                  <div className="text-3xl font-black text-indigo-600 mt-1">{stats.avgPosttest}</div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-500" /> Keefektifan media Gerak Bugarku
                  </div>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              {/* Progress Gain */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Peningkatan (Gain)</span>
                  <div className="text-3xl font-black text-emerald-600 mt-1">
                    {stats.avgPosttest > stats.avgPretest ? `+${stats.avgPosttest - stats.avgPretest}` : '0'}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Selisih skor rata-rata tes
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Visualisasi Data Section */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-6" id="dashboard-visualizations">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                    <BarChart3 className="w-5 h-5 text-teal-600" />
                    Visualisasi Analisis Nilai Siswa
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">Analisis grafis perbandingan pre-tes vs. post-tes dan tingkat pemahaman.</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-250">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    Pre-tes
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-250">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                    Post-tes
                  </span>
                </div>
              </div>

              {submissions.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-3">
                  <BarChart3 className="w-12 h-12 text-slate-300" />
                  <p className="font-bold">Belum ada data pengerjaan</p>
                  <p className="text-xs text-slate-400 max-w-xs">Data grafik akan muncul secara otomatis setelah siswa menyelesaikan pre-tes atau post-tes.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Grafik 1: Perbandingan Nilai Rata-rata Pre vs Post */}
                  <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-150 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wide">Rerata Nilai Ujian (Pre vs Post)</h4>
                      <span className="text-[10px] font-extrabold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded shadow-sm">
                        {stats.avgPosttest > stats.avgPretest ? `Naik ${stats.avgPosttest - stats.avgPretest} Poin` : 'Sama'}
                      </span>
                    </div>
                    
                    <div className="h-44 flex items-end justify-around pb-2 border-b border-slate-200 pt-4 relative">
                      {/* Grid Lines */}
                      <div className="absolute left-0 right-0 top-1/4 border-t border-slate-200/50 pointer-events-none"></div>
                      <div className="absolute left-0 right-0 top-2/4 border-t border-slate-200/50 pointer-events-none"></div>
                      <div className="absolute left-0 right-0 top-3/4 border-t border-slate-200/50 pointer-events-none"></div>
                      
                      {/* Pretest Bar */}
                      <div className="flex flex-col items-center gap-2 group cursor-pointer z-10 w-20">
                        <div className="text-xs font-black text-amber-600 transition-transform group-hover:scale-110">
                          {stats.avgPretest}
                        </div>
                        <div 
                          className="w-12 bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-lg shadow-md transition-all duration-300 hover:brightness-105 hover:shadow-lg origin-bottom transform-gpu"
                          style={{ height: `${Math.max(stats.avgPretest, 4) * 1.2}px` }}
                        ></div>
                        <span className="text-[10px] font-bold text-slate-500">Pre-tes</span>
                      </div>

                      {/* Posttest Bar */}
                      <div className="flex flex-col items-center gap-2 group cursor-pointer z-10 w-20">
                        <div className="text-xs font-black text-indigo-600 transition-transform group-hover:scale-110">
                          {stats.avgPosttest}
                        </div>
                        <div 
                          className="w-12 bg-gradient-to-t from-indigo-600 to-indigo-500 rounded-t-lg shadow-md transition-all duration-300 hover:brightness-105 hover:shadow-lg origin-bottom transform-gpu"
                          style={{ height: `${Math.max(stats.avgPosttest, 4) * 1.2}px` }}
                        ></div>
                        <span className="text-[10px] font-bold text-slate-500">Post-tes</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium text-center italic">Grafik memvisualisasikan lompatan pemahaman gerak siswa secara akumulatif.</p>
                  </div>

                  {/* Grafik 2: Pergeseran Kategori Pemahaman */}
                  <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-150 space-y-4 shadow-sm">
                    <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wide">Pergeseran Kategori Pemahaman</h4>
                    
                    <div className="space-y-3 pt-1">
                      {[
                        { 
                          label: 'Sangat Baik (81-100)', 
                          preVal: stats.preMastery.sangatBaik, 
                          postVal: stats.postMastery.sangatBaik,
                          color: 'bg-emerald-500' 
                        },
                        { 
                          label: 'Baik (61-80)', 
                          preVal: stats.preMastery.baik, 
                          postVal: stats.postMastery.baik,
                          color: 'bg-teal-500' 
                        },
                        { 
                          label: 'Cukup (41-60)', 
                          preVal: stats.preMastery.cukup, 
                          postVal: stats.postMastery.cukup,
                          color: 'bg-amber-500' 
                        },
                        { 
                          label: 'Kurang (0-40)', 
                          preVal: stats.preMastery.kurang, 
                          postVal: stats.postMastery.kurang,
                          color: 'bg-rose-500' 
                        }
                      ].map((item, idx) => {
                        const totalPre = stats.pretestCount || 1;
                        const totalPost = stats.posttestCount || 1;
                        
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-slate-600">
                              <span>{item.label}</span>
                              <span className="text-[10px] font-semibold text-slate-500">
                                {item.preVal} siswa ({Math.round((item.preVal / totalPre) * 100)}%) &rarr; {item.postVal} siswa ({Math.round((item.postVal / totalPost) * 100)}%)
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              {/* Pre bar */}
                              <div className="h-2.5 bg-slate-200/60 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full bg-slate-400/80 transition-all duration-500 rounded-full`}
                                  style={{ width: `${totalPre > 0 ? (item.preVal / totalPre) * 100 : 0}%` }}
                                ></div>
                              </div>
                              {/* Post bar */}
                              <div className="h-2.5 bg-slate-200/60 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${item.color} transition-all duration-500 rounded-full`}
                                  style={{ width: `${totalPost > 0 ? (item.postVal / totalPost) * 100 : 0}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 pt-1">
                      <span>Kiri: Distribusi Pre-tes</span>
                      <span>Kanan: Distribusi Post-tes</span>
                    </div>
                  </div>

                  {/* Grafik 3: Performa Rata-Rata Per Kelas */}
                  <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-150 space-y-4 md:col-span-2 shadow-sm">
                    <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wide">Analisis Komparatif Nilai Per Kelas</h4>
                    
                    {/* SVG Bar Chart */}
                    <div className="w-full overflow-x-auto">
                      <svg viewBox="0 0 500 180" className="w-full min-w-[450px] h-44 overflow-visible">
                        {/* Grid lines */}
                        <line x1="50" y1="30" x2="480" y2="30" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3" />
                        <line x1="50" y1="70" x2="480" y2="70" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3" />
                        <line x1="50" y1="110" x2="480" y2="110" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3" />
                        <line x1="50" y1="150" x2="480" y2="150" stroke="#CBD5E1" strokeWidth="1.5" />
                        
                        {/* Y Axis labels */}
                        <text x="40" y="34" className="text-[9px] font-bold fill-slate-400" textAnchor="end">100</text>
                        <text x="40" y="74" className="text-[9px] font-bold fill-slate-400" textAnchor="end">60</text>
                        <text x="40" y="114" className="text-[9px] font-bold fill-slate-400" textAnchor="end">30</text>
                        <text x="40" y="154" className="text-[9px] font-bold fill-slate-400" textAnchor="end">0</text>
                        
                        {stats.classPerformance.map((cls, idx) => {
                          const xOffset = 80 + idx * 105;
                          // pre-test calculations
                          const preScore = cls.preAvg || 0;
                          const preHeight = (preScore / 100) * 120; // max height is 120
                          const preY = 150 - preHeight;
                          
                          // post-test calculations
                          const postScore = cls.postAvg || 0;
                          const postHeight = (postScore / 100) * 120;
                          const postY = 150 - postHeight;
                          
                          return (
                            <g key={cls.name} className="group">
                              {/* Background highlight hover */}
                              <rect x={xOffset - 15} y="15" width="80" height="145" fill="rgba(20, 184, 166, 0.03)" rx="6" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                              
                              {/* Pretest Bar */}
                              <rect 
                                x={xOffset} 
                                y={preY} 
                                width="22" 
                                height={Math.max(preHeight, 2)} 
                                fill="url(#amberGradient)" 
                                rx="4"
                                className="transition-all duration-300 hover:brightness-105 origin-bottom transform-gpu"
                              />
                              <text x={xOffset + 11} y={preY - 5} className="text-[9px] font-extrabold fill-amber-600 text-center" textAnchor="middle">
                                {preScore || '-'}
                              </text>
                              
                              {/* Posttest Bar */}
                              <rect 
                                x={xOffset + 26} 
                                y={postY} 
                                width="22" 
                                height={Math.max(postHeight, 2)} 
                                fill="url(#indigoGradient)" 
                                rx="4"
                                className="transition-all duration-300 hover:brightness-105 origin-bottom transform-gpu"
                              />
                              <text x={xOffset + 37} y={postY - 5} className="text-[9px] font-extrabold fill-indigo-600 text-center" textAnchor="middle">
                                {postScore || '-'}
                              </text>
                              
                              {/* Axis Label */}
                              <text x={xOffset + 24} y="168" className="text-[10px] font-bold fill-slate-600 text-center" textAnchor="middle">
                                {cls.name.replace('Kelas IV ', 'Kelas ')}
                              </text>
                            </g>
                          );
                        })}

                        {/* Define gradients */}
                        <defs>
                          <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#F59E0B" />
                            <stop offset="100%" stopColor="#D97706" />
                          </linearGradient>
                          <linearGradient id="indigoGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366F1" />
                            <stop offset="100%" stopColor="#4F46E5" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Middle Section: Class list + Hardest Questions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Class Performance Table */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Distribusi Nilai Berdasarkan Kelas</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Rata-rata perbandingan pre-tes dan post-tes tiap kelas.</p>
                </div>
                
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold">
                      <tr>
                        <th className="p-3">Nama Kelas</th>
                        <th className="p-3 text-center">Responden</th>
                        <th className="p-3 text-center text-amber-700">Rerata Pre</th>
                        <th className="p-3 text-center text-indigo-700">Rerata Post</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {stats.classPerformance.map((cls) => (
                        <tr key={cls.name} className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold">{cls.name}</td>
                          <td className="p-3 text-center">{cls.count} anak</td>
                          <td className="p-3 text-center text-amber-600 font-extrabold">{cls.preAvg || '-'}</td>
                          <td className="p-3 text-center text-indigo-600 font-extrabold">{cls.postAvg || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Hardest questions block */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5 text-red-700">
                    <TrendingDown className="w-5 h-5 shrink-0" />
                    Top 3 Soal Paling Sulit Bagi Siswa
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">Menganalisis soal dengan persentase jawaban benar terendah.</p>
                </div>

                <div className="space-y-3.5">
                  {stats.hardestQuestions.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-250">
                      Belum ada data pengerjaan untuk dianalisis.
                    </div>
                  ) : (
                    stats.hardestQuestions.map((hq, idx) => (
                      <div key={hq.id} className="bg-red-50/40 p-3.5 rounded-xl border border-red-100/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                            Tingkat Kesulitan: Tinggi
                          </span>
                          <span className="text-xs font-bold text-red-600">
                            Hanya {hq.percentCorrect}% Benar
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 leading-relaxed">
                          Soal {hq.id}: {hq.questionText}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Quick backup instruction */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-700 text-sm flex items-center gap-1.5">
                  <Download className="w-4.5 h-4.5 text-slate-500" />
                  Ekspor File Cadangan Lokal
                </h4>
                <p className="text-xs text-slate-500">
                  Unduh seluruh daftar rekapitulasi nilai siswa dalam format file CSV lokal yang dapat langsung dibuka menggunakan Excel atau Calc.
                </p>
              </div>

              <button
                type="button"
                id="btn-csv-download-backup"
                onClick={handleExportCSV}
                disabled={submissions.length === 0}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Unduh Rekap CSV ({submissions.length})
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: LIST SUBMISSIONS */}
        {activeTab === 'submissions' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-5" id="submissions-tab-content">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">Daftar Nilai Hasil Ujian</h3>
                <p className="text-slate-500 text-xs mt-0.5">Gunakan filter di bawah untuk memilah data secara spesifik.</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  id="btn-delete-all-submissions"
                  onClick={() => {
                    if (confirm("Apakah Anda yakin ingin menghapus SELURUH data hasil tes siswa secara permanen? Tindakan ini tidak bisa dibatalkan.")) {
                      onClearSubmissions();
                    }
                  }}
                  disabled={submissions.length === 0}
                  className="px-3.5 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold rounded-xl border border-red-200 transition-all flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus Semua Data
                </button>
              </div>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-150">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Cari nama atau sekolah..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* Tipe Tes Filter */}
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value as any)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="all">Semua Tipe Tes (Pretest & Posttest)</option>
                <option value="Pretest">Pre-tes Saja</option>
                <option value="Posttest">Post-tes Saja</option>
              </select>

              {/* Kelas Filter */}
              <select
                value={filterClass}
                onChange={e => setFilterClass(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="all">Semua Kelas</option>
                <option value="Kelas IV A">Kelas IV A</option>
                <option value="Kelas IV B">Kelas IV B</option>
                <option value="Kelas IV C">Kelas IV C</option>
                <option value="Kelas IV D">Kelas IV D</option>
                <option value="Lainnya">Lainnya / Modifikasi</option>
              </select>
            </div>

            {/* Table */}
            <div className="border border-slate-100 rounded-xl overflow-x-auto shadow-sm">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-100">
                  <tr>
                    <th className="p-3 w-10"></th>
                    <th className="p-3">Waktu Input</th>
                    <th className="p-3">Nama Lengkap</th>
                    <th className="p-3">Kelas</th>
                    <th className="p-3">Sekolah</th>
                    <th className="p-3">Jenis Tes</th>
                    <th className="p-3 text-center">Benar</th>
                    <th className="p-3 text-center">Nilai</th>
                    <th className="p-3 text-center w-12">Hapus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400 text-xs">
                        Tidak ditemukan data pengisian siswa yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((sub) => {
                      const isExpanded = expandedSubmissionId === sub.id;
                      return (
                        <React.Fragment key={sub.id}>
                          <tr className={`hover:bg-slate-50/80 cursor-pointer ${isExpanded ? 'bg-teal-50/20' : ''}`}>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => setExpandedSubmissionId(isExpanded ? null : sub.id)}
                                className="p-1 hover:bg-slate-100 rounded transition-colors text-slate-400"
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </td>
                            <td className="p-3 text-slate-500 font-normal">{sub.timestamp}</td>
                            <td className="p-3 font-bold text-slate-900">{sub.nama}</td>
                            <td className="p-3 text-slate-600">{sub.kelas}</td>
                            <td className="p-3 text-slate-600 truncate max-w-xs">{sub.sekolah}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                sub.tipeTes === 'Pretest' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                              }`}>
                                {sub.tipeTes}
                              </span>
                            </td>
                            <td className="p-3 text-center font-bold">{sub.correctCount} / {sub.totalQuestions}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-1 rounded text-xs font-black ${
                                sub.score >= 80 ? 'bg-emerald-100 text-emerald-800' : sub.score >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {sub.score}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <button
                                id={`delete-sub-btn-${sub.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Hapus data nilai milik "${sub.nama}"?`)) {
                                    onDeleteSubmission(sub.id);
                                  }
                                }}
                                className="p-1 hover:bg-red-50 text-red-500 hover:text-red-700 rounded transition-colors"
                                title="Hapus baris data"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>

                          {/* Expanded Detail Row */}
                          {isExpanded && (
                            <tr>
                              <td colSpan={9} className="bg-slate-50/50 p-5 border-l-4 border-teal-500">
                                <div className="space-y-4">
                                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                                    <Info className="w-4 h-4 text-teal-600" />
                                    Analisis Jawaban Lembar Jawaban Siswa ({sub.nama})
                                  </h4>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {questions.map((q) => {
                                      const studentAns = sub.answers[q.id];
                                      const isCorrect = studentAns === q.correctAnswer;
                                      
                                      return (
                                        <div 
                                          key={q.id}
                                          className={`p-3 rounded-lg border text-[11px] leading-relaxed flex flex-col justify-between ${
                                            isCorrect 
                                              ? 'bg-emerald-50/40 border-emerald-100 text-slate-800' 
                                              : 'bg-red-50/40 border-red-100 text-slate-800'
                                          }`}
                                        >
                                          <div>
                                            <span className="font-black">Soal {q.id}:</span> {q.question}
                                          </div>
                                          
                                          <div className="mt-2.5 pt-2 border-t border-slate-150 flex items-center justify-between text-[10px] font-bold">
                                            <span>
                                              Jawaban Siswa: <strong className={isCorrect ? 'text-emerald-700' : 'text-red-700'}>{studentAns || 'Kosong'}</strong>
                                            </span>
                                            <span>
                                              Kunci: <strong className="text-teal-700">{q.correctAnswer}</strong>
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: GOOGLE SHEETS SETUP */}
        {activeTab === 'sheets' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6" id="sheets-tab-content">
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <h3 className="font-extrabold text-slate-800 text-base">Sinkronisasi Ke Google Sheets</h3>
              <p className="text-slate-500 text-xs">
                Hubungkan aplikasi kuis ini ke Google Sheets pribadi Anda sehingga setiap kali siswa menekan tombol kirim, data pengerjaannya akan otomatis terinput sebagai baris baru di Spreadsheet Anda!
              </p>
            </div>

            {/* Config Form */}
            <form onSubmit={handleSaveSheet} className="space-y-4">
              {saveSuccessMsg && (
                <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl flex items-center gap-2 border border-emerald-100 text-xs font-semibold">
                  <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="sheets-web-app-url" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  URL Web App Google Apps Script
                </label>
                <input
                  id="sheets-web-app-url"
                  type="url"
                  placeholder="Contoh: https://script.google.com/macros/s/AKfycb.../exec"
                  value={sheetUrl}
                  onChange={e => setSheetUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 text-sm font-semibold"
                />
                <p className="text-[10px] text-slate-400 font-normal">
                  Kosongkan kolom ini jika Anda hanya ingin menyimpan data rekapitulasi nilai secara lokal di browser komputer ini.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  id="btn-save-sheet-url"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs transition-all flex items-center gap-1.5"
                >
                  Simpan Konfigurasi Sheet
                </button>
              </div>
            </form>

            {/* Sync and Share Section */}
            {settings.googleSheetUrl && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-5 border-t border-slate-150" id="sync-share-section">
                {/* 1. Sync Control */}
                <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-200/60 flex flex-col justify-between" id="sync-panel">
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                      <RefreshCw className={`w-4 h-4 text-teal-600 ${isLoadingSubmissions ? 'animate-spin' : ''}`} />
                      Sinkronkan Data Manual
                    </h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Ambil data hasil pengerjaan siswa terbaru yang ada di Google Sheets Anda secara real-time ke aplikasi ini.
                    </p>
                    
                    {syncError && (
                      <div className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl text-[10px] font-semibold flex items-center gap-1.5 mt-2">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{syncError}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={onRefreshSubmissions}
                      disabled={isLoadingSubmissions}
                      className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-55"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSubmissions ? 'animate-spin' : ''}`} />
                      {isLoadingSubmissions ? 'Sedang Menyinkronkan...' : 'Sinkronkan Sekarang'}
                    </button>
                  </div>
                </div>

                {/* 2. Share / Multi-Device Access */}
                <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-200/60 flex flex-col justify-between" id="share-panel">
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-teal-600" />
                      Akses Multi-Device (Sinkronisasi HP/Laptop)
                    </h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Bagikan atau buka link ini di perangkat lain (laptop lain, HP, atau komputer sekolah) agar data & pengaturan Google Sheet ini otomatis tersambung di sana.
                    </p>
                  </div>

                  <div className="space-y-2 pt-4">
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}${window.location.pathname}?sheetUrl=${encodeURIComponent(settings.googleSheetUrl)}&adminId=${encodeURIComponent(settings.adminId)}&adminPass=${encodeURIComponent(settings.adminPass)}&theme=${theme}`}
                        className="flex-grow px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-mono text-slate-500 select-all focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const url = `${window.location.origin}${window.location.pathname}?sheetUrl=${encodeURIComponent(settings.googleSheetUrl)}&adminId=${encodeURIComponent(settings.adminId)}&adminPass=${encodeURIComponent(settings.adminPass)}&theme=${theme}`;
                          navigator.clipboard.writeText(url);
                          setIsLinkCopied(true);
                          setTimeout(() => setIsLinkCopied(false), 3000);
                        }}
                        className="px-3 py-1.5 bg-slate-850 hover:bg-slate-700 text-white font-bold rounded-lg text-[10px] whitespace-nowrap transition-all"
                      >
                        {isLinkCopied ? 'Tersalin!' : 'Salin Link'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Instruction Guide */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60 space-y-5">
              <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm border-b border-slate-250 pb-3">
                <HelpCircle className="w-5 h-5 text-teal-600" />
                <span>Panduan 1 Menit Menghubungkan Google Sheet Anda:</span>
              </div>

              <div className="text-xs space-y-4 leading-relaxed text-slate-600">
                <div className="space-y-1">
                  <span className="font-bold text-slate-800">Langkah 1:</span>
                  <p>Buat Google Sheet baru di Google Drive Anda. Kosongkan seluruhnya (boleh diberi judul, misal: "Hasil Tes Non-Lokomotor").</p>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-800">Langkah 2:</span>
                  <p>Di bagian menu atas Google Sheet Anda, klik menu <strong>Extensions (Ekstensi)</strong> kemudian pilih <strong>Apps Script</strong>.</p>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-slate-800">Langkah 3:</span>
                  <p>Hapus semua kode bawaan yang ada di editor Apps Script, lalu salin (copy) dan tempel (paste) kode di bawah ini:</p>
                  
                  {/* Copyable script panel */}
                  <div className="bg-slate-900 rounded-xl p-4 text-slate-300 font-mono text-[10px] overflow-x-auto relative">
                    <button
                      type="button"
                      onClick={handleCopyScript}
                      className="absolute top-2.5 right-2.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
                    >
                      {isCopied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {isCopied ? 'Tersalin' : 'Salin Kode'}
                    </button>
                    <pre className="mt-2 text-emerald-400 leading-normal">
{GOOGLE_APPS_SCRIPT_CODE}
                    </pre>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-800">Langkah 4:</span>
                  <p>Klik tombol ikon disket di Apps Script untuk <strong>Simpan Projek (Save)</strong>.</p>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-800">Langkah 5:</span>
                  <p>Klik tombol <strong>Deploy (Terapkan)</strong> di kanan atas, pilih <strong>New Deployment (Terapkan Baru)</strong>.</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Ikon gerigi: Pilih jenis <strong>Web App (Aplikasi Web)</strong>.</li>
                    <li>Execute as (Jalankan sebagai): Pilih <strong>Me (Saya - Email Anda)</strong>.</li>
                    <li>Who has access (Siapa yang memiliki akses): Pilih <strong>Anyone (Siapa saja)</strong>.</li>
                  </ul>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-800">Langkah 6:</span>
                  <p>Klik <strong>Deploy</strong>, lakukan otorisasi akun Google Anda jika diminta (pilih Advanced -&gt; Go to Untitled project). Setelah selesai, Anda akan mendapatkan <strong>URL Aplikasi Web (Web App URL)</strong>. Salin URL tersebut dan tempel ke kolom di atas!</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SECURITY & CREDENTIALS */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-xl mx-auto space-y-5" id="security-tab-content">
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                <Key className="w-5 h-5 text-teal-600" />
                Ganti Kredensial Akses Admin
              </h3>
              <p className="text-slate-500 text-xs">
                Perbarui ID Admin dan Kata Sandi untuk mencegah akses masuk dari pihak luar yang tidak berkepentingan.
              </p>
            </div>

            {securitySuccessMsg && (
              <div className="p-3 bg-teal-50 text-teal-700 border border-teal-100 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{securitySuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveSecurity} className="space-y-4">
              {/* ID Admin */}
              <div className="space-y-1">
                <label htmlFor="new-admin-id" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID Admin Baru</label>
                <input
                  id="new-admin-id"
                  type="text"
                  required
                  placeholder="ID Admin"
                  value={newAdminId}
                  onChange={e => setNewAdminId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs font-bold"
                />
              </div>

              {/* Sandi Baru */}
              <div className="space-y-1">
                <label htmlFor="new-admin-pass" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kata Sandi Baru</label>
                <input
                  id="new-admin-pass"
                  type="password"
                  required
                  placeholder="Kata Sandi Baru"
                  value={newAdminPass}
                  onChange={e => setNewAdminPass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs font-bold"
                />
              </div>

              {/* Konfirmasi Sandi */}
              <div className="space-y-1">
                <label htmlFor="confirm-admin-pass" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Konfirmasi Sandi Baru</label>
                <input
                  id="confirm-admin-pass"
                  type="password"
                  required
                  placeholder="Ketik ulang Sandi Baru"
                  value={confirmAdminPass}
                  onChange={e => setConfirmAdminPass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs font-bold"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  id="btn-save-admin-security"
                  className="px-5 py-2.5 bg-slate-850 hover:bg-slate-700 text-white font-extrabold rounded-xl text-xs transition-all"
                >
                  Perbarui Sandi Admin
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

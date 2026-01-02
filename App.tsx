import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Chat from './pages/Chat';
import GradeExercises from './pages/GradeExercises';
import Profile from './pages/Profile';
import About from './pages/About';
import { getUserProfile, subscribeToUserUpdates } from './services/userService';

// --- SETTINGS MODAL COMPONENT ---
interface SettingsModalProps {
  onClose: () => void;
  isOpen: boolean;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, isOpen }) => {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3-flash-preview');

  useEffect(() => {
    if (isOpen) {
      setApiKey(localStorage.getItem('GEMINI_API_KEY') || '');
      setSelectedModel(localStorage.getItem('GEMINI_MODEL') || 'gemini-3-flash-preview');
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!apiKey.trim()) {
      alert("Vui lòng nhập API Key!");
      return;
    }
    localStorage.setItem('GEMINI_API_KEY', apiKey.trim());
    localStorage.setItem('GEMINI_MODEL', selectedModel);
    
    // Trigger a simple event or reload to ensure services pick it up if needed
    // Since service reads localStorage directly on call, just closing is fine.
    // However, to update Header state immediately:
    window.dispatchEvent(new Event('api-key-updated'));
    
    onClose();
  };

  if (!isOpen) return null;

  const models = [
    { id: 'gemini-3-flash-preview', name: 'Gemini 3.0 Flash', desc: 'Mặc định - Nhanh & Hiệu quả', badge: 'Khuyên dùng' },
    { id: 'gemini-3-pro-preview', name: 'Gemini 3.0 Pro', desc: 'Thông minh hơn - Tác vụ phức tạp', badge: 'Mạnh mẽ' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Phiên bản ổn định', badge: 'Ổn định' },
  ];

  return (
    <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-teal-600">settings_suggest</span>
          Thiết lập hệ thống
        </h3>

        <div className="space-y-6">
          {/* API Key Section */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Google Gemini API Key <span className="text-rose-500">*</span></label>
            <div className="relative">
              <input 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Nhập API Key của bạn (bắt đầu bằng AIza...)"
                className="w-full p-4 pr-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-0 font-mono text-sm"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">key</span>
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
              <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline font-bold bg-blue-50 px-3 py-1.5 rounded-lg">
                <span className="material-symbols-outlined text-[14px]">vpn_key</span> Lấy Key tại Google AI Studio
              </a>
              <a href="https://tinyurl.com/hdsdpmTHT" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-teal-600 hover:underline font-bold bg-teal-50 px-3 py-1.5 rounded-lg">
                <span className="material-symbols-outlined text-[14px]">help</span> Xem hướng dẫn chi tiết
              </a>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Model Selection */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Chọn mô hình AI (Model)</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {models.map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                    selectedModel === m.id 
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' 
                    : 'border-slate-100 dark:border-slate-800 hover:border-teal-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm text-slate-800 dark:text-white">{m.name}</span>
                    {selectedModel === m.id && <span className="material-symbols-outlined text-teal-600 text-[18px]">check_circle</span>}
                  </div>
                  <p className="text-xs text-slate-500 font-medium mb-2">{m.desc}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${selectedModel === m.id ? 'bg-teal-200 text-teal-800' : 'bg-slate-100 text-slate-500'}`}>
                    {m.badge}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 italic">
              * Hệ thống sẽ tự động chuyển đổi sang model khác nếu model đã chọn bị quá tải.
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button onClick={onClose} className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200">
             Đóng
          </button>
          <button onClick={handleSave} className="flex-1 py-3 bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 hover:bg-teal-700 transition-all flex items-center justify-center gap-2">
             <span className="material-symbols-outlined">save</span> Lưu thiết lập
          </button>
        </div>
      </div>
    </div>
  );
};

// --- HEADER COMPONENT ---
const Header: React.FC<{ onOpenSettings: () => void }> = ({ onOpenSettings }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const [user, setUser] = useState(getUserProfile());
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<{title: string, message: string, icon: string, color: string}[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  
  // Check API Key existence for UI feedback
  const [hasApiKey, setHasApiKey] = useState(!!localStorage.getItem('GEMINI_API_KEY'));

  useEffect(() => {
    const unsub = subscribeToUserUpdates(() => setUser(getUserProfile()));
    
    // Listen for API Key updates
    const handleApiKeyUpdate = () => setHasApiKey(!!localStorage.getItem('GEMINI_API_KEY'));
    window.addEventListener('api-key-updated', handleApiKeyUpdate);

    // Click outside to close notifications
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      unsub();
      window.removeEventListener('api-key-updated', handleApiKeyUpdate);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleNotifications = () => {
    if (!showNotifications) {
      // Generate notifications based on real stats
      const stats = JSON.parse(localStorage.getItem('userStats') || '{"solved": 0, "totalScore": 0, "exerciseTime": 0, "questionsDone": 0, "streak": 0}');
      const qDone = stats.questionsDone || 0;
      const timeMinutes = stats.exerciseTime || 0;
      const streak = stats.streak || 0;
      
      // Extract grade from user class (e.g. "Lớp 8A1" -> "8")
      const userGrade = user.class.match(/\d+/)?.[0] || ""; 
      const gradeText = userGrade ? ` Lớp ${userGrade}` : "";

      const newNotifs = [];

      // 1. Greeting & Streak
      if (streak > 0) {
        newNotifs.push({
          title: `Chuỗi ${streak} ngày rực lửa! 🔥`,
          message: "Cậu đang giữ phong độ rất tốt. Tiếp tục duy trì thói quen này nhé!",
          icon: "local_fire_department",
          color: "orange"
        });
      } else {
        newNotifs.push({
          title: "Chào cậu, mình rất nhớ cậu! 👋",
          message: "Hôm nay chúng mình chưa học cùng nhau. Làm vài bài tập nhỏ để khởi động nhé?",
          icon: "waving_hand",
          color: "teal"
        });
      }

      // 2. Questions Goal (Target: 50)
      const qTarget = 50;
      if (qDone >= qTarget) {
        newNotifs.push({
          title: "Xuất sắc! 🎉",
          message: "Cậu đã hoàn thành mục tiêu bài tập hôm nay. Nghỉ ngơi một chút hoặc thử thách thêm bài khó nhé!",
          icon: "military_tech",
          color: "yellow"
        });
      } else {
        const qLeft = qTarget - qDone;
        newNotifs.push({
          title: "Mục tiêu bài tập 🎯",
          message: qDone === 0 
            ? `Cậu chưa làm bài tập nào hôm nay. Thử ngay một bài trắc nghiệm${gradeText} xem sao?` 
            : `Chỉ còn ${qLeft} câu nữa là đạt mục tiêu rồi. Cố lên cậu ơi, sắp về đích rồi!`,
          icon: "edit_document",
          color: "blue"
        });
      }

      // 3. Time Goal (Target: 300 mins / 5 hours) - Logic scaled down for demo feeling
      if (timeMinutes > 30) {
         newNotifs.push({
          title: "Chăm chỉ quá đi! ⏰",
          message: "Cậu đã dành khá nhiều thời gian học hôm nay. Đừng quên uống nước và vận động nhẹ nhé.",
          icon: "self_improvement",
          color: "emerald"
        });
      }

      setNotifications(newNotifs);
    }
    setShowNotifications(!showNotifications);
  };

  return (
    <header className="sticky top-0 z-50 bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md border-b border-teal-100 dark:border-slate-800 shadow-sm transition-colors duration-200">
      <div className="px-4 lg:px-10 py-3 max-w-[1440px] mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex items-center justify-center size-12 rounded-xl bg-primary text-white shadow-lg shadow-teal-200 dark:shadow-none group-hover:rotate-6 transition-transform">
            <span className="material-symbols-outlined text-3xl">experiment</span>
          </div>
          <div className="flex flex-col">
            <h2 className="text-teal-900 dark:text-teal-400 text-lg md:text-xl font-black tracking-tight leading-none">GIA SƯ KHTN CẤP THCS</h2>
            <span className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">Phát triển bởi cô Huỳnh Thị Thùy Dương</span>
          </div>
        </Link>
        
        <nav className="hidden xl:flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-full border border-slate-100 dark:border-slate-700">
          <Link 
            to="/" 
            className={`px-4 py-2 text-sm font-bold transition-all rounded-full ${isActive('/') ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-white/50 dark:hover:bg-slate-700/50'}`}
          >
            Trang chủ
          </Link>
          <Link 
            to="/chat" 
            className={`px-4 py-2 text-sm font-bold transition-all rounded-full ${isActive('/chat') ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-white/50 dark:hover:bg-slate-700/50'}`}
          >
            Gia sư AI
          </Link>
          <Link 
            to="/profile" 
            className={`px-4 py-2 text-sm font-bold transition-all rounded-full ${isActive('/profile') ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-white/50 dark:hover:bg-slate-700/50'}`}
          >
            Hồ sơ
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {/* Settings Button (API Key) */}
          <button 
            onClick={onOpenSettings}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              !hasApiKey 
              ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse' 
              : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-white'
            }`}
          >
             <span className="material-symbols-outlined text-[16px]">settings_suggest</span>
             {hasApiKey ? "Cài đặt" : "Lấy API key để sử dụng app"}
          </button>

          {/* Notification Button */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={handleToggleNotifications}
              className={`relative p-2 rounded-full transition-colors hidden sm:block ${showNotifications ? 'bg-teal-100 text-teal-700' : 'text-slate-400 hover:text-primary hover:bg-teal-50 dark:hover:bg-slate-700'}`}
            >
              <span className="material-symbols-outlined text-[24px]">{showNotifications ? 'notifications_active' : 'notifications'}</span>
              {!showNotifications && <span className="absolute top-2 right-2 size-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>}
            </button>
            
            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-3 w-80 md:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-teal-100 dark:border-slate-700 p-2 animate-in fade-in slide-in-from-top-2 origin-top-right overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 rounded-t-xl">
                  <h3 className="text-sm font-black text-slate-800 dark:text-white">Lời nhắn từ Gia sư</h3>
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2 space-y-2">
                  {notifications.map((notif, idx) => (
                    <div key={idx} className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group cursor-pointer">
                      <div className={`size-10 rounded-full bg-${notif.color}-100 text-${notif.color}-600 flex items-center justify-center shrink-0`}>
                        <span className="material-symbols-outlined text-[20px]">{notif.icon}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-primary transition-colors">{notif.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t border-slate-100 dark:border-slate-800 text-center">
                  <Link to="/profile" onClick={() => setShowNotifications(false)} className="text-xs font-bold text-teal-600 hover:text-teal-700 block py-1">
                    Xem chi tiết tiến độ
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link to="/profile" className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-teal-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-teal-100">
            <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-primary shadow-sm" style={{ backgroundImage: `url("${user.avatar}")` }}></div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold leading-none max-w-[100px] truncate">{user.name}</p>
              <p className="text-[10px] text-primary font-bold">{user.class}</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="hidden lg:flex w-72 flex-col justify-between border-r border-teal-100 dark:border-gray-800 bg-white dark:bg-slate-900 p-6 h-[calc(100vh-73px)] sticky top-[73px]">
      <div className="flex flex-col gap-8">
        <div className="bg-gradient-to-r from-teal-50 to-white dark:from-gray-800 dark:to-gray-900 p-4 rounded-2xl border border-teal-100 dark:border-gray-700 flex flex-col items-center text-center">
          <h1 className="text-teal-800 dark:text-teal-200 text-base font-extrabold mb-1">KHOA HỌC TỰ NHIÊN</h1>
          <div className="flex items-center justify-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-700 text-[10px] font-bold uppercase tracking-wider">KHỐI LỚP THCS</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar pr-2">
          <Link to="/" className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group font-bold ${isActive('/') ? 'bg-primary/10 text-primary border-l-4 border-primary' : 'hover:bg-teal-50 dark:hover:bg-slate-800 text-slate-600 dark:text-gray-400 hover:text-primary'}`}>
            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">dashboard</span>
            <span className="text-sm">Tổng quan</span>
          </Link>
          <Link to="/chat" className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group font-bold ${isActive('/chat') ? 'bg-primary/10 text-primary border-l-4 border-primary' : 'hover:bg-teal-50 dark:hover:bg-slate-800 text-slate-600 dark:text-gray-400 hover:text-primary'}`}>
            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">smart_toy</span>
            <span className="text-sm">Gia sư AI</span>
          </Link>

          <div className="pt-2 pb-1 px-4">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Luyện tập</span>
          </div>
          
          <Link to="/exercises/6" className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group font-bold ${isActive('/exercises/6') ? 'bg-emerald-50 text-emerald-600 border-l-4 border-emerald-500' : 'hover:bg-teal-50 dark:hover:bg-slate-800 text-slate-600 dark:text-gray-400 hover:text-emerald-600'}`}>
            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">local_florist</span>
            <span className="text-sm">Lớp 6</span>
          </Link>
           <Link to="/exercises/7" className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group font-bold ${isActive('/exercises/7') ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500' : 'hover:bg-teal-50 dark:hover:bg-slate-800 text-slate-600 dark:text-gray-400 hover:text-blue-600'}`}>
            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">science</span>
            <span className="text-sm">Lớp 7</span>
          </Link>
           <Link to="/exercises/8" className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group font-bold ${isActive('/exercises/8') ? 'bg-fuchsia-50 text-fuchsia-600 border-l-4 border-fuchsia-500' : 'hover:bg-teal-50 dark:hover:bg-slate-800 text-slate-600 dark:text-gray-400 hover:text-fuchsia-600'}`}>
            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">biotech</span>
            <span className="text-sm">Lớp 8</span>
          </Link>
           <Link to="/exercises/9" className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group font-bold ${isActive('/exercises/9') ? 'bg-amber-50 text-amber-600 border-l-4 border-amber-500' : 'hover:bg-teal-50 dark:hover:bg-slate-800 text-slate-600 dark:text-gray-400 hover:text-amber-600'}`}>
            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">genetics</span>
            <span className="text-sm">Lớp 9</span>
          </Link>

          <div className="pt-2 pb-1 px-4">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cá nhân</span>
          </div>

          <Link to="/profile" className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group font-bold ${isActive('/profile') ? 'bg-primary/10 text-primary border-l-4 border-primary' : 'hover:bg-teal-50 dark:hover:bg-slate-800 text-slate-600 dark:text-gray-400 hover:text-primary'}`}>
            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">person</span>
            <span className="text-sm">Hồ sơ</span>
          </Link>

          <Link to="/about" className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group font-bold ${isActive('/about') ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-500' : 'hover:bg-teal-50 dark:hover:bg-slate-800 text-slate-600 dark:text-gray-400 hover:text-indigo-600'}`}>
            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">info</span>
            <span className="text-sm">Về tác giả</span>
          </Link>
        </div>
      </div>
      
      <div className="relative overflow-hidden bg-primary rounded-2xl p-5 text-white shadow-lg shadow-teal-500/20 mt-4">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
            <span className="material-symbols-outlined text-2xl">support_agent</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold">Cần trợ giúp?</span>
            <Link to="/chat" className="text-xs text-teal-100 hover:underline">Hỏi gia sư ngay</Link>
          </div>
        </div>
      </div>
    </aside>
  );
};

const App: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);

  // Check for API Key on initial load
  useEffect(() => {
    const hasKey = !!localStorage.getItem('GEMINI_API_KEY');
    if (!hasKey) {
      // Small delay to ensure smooth loading transition
      setTimeout(() => setShowSettings(true), 1000);
    }
  }, []);

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col font-body">
        <Header onOpenSettings={() => setShowSettings(true)} />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 overflow-x-hidden">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/exercises" element={<Navigate to="/exercises/6" replace />} />
              <Route path="/exercises/:gradeId" element={<GradeExercises />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
        </div>
      </div>
      
      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </HashRouter>
  );
};

export default App;
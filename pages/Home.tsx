import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserProfile, subscribeToUserUpdates } from '../services/userService';

const Home: React.FC = () => {
  const [user, setUser] = useState(getUserProfile());
  const [stats, setStats] = useState({
    questionsDone: 0,
    exerciseTime: 0,
    streak: 0
  });

  useEffect(() => {
    // Sync User Profile
    const unsubUser = subscribeToUserUpdates(() => setUser(getUserProfile()));

    // Fetch stats from localStorage to sync with Profile
    const savedStats = JSON.parse(localStorage.getItem('userStats') || '{"solved": 0, "totalScore": 0, "exerciseTime": 0, "questionsDone": 0, "streak": 0}');
    
    setStats({
      questionsDone: savedStats.questionsDone || 0,
      exerciseTime: savedStats.exerciseTime || 0,
      streak: savedStats.streak || 0
    });
    
    return () => unsubUser();
  }, []);

  const formatTime = (minutes: number) => {
    const totalSeconds = Math.floor(minutes * 60);
    const d = Math.floor(totalSeconds / 86400);
    const h = Math.floor((totalSeconds % 86400) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    const parts = [];
    if (d > 0) parts.push(`${d} ngày`);
    if (h > 0) parts.push(`${h} giờ`);
    if (m > 0) parts.push(`${m} phút`);
    parts.push(`${s} giây`);
    
    return parts.length > 0 ? parts.join(' ') : '0 giây';
  };

  const totalHoursNumeric = stats.exerciseTime / 60;

  // Metrics Logic Copied from Profile for Consistency
  const progressMetrics = [
    { 
      label: 'Học lý thuyết', 
      val: '15 phút', 
      target: 60, // minutes
      current: 15,
      percentage: 25, 
      color: 'blue' 
    },
    { 
      label: 'Làm bài tập', 
      val: `${stats.questionsDone} câu`, 
      target: 50, // questions
      current: stats.questionsDone,
      percentage: Math.min(100, Math.round((stats.questionsDone / 50) * 100)), 
      color: 'fuchsia' 
    },
    { 
      label: 'Tổng thời gian', 
      val: formatTime(stats.exerciseTime), 
      target: 5, // hours (for progress bar calc)
      current: totalHoursNumeric,
      percentage: Math.min(100, Math.round((totalHoursNumeric / 5) * 100)), 
      color: 'emerald' 
    }
  ];

  const cards = [
    { title: 'Gia sư AI', desc: 'Giải đáp mọi thắc mắc 24/7.', icon: 'smart_toy', color: 'teal', path: '/chat' },
    { title: 'Bài tập', desc: 'Luyện tập theo từng chủ đề.', icon: 'edit_document', color: 'blue', path: '/exercises' },
    { title: 'Hạng học tập', desc: 'Thành tích và huy hiệu.', icon: 'workspace_premium', color: 'orange', path: '/profile' }
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12">
      {/* Welcome Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-600 p-8 md:p-12 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-black leading-tight">
              Chào {user.name.split(' ').pop()}! 👋 <br/>
              Hôm nay học gì nhỉ?
            </h1>
            <p className="text-teal-50 text-lg font-medium max-w-lg">
              Cùng khám phá những bí ẩn của vũ trụ qua các bài học Vật lý, Hóa học và Sinh học nhé.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Link to="/chat" className="px-8 py-3.5 bg-white text-teal-700 rounded-2xl font-bold shadow-lg hover:bg-teal-50 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined">bolt</span> Hỏi Gia sư AI
              </Link>
              <Link to="/exercises" className="px-8 py-3.5 bg-teal-800/30 text-white border border-white/20 rounded-2xl font-bold backdrop-blur-md hover:bg-teal-800/50 transition-all">
                Làm bài tập ngay
              </Link>
            </div>
          </div>
          <div className="hidden lg:block w-72 animate-float">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuChIHnoPIJDs3xsnXRc3HIS17C3PihOP5_hxjusKLw6Y5IHtwpdpK8iOS4Lj990gW7un28tG-DAM-w2mNyQtzfTYKfjlTlZ1GOr3MalRruIBEJX8eZ9jnwG-Mpu3LvrVEegzNF2OyIJH8u-9wUyuzor8ag33iuvw5suOG_mzCScTsd9mjnQvGTq8xaGwIzk1cpoOULXvy0OXSCzKNlguZlMAwH61pPrkkeaHor-wA9g5Ha3smF_2mH0vtkOjAX8MFb9kBrz2CcBajlL" alt="Illustration" className="w-full h-auto drop-shadow-2xl" />
          </div>
        </div>
      </section>

      {/* Grid Navigation */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <Link key={idx} to={card.path} className="group bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-700 hover:-translate-y-2 transition-all duration-300">
            <div className={`size-14 rounded-2xl bg-${card.color}-100 dark:bg-${card.color}-900/30 text-${card.color}-600 flex items-center justify-center mb-5 group-hover:rotate-6 transition-transform`}>
              <span className="material-symbols-outlined text-3xl">{card.icon}</span>
            </div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">{card.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{card.desc}</p>
          </Link>
        ))}
      </section>

      {/* Progress Preview */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">Tiến độ tuần này</h2>
            <Link to="/profile" className="text-sm font-bold text-teal-600 hover:underline">Chi tiết</Link>
          </div>
          <div className="space-y-6">
            {progressMetrics.map((p, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-slate-600 dark:text-slate-300">{p.label}</span>
                  <span className={`text-${p.color}-600`}>{p.percentage}% <span className="text-[10px] text-slate-400 font-normal">({p.val})</span></span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full bg-${p.color}-500 transition-all duration-1000`} style={{ width: `${p.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-400 to-rose-500 p-8 rounded-3xl text-white shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="size-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">local_fire_department</span>
            </div>
            <h2 className="text-3xl font-black">{stats.streak} Ngày</h2>
            <p className="text-orange-50 font-medium">
              {stats.streak > 0 
                ? "Bạn đang có chuỗi học tập ấn tượng! Tiếp tục duy trì nhé." 
                : "Hãy bắt đầu chuỗi học tập ngay hôm nay bằng cách làm bài tập hoặc hỏi Gia sư AI!"}
            </p>
          </div>
          <Link to="/profile" className="mt-8 w-full py-3 bg-white text-orange-600 rounded-xl font-bold shadow-lg hover:bg-orange-50 transition-all text-center block">
            Xem bảng xếp hạng
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
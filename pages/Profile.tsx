import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile, subscribeToUserUpdates } from '../services/userService';

const Profile: React.FC = () => {
  const [activeChart, setActiveChart] = useState<'week' | 'month'>('week');
  const [animatedStats, setAnimatedStats] = useState({ solved: 0, score: 0, streak: 0 });
  const [user, setUser] = useState(getUserProfile());
  
  // Edit Profile Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    class: '',
    school: '',
    dateOfBirth: '',
    joinDate: '',
    gender: 'male' as 'male' | 'female'
  });

  // Change Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });

  // Fetch Real-time Data from LocalStorage
  const savedStats = JSON.parse(localStorage.getItem('userStats') || '{"solved": 0, "totalScore": 0, "exerciseTime": 0, "questionsDone": 0, "streak": 0, "theoryTime": 0}');

  const solvedCount = savedStats.solved;
  const averageScore = solvedCount > 0 ? parseFloat((savedStats.totalScore / solvedCount).toFixed(1)) : 0;
  
  // Time calculation
  const totalExerciseMinutes = savedStats.exerciseTime || 0;
  const totalTheoryMinutes = savedStats.theoryTime || 0;
  const combinedTotalMinutes = totalExerciseMinutes + totalTheoryMinutes;

  const totalHoursNumeric = combinedTotalMinutes / 60; // For chart and percentage calculation
  
  const questionsDone = savedStats.questionsDone;
  const currentStreak = savedStats.streak || 0;

  const targetStats = {
    solved: solvedCount,
    score: averageScore,
    streak: currentStreak
  };

  useEffect(() => {
     // Listen for updates from other components/tabs
     const unsubscribe = subscribeToUserUpdates(() => {
       setUser(getUserProfile());
     });
     return unsubscribe;
  }, []);

  const formatTimeDetailed = (minutes: number) => {
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

  // Activity Metrics
  const activityMetrics = [
    { name: 'Học lý thuyết', value: formatTimeDetailed(totalTheoryMinutes), target: '60 phút', percentage: Math.min(100, Math.round((totalTheoryMinutes / 60) * 100)), color: 'blue', icon: 'menu_book' },
    { name: 'Làm bài tập', value: `${questionsDone} câu`, target: '50 câu', percentage: Math.min(100, Math.round((questionsDone / 50) * 100)), color: 'fuchsia', icon: 'edit_document' },
    { name: 'Tổng thời gian', value: formatTimeDetailed(combinedTotalMinutes), target: '5 giờ', percentage: Math.min(100, Math.round((totalHoursNumeric / 5) * 100)), color: 'emerald', icon: 'schedule' }
  ];

  // Chart Data (Keeping chart data as numeric Hours for simplicity in visualization)
  const weekData = [
    { label: 'T2', val: 0, h: '5%' },
    { label: 'T3', val: 0, h: '5%' },
    { label: 'T4', val: 0, h: '5%' },
    { label: 'T5', val: 0, h: '5%' },
    { label: 'T6', val: 0, h: '5%' },
    { label: 'T7', val: parseFloat(totalHoursNumeric.toFixed(1)), h: `${Math.min(100, totalHoursNumeric * 20 + 5)}%` },
    { label: 'CN', val: 0, h: '5%' },
  ];

  const monthData = [
    { label: 'T1', val: 0, h: '5%' },
    { label: 'T2', val: 0, h: '5%' },
    { label: 'T3', val: 0, h: '5%' },
    { label: 'T4', val: 0, h: '5%' },
    { label: 'T5', val: 0, h: '5%' },
    { label: 'T6', val: 0, h: '5%' },
    { label: 'T7', val: 0, h: '5%' },
    { label: 'T8', val: 0, h: '5%' },
    { label: 'T9', val: 0, h: '5%' },
    { label: 'T10', val: 0, h: '5%' },
    { label: 'T11', val: 0, h: '5%' },
    { label: 'T12', val: parseFloat(totalHoursNumeric.toFixed(1)), h: `${Math.min(100, totalHoursNumeric * 10 + 5)}%` },
  ];

  const currentChartData = activeChart === 'week' ? weekData : monthData;

  // Animation Effect for Stats
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setAnimatedStats({
        solved: Math.floor(progress * targetStats.solved),
        score: parseFloat((progress * targetStats.score).toFixed(1)),
        streak: Math.floor(progress * targetStats.streak)
      });

      if (currentStep >= steps) {
        setAnimatedStats(targetStats);
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  // Handlers
  const openEditModal = () => {
    setEditForm({
      name: user.name,
      class: user.class,
      school: user.school,
      dateOfBirth: user.dateOfBirth,
      joinDate: user.joinDate,
      gender: user.gender
    });
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    updateUserProfile(editForm);
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    // Mock success
    alert("Đổi mật khẩu thành công!");
    setShowPasswordModal(false);
    setPasswordForm({ current: '', new: '', confirm: '' });
  };

  const toggleNotifications = () => {
    updateUserProfile({ 
      settings: { ...user.settings, notifications: !user.settings.notifications } 
    });
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-[1200px] mx-auto space-y-8 blob-bg relative">
      
      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-lg animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
             <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-6 sticky top-0 bg-white dark:bg-slate-900 z-10">Chỉnh sửa hồ sơ</h3>
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-bold text-slate-500 mb-2">Họ và tên</label>
                 <input 
                   type="text" 
                   value={editForm.name} 
                   onChange={(e) => setEditForm(prev => ({...prev, name: e.target.value}))}
                   className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-teal-500 font-bold"
                 />
               </div>
               <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-2">Lớp học</label>
                  <input 
                    type="text" 
                    value={editForm.class} 
                    onChange={(e) => setEditForm(prev => ({...prev, class: e.target.value}))}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-teal-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-2">Giới tính</label>
                   <div className="flex bg-slate-50 dark:bg-slate-800 rounded-xl p-1 border-2 border-slate-100 dark:border-slate-700">
                     <button 
                       onClick={() => setEditForm(prev => ({...prev, gender: 'male'}))}
                       className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${editForm.gender === 'male' ? 'bg-teal-100 text-teal-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                     >
                       Nam
                     </button>
                     <button 
                       onClick={() => setEditForm(prev => ({...prev, gender: 'female'}))}
                       className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${editForm.gender === 'female' ? 'bg-rose-100 text-rose-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                     >
                       Nữ
                     </button>
                   </div>
                </div>
               </div>
               
               <div>
                 <label className="block text-sm font-bold text-slate-500 mb-2">Trường học</label>
                 <input 
                   type="text" 
                   value={editForm.school} 
                   onChange={(e) => setEditForm(prev => ({...prev, school: e.target.value}))}
                   className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-teal-500 font-bold"
                 />
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-bold text-slate-500 mb-2">Ngày sinh</label>
                   <input 
                     type="text" 
                     placeholder="dd/mm/yyyy"
                     value={editForm.dateOfBirth} 
                     onChange={(e) => setEditForm(prev => ({...prev, dateOfBirth: e.target.value}))}
                     className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-teal-500 font-bold"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-slate-500 mb-2">Tham gia từ</label>
                   <input 
                     type="text" 
                     placeholder="dd/mm/yyyy"
                     value={editForm.joinDate} 
                     onChange={(e) => setEditForm(prev => ({...prev, joinDate: e.target.value}))}
                     className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-teal-500 font-bold"
                   />
                 </div>
               </div>
             </div>
             <div className="flex gap-3 mt-8">
               <button onClick={() => setIsEditing(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold rounded-xl hover:bg-slate-200 transition-colors">Hủy</button>
               <button onClick={handleSaveProfile} className="flex-1 py-3 bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 hover:bg-teal-700 transition-colors">Lưu thay đổi</button>
             </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-md animate-in zoom-in-95">
             <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-6">Đổi mật khẩu</h3>
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-bold text-slate-500 mb-2">Mật khẩu hiện tại</label>
                 <input 
                   type="password" 
                   value={passwordForm.current}
                   onChange={(e) => setPasswordForm(prev => ({...prev, current: e.target.value}))}
                   className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-teal-500"
                 />
               </div>
               <div>
                 <label className="block text-sm font-bold text-slate-500 mb-2">Mật khẩu mới</label>
                 <input 
                   type="password" 
                   value={passwordForm.new}
                   onChange={(e) => setPasswordForm(prev => ({...prev, new: e.target.value}))}
                   className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-teal-500"
                 />
               </div>
               <div>
                 <label className="block text-sm font-bold text-slate-500 mb-2">Xác nhận mật khẩu mới</label>
                 <input 
                   type="password" 
                   value={passwordForm.confirm}
                   onChange={(e) => setPasswordForm(prev => ({...prev, confirm: e.target.value}))}
                   className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-teal-500"
                 />
               </div>
             </div>
             <div className="flex gap-3 mt-8">
               <button onClick={() => setShowPasswordModal(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold rounded-xl hover:bg-slate-200 transition-colors">Hủy</button>
               <button onClick={handleChangePassword} className="flex-1 py-3 bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 hover:bg-teal-700 transition-colors">Xác nhận</button>
             </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Avatar & Basic Info */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-3xl shadow-soft border border-teal-100 dark:border-slate-700 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-teal-50 to-transparent dark:from-teal-900/20"></div>
            <div className="relative mb-5 group-hover:scale-105 transition-transform duration-300">
              <div className="w-36 h-36 rounded-full bg-cover bg-center border-[6px] border-white dark:border-slate-800 shadow-xl" style={{ backgroundImage: `url(${user.avatar})` }}></div>
              <button 
                onClick={openEditModal}
                className="absolute bottom-2 right-2 bg-white text-teal-600 p-2.5 rounded-full shadow-lg border border-teal-100 hover:bg-teal-50 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">edit</span>
              </button>
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">{user.name}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mt-1 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">ID: {user.id}</p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center w-full">
              <span className="inline-flex items-center px-4 py-1.5 bg-teal-100 text-teal-700 rounded-xl text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px] mr-1.5">school</span> Học sinh
              </span>
              <span className="inline-flex items-center px-4 py-1.5 bg-amber-100 text-amber-700 rounded-xl text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px] mr-1.5">groups</span> {user.class}
              </span>
            </div>
            <button 
              onClick={openEditModal}
              className="mt-8 w-full py-3.5 px-4 bg-primary hover:bg-primary-hover text-white font-bold text-base rounded-xl active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[22px]">edit_square</span> Chỉnh sửa hồ sơ
            </button>
          </div>

          <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-3xl shadow-soft border border-teal-100 dark:border-slate-700">
            <h3 className="text-lg font-black mb-5 flex items-center gap-2 text-slate-800 dark:text-white">
              <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                <span className="material-symbols-outlined text-[20px]">badge</span>
              </div>
              Thông tin chi tiết
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 text-sm font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">location_on</span> Trường học
                </span>
                <span className="font-bold text-sm text-slate-800 dark:text-slate-200 text-right max-w-[50%] truncate">{user.school}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 text-sm font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">cake</span> Ngày sinh
                </span>
                <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{user.dateOfBirth}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500 text-sm font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">calendar_month</span> Tham gia từ
                </span>
                <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{user.joinDate}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Side: Stats, Progress, Settings */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-3xl border border-teal-100 dark:border-slate-700 shadow-soft hover:-translate-y-1 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-gradient-to-br from-teal-400 to-teal-600 text-white rounded-xl shadow-md">
                  <span className="material-symbols-outlined">assignment_turned_in</span>
                </div>
                <span className="text-slate-500 text-sm font-bold uppercase">Đã giải</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">{animatedStats.solved}</span>
                <span className="text-sm font-bold text-slate-400">bài</span>
              </div>
            </div>
            <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-3xl border border-teal-100 dark:border-slate-700 shadow-soft hover:-translate-y-1 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-xl shadow-md">
                  <span className="material-symbols-outlined">star</span>
                </div>
                <span className="text-slate-500 text-sm font-bold uppercase">Điểm TB</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">{animatedStats.score}</span>
                <span className="text-sm font-bold text-slate-400">/ 10</span>
              </div>
            </div>
            <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-3xl border border-teal-100 dark:border-slate-700 shadow-soft hover:-translate-y-1 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-gradient-to-br from-rose-400 to-rose-600 text-white rounded-xl shadow-md">
                  <span className="material-symbols-outlined">local_fire_department</span>
                </div>
                <span className="text-slate-500 text-sm font-bold uppercase">Chuỗi ngày</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">{animatedStats.streak}</span>
                <span className="text-sm font-bold text-slate-400">ngày</span>
              </div>
            </div>
          </div>

          {/* Activity Metrics */}
          <div className="bg-surface-light dark:bg-surface-dark p-6 lg:p-8 rounded-3xl shadow-soft border border-teal-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                  <span className="material-symbols-outlined">track_changes</span>
                </div>
                Mục tiêu hôm nay
              </h3>
              <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-lg">Cập nhật: Vừa xong</span>
            </div>
           
            <div className="space-y-6">
              {activityMetrics.map((item, idx) => (
                <div key={idx} className="group">
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center gap-4">
                      <div className={`size-10 rounded-xl bg-${item.color}-100 text-${item.color}-600 flex items-center justify-center shadow-sm`}>
                        <span className="material-symbols-outlined">{item.icon}</span>
                      </div>
                      <div>
                        <span className="block font-bold text-base text-slate-800 dark:text-white">{item.name}</span>
                        <span className="block text-xs font-medium text-slate-500">{item.value} / {item.target}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`block text-lg font-black text-${item.color}-600`}>{item.percentage}%</span>
                    </div>
                  </div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
                    <div 
                      className={`h-full bg-gradient-to-r from-${item.color}-400 to-${item.color}-600 rounded-full transition-all duration-1000 ease-out`} 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-surface-light dark:bg-surface-dark p-6 lg:p-8 rounded-3xl shadow-soft border border-teal-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                  <span className="material-symbols-outlined">bar_chart</span>
                </div>
                Thời gian hoạt động
              </h3>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button 
                  onClick={() => setActiveChart('week')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeChart === 'week' ? 'bg-white dark:bg-slate-700 text-teal-600 shadow-sm' : 'text-slate-500 hover:text-teal-600'}`}
                >
                  Tuần
                </button>
                <button 
                  onClick={() => setActiveChart('month')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeChart === 'month' ? 'bg-white dark:bg-slate-700 text-teal-600 shadow-sm' : 'text-slate-500 hover:text-teal-600'}`}
                >
                  Năm
                </button>
              </div>
            </div>
            
            <div className="h-48 w-full flex items-end justify-between gap-2 sm:gap-4 pt-4 border-b border-dashed border-slate-200 dark:border-slate-700 pb-2">
               {currentChartData.map((data, idx) => (
                 <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="relative w-full flex justify-center items-end h-40">
                       <div 
                          className="w-full max-w-[30px] bg-teal-200 dark:bg-teal-900/30 rounded-t-lg transition-all duration-500 ease-out group-hover:bg-teal-300 relative overflow-hidden" 
                          style={{ height: data.h }}
                        >
                          <div className="absolute bottom-0 w-full bg-teal-500 opacity-80 h-full group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        {/* Tooltip */}
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded-lg shadow-lg mb-2 z-10 whitespace-nowrap">
                          {data.val} giờ
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{data.label}</span>
                 </div>
               ))}
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-surface-light dark:bg-surface-dark p-6 lg:p-8 rounded-3xl shadow-soft border border-teal-100 dark:border-slate-700">
            <h3 className="text-xl font-black mb-6 text-slate-800 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
                <span className="material-symbols-outlined">settings</span>
              </div>
              Cài đặt tài khoản
            </h3>
            <div className="grid gap-4">
              
              {/* Password Setting */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-transparent hover:border-teal-100 hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">lock</span>
                    </div>
                    <div>
                      <p className="font-bold text-base text-slate-800 dark:text-white group-hover:text-primary transition-colors">Mật khẩu & Bảo mật</p>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Đổi mật khẩu lần cuối 3 tháng trước</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowPasswordModal(true)}
                    className="text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 px-5 py-2.5 rounded-xl hover:bg-primary hover:text-white transition-all"
                  >
                    Thay đổi
                  </button>
              </div>

              {/* Notification Setting */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-transparent hover:border-teal-100 hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">notifications_active</span>
                    </div>
                    <div>
                      <p className="font-bold text-base text-slate-800 dark:text-white group-hover:text-primary transition-colors">Thông báo & Nhắc nhở</p>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Nhận thông báo về bài tập và điểm số</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={user.settings.notifications} 
                        onChange={toggleNotifications}
                        className="sr-only peer" 
                      />
                      <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
              </div>

              {/* Language Setting */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-transparent hover:border-teal-100 hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">language</span>
                    </div>
                    <div>
                      <p className="font-bold text-base text-slate-800 dark:text-white group-hover:text-primary transition-colors">Ngôn ngữ ứng dụng</p>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Mặc định: Tiếng Việt</p>
                    </div>
                  </div>
                  <button disabled className="text-sm font-bold text-teal-600 bg-teal-50 border-2 border-teal-100 px-5 py-2.5 rounded-xl opacity-70 cursor-not-allowed">
                    Tiếng Việt
                  </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
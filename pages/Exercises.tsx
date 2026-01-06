import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Exercises: React.FC = () => {
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);

  const grades = [
    { id: '6', label: 'Lớp 6', color: 'emerald', icon: 'local_florist', desc: 'Làm quen với KHTN, Đo lường, Chất và Tế bào' },
    { id: '7', label: 'Lớp 7', color: 'blue', icon: 'science', desc: 'Nguyên tử, Tốc độ, Âm thanh và Ánh sáng' },
    { id: '8', label: 'Lớp 8', color: 'fuchsia', icon: 'biotech', desc: 'Phản ứng hóa học, Áp suất, Điện và Cơ thể người' },
    { id: '9', label: 'Lớp 9', color: 'amber', icon: 'genetics', desc: 'Năng lượng, Kim loại, Di truyền và Tiến hóa' },
  ];

  const handleConfirm = () => {
    if (selectedGrade) {
      navigate(`/exercises/${selectedGrade}`);
    }
  };

  return (
    <div className="min-h-full p-6 md:p-10 max-w-5xl mx-auto flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10 space-y-3">
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight">
          Luyện tập theo chủ đề
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto">
          Chọn khối lớp bạn đang theo học để truy cập kho bài tập trắc nghiệm thông minh, bám sát chương trình sách giáo khoa Kết nối tri thức.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {grades.map((grade) => (
          <button
            key={grade.id}
            onClick={() => setSelectedGrade(grade.id)}
            className={`group relative p-6 rounded-3xl border-2 text-left transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 ${
              selectedGrade === grade.id 
                ? `border-${grade.color}-500 bg-${grade.color}-50 dark:bg-${grade.color}-900/20 ring-4 ring-${grade.color}-200 dark:ring-${grade.color}-900` 
                : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-teal-100'
            }`}
          >
            {selectedGrade === grade.id && (
              <div className={`absolute top-4 right-4 size-6 rounded-full bg-${grade.color}-500 text-white flex items-center justify-center animate-bounce`}>
                <span className="material-symbols-outlined text-[16px]">check</span>
              </div>
            )}
            
            <div className={`size-16 rounded-2xl bg-${grade.color}-100 dark:bg-${grade.color}-900/40 text-${grade.color}-600 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300`}>
              <span className="material-symbols-outlined text-4xl">{grade.icon}</span>
            </div>
            
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">{grade.label}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Chương trình mới</p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed min-h-[60px]">
              {grade.desc}
            </p>
          </button>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleConfirm}
          disabled={!selectedGrade}
          className="px-12 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg shadow-xl shadow-teal-500/20 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all flex items-center gap-3 active:scale-95"
        >
          <span>Xác nhận & Bắt đầu</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default Exercises;
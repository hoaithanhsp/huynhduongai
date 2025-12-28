import React from 'react';

const About: React.FC = () => {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[80vh] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-10 md:p-16 text-center border border-teal-100 dark:border-slate-800 relative overflow-hidden max-w-2xl w-full">
        {/* Background Blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-teal-100 dark:bg-teal-900/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 opacity-50"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="size-32 md:size-40 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-full p-1.5 shadow-xl mb-8">
            <div className="w-full h-full bg-white dark:bg-slate-800 rounded-full flex items-center justify-center overflow-hidden">
               {/* Placeholder Icon or Image */}
               <span className="material-symbols-outlined text-6xl text-teal-600 dark:text-teal-400">face_3</span>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
            Về tác giả
          </h1>
          <div className="w-20 h-1.5 bg-accent rounded-full mb-8"></div>

          <div className="space-y-6 w-full">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Giáo viên phát triển</p>
              <h2 className="text-2xl font-black text-teal-700 dark:text-teal-400">Cô Huỳnh Thị Thùy Dương</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-4 text-left shadow-sm">
                 <div className="size-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">science</span>
                 </div>
                 <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Tổ chuyên môn</p>
                    <p className="font-bold text-slate-700 dark:text-slate-200">Khoa học tự nhiên</p>
                 </div>
               </div>

               <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-4 text-left shadow-sm">
                 <div className="size-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">school</span>
                 </div>
                 <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Đơn vị công tác</p>
                    <p className="font-bold text-slate-700 dark:text-slate-200">THCS Lý Tự Trọng</p>
                    <p className="text-xs font-medium text-slate-500">Tây Ninh</p>
                 </div>
               </div>

               <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-4 text-left shadow-sm md:col-span-2">
                 <div className="size-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">call</span>
                 </div>
                 <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Liên hệ</p>
                    <a href="tel:0976793038" className="font-bold text-slate-700 dark:text-slate-200 text-lg hover:text-emerald-600 transition-colors">0976 793 038</a>
                 </div>
               </div>
            </div>
            
            <div className="pt-6">
                <p className="text-slate-500 italic text-sm font-medium">
                  "Với mong muốn mang đến một công cụ hỗ trợ học tập hiệu quả, trực quan và thú vị cho các em học sinh THCS yêu thích môn Khoa học tự nhiên."
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
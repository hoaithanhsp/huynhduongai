import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { generateQuiz, getLessonTheory, generateLessonSimulation } from '../services/geminiService';
import { Question } from '../types';
import { curriculumData } from '../data/curriculum';
import MathRenderer from '../components/MathRenderer';

const GradeExercises: React.FC = () => {
  const { gradeId } = useParams<{ gradeId: string }>();
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  
  // Quiz State
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Question[] | null>(null);
  const [quizStep, setQuizStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [currentLessonTitle, setCurrentLessonTitle] = useState("");
  const [startTime, setStartTime] = useState<number>(0);
  const [timer, setTimer] = useState(0); // Real-time seconds counter

  // Theory State
  const [showTheory, setShowTheory] = useState(false);
  const [theoryContent, setTheoryContent] = useState<string>("");
  const [isLoadingTheory, setIsLoadingTheory] = useState(false);

  // Simulation State
  const [showSimConfig, setShowSimConfig] = useState(false);
  const [simUserRequest, setSimUserRequest] = useState("");
  const [simUrl, setSimUrl] = useState<string | null>(null); // Changed from simHtml string to Blob URL
  const [isSimulating, setIsSimulating] = useState(false);

  const currentCurriculum = gradeId ? curriculumData[gradeId] : [];

  // Timer Effect
  useEffect(() => {
    let interval: any;
    if (currentQuiz && !showResult) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentQuiz, showResult]);

  // Cleanup Blob URL on unmount or new sim
  useEffect(() => {
    return () => {
      if (simUrl) URL.revokeObjectURL(simUrl);
    };
  }, [simUrl]);

  // Handle View Theory
  const handleViewTheory = async (lessonTitle: string) => {
    if (!gradeId) return;
    setCurrentLessonTitle(lessonTitle);
    setShowTheory(true);
    setTheoryContent(""); // Reset content
    setIsLoadingTheory(true);
    // Reset Sim State
    setShowSimConfig(false);
    if (simUrl) URL.revokeObjectURL(simUrl);
    setSimUrl(null);
    setSimUserRequest("");

    try {
      const content = await getLessonTheory(lessonTitle, gradeId);
      setTheoryContent(content);
    } catch (e) {
      setTheoryContent("Không thể tải lý thuyết lúc này.");
    } finally {
      setIsLoadingTheory(false);
    }
  };

  const handleStartSimulation = async () => {
    setIsSimulating(true);
    try {
      const htmlCode = await generateLessonSimulation(currentLessonTitle, simUserRequest);
      
      // Create a Blob from the HTML code
      const blob = new Blob([htmlCode], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      setSimUrl(url);
      setShowSimConfig(false); // Hide config, show success state
      
      // Attempt to open in new tab immediately
      window.open(url, '_blank');
      
    } catch (e) {
      alert("Có lỗi khi tạo mô phỏng.");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleStartQuiz = async (lessonTitle: string) => {
    if (!gradeId) return;
    setIsGenerating(true);
    setCurrentLessonTitle(lessonTitle);
    try {
      const questions = await generateQuiz(lessonTitle, gradeId);
      if (questions && Array.isArray(questions)) {
        setCurrentQuiz(questions);
        setQuizStep(0);
        setUserAnswers({});
        setShowResult(false);
        setStartTime(Date.now()); // Start precise timestamp for calculation
        setTimer(0); // Reset visual timer
      } else {
        throw new Error("Dữ liệu không hợp lệ");
      }
    } catch (e) {
      console.error(e);
      alert("Hệ thống đang bận hoặc có lỗi xảy ra khi tạo bài tập. Vui lòng thử lại sau giây lát!");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = (answer: string) => {
    setUserAnswers(prev => ({ ...prev, [quizStep]: answer }));
  };

  const handleFinishQuiz = () => {
    // Calculate Score
    const score = calculateScore();
    
    // Calculate Time Spent (in minutes) for Storage
    const endTime = Date.now();
    const timeSpentMinutes = (endTime - startTime) / 60000;

    // Save to LocalStorage for Profile & Home Stats
    const currentStats = JSON.parse(localStorage.getItem('userStats') || '{"solved": 0, "totalScore": 0, "exerciseTime": 0, "questionsDone": 0, "streak": 0, "lastActiveDate": ""}');
    
    // STREAK LOGIC
    const today = new Date().toDateString();
    if (currentStats.lastActiveDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      // If last active was yesterday, increment streak. Otherwise reset to 1.
      if (currentStats.lastActiveDate === yesterday.toDateString()) {
        currentStats.streak = (currentStats.streak || 0) + 1;
      } else {
        currentStats.streak = 1;
      }
      currentStats.lastActiveDate = today;
    } else if (currentStats.streak === 0) {
        // First activity of the very first day
        currentStats.streak = 1;
        currentStats.lastActiveDate = today;
    }

    // Calculate normalized score (out of 10 for profile average)
    // Quiz is 15 questions. If score is 15, that's a 10.
    const normalizedScore = (score / 15) * 10;

    const newStats = {
      ...currentStats,
      solved: currentStats.solved + 1,
      totalScore: currentStats.totalScore + normalizedScore,
      exerciseTime: currentStats.exerciseTime + timeSpentMinutes,
      questionsDone: currentStats.questionsDone + 15 // Assuming 15 questions per quiz
    };

    localStorage.setItem('userStats', JSON.stringify(newStats));
    setShowResult(true);
  };

  const nextStep = () => {
    if (quizStep < (currentQuiz?.length || 0) - 1) {
      setQuizStep(prev => prev + 1);
    } else {
      handleFinishQuiz();
    }
  };

  const calculateScore = () => {
    if (!currentQuiz) return 0;
    return currentQuiz.reduce((score, q, idx) => {
      const userAns = (userAnswers[idx] || "").toLowerCase().trim();
      const correctAns = q.correctAnswer.toLowerCase().trim();
      const isCorrect = userAns === correctAns;
      return isCorrect ? score + 1 : score;
    }, 0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'Physics': return 'blue';
      case 'Chemistry': return 'fuchsia';
      case 'Biology': return 'emerald';
      default: return 'teal';
    }
  };

  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case 'Physics': return 'bolt';
      case 'Chemistry': return 'science';
      case 'Biology': return 'eco';
      default: return 'menu_book';
    }
  };

  if (!currentCurriculum || currentCurriculum.length === 0) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Không tìm thấy dữ liệu cho Lớp {gradeId}</h2>
        <Link to="/exercises" className="text-teal-600 hover:underline mt-4 block">Quay lại thư viện</Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto flex flex-col gap-8 relative">
      {/* Loading Overlay for Quiz */}
      {isGenerating && (
        <div className="fixed inset-0 z-[100] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="size-24 mb-8 relative">
            <div className="absolute inset-0 border-4 border-teal-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-teal-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-teal-600 animate-pulse">psychology</span>
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Đang thiết kế bài tập thông minh...</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md">Gia sư AI đang soạn 15 câu hỏi trắc nghiệm dựa trên nội dung bài <strong>{currentLessonTitle}</strong>.</p>
        </div>
      )}

      {/* Theory & Simulation Modal */}
      {showTheory && (
        <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
             {/* Header */}
             <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10 rounded-t-3xl shrink-0">
                <div>
                   <h3 className="text-xl font-black text-slate-800 dark:text-white">
                      {simUrl ? "Mô phỏng trực quan" : "Lý thuyết tóm tắt"}
                   </h3>
                   <p className="text-sm font-medium text-teal-600 dark:text-teal-400">{currentLessonTitle}</p>
                </div>
                <button 
                  onClick={() => setShowTheory(false)}
                  className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 hover:text-rose-500 transition-all flex items-center justify-center"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
             </div>
             
             {/* Content Area */}
             <div className="relative flex-1 overflow-hidden flex flex-col">
                {/* 1. Simulation Success View (Instead of Iframe) */}
                {simUrl ? (
                  <div className="flex-1 w-full h-full bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-8 text-center space-y-6">
                    <div className="size-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                      <span className="material-symbols-outlined text-4xl">check_circle</span>
                    </div>
                    <div className="space-y-2">
                       <h4 className="text-2xl font-black text-slate-800 dark:text-white">Đã tạo mô phỏng!</h4>
                       <p className="text-slate-500 font-medium max-w-xs mx-auto">
                         Mô phỏng đã được mở ở một tab mới trên trình duyệt của bạn để có trải nghiệm tốt nhất.
                       </p>
                    </div>
                    <a 
                      href={simUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 hover:scale-105 transition-all flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined">open_in_new</span>
                      Mở lại mô phỏng
                    </a>
                    <p className="text-xs text-slate-400">Nếu trình duyệt chặn cửa sổ bật lên (popup), hãy nhấn nút trên.</p>
                  </div>
                ) : (
                   /* 2. Theory View */
                  <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                      {isLoadingTheory ? (
                        <div className="flex flex-col items-center justify-center py-10 space-y-4">
                          <div className="size-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
                          <p className="text-sm font-bold text-slate-400">Đang tổng hợp kiến thức từ SGK...</p>
                        </div>
                      ) : (
                        <div className="prose dark:prose-invert max-w-none">
                          <MathRenderer content={theoryContent} />
                        </div>
                      )}
                  </div>
                )}
                
                {/* 3. Simulation Config Overlay */}
                {showSimConfig && (
                   <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-20 flex flex-col p-6 animate-in fade-in slide-in-from-bottom-4">
                      <div className="flex items-center gap-2 mb-4">
                         <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                            <span className="material-symbols-outlined">science</span>
                         </div>
                         <h4 className="text-lg font-black text-slate-800 dark:text-white">Tạo mô phỏng thí nghiệm</h4>
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-center gap-4">
                        <label className="text-sm font-bold text-slate-500">Bạn muốn mô phỏng phần nào trong bài học này?</label>
                        <textarea 
                          value={simUserRequest}
                          onChange={(e) => setSimUserRequest(e.target.value)}
                          placeholder={`Ví dụ: "Mô phỏng sự chuyển động của các phân tử khi đun nóng" hoặc "Mô phỏng lực ma sát trượt"`}
                          className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-0 min-h-[120px] font-medium text-slate-800 dark:text-white resize-none"
                        />
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex gap-3">
                           <span className="material-symbols-outlined text-blue-500 text-[20px]">info</span>
                           <p className="text-xs text-blue-600 dark:text-blue-300">
                             Gia sư AI sẽ tự động viết mã để tạo ra một môi trường tương tác ngay trên màn hình. Quá trình này có thể mất khoảng 10-20 giây.
                           </p>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-4">
                         <button 
                           onClick={() => setShowSimConfig(false)}
                           className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200"
                         >
                           Hủy bỏ
                         </button>
                         <button 
                           onClick={handleStartSimulation}
                           disabled={isSimulating}
                           className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 disabled:opacity-70 flex items-center justify-center gap-2"
                         >
                           {isSimulating ? (
                             <>
                               <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                               Đang tạo...
                             </>
                           ) : (
                             <>
                               <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                               Bắt đầu tạo
                             </>
                           )}
                         </button>
                      </div>
                   </div>
                )}
             </div>

             {/* Footer */}
             {!showSimConfig && (
               <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-between gap-3 bg-slate-50 dark:bg-slate-900/50 rounded-b-3xl shrink-0">
                  <div className="flex gap-2">
                    {simUrl ? (
                      <button 
                        onClick={() => { 
                            if(simUrl) URL.revokeObjectURL(simUrl);
                            setSimUrl(null); 
                            setShowSimConfig(true); 
                        }}
                        className="px-4 py-3 rounded-xl font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">replay</span>
                        Tạo cái mới
                      </button>
                    ) : (
                      <button 
                        onClick={() => setShowSimConfig(true)}
                        className="px-4 py-3 rounded-xl font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">experiment</span>
                        Tạo mô phỏng trực quan
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowTheory(false)}
                      className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                    >
                      Đóng
                    </button>
                    <button 
                      onClick={() => {
                        setShowTheory(false);
                        handleStartQuiz(currentLessonTitle);
                      }}
                      className="px-6 py-3 rounded-xl bg-teal-600 text-white font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-700 transition-all flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit_square</span>
                      Làm bài tập
                    </button>
                  </div>
               </div>
             )}
          </div>
        </div>
      )}

      {/* Quiz UI Modal */}
      {currentQuiz && !showResult && (
        <div className="fixed inset-0 z-[90] bg-slate-50 dark:bg-slate-900 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-4 md:p-10">
            <div className="flex items-center justify-between mb-8 gap-4">
              <button onClick={() => setCurrentQuiz(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-all shrink-0">
                <span className="material-symbols-outlined">close</span>
              </button>
              
              <div className="flex flex-col items-center flex-1 mx-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-1">Tiến trình luyện tập</span>
                <div className="flex gap-1 w-full max-w-md">
                  {currentQuiz.map((_, i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i === quizStep ? 'bg-teal-600' : i < quizStep ? 'bg-teal-200' : 'bg-slate-200'}`}></div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                 {/* Real-time Timer Badge */}
                <div className="flex items-center gap-1.5 bg-teal-50 dark:bg-teal-900/30 px-3 py-1.5 rounded-xl border border-teal-100 dark:border-teal-800 text-teal-700 dark:text-teal-300">
                  <span className="material-symbols-outlined text-[18px] animate-pulse">timer</span>
                  <span className="text-sm font-black font-mono pt-0.5">{formatTime(timer)}</span>
                </div>
                <div className="text-right hidden sm:block">
                  <span className="text-sm font-black text-slate-400">Câu {quizStep + 1}/15</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-soft border border-teal-50 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-2 mb-6">
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                  currentQuiz[quizStep].difficulty === 'nhan_biet' ? 'bg-blue-100 text-blue-600' :
                  currentQuiz[quizStep].difficulty === 'thong_hieu' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
                }`}>
                  {currentQuiz[quizStep].difficulty.replace('_', ' ')}
                </span>
                <span className="text-xs font-bold text-slate-400">• +10 XP nếu đúng</span>
              </div>
              
              <div className="text-xl font-bold text-slate-800 dark:text-white mb-8 leading-relaxed">
                <MathRenderer content={currentQuiz[quizStep].question} />
              </div>

              <div className="grid gap-4">
                {currentQuiz[quizStep].type === 'multiple_choice' && currentQuiz[quizStep].options?.map((opt, i) => (
                  <button 
                    key={i}
                    onClick={() => handleAnswer(opt)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                      userAnswers[quizStep] === opt ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20' : 'border-slate-100 dark:border-slate-700 hover:border-teal-200'
                    }`}
                  >
                    <div className={`size-8 rounded-full border-2 flex items-center justify-center font-bold shrink-0 ${userAnswers[quizStep] === opt ? 'border-teal-600 text-teal-600' : 'border-slate-200 text-slate-400'}`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      <MathRenderer content={opt} />
                    </span>
                  </button>
                ))}

                {currentQuiz[quizStep].type === 'true_false' && (
                  <div className="grid grid-cols-2 gap-4">
                    {['Đúng', 'Sai'].map(val => (
                      <button 
                        key={val}
                        onClick={() => handleAnswer(val)}
                        className={`p-6 rounded-2xl border-2 font-black transition-all ${
                          userAnswers[quizStep] === val ? 'border-teal-600 bg-teal-50 text-teal-600' : 'border-slate-100 dark:border-slate-700 hover:border-teal-200'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                )}

                {currentQuiz[quizStep].type === 'short_answer' && (
                  <input 
                    type="text"
                    placeholder="Nhập câu trả lời của bạn..."
                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-teal-500 focus:border-teal-500 font-bold text-slate-800 dark:text-white"
                    value={userAnswers[quizStep] || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                  />
                )}
              </div>

              <div className="mt-12 flex justify-end">
                <button 
                  disabled={!userAnswers[quizStep]}
                  onClick={nextStep}
                  className="px-10 py-4 bg-teal-600 text-white rounded-2xl font-black shadow-lg shadow-teal-500/20 hover:bg-teal-700 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {quizStep === 14 ? 'Kết quả' : 'Tiếp theo'}
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result Screen */}
      {showResult && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-300">
          <div className="max-w-md w-full text-center space-y-8">
            <div className="relative inline-block">
              <div className="size-48 bg-teal-50 dark:bg-teal-900/20 rounded-full flex flex-col items-center justify-center border-8 border-teal-600 shadow-2xl">
                <span className="text-5xl font-black text-teal-600">{calculateScore()}/15</span>
                <span className="text-sm font-bold text-teal-500 uppercase tracking-widest">Câu đúng</span>
              </div>
              <div className="absolute -top-4 -right-4 bg-amber-400 text-white p-3 rounded-2xl shadow-lg rotate-12 animate-bounce">
                <div className="flex flex-col items-center">
                  <span className="text-lg font-black">+{calculateScore() * 10}</span>
                  <span className="text-[10px] font-bold">XP</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-slate-400 font-bold">
               <span className="material-symbols-outlined">timer</span>
               <span>Thời gian hoàn thành: {formatTime(Math.floor((Date.now() - startTime) / 1000))}</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-800 dark:text-white">Thành tích tuyệt vời!</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Bạn vừa hoàn thành bài tập ôn luyện bài <strong>{currentLessonTitle}</strong>. 
                Tiếp tục phát huy nhé!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleStartQuiz(currentLessonTitle)}
                className="py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white rounded-2xl font-black hover:bg-slate-200 transition-all"
              >
                Làm lại
              </button>
              <button 
                onClick={() => {
                  setCurrentQuiz(null);
                  setShowResult(false);
                }}
                className="py-4 bg-teal-600 text-white rounded-2xl font-black shadow-lg shadow-teal-500/20 hover:bg-teal-700 transition-all"
              >
                Tiếp tục học
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Back Nav */}
      <div className="flex items-center gap-4 mb-2">
        <Link to="/exercises" className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-teal-600 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm">
            <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-teal-900 dark:text-white">Bài tập Lớp {gradeId}</h1>
            <p className="text-slate-500 dark:text-gray-400 text-sm font-bold">
            Chương trình KHTN - Kết nối tri thức
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 flex flex-col gap-4">
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">list_alt</span> Danh sách Chương
          </h2>
          <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {currentCurriculum.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => setActiveChapter(chapter.id)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4 group ${
                  activeChapter === chapter.id
                    ? `border-${getSubjectColor(chapter.subject)}-500 bg-${getSubjectColor(chapter.subject)}-50 dark:bg-${getSubjectColor(chapter.subject)}-900/20`
                    : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-teal-200"
                }`}
              >
                <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                  activeChapter === chapter.id
                    ? `bg-${getSubjectColor(chapter.subject)}-500 text-white`
                    : `bg-${getSubjectColor(chapter.subject)}-100 text-${getSubjectColor(chapter.subject)}-600`
                }`}>
                  <span className="material-symbols-outlined">{getSubjectIcon(chapter.subject)}</span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className={`text-sm font-black truncate ${activeChapter === chapter.id ? `text-${getSubjectColor(chapter.subject)}-700 dark:text-${getSubjectColor(chapter.subject)}-300` : "text-slate-800 dark:text-white"}`}>
                    {chapter.title}
                  </p>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {chapter.lessons.length} bài học
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7">
          {activeChapter ? (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-soft border border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-right-4">
              {currentCurriculum
                .filter(c => c.id === activeChapter)
                .map(chapter => (
                  <div key={chapter.id} className="space-y-6">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 bg-${getSubjectColor(chapter.subject)}-100 text-${getSubjectColor(chapter.subject)}-600 rounded-md text-[10px] font-black uppercase tracking-wider`}>
                        {chapter.subject === 'Chemistry' ? 'Hóa học' : 
                         chapter.subject === 'Physics' ? 'Vật lý' : 
                         chapter.subject === 'Biology' ? 'Sinh học' : 'KHTN'}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-sm font-bold text-slate-400">Chương {chapter.id}</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white">{chapter.title}</h3>
                    
                    <div className="grid gap-3 pt-4">
                      {chapter.lessons.map(lesson => (
                        <div key={lesson.id} className="group flex items-center justify-between p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-teal-100 hover:shadow-md">
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-black text-teal-600 bg-teal-50 dark:bg-teal-900/30 size-8 flex items-center justify-center rounded-xl">
                              {lesson.id}
                            </span>
                            <span className="text-base font-bold text-slate-700 dark:text-slate-200">
                              {lesson.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleViewTheory(lesson.title)}
                              className="p-2 text-slate-400 hover:text-teal-600 transition-all bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm hover:shadow-md" 
                              title="Xem lý thuyết SGK"
                            >
                              <span className="material-symbols-outlined">notes</span>
                            </button>
                            <button 
                              onClick={() => handleStartQuiz(lesson.title)}
                              className="size-10 bg-white dark:bg-slate-700 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/50 rounded-full shadow-sm border border-slate-100 dark:border-slate-600 transition-all flex items-center justify-center group/btn" 
                              title="Tạo bài tập AI"
                            >
                              <span className="material-symbols-outlined text-[20px] group-hover/btn:scale-110 transition-transform">edit_square</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
              <span className="material-symbols-outlined text-6xl text-slate-300 mb-6 animate-pulse">psychology</span>
              <h3 className="text-xl font-bold text-slate-400 mb-2">Sẵn sàng ôn luyện chưa?</h3>
              <p className="text-sm text-slate-400 max-w-xs font-medium">Chọn một chương ở cột bên trái để xem các bài học và bắt đầu tạo bài tập AI nhé.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GradeExercises;
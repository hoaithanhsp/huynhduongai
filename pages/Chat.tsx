import React, { useState, useRef, useEffect } from 'react';
import { generateTutorStream } from '../services/geminiService';
import { ChatMessage } from '../types';
import MathRenderer from '../components/MathRenderer';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Chào bạn! Mình là Gia sư AI. 👋 Mình chuyên về Khoa học tự nhiên (Lý, Hóa, Sinh). Hôm nay bạn muốn khám phá kiến thức nào? Bạn có thể gửi ảnh bài tập để mình hỗ trợ nhé!',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [hintMode, setHintMode] = useState<'gentle' | 'detailed'>('detailed');
  
  // File Upload State
  const [attachment, setAttachment] = useState<{ name: string; type: string; data: string; url: string } | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping, attachment]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset value to allow selecting the same file again if needed
    e.target.value = '';

    if (file.size > 4 * 1024 * 1024) { // Limit 4MB
      alert("File quá lớn. Vui lòng chọn file nhỏ hơn 4MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Extract the base64 data part (remove "data:image/png;base64," prefix)
      const base64Data = base64String.split(',')[1];
      
      setAttachment({
        name: file.name,
        type: file.type,
        data: base64Data,
        url: URL.createObjectURL(file) // For preview
      });
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = () => {
    setAttachment(null);
  };

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && !attachment) || isTyping) return;

    const currentAttachment = attachment;
    const currentInput = inputValue;

    // Construct User Message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: currentInput || (currentAttachment ? `[Đã gửi file: ${currentAttachment.name}]` : ''),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setAttachment(null); // Clear attachment immediately
    setIsTyping(true);

    // STREAK LOGIC for Chat
    const currentStats = JSON.parse(localStorage.getItem('userStats') || '{"solved": 0, "totalScore": 0, "exerciseTime": 0, "questionsDone": 0, "streak": 0, "lastActiveDate": ""}');
    const today = new Date().toDateString();
    
    if (currentStats.lastActiveDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (currentStats.lastActiveDate === yesterday.toDateString()) {
        currentStats.streak = (currentStats.streak || 0) + 1;
      } else {
        currentStats.streak = 1;
      }
      currentStats.lastActiveDate = today;
      localStorage.setItem('userStats', JSON.stringify(currentStats));
    } else if (currentStats.streak === 0) {
       currentStats.streak = 1;
       currentStats.lastActiveDate = today;
       localStorage.setItem('userStats', JSON.stringify(currentStats));
    }

    const aiMsgId = (Date.now() + 1).toString();
    const aiMsgPlaceholder: ChatMessage = {
      id: aiMsgId,
      sender: 'ai',
      text: '',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, aiMsgPlaceholder]);

    let fullText = '';
    
    // Prepare API params
    const promptText = currentInput || "Hãy giải bài tập trong hình/file này giúp mình.";
    const apiAttachment = currentAttachment ? {
      mimeType: currentAttachment.type,
      data: currentAttachment.data
    } : undefined;

    const stream = generateTutorStream(promptText, hintMode, apiAttachment);

    try {
      for await (const chunk of stream) {
        if (chunk) {
          fullText += chunk;
          setMessages(prev => 
            prev.map(msg => msg.id === aiMsgId ? { ...msg, text: fullText } : msg)
          );
        }
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => 
        prev.map(msg => msg.id === aiMsgId ? { ...msg, text: "Có lỗi xảy ra khi xử lý. Vui lòng thử lại." } : msg)
      );
    } finally {
      setIsTyping(false);
    }
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Trình duyệt của bạn không hỗ trợ nhận diện giọng nói.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(prev => (prev ? prev + ' ' : '') + transcript);
    };

    recognition.start();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] bg-slate-50 dark:bg-slate-900/50">
      {/* Hidden File Inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
        accept="image/*,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
      />
      <input 
        type="file" 
        ref={cameraInputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
        accept="image/*" 
        capture="environment" 
      />

      {/* Messages Container */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:px-64 flex flex-col gap-6"
      >
        <div className="flex flex-col items-center justify-center py-6 text-center space-y-2 opacity-60">
          <div className="bg-white dark:bg-slate-800 px-4 py-1 rounded-full border border-teal-100 dark:border-teal-900 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">Trợ lý học tập 24/7</span>
          </div>
        </div>

        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-start gap-3 max-w-full ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm shrink-0 border transition-all ${
              msg.sender === 'ai' 
              ? 'bg-teal-500 text-white border-teal-600' 
              : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700'
            }`}>
              <span className="material-symbols-outlined text-[20px] filled">
                {msg.sender === 'ai' ? 'smart_toy' : 'person'}
              </span>
            </div>
            <div className={`flex flex-col gap-1 max-w-[85%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm overflow-hidden ${
                msg.sender === 'ai'
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-teal-50 dark:border-slate-700 rounded-tl-none'
                : 'bg-teal-600 text-white rounded-tr-none'
              }`}>
                {msg.text ? (
                    <MathRenderer content={msg.text} />
                ) : (isTyping && msg.sender === 'ai' ? <div className="flex gap-1 py-1"><div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce delay-75"></div><div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce delay-150"></div></div> : '')}
              </div>
              <span className="text-[10px] font-medium text-slate-400 px-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-4">
        <div className="max-w-4xl mx-auto flex flex-col gap-3">
          
          {/* File Preview */}
          {attachment && (
            <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 w-fit animate-in fade-in slide-in-from-bottom-2">
              <div className="size-10 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-600 overflow-hidden">
                {attachment.type.startsWith('image/') ? (
                  <img src={attachment.url} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-slate-400">description</span>
                )}
              </div>
              <div className="flex flex-col max-w-[150px]">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{attachment.name}</span>
                <span className="text-[10px] text-slate-400 uppercase">{attachment.type.split('/')[1]}</span>
              </div>
              <button 
                onClick={removeAttachment}
                className="p-1 hover:bg-rose-100 hover:text-rose-500 text-slate-400 rounded-full transition-colors ml-1"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          )}

          {/* Hint Mode Selection */}
          <div className="flex items-center gap-3 px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Chế độ:</span>
            <button 
              onClick={() => setHintMode('gentle')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                hintMode === 'gentle' 
                ? 'bg-amber-100 text-amber-700 border-amber-200 shadow-sm' 
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-white hover:border-amber-200 hover:text-amber-600'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">lightbulb</span>
              Gợi ý nhẹ
            </button>
            <button 
              onClick={() => setHintMode('detailed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                hintMode === 'detailed' 
                ? 'bg-teal-100 text-teal-700 border-teal-200 shadow-sm' 
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-white hover:border-teal-200 hover:text-teal-600'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">school</span>
              Gợi ý chi tiết
            </button>
          </div>

          <div className="relative flex items-end gap-2 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all shadow-sm">
            {/* Camera Button */}
            <button 
              onClick={() => cameraInputRef.current?.click()}
              className="p-2.5 rounded-xl transition-all shrink-0 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30"
              title="Chụp ảnh"
            >
              <span className="material-symbols-outlined">photo_camera</span>
            </button>
            
            {/* Upload Button */}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl transition-all shrink-0 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30"
              title="Tải ảnh/file lên"
            >
              <span className="material-symbols-outlined">attach_file</span>
            </button>

            {/* Mic Button */}
            <button 
              onClick={startSpeechRecognition}
              className={`p-2.5 rounded-xl transition-all shrink-0 ${isListening ? 'bg-rose-100 text-rose-600 animate-pulse' : 'text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30'}`}
              title="Nhập bằng giọng nói"
            >
              <span className="material-symbols-outlined">{isListening ? 'mic_active' : 'mic'}</span>
            </button>

            <textarea 
              className="w-full max-h-32 bg-transparent border-none focus:ring-0 text-slate-800 dark:text-white placeholder:text-slate-400 py-2.5 text-[15px] resize-none overflow-y-auto"
              placeholder={attachment ? "Mô tả yêu cầu của bạn..." : (hintMode === 'gentle' ? "Hỏi một gợi ý nhỏ để tự giải..." : "Hỏi cách giải chi tiết...")}
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button 
              onClick={handleSendMessage}
              disabled={isTyping || (!inputValue.trim() && !attachment)}
              className={`p-2.5 rounded-xl transition-all shrink-0 ${
                (!inputValue.trim() && !attachment) || isTyping ? 'text-slate-300' : 'bg-teal-600 text-white shadow-lg shadow-teal-500/20 hover:bg-teal-700'
              }`}
            >
              <span className="material-symbols-outlined filled">send</span>
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-400 font-medium">
            Gia sư AI có thể mắc sai sót, hãy đối chiếu với sách giáo khoa khi cần thiết.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Chat;
import { GoogleGenAI, Type } from "@google/genai";

const QUIZ_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.NUMBER },
      type: { type: Type.STRING, description: 'multiple_choice or true_false' },
      question: { type: Type.STRING },
      options: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: 'Chỉ dành cho multiple_choice. Cung cấp đúng 4 phương án.'
      },
      correctAnswer: { type: Type.STRING, description: 'Đáp án đúng chính xác hoặc "Đúng"/"Sai" cho câu hỏi true_false' },
      difficulty: { type: Type.STRING, description: 'nhan_biet, thong_hieu, hoặc van_dung' },
      explanation: { type: Type.STRING }
    },
    required: ['id', 'type', 'question', 'correctAnswer', 'difficulty', 'explanation']
  }
};

// 1. Fallback Configuration
const AVAILABLE_MODELS = [
  'gemini-3-flash-preview', 
  'gemini-3-pro-preview', 
  'gemini-2.5-flash'
];

// Helper to get User's API Key or Fallback to env
const getApiKey = () => {
  const userKey = localStorage.getItem('GEMINI_API_KEY');
  // Prioritize user key, then env key
  const key = userKey || process.env.API_KEY;
  if (!key) throw new Error("Vui lòng nhập API Key trong phần Cài đặt.");
  return key;
};

// Helper to get User's Preferred Model
const getPreferredModel = () => {
  return localStorage.getItem('GEMINI_MODEL') || 'gemini-3-flash-preview';
};

/**
 * Executes a Gemini API task with fallback logic.
 * Tries the preferred model first, then iterates through others if it fails.
 */
async function runWithFallback<T>(
  taskFn: (model: string, ai: GoogleGenAI) => Promise<T>
): Promise<T> {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const preferredModel = getPreferredModel();
  
  // Construct the order: Preferred -> Others
  const tryOrder = [
    preferredModel,
    ...AVAILABLE_MODELS.filter(m => m !== preferredModel)
  ];

  let lastError: any;

  for (const model of tryOrder) {
    try {
      console.log(`Attempting with model: ${model}`);
      return await taskFn(model, ai);
    } catch (error: any) {
      console.warn(`Model ${model} failed:`, error);
      // Check for specific API errors that warrant a retry (e.g., 429, 503, 500)
      // Or just retry on any error for robustness as requested
      lastError = error;
      continue; // Try next model
    }
  }

  // If all fail
  console.error("All models failed.");
  throw lastError || new Error("Hệ thống đang bận. Vui lòng thử lại sau.");
}

export const generateQuiz = async (lessonTitle: string, grade: string) => {
  const prompt = `Bạn là một chuyên gia giáo dục và gia sư khoa học nghiêm túc. Hãy tạo một bộ đề bài tập gồm ĐÚNG 15 câu hỏi cho bài học: "${lessonTitle}" trong chương trình Khoa học tự nhiên lớp ${grade} (Sách Kết nối tri thức với cuộc sống).

  Yêu cầu TỐI QUAN TRỌNG:
  1. Nội dung câu hỏi và đáp án phải CHÍNH XÁC TUYỆT ĐỐI, bám sát từng chi tiết nhỏ trong bài học của sách giáo khoa Kết nối tri thức. Không bịa đặt kiến thức ngoài SGK.
  2. Đáp án đúng phải là duy nhất và không gây tranh cãi.
  3. Cấu trúc đề:
     - 5 câu mức độ "nhan_biet" (Dễ - Nhớ kiến thức SGK).
     - 5 câu mức độ "thong_hieu" (Trung bình - Hiểu bản chất).
     - 5 câu mức độ "van_dung" (Khó - Vận dụng giải quyết vấn đề).
  4. Các loại câu hỏi phải trộn lẫn giữa 2 dạng sau: 
     - Trắc nghiệm khách quan 4 phương án (type: "multiple_choice", options: ["A...", "B...", "C...", "D..."]).
     - Trắc nghiệm Đúng/Sai (type: "true_false", correctAnswer: "Đúng" hoặc "Sai").
  5. TUYỆT ĐỐI KHÔNG tạo câu hỏi trả lời ngắn.
  6. Sử dụng LaTeX cho các công thức hóa học (ví dụ: $H_2O$) hoặc vật lý nếu có.
  7. Phản hồi bằng định dạng JSON chuẩn theo schema.`;

  return runWithFallback(async (model, ai) => {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: QUIZ_SCHEMA,
        temperature: 0.5, // Lower temperature for more accuracy
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("AI không trả về nội dung");
    return JSON.parse(text.trim());
  });
};

export const getLessonTheory = async (lessonTitle: string, grade: string) => {
  const cacheKey = `theory_v1_${grade}_${lessonTitle}`;
  const cachedData = localStorage.getItem(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  const prompt = `
    Nhiệm vụ: Tóm tắt lý thuyết bài học "${lessonTitle}" - KHTN Lớp ${grade} (Sách Kết nối tri thức).
    
    Yêu cầu đầu ra:
    1. Nội dung phải cực kỳ CÔ ĐỌNG, NGẮN GỌN, súc tích (dạng Cheat Sheet).
    2. Chỉ giữ lại:
       - Các định nghĩa cốt lõi nhất.
       - Các công thức quan trọng (Bắt buộc dùng LaTeX, ví dụ: $v = \\frac{s}{t}$).
       - 1-2 ví dụ minh họa hoặc lưu ý quan trọng.
    3. Trình bày bằng Markdown đẹp mắt:
       - Dùng **in đậm** cho từ khóa.
       - Dùng gạch đầu dòng cho các ý.
    4. Không viết lời dẫn, vào thẳng nội dung.
  `;

  try {
    const content = await runWithFallback(async (model, ai) => {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          temperature: 0.3,
        }
      });
      return response.text || "Không tìm thấy nội dung lý thuyết.";
    });
    
    localStorage.setItem(cacheKey, content);
    return content;
  } catch (error) {
    console.error("Theory Generation Error:", error);
    const errString = error instanceof Error ? error.message : String(error);
    // Show raw error if all failed
    return `Lỗi hệ thống: ${errString}. Vui lòng kiểm tra API Key hoặc thử lại sau.`;
  }
};

export const generateLessonSimulation = async (lessonTitle: string, userRequest: string) => {
  const prompt = `
    Bạn là một kỹ sư Frontend và chuyên gia giáo dục. 
    Nhiệm vụ: Tạo một file HTML đơn duy nhất (Single File HTML) chứa CSS và JavaScript để mô phỏng trực quan kiến thức khoa học.
    
    Bài học: "${lessonTitle}"
    Yêu cầu cụ thể của người dùng: "${userRequest || "Mô phỏng khái niệm quan trọng nhất của bài học này"}"

    Yêu cầu kỹ thuật:
    1. Output CHỈ LÀ CODE HTML. Không kèm lời dẫn, không markdown fences (\`\`\`html).
    2. Code phải bao gồm đầy đủ:
       - CSS (trong thẻ <style>): Giao diện đẹp, hiện đại, dùng màu sắc tươi sáng, font chữ dễ đọc. Center nội dung.
       - HTML: Cấu trúc rõ ràng, có tiêu đề, vùng mô phỏng (canvas hoặc div), và các nút điều khiển (nếu cần).
       - JS (trong thẻ <script>): Logic mô phỏng. Nên dùng HTML5 Canvas API cho chuyển động mượt mà hoặc DOM manipulation.
    3. Tính tương tác:
       - Phải có ít nhất 1 yếu tố tương tác (slider thay đổi thông số, nút bấm Bắt đầu/Dừng, hoặc kéo thả).
       - Ví dụ: Nếu là bài "Áp suất", cho slider chỉnh độ cao cột nước. Nếu là "Tế bào", cho click vào các bộ phận để hiện tên.
    4. Đảm bảo code chạy được ngay lập tức khi mở trên trình duyệt mà không cần thư viện ngoài (hoặc dùng CDN phổ biến như Tailwind nếu cần thiết).
  `;

  try {
    return await runWithFallback(async (model, ai) => {
       const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: { temperature: 0.7 }
      });
      let code = response.text || "";
      code = code.replace(/```html/g, "").replace(/```/g, "").trim();
      return code;
    });
  } catch (error) {
    console.error("Simulation Generation Error:", error);
    throw error;
  }
};


export const generateTutorStream = async function* (
  prompt: string, 
  mode: 'gentle' | 'detailed' = 'detailed',
  attachment?: { mimeType: string; data: string }
) {
  // NOTE: Streaming with fallback is complex because we can't "restart" a stream easily once yielded.
  // Strategy: Try to get the stream object. If connection fails immediately, retry. 
  // If it fails mid-stream, we can't easily fallback without re-generating full answer.
  // For simplicity here, we retry the connection phase.

  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const preferredModel = getPreferredModel();
  
  const tryOrder = [
    preferredModel,
    ...AVAILABLE_MODELS.filter(m => m !== preferredModel)
  ];
  
  let instruction = "Bạn là Gia sư KHTN Thông minh (Vật lý, Hóa học, Sinh học). Nhiệm vụ của bạn là giải đáp thắc mắc và hỗ trợ giải bài tập. ";
  
  if (attachment) {
    instruction += `
      KHI PHÂN TÍCH HÌNH ẢNH/TÀI LIỆU:
      1. Đọc kỹ đề bài, số liệu, đồ thị hoặc sơ đồ trong ảnh.
      2. Tóm tắt lại yêu cầu của bài toán trong ảnh.
      3. Nếu ảnh mờ hoặc không rõ, hãy hỏi lại học sinh.
    `;
  }

  if (mode === 'gentle') {
    instruction += `
      CHẾ ĐỘ GỢI Ý NHẸ (TƯ DUY):
      - Tuyệt đối KHÔNG đưa ra đáp án cuối cùng ngay lập tức.
      - Chỉ đưa ra các gợi ý về phương pháp, nhắc lại định lý hoặc công thức liên quan.
      - Đặt câu hỏi gợi mở để học sinh tự suy nghĩ và tìm ra hướng giải.
      - Khuyến khích tư duy logic.
    `;
  } else {
    instruction += `
      CHẾ ĐỘ GỢI Ý CHI TIẾT (CẦM TAY CHỈ VIỆC):
      - Hướng dẫn giải từng bước cụ thể (Step-by-step).
      - Cung cấp rõ ràng công thức, phép toán cần sử dụng.
      - Giải thích chi tiết tại sao lại làm như vậy.
    `;
  }

  const parts: any[] = [{ text: prompt }];
  if (attachment) {
    parts.unshift({
      inlineData: {
        mimeType: attachment.mimeType,
        data: attachment.data
      }
    });
  }

  let stream: any = null;

  // Fallback Logic for Connection/Initial Request
  for (const model of tryOrder) {
    try {
      console.log(`Stream connecting to: ${model}`);
      stream = await ai.models.generateContentStream({
        model: model, 
        contents: [{ parts }],
        config: {
          systemInstruction: instruction,
          temperature: 0.7,
        },
      });
      // If we got the stream object successfully, break loop and start yielding
      break; 
    } catch (e) {
       console.warn(`Stream connection failed for ${model}`, e);
       if (model === tryOrder[tryOrder.length - 1]) {
          yield `Lỗi kết nối API: ${e instanceof Error ? e.message : String(e)}. Vui lòng kiểm tra API Key hoặc thử lại sau.`;
          return;
       }
    }
  }

  // Yielding phase
  if (stream) {
      try {
        for await (const chunk of stream) {
            if (chunk.text) {
                yield chunk.text;
            }
        }
      } catch (error) {
        console.error("Stream interrupted:", error);
        yield "\n[Kết nối bị gián đoạn. Vui lòng thử lại]";
      }
  }
};
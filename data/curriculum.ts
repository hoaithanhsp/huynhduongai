
export interface Lesson {
  id: number;
  title: string;
}

export interface Chapter {
  id: string;
  title: string;
  subject: 'Physics' | 'Chemistry' | 'Biology' | 'General';
  lessons: Lesson[];
}

export const curriculumData: Record<string, Chapter[]> = {
  "6": [
    { id: "I", title: "Chương I: Mở đầu về KHTN", subject: "General", lessons: [
      { id: 1, title: "Giới thiệu về Khoa học tự nhiên" },
      { id: 2, title: "An toàn trong phòng thực hành" },
      { id: 3, title: "Sử dụng kính lúp" },
      { id: 4, title: "Sử dụng kính hiển vi quang học" },
      { id: 5, title: "Đo chiều dài" },
      { id: 6, title: "Đo khối lượng" },
      { id: 7, title: "Đo thời gian" },
      { id: 8, title: "Đo nhiệt độ" }
    ]},
    { id: "II", title: "Chương II: Chất quanh ta", subject: "Chemistry", lessons: [
      { id: 9, title: "Sự đa dạng của chất" },
      { id: 10, title: "Các thể của chất và sự chuyển thể" },
      { id: 11, title: "Oxygen. Không khí" }
    ]},
    { id: "III", title: "Chương III: Vật liệu, Nhiên liệu", subject: "Chemistry", lessons: [
      { id: 12, title: "Một số vật liệu" },
      { id: 13, title: "Một số nguyên liệu" },
      { id: 14, title: "Một số nhiên liệu" },
      { id: 15, title: "Một số lương thực, thực phẩm" }
    ]},
    { id: "IV", title: "Chương IV: Hỗn hợp", subject: "Chemistry", lessons: [
      { id: 16, title: "Hỗn hợp các chất" },
      { id: 17, title: "Tách chất khỏi hỗn hợp" }
    ]},
    { id: "V", title: "Chương V: Tế bào", subject: "Biology", lessons: [
      { id: 18, title: "Tế bào - Đơn vị cơ bản của sự sống" },
      { id: 19, title: "Cấu tạo và chức năng các thành phần của tế bào" },
      { id: 20, title: "Sự lớn lên và sinh sản của tế bào" }
    ]},
    { id: "VI", title: "Chương VI: Từ tế bào đến cơ thể", subject: "Biology", lessons: [
      { id: 22, title: "Cơ thể sinh vật" },
      { id: 23, title: "Tổ chức cơ thể đa bào" }
    ]},
    { id: "VII", title: "Chương VII: Đa dạng thế giới sống", subject: "Biology", lessons: [
      { id: 25, title: "Hệ thống phân loại sinh vật" },
      { id: 27, title: "Vi khuẩn" },
      { id: 29, title: "Virus" },
      { id: 30, title: "Nguyên sinh vật" },
      { id: 32, title: "Nấm" },
      { id: 34, title: "Thực vật" },
      { id: 36, title: "Động vật" },
      { id: 38, title: "Đa dạng sinh học" }
    ]},
    { id: "VIII", title: "Chương VIII: Lực trong đời sống", subject: "Physics", lessons: [
      { id: 40, title: "Lực là gì?" },
      { id: 41, title: "Biểu diễn lực" },
      { id: 42, title: "Biến dạng của lò xo" },
      { id: 43, title: "Trọng lượng, lực hấp dẫn" },
      { id: 44, title: "Lực ma sát" }
    ]},
    { id: "IX", title: "Chương IX: Năng lượng", subject: "Physics", lessons: [
      { id: 46, title: "Năng lượng và sự truyền năng lượng" },
      { id: 47, title: "Một số dạng năng lượng" },
      { id: 48, title: "Sự chuyển hóa năng lượng" },
      { id: 50, title: "Năng lượng tái tạo" }
    ]},
    { id: "X", title: "Chương X: Trái đất và Bầu trời", subject: "Physics", lessons: [
      { id: 52, title: "Chuyển động nhìn thấy của Mặt trời" },
      { id: 53, title: "Mặt trăng" },
      { id: 54, title: "Hệ Mặt trời" },
      { id: 55, title: "Ngân Hà" }
    ]}
  ],
  "7": [
    { id: "I", title: "Chương I: Nguyên tử & Bảng tuần hoàn", subject: "Chemistry", lessons: [
      { id: 1, title: "Phương pháp và kĩ năng học tập môn KHTN" },
      { id: 2, title: "Nguyên tử" },
      { id: 3, title: "Nguyên tố hóa học" },
      { id: 4, title: "Sơ lược về bảng tuần hoàn các nguyên tố hóa học" }
    ]},
    { id: "II", title: "Chương II: Phân tử & Liên kết hóa học", subject: "Chemistry", lessons: [
      { id: 5, title: "Phân tử - Đơn chất - Hợp chất" },
      { id: 6, title: "Giới thiệu về liên kết hóa học" },
      { id: 7, title: "Hóa trị và công thức hóa học" }
    ]},
    { id: "III", title: "Chương III: Tốc độ", subject: "Physics", lessons: [
      { id: 8, title: "Tốc độ chuyển động" },
      { id: 9, title: "Đo tốc độ" },
      { id: 10, title: "Đồ thị quãng đường - thời gian" },
      { id: 11, title: "Thảo luận về ảnh hưởng của tốc độ trong an toàn giao thông" }
    ]},
    { id: "IV", title: "Chương IV: Âm thanh", subject: "Physics", lessons: [
      { id: 12, title: "Sóng âm" },
      { id: 13, title: "Độ to và độ cao của âm" },
      { id: 14, title: "Phản xạ âm, chống ô nhiễm tiếng ồn" }
    ]},
    { id: "V", title: "Chương V: Ánh sáng", subject: "Physics", lessons: [
      { id: 15, title: "Năng lượng ánh sáng. Tia sáng, vùng tối" },
      { id: 16, title: "Sự phản xạ ánh sáng" },
      { id: 17, title: "Ảnh của vật qua gương phẳng" }
    ]},
    { id: "VI", title: "Chương VI: Từ trường", subject: "Physics", lessons: [
      { id: 18, title: "Nam châm" },
      { id: 19, title: "Từ trường" },
      { id: 20, title: "Chế tạo nam châm điện đơn giản" }
    ]},
    { id: "VII", title: "Chương VII: Trao đổi chất & Chuyển hóa năng lượng", subject: "Biology", lessons: [
      { id: 21, title: "Khái quát về trao đổi chất và chuyển hóa năng lượng" },
      { id: 22, title: "Quang hợp ở thực vật" },
      { id: 23, title: "Hô hấp tế bào" },
      { id: 24, title: "Trao đổi khí ở sinh vật" },
      { id: 25, title: "Trao đổi nước và chất dinh dưỡng ở thực vật" },
      { id: 26, title: "Trao đổi nước và chất dinh dưỡng ở động vật" }
    ]},
    { id: "VIII", title: "Chương VIII: Cảm ứng ở sinh vật", subject: "Biology", lessons: [
      { id: 27, title: "Cảm ứng ở thực vật" },
      { id: 28, title: "Cảm ứng ở động vật" },
      { id: 29, title: "Tập tính ở động vật" }
    ]},
    { id: "IX", title: "Chương IX: Sinh trưởng và phát triển", subject: "Biology", lessons: [
      { id: 30, title: "Sinh trưởng và phát triển ở thực vật" },
      { id: 31, title: "Sinh trưởng và phát triển ở động vật" }
    ]},
    { id: "X", title: "Chương X: Sinh sản ở sinh vật", subject: "Biology", lessons: [
      { id: 32, title: "Sinh sản vô tính ở sinh vật" },
      { id: 33, title: "Sinh sản hữu tính ở sinh vật" },
      { id: 34, title: "Các yếu tố ảnh hưởng đến sinh sản" }
    ]}
  ],
  "8": [
    { id: "I", title: "Chương I: Phản ứng hóa học", subject: "Chemistry", lessons: [
      { id: 1, title: "Biến đổi vật lí và biến đổi hóa học" },
      { id: 2, title: "Phản ứng hóa học" },
      { id: 3, title: "Định luật bảo toàn khối lượng" },
      { id: 4, title: "Phương trình hóa học" },
      { id: 5, title: "Tính theo phương trình hóa học" }
    ]},
    { id: "II", title: "Chương II: Một số hợp chất thông dụng", subject: "Chemistry", lessons: [
      { id: 6, title: "Acid" },
      { id: 7, title: "Base" },
      { id: 8, title: "Thang đo pH" },
      { id: 9, title: "Oxide" },
      { id: 10, title: "Muối" },
      { id: 11, title: "Phân bón hóa học" }
    ]},
    { id: "III", title: "Chương III: Khối lượng riêng & Áp suất", subject: "Physics", lessons: [
      { id: 12, title: "Khối lượng riêng" },
      { id: 13, title: "Áp suất" },
      { id: 14, title: "Áp suất chất lỏng" },
      { id: 15, title: "Áp suất khí quyển" },
      { id: 16, title: "Lực đẩy Archimedes" }
    ]},
    { id: "IV", title: "Chương IV: Tác dụng làm quay của lực", subject: "Physics", lessons: [
      { id: 17, title: "Moment lực" },
      { id: 18, title: "Đòn bẩy" }
    ]},
    { id: "V", title: "Chương V: Điện", subject: "Physics", lessons: [
      { id: 19, title: "Điện tích. Dòng điện" },
      { id: 20, title: "Mạch điện và các bộ phận của mạch điện" },
      { id: 21, title: "Tác dụng của dòng điện" },
      { id: 22, title: "Cường độ dòng điện và Hiệu điện thế" }
    ]},
    { id: "VI", title: "Chương VI: Nhiệt", subject: "Physics", lessons: [
      { id: 23, title: "Năng lượng nhiệt" },
      { id: 24, title: "Sự truyền nhiệt" },
      { id: 25, title: "Sự nở vì nhiệt" }
    ]},
    { id: "VII", title: "Chương VII: Cơ thể người", subject: "Biology", lessons: [
      { id: 26, title: "Hệ vận động" },
      { id: 27, title: "Dinh dưỡng và Tiêu hóa" },
      { id: 28, title: "Máu và Hệ tuần hoàn" },
      { id: 29, title: "Hệ hô hấp" },
      { id: 30, title: "Hệ bài tiết" },
      { id: 31, title: "Hệ thần kinh và các giác quan" },
      { id: 32, title: "Hệ nội tiết" },
      { id: 33, title: "Da và điều hòa thân nhiệt" },
      { id: 34, title: "Sinh sản ở người" }
    ]},
    { id: "VIII", title: "Chương VIII: Sinh vật và môi trường", subject: "Biology", lessons: [
      { id: 35, title: "Môi trường sống và các nhân tố sinh thái" },
      { id: 36, title: "Quần thể sinh vật" },
      { id: 37, title: "Quần xã sinh vật" },
      { id: 38, title: "Hệ sinh thái" },
      { id: 39, title: "Cân bằng tự nhiên" },
      { id: 40, title: "Bảo vệ môi trường" }
    ]}
  ],
  "9": [
    { id: "I", title: "Chương I: Năng lượng cơ học", subject: "Physics", lessons: [
      { id: 1, title: "Động năng. Thế năng" },
      { id: 2, title: "Cơ năng" },
      { id: 3, title: "Công và Công suất" }
    ]},
    { id: "II", title: "Chương II: Ánh sáng", subject: "Physics", lessons: [
      { id: 4, title: "Khúc xạ ánh sáng" },
      { id: 5, title: "Thấu kính hội tụ" },
      { id: 6, title: "Thấu kính phân kì" },
      { id: 7, title: "Mắt và các tật của mắt" },
      { id: 8, title: "Kính lúp" }
    ]},
    { id: "III", title: "Chương III: Điện tích & Từ trường", subject: "Physics", lessons: [
      { id: 9, title: "Định luật Ohm" },
      { id: 10, title: "Đoạn mạch nối tiếp và song song" },
      { id: 11, title: "Điện năng và công suất điện" },
      { id: 12, title: "Cảm ứng điện từ" },
      { id: 13, title: "Dòng điện xoay chiều" }
    ]},
    { id: "IV", title: "Chương IV: Kim loại", subject: "Chemistry", lessons: [
      { id: 14, title: "Tính chất chung của kim loại" },
      { id: 15, title: "Dãy hoạt động hóa học của kim loại" },
      { id: 16, title: "Hợp kim. Sự ăn mòn kim loại" }
    ]},
    { id: "V", title: "Chương V: Hóa học hữu cơ", subject: "Chemistry", lessons: [
      { id: 17, title: "Hợp chất hữu cơ" },
      { id: 18, title: "Methane. Ethylene" },
      { id: 19, title: "Acetylene" },
      { id: 20, title: "Rượu Etylic (Ethanol)" },
      { id: 21, title: "Acid Acetic" },
      { id: 22, title: "Chất béo" },
      { id: 23, title: "Glucose. Saccharose. Tinh bột. Cellulose" },
      { id: 24, title: "Protein. Polymer" }
    ]},
    { id: "VI", title: "Chương VI: Di truyền và Biến dị", subject: "Biology", lessons: [
      { id: 25, title: "Mendel và Khái niệm di truyền" },
      { id: 26, title: "Nhiễm sắc thể" },
      { id: 27, title: "DNA và Gene" },
      { id: 28, title: "Đột biến gen" },
      { id: 29, title: "Đột biến nhiễm sắc thể" }
    ]},
    { id: "VII", title: "Chương VII: Tiến hóa", subject: "Biology", lessons: [
      { id: 30, title: "Bằng chứng tiến hóa" },
      { id: 31, title: "Cơ chế tiến hóa" },
      { id: 32, title: "Sự phát sinh loài người" }
    ]}
  ]
};

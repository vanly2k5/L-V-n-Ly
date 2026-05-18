import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'vi' | 'en';

const translations = {
  vi: {
    nav: {
      home: "Trang chủ",
      insights: "Thống kê",
      events: "Sự kiện",
      saved: "Đã lưu",
      attendance: "Điểm danh",
      profile: "Hồ sơ"
    },
    dashboard: {
      title: "Phân tích học lực",
      pointsDistribution: "Phân bổ rèn luyện",
      attendanceRate: "Tỷ lệ chuyên cần",
      target: "Mục tiêu",
      completed: "Đã đạt",
      remaining: "Còn lại",
      skillsTitle: "Biểu đồ kỹ năng",
    },
    home: {
      welcome: "Chào mừng trở lại!",
      morning: "Chào buổi sáng!",
      afternoon: "Chào buổi chiều!",
      evening: "Chào buổi tối!",
      night: "Chúc ngủ ngon!",
      searchPlaceholder: "Tìm kiếm sự kiện, học bổng...",
      aiSuggest: "AI đề xuất cho bạn",
      aiSuggestSub: "Bấm để nhận gợi ý sự kiện phù hợp với bạn",
      featuredEvents: "Sự kiện nổi bật",
      seeAll: "Xem tất cả",
      deadlineScholarships: "Học bổng sắp hết hạn",
      noResults: "Không tìm thấy kết quả",
      noResultsSub: "Hãy thử tìm kiếm với từ khóa khác",
      searchResult: "Kết quả tìm kiếm",
      clearFilter: "Xóa lọc",
      events: "Sự kiện",
      scholarships: "Học bổng"
    },
    events: {
      listTitle: "Sự kiện",
      scholarshipTitle: "Học bổng",
      listSub: "Hà Nội · {count} sắp diễn ra",
      scholarshipSub: "Toàn quốc · {count} cơ hội mới",
      categories: ["Tất cả", "Học thuật", "Tình nguyện", "Thể thao", "CLB"],
      scholarshipCategories: ["Tất cả", "Khuyến khích", "Doanh nghiệp", "Quốc tế"],
      dateRange: "Khoảng thời gian",
      from: "Từ ngày",
      to: "Đến ngày",
      register: "Đăng ký",
      apply: "Ứng tuyển",
      searchPlaceholder: "Tìm kiếm sự kiện hoặc đơn vị tổ chức...",
      searchScholarshipPlaceholder: "Tìm kiếm học bổng, doanh nghiệp...",
      noEvents: "Không có sự kiện nào",
      noScholarships: "Không có học bổng nào",
      noEventsSub: "Hãy thử chọn một danh mục khác hoặc thay đổi ngày",
      listView: "Danh sách",
      calendarView: "Lịch",
      mon: "T2",
      tue: "T3",
      wed: "T4",
      thu: "T5",
      fri: "T6",
      sat: "T7",
      sun: "CN",
      clearFilter: "Đặt lại ngày"
    },
    profile: {
      editProfile: "Chỉnh sửa hồ sơ",
      saveChanges: "Lưu thay đổi",
      fullName: "Họ và tên",
      school: "Trường / Khoa",
      major: "Ngành học",
      schoolCode: "Mã SV",
      extraInfo: "Thông tin bổ sung",
      logout: "Đăng xuất",
      themeTitle: "Giao diện",
      themeSub: "Tùy chỉnh màu sắc cá nhân",
      primaryColor: "Màu chủ đạo",
      bgColor: "Màu nền",
      textColor: "Màu chữ",
      personalInfo: "Thông tin cá nhân",
      achievements: "Thành tựu & Chứng chỉ",
      viewAll: "Xem tất cả",
      verified: "Đã xác thực",
      viewPdf: "Xem PDF",
      pdfTitle: "Minh chứng PDF",
      pdfSub: "Xuất minh chứng rèn luyện có chữ ký số",
      pdfPreview: "Xem trước minh chứng",
      pdfSecure: "CampusHub Secure PDF 🔒"
    },
    common: {
      save: "Lưu",
      cancel: "Hủy",
      edit: "Chỉnh sửa",
      delete: "Xóa",
      back: "Quay lại",
      points: "điểm",
      days: "ngày",
      hours: "giờ",
      loading: "Đang tải...",
      zoomIn: "Phóng to",
      zoomOut: "Thu nhỏ",
      download: "Tải xuống",
      page: "Trang",
      saved: "Đã lưu thành công!",
      removed: "Đã xóa khỏi danh sách"
    },
    attendance: {
      title: "Điểm danh",
      checkIn: "Điểm danh vào",
      checkOut: "Điểm danh ra",
      history: "Lịch sử điểm danh",
      noHistory: "Chưa có dữ liệu điểm danh",
      scanningIn: "Đang quét mã vào...",
      scanningOut: "Đang quét mã ra...",
      successIn: "Check-in thành công!",
      successOut: "Check-out thành công!"
    },
    auth: {
      login: "Đăng nhập",
      signup: "Đăng ký",
      email: "Email",
      password: "Mật khẩu",
      noAccount: "Chưa có tài khoản? Đăng ký ngay",
      hasAccount: "Đã có tài khoản? Đăng nhập",
      error: "Đã có lỗi xảy ra. Vui lòng thử lại.",
      welcomeBack: "Chào bạn trở lại!",
      joinUs: "Thành viên mới?",
      loading: "Đang xử lý..."
    }
  },
  en: {
    nav: {
      home: "Home",
      insights: "Insights",
      events: "Events",
      saved: "Saved",
      attendance: "Check-in",
      profile: "Profile"
    },
    dashboard: {
      title: "Academic Analysis",
      pointsDistribution: "Conduct Points",
      attendanceRate: "Attendance Rate",
      target: "Target",
      completed: "Completed",
      remaining: "Remaining",
      skillsTitle: "Skill Radar",
    },
    home: {
      welcome: "Welcome back!",
      morning: "Good morning!",
      afternoon: "Good afternoon!",
      evening: "Good evening!",
      night: "Good night!",
      searchPlaceholder: "Search events, scholarships...",
      aiSuggest: "AI Recommended for you",
      aiSuggestSub: "Click to get event suggestions tailored for you",
      featuredEvents: "Featured Events",
      seeAll: "See all",
      deadlineScholarships: "Expiring Scholarships",
      noResults: "No results found",
      noResultsSub: "Try searching with different keywords",
      searchResult: "Search results",
      clearFilter: "Clear filters",
      events: "Events",
      scholarships: "Scholarships"
    },
    events: {
      listTitle: "Events",
      scholarshipTitle: "Scholarships",
      listSub: "Hanoi · {count} upcoming",
      scholarshipSub: "Nationwide · {count} new opportunities",
      categories: ["All", "Academic", "Volunteer", "Sports", "Club"],
      scholarshipCategories: ["All", "Academic", "Corporate", "International"],
      dateRange: "Date Range",
      from: "From",
      to: "To",
      register: "Register",
      apply: "Apply",
      searchPlaceholder: "Search events or organizers...",
      searchScholarshipPlaceholder: "Search scholarships, companies...",
      noEvents: "No events found",
      noScholarships: "No scholarships found",
      noEventsSub: "Try selecting a different category or changing the dates",
      listView: "List",
      calendarView: "Calendar",
      mon: "Mon",
      tue: "Tue",
      wed: "Wed",
      thu: "Thu",
      fri: "Fri",
      sat: "Sat",
      sun: "Sun",
      clearFilter: "Reset dates"
    },
    profile: {
      editProfile: "Edit Profile",
      saveChanges: "Save Changes",
      fullName: "Full Name",
      school: "School / Faculty",
      major: "Major",
      schoolCode: "Student ID",
      extraInfo: "Extra Info",
      logout: "Logout",
      themeTitle: "Interface",
      themeSub: "Personalize your colors",
      primaryColor: "Primary Color",
      bgColor: "Background",
      textColor: "Text Color",
      personalInfo: "Personal Information",
      achievements: "Achievements & Certificates",
      viewAll: "View all",
      verified: "Verified",
      viewPdf: "View PDF",
      pdfTitle: "PDF Proof",
      pdfSub: "Export digital signed certificates",
      pdfPreview: "PDF Preview",
      pdfSecure: "CampusHub Secure PDF 🔒"
    },
    common: {
      save: "Save",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      back: "Back",
      points: "pts",
      days: "days",
      hours: "hours",
      loading: "Loading...",
      zoomIn: "Zoom In",
      zoomOut: "Zoom Out",
      download: "Download",
      page: "Page",
      saved: "Saved successfully!",
      removed: "Removed from list"
    },
    attendance: {
      title: "Attendance",
      checkIn: "Check-in",
      checkOut: "Check-out",
      history: "Attendance History",
      noHistory: "No attendance data yet",
      scanningIn: "Scanning for entry...",
      scanningOut: "Scanning for exit...",
      successIn: "Check-in successful!",
      successOut: "Check-out successful!"
    },
    auth: {
      login: "Login",
      signup: "Sign up",
      email: "Email",
      password: "Password",
      noAccount: "Don't have an account? Sign up",
      hasAccount: "Already have an account? Login",
      error: "An error occurred. Please try again.",
      welcomeBack: "Welcome back!",
      joinUs: "New member?",
      loading: "Processing..."
    }
  }
};

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (path: string, params?: Record<string, string | number>) => any;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('lang') as Language) || 'vi';
  });

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const t = (path: string, params?: Record<string, string | number>) => {
    const keys = path.split('.');
    let value: any = translations[lang];
    
    for (const key of keys) {
      value = value?.[key];
    }

    if (!value) return path;

    if (Array.isArray(value)) return value;

    let text = String(value);
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        text = text.replace(`{${key}}`, String(val));
      });
    }
    return text;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

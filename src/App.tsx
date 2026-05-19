import React, { useState, useEffect } from "react";
import { Home as HomeIcon, Calendar, QrCode, User, Sparkles, X, Bookmark, Bell, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Home from "./pages/Home";
import Events from "./pages/Events";
import Attendance from "./pages/Attendance";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import SavedItems from "./pages/SavedItems";
import { AIRecommendation, SavedItem, SavedItemStatus, CheckInRecord, AppNotification, Event, Scholarship } from "./types";
import { useI18n } from "./lib/i18n";
import { AuthProvider, useAuth } from "./lib/auth";
import Auth from "./pages/Auth";
import { db } from "./lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { ChatBox } from "./components/ChatBox";
import { applyTheme, DEFAULT_THEME, AppTheme } from "./lib/theme";

const FEATURED_EVENTS: Event[] = [
  {
    id: "e1",
    title: "Liên hoan phim Sinh viên Nhân Văn 2026",
    organizer: "Fanpage LHP Sinh viên Nhân văn",
    date: "16/05",
    time: "08:00",
    location: "TP.HCM",
    points: 10,
    type: "social",
    badge: "MỚI",
    icon: "🎬",
    color: "#E84040",
  },
  {
    id: "e2",
    title: "BK Shark 2026 (Chung kết)",
    organizer: "Đại học Bách khoa – ĐH Đà Nẵng",
    date: "15/05",
    time: "14:00",
    location: "ĐH Đà Nẵng",
    points: 15,
    type: "academic",
    badge: "HOT",
    icon: "🦈",
    color: "#5B50D6",
  },
  {
    id: "e3",
    title: "Tọa đàm: Hợp tác Công - Tư Kỷ nguyên số",
    organizer: "DUE - ĐH Kinh tế & ĐH RMIT",
    date: "30/05",
    time: "08:00",
    location: "Hội trường E, DUE",
    points: 5,
    type: "academic",
    badge: "KHOA HỌC",
    icon: "📊",
    color: "#F0A030",
  },
  {
    id: "e4",
    title: "Workshop Khởi nghiệp ĐHQGHN 2026",
    organizer: "CLB Kinh doanh & Đổi mới",
    date: "14/01",
    time: "14:00",
    location: "Phòng B401",
    points: 5,
    type: "academic",
    badge: "SỰ KIỆN",
    icon: "🚀",
    color: "#5B50D6",
  },
  {
    id: "e5",
    title: "Hackathon AI — Giải pháp xanh",
    organizer: "CLB Công nghệ UET",
    date: "18/01",
    time: "08:00",
    location: "UET",
    points: 8,
    type: "academic",
    badge: "HOT",
    icon: "💡",
    color: "#1DB882",
  },
  {
    id: "e6",
    title: "Ngày hội Tình nguyện VNU",
    organizer: "Đoàn Thanh niên",
    date: "20/01",
    time: "07:30",
    location: "Sân vận động KTX",
    points: 10,
    type: "volunteer",
    badge: "MỚI",
    icon: "❤️",
    color: "#F87171",
  }
];

const FEATURED_SCHOLARSHIPS: Scholarship[] = [
  {
    id: "s1",
    name: "Học bổng Chính phủ Ru-ma-ni 2026",
    value: "Toàn phần",
    deadline: "Còn 12 ngày",
    progress: 45,
    icon: "🇷🇴",
    bgColor: "#E3F9EE",
  },
  {
    id: "s2",
    name: "Quỹ học bổng VAA 2026",
    value: "6.0 tỷ đồng",
    deadline: "Còn 42 ngày",
    progress: 15,
    icon: "✈️",
    bgColor: "#EEEDFD",
  },
  {
    id: "s3",
    name: "Học bổng Vingroup 2026",
    value: "50 triệu",
    deadline: "Đã qua",
    progress: 100,
    icon: "🎓",
    bgColor: "#EEEDFD",
  },
  {
    id: "s4",
    name: "Học bổng Odon Vallet",
    value: "20 triệu",
    deadline: "Sắp mở",
    progress: 0,
    icon: "🌸",
    bgColor: "#FFF3E0",
  },
];

function AppContent() {
  const { t } = useI18n();
  const { user, loading } = useAuth();
  const [tab, setTab] = useState(0);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [userData, setUserData] = useState({
    name: user?.displayName || "Sinh viên VNU",
    major: "Chưa cập nhật",
    school: "QHQ",
    subInfo: "Trường Quốc tế · ĐHQGHN",
    points: 82,
    eventsCount: "23/35",
    academicPoints: 15,
    socialPoints: 20,
    ethicsPoints: 24, // Matches conductPoints for home
    theme: DEFAULT_THEME
  });
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem("notifications");
    return saved ? JSON.parse(saved) : [
      { id: "n1", title: "Cập nhật điểm rèn luyện", message: "Bạn vừa được cộng 5 điểm từ Workshop Khởi nghiệp.", time: "2 phút trước", read: false, type: "points" },
      { id: "n2", title: "Học bổng Vingroup", message: "Hạn chót nộp hồ sơ chỉ còn 6 ngày. Hãy kiểm tra lại hồ sơ nhé!", time: "1 giờ trước", read: false, type: "event" },
      { id: "n3", title: "Đăng ký thành công", message: "Bạn đã đăng ký tham gia Hackathon AI thành công.", time: "5 giờ trước", read: true, type: "success" },
      { id: "n4", title: "Báo cáo tháng 4", message: "Báo cáo kết quả rèn luyện tháng 4 đã có. Xem ngay trong Dashboard.", time: "1 ngày trước", read: true, type: "event" },
      { id: "n5", title: "Nhắc nhở CLB", message: "Buổi sinh hoạt CLB Tiếng Anh sẽ diễn ra vào 18:00 tối nay.", time: "2 ngày trước", read: true, type: "event" },
    ];
  });
  const [savedItems, setSavedItems] = useState<SavedItem[]>([
    { id: "s1", itemId: "s1", type: "scholarship", title: "Học bổng Chính phủ Ru-ma-ni 2026", icon: "🇷🇴", status: "Quan tâm", deadline: "Còn 12 ngày" },
    { id: "s2", itemId: "s2", type: "scholarship", title: "Quỹ học bổng VAA 2026", icon: "✈️", status: "Đã nộp đơn", deadline: "Còn 42 ngày" },
    { id: "s3", itemId: "e1", type: "event", title: "LHP Sinh viên Nhân Văn", icon: "🎬", status: "Quan tâm", deadline: "16/05" },
    { id: "s4", itemId: "e2", type: "event", title: "BK Shark 2026", icon: "🦈", status: "Quan tâm", deadline: "Còn 2 ngày" },
    { id: "s5", itemId: "s2", type: "scholarship", title: "Học bổng POSCO Tháp Việt", icon: "💎", status: "Bị từ chối", deadline: "Đã qua" },
    { id: "s6", itemId: "e3", type: "event", title: "Tình nguyện Mùa hè xanh", icon: "❤️", status: "Đã tham gia", deadline: "07/2024" },
  ]);

  const [checkInHistory, setCheckInHistory] = useState<CheckInRecord[]>(() => {
    const saved = localStorage.getItem("checkInHistory");
    return saved ? JSON.parse(saved) : [
      { id: "h1", eventName: "LHP Sinh viên Nhân Văn", time: "09:00", date: "11/05", points: 5, icon: "🎬", background: "#FEF2F2", status: "Hoàn thành", type: "social", location: "Hội trường A" },
      { id: "h2", eventName: "Hội thảo DUE 2026", time: "10:15", date: "05/05", points: 5, icon: "📊", background: "#FFFBEB", status: "Hoàn thành", type: "academic", location: "DUE" },
      { id: "h3", eventName: "Hackathon AI 2026", time: "09:00", date: "15/05", points: 8, icon: "💡", background: "#EEEDFD", status: "Hoàn thành", type: "academic", location: "UET" },
      { id: "h4", eventName: "Seminar Kỹ năng mềm", time: "14:00", date: "05/04", points: 5, icon: "🤝", background: "#FDF4E3", status: "Hoàn thành", type: "social", location: "B101" },
      { id: "h5", eventName: "Câu lạc bộ Tiếng Anh", time: "18:00", date: "30/03", points: 3, icon: "🗣️", background: "#E3F2FD", status: "Hoàn thành", type: "club", location: "Thư viện" },
    ];
  });

  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    async function loadConfig() {
      if (!user) {
        applyTheme(DEFAULT_THEME);
        return;
      }
      try {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.theme) {
            applyTheme(data.theme as AppTheme);
          } else {
            applyTheme(DEFAULT_THEME);
          }
          if (data.name) {
            setUserData(prev => ({
              ...prev,
              name: data.name,
              major: data.major || prev.major,
              school: data.school || prev.school,
              subInfo: data.subInfo || prev.subInfo,
              points: data.points ?? prev.points,
              eventsCount: data.eventsCount || prev.eventsCount,
              academicPoints: data.academicPoints ?? prev.academicPoints,
              socialPoints: data.socialPoints ?? prev.socialPoints,
              ethicsPoints: data.ethicsPoints ?? prev.ethicsPoints,
              theme: data.theme || prev.theme
            }));
          }
        }
      } catch (e) {
        console.warn("Error loading config:", e);
        applyTheme(DEFAULT_THEME);
      }
    }
    loadConfig();
  }, [user]);

  // Check for upcoming deadlines
  useEffect(() => {
    const checkDeadlines = () => {
      savedItems.forEach(item => {
        if (item.deadline && item.deadline.includes("Còn") && item.status !== "Hoàn thành") {
          const notificationId = `deadline-${item.type}-${item.itemId}`;
          const exists = notifications.find(n => n.id === notificationId);
          
          if (!exists) {
            const newNotif: AppNotification = {
              id: notificationId,
              title: "Sắp tới hạn!",
              message: `${item.type === 'event' ? 'Sự kiện' : 'Học bổng'} "${item.title}" ${item.deadline.toLowerCase()}.`,
              time: "Bây giờ",
              type: "deadline",
              read: false
            };
            setNotifications(prev => [newNotif, ...prev]);
          }
        }
      });
    };

    const timer = setTimeout(checkDeadlines, 2000); // Check shortly after load
    return () => clearTimeout(timer);
  }, [savedItems]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleCheckIn = (record: Omit<CheckInRecord, "id">) => {
    const newRecord: CheckInRecord = { id: Math.random().toString(36).substr(2, 9), ...record };
    setCheckInHistory(prev => [newRecord, ...prev]);
    
    // Update user data based on check-in
    setUserData(prev => {
      const type = record.type;
      
      let newSocial = prev.socialPoints;
      let newAcademic = prev.academicPoints;
      let newEthics = prev.ethicsPoints;
      
      if (type === "academic") newAcademic += record.points;
      else if (type === "volunteer") newEthics += record.points;
      else newSocial += record.points;

      // Update events count if it's a "Hoàn thành" status (checkout)
      let newEventsCount = prev.eventsCount;
      if (record.status === "Hoàn thành") {
        const [current, total] = prev.eventsCount.split("/").map(Number);
        newEventsCount = `${current + 1}/${total}`;
        
        // Cycle to next event after checkout
        setCurrentEventIndex(prevIdx => (prevIdx + 1) % FEATURED_EVENTS.length);
      }

      return {
        ...prev,
        points: prev.points + record.points,
        academicPoints: Math.min(newAcademic, 30),
        socialPoints: Math.min(newSocial, 30),
        ethicsPoints: Math.min(newEthics, 30),
        eventsCount: newEventsCount
      };
    });

    if (record.status === "Hoàn thành") {
      showToast(t('attendance.successOut'), 'success');
    } else {
      showToast(t('attendance.successIn'), 'success');
    }
  };

  const handleToggleSave = (item: Omit<SavedItem, "id" | "status">) => {
    setSavedItems(prev => {
      const exists = prev.find(s => s.itemId === item.itemId && s.type === item.type);
      if (exists) {
        showToast(t('common.removed'), 'info');
        return prev.filter(s => s.itemId !== item.itemId || s.type !== item.type);
      }
      showToast(t('common.saved'), 'success');
      return [...prev, { ...item, id: Math.random().toString(36).substr(2, 9), status: "Quan tâm" }];
    });
  };

  const handleUpdateStatus = (id: string, status: SavedItemStatus) => {
    setSavedItems(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  };

  const handleRemoveSaved = (id: string) => {
    setSavedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleOpenAI = async () => {
    setIsAiOpen(true);
    setAiLoading(true);
    try {
      // Try to fetch current profile from Firestore if available
      let profile = { name: userData.name, major: userData.major };
      try {
        const docSnap = await getDoc(doc(db, "users", user!.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          profile = {
            name: data.name || profile.name,
            major: data.major || profile.major
          };
        }
      } catch (e) {
        console.warn("Could not load fresh profile for AI:", e);
      }
      
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: profile,
          interests: ["AI", "Khởi nghiệp", "Tình nguyện"]
        })
      });
      const data = await response.json();
      setRecommendations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("AI Error:", error);
      setRecommendations([]);
    } finally {
      setAiLoading(false);
    }
  };

  const tabs = [
    { icon: HomeIcon, label: t('nav.home') },
    { icon: BarChart3, label: t('nav.insights') },
    { icon: Calendar, label: t('nav.events') },
    { icon: Bookmark, label: t('nav.saved') },
    { icon: QrCode, label: t('nav.attendance') },
    { icon: User, label: t('nav.profile') },
  ];

  const handleProfileUpdate = (newData: any) => {
    setUserData(prev => ({ ...prev, ...newData }));
  };

  if (loading) return null;
  if (!user) return <Auth />;

  return (
    <div className="max-w-md mx-auto h-screen bg-app-bg relative overflow-hidden flex flex-col font-sans">
      {/* Global Notifications Toggle */}
      <div className="absolute top-14 right-6 z-[45]">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsNotificationsOpen(true)}
          className="w-10 h-10 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl flex items-center justify-center text-white relative shadow-lg"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-app-primary">
              {unreadCount}
            </span>
          )}
        </motion.button>
      </div>

      <main className="flex-1 overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">
          {tab === 0 && <Home key="home" userData={userData} onOpenAI={handleOpenAI} onSeeAllEvents={() => setTab(2)} onGoToDashboard={() => setTab(1)} savedItems={savedItems} onToggleSave={handleToggleSave} events={FEATURED_EVENTS} scholarships={FEATURED_SCHOLARSHIPS} />}
          {tab === 1 && <Dashboard key="dashboard" userData={userData} history={checkInHistory} />}
          {tab === 2 && <Events key="events" savedItems={savedItems} onToggleSave={handleToggleSave} events={FEATURED_EVENTS} scholarships={FEATURED_SCHOLARSHIPS} />}
          {tab === 3 && <SavedItems key="saved" items={savedItems} onUpdateStatus={handleUpdateStatus} onRemove={handleRemoveSaved} />}
          {tab === 4 && <Attendance key="attendance" history={checkInHistory} onCheckIn={handleCheckIn} currentEvent={FEATURED_EVENTS[currentEventIndex]} />}
          {tab === 5 && <Profile key="profile" initialData={userData} history={checkInHistory} onUpdate={handleProfileUpdate} />}
        </AnimatePresence>
      </main>

      {/* AI Recommendation Modal */}
      <AnimatePresence>
        {isAiOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAiOpen(false)}
              className="absolute inset-0 bg-[#0D1340]/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute bottom-0 inset-x-0 bg-white rounded-t-[32px] z-[70] p-6 shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-app-primary/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-app-primary" />
                  </div>
                  <h2 className="text-lg font-bold text-app-primary">AI đề xuất cho {userData.name}</h2>
                </div>
                <button onClick={() => setIsAiOpen(false)} className="p-2 bg-gray-100 rounded-full">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar">
                {aiLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="flex gap-2">
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-3 h-3 rounded-full bg-app-primary" />
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-3 h-3 rounded-full bg-app-primary/60" />
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-3 h-3 rounded-full bg-app-primary/20" />
                    </div>
                    <p className="text-sm font-bold text-gray-400 animate-pulse uppercase tracking-widest">Đang phân tích hồ sơ...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recommendations.map((rec, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={idx} 
                        className="bg-gray-50 rounded-2xl p-5 border border-gray-100"
                      >
                        <div className="flex gap-2 mb-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md 
                            ${rec.type === 'scholarship' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                            {rec.type === 'scholarship' ? 'Học bổng' : 'Sự kiện'}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-app-text mb-2">{rec.title}</h3>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">{rec.reason}</p>
                        <button className="mt-4 w-full py-3 bg-white border border-[#E3E5F8] rounded-xl text-xs font-bold text-app-primary shadow-sm">
                          {rec.type === 'scholarship' ? 'Xem chi tiết học bổng' : 'Đăng ký tham gia'}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Notifications Modal */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotificationsOpen(false)}
              className="absolute inset-0 bg-[#0D1340]/60 backdrop-blur-md z-[80]"
            />
            <motion.div 
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={{ left: 0, right: 0.5 }}
              onDragEnd={(_, info) => {
                if (info.offset.x > 100) {
                  setIsNotificationsOpen(false);
                }
              }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="absolute top-0 right-0 bottom-0 w-4/5 bg-[#F5F6FF] z-[90] shadow-2xl flex flex-col"
            >
              <div className="p-6 bg-white border-b border-[#E3E5F8] flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-[#0D1340]">Thông báo</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">CampusHub Updates</p>
                </div>
                <button onClick={() => setIsNotificationsOpen(false)} className="p-2 bg-gray-100 rounded-xl">
                  <X size={18} className="text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                    <Bell size={48} className="text-gray-300 mb-4" />
                    <p className="text-xs font-bold text-gray-400">Không có thông báo mới</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <motion.div
                      layout
                      key={n.id}
                      className={`p-4 rounded-2xl border transition-all ${n.read ? 'bg-white border-gray-100' : 'bg-white border-[#5B50D6] shadow-sm shadow-[#5B50D6]/10'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${n.type === 'deadline' ? 'bg-red-500' : 'bg-app-primary'} ${n.read ? 'opacity-0' : 'animate-pulse'}`} />
                          <h4 className="text-xs font-bold text-[#0D1340]">{n.title}</h4>
                        </div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium leading-relaxed mb-3">{n.message}</p>
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => deleteNotification(n.id)}
                          className="text-[10px] font-bold text-gray-400 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Xóa
                        </button>
                        {!n.read && (
                          <button 
                            onClick={() => {
                              setNotifications(prev => prev.map(notif => notif.id === n.id ? { ...notif, read: true } : notif));
                            }}
                            className="text-[10px] font-bold text-app-primary bg-app-secondary px-3 py-1.5 rounded-lg"
                          >
                            Đánh dấu đã đọc
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-4 bg-white border-t border-gray-100">
                  <button 
                    onClick={markAllRead}
                    className="w-full py-3 bg-gray-50 text-gray-400 text-xs font-bold rounded-xl hover:bg-app-secondary hover:text-app-primary transition-all"
                  >
                    Đánh dấu tất cả đã đọc
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="bg-white border-t border-[#E3E5F8] px-4 py-3 flex justify-between items-center z-[50]">
        {tabs.map((t, i) => (
          <button
            key={i}
            onClick={() => setTab(i)}
            className={`flex flex-col items-center gap-1.5 px-2 py-1 transition-all rounded-xl
              ${tab === i ? "text-app-primary bg-app-secondary" : "text-gray-400"}`}
          >
            <t.icon size={20} strokeWidth={tab === i ? 2.5 : 2} />
            <span className={`text-[10px] font-bold ${tab === i ? "opacity-100" : "opacity-60"}`}>{t.label}</span>
          </button>
        ))}
      </nav>
      <ChatBox />
      
      {/* Draggable Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            drag
            dragConstraints={{ left: -100, right: 100, top: -100, bottom: 50 }}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className={`fixed bottom-28 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 backdrop-blur-xl cursor-move active:cursor-grabbing select-none
              ${toast.type === 'success' ? 'bg-app-primary text-white' : 'bg-white text-app-primary border-[#E3E5F8]'}`}
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${toast.type === 'success' ? 'bg-white/20' : 'bg-app-secondary'}`}>
              {toast.type === 'success' ? <Bell size={14} /> : <X size={14} />}
            </div>
            <span className="text-xs font-bold whitespace-nowrap">{toast.message}</span>
            <button 
              onClick={() => setToast(null)}
              className="ml-2 opacity-50 hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

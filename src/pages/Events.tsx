import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bookmark, Calendar, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, List, Search, X } from "lucide-react";
import { Event, SavedItem, Scholarship } from "../types";
import { useI18n } from "../lib/i18n";

const SkeletonCard = ({ index }: { index: number, key?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="bg-white rounded-2xl border border-[#E3E5F8] overflow-hidden flex shadow-sm h-[160px] relative"
  >
    <div className="w-1.5 shrink-0 bg-slate-100 animate-pulse" />
    <div className="p-4 flex-1 relative overflow-hidden">
      <div className="flex gap-3 items-start">
        <div className="w-10 h-10 bg-slate-100 rounded-xl animate-pulse" />
        <div className="flex-1 space-y-3">
          <div className="flex justify-between items-start">
            <div className="h-4 bg-slate-100 rounded-md w-3/4 animate-pulse" />
            <div className="w-8 h-8 bg-slate-50 rounded-lg animate-pulse" />
          </div>
          <div className="h-3 bg-slate-50 rounded-md w-1/2 animate-pulse" />
        </div>
      </div>
      <div className="flex gap-4 mt-4">
        <div className="h-3.5 bg-slate-50 rounded-md w-16 animate-pulse" />
        <div className="h-3.5 bg-slate-50 rounded-md w-16 animate-pulse" />
        <div className="h-3.5 bg-slate-50 rounded-md w-16 animate-pulse" />
      </div>
      <div className="flex justify-between items-center mt-6 pt-3 border-t border-slate-50">
        <div className="flex gap-2">
          <div className="h-6 bg-slate-50 rounded-lg w-20 animate-pulse" />
          <div className="h-6 bg-slate-50 rounded-lg w-16 animate-pulse" />
        </div>
        <div className="h-9 bg-slate-100 rounded-xl w-24 animate-pulse" />
      </div>
      
      {/* Refined CSS Shimmer for better performance */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="shimmer-sweep" />
      </div>
    </div>
  </motion.div>
);

interface EventsProps {
  savedItems: SavedItem[];
  onToggleSave: (item: Omit<SavedItem, "id" | "status">) => void;
  onGoToAttendance?: (id?: string) => void;
  events?: Event[];
  scholarships?: (Scholarship & { type?: string; provider?: string })[];
  key?: string;
}

export default function Events({ savedItems, onToggleSave, onGoToAttendance, events: propsEvents, scholarships: propsScholarships }: EventsProps) {
  const { t, lang } = useI18n();
  
  const getEventTagColor = (type: string) => {
    switch (type) {
      case "academic": return "text-blue-600 bg-blue-50";
      case "volunteer": return "text-green-600 bg-green-50";
      case "sports": return "text-orange-600 bg-orange-50";
      case "club": return "text-purple-600 bg-purple-50";
      case "social": return "text-pink-600 bg-pink-50";
      default: return "text-gray-500 bg-gray-50";
    }
  };

  const getSchTagColor = (type: string) => {
    switch (type) {
      case "academic": return "text-blue-600 bg-blue-50";
      case "corporate": return "text-indigo-600 bg-indigo-50";
      case "international": return "text-purple-600 bg-purple-50";
      case "support": return "text-orange-600 bg-orange-50";
      case "talent": return "text-teal-600 bg-teal-50";
      default: return "text-gray-500 bg-gray-50";
    }
  };
  
  // Use props if provided, otherwise fallback to local constants
  const allEvents = propsEvents || [
    { id: "e1", color: "#E84040", icon: "🎬", title: "Liên hoan phim Sinh viên Nhân Văn 2026", organizer: "Fanpage LHP Sinh viên Nhân văn", date: "16/05", time: "08:00", location: "TP.HCM", points: 10, type: "social" },
    { id: "e2", color: "#5B50D6", icon: "🦈", title: "BK Shark 2026", organizer: "ĐH Bách khoa – ĐH Đà Nẵng", date: "15/05", time: "14:00", location: "ĐH Đà Nẵng", points: 15, type: "academic" },
    { id: "e3", color: "#F0A030", icon: "📊", title: "Tọa đàm: Hợp tác Công - Tư Kỷ nguyên số", organizer: "DUE & RMIT", date: "30/05", time: "08:00", location: "Hội trường E, DUE", points: 5, type: "academic" },
    { id: "e4", color: "#5B50D6", icon: "🚀", title: "Workshop Khởi nghiệp ĐHQGHN 2026", organizer: "CLB Kinh doanh & ĐM", date: "14/01", time: "14:00", location: "B401", points: 5, type: "academic" },
    { id: "e5", color: "#1DB882", icon: "❤️", title: "Hiến máu tình nguyện 2026", organizer: "Hội Chữ Thập Đỏ", date: "16/01", time: "07:30", location: "Sân A", points: 10, type: "volunteer" },
    { id: "e6", color: "#F0A030", icon: "💡", title: "Hackathon AI — Giải pháp xanh", organizer: "CLB Công nghệ UET", date: "18/01", time: "08:00", location: "UET", points: 8, type: "academic" },
  ];

  const allScholarships = propsScholarships || [
    { id: "s1", name: "Học bổng Chính phủ Ru-ma-ni 2026", value: "Toàn phần", deadline: "31/05/2026", progress: 45, icon: "🇷🇴", bgColor: "#E3F9EE", type: "international", provider: "ARICE" },
    { id: "s2", name: "Quỹ học bổng VAA 2026", value: "6.0 tỷ đồng", deadline: "30/06/2026", progress: 15, icon: "✈️", bgColor: "#EEEDFD", type: "academic", provider: "Học viện Hàng không" },
    { id: "s3", name: "Học bổng Vingroup 2026", value: "50 triệu", deadline: "Hết hạn", progress: 100, icon: "🎓", bgColor: "#EEEDFD", type: "corporate", provider: "Vingroup" },
    { id: "s4", name: "Học bổng Erasmus+ 2026", value: "Toàn phần", deadline: "30/03/2026", progress: 80, icon: "🇪🇺", bgColor: "#E8EAF6", type: "international", provider: "EU Commission" },
    { id: "s5", name: "Học bổng Posco TJ Park 2026", value: "1000 USD", deadline: "15/04/2026", progress: 0, icon: "💎", bgColor: "#E1F5FE", type: "corporate", provider: "Tập đoàn Posco" },
    { id: "s6", name: "Học bổng Đồng hành - Chặng 48", value: "5.0 triệu", deadline: "25/05/2026", progress: 10, icon: "🤝", bgColor: "#FFF3E0", type: "support", provider: "Hội Đồng hành" },
    { id: "s7", name: "Học bổng Honda Award 2026", value: "Máy tính & Tiền mặt", deadline: "10/06/2026", progress: 5, icon: "🏍️", bgColor: "#FFEBEE", type: "corporate", provider: "Honda Vietnam" },
    { id: "s8", name: "Học bổng Hessen (Đức) 2026", value: "1000 EUR", deadline: "30/07/2026", progress: 2, icon: "🇩🇪", bgColor: "#EFEBE9", type: "international", provider: "WUS Germany" },
    { id: "s9", name: "Học bổng Nghiên cứu Google AI 2026", value: "5000 USD", deadline: "15/08/2026", progress: 0, icon: "🤖", bgColor: "#E8F5E9", type: "talent", provider: "Google Research" },
    { id: "s10", name: "Học bổng Tài năng Trẻ CMC 2026", value: "100% Học phí", deadline: "20/07/2026", progress: 0, icon: "🌟", bgColor: "#FFFDE7", type: "talent", provider: "CMC Global" },
  ];
  const [activeMainTab, setActiveMainTab] = useState<"events" | "scholarships">("events");
  const [filterIndex, setFilterIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 4, 1)); // Start at May 2026 to see events
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const eventFilters: string[] = t('events.categories');
  const scholarshipFilters: string[] = t('events.scholarshipCategories');
  const filters = activeMainTab === "events" ? eventFilters : scholarshipFilters;

  useEffect(() => {
    // Simulate initial data fetch
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const isSaved = (id: string, type: "event" | "scholarship" = "event") => savedItems.some(s => s.itemId === id && s.type === type);

  const parseEventDate = (dateStr: string) => {
    const [day, month] = dateStr.split("/").map(Number);
    // Assuming 2026 for these specific events
    return new Date(2026, month - 1, day);
  };

  const applyPresetRange = (preset: "thisMonth" | "nextMonth" | "thisSemester" | "nextSemester") => {
    const now = new Date(2026, 4, 18); // Reference date: 2026-05-18
    let start = new Date();
    let end = new Date();

    if (preset === "thisMonth") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (preset === "nextMonth") {
      start = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      end = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    } else if (preset === "thisSemester") {
      // Semester 2: Feb to Aug
      start = new Date(now.getFullYear(), 1, 1);
      end = new Date(now.getFullYear(), 7, 31);
    } else if (preset === "nextSemester") {
      // Semester 1 of next year: Sep to Jan
      start = new Date(now.getFullYear(), 8, 1);
      end = new Date(now.getFullYear() + 1, 0, 31);
    }

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  const applyMonthFilter = (monthIndex: number) => {
    const year = 2026;
    const start = new Date(year, monthIndex, 1);
    const end = new Date(year, monthIndex + 1, 0);
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  const filteredEvents = allEvents.filter((e) => {
    // Category filter
    let categoryMatch = true;
    const eventTypes = ["all", "academic", "volunteer", "sports", "club", "social"];
    if (filterIndex > 0) {
      categoryMatch = e.type === eventTypes[filterIndex];
    }
    
    if (!categoryMatch) return false;

    // Date range filter
    const eventDate = parseEventDate(e.date);
    
    if (startDate) {
      const start = new Date(startDate);
      if (eventDate < start) return false;
    }
    
    if (endDate) {
      const end = new Date(endDate);
      // Set end date to end of day
      end.setHours(23, 59, 59, 999);
      if (eventDate > end) return false;
    }

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!e.title.toLowerCase().includes(q) && !e.organizer.toLowerCase().includes(q)) {
        return false;
      }
    }

    return true;
  });

  const filteredScholarships = allScholarships.filter((s) => {
    // Category filter
    let categoryMatch = true;
    const schTypes = ["all", "academic", "corporate", "international", "support", "talent"];
    if (filterIndex > 0) {
      categoryMatch = (s.type || "academic") === schTypes[filterIndex];
    }
    
    if (!categoryMatch) return false;

    // Deadline check (optional)
    if (startDate || endDate) {
      // Handle non-date strings like "Hết hạn"
      if (!s.deadline || !s.deadline.includes("/")) return false;
      
      // Parse DD/MM/YYYY
      const parts = s.deadline.split("/");
      const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      
      if (startDate && d < new Date(startDate)) return false;
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (d > end) return false;
      }
    }

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!s.name.toLowerCase().includes(q) && !s.provider.toLowerCase().includes(q)) {
        return false;
      }
    }

    return true;
  });

  const displayList = activeMainTab === "events" ? filteredEvents : filteredScholarships;

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="pb-24 bg-[#F5F6FF] min-h-screen">
      <header className="dark-gradient pt-16 pb-12 px-6 text-white relative overflow-hidden z-10">
        <div className="relative z-20">
          <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-2xl mb-8 border border-white/10 shadow-lg">
            <button 
              onClick={() => { setActiveMainTab("events"); setFilterIndex(0); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${activeMainTab === "events" ? "bg-white text-app-primary shadow-sm" : "text-white/60"}`}
            >
              {t('home.events')}
            </button>
            <button 
              onClick={() => { setActiveMainTab("scholarships"); setFilterIndex(0); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${activeMainTab === "scholarships" ? "bg-white text-app-primary shadow-sm" : "text-white/60"}`}
            >
              {t('home.scholarships')}
            </button>
          </div>

          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold font-sans">
                {activeMainTab === "events" ? t('events.listTitle') : t('events.scholarshipTitle')}
              </h1>
              <p className="text-xs text-white/60 mt-1 font-medium">
                {activeMainTab === "events" 
                  ? t('events.listSub', { count: filteredEvents.length }) 
                  : t('events.scholarshipSub', { count: filteredScholarships.length })}
              </p>
            </div>
            <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/10">
              <button 
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "bg-white text-app-primary shadow-sm" : "text-white/60"}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode("calendar")}
                className={`p-1.5 rounded-lg transition-all ${viewMode === "calendar" ? "bg-white text-app-primary shadow-sm" : "text-white/60"}`}
              >
                <Calendar className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="-mt-6 relative z-20">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className={`w-4 h-4 transition-colors ${searchQuery ? "text-app-primary" : "text-gray-400"}`} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeMainTab === "events" ? t('events.searchPlaceholder') : t('events.searchScholarshipPlaceholder')}
            className="w-full pl-11 pr-11 py-3 bg-gray-50 border border-[#E3E5F8] rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-app-primary/10 focus:border-app-primary focus:bg-white transition-all placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center hover:opacity-70 transition-opacity"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border-b border-[#E3E5F8] relative">
        <div className="flex gap-2 overflow-x-auto px-6 py-4 no-scrollbar">
          {filters.map((f, i) => (
            <button
              key={f}
              onClick={() => setFilterIndex(i)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold border-1.5 transition-all
                ${filterIndex === i ? "bg-app-primary border-app-primary text-white" : "bg-white border-[#E3E5F8] text-gray-500"}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="px-6 pb-4 flex items-center justify-between">
          <button 
            onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
            className="flex items-center gap-2 text-xs font-bold text-app-primary hover:bg-app-secondary px-3 py-2 rounded-xl transition-colors"
          >
            <Calendar className="w-4 h-4" />
            {t('events.dateRange')}
            {(startDate || endDate) && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
            {isDateFilterOpen ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
          </button>

          {(startDate || endDate) && (
            <button 
              onClick={clearDateFilter}
              className="text-[10px] font-bold text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors uppercase tracking-widest"
            >
              × {t('events.clearFilter')}
            </button>
          )}

          <AnimatePresence>
            {isDateFilterOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="absolute left-0 right-0 top-full bg-white z-20 border-b border-[#E3E5F8] px-6 pb-6 shadow-xl"
              >
                <div className="pt-4 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('events.from')}</label>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full text-xs p-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-app-primary/20 focus:border-app-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('events.to')}</label>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full text-xs p-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-app-primary/20 focus:border-app-primary"
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Khoảng thời gian nhanh</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "Tháng này", key: "thisMonth" },
                        { label: "Tháng sau", key: "nextMonth" },
                        { label: "Học kỳ này", key: "thisSemester" },
                        { label: "Học kỳ sau", key: "nextSemester" }
                      ].map((preset) => (
                        <button
                          key={preset.key}
                          onClick={() => applyPresetRange(preset.key as any)}
                          className="px-3 py-1.5 bg-[#EEEDFD] text-app-primary text-[10px] font-bold rounded-lg border border-[#5B50D6]/10 hover:bg-app-primary hover:text-white transition-colors"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Chọn theo tháng (2026)</p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => applyMonthFilter(i)}
                          className={`py-1.5 rounded-lg text-[10px] font-bold transition-all border
                            ${new Date(startDate || "").getMonth() === i && startDate ? "bg-app-primary border-app-primary text-white" : "bg-gray-50 border-gray-100 text-gray-500 hover:border-app-primary/30"}`}
                        >
                          Th. {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {viewMode === "calendar" ? (
        <div className="px-6 mt-6">
          <div className="bg-white rounded-3xl border border-[#E3E5F8] p-5 shadow-sm">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#0D1340]">
                {currentMonth.toLocaleString('vi-VN', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="p-2 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-400" />
                </button>
                <button 
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-2 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {[t('events.sun'), t('events.mon'), t('events.tue'), t('events.wed'), t('events.thu'), t('events.fri'), t('events.sat')].map(day => (
                <div key={day} className="text-center text-[10px] font-bold text-gray-400 uppercase py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate() }).map((_, i) => {
                const day = i + 1;
                const month = currentMonth.getMonth() + 1;
                const dateString = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`;
                const dayEvents = filteredEvents.filter(e => e.date === dateString);
                const dayScholarships = filteredScholarships.filter(s => s.deadline.startsWith(dateString));
                const totalItems = dayEvents.length + dayScholarships.length;
                
                const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentMonth.getMonth();
                const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth.getMonth() && new Date().getFullYear() === currentMonth.getFullYear();

                return (
                  <div key={day} className="relative">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                      onMouseEnter={() => totalItems > 0 && setHoveredDate(dateString)}
                      onMouseLeave={() => setHoveredDate(null)}
                      className={`aspect-square w-full rounded-xl flex flex-col items-center justify-center relative transition-all
                        ${isSelected ? "bg-app-primary text-white shadow-lg shadow-app-primary/30 z-10" : 
                          totalItems > 0 ? "bg-app-primary/5 text-app-primary border border-app-primary/10" : 
                          isToday ? "bg-app-secondary text-app-primary" : "hover:bg-gray-50 text-[#0D1340]"}`}
                    >
                      <span className={`text-xs font-bold ${isToday && !isSelected ? "underline decoration-2 underline-offset-4" : ""}`}>{day}</span>
                      <div className="flex gap-0.5 mt-1">
                        {dayEvents.slice(0, 2).map((e, idx) => (
                          <div 
                            key={`ev-${idx}`} 
                            className={`w-1 h-1 rounded-full ${isSelected ? "bg-white" : ""}`} 
                            style={{ backgroundColor: isSelected ? undefined : e.color }} 
                          />
                        ))}
                        {dayScholarships.slice(0, 2).map((_, idx) => (
                          <div 
                            key={`sch-${idx}`} 
                            className={`w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-purple-500"}`} 
                          />
                        ))}
                      </div>
                    </motion.button>

                    <AnimatePresence>
                      {hoveredDate === dateString && totalItems > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.95 }}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-white rounded-2xl shadow-2xl border border-[#E3E5F8] p-3 z-[100] pointer-events-none"
                        >
                          <div className="space-y-2.5">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-1.5 mb-1.5 flex justify-between">
                              <span>Mục tiêu ({totalItems})</span>
                              <span>{dateString}</span>
                            </p>
                            
                            {dayEvents.map(e => (
                              <div key={e.id} className="flex gap-2 items-start">
                                <span className="text-sm bg-gray-50 p-1 rounded-lg shrink-0">{e.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] font-bold text-[#0D1340] truncate leading-tight">{e.title}</p>
                                  <div className="flex items-center gap-2 mt-0.5 text-[8px] text-gray-500 font-medium">
                                    <span>⏰ {e.time}</span>
                                    <span className="truncate">📍 {e.location}</span>
                                  </div>
                                </div>
                              </div>
                            ))}

                            {dayScholarships.map(s => (
                              <div key={s.id} className="flex gap-2 items-start">
                                <span className="text-sm bg-purple-50 p-1 rounded-lg shrink-0">{s.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] font-bold text-[#0D1340] truncate leading-tight">{s.name}</p>
                                  <div className="flex items-center gap-2 mt-0.5 text-[8px] text-purple-500 font-medium font-bold">
                                    <span>💰 {s.value}</span>
                                    <span className="bg-purple-100 px-1 rounded truncate max-w-[80px]">
                                      {(() => {
                                        const idx = ["all", "academic", "corporate", "international", "support", "talent"].indexOf(s.type);
                                        return idx !== -1 ? scholarshipFilters[idx] : s.type;
                                      })()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-[#E3E5F8] rotate-45" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Items for selected day */}
          <div className="mt-8 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">
              {selectedDate ? `${selectedDate.getDate().toString().padStart(2, '0')}/${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}/${selectedDate.getFullYear()}` : "Chọn ngày để xem chi tiết"}
            </h3>
            {selectedDate ? (
              <div className="space-y-3">
                {/* Events */}
                {filteredEvents
                  .filter(e => {
                    const dateStr = `${selectedDate.getDate().toString().padStart(2, '0')}/${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}`;
                    return e.date === dateStr;
                  })
                  .map(e => (
                    <motion.div
                      key={e.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white rounded-2xl border border-[#E3E5F8] p-4 flex gap-4 shadow-sm"
                    >
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: `${e.color}1A` }}>
                        {e.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-bold text-app-primary bg-app-secondary px-2 py-0.5 rounded-full uppercase tracking-wider">Sự kiện</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${getEventTagColor(e.type)}`}>
                            {(() => {
                              const idx = ["all", "academic", "volunteer", "sports", "club", "social"].indexOf(e.type);
                              return idx !== -1 ? eventFilters[idx] : e.type;
                            })()}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#0D1340] leading-tight">{e.title}</h4>
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500 font-medium">
                          <span>⏰ {e.time}</span>
                          <span>📍 {e.location}</span>
                        </div>
                        <button 
                          onClick={() => onGoToAttendance && onGoToAttendance(e.id)}
                          className="mt-3 text-[10px] font-bold bg-app-primary text-white px-3 py-1.5 rounded-lg shadow-sm w-fit"
                        >
                          {t('events.register')}
                        </button>
                      </div>
                      <button 
                        onClick={(e_stop) => {
                          e_stop.stopPropagation();
                          onToggleSave({ itemId: e.id, type: "event", title: e.title, icon: e.icon });
                        }}
                        className={`p-1.5 rounded-lg h-fit transition-colors ${isSaved(e.id) ? "bg-app-secondary text-app-primary" : "hover:bg-gray-100 text-gray-300"}`}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved(e.id) ? "fill-app-primary" : ""}`} />
                      </button>
                    </motion.div>
                  ))}

                {/* Scholarships */}
                {filteredScholarships
                  .filter(s => {
                    const dateStr = `${selectedDate.getDate().toString().padStart(2, '0')}/${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}`;
                    return s.deadline.startsWith(dateStr);
                  })
                  .map(s => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white rounded-2xl border border-[#E3E5F8] p-4 flex gap-4 shadow-sm"
                    >
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 bg-purple-50">
                        {s.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Học bổng</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${getSchTagColor(s.type)}`}>
                            {(() => {
                              const idx = ["all", "academic", "corporate", "international", "support", "talent"].indexOf(s.type);
                              return idx !== -1 ? scholarshipFilters[idx] : s.type;
                            })()}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#0D1340] leading-tight">{s.name}</h4>
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-purple-500 font-medium">
                          <span>💰 {s.value}</span>
                          <span className="font-bold">📅 {s.deadline}</span>
                        </div>
                        <button className="mt-3 text-[10px] font-bold bg-purple-600 text-white px-3 py-1.5 rounded-lg shadow-sm w-fit">
                          {t('events.apply')}
                        </button>
                      </div>
                      <button 
                        onClick={(e_stop) => {
                          e_stop.stopPropagation();
                          onToggleSave({ itemId: s.id, type: "scholarship", title: s.name, icon: s.icon });
                        }}
                        className={`p-1.5 rounded-lg h-fit transition-colors ${isSaved(s.id, "scholarship") ? "bg-app-secondary text-app-primary" : "hover:bg-gray-100 text-gray-300"}`}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved(s.id, "scholarship") ? "fill-app-primary" : ""}`} />
                      </button>
                    </motion.div>
                  ))}

                {filteredEvents.filter(e => {
                  const dateStr = `${selectedDate.getDate().toString().padStart(2, '0')}/${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}`;
                  return e.date === dateStr;
                }).length === 0 && 
                filteredScholarships.filter(s => {
                  const dateStr = `${selectedDate.getDate().toString().padStart(2, '0')}/${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}`;
                  return s.deadline.startsWith(dateStr);
                }).length === 0 && (
                  <div className="py-10 text-center bg-white/40 rounded-3xl border border-dashed border-gray-200">
                    <p className="text-xs text-gray-400 font-medium">Không có sự kiện hoặc học bổng nào vào ngày này</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-20 text-center">
                <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-xs text-gray-400 font-medium tracking-wide">Nhấp vào một ngày có chấm để xem chi tiết</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="px-6 space-y-4 mt-6 pb-24">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              [0, 1, 2, 3].map((i) => (
                <SkeletonCard key={`skeleton-${i}`} index={i} />
              ))
            ) : displayList.length > 0 ? (
              displayList.map((item) => {
                const isEvent = activeMainTab === "events";
                const e = item as Event;
                const s = item as Scholarship & { provider: string; type: string };
                
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    whileHover={{ y: -4, borderColor: "var(--app-primary)", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white rounded-2xl border border-[#E3E5F8] overflow-hidden flex shadow-sm transition-colors duration-300"
                  >
                    <div className="w-1.5 shrink-0" style={{ backgroundColor: isEvent ? e.color : "#5B50D6" }} />
                    <div className="p-4 flex-1">
                      <div className="flex gap-3 items-start">
                        <span className="text-2xl shrink-0">{item.icon}</span>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="text-sm font-bold leading-tight flex-1">{isEvent ? e.title : s.name}</h3>
                            <button 
                              onClick={(e_stop) => {
                                e_stop.stopPropagation();
                                onToggleSave({ 
                                  itemId: item.id, 
                                  type: isEvent ? "event" : "scholarship", 
                                  title: isEvent ? e.title : s.name, 
                                  icon: item.icon 
                                });
                              }}
                              className={`p-1.5 rounded-lg transition-colors ${isSaved(item.id, isEvent ? "event" : "scholarship") ? "bg-app-secondary text-app-primary" : "hover:bg-gray-100 text-gray-300"}`}
                            >
                              <Bookmark className={`w-4 h-4 ${isSaved(item.id, isEvent ? "event" : "scholarship") ? "fill-app-primary" : ""}`} />
                            </button>
                          </div>
                          <p className="text-[11px] text-app-primary font-semibold mt-1">{isEvent ? e.organizer : s.provider}</p>
                        </div>
                      </div>
                      
                      {isEvent ? (
                        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
                          <span className="text-[11px] text-gray-500 font-medium">📅 {e.date}</span>
                          <span className="text-[11px] text-gray-500 font-medium">⏰ {e.time}</span>
                          <span className="text-[11px] text-gray-500 font-medium">📍 {e.location}</span>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
                          <span className="text-[11px] text-gray-500 font-medium">💰 {s.value}</span>
                          <span className="text-[11px] text-red-500 font-bold">⌛ Hạn chót: {s.deadline}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-50">
                        <div className="flex gap-2">
                          {isEvent ? (
                            <>
                              <span className="text-[10px] font-bold text-app-primary bg-app-secondary px-2 py-1 rounded-lg">+{e.points}đ điểm RL</span>
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${getEventTagColor(e.type)}`}>
                                {(() => {
                                  const idx = ["all", "academic", "volunteer", "sports", "club", "social"].indexOf(e.type);
                                  return idx !== -1 ? eventFilters[idx] : e.type;
                                })()}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-[10px] font-bold text-app-primary bg-app-secondary px-2 py-1 rounded-lg">{s.value}</span>
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${getSchTagColor(s.type)}`}>
                                {(() => {
                                  const idx = ["all", "academic", "corporate", "international", "support", "talent"].indexOf(s.type);
                                  return idx !== -1 ? scholarshipFilters[idx] : s.type;
                                })()}
                              </span>
                              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden self-center">
                                <div className="h-full bg-app-primary" style={{ width: `${s.progress}%` }} />
                              </div>
                            </>
                          )}
                        </div>
                        <button 
                          onClick={() => isEvent && onGoToAttendance && onGoToAttendance(item.id)}
                          className="text-xs font-bold bg-app-primary text-white px-4 py-1.5 rounded-xl shadow-sm"
                        >
                          {isEvent ? t('events.register') : t('events.apply')}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="py-24 text-center flex flex-col items-center justify-center"
              >
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-app-primary/5 rounded-full blur-2xl animate-pulse" />
                  <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center border border-gray-100 relative shadow-sm">
                    <Search className="w-10 h-10 text-gray-200 stroke-[1.5]" />
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-50"
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </motion.div>
                  </div>
                </div>
                <h3 className="text-base font-bold text-[#0D1340] mb-2 leading-tight">
                  {searchQuery 
                    ? (lang === 'vi' ? `Không có ${activeMainTab === "events" ? "sự kiện" : "học bổng"} nào phù hợp` : `No ${activeMainTab} matching`) 
                    : activeMainTab === "events" ? t('events.noEvents') : t('events.noScholarships')}
                </h3>
                <p className="text-[11px] text-gray-500 max-w-[260px] leading-relaxed mx-auto font-medium px-4">
                  {searchQuery 
                    ? (lang === 'vi' ? `Chúng mình không tìm thấy kết quả cho "${searchQuery}". Hãy thử dùng từ khóa khác hoặc điều chỉnh ngày nhé!` : `We couldn't find any results for "${searchQuery}". Try different keywords or dates!`)
                    : t('events.noEventsSub')}
                </p>
                
                {searchQuery && (
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSearchQuery("")}
                    className="mt-8 px-6 py-2.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-xl hover:bg-gray-200 transition-colors uppercase tracking-widest"
                  >
                    {lang === 'vi' ? 'Xóa tìm kiếm' : 'Clear search'}
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

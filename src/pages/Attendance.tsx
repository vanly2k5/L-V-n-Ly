import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, QrCode, CheckCircle2, Search, Filter, TrendingUp, Calendar as CalendarIcon, MapPin, Award } from "lucide-react";
import { CheckInRecord, Event } from "../types";
import { useI18n } from "../lib/i18n";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AttendanceProps {
  history: CheckInRecord[];
  onCheckIn: (record: Omit<CheckInRecord, "id">) => void;
  currentEvent: Event;
  key?: string;
}

export default function Attendance({ history, onCheckIn, currentEvent }: AttendanceProps) {
  const [status, setStatus] = useState<"ready" | "scanning" | "success">("ready");
  const [mode, setMode] = useState<"in" | "out">("in");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("All");
  const { t } = useI18n();

  const handleScan = () => {
    setStatus("scanning");
    setTimeout(() => {
      setStatus("success");
      onCheckIn({
        eventName: currentEvent.title,
        time: `${new Date().getHours()}:${new Date().getMinutes().toString().padStart(2, '0')}`,
        date: `${new Date().getDate().toString().padStart(2, '0')}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}`,
        points: mode === "in" ? currentEvent.points : 2,
        icon: mode === "in" ? currentEvent.icon : "✅",
        background: mode === "in" ? currentEvent.color + "20" : "#F0Fdf4",
        status: mode === "in" ? "Đã check-in" : "Hoàn thành",
        type: currentEvent.type,
        location: currentEvent.location
      });
    }, 2000);
  };

  const stats = useMemo(() => {
    const totalPoints = history.reduce((sum, r) => sum + r.points, 0);
    const totalEvents = history.length;
    const typeCount: Record<string, number> = {};
    history.forEach(r => {
      typeCount[r.type] = (typeCount[r.type] || 0) + 1;
    });
    const topType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
    
    return { totalPoints, totalEvents, topType };
  }, [history]);

  const chartData = useMemo(() => {
    // Group history by date (last 7 entries for simplicity)
    return history.slice(0, 7).reverse().map(r => ({
      name: r.date,
      points: r.points
    }));
  }, [history]);

  const filteredHistory = history.filter(r => {
    const matchesSearch = r.eventName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         r.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "All" || r.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="pb-24">
      <header className="dark-gradient px-6 pt-16 pb-20 text-white relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold mb-1">Smart Attendance</p>
            <h1 className="text-2xl font-bold font-sans">{t('attendance.title')}</h1>
          </div>
          <div className="bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20">
            <Award className="w-5 h-5 text-yellow-400" />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 mt-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <p className="text-[9px] text-white/50 uppercase font-bold">Tổng điểm</p>
            <p className="text-lg font-bold">{stats.totalPoints}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <p className="text-[9px] text-white/50 uppercase font-bold">Sự kiện</p>
            <p className="text-lg font-bold">{stats.totalEvents}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <p className="text-[9px] text-white/50 uppercase font-bold">Hăng hái</p>
            <p className="text-lg font-bold capitalize truncate">{stats.topType}</p>
          </div>
        </div>
      </header>

      <div className="px-6 -mt-10 relative z-20">
        <div className="bg-white rounded-[32px] p-8 shadow-xl text-center relative overflow-hidden border border-[#E3E5F8]/50">
          <div className="flex bg-gray-50 p-1.5 rounded-2xl mb-8">
            <button 
              onClick={() => { setMode("in"); if (status !== "scanning") setStatus("ready"); }}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${mode === "in" ? "bg-white text-app-primary shadow-sm" : "text-gray-400"}`}
            >
              {t('attendance.checkIn')}
            </button>
            <button 
              onClick={() => { setMode("out"); if (status !== "scanning") setStatus("ready"); }}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${mode === "out" ? "bg-white text-app-primary shadow-sm" : "text-gray-400"}`}
            >
              {t('attendance.checkOut')}
            </button>
          </div>

          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 bg-app-secondary rounded-2xl flex items-center justify-center text-2xl mb-3">
              {mode === "in" ? currentEvent.icon : "🏁"}
            </div>
            <h3 className="text-sm font-bold text-[#0D1340] leading-tight px-4">{currentEvent.title}</h3>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 text-[10px] text-gray-400 font-medium">
              <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> {currentEvent.date}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {currentEvent.location}</span>
            </div>
          </div>

          <div className="relative mx-auto w-48 h-48 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {status === "ready" && (
                <motion.div 
                  key="ready"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`w-full h-full border-2 border-dashed rounded-[32px] p-6 flex flex-col items-center justify-center gap-3 text-gray-400 transition-colors ${mode === "in" ? "border-app-primary bg-app-secondary/20" : "border-green-500 bg-green-50/20"}`}
                >
                  <QrCode className={`w-14 h-14 ${mode === "in" ? "text-app-primary" : "text-green-500"}`} />
                  <p className="text-[10px] font-bold uppercase tracking-wider">Mã đã sẵn sàng</p>
                </motion.div>
              )}

              {status === "scanning" && (
                <motion.div 
                  key="scanning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full bg-[#0D1340] rounded-[32px] relative overflow-hidden flex items-center justify-center"
                >
                  <div className="absolute inset-4 border border-white/10 rounded-2xl" />
                  <motion.div 
                    animate={{ top: ["10%", "90%", "10%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className={`absolute inset-x-6 h-1 shadow-[0_0_20px] rounded-full z-10 ${mode === "in" ? "bg-app-primary shadow-app-primary" : "bg-green-500 shadow-green-500"}`}
                  />
                  <Camera className="w-12 h-12 text-white/5" />
                  <div className="absolute bottom-6 left-0 right-0 text-[9px] text-white/50 font-bold uppercase tracking-widest animate-pulse">
                    Đang quét...
                  </div>
                </motion.div>
              )}

              {status === "success" && (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center ${mode === "in" ? "bg-app-secondary" : "bg-green-50"}`}>
                    <CheckCircle2 className={`w-10 h-10 ${mode === "in" ? "text-app-primary" : "text-green-600"}`} />
                  </div>
                  <h4 className={`text-base font-bold ${mode === "in" ? "text-app-primary" : "text-green-600"}`}>
                    {mode === "in" ? "Check-in thành công" : "Kết thúc thành công"}
                  </h4>
                  <div className="px-3 py-1 bg-gray-50 rounded-full text-[10px] text-gray-500 font-bold border border-gray-100 flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3 text-app-primary" /> +{mode === "in" ? currentEvent.points : 2} điểm
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            disabled={status === "scanning"}
            onClick={status === "success" ? () => setStatus("ready") : handleScan}
            className={`mt-10 w-full py-4 rounded-2xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2
              ${status === "success" 
                ? "bg-gray-100 text-gray-400" 
                : (mode === "in" ? "bg-app-primary text-white shadow-app-primary/30" : "bg-green-600 text-white shadow-green-600/30")}`}
          >
            {status === "success" ? "Xác nhận" : (
              <><Camera className="w-4 h-4" /> Bấm để quét</>
            )}
          </button>
        </div>
      </div>

      <div className="px-6 mt-10">
        <div className="bg-white rounded-3xl p-6 border border-[#E3E5F8] shadow-sm mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Xu hướng tham gia</h2>
            <div className="flex items-center gap-1 text-[10px] font-bold text-app-primary">
              <TrendingUp className="w-3 h-3" /> Tăng 12%
            </div>
          </div>
          <div className="h-40 w-full -ml-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5B50D6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#5B50D6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E5F8" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94A3B8' }} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="points" stroke="#5B50D6" strokeWidth={2} fillOpacity={1} fill="url(#colorPoints)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{t('attendance.history')}</h2>
            <div className="flex items-center gap-2">
              <button className="p-2 bg-white rounded-xl border border-[#E3E5F8] text-gray-400">
                <Filter className="w-4 h-4" />
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white border border-[#E3E5F8] rounded-xl text-xs focus:ring-1 focus:ring-app-primary outline-none text-[#0D1340]"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {["All", "academic", "volunteer", "sports", "social"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all border
                  ${filterType === type ? "bg-app-primary border-app-primary text-white" : "bg-white border-[#E3E5F8] text-gray-400"}`}
              >
                {type === "All" ? "Tất cả" : type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredHistory.length > 0 ? filteredHistory.map((record, idx) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                key={record.id} 
                className="bg-white rounded-2xl p-4 flex items-center justify-between border border-[#E3E5F8] shadow-sm hover:border-app-primary/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform" style={{ backgroundColor: record.background }}>
                    {record.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0D1340] leading-tight mb-1">{record.eventName}</h4>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[9px] text-gray-400 font-medium flex items-center gap-1">
                        <CalendarIcon className="w-2.5 h-2.5" /> {record.date} · {record.time}
                      </p>
                      <p className="text-[9px] text-gray-400 font-medium flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" /> {record.location}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`text-[8px] font-bold px-2 py-0.5 rounded-md tracking-wider
                    ${record.status === "Đã check-in" ? "text-app-primary bg-app-secondary" : "text-green-600 bg-green-50"}`}>
                    {record.status === "Đã check-in" ? "IN" : "OUT"}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-[#0D1340]">+{record.points}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">đ</span>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-[#E3E5F8]">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-gray-200" />
                </div>
                <p className="text-xs text-gray-400 font-medium italic">Không tìm thấy bản ghi nào</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

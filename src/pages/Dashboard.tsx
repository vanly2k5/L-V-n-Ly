import React from "react";
import { motion } from "motion/react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from "recharts";
import { TrendingUp, Award, Clock, Target, BarChart3, ChevronRight } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { CheckInRecord } from "../types";

interface DashboardProps {
  userData: {
    points: number;
    academicPoints: number;
    socialPoints: number;
    ethicsPoints: number;
  };
  history: CheckInRecord[];
  key?: string;
}

export default function Dashboard({ userData, history }: DashboardProps) {
  const { t } = useI18n();

  // Calculate dynamic attendance rate
  const attendanceRate = Math.min(90 + (history.length), 99);
  const recentPoints = history.slice(0, 3).reduce((acc, curr) => acc + curr.points, 0);

  // Dynamic Semester Trend Data
  const dynamicPointsTrendData = [
    { semester: "HK1 23-24", points: 65, attendance: 70 },
    { semester: "HK2 23-24", points: 72, attendance: 75 },
    { semester: "HK1 24-25", points: 72, attendance: 75 },
    { semester: "HK2 24-25", points: 85, attendance: 88 },
    { semester: "HK1 25-26", points: 78, attendance: 82 },
    { semester: "HK2 25-26", points: userData.points, attendance: attendanceRate },
  ];

  // Calculate monthly points from history
  const months = ["T12", "T01", "T02", "T03", "T04", "T05"];
  const dynamicMonthlyPointsData = months.map(m => {
    const monthNum = m.substring(1);
    
    const historyPoints = history
      .filter(h => {
        // Updated search for date field in CheckInRecord
        const datePart = h.date || ""; 
        return datePart.endsWith(`/${monthNum}`);
      })
      .reduce((acc, curr) => acc + curr.points, 0);
    
    const points = historyPoints || (m === "T05" ? 12 : [8, 15, 5, 20, 10, 0][months.indexOf(m)]);
    
    return {
      month: m,
      points: points,
      color: points > 15 ? "#5B50D6" : "#A5B4FC"
    };
  });

  const maxPoints = Math.max(...dynamicMonthlyPointsData.map(d => d.points), 1);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24 bg-[#F5F6FF] min-h-screen"
    >
      {/* upgraded header */}
      <header className="bg-gradient-to-br from-[#0D1340] to-[#2C2480] pt-16 pb-20 px-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-white/50 text-[10px] uppercase font-bold tracking-[0.2em] mb-1">Academic Insights</p>
          <h1 className="text-[22px] font-bold font-sora">{t('dashboard.title')}</h1>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-app-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
      </header>

      <div className="relative z-20 -mt-10">
        {/* Main Score Card */}
        <div className="mx-5 bg-white rounded-[24px] p-6 shadow-[0_8px_32px_rgba(91,80,214,0.12)] border border-[#E3E5F8] relative mb-6">
          <div className="bg-gradient-to-r from-[#FFB300] to-[#FF8F00] text-white px-3 py-1 rounded-xl text-[10px] font-bold absolute -top-3 right-5 shadow-[0_4px_12px_rgba(255,143,0,0.4)] flex items-center gap-1.5 uppercase tracking-wider">
            <Award size={12} fill="white" />
            Top 5% Sinh Viên
          </div>

          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#F1F2FF" strokeWidth="8" />
                <motion.circle 
                  cx="50" cy="50" r="42" fill="none" stroke="#5B50D6" strokeWidth="8" 
                  strokeDasharray="264" 
                  initial={{ strokeDashoffset: 264 }}
                  animate={{ strokeDashoffset: 264 - (264 * userData.points) / 100 }}
                  strokeLinecap="round"
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold font-sora text-[#0D1340] leading-none">{userData.points}</span>
                <span className="text-[9px] font-bold text-gray-400 mt-0.5">SCORE</span>
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-sm font-bold text-[#0D1340] mb-1">Thành tích xuất sắc</h3>
              <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Bạn cần thêm <span className="text-app-primary font-bold">12đ</span> nữa để đạt mục tiêu Học kỳ này.</p>
              <div className="mt-3 flex gap-2">
                <span className="bg-green-50 text-green-600 text-[9px] font-bold px-2 py-0.5 rounded-md border border-green-100 flex items-center gap-1">
                   <TrendingUp size={10} /> +3.2%
                </span>
                <span className="bg-[#EEEDFD] text-[#5B50D6] text-[9px] font-bold px-2 py-0.5 rounded-md border border-[#5B50D6]/10">
                   Tiềm năng
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 px-5 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-[#E3E5F8] flex flex-col items-center justify-center text-center shadow-[0_4px_16px_rgba(91,80,214,0.05)]">
             <div className="w-10 h-10 bg-app-secondary rounded-xl flex items-center justify-center text-xl mb-3">🎓</div>
             <p className="text-lg font-bold font-sora text-[#0D1340]">{userData.academicPoints}</p>
             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Điểm học thuật</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-[#E3E5F8] flex flex-col items-center justify-center text-center shadow-[0_4px_16px_rgba(91,80,214,0.05)]">
             <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-xl mb-3">🤝</div>
             <p className="text-lg font-bold font-sora text-[#0D1340]">{userData.socialPoints}</p>
             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Điểm xã hội</p>
          </div>
        </div>

        {/* Points Trend Section with Custom Bar Chart */}
        <div className="mx-5 bg-white rounded-[24px] p-6 shadow-sm border border-[#E3E5F8] mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-sm font-bold text-[#0D1340]">Tổng hợp điểm RL</h2>
              <p className="text-[10px] text-gray-400 font-medium">Thống kê 6 tháng gần nhất</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-sora text-app-primary">
                {dynamicMonthlyPointsData.reduce((acc, curr) => acc + curr.points, 0)}
              </span>
              <span className="bg-app-secondary px-2 py-0.5 rounded-md text-[9px] font-bold text-app-primary">ĐIỂM</span>
            </div>
          </div>

          {/* Custom CSS Bar Chart */}
          <div className="flex items-end justify-between h-[140px] px-2 mb-4 border-b border-dashed border-[#E3E5F8] pt-4">
            {dynamicMonthlyPointsData.map((d, i) => (
              <div key={i} className="flex flex-col items-center w-8 group relative">
                <div className="w-full h-24 bg-[#F1F2FF] rounded-lg relative overflow-hidden">
                   <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.points / maxPoints) * 100}%` }}
                    transition={{ duration: 1, delay: i * 0.1, ease: "circOut" }}
                    className="absolute bottom-0 w-full rounded-lg"
                    style={{ backgroundColor: d.color }}
                   />
                </div>
                <span className="text-[10px] text-gray-400 font-bold mt-2">{d.month}</span>
                <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0D1340] text-white text-[9px] px-1.5 py-0.5 rounded-md pointer-events-none">
                  {d.points}đ
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[10px] mt-4">
             <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-app-primary"></span>
                  <span className="text-gray-500 font-medium">Cao nhất</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#A5B4FC]"></span>
                  <span className="text-gray-500 font-medium">Trung bình</span>
                </div>
             </div>
             <button className="text-app-primary font-bold flex items-center gap-1 group">
               Chi tiết <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
             </button>
          </div>
        </div>

        {/* Attendance List Enhancement */}
        <div className="mx-5 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{t('attendance.history')}</h2>
            <button className="text-[10px] font-bold text-app-primary flex items-center gap-1 uppercase">Xuất PDF <ChevronRight size={10} /></button>
          </div>
          <div className="space-y-3">
             {history.slice(0, 4).map((record, i) => (
               <motion.div 
                key={record.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-4 rounded-2xl border border-[#E3E5F8] flex items-center justify-between hover:border-app-primary/30 transition-all cursor-pointer shadow-[0_2px_12px_rgba(91,80,214,0.02)]"
               >
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner shrink-0" style={{ backgroundColor: record.background }}>
                      {record.icon}
                    </div>
                    <div>
                       <h4 className="text-xs font-bold text-[#0D1340] line-clamp-1">{record.eventName}</h4>
                       <div className="flex items-center gap-2 mt-0.5">
                         <span className="text-[9px] text-gray-400 flex items-center gap-1 font-medium"><Clock size={10} /> {record.time}</span>
                         <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                         <span className="text-[9px] text-gray-400 font-medium">{record.date}</span>
                       </div>
                    </div>
                 </div>
                 <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                    <span className={`px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-wider
                      ${record.status === "Hoàn thành" ? "bg-green-50 text-green-600 border border-green-100" : "bg-app-secondary text-app-primary border border-app-primary/10"}`}>
                      {record.status === "Hoàn thành" ? "CHECK-OUT" : "CHECK-IN"}
                    </span>
                    <span className="text-[11px] font-bold text-[#0D1340]">+{record.points}đ</span>
                 </div>
               </motion.div>
             ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

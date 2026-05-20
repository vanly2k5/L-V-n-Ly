import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trash2, Calendar, Bell, ChevronRight, BookmarkCheck, AlertTriangle } from "lucide-react";
import { SavedItem, SavedItemStatus } from "../types";

interface SavedItemsProps {
  items: SavedItem[];
  onUpdateStatus: (id: string, status: SavedItemStatus) => void;
  onRemove: (id: string) => void;
  key?: string;
}

export default function SavedItems({ items, onUpdateStatus, onRemove }: SavedItemsProps) {
  const statuses: SavedItemStatus[] = ["Quan tâm", "Đã đăng ký", "Đã nộp đơn", "Hoàn thành"];

  const isUpcomingItem = (item: SavedItem) => {
    if (!item.deadline) return false;
    
    // In case the deadline status is "Còn X ngày" or similar text
    if (item.deadline.includes("ngày")) {
      const match = item.deadline.match(/(\d+)/);
      if (match) {
        const days = parseInt(match[1], 10);
        return days > 0 && days <= 7;
      }
    }
    
    // If formatted as DD/MM/YYYY or DD/MM
    if (item.deadline.includes("/")) {
      const parts = item.deadline.split("/");
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      // Handle events which are stored as DD/MM (no year), typical event dates are 16/05 etc.
      const year = parts[2] ? parseInt(parts[2], 10) : new Date().getFullYear();
      const deadlineDate = new Date(year, month, day);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      deadlineDate.setHours(0, 0, 0, 0);
      
      const diffTime = deadlineDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays >= 0 && diffDays <= 7;
    }
    
    return false;
  };

  return (
    <div className="pb-24 bg-[#F5F6FF] min-h-screen">
      <header className="dark-gradient pt-16 pb-12 px-6 text-white relative overflow-hidden z-10">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold font-sans">Sổ tay cá nhân</h1>
          <p className="text-xs text-white/60 mt-1 font-medium">Lưu trữ & theo dõi tiến độ cơ hội</p>
        </div>
      </header>

      <div className="-mt-6 relative z-25 px-6 pb-24">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 px-10 text-center bg-white rounded-[32px] py-20 border border-[#E3E5F8] shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-3xl mb-4 grayscale opacity-50">
              📑
            </div>
            <h3 className="text-sm font-bold text-gray-400">Danh sách trống</h3>
            <p className="text-[11px] text-gray-400 mt-2">Hãy lưu các sự kiện hoặc học bổng bạn quan tâm để theo dõi tại đây nhé!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {items.map((item) => {
                const isUpcomingStr = isUpcomingItem(item);
                const isOverdue = item.deadline ? item.deadline.includes("Đã qua") || item.deadline.includes("Hết hạn") : false;
                
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`bg-white rounded-2xl border overflow-hidden shadow-sm flex flex-col transition-colors ${
                      isUpcomingStr ? "border-red-200 bg-red-50/10" : "border-[#E3E5F8]"
                    }`}
                  >
                    <div className="p-4 flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl shrink-0">
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-1.5 flex-1 mr-2">
                            <h3 className="text-sm font-bold leading-tight">{item.title}</h3>
                            {isUpcomingStr && (
                              <span 
                                title="Sắp tới hạn chót (dưới 7 ngày)!"
                                className="inline-flex items-center justify-center bg-red-100 text-red-600 p-0.5 rounded-full shrink-0 animate-bounce mt-0.5 animate-duration-1000"
                              >
                                <AlertTriangle className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                          <button 
                            onClick={() => onRemove(item.id)}
                            className="p-1.5 text-gray-300 hover:text-red-500 transition-colors shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                           <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md 
                            ${item.type === 'scholarship' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                            {item.type === 'scholarship' ? 'Học bổng' : 'Sự kiện'}
                          </span>
                          {isUpcomingStr && (
                            <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-red-100 text-red-600 border border-red-200 animate-pulse">
                              🔥 Sắp diễn ra / Hạn nộp &lt; 7 ngày
                            </span>
                          )}
                          {item.deadline && (
                            <div className={`flex items-center gap-1 text-[10px] font-bold ${
                              isOverdue || isUpcomingStr
                              ? "text-red-500"
                              : "text-gray-400"
                            }`}>
                              <Calendar className="w-3 h-3" />
                              {item.deadline}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="px-4 pb-4 border-t border-gray-50 pt-3">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Trạng thái</p>
                      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                        {statuses.map((status) => (
                          <button
                            key={status}
                            onClick={() => onUpdateStatus(item.id, status)}
                            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all
                              ${item.status === status 
                                ? "bg-app-primary text-white shadow-sm" 
                                : "bg-gray-50 text-gray-400"}`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>

                    {(item.status === "Quan tâm" || item.status === "Đã đăng ký" || item.status === "Đã nộp đơn") && item.deadline && (
                      <div className={`mx-4 mb-4 p-2 rounded-xl flex items-center gap-2 border ${
                        isOverdue || isUpcomingStr
                        ? "bg-[#FDECEC] border-red-100 text-red-600" 
                        : "bg-[#FEF3DC] border-orange-100 text-orange-600"
                      }`}>
                        <Bell className={`w-3 h-3 ${isOverdue || isUpcomingStr ? "text-red-500" : "text-orange-500"}`} />
                        <span className="text-[10px] font-bold">
                          {isOverdue 
                            ? "Cảnh báo: Đã kết thúc hoặc quá hạn nộp hồ sơ!" 
                            : isUpcomingStr 
                              ? `Nhắc nhở: Sắp tới hạn chót / diễn ra (${item.type === "scholarship" ? "hãy hoàn thiện hồ sơ của bạn" : "chuẩn bị tham gia nhé"})!`
                              : "Nhắc nhở: Sắp tới hạn chót! Hãy theo dõi thông tin cập nhật."}
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

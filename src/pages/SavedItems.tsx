import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trash2, Calendar, Bell, ChevronRight, BookmarkCheck } from "lucide-react";
import { SavedItem, SavedItemStatus } from "../types";

interface SavedItemsProps {
  items: SavedItem[];
  onUpdateStatus: (id: string, status: SavedItemStatus) => void;
  onRemove: (id: string) => void;
  key?: string;
}

export default function SavedItems({ items, onUpdateStatus, onRemove }: SavedItemsProps) {
  const statuses: SavedItemStatus[] = ["Quan tâm", "Đã đăng ký", "Đã nộp đơn", "Hoàn thành"];

  return (
    <div className="pb-24 bg-[#F5F6FF] min-h-screen">
      <header className="dark-gradient pt-16 pb-12 px-6 text-white relative overflow-hidden z-10">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold font-sans">Sổ tay cá nhân</h1>
          <p className="text-xs text-white/60 mt-1 font-medium">Lưu trữ & theo dõi tiến độ cơ hội</p>
        </div>
      </header>

      <div className="-mt-6 relative z-20 px-6 pb-24">
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
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl border border-[#E3E5F8] overflow-hidden shadow-sm flex flex-col"
                >
                  <div className="p-4 flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-bold leading-tight">{item.title}</h3>
                        <button 
                          onClick={() => onRemove(item.id)}
                          className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                         <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md 
                          ${item.type === 'scholarship' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                          {item.type === 'scholarship' ? 'Học bổng' : 'Sự kiện'}
                        </span>
                        {item.deadline && (
                          <div className={`flex items-center gap-1 text-[10px] font-bold ${
                            item.deadline.includes("Đã qua") || (item.deadline.includes("ngày") && parseInt(item.deadline) <= 3)
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

                  {(item.status === "Quan tâm" || item.status === "Đã đăng ký") && item.deadline && (
                    <div className={`mx-4 mb-4 p-2 rounded-xl flex items-center gap-2 border ${
                      item.deadline.includes("Đã qua") || (item.deadline.includes("ngày") && parseInt(item.deadline) <= 3)
                      ? "bg-[#FDECEC] border-red-100 text-red-600" 
                      : "bg-[#FEF3DC] border-orange-100 text-orange-600"
                    }`}>
                      <Bell className={`w-3 h-3 ${item.deadline.includes("Đã qua") || (item.deadline.includes("ngày") && parseInt(item.deadline) <= 3) ? "text-red-500" : "text-orange-500"}`} />
                      <span className="text-[10px] font-bold">
                        {item.deadline.includes("Đã qua") ? "Cảnh báo: Đã hết hạn!" : "Nhắc nhở: Sắp tới hạn chót!"}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Search, Sparkles, X, Bookmark, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Event, Scholarship, SavedItem } from "../types";
import { useI18n } from "../lib/i18n";
import { useAuth, OperationType, handleFirestoreError } from "../lib/auth";
import { db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface HomeProps {
  userData: {
    name: string;
    major: string;
    school: string;
    subInfo: string;
    points: number;
    eventsCount: string;
    ethicsPoints: number;
  };
  onOpenAI: () => void | Promise<void>;
  onSeeAllEvents: () => void;
  onGoToDashboard: () => void;
  savedItems: SavedItem[];
  onToggleSave: (item: Omit<SavedItem, "id" | "status">) => void;
  events: Event[];
  scholarships: Scholarship[];
  key?: string;
}

export default function Home({ userData, onOpenAI, onSeeAllEvents, onGoToDashboard, savedItems, onToggleSave, events, scholarships }: HomeProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [greeting, setGreeting] = useState(t('home.welcome'));
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - 200 : scrollLeft + 200;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting(t('home.morning'));
    else if (hour >= 12 && hour < 18) setGreeting(t('home.afternoon'));
    else if (hour >= 18 && hour < 22) setGreeting(t('home.evening'));
    else setGreeting(t('home.night'));
  }, [t]);

  const isSaved = (id: string, type: "event" | "scholarship") => 
    savedItems.some(s => s.itemId === id && s.type === type);

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.organizer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredScholarships = scholarships.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasResults = filteredEvents.length > 0 || filteredScholarships.length > 0;

  return (
    <div className="pb-24">
      <header className="dark-gradient pt-16 pb-16 px-6 text-white relative overflow-hidden z-10">
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-white/60 text-xs mb-1 font-medium tracking-wide">{greeting}</p>
              <h1 className="text-2xl font-bold font-sans break-words line-clamp-2">{userData.name}</h1>
            </div>
            <motion.div 
              whileTap={{ scale: 0.95 }}
              onClick={onGoToDashboard}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-[#0D1340] text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <span>👑</span> Top {Math.max(2, Math.floor(25 - (userData.points / 10)))}%
            </motion.div>
          </div>
          
          <div className="flex gap-2.5 mt-8">
            <div className="glass-pill rounded-2xl p-4 flex-1">
              <span className="text-xl font-bold block">{userData.points}</span>
              <span className="text-[9px] text-white/50 uppercase tracking-widest font-bold">Điểm Rèn Luyện</span>
            </div>
            <div className="glass-pill rounded-2xl p-4 flex-1">
              <span className="text-xl font-bold block">{userData.eventsCount}</span>
              <span className="text-[9px] text-white/50 uppercase tracking-widest font-bold">Sự Kiện</span>
            </div>
            <div className="glass-pill rounded-2xl p-4 flex-1">
              <span className="text-xl font-bold block">{userData.ethicsPoints}</span>
              <span className="text-[9px] text-white/50 uppercase tracking-widest font-bold">Đạo Đức</span>
            </div>
          </div>
        </div>
        {/* Abstract shapes */}
        <div className="absolute top-[-40px] right-[-40px] w-48 h-48 rounded-full bg-white/5" />
      </header>

      <div className="px-6 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl border border-[#E3E5F8] p-3 shadow-lg flex items-center gap-3">
          <Search className="text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder={t('home.searchPlaceholder')} 
            className="flex-1 bg-transparent outline-none text-sm font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearchQuery("")}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {!searchQuery ? (
        <>
          <section className="mt-8 px-6">
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={onOpenAI}
              className="w-full dark-gradient rounded-2xl p-4 flex items-center gap-4 text-left border border-white/10 group"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl group-hover:bg-white/20 transition-colors">
                ✨
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                  {t('home.aiSuggest')} <Sparkles className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                </h3>
                <p className="text-white/50 text-[11px] mt-0.5">{t('home.aiSuggestSub')}</p>
              </div>
              <span className="text-white/40 text-xl">›</span>
            </motion.button>
          </section>

          <section className="mt-8">
            <div className="px-6 flex justify-between items-end mb-4">
              <div>
                <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{t('home.featuredEvents')}</h2>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => scroll('left')}
                    className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => scroll('right')}
                    className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <button 
                onClick={onSeeAllEvents}
                className="text-xs font-semibold text-app-primary underline decoration-app-primary/30 underline-offset-4"
              >
                {t('home.seeAll')}
              </button>
            </div>
            
            <div 
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto px-6 no-scrollbar pb-2 scroll-smooth"
            >
              {events.map((event) => (
                <motion.div 
                  key={event.id}
                  layout
                  whileTap={{ scale: 0.97 }}
                  className="min-w-[240px] bg-white rounded-2xl border border-[#E3E5F8] overflow-hidden shadow-sm relative group"
                >
                  <div className="h-28 flex items-center justify-center text-4xl relative" style={{ backgroundColor: event.color + '20' }}>
                    {event.icon}
                    <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                      {event.badge}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSave({ itemId: event.id, type: "event", title: event.title, icon: event.icon });
                      }}
                      className={`absolute top-3 right-3 p-1.5 rounded-lg backdrop-blur-md transition-all ${
                        isSaved(event.id, "event") ? "bg-app-primary text-white" : "bg-white/20 text-white hover:bg-white/40"
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved(event.id, "event") ? "fill-white" : ""}`} />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-bold leading-tight">{event.title}</h3>
                    <p className="text-[11px] text-app-primary font-semibold mt-1">{event.organizer}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-[11px] text-gray-500 font-medium">📅 {event.date} · {event.time}</span>
                      <span className="text-[10px] font-bold text-app-primary bg-app-secondary px-2 py-1 rounded-lg">+{event.points}đ</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="mt-8 px-6">
            <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">{t('home.deadlineScholarships')}</h2>
            <div className="space-y-3">
              {scholarships.map((s) => (
                <motion.div 
                  key={s.id}
                  layout
                  whileTap={{ scale: 0.98 }}
                  className="bg-white rounded-2xl border border-[#E3E5F8] p-4 flex gap-4 items-center shadow-sm relative"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: s.bgColor }}>
                    {s.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start pr-8">
                      <h3 className="text-sm font-bold">{s.name}</h3>
                      <span className="text-[11px] font-bold text-red-500">⏰ {s.deadline}</span>
                    </div>
                    <p className="text-xs font-semibold text-[#1DB882] mt-0.5">{s.value}</p>
                    <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${s.progress}%` }}
                        className="h-full bg-gradient-to-r from-[#1DB882] to-[#5B50D6]"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={(e_stop) => {
                      e_stop.stopPropagation();
                      onToggleSave({ itemId: s.id, type: "scholarship", title: s.name, icon: s.icon, deadline: s.deadline });
                    }}
                    className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors ${
                      isSaved(s.id, "scholarship") ? "bg-app-secondary text-app-primary" : "text-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved(s.id, "scholarship") ? "fill-app-primary" : ""}`} />
                  </button>
                </motion.div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <div className="px-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              {t('home.searchResult')} ({filteredEvents.length + filteredScholarships.length})
            </h2>
            <button 
              onClick={() => setSearchQuery("")}
              className="text-[10px] font-bold text-app-primary uppercase tracking-wider"
            >
              {t('home.clearFilter')}
            </button>
          </div>

          {!hasResults ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 text-center"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-[20px] flex items-center justify-center mx-auto mb-4 text-2xl">
                🔎
              </div>
              <h3 className="text-sm font-bold text-[#0D1340]">{t('home.noResults')}</h3>
              <p className="text-[10px] text-gray-400 mt-1 font-medium max-w-[200px] mx-auto">
                {t('home.noResultsSub')}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {filteredEvents.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-3">{t('home.events')} ({filteredEvents.length})</h3>
                  <div className="space-y-3">
                    {filteredEvents.map(event => (
                      <motion.div 
                        key={event.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-2xl border border-[#E3E5F8] p-3 flex gap-3 items-center"
                      >
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: event.color + '15' }}>
                          {event.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold truncate">{event.title}</h4>
                          <p className="text-[10px] text-gray-400 font-medium">{event.organizer}</p>
                        </div>
                        <button 
                          onClick={() => onToggleSave({ itemId: event.id, type: "event", title: event.title, icon: event.icon })}
                          className={`p-2 rounded-lg ${isSaved(event.id, "event") ? "text-app-primary bg-app-secondary" : "text-gray-300"}`}
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved(event.id, "event") ? "fill-app-primary" : ""}`} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {filteredScholarships.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-3">{t('home.scholarships')} ({filteredScholarships.length})</h3>
                  <div className="space-y-3">
                    {filteredScholarships.map(s => (
                      <motion.div 
                        key={s.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-2xl border border-[#E3E5F8] p-3 flex gap-3 items-center"
                      >
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: s.bgColor }}>
                          {s.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold truncate">{s.name}</h4>
                          <p className="text-[10px] text-[#1DB882] font-bold">{s.value}</p>
                        </div>
                        <button 
                          onClick={() => onToggleSave({ itemId: s.id, type: "scholarship", title: s.name, icon: s.icon, deadline: s.deadline })}
                          className={`p-2 rounded-lg ${isSaved(s.id, "scholarship") ? "text-app-primary bg-app-secondary" : "text-gray-300"}`}
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved(s.id, "scholarship") ? "fill-app-primary" : ""}`} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

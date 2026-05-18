import React, { useState, useEffect } from "react";
import { LogOut, FileText, ChevronRight, Award, X, ZoomIn, ZoomOut, Download, ChevronDown, Globe } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useI18n } from "../lib/i18n";
import { auth as firebaseAuth, db } from "../lib/firebase";
import { useAuth, OperationType, handleFirestoreError } from "../lib/auth";
import { signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { applyTheme, AppTheme, DEFAULT_THEME, getSecondaryFromPrimary } from "../lib/theme";
import { Palette } from "lucide-react";

interface ProfileProps {
  initialData: any;
  onUpdate: (data: any) => void;
  key?: string;
}

const PRESET_COLORS = [
  { name: "Default Blue", hex: "#5B50D6" },
  { name: "Emerald Forest", hex: "#0E6B52" },
  { name: "Sunset Orange", hex: "#F38D2C" },
  { name: "Crimson Energy", hex: "#D6336C" },
  { name: "Deep Navy", hex: "#1A1F6A" },
  { name: "Cyber Purple", hex: "#7B61FF" },
];

const SCHOOLS = [
  { id: "QHI", name: "Trường ĐH Công nghệ", full: "Trường Đại học Công nghệ - ĐHQGHN" },
  { id: "QHE", name: "Trường ĐH Kinh tế", full: "Trường Đại học Kinh tế - ĐHQGHN" },
  { id: "QHN", name: "Trường ĐH Ngoại ngữ", full: "Trường Đại học Ngoại ngữ - ĐHQGHN" },
  { id: "QHT", name: "Trường ĐH KHTN", full: "Trường Đại học Khoa học Tự nhiên - ĐHQGHN" },
  { id: "QHX", name: "Trường ĐH KHXH&NV", full: "Trường Đại học Khoa học Xã hội và Nhân văn - ĐHQGHN" },
  { id: "QHS", name: "Trường ĐH Giáo dục", full: "Trường Đại học Giáo dục - ĐHQGHN" },
  { id: "QHY", name: "Trường ĐH Y Dược", full: "Trường Đại học Y Dược - ĐHQGHN" },
  { id: "QHL", name: "Trường ĐH Luật", full: "Trường Đại học Luật - ĐHQGHN" },
  { id: "QHQ", name: "Trường Quốc tế", full: "Trường Quốc tế - ĐHQGHN" },
  { id: "QHV", name: "Trường ĐH Việt Nhật", full: "Trường Đại học Việt Nhật - ĐHQGHN" },
  { id: "QHD", name: "Khoa Các khoa học liên ngành", full: "Khoa Các khoa học liên ngành - ĐHQGHN" },
  { id: "QHG", name: "Trường Quản trị và Kinh doanh", full: "Trường Quản trị và Kinh doanh - ĐHQGHN" },
];

export default function Profile({ initialData, onUpdate }: ProfileProps) {
  const { t, lang, setLang } = useI18n();
  const { user } = useAuth();
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  
  const [userData, setUserData] = useState(initialData);
  const [editValues, setEditValues] = useState(initialData);
  const [touchDistance, setTouchDistance] = useState<number | null>(null);
  const [initialTouchZoom, setInitialTouchZoom] = useState<number>(1);

  useEffect(() => {
    setUserData(initialData);
    setEditValues(initialData);
  }, [initialData]);

  const stats = [
    { value: userData.major, label: t('profile.major'), key: "major" },
    { value: userData.school, label: t('profile.schoolCode'), key: "school" },
    { value: userData.points, label: "DRL", key: "points" },
    { value: userData.ethicsPoints, label: "Đạo đức", key: "ethicsPoints" },
    { value: userData.eventsCount, label: "Sự kiện", key: "eventsCount" },
  ];

  const handleUpdateTheme = async (newTheme: AppTheme) => {
    if (!user) return;
    const updatedWithTheme = { ...userData, theme: newTheme };
    setUserData(updatedWithTheme);
    onUpdate(updatedWithTheme);
    applyTheme(newTheme);
    
    try {
      await updateDoc(doc(db, "users", user.uid), {
        theme: newTheme,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.warn("Error saving theme:", error);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    // If school ID was changed but subInfo wasn't manually updated to match, update subInfo
    const selectedSchool = SCHOOLS.find(s => s.id === editValues.school);
    let finalSubInfo = editValues.subInfo;
    
    // Auto-update subInfo if it was the default format
    if (selectedSchool && (!userData.school || editValues.school !== userData.school)) {
      finalSubInfo = `${selectedSchool.name} · ĐHQGHN`;
    }

    const updatedValues = {
      ...editValues,
      subInfo: finalSubInfo
    };

    const docRef = doc(db, "users", user.uid);
    try {
      await setDoc(docRef, {
        ...updatedValues,
        updatedAt: serverTimestamp()
      });
      setUserData(updatedValues);
      onUpdate(updatedValues);
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(firebaseAuth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      setTouchDistance(dist);
      setInitialTouchZoom(zoom);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchDistance !== null) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      const scale = dist / touchDistance;
      const newZoom = Math.min(2, Math.max(0.5, initialTouchZoom * scale));
      setZoom(newZoom);
    }
  };

  const handleTouchEnd = () => {
    setTouchDistance(null);
  };

  const handleDownload = () => {
    // Simulate download
    const link = document.createElement('a');
    link.href = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
    link.download = "minh_chung_ren_luyen.pdf";
    link.target = "_blank";
    link.click();
  };

  return (
    <div className="pb-24">
      <header className="dark-gradient px-6 pt-16 pb-16 text-white text-center relative z-10">
        <div className="w-24 h-24 mx-auto rounded-[32px] bg-gradient-to-br from-[#5B50D6] to-[#1DB882] flex items-center justify-center text-3xl font-bold shadow-2xl relative z-10 border-4 border-white/10 uppercase">
          {userData.name.split(' ').map((n: string) => n[0]).join('')}
        </div>
        
        {isEditing ? (
          <div className="mt-8 space-y-4 px-6 relative z-10 w-full max-w-xs mx-auto">
            <div className="space-y-1.5">
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold block text-left ml-1">{t('profile.fullName')}</label>
              <input 
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-sm text-center outline-none focus:bg-white/20 focus:border-white/40 transition-all placeholder:text-white/20"
                value={editValues.name}
                onChange={(e) => setEditValues({...editValues, name: e.target.value})}
                placeholder={t('profile.fullName')}
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold block text-left ml-1">{t('profile.school')}</label>
              <div className="relative group/select">
                <select 
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-[11px] text-center outline-none focus:bg-white/20 focus:border-white/40 appearance-none transition-all cursor-pointer"
                  value={editValues.school}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const school = SCHOOLS.find(s => s.id === selectedId);
                    if (school) {
                      setEditValues({
                        ...editValues, 
                        school: selectedId,
                        subInfo: `${school.name} · ĐHQGHN`
                      });
                    }
                  }}
                >
                  {SCHOOLS.map(option => (
                    <option key={option.id} value={option.id} className="text-[#0D1340]">
                      {option.full}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30 group-hover/select:text-white/50 transition-colors">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold block text-left ml-1">{t('profile.extraInfo')}</label>
              <input 
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-sm text-center outline-none focus:bg-white/20 focus:border-white/40 transition-all placeholder:text-white/20"
                value={editValues.subInfo}
                onChange={(e) => setEditValues({...editValues, subInfo: e.target.value})}
                placeholder={t('profile.extraInfo')}
              />
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold mt-4 font-sans relative z-10">{userData.name}</h1>
            <p className="text-white/50 text-xs mt-1 font-medium relative z-10">{userData.subInfo}</p>
          </>
        )}
        
        <div className="flex justify-center flex-wrap gap-x-10 gap-y-6 mt-8 relative z-10">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              {isEditing ? (
                s.key === "school" ? (
                  <div className="relative group/mini-select">
                    <select 
                      className="w-20 bg-white/10 border border-white/20 rounded-xl px-2 py-1.5 text-[10px] text-center outline-none appearance-none focus:bg-white/20 transition-all font-bold"
                      value={editValues.school}
                      onChange={(e) => setEditValues({...editValues, school: e.target.value})}
                    >
                      {SCHOOLS.map(option => (
                        <option key={option.id} value={option.id} className="text-black">
                          {option.id}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <input 
                    className="w-20 bg-white/10 border border-white/20 rounded-xl px-2 py-1.5 text-[10px] text-center outline-none focus:bg-white/20 transition-all font-bold placeholder:text-white/20"
                    value={editValues[s.key as keyof typeof editValues]}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (s.key === "points" || s.key === "ethicsPoints") {
                         setEditValues({...editValues, [s.key]: parseInt(val) || 0});
                      } else {
                         setEditValues({...editValues, [s.key]: val});
                      }
                    }}
                    placeholder={s.label}
                  />
                )
              ) : (
                <div className="text-base font-bold">{s.value}</div>
              )}
              <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center gap-3 relative z-10">
          {isEditing ? (
            <>
              <button 
                onClick={handleSave}
                className="px-6 py-2 bg-[#1DB882] text-white text-xs font-bold rounded-xl shadow-lg"
              >
                {t('profile.saveChanges')}
              </button>
              <button 
                onClick={() => {
                  setEditValues(userData);
                  setIsEditing(false);
                }}
                className="px-6 py-2 bg-white/10 text-white text-xs font-bold rounded-xl border border-white/20"
              >
                {t('common.cancel')}
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-colors"
            >
              {t('profile.editProfile')}
            </button>
          )}
        </div>
      </header>

      <div className="px-6 -mt-8 relative z-20">
        <div className="bg-white rounded-[28px] p-6 shadow-xl border border-[#E3E5F8] flex items-center gap-6">
          <div className="relative w-20 h-20 shrink-0">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#F1F2FF" strokeWidth="10" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="#1DB882" strokeWidth="10" 
                strokeDasharray="264" strokeDashoffset={264 - (264 * Math.min(100, userData.points)) / 100} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center font-sans">
              <span className="text-xl font-bold text-[#0D1340]">{userData.points}</span>
              <span className="text-[8px] text-gray-400 font-bold uppercase">/100</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[#F0A030]">
                {userData.points >= 90 ? "Xuất sắc" : userData.points >= 80 ? "Tốt" : userData.points >= 65 ? "Khá" : "Trung bình"}
              </h3>
              <Award className="w-4 h-4 text-[#F0A030]" />
            </div>
            <p className="text-[11px] text-gray-500 font-medium">Học kỳ 2 · 2024–2025</p>
            
            <div className="flex gap-4 mt-4">
              <div className="text-center">
                <div className="text-xs font-bold text-[#5B50D6]">{userData.academicPoints}</div>
                <p className="text-[8px] text-gray-400 uppercase font-bold">Học thuật</p>
              </div>
              <div className="text-center border-l border-gray-100 pl-4">
                <div className="text-xs font-bold text-[#5B50D6]">{userData.socialPoints}</div>
                <p className="text-[8px] text-gray-400 uppercase font-bold">HĐ XH</p>
              </div>
              <div className="text-center border-l border-gray-100 pl-4">
                <div className="text-xs font-bold text-[#5B50D6]">{userData.ethicsPoints}</div>
                <p className="text-[8px] text-gray-400 uppercase font-bold">Đạo đức</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 mt-8 space-y-3">
        <div className="bg-white border border-[#E3E5F8] p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
              <Globe className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold">{lang === 'vi' ? 'Tiếng Việt' : 'English'}</h4>
              <p className="text-[10px] text-gray-500 font-medium">Language / Ngôn ngữ</p>
            </div>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setLang('vi')}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${lang === 'vi' ? 'bg-white text-[#5B50D6] shadow-sm' : 'text-gray-400'}`}
            >
              VI
            </button>
            <button 
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${lang === 'en' ? 'bg-white text-[#5B50D6] shadow-sm' : 'text-gray-400'}`}
            >
              EN
            </button>
          </div>
        </div>

        <div className="w-full bg-white border border-[#E3E5F8] p-4 rounded-2xl flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-app-secondary flex items-center justify-center text-app-primary">
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold">{t('profile.pdfTitle')}</h4>
              <p className="text-[10px] text-gray-500 font-medium mt-0.5">{t('profile.pdfSub')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsPDFModalOpen(true)}
              className="px-4 py-2 bg-app-secondary text-app-primary text-[10px] font-bold rounded-xl shadow-sm hover:opacity-90 transition-opacity"
            >
              {t('profile.viewPdf')}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              className="p-2 bg-app-primary text-white rounded-xl shadow-sm hover:opacity-90 transition-opacity"
              title={t('common.download')}
            >
              <Download className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Theme Customization Section */}
        <div className="bg-white border border-[#E3E5F8] p-5 rounded-3xl space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-app-secondary flex items-center justify-center text-app-primary">
              <Palette className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold">{t('profile.themeTitle')}</h4>
              <p className="text-[10px] text-gray-500 font-medium">{t('profile.themeSub')}</p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">{t('profile.primaryColor')}</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color.hex}
                    onClick={() => handleUpdateTheme({
                      ...userData.theme,
                      primary: color.hex,
                      secondary: getSecondaryFromPrimary(color.hex)
                    })}
                    className={`w-10 h-10 rounded-xl border-2 transition-all ${
                      userData.theme.primary === color.hex ? "border-app-primary scale-110 shadow-lg" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">{t('profile.bgColor')}</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={userData.theme.background}
                    onChange={(e) => handleUpdateTheme({ ...userData.theme, background: e.target.value })}
                    className="w-10 h-10 rounded-lg overflow-hidden cursor-pointer bg-transparent border-none"
                  />
                  <span className="text-[10px] font-mono font-bold text-gray-500 uppercase">{userData.theme.background}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">{t('profile.textColor')}</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={userData.theme.text}
                    onChange={(e) => handleUpdateTheme({ ...userData.theme, text: e.target.value })}
                    className="w-10 h-10 rounded-lg overflow-hidden cursor-pointer bg-transparent border-none"
                  />
                  <span className="text-[10px] font-mono font-bold text-gray-500 uppercase">{userData.theme.text}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <motion.button 
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full bg-[#FDECEC] border border-red-100 text-red-500 p-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm"
        >
          <LogOut className="w-4 h-4" /> {t('profile.logout')}
        </motion.button>
      </div>

      <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-10">
        CampusHub v1.0 · ĐHQGHN 2025
      </p>

      {/* PDF Preview Modal */}
      <AnimatePresence>
        {isPDFModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPDFModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] overflow-hidden flex flex-col shadow-2xl h-[80vh]"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                <div>
                  <h3 className="text-sm font-bold text-app-text">{t('profile.pdfPreview')}</h3>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">minh_chung_2025.pdf</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-gray-50 rounded-xl p-1 mr-2 border border-gray-100">
                    <button 
                      onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
                      className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                      title={t('common.zoomOut')}
                    >
                      <ZoomOut className="w-4 h-4 text-gray-500" />
                    </button>
                    <span className="text-[10px] font-bold text-gray-500 w-10 text-center font-mono">{Math.round(zoom * 100)}%</span>
                    <button 
                      onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}
                      className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                      title={t('common.zoomIn')}
                    >
                      <ZoomIn className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  <button 
                    onClick={handleDownload}
                    className="p-2 bg-app-primary text-white rounded-xl shadow-md shadow-app-primary/20 hover:scale-105 transition-transform"
                    title={t('common.download')}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setIsPDFModalOpen(false)}
                    className="p-2 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-colors ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div 
                className="flex-1 bg-gray-100 overflow-auto p-4 flex justify-center items-start no-scrollbar touch-none"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <motion.div 
                  initial={false}
                  animate={{ scale: zoom }}
                  style={{ transformOrigin: 'center top' }}
                  className="w-full shadow-lg bg-white min-h-full transition-transform duration-200 origin-top"
                >
                  <div className="relative w-full shadow-lg bg-white min-h-full transition-transform duration-200 origin-top flex flex-col">
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center opacity-0 hover:opacity-100 transition-opacity z-0 pointer-events-none">
                      <FileText className="w-12 h-12 text-gray-200 mb-3" />
                      <p className="text-xs text-gray-400 font-medium mb-4">{lang === 'vi' ? 'Nếu không xem được bản xem trước, vui lòng tải xuống tệp trực tiếp.' : 'If you cannot see the preview, please download the file directly.'}</p>
                      <button 
                        onClick={handleDownload}
                        className="px-6 py-2 bg-app-primary text-white text-xs font-bold rounded-xl pointer-events-auto"
                      >
                        {t('common.download')}
                      </button>
                    </div>
                    <iframe 
                      src="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf#toolbar=0&navpanes=0&scrollbar=0"
                      className="w-full h-[150vh] border-none pointer-events-none relative z-10 bg-white"
                      title="PDF Preview"
                      onLoad={(e) => {
                        // Some basic attempt to check if iframe is reachable
                        console.log("PDF Iframe loaded");
                      }}
                    />
                  </div>
                </motion.div>
              </div>

              <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                <span>{t('common.page')} 1 / 1</span>
                <span>{t('profile.pdfSecure')}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

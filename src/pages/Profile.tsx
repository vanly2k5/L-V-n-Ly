import React, { useState, useEffect } from "react";
import { LogOut, FileText, ChevronRight, Award, X, ZoomIn, ZoomOut, Download, ChevronDown, Globe, Shield, KeyRound, Trash2, CheckCircle2, AlertTriangle, Palette, Eye, EyeOff, Lock, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useI18n } from "../lib/i18n";
import { auth as firebaseAuth, db } from "../lib/firebase";
import { useAuth, OperationType, handleFirestoreError } from "../lib/auth";
import { signOut, sendPasswordResetEmail, deleteUser, sendEmailVerification, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, deleteDoc } from "firebase/firestore";
import { applyTheme, AppTheme, DEFAULT_THEME, getSecondaryFromPrimary } from "../lib/theme";
import { generateAttendancePDF } from "../lib/pdfGenerator";
import { CheckInRecord } from "../types";

interface ProfileProps {
  initialData: any;
  history: CheckInRecord[];
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

export default function Profile({ initialData, history, onUpdate }: ProfileProps) {
  const { t, lang, setLang } = useI18n();
  const { user } = useAuth();
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  
  const [userData, setUserData] = useState(initialData);
  const [editValues, setEditValues] = useState(initialData);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [touchDistance, setTouchDistance] = useState<number | null>(null);
  const [initialTouchZoom, setInitialTouchZoom] = useState<number>(1);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password Management States
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);

  const textMap = {
    vi: {
      accountManagement: "Quản lý Tài khoản",
      accountSub: "Bảo mật & Thiết lập tài khoản sinh viên",
      userEmail: "Địa chỉ Email",
      userId: "Mã định danh UID",
      emailUnverified: "Chưa xác minh",
      emailVerified: "Đã xác minh",
      sendVerification: "Gửi link xác minh",
      verificationSent: "Đã gửi email xác minh!",
      resetPassword: "Đổi mật khẩu",
      resetPasswordSub: "Nhận liên kết đổi mật khẩu qua email",
      resetPasswordBtn: "Gửi Email đặt lại mật khẩu",
      resetPasswordSent: "Yêu cầu đặt lại mật khẩu thành công! Hãy kiểm tra hòm thư của bạn.",
      deleteAccount: "Xóa vĩnh viễn tài khoản",
      deleteAccountSub: "Hành động này không thể hoàn tác!",
      deleteAccountBtn: "Xóa tài khoản",
      deleteModalTitle: "Xác nhận xóa tài khoản",
      deleteModalSub: "Nhập chữ 'XOA' vào ô trống bên dưới để xác nhận xóa vĩnh viễn tài khoản và toàn bộ dữ liệu minh chứng của bạn.",
      deletePlaceholder: "Nhập 'XOA' để tiếp tục",
      deleteConfirm: "Xác nhận xóa",
      deleteErrorRecent: "Vì lý do bảo mật, bạn cần đăng xuất và đăng ký/đăng nhập lại mới có thể xóa tài khoản.",
      
      // Password management translations
      managePassword: "Quản lý mật khẩu",
      passwordTitle: "Quản lý Mật khẩu",
      passwordSub: "Cập nhật mật khẩu tài khoản sinh viên",
      googleUserDisclaimer: "Tài khoản của bạn hiện đang liên kết và đăng nhập bằng Google SSO. Mật khẩu được bảo mật hoàn toàn bởi Google.",
      currentPassword: "Mật khẩu hiện tại",
      newPassword: "Mật khẩu mới",
      confirmNewPassword: "Xác nhận mật khẩu mới",
      passwordStrength: "Độ mạnh mật khẩu",
      passwordMismatch: "Mật khẩu xác nhận không khớp.",
      passwordSuccess: "Đổi mật khẩu thành công!",
      passwordMinLength: "Mật khẩu mới phải có tối thiểu 6 ký tự.",
      passwordTooShort: "Quá ngắn",
      passwordWeak: "Còn yếu",
      passwordMedium: "Trung bình",
      passwordStrong: "Mạnh",
      updatePasswordBtn: "Cập nhật mật khẩu",
      orSendResetEmail: "Sử dụng email đặt lại mật khẩu",
      currentPasswordPlaceholder: "Nhập mật khẩu hiện tại của bạn",
      newPasswordPlaceholder: "Nhập mật khẩu mới (tối thiểu 6 ký tự)",
      confirmPasswordPlaceholder: "Nhập lại mật khẩu mới",
      securitySettings: "Thiết lập bảo mật"
    },
    en: {
      accountManagement: "Account Settings",
      accountSub: "Security & student account settings",
      userEmail: "Email Address",
      userId: "User ID (UID)",
      emailUnverified: "Unverified",
      emailVerified: "Verified",
      sendVerification: "Send verification link",
      verificationSent: "Verification email sent!",
      resetPassword: "Change Password",
      resetPasswordSub: "Get a password reset link via email",
      resetPasswordBtn: "Send Password Reset Email",
      resetPasswordSent: "Password reset link sent! Please check your inbox.",
      deleteAccount: "Permanently Delete Account",
      deleteAccountSub: "This action cannot be undone!",
      deleteAccountBtn: "Delete Account",
      deleteModalTitle: "Confirm Account Deletion",
      deleteModalSub: "Please type 'DELETE' in the input field below to confirm permanently deleting your account and all records.",
      deletePlaceholder: "Type 'DELETE' to confirm",
      deleteConfirm: "Confirm Delete",
      deleteErrorRecent: "For security reasons, you must log out and sign back in to delete your account.",

      // Password management translations
      managePassword: "Manage Password",
      passwordTitle: "Password Settings",
      passwordSub: "Update your student account password",
      googleUserDisclaimer: "Your account is linked with Google SSO. Passwords are securely managed directly via Google settings.",
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmNewPassword: "Confirm New Password",
      passwordStrength: "Password strength",
      passwordMismatch: "Confirm password does not match.",
      passwordSuccess: "Password updated successfully!",
      passwordMinLength: "New password must be at least 6 characters.",
      passwordTooShort: "Too short",
      passwordWeak: "Weak",
      passwordMedium: "Medium",
      passwordStrong: "Strong",
      updatePasswordBtn: "Update Password",
      orSendResetEmail: "Send password reset email",
      currentPasswordPlaceholder: "Enter your current password",
      newPasswordPlaceholder: "Enter brand new password (min 6 chars)",
      confirmPasswordPlaceholder: "Retype new password",
      securitySettings: "Security Settings"
    }
  };

  const currentTexts = lang === "vi" ? textMap.vi : textMap.en;

  const resetPwdFields = () => {
    setCurrentPwd("");
    setNewPwd("");
    setConfirmPwd("");
    setShowCurrentPwd(false);
    setShowNewPwd(false);
    setShowConfirmPwd(false);
    setPwdSuccess(null);
    setPwdError(null);
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "", color: "bg-gray-200" };
    if (pwd.length < 6) return { score: 1, label: currentTexts.passwordTooShort, color: "bg-red-500", width: "w-1/4" };
    
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    
    if (strength <= 1) return { score: 2, label: currentTexts.passwordWeak, color: "bg-orange-500", width: "w-2/4" };
    if (strength === 2 || strength === 3) return { score: 3, label: currentTexts.passwordMedium, color: "bg-yellow-500", width: "w-3/4" };
    return { score: 4, label: currentTexts.passwordStrong, color: "bg-green-500", width: "w-full" };
  };

  const handleDirectPasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setPwdSuccess(null);
    setPwdError(null);

    if (!currentPwd || !newPwd || !confirmPwd) {
      setPwdError(lang === "vi" ? "Vui lòng điền đầy đủ tất cả các trường." : "Please fill in all fields.");
      return;
    }

    if (newPwd.length < 6) {
      setPwdError(currentTexts.passwordMinLength);
      return;
    }

    if (newPwd !== confirmPwd) {
      setPwdError(currentTexts.passwordMismatch);
      return;
    }

    setPwdLoading(true);
    try {
      if (user.email) {
        const credential = EmailAuthProvider.credential(user.email, currentPwd);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPwd);
        setPwdSuccess(currentTexts.passwordSuccess);
        
        // Reset inputs on success except keeping the success message
        setCurrentPwd("");
        setNewPwd("");
        setConfirmPwd("");
      } else {
        setPwdError(lang === "vi" ? "Email không khả dụng." : "Email not available.");
      }
    } catch (err: any) {
      console.error("Password direct update error:", err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        setPwdError(lang === "vi" ? "Mật khẩu hiện tại không chính xác." : "Current password is incorrect.");
      } else if (err.code === "auth/requires-recent-login") {
        setPwdError(currentTexts.deleteErrorRecent);
      } else {
        setPwdError(err.message || (lang === "vi" ? "Không thể cập nhật mật khẩu." : "Could not update password."));
      }
    } finally {
      setPwdLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user || !user.email) return;
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      await sendPasswordResetEmail(firebaseAuth, user.email);
      setSuccessMessage(currentTexts.resetPasswordSent);
    } catch (err: any) {
      setErrorMessage(err.message || "Không thể gửi email đặt lại mật khẩu.");
    }
  };

  const handleSendVerification = async () => {
    if (!user) return;
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      await sendEmailVerification(user);
      setSuccessMessage(currentTexts.verificationSent);
    } catch (err: any) {
      setErrorMessage(err.message || "Không thể gửi email xác minh.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setSuccessMessage(null);
    setErrorMessage(null);
    
    const expectedWord = lang === "vi" ? "XOA" : "DELETE";
    if (deleteInput.trim().toUpperCase() !== expectedWord) {
      setErrorMessage(lang === "vi" ? "Từ khóa xác nhận không khớp." : "Confirmation keyword does not match.");
      return;
    }

    try {
      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(user);
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      console.error("Account Deletion Error:", err);
      if (err.code === "auth/requires-recent-login") {
        setErrorMessage(currentTexts.deleteErrorRecent);
      } else {
        setErrorMessage(err.message || "Lỗi khi xóa tài khoản.");
      }
    }
  };

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
    generateAttendancePDF(userData, history);
  };

  const handleOpenPDF = () => {
    const url = generateAttendancePDF({ ...userData, returnUrl: true }, history);
    setPdfUrl(url as string);
    setIsPDFModalOpen(true);
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
            <p className="text-[11px] text-gray-500 font-medium">Học kỳ 2 · 2025–2026</p>
            
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
              onClick={handleDownload}
              className="px-4 py-2 bg-app-primary text-white text-[10px] font-bold rounded-xl shadow-sm hover:opacity-90 transition-opacity flex items-center gap-1"
            >
              <Download size={12} />
              {t('attendance.exportPdf') || "Xuất PDF"}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenPDF}
              className="p-2 bg-app-secondary text-app-primary rounded-xl shadow-sm hover:opacity-90 transition-opacity"
              title={t('profile.viewPdf')}
            >
              <FileText size={14} />
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
        
        {/* Account Management Section */}
        <div className="bg-white border border-[#E3E5F8] p-5 rounded-3xl space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-app-secondary flex items-center justify-center text-app-primary">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-left flex-1">
              <h4 className="text-sm font-bold">{currentTexts.accountManagement}</h4>
              <p className="text-[10px] text-gray-500 font-medium">{currentTexts.accountSub}</p>
            </div>
          </div>

          <div className="divide-y divide-gray-100 text-left pt-2 space-y-3.5">
            {/* User details */}
            <div className="pt-2 space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{currentTexts.userEmail}</span>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-800 break-all">{user?.email || "N/A"}</span>
                {user?.emailVerified ? (
                  <span className="shrink-0 flex items-center gap-1 text-[9px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> {currentTexts.emailVerified}
                  </span>
                ) : (
                  <div className="shrink-0 flex items-center gap-1.5 font-sans">
                    <span className="text-[9px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-bold">
                      {currentTexts.emailUnverified}
                    </span>
                    <button
                      onClick={handleSendVerification}
                      className="text-[9px] text-app-primary hover:underline font-bold"
                    >
                      {currentTexts.sendVerification}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Change Password option */}
            <div className="pt-3.5 flex items-center justify-between gap-4">
              <div className="flex-1">
                <h5 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-gray-400" />
                  {currentTexts.managePassword}
                </h5>
                <p className="text-[9px] text-gray-400 font-medium mt-0.5">{currentTexts.passwordSub}</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  resetPwdFields();
                  setIsPasswordModalOpen(true);
                }}
                className="px-3 py-1.5 bg-app-secondary hover:bg-opacity-95 text-app-primary text-[10px] font-bold rounded-xl shadow-sm transition-all shrink-0"
              >
                {lang === 'vi' ? 'Thiết lập' : 'Configure'}
              </motion.button>
            </div>

            {/* Permanent Account Deletion Option */}
            <div className="pt-3.5 flex items-center justify-between gap-4">
              <div className="flex-1">
                <h5 className="text-xs font-bold text-red-600 flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  {currentTexts.deleteAccount}
                </h5>
                <p className="text-[9px] text-red-400 font-medium mt-0.5">{currentTexts.deleteAccountSub}</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setDeleteInput("");
                  setIsDeleteModalOpen(true);
                }}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold rounded-xl transition-all shrink-0"
              >
                {currentTexts.deleteAccountBtn}
              </motion.button>
            </div>
          </div>

          {/* Inline Action feedback */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="p-3 bg-green-50 border border-green-100 text-green-700 text-[10px] rounded-xl font-bold text-center relative"
              >
                <button onClick={() => setSuccessMessage(null)} className="absolute top-1 right-2 text-green-400 hover:text-green-600 text-xs">×</button>
                {successMessage}
              </motion.div>
            )}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="p-3 bg-red-50 border border-red-100 text-red-700 text-[10px] rounded-xl font-bold text-center relative"
              >
                <button onClick={() => setErrorMessage(null)} className="absolute top-1 right-2 text-red-400 hover:text-red-600 text-xs">×</button>
                {errorMessage}
              </motion.div>
            )}
          </AnimatePresence>
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
        CampusHub v1.0 · ĐHQGHN 2026
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
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">minh_chung_2026.pdf</p>
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
                      src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
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

        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] overflow-hidden p-6 flex flex-col shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-red-600">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-gray-900">{currentTexts.deleteModalTitle}</h3>
                  <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{currentTexts.deleteAccountSub}</p>
                </div>
              </div>

              <p className="text-xs text-gray-500 font-medium leading-relaxed text-left">
                {currentTexts.deleteModalSub}
              </p>

              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder={currentTexts.deletePlaceholder}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm text-center font-bold uppercase outline-none focus:bg-white focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-all placeholder:text-gray-300 placeholder:normal-case font-mono"
              />

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 text-gray-500 text-xs font-bold rounded-xl border border-gray-100 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 py-3 bg-red-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-600/20 hover:bg-red-700 transition-colors"
                >
                  {currentTexts.deleteConfirm}
                </button>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-[10px] rounded-xl font-bold text-center">
                  {errorMessage}
                </div>
              )}
            </motion.div>
          </div>
        )}

        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] overflow-hidden p-6 flex flex-col shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-app-secondary flex items-center justify-center text-app-primary">
                    <Lock className="w-4.5 h-4.5" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-gray-900">{currentTexts.passwordTitle}</h3>
                    <p className="text-[9px] text-gray-500 font-medium">{currentTexts.passwordSub}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Check if authenticated via Google provider */}
              {user?.providerData.some((provider) => provider.providerId === "google.com") ? (
                <div className="space-y-4 py-3 text-center">
                  <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto">
                    <Shield className="w-7 h-7" />
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-left">
                    <p className="text-xs text-gray-600 font-medium leading-relaxed">
                      {currentTexts.googleUserDisclaimer}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-[10px] text-blue-600 font-bold bg-blue-50/50 p-2 rounded-xl">
                      <Globe className="w-4 h-4 shrink-0" />
                      <span>Google SSO Authorized Account</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="w-full py-3 bg-app-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-app-primary/20 hover:scale-[1.02] transition-transform"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <form onSubmit={handleDirectPasswordUpdate} className="space-y-4 text-left">
                  {/* Current Password Field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{currentTexts.currentPassword}</label>
                    <div className="relative">
                      <input
                        type={showCurrentPwd ? "text" : "password"}
                        value={currentPwd}
                        onChange={(e) => setCurrentPwd(e.target.value)}
                        placeholder={currentTexts.currentPasswordPlaceholder}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-4 pr-10 py-3 text-xs font-semibold outline-none focus:bg-white focus:border-app-primary transition-all text-gray-700"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showCurrentPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* New Password Field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{currentTexts.newPassword}</label>
                    <div className="relative">
                      <input
                        type={showNewPwd ? "text" : "password"}
                        value={newPwd}
                        onChange={(e) => setNewPwd(e.target.value)}
                        placeholder={currentTexts.newPasswordPlaceholder}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-4 pr-10 py-3 text-xs font-semibold outline-none focus:bg-white focus:border-app-primary transition-all text-gray-700"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPwd(!showNewPwd)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showNewPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {newPwd && (
                      <div className="space-y-1 pt-1.5">
                        <div className="flex justify-between items-center text-[9px] font-bold">
                          <span className="text-gray-400">{currentTexts.passwordStrength}:</span>
                          <span className="text-gray-600 uppercase font-bold">{getPasswordStrength(newPwd).label}</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${getPasswordStrength(newPwd).color} ${getPasswordStrength(newPwd).width}`}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm New Password Field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{currentTexts.confirmNewPassword}</label>
                    <div className="relative">
                      <input
                        type={showConfirmPwd ? "text" : "password"}
                        value={confirmPwd}
                        onChange={(e) => setConfirmPwd(e.target.value)}
                        placeholder={currentTexts.confirmPasswordPlaceholder}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-4 pr-10 py-3 text-xs font-semibold outline-none focus:bg-white focus:border-app-primary transition-all text-gray-700"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Feedback Messages */}
                  {pwdSuccess && (
                    <div className="p-3 bg-green-50 border border-green-100 text-green-700 text-[10px] rounded-xl font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      <span>{pwdSuccess}</span>
                    </div>
                  )}

                  {pwdError && (
                    <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-[10px] rounded-xl font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span>{pwdError}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={pwdLoading}
                    className="w-full py-3 bg-app-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-app-primary/20 hover:scale-[1.01] transition-transform flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-50"
                  >
                    {pwdLoading ? (
                      <div className="w-4 h-4 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                    ) : (
                      currentTexts.updatePasswordBtn
                    )}
                  </button>

                  {/* Alternative Password Reset Link Options */}
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        handleResetPassword();
                        setIsPasswordModalOpen(false);
                      }}
                      className="text-[10px] text-gray-400 hover:text-app-primary underline font-semibold transition-colors"
                    >
                      {currentTexts.orSendResetEmail}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

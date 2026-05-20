import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { useI18n } from "../lib/i18n";
import { Mail, Lock, ArrowRight, Sparkles, Chrome } from "lucide-react";

export default function Auth() {
  const { t } = useI18n();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      const errCode = err?.code || "";
      const errMessage = err?.message || "";
      const isInvalidCred = errCode === 'auth/invalid-credential' || errMessage.includes('auth/invalid-credential');
      const isOpNotAllowed = errCode === 'auth/operation-not-allowed' || errMessage.includes('auth/operation-not-allowed');

      if (isOpNotAllowed) {
        setError("Vui lòng kích hoạt 'Email/Password' trong mục Authentication > Sign-in method tại Firebase Console.");
      } else if (isInvalidCred) {
        if (isLogin) {
          setError("Tài khoản hoặc mật khẩu không khớp. Nếu bạn chưa tạo tài khoản, hãy chọn 'Đăng ký ngay' bên dưới hoặc kiểm tra xem tính năng 'Email/Password' đã được kích hoạt trong Firebase Console.");
        } else {
          setError("Đăng ký lỗi: Credential không hợp lệ. Vui lòng kiểm tra lại địa chỉ email hoặc đảm bảo phương thức đăng nhập bằng Email/Password đã được kích hoạt trong Firebase Console.");
        }
      } else if (errCode === 'auth/weak-password') {
        setError("Mật khẩu quá yếu (tối thiểu 6 ký tự).");
      } else if (errCode === 'auth/email-already-in-use') {
        setError("Email này đã được sử dụng từ trước.");
      } else if (errCode === 'auth/invalid-email') {
        setError("Email không đúng định dạng.");
      } else {
        setError(errMessage || t('auth.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Google Login Error:", err);
      const errorCode = err?.code || "";
      const errorMessage = err?.message || "";
      if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/cancelled-popup-request') {
        setError("");
        return;
      }
      
      if (errorCode === 'auth/invalid-credential' || errorMessage.includes('auth/invalid-credential') || errorCode === 'auth/operation-not-allowed' || errorMessage.includes('auth/operation-not-allowed')) {
        setError("Lỗi xác thực Google SSO (invalid-credential). Vui lòng đảm bảo bạn đã ĐÃ kích hoạt Google Sign-In và cấu hình đầy đủ SHA-1 / cấu hình OAuth Client ID trùng khớp trong Firebase Console.");
      } else if (errorCode === 'auth/popup-blocked') {
        setError("Trình duyệt đã chặn cửa sổ Popup. Vui lòng cho phép nhảy tab/cửa sổ bật lên để đăng nhập.");
      } else {
        setError(errorMessage || t('auth.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1340] flex flex-col justify-center px-6 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#5B50D6] blur-[120px] opacity-20 rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#1DB882] blur-[120px] opacity-20 rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-sm mx-auto">
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-white/10 border border-white/20 rounded-[20px] flex items-center justify-center mx-auto mb-6 backdrop-blur-xl"
          >
            <Sparkles className="w-8 h-8 text-yellow-400" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white font-sans tracking-tight"
          >
            {isLogin ? t('auth.welcomeBack') : t('auth.joinUs')}
          </motion.h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[32px] shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold block ml-1">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input 
                  type="email"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder:text-white/20 outline-none focus:bg-white/10 focus:border-white/30 transition-all text-sm"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold block ml-1">{t('auth.password')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input 
                  type="password"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder:text-white/20 outline-none focus:bg-white/10 focus:border-white/30 transition-all text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-red-400 text-xs text-center font-medium"
              >
                {error}
              </motion.p>
            )}

            <button 
              disabled={loading}
              className="w-full bg-[#5B50D6] hover:bg-[#4a41b5] text-white font-bold py-4 rounded-2xl shadow-xl shadow-[#5B50D6]/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? t('auth.loading') : (isLogin ? t('auth.login') : t('auth.signup'))}
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1 h-[1px] bg-white/10" />
            <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Hoặc</span>
            <div className="flex-1 h-[1px] bg-white/10" />
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Chrome className="w-4 h-4" />
            Google Login
          </button>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-white/40 text-xs font-semibold hover:text-white transition-colors"
            >
              {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

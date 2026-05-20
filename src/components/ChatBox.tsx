import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, X, MessageSquare, Bot, User, Sparkles, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "model";
  parts: [{ text: string }];
}

export const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", parts: [{ text: input }] };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          history: messages,
        }),
      });

      const contentType = response.headers.get("content-type");
      let data: any;
      
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Non-JSON response received:", text);
        throw new Error("Server trả về phản hồi không hợp lệ. Có thể server đang gặp sự cố.");
      }

      if (!response.ok) {
        throw new Error(data.error || `Server responded with ${response.status}`);
      }
      
      if (data.text) {
        setMessages((prev) => [...prev, { role: "model", parts: [{ text: data.text }] }]);
      } else {
        throw new Error("Empty response from server");
      }
    } catch (error: any) {
      console.error("Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "model", parts: [{ text: `Lỗi: ${error.message}. Bạn vui lòng kiểm tra lại cấu hình API hoặc thử lại sau nhé! 🛠️` }] },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      drag
      dragMomentum={false}
      dragConstraints={{ left: -300, right: 0, top: -600, bottom: 0 }}
      className="fixed bottom-24 right-5 z-50 flex flex-col items-end touch-none"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[320px] sm:w-[380px] h-[500px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#E3E5F8] mb-4 cursor-default"
            onPointerDown={(e) => e.stopPropagation()} // Prevent dragging when interacting with chat
          >
            {/* Header - Now also functions as a drag handle */}
            <div className="bg-app-primary p-4 flex items-center justify-between cursor-move active:cursor-grabbing select-none">
              <div className="flex items-center gap-3 text-white pointer-events-none">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">CampusHub AI</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[10px] opacity-80 uppercase tracking-wider font-bold">Trực tuyến</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white pointer-events-auto"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-slate-50/50"
            >
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-16 h-16 bg-app-secondary rounded-3xl flex items-center justify-center text-app-primary">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">Chào bạn!</h4>
                    <p className="text-xs text-gray-500 mt-1">Mình là CampusHub Assistant, mình có thể giúp gì cho bạn hôm nay?</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2 w-full">
                    {[
                      "Tư vấn học bổng hot",
                      "Lịch sự kiện tuần này",
                      "Lời khuyên chọn CLB"
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setInput(suggestion);
                        }}
                        className="text-[11px] font-semibold text-app-primary bg-white border border-[#E3E5F8] px-4 py-2.5 rounded-2xl hover:bg-app-secondary hover:border-app-primary transition-all text-left"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: msg.role === "user" ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${
                      msg.role === "user" ? "bg-gray-100" : "bg-app-secondary"
                    }`}>
                      {msg.role === "user" ? <User className="w-4 h-4 text-gray-600" /> : <Bot className="w-4 h-4 text-app-primary" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.role === "user" 
                        ? "bg-app-primary text-white rounded-tr-none shadow-md" 
                        : "bg-white text-gray-800 rounded-tl-none border border-[#E3E5F8] shadow-sm"
                    }`}>
                      {msg.parts[0].text}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[85%]">
                    <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center bg-app-secondary">
                      <Bot className="w-4 h-4 text-app-primary" />
                    </div>
                    <div className="bg-white border border-[#E3E5F8] p-3 rounded-2xl rounded-tl-none shadow-sm">
                      <Loader2 className="w-4 h-4 text-app-primary animate-spin" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-[#E3E5F8]">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2 bg-gray-50 p-1.5 pl-4 rounded-2xl border border-gray-100 focus-within:border-app-primary focus-within:ring-2 focus-within:ring-app-primary/10 transition-all"
              >
                <input
                  type="text"
                  placeholder="Nhập tin nhắn..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 bg-transparent text-xs py-2 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-app-primary text-white disabled:opacity-50 disabled:grayscale transition-all hover:shadow-lg active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center text-white transition-all duration-300 ${
          isOpen ? "bg-red-500 rotate-90" : "bg-app-primary"
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold">
            1
          </div>
        )}
      </motion.button>
    </motion.div>
  );
};

import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

if (!process.env.VERCEL) {
  dotenv.config();
}

// Initialize Gemini lazily to ensure environment variables are loaded
let genAI: any = null;

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  if (!genAI) {
    genAI = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return genAI;
}

// Helper for calling Gemini with retry
async function generateWithRetry(params: any, retries = 2) {
  const ai = getGenAI();
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await ai.models.generateContent(params);
      return response;
    } catch (error: any) {
      console.error(`Gemini Error (Attempt ${i + 1}):`, error.message);
      
      const isRetryable = error?.status === 503 || 
                         error?.message?.includes("503") || 
                         error?.message?.includes("high demand") ||
                         error?.status === 429;
      
      if (isRetryable && i < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
  return null;
}

const app = express();
app.use(express.json());

// API Route for AI Recommendations
app.post("/api/recommendations", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Recommendations API Error: GEMINI_API_KEY is missing");
      return res.status(500).json({ error: "Thiếu GEMINI_API_KEY. Vui lòng cấu hình trong Secrets hoặc Environment Variables." });
    }

    const { profile, interests } = req.body;

    const prompt = `Bạn là chuyên gia tư vấn giáo dục toàn cầu của CampusHub. 
    Dựa trên hồ sơ sinh viên sau:
    - Tên: ${profile.name}
    - Chuyên ngành: ${profile.major}
    - Sở thích: ${interests && interests.length > 0 ? interests.join(", ") : "Chưa cập nhật"}

    Nhiệm vụ: Hãy đề xuất từ 3 đến 5 cơ hội (sự kiện, cuộc thi, hoặc học bổng) đa dạng và hấp dẫn nhất, phù hợp với chuyên ngành và sở thích của sinh viên.
    
    Yêu cầu nội dung:
    1. Đa dạng hóa nguồn lực: Không chỉ giới hạn ở Việt Nam. Ngoài các cơ hội tại các trường đại học hàng đầu Việt Nam (VNU, HUST, UEH...), hãy chủ động đề xuất các cơ hội quốc tế từ các tổ chức uy tín (UNESCO, Google Student Club, ASEAN Foundation...).
    2. Tính thuyết phục: Giải thích rõ TẠI SAO cơ hội này phù hợp với ${profile.name} dựa trên mục tiêu sự nghiệp và chuyên ngành của họ.
    3. Tính thực tế: Ưu tiên các cơ hội có thật, đang diễn ra hoặc thường niên có uy tín cao.

    QUY TẮC PHẢN HỒI:
    - CHỈ trả về mảng JSON duy nhất. Không có văn bản giải thích nào khác.
    - Định dạng JSON mảng các đối tượng: [{ "type": "event" | "scholarship", "title": string, "reason": string }]`;

    const response = await generateWithRetry({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    
    if (!response) return res.json([]);
    
    const text = response.text || "[]";
    
    try {
      let jsonStr = text.trim();
      const arrayStart = jsonStr.indexOf('[');
      const arrayEnd = jsonStr.lastIndexOf(']');
      
      if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
        jsonStr = jsonStr.substring(arrayStart, arrayEnd + 1);
      } else {
        jsonStr = jsonStr.replace(/```json|```/g, "").trim();
      }

      const parsed = JSON.parse(jsonStr);
      res.json(Array.isArray(parsed) ? parsed : []);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Original text:", text);
      res.json([]);
    }
  } catch (error: any) {
    console.error("Recommendations API Error:", error.message);
    res.json([]);
  }
});

// API Route for Smart Chat
app.post("/api/chat", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Chat API Error: GEMINI_API_KEY is missing");
      return res.status(500).json({ error: "Chưa cấu hình Gemini API Key. Vui lòng kiểm tra lại trong phần Environment Variables!" });
    }

    const { message, history } = req.body;

    const contents = history ? [...history] : [];
    contents.push({ role: "user", parts: [{ text: message }] });

    const response = await generateWithRetry({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction: "Bạn là CampusHub Assistant - trợ lý sinh viên ảo thông minh. Hãy trả lời bằng tiếng Việt, súc tích, thân thiện và luôn sẵn lòng hỗ trợ về học tập, ngoại khóa, học bổng. Sử dụng emoji phù hợp.",
      }
    });

    if (!response) {
      throw new Error("Không thể nhận phản hồi từ Gemini AI.");
    }

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Chat API Detailed Error:", error);
    res.status(500).json({ 
      error: "Rất tiếc, mình đang gặp chút trục trặc trong việc kết nối. Bạn vui lòng thử lại sau giây lát nhé! 🛠️",
      details: error.message,
      stack: process.env.NODE_ENV !== "production" ? error.stack : undefined
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", environment: process.env.VERCEL ? "vercel" : "classic", hasApiKey: !!process.env.GEMINI_API_KEY });
});

// Vite Middleware & Static Files
const setupServer = async () => {
  // Only setup listeners and Vite if we are NOT on Vercel
  if (process.env.VERCEL) return;

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  
  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
};

if (!process.env.VERCEL) {
  setupServer().catch(console.error);
}

export default app;

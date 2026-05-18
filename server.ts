import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini API Setup
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Helper for calling Gemini with retry
  async function generateWithRetry(params: any, retries = 2) {
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is missing in environment variables.");
      return null;
    }
    
    for (let i = 0; i <= retries; i++) {
      try {
        const response = await ai.models.generateContent(params);
        return response;
      } catch (error: any) {
        const isRetryable = error?.status === 503 || 
                           error?.message?.includes("503") || 
                           error?.message?.includes("high demand") ||
                           error?.status === 429;
        if (isRetryable && i < retries) {
          console.warn(`Gemini error ${error?.status || 'unknown'}, retrying (${i + 1}/${retries})...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          continue;
        }
        throw error;
      }
    }
    return null;
  }

  // API Route for AI Recommendations
  app.post("/api/recommendations", async (req, res) => {
    try {
      const { profile, interests } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        console.error("GEMINI_API_KEY is missing");
        return res.json([]);
      }

      const prompt = `Bạn là chuyên gia tư vấn giáo dục toàn cầu của CampusHub. 
      Dựa trên hồ sơ sinh viên sau:
      - Tên: ${profile.name}
      - Chuyên ngành: ${profile.major}
      - Sở thích: ${interests && interests.length > 0 ? interests.join(", ") : "Chưa cập nhật"}

      Nhiệm vụ: Hãy đề xuất từ 3 đến 5 cơ hội (sự kiện, cuộc thi, hoặc học bổng) đa dạng và hấp dẫn nhất, phù hợp với chuyên ngành và sở thích của sinh viên.
      
      Yêu cầu nội dung:
      1. Đa dạng hóa nguồn lực: Không chỉ giới hạn ở Việt Nam. Ngoài các cơ hội tại các trường đại học hàng đầu Việt Nam (VNU, HUST, UEH...), hãy chủ động đề xuất các cơ hội quốc tế...
      2. Tính thuyết phục: Giải thích rõ TẠI SAO cơ hội này phù hợp với ${profile.name}.
      3. Tính thực tế: Ưu tiên các cơ hội có thật và có uy tín.

      QUY TẮC PHẢN HỒI:
      - CHỈ trả về mảng JSON duy nhất. Không có văn bản giải thích.
      - Định dạng JSON: [{ "type": "event" | "scholarship", "title": string, "reason": string }]`;

      const response = await generateWithRetry({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      
      if (!response) {
        return res.json([]);
      }
      
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
      const { message, history } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: "Chưa cấu hình Gemini API Key. Vui lòng kiểm tra lại!" });
      }

      // Using the Chat interface might not be easily retryable with generateWithRetry
      // so we use the history format with generateContent to leverage retry logic
      const contents = history ? [...history] : [];
      contents.push({ role: "user", parts: [{ text: message }] });

      const response = await generateWithRetry({
        model: "gemini-3-flash-preview",
        contents,
        config: {
          systemInstruction: "Bạn là CampusHub Assistant - một trợ lý sinh viên thân thiện, thông minh và nhiệt huyết dành cho sinh viên Việt Nam. Trả lời bằng tiếng Việt, súc tích và sử dụng emoji.",
        }
      });

      if (!response) {
        throw new Error("Không thể kết nối với Gemini AI sau nhiều lần thử.");
      }

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Chat API Error:", error.message);
      res.status(500).json({ error: "Rất tiếc, mình đang gặp chút trục trặc trong việc kết nối. Bạn vui lòng thử lại sau giây lát nhé! 🛠️" });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Only serve static files if not on Vercel (where Vercel handles them)
    if (!process.env.VERCEL) {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  // Only listen if not on Vercel
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  }
  
  return app;
}

// Ensure startServer is called only once and reused
const appPromise = startServer();

// For local development and Cloud Run
appPromise.catch(err => {
  console.error("Failed to start server:", err);
});

// For Vercel Serverless Functions
export default async (req: any, res: any) => {
  const app = await appPromise;
  app(req, res);
};
